import { el, icons } from "../ui/components.js";
import { navigate } from "../router.js";
import { OBJECTS } from "../data/objects.js";
import { AudioEngine } from "../audio/audio-engine.js";
import { TonePlayer } from "../audio/tone-player.js";
import { PitchDetector } from "../audio/pitch-detector.js";
import { FrequencyMeter } from "../ui/frequency-meter.js";
import { shuffle, formatTime } from "../utils/helpers.js";
import { celebrate, celebrateHarmonic } from "../ui/celebration.js";

const TOLERANCE = 0.05;
const MATCH_DURATION = 0.75;
const GRACE_MS = 200;

function getMatchType(ratio) {
  if (Math.abs(ratio - 1)    < TOLERANCE) return "exact";
  if (Math.abs(ratio - 0.5)  < TOLERANCE) return "harmonic";
  if (Math.abs(ratio - 0.25) < TOLERANCE) return "harmonic";
  if (Math.abs(ratio - 2)    < TOLERANCE) return "harmonic";
  return null;
}

export function render(container) {
  let gridSize = null;
  let raceObjects = [];
  let matched = new Set();
  let activeIndex = -1;
  let timerStart = null;
  let timerInterval = null;
  let tonePlayer = null;
  let pitchDetector = null;
  let meter = null;
  let matchStart = null;
  let lostAt = null;
  let isListening = false;
  let raceFinished = false;

  const screen = el("div", { className: "screen" });

  // Header
  screen.appendChild(
    el(
      "div",
      { className: "flex items-center gap-8 mb-16" },
      el("button", {
        className: "btn btn-icon btn-secondary",
        onclick: () => navigate(""),
        innerHTML: icons.back,
      }),
      el("div", {}, el("h1", {}, "Race"))
    )
  );

  // Size selection
  const sizeSelect = el("div", { className: "text-center" });
  sizeSelect.appendChild(el("p", { className: "mb-16" }, "Choose your grid size:"));

  const sizeButtons = el("div", { className: "flex gap-8 justify-between" });

  sizeButtons.appendChild(
    el("button", {
      className: "btn btn-primary",
      style: { flex: "1" },
      onclick: () => startRace("2x2"),
    }, "2 x 2")
  );

  sizeButtons.appendChild(
    el("button", {
      className: "btn btn-primary",
      style: { flex: "1" },
      onclick: () => startRace("3x3"),
    }, "3 x 3")
  );

  sizeSelect.appendChild(sizeButtons);


  screen.appendChild(sizeSelect);

  // Game area (hidden until race starts)
  const gameArea = el("div", { style: { display: "none" } });
  screen.appendChild(gameArea);

  container.appendChild(screen);

  function startRace(size) {
    gridSize = size;
    const count = size === "2x2" ? 4 : 9;
    raceObjects = shuffle(OBJECTS).slice(0, count);
    matched = new Set();
    activeIndex = -1;
    raceFinished = false;

    sizeSelect.style.display = "none";
    gameArea.style.display = "block";
    gameArea.innerHTML = "";

    // Timer
    const timerEl = el("div", { className: "timer" }, "0:00.0");
    gameArea.appendChild(timerEl);

    // Grid
    const grid = el("div", {
      className: `bingo-grid ${size === "2x2" ? "grid-2x2" : "grid-3x3"}`,
    });

    raceObjects.forEach((obj, i) => {
      const cell = el(
        "div",
        {
          className: "bingo-cell",
          dataset: { index: String(i) },
          onclick: () => selectCell(i),
        },
        el("div", {
          className: "object-swatch",
          style: {
            backgroundColor: obj.material.color,
            width: "24px",
            height: "24px",
            borderRadius: "4px",
          },
        }),
        el("div", { className: "bingo-cell-name" }, obj.name),
        el("div", { className: "bingo-cell-freq" }, `${obj.frequency.toFixed(0)} Hz`)
      );
      grid.appendChild(cell);
    });

    gameArea.appendChild(grid);

    // Meter area
    const meterArea = el("div");
    gameArea.appendChild(meterArea);

    // Controls
    const controlArea = el("div", { className: "flex gap-8 mt-16 justify-between" });

    const listenBtn = el("button", {
      className: "btn btn-secondary",
      style: { flex: "1" },
      onclick: async () => {
        if (activeIndex < 0) return;
        const engine = AudioEngine.getInstance();
        await engine.init();
        if (!tonePlayer) tonePlayer = new TonePlayer(engine.getAudioContext());
        listenBtn.disabled = true;
        matchBtnEl.disabled = true;
        tonePlayer.play(raceObjects[activeIndex].frequency, 1.5);
        setTimeout(() => {
          listenBtn.disabled = false;
          if (!isListening) matchBtnEl.disabled = false;
        }, 1500);
      },
    }, "Listen");
    controlArea.appendChild(listenBtn);

    const matchBtnEl = el("button", {
      className: "btn btn-primary",
      style: { flex: "1" },
      onclick: () => toggleListening(meterArea, matchBtnEl, grid, timerEl),
    }, "Match");
    controlArea.appendChild(matchBtnEl);

    gameArea.appendChild(controlArea);

    // Start timer
    timerStart = performance.now();
    timerInterval = setInterval(() => {
      if (raceFinished) return;
      const elapsed = (performance.now() - timerStart) / 1000;
      timerEl.textContent = formatTime(elapsed, true);
    }, 100);

    // Auto-select first cell
    selectCell(0);

    function selectCell(index) {
      if (matched.has(index) || raceFinished) return;
      activeIndex = index;

      // Update cell styles
      grid.querySelectorAll(".bingo-cell").forEach((cell, i) => {
        cell.classList.remove("active");
        if (i === index && !matched.has(i)) {
          cell.classList.add("active");
        }
      });

      // Update meter target if listening
      if (meter) {
        meter.setTarget(raceObjects[index].frequency);
        meter.setMatched(false);
        meter.setMatchProgress(0);
        matchStart = null;
      }
    }

    async function toggleListening(meterArea, matchBtnEl, grid, timerEl) {
      if (raceFinished) return;

      if (isListening) {
        stopListeningRace(matchBtnEl, listenBtn);
        return;
      }

      if (activeIndex < 0) return;

      const engine = AudioEngine.getInstance();
      await engine.init();
      await engine.startMicrophone();

      if (!tonePlayer) tonePlayer = new TonePlayer(engine.getAudioContext());

      meter = new FrequencyMeter(meterArea);
      meter.setTarget(raceObjects[activeIndex].frequency);
      meter.startRendering();

      pitchDetector = new PitchDetector(
        engine.getAnalyser(),
        engine.getSampleRate()
      );

      matchStart = null;
      isListening = true;
      matchBtnEl.textContent = "Stop";
      matchBtnEl.className = "btn btn-secondary";
      listenBtn.disabled = true;

      pitchDetector.start((frequency, clarity) => {
        if (activeIndex < 0 || raceFinished) return;
        meter.update(frequency, clarity);

        const target = raceObjects[activeIndex].frequency;
        const ratio = frequency > 0 ? frequency / target : 0;
        const type = (frequency > 0 && clarity > 0.8) ? getMatchType(ratio) : null;

        if (type) {
          lostAt = null;
          if (!matchStart) {
            matchStart = performance.now();
            meter.setMatchType(type);
          }
          const elapsed = (performance.now() - matchStart) / 1000;
          meter.setMatchProgress(elapsed / MATCH_DURATION);

          if (elapsed >= MATCH_DURATION) {
            const resolvedType = meter.matchType;
            matched.add(activeIndex);
            const cell = grid.querySelector(`[data-index="${activeIndex}"]`);
            if (cell) {
              cell.classList.remove("active");
              cell.classList.add(resolvedType === "harmonic" ? "harmonic-matched-cell" : "matched");
            }

            resolvedType === "harmonic" ? celebrateHarmonic() : celebrate();
            meter.setMatched(true);
            meter.startDrain(1500);
            matchStart = null; lostAt = null;

            const count = gridSize === "2x2" ? 4 : 9;
            if (matched.size >= count) {
              onRaceComplete(timerEl, matchBtnEl, listenBtn, meterArea);
            } else {
              stopListeningRace(matchBtnEl, listenBtn);
              setTimeout(() => {
                meter.setMatched(false);
                meter.setMatchProgress(0);
                meter.setMatchType("exact");
                for (let i = 0; i < raceObjects.length; i++) {
                  if (!matched.has(i)) { selectCell(i); break; }
                }
              }, 500);
            }
          }
        } else {
          if (matchStart !== null) {
            if (lostAt === null) lostAt = performance.now();
            if (performance.now() - lostAt >= GRACE_MS) {
              matchStart = null; lostAt = null;
              meter.setMatchProgress(0);
              meter.setMatchType("exact");
            }
          } else {
            meter.setMatchProgress(0);
          }
        }
      });
    }
  }

  function stopListeningRace(matchBtnEl, listenBtn) {
    if (pitchDetector) {
      pitchDetector.stop();
      pitchDetector = null;
    }
    if (meter) meter.stopRendering();
    AudioEngine.getInstance().stopMicrophone();
    isListening = false;
    if (matchBtnEl) {
      matchBtnEl.textContent = "Match";
      matchBtnEl.className = "btn btn-primary";
      matchBtnEl.disabled = false;
    }
    if (listenBtn) listenBtn.disabled = false;
    matchStart = null;
  }

  function onRaceComplete(timerEl, matchBtnEl, listenBtn, meterArea) {
    raceFinished = true;
    const totalTime = (performance.now() - timerStart) / 1000;
    clearInterval(timerInterval);
    timerEl.textContent = formatTime(totalTime, true);

    stopListeningRace(matchBtnEl, listenBtn);

    meterArea.innerHTML = "";
    meterArea.appendChild(
      el(
        "div",
        { className: "card text-center mt-16" },
        el("h2", {}, "Race Complete!"),
        el("div", { className: "timer mt-8" }, formatTime(totalTime, true)),
        el(
          "div",
          { className: "flex gap-8 mt-16 justify-between" },
          el("button", {
            className: "btn btn-secondary",
            style: { flex: "1" },
            onclick: () => {
              const text = `Sound and Valid - Race (${gridSize})\nTime: ${formatTime(totalTime, true)}\n${isNewBest ? "New Personal Best!" : ""}\nObjects: ${raceObjects.map((o) => o.name).join(", ")}`;
              navigator.clipboard.writeText(text).catch(() => {});
            },
          }, "Copy Result"),
          el("button", {
            className: "btn btn-primary",
            style: { flex: "1" },
            onclick: () => navigate("race"),
          }, "Play Again")
        )
      )
    );
  }

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    stopListeningRace(null);
    if (tonePlayer) {
      tonePlayer.stop();
      tonePlayer = null;
    }
    if (meter) {
      meter.destroy();
      meter = null;
    }
  };
}

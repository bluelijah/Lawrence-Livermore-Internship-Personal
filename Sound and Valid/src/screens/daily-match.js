import { el, createPropsTable, icons } from "../ui/components.js";
import { navigate } from "../router.js";
import { OBJECTS } from "../data/objects.js";
import { calcBarFrequencyDetailed } from "../data/formulas.js";
import { AudioEngine } from "../audio/audio-engine.js";
import { TonePlayer } from "../audio/tone-player.js";
import { PitchDetector } from "../audio/pitch-detector.js";
import { FrequencyMeter } from "../ui/frequency-meter.js";
import { getDailyObjectIndex, getTodayDateStr } from "../utils/daily-seed.js";
import { getDailyState, saveDailyState, getDailyStreak } from "../utils/storage.js";
import { celebrate, celebrateHarmonic } from "../ui/celebration.js";
import { recordListen, recordMatch } from "../utils/db.js";

const TOLERANCE = 0.05;
const MATCH_DURATION = 0.75;
const GRACE_MS = 200;
const MAX_ATTEMPTS = 5;

function getMatchType(ratio) {
  if (Math.abs(ratio - 1)    < TOLERANCE) return "exact";
  if (Math.abs(ratio - 0.5)  < TOLERANCE) return "harmonic";
  if (Math.abs(ratio - 0.25) < TOLERANCE) return "harmonic";
  if (Math.abs(ratio - 2)    < TOLERANCE) return "harmonic";
  return null;
}

export function render(container) {
  const dateStr = getTodayDateStr();
  const index = getDailyObjectIndex(OBJECTS.length);
  const obj = OBJECTS[index];
  const detailed = calcBarFrequencyDetailed(
    obj.material,
    obj.dimensions,
    obj.boundary
  );

  let state = getDailyState(dateStr) || {
    objectId: obj.id,
    attempts: 0,
    matched: false,
    bestAccuracy: 0,
  };

  let tonePlayer = null;
  let pitchDetector = null;
  let meter = null;
  let matchStart = null;
  let lostAt = null;
  let isListening = false;

  const screen = el("div", { className: "screen" });

  // Header with back button
  const header = el(
    "div",
    { className: "flex items-center gap-8 mb-16" },
    el(
      "button",
      {
        className: "btn btn-icon btn-secondary",
        onclick: () => navigate(""),
        innerHTML: icons.back,
      }
    ),
    el(
      "div",
      {},
      el("h1", {}, "Daily Match"),
      el("p", { className: "text-xs" }, dateStr)
    )
  );
  screen.appendChild(header);

  // Already completed today
  if (state.matched) {
    const streak = getDailyStreak();
    screen.appendChild(
      el(
        "div",
        { className: "card text-center" },
        el("h2", {}, "Already matched today!"),
        el("p", { className: "mt-8" }, `You matched ${obj.name} in ${state.attempts} attempt${state.attempts !== 1 ? "s" : ""}.`),
        streak > 0
          ? el("div", { className: "mt-8" }, el("span", { className: "badge badge-success" }, `${streak} day streak`))
          : null,
        el("p", { className: "mt-16 text-sm" }, "Come back tomorrow for a new challenge!")
      )
    );
    container.appendChild(screen);
    return;
  }

  // Object info card
  const infoCard = el(
    "div",
    { className: "card" },
    el(
      "div",
      { className: "flex items-center gap-12 mb-16" },
      el("div", {
        className: "object-swatch",
        style: { backgroundColor: obj.material.color, width: "48px", height: "48px" },
      }),
      el(
        "div",
        {},
        el("h2", {}, obj.name),
        el("p", { className: "text-sm" }, obj.description)
      )
    ),
    createPropsTable(obj)
  );
  screen.appendChild(infoCard);

  // Target frequency display
  const targetDisplay = el(
    "div",
    { className: "text-center mt-16" },
    el("p", { className: "text-secondary text-sm" }, "Target Frequency"),
    el("div", {
      className: "font-mono",
      style: { fontSize: "2rem", fontWeight: "700", color: "var(--color-primary)" },
      textContent: `${obj.frequency.toFixed(1)} Hz`,
    })
  );
  screen.appendChild(targetDisplay);

  // Attempts counter
  const attemptsEl = el(
    "p",
    { className: "text-center text-sm mt-8" },
    `Attempts: ${state.attempts} / ${MAX_ATTEMPTS}`
  );
  screen.appendChild(attemptsEl);

  // Controls
  const controls = el("div", { className: "flex gap-8 mt-16 justify-between" });

  const listenBtn = el(
    "button",
    {
      className: "btn btn-secondary",
      style: { flex: "1" },
      onclick: async () => {
        if (isListening) return;
        const engine = AudioEngine.getInstance();
        await engine.init();
        if (!tonePlayer) {
          tonePlayer = new TonePlayer(engine.getAudioContext());
        }
        recordListen(obj.id);
        listenBtn.disabled = true;
        matchBtn.disabled = true;
        tonePlayer.play(obj.frequency, 2);
        setTimeout(() => {
          listenBtn.disabled = false;
          matchBtn.disabled = false;
        }, 2000);
      },
    },
    "Listen"
  );
  controls.appendChild(listenBtn);

  const matchBtn = el(
    "button",
    {
      className: "btn btn-primary",
      style: { flex: "1" },
      onclick: () => toggleListening(),
    },
    "Match"
  );
  controls.appendChild(matchBtn);
  screen.appendChild(controls);

  // Meter container
  const meterContainer = el("div", { id: "meter-area", className: "mt-16" });
  screen.appendChild(meterContainer);

  container.appendChild(screen);

  // ── Matching Logic ──

  async function toggleListening() {
    if (isListening) {
      stopListening();
      return;
    }

    if (state.attempts >= MAX_ATTEMPTS) {
      matchBtn.textContent = "No attempts left";
      matchBtn.disabled = true;
      return;
    }

    const engine = AudioEngine.getInstance();
    await engine.init();
    await engine.startMicrophone();

    if (!tonePlayer) {
      tonePlayer = new TonePlayer(engine.getAudioContext());
    }

    meter = new FrequencyMeter(meterContainer);
    meter.setTarget(obj.frequency);
    meter.startRendering();

    pitchDetector = new PitchDetector(
      engine.getAnalyser(),
      engine.getSampleRate()
    );

    matchStart = null;
    isListening = true;
    matchBtn.textContent = "Stop";
    matchBtn.className = "btn btn-secondary";
    listenBtn.disabled = true;

    state.attempts++;
    attemptsEl.textContent = `Attempts: ${state.attempts} / ${MAX_ATTEMPTS}`;
    try { saveDailyState(dateStr, state); } catch (e) { console.error("saveDailyState failed:", e); }

    pitchDetector.start((frequency, clarity) => {
      meter.update(frequency, clarity);

      const ratio = frequency > 0 ? frequency / obj.frequency : 0;

      if (frequency > 0 && clarity > 0.8) {
        const accuracy = 1 - Math.abs(ratio - 1);
        if (accuracy > state.bestAccuracy) state.bestAccuracy = accuracy;
      }

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
          onMatch(meter.matchType);
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

  function stopListening() {
    if (pitchDetector) {
      pitchDetector.stop();
      pitchDetector = null;
    }
    if (meter) {
      meter.stopRendering();
    }
    AudioEngine.getInstance().stopMicrophone();
    isListening = false;
    matchBtn.textContent = "Match";
    matchBtn.className = "btn btn-primary";
    listenBtn.disabled = false;
    matchStart = null;
  }

  function onMatch(matchType) {
    state.matched = true;
    state.matchType = matchType;
    saveDailyState(dateStr, state);

    if (pitchDetector) { pitchDetector.stop(); pitchDetector = null; }
    AudioEngine.getInstance().stopMicrophone();
    matchType === "harmonic" ? celebrateHarmonic() : celebrate();
    recordMatch(obj.id, matchType);
    if (meter) {
      meter.setMatched(true);
      meter.setMatchProgress(1);
      meter.startDrain(1500);
    }

    isListening = false;
    matchBtn.textContent = "Matched!";
    matchBtn.className = "btn btn-success";
    matchBtn.disabled = true;

    // Show result after a brief pause
    setTimeout(() => {
      AudioEngine.getInstance().stopMicrophone();
      const streak = getDailyStreak();
      meterContainer.innerHTML = "";
      meterContainer.appendChild(
        el(
          "div",
          { className: "card text-center" },
          el("h2", {}, "Frequency matched!"),
          el("p", { className: "mt-8" }, `Matched in ${state.attempts} attempt${state.attempts !== 1 ? "s" : ""}`),
          streak > 0
            ? el("div", { className: "mt-8" }, el("span", { className: "badge badge-success" }, `${streak} day streak`))
            : null,
          el("p", { className: "mt-16 text-sm" }, "Come back tomorrow for a new challenge!")
        )
      );
    }, 2000);
  }

  // Cleanup function
  return () => {
    stopListening();
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

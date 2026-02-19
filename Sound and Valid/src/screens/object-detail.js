import { el, createPropsTable, icons } from "../ui/components.js";
import { navigate } from "../router.js";
import { getObjectById } from "../data/objects.js";
import { MATERIALS } from "../data/materials.js";
import { calcBarFrequency, calcBarFrequencyDetailed } from "../data/formulas.js";
import { AudioEngine } from "../audio/audio-engine.js";
import { TonePlayer } from "../audio/tone-player.js";
import { PitchDetector } from "../audio/pitch-detector.js";
import { FrequencyMeter } from "../ui/frequency-meter.js";
import { formatFreq, formatDimension } from "../utils/helpers.js";

const TOLERANCE = 0.05;
const MATCH_DURATION = 1.5;

/** Returns display unit info for a dimension value in meters. */
function dimUnit(meters) {
  if (meters >= 1)    return { unit: "m",  factor: 1,    dec: 3 };
  if (meters >= 0.01) return { unit: "cm", factor: 100,  dec: 1 };
  return                     { unit: "mm", factor: 1000, dec: 1 };
}

export function render(container, objectId) {
  const obj = getObjectById(objectId);
  if (!obj) {
    container.appendChild(
      el("div", { className: "screen" }, el("p", {}, "Object not found."))
    );
    return;
  }

  const detailed = calcBarFrequencyDetailed(
    obj.material,
    obj.dimensions,
    obj.boundary
  );

  let tonePlayer = null;
  let pitchDetector = null;
  let meter = null;
  let matchStart = null;
  let isListening = false;

  const screen = el("div", { className: "screen" });

  // Header
  screen.appendChild(
    el(
      "div",
      { className: "flex items-center gap-8 mb-16" },
      el("button", {
        className: "btn btn-icon btn-secondary",
        onclick: () => navigate("catalog"),
        innerHTML: icons.back,
      }),
      el("h1", {}, obj.name)
    )
  );

  // Description
  screen.appendChild(
    el("p", { className: "mb-16" }, obj.description)
  );

  // Properties table
  screen.appendChild(el("h3", { className: "mb-8" }, "Material Properties"));
  screen.appendChild(createPropsTable(obj));

  // Formula breakdown
  screen.appendChild(el("h3", { className: "mt-24 mb-8" }, "How is the frequency calculated?"));

  const formulaBlock = el("div", { className: "formula-block" });
  formulaBlock.appendChild(
    el("div", { style: { marginBottom: "12px", fontStyle: "italic" } },
      "f = (\u03B2L)\u00B2 \u00D7 h / (4\u03C0\u221A3 \u00D7 L\u00B2) \u00D7 \u221A(E / \u03C1)"
    )
  );

  for (const step of detailed.steps) {
    const stepEl = el(
      "div",
      { className: "formula-step" },
      el("span", { className: "formula-label" }, step.label),
      el(
        "span",
        { className: step === detailed.steps[detailed.steps.length - 1] ? "formula-result" : "formula-value" },
        `${step.value.toFixed(step.unit === "Hz" ? 1 : 2)} ${step.unit}`
      )
    );
    formulaBlock.appendChild(stepEl);
  }
  screen.appendChild(formulaBlock);

  // Target frequency display
  screen.appendChild(
    el(
      "div",
      { className: "text-center mt-16" },
      el("p", { className: "text-secondary text-sm" }, "Natural Frequency"),
      el("div", {
        className: "font-mono",
        style: { fontSize: "2rem", fontWeight: "700", color: "var(--color-primary)" },
        textContent: formatFreq(obj.frequency),
      })
    )
  );

  // Controls
  const controls = el("div", { className: "flex gap-8 mt-16 justify-between" });

  const listenBtn = el("button", {
    className: "btn btn-secondary",
    style: { flex: "1" },
    onclick: async () => {
      if (isListening) return;
      const engine = AudioEngine.getInstance();
      await engine.init();
      if (!tonePlayer) {
        tonePlayer = new TonePlayer(engine.getAudioContext());
      }
      const mat = MATERIALS[currentMaterialKey];
      const freq = calcBarFrequency(
        mat,
        { length: currentLength, width: obj.dimensions.width, thickness: currentThickness },
        obj.boundary
      );
      listenBtn.disabled = true;
      matchBtn.disabled = true;
      tonePlayer.play(freq, 2);
      setTimeout(() => {
        listenBtn.disabled = false;
        matchBtn.disabled = false;
      }, 2000);
    },
  }, "Listen");
  controls.appendChild(listenBtn);

  const matchBtn = el("button", {
    className: "btn btn-primary",
    style: { flex: "1" },
    onclick: () => toggleListening(),
  }, "Practice Match");
  controls.appendChild(matchBtn);
  screen.appendChild(controls);

  // Meter area
  const meterContainer = el("div", { className: "mt-16" });
  screen.appendChild(meterContainer);

  // "What if?" sliders
  screen.appendChild(el("h3", { className: "mt-24 mb-8" }, "What if you changed it?"));

  const whatIfResult = el("div", {
    className: "font-mono text-center",
    style: { fontSize: "1.2rem", fontWeight: "600" },
  });

  let currentLength = obj.dimensions.length;
  let currentThickness = obj.dimensions.thickness;
  let currentMaterialKey = obj.materialKey;

  function updateWhatIf() {
    const mat = MATERIALS[currentMaterialKey];
    const freq = calcBarFrequency(
      mat,
      { length: currentLength, width: obj.dimensions.width, thickness: currentThickness },
      obj.boundary
    );
    whatIfResult.textContent = `${formatFreq(freq)}`;
    whatIfResult.style.color =
      Math.abs(freq - obj.frequency) < 1 ? "var(--color-primary)" : "var(--color-warning)";
  }

  const lenU = dimUnit(currentLength);
  const thickU = dimUnit(currentThickness);

  // Length presets (if object defines them)
  const lengthSlider = el("div", { className: "slider-group" });

  if (obj.presets && obj.presets.length > 0) {
    const presetRow = el("div", { className: "preset-row" });
    const presetBtns = [];

    for (const preset of obj.presets) {
      const btn = el("button", {
        className: `preset-btn ${preset.length === currentLength ? "active" : ""}`,
        onclick: () => {
          currentLength = preset.length;
          lengthInput.value = String(currentLength);
          lenNumInput.value = (currentLength * lenU.factor).toFixed(lenU.dec);
          presetBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          updateWhatIf();
        },
      }, `${preset.label} (${formatDimension(preset.length)})`);
      presetBtns.push(btn);
      presetRow.appendChild(btn);
    }

    lengthSlider.appendChild(presetRow);
  }

  // Length slider with editable value input
  const lenNumInput = el("input", {
    type: "number",
    className: "slider-number-input",
    value: (currentLength * lenU.factor).toFixed(lenU.dec),
  });
  const lengthLabel = el(
    "div",
    { className: "slider-label" },
    el("span", {}, "Length"),
    el("div", { className: "slider-value-wrap" },
      lenNumInput,
      el("span", { className: "slider-unit" }, lenU.unit),
    ),
  );

  // Compute slider range; use presets to cover full range if available
  const presetLengths = (obj.presets || []).map((p) => p.length);
  const allLengths = [obj.dimensions.length, ...presetLengths];
  const minLength = Math.min(...allLengths) * 0.5;
  const maxLength = Math.max(...allLengths) * 1.5;

  const lengthInput = el("input", {
    type: "range",
    min: String(minLength),
    max: String(maxLength),
    step: "0.001",
    value: String(currentLength),
    oninput: (e) => {
      currentLength = parseFloat(e.target.value);
      lenNumInput.value = (currentLength * lenU.factor).toFixed(lenU.dec);
      if (obj.presets) {
        lengthSlider.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
      }
      updateWhatIf();
    },
  });

  lenNumInput.addEventListener("change", () => {
    const raw = parseFloat(lenNumInput.value);
    if (isNaN(raw)) { lenNumInput.value = (currentLength * lenU.factor).toFixed(lenU.dec); return; }
    currentLength = Math.max(minLength, Math.min(maxLength, raw / lenU.factor));
    lenNumInput.value = (currentLength * lenU.factor).toFixed(lenU.dec);
    lengthInput.value = String(currentLength);
    if (obj.presets) {
      lengthSlider.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
    }
    updateWhatIf();
  });
  lenNumInput.addEventListener("keydown", (e) => { if (e.key === "Enter") lenNumInput.blur(); });

  lengthSlider.appendChild(lengthLabel);
  lengthSlider.appendChild(lengthInput);
  screen.appendChild(lengthSlider);

  // Thickness slider with editable value input
  const thickNumInput = el("input", {
    type: "number",
    className: "slider-number-input",
    value: (currentThickness * thickU.factor).toFixed(thickU.dec),
  });
  const minThick = obj.dimensions.thickness * 0.25;
  const maxThick = obj.dimensions.thickness * 4;
  const thickSlider = el("div", { className: "slider-group" });
  const thickLabel = el(
    "div",
    { className: "slider-label" },
    el("span", {}, "Thickness"),
    el("div", { className: "slider-value-wrap" },
      thickNumInput,
      el("span", { className: "slider-unit" }, thickU.unit),
    ),
  );
  const thickInput = el("input", {
    type: "range",
    min: String(minThick),
    max: String(maxThick),
    step: "0.0001",
    value: String(currentThickness),
    oninput: (e) => {
      currentThickness = parseFloat(e.target.value);
      thickNumInput.value = (currentThickness * thickU.factor).toFixed(thickU.dec);
      updateWhatIf();
    },
  });

  thickNumInput.addEventListener("change", () => {
    const raw = parseFloat(thickNumInput.value);
    if (isNaN(raw)) { thickNumInput.value = (currentThickness * thickU.factor).toFixed(thickU.dec); return; }
    currentThickness = Math.max(minThick, Math.min(maxThick, raw / thickU.factor));
    thickNumInput.value = (currentThickness * thickU.factor).toFixed(thickU.dec);
    thickInput.value = String(currentThickness);
    updateWhatIf();
  });
  thickNumInput.addEventListener("keydown", (e) => { if (e.key === "Enter") thickNumInput.blur(); });

  thickSlider.appendChild(thickLabel);
  thickSlider.appendChild(thickInput);
  screen.appendChild(thickSlider);

  screen.appendChild(whatIfResult);
  updateWhatIf();

  container.appendChild(screen);

  // ── Matching logic ──

  async function toggleListening() {
    if (isListening) {
      stopListening();
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

    pitchDetector.start((frequency, clarity) => {
      meter.update(frequency, clarity);

      if (frequency > 0 && clarity > 0.8) {
        const ratio = frequency / obj.frequency;
        if (Math.abs(ratio - 1) < TOLERANCE) {
          if (!matchStart) matchStart = performance.now();
          const elapsed = (performance.now() - matchStart) / 1000;
          meter.setMatchProgress(elapsed / MATCH_DURATION);
          if (elapsed >= MATCH_DURATION) {
            meter.setMatched(true);
            // Reset after celebration
            setTimeout(() => {
              meter.setMatched(false);
              meter.setMatchProgress(0);
              matchStart = null;
            }, 2000);
          }
        } else {
          matchStart = null;
          meter.setMatchProgress(0);
        }
      } else {
        matchStart = null;
        meter.setMatchProgress(0);
      }
    });
  }

  function stopListening() {
    if (pitchDetector) {
      pitchDetector.stop();
      pitchDetector = null;
    }
    if (meter) meter.stopRendering();
    AudioEngine.getInstance().stopMicrophone();
    isListening = false;
    matchBtn.textContent = "Practice Match";
    matchBtn.className = "btn btn-primary";
    listenBtn.disabled = false;
    matchStart = null;
  }

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

# Sound and Valid: Architecture and Design Document

## What It Is

A browser-based frequency education app. Players match the resonant frequency of real-world objects (aluminum bars, wood planks, tuning forks, etc.) by humming or singing into their microphone. All frequencies are computed from first-principles physics. No lookup tables.

Built as a vanilla JS PWA (no framework), bundled with Vite.

---

## File Map

```
src/
├── main.js                  Entry point. Registers routes, builds bottom nav, inits router.
├── router.js                Hash-based SPA router. Lazy-loads screen modules on navigation.
├── style.css                All styles. Single file, CSS custom properties for theming.
│
├── screens/                 One file per route. Each exports render(container) → cleanup fn.
│   ├── home.js              Home screen. Hero wave, quick-play buttons, scrollable physics education.
│   ├── play.js              Mode select hub (Daily, Race, Catalog cards).
│   ├── play.js              Second mode-select hub (reached from bottom nav).
│   ├── daily-match.js       Daily challenge. One object per day, mic-match gameplay.
│   ├── race.js              Bingo-card speed mode. Match as many as possible.
│   ├── catalog.js           Browse all 18 objects by category.
│   ├── object-detail.js     Per-object detail: formula breakdown, practice mode.
│   └── tutorial.js          First-run walkthrough.
│
├── audio/                   The audio pipeline (the "backend").
│   ├── audio-engine.js      Singleton AudioContext + AnalyserNode manager.
│   ├── pitch-detector.js    Autocorrelation pitch detection. Runs on rAF loop.
│   └── tone-player.js       Plays reference sine tones via OscillatorNode.
│
├── data/                    Physics engine and object catalog.
│   ├── formulas.js          Euler-Bernoulli beam frequency formula + eigenvalue table.
│   ├── materials.js         13 materials with E (Young's modulus) and ρ (density).
│   └── objects.js           18 object definitions. Frequencies computed at import time.
│
├── ui/                      Reusable UI components and canvas animations.
│   ├── components.js        el() DOM factory helper and SVG icon set.
│   ├── frequency-meter.js   Canvas tuner gauge (needle, tolerance zone, match bar).
│   ├── visualizer.js        Canvas oscilloscope for time-domain waveform display.
│   ├── wave-animation.js    Hero background: 3 animated sine waves with tracer trails.
│   └── section-animations.js  Four canvas animations for the landing edu sections.
│
└── utils/
    ├── daily-seed.js        Deterministic daily object picker (Knuth hash on UTC date).
    ├── helpers.js           formatFreq(), clamp(), etc.
    ├── i18n.js              Internationalization / locale string lookup.
    └── storage.js           localStorage wrappers for streak, progress, tutorial state.
```

---

## Routing

`router.js` is a minimal hash router. `location.hash` is the route key.

- `""` (no hash) → `home.js`
- `#play` → `play.js`
- `#daily` → `daily-match.js`
- `#race` → `race.js`
- `#catalog` → `catalog.js`
- `#object/:id` → `object-detail.js`
- `#tutorial` → `tutorial.js`

Each screen module is lazy-loaded (`import()`) on navigation. The `render()` function returns an optional cleanup callback; the router calls it before loading the next screen. This is how animations are destroyed and mic streams are stopped on navigation.

---

## Physics Engine (`src/data/`)

### The Formula

All frequencies come from Euler-Bernoulli beam bending theory, reduced for a rectangular cross-section:

```
f = (βL)² × h / (4π√3 × L²) × √(E / ρ)
```

Where:
- `(βL)`: eigenvalue coefficient, depends on boundary condition and mode number
- `h`: thickness of the bar
- `L`: length of the bar
- `E`: Young's modulus (stiffness) of the material
- `ρ`: density of the material

The width `b` cancels out entirely and does not affect bending frequency of a rectangular bar. This is a key physical insight shown to users.

### Boundary Conditions and Eigenvalues (`formulas.js:21-25`)

Three boundary conditions are supported, each with four modal eigenvalues. The eigenvalue `(βL)` for each mode is the solution to the boundary condition's characteristic equation:

| Condition | Characteristic equation | Mode 1 | Mode 2 | Mode 3 | Mode 4 |
|---|---|---|---|---|---|
| Free-free | cos(x)cosh(x) = 1 | 4.73004 | 7.8532 | 10.9956 | 14.1372 |
| Cantilever | cos(x)cosh(x) = −1 | 1.8751 | 4.6941 | 7.8548 | 10.9955 |
| Simply-supported | closed-form | π | 2π | 3π | 4π |

The free-free and cantilever values are transcendental; there is no algebraic solution. The constants in the code (`4.73004`, `1.8751`, etc.) are the numerically computed roots of those equations, taken from Rao's textbook and verified to 5+ significant figures against the vibrationdata.com beam frequency tables and the Texas A&M ME617 lecture notes. Simply-supported beams have a closed-form solution: `βL = nπ` for mode `n`.

The app uses only mode 1 (the fundamental) for all gameplay. Modes 2-4 are stored for potential educational use.

### Object Catalog (`objects.js`)

18 objects across 4 material categories (metals, woods, glass/ceramics, plastics). Every object is a `{material, dimensions, boundary}` tuple. Frequencies are computed once at module import time. `OBJECTS` is a static array of fully resolved objects with pre-computed `frequency` values.

Difficulty ratings (1-3) reflect how hard the frequency is to match with the human voice: 200-500 Hz is easy, very low or very high is hard.

### Materials (`materials.js`)

14 materials. Each entry stores only two physics values: `E` (Pa) and `rho` (kg/m³). All values cross-referenced against multiple engineering databases; see `REFERENCES.md` for full sourcing. Notable range: soft vinyl at 10 MPa vs alumina ceramic at 370 GPa (37000x stiffer).

---

## Audio Pipeline (`src/audio/`)

### AudioEngine (`audio-engine.js`)

Singleton (`AudioEngine.getInstance()`). Lazily creates the `AudioContext` on first user gesture, as required by iOS Safari's autoplay policy. Manages the microphone `MediaStream` and a shared `AnalyserNode` (fftSize 2048, smoothingTimeConstant 0.8).

The mic source is deliberately **not** connected to `audioCtx.destination`, only to the analyser. This prevents feedback.

### PitchDetector (`pitch-detector.js`): Why Autocorrelation, Not FFT

The detector runs on a `requestAnimationFrame` loop, calling `analyser.getFloatTimeDomainData()` each frame and running `_autocorrelate()`.

**Why not FFT peak-picking?**

At 44100 Hz with a 2048-sample buffer, FFT bin resolution is:
```
44100 / 2048 ≈ 21.5 Hz per bin
```
A note at 256 Hz and a note at 270 Hz fall in the same bin and are indistinguishable. For a tuning game requiring players to land within ±5%, that resolution is unusable.

Autocorrelation works in the time domain. It correlates the waveform against shifted copies of itself. The lag at which correlation peaks is the fundamental period `T`, and `f = sampleRate / T`. Resolution is limited only by parabolic interpolation precision, yielding **sub-Hz accuracy** at any frequency.

**Implementation steps (`pitch-detector.js:51-139`):**
1. RMS check: reject frames below 0.01 (silence / noise floor)
2. Edge trimming: find near-zero crossings at both ends to reduce edge artifacts in the correlation
3. Autocorrelation loop: compute `Σ buf[j] × buf[j + offset]` for each lag offset
4. Find first peak: skip the trivial peak at offset=0, find the next maximum
5. Parabolic interpolation: fit a parabola to the three points around the peak to get sub-sample lag accuracy
6. Return `{ frequency, clarity }` where clarity = `correlations[maxPos] / correlations[0]` (0-1)

Clarity threshold of 0.5 is used throughout the UI to gate display; below that, the signal is too noisy or aperiodic to trust.

### TonePlayer (`tone-player.js`)

Creates a fresh `OscillatorNode` (type `"sine"`) per play call. Uses `GainNode` with 50ms linear ramp-in to avoid the audible click that comes from instantly ramping an oscillator to full amplitude. On stop, a 20ms ramp-out before `oscillator.stop()` for the same reason.

---

## UI Components (`src/ui/`)

### FrequencyMeter (`frequency-meter.js`): Complex Feature

Canvas-based tuner gauge. Redraws every frame via `rAF`.

The gauge shows a horizontal scale centered on the target frequency. The needle (a colored dot) shows detected pitch. Position is computed as a percentage offset from target:

```
offset% = (detectedHz / targetHz - 1) × 100
```

Clamped to ±50% on the visual scale. Color: green within 5%, amber within 15%, red beyond.

A match-hold progress bar grows along the bottom while the user holds within the tolerance zone. The game logic (in each screen) calls `setMatchProgress()` on every frame; the meter just renders whatever it's given.

### WaveAnimation (`wave-animation.js`): Complex Feature

Three sine waves on the landing hero canvas. Each wave has independent: color, scroll speed (radians/second), wavelength factor, amplitude envelope, cycle duration, and stagger offset.

**Envelope lifecycle per wave:** fade in (0-15% of cycle) → breathe (15-70%) → fade out (70-90%) → hidden (90-100%). Breathing is a cosine oscillation of amplitude between 65% and 100% of max. All timing is based on `performance.now()`, not frame-count accumulation, so there is no drift at variable frame rates.

**Tracer effect:** Instead of `clearRect()` each frame, the canvas applies:
```js
ctx.globalCompositeOperation = "destination-out";
ctx.globalAlpha = 0.18;
ctx.fillRect(0, 0, w, h);
ctx.globalCompositeOperation = "source-over";
```
`destination-out` reduces the alpha of existing pixels each frame without compositing a background color, which works correctly on the transparent canvas overlay. At 60fps and a fade rate of 0.18, a wave position reaches ~1% opacity after ~22 frames (~0.37 seconds).

### Section Animations (`section-animations.js`): Complex Feature

Four canvas animations for the landing education section. All share a `canvasAnim()` factory that handles DPR-aware canvas sizing and the rAF loop. Each returns `{ element, start(), destroy() }`.

All four are controlled by `IntersectionObserver` in `landing.js`; they only run while their section card is at least 10% visible in the viewport.

**1. Sound Wave (`createSoundVisual`):** Tuning fork with expanding pressure arcs. Fork prongs vibrate via `Math.sin(t × 18)`. Arcs are drawn as canvas `arc()` strokes with age-based alpha, cycling on a 0.4-second interval.

**2. Frequency Explorer (`createFrequencyExplorer`):** Interactive sliders for stiffness (E), density (ρ), and length. The canvas draws a vibrating beam using the approximate free-free first bending mode shape. Frequency is computed live from the same `calcFreq()` formula used in the game. The animation rate is log-scaled so very high frequencies don't spin visually out of control.

**3. Formula Flow (`createFormulaVisual`):** E, ρ, L nodes with traveling pulse dots animating along connection lines into a central `f` output node. Pulses use `Math.sin(p × π)` for a smooth fade-in/out arc. The output node glows in sync with the last pulse arriving.

**4. Tuner Lock-on (`createTunerVisual`):** Needle cycling through oscillating with decaying amplitude (3s), then locked on center (1.5s), then a brief restart wobble (0.5s). Demonstrates the tuning experience before the user picks up a game mode.

### Visualizer (`visualizer.js`)

Canvas oscilloscope used in the play screens. Reads `Float32Array` from `AnalyserNode.getFloatTimeDomainData()` each frame and draws it as a time-domain waveform. Straightforward, with no special math beyond mapping sample values to canvas Y positions.

---

## Game Modes

**Daily Match (`daily-match.js`):** One object per day. Object selected by `getDailyObjectIndex()` in `daily-seed.js`: days since 2025-01-01 UTC → Knuth multiplicative hash (`× 2654435761 >>> 0`) → modulo object count. Same result for all users on the same UTC day.

**Race (`race.js`):** Bingo-card of objects. Players match as many as they can. Timer-based.

**Catalog (`catalog.js`):** Filterable grid of all 18 objects by material category. Tapping an object navigates to `object-detail.js`.

**Object Detail (`object-detail.js`):** Shows full formula breakdown (step-by-step via `calcBarFrequencyDetailed()`), material properties, and a practice mode with the full `FrequencyMeter` UI.

---

## PWA

`public/sw.js` registers a service worker. `public/manifest.json` defines the installable app metadata. The service worker is registered in `main.js` after the `load` event, silently failing if registration fails (non-critical).

---

## References Actually Used

**Formula and eigenvalues**
- S. Rao, *Mechanical Vibrations*, 5th Ed.: primary source for the Euler-Bernoulli derivation and eigenvalue coefficients
- [vibrationdata.com, Bending Frequencies of Beams](https://www.vibrationdata.com/tutorials2/beam.pdf): eigenvalue tables for all three boundary conditions; used to verify the 5-significant-figure constants in `formulas.js`
- [Texas A&M ME617 Lecture Notes](https://rotorlab.tamu.edu/me617/HD14%20Vibrations%20of%20bars%20and%20beams.pdf): university-level derivation used to confirm the characteristic equations and mode shapes
- [Euphonics, Bending Beams and Free-Free Modes](https://euphonics.org/3-2-1-bending-beams-and-free-free-modes/): directly confirms the simplified rectangular bar form (equation 20) used in the app

**Material properties** (sources where values were taken from directly, not just cross-checked)
- [MatWeb, Al 6061-T6](https://asm.matweb.com/search/specificmaterial.asp?bassnum=ma6061t6): aluminum E = 68.9 GPa, ρ = 2700 kg/m³
- [AZom, AISI 1018 Steel](https://www.azom.com/article.aspx?ArticleID=9138): steel E = 205 GPa
- [Copper Development Association, C11000](https://alloys.copper.org/alloy/C11000): copper E = 117 GPa, ρ = 8960 kg/m³
- [Copper Development Association, C26000](https://alloys.copper.org/alloy/C26000): brass E = 110 GPa, ρ = 8530 kg/m³
- [AmesWeb, Young's Modulus of Wood](https://amesweb.info/Materials/Youngs-Modulus-of-Wood.aspx) and [Density of Wood](https://amesweb.info/Materials/Density-of-Wood.aspx): primary source for all three wood moduli and densities
- [USDA Forest Products Laboratory, Ponderosa Pine](https://www.fpl.fs.usda.gov/documnts/usda/amwood/254ponder.pdf): caught an error where pine density was 510 kg/m³; corrected to 449 kg/m³ per USDA data
- [Accuratus, Alumina Al₂O₃](https://accuratus.com/alumox.html): alumina E = 370 GPa, ρ = 3950 kg/m³ for 99.5%+ purity
- [MIT, PMMA Material Properties](https://www.mit.edu/~6.777/matprops/pmma.htm): acrylic E = 3.2 GPa

**Pitch detection**
- [Alexander Ellis, Detecting Pitch with Autocorrelation](https://alexanderell.is/posts/tuner/): primary implementation reference; source of the parabolic interpolation step used in `pitch-detector.js`
- [Chris Wilson, PitchDetect (GitHub)](https://github.com/cwilso/PitchDetect): Web Audio API reference implementation; shaped the buffer-trimming and RMS-gating approach

**Validation**
- [COMSOL Blog, Tuning Fork Simulation](https://www.comsol.com/blogs/finding-answers-to-the-tuning-fork-mystery-with-simulation/): FEA computed 435 Hz for an 80mm steel prong; our cantilever formula gives 444 Hz for 84mm (~1% difference), confirming the model is sound

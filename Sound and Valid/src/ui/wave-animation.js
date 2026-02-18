/**
 * Animated sine waves for the landing page hero.
 *
 * Three waves with complementary colors fade in, breathe (pulse amplitude),
 * then fade out on staggered timings. A permanent horizontal axis line
 * runs across the center.
 *
 * All motion is time-based (not frame-based) to avoid jumpiness on
 * varying frame rates.
 */

const WAVE_CONFIGS = [
  {
    color: "#0DA186",
    speed: 1.2,            // radians per second (phase scroll speed)
    wavelengthFactor: 4,   // cycles across canvas width
    maxAmplitude: 0.22,
    cycleDuration: 10,     // seconds for full fade-in → breathe → fade-out
    stagger: 0,
  },
  {
    color: "#0D72A1",
    speed: 0.7,
    wavelengthFactor: 2.5,
    maxAmplitude: 0.28,
    cycleDuration: 12,
    stagger: 3.5,
  },
  {
    color: "#0DA13C",
    speed: 1.6,
    wavelengthFactor: 6,   // higher frequency wave
    maxAmplitude: 0.16,
    cycleDuration: 9,
    stagger: 7,
  },
];

export class WaveAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this._rafId = null;
    this._startTime = null;
    this._axisColor = "#d0d5dd";
    this._resizeTimeout = null;
    this._dirty = true; // flag to re-measure on next frame
    this.width = 0;
    this.height = 0;
    this._dpr = window.devicePixelRatio || 1;

    this._boundDraw = this._draw.bind(this);
    this._resizeHandler = () => {
      // Debounce resize: only mark dirty, let the draw loop handle it
      this._dirty = true;
    };

    window.addEventListener("resize", this._resizeHandler);
  }

  /** Sync canvas buffer size with its CSS layout size. Called inside the draw loop. */
  _syncSize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const bw = Math.round(rect.width * dpr);
    const bh = Math.round(rect.height * dpr);

    // Only touch the buffer when the size actually changed;
    // setting canvas.width/height clears the buffer and resets context state.
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }

    this._dpr = dpr;
    this.width = rect.width;
    this.height = rect.height;
    this._dirty = false;
  }

  start() {
    // Resolve axis color from CSS custom property
    try {
      const styles = getComputedStyle(document.documentElement);
      const axis = styles.getPropertyValue("--color-wave-axis").trim();
      if (axis) this._axisColor = axis;
    } catch {
      // keep default
    }

    this._syncSize();
    this._startTime = performance.now() / 1000;
    this._draw();
  }

  stop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this._resizeHandler);
  }

  /**
   * Compute the envelope (opacity and amplitude multiplier) for a wave.
   *
   * Uses smooth easing (cosine interpolation) to avoid any abrupt transitions.
   *
   * Lifecycle within each cycle:
   *   0%–15%  : fade in  (opacity 0→1, amp 0→max)  via smoothstep
   *   15%–70% : breathe  (opacity 1, amp oscillates 0.65×max → max)
   *   70%–90% : fade out (opacity 1→0, amp max→0)  via smoothstep
   *   90%–100%: hidden
   */
  _envelope(elapsed, wave) {
    const cycleTime =
      ((elapsed - wave.stagger) % wave.cycleDuration + wave.cycleDuration) %
      wave.cycleDuration;

    const p = cycleTime / wave.cycleDuration;

    let opacity = 0;
    let ampScale = 0;

    if (p < 0.15) {

      const t = p / 0.15;
      const smooth = 0.5 - 0.5 * Math.cos(t * Math.PI);

      opacity = smooth;
      ampScale = smooth;

    } else if (p < 0.70) {

      opacity = 1;

      const breatheT = (p - 0.15) / 0.55;

      const breathe =
        0.65 + 0.35 * (0.5 + 0.5 * Math.cos(breatheT * Math.PI * 6));

      ampScale = breathe;

    } else if (p < 0.90) {

      const t = (p - 0.70) / 0.20;

      const fade = 0.5 + 0.5 * Math.cos(t * Math.PI);

      opacity = fade;

      // blend smoothly from breathe → fade
      const breatheEnd = 1.0;

      ampScale = breatheEnd * fade;

    }

    return { opacity, ampScale };
  }

  _draw() {
    // Lazily sync canvas size inside the draw loop to avoid
    // mid-frame buffer clears from resize events.
    if (this._dirty) this._syncSize();

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (!w || !h) {
      this._rafId = requestAnimationFrame(this._boundDraw);
      return;
    }

    const dpr = this._dpr;
    const centerY = h / 2;

    // Reset transform then apply DPR scale each frame so we
    // don't accumulate transforms if the context was reset by a resize.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fade existing pixels toward transparent to create a tracer trail.
    // destination-out reduces alpha of whatever is already on the canvas,
    // leaving a decaying ghost of previous wave positions.
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 0.18;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    // Draw axis line
    ctx.beginPath();
    ctx.strokeStyle = this._axisColor;
    ctx.lineWidth = 1;
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.stroke();

    // Time-based phase; no per-frame accumulation, so no drift or jumpiness
    const elapsed = performance.now() / 1000 - this._startTime;

    // Draw each wave
    for (const wave of WAVE_CONFIGS) {
      const { opacity, ampScale } = this._envelope(elapsed, wave);

      if (ampScale < 0.005) continue;

      const amplitude =
        ampScale <= 0.001
          ? 0
          : wave.maxAmplitude * h * 0.5 * ampScale;
      const wavelength = w / wave.wavelengthFactor;
      const phase = elapsed * wave.speed;

      ctx.beginPath();
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = opacity;

      const step = 1;
      for (let x = 0; x <= w; x += step) {
        const y =
          centerY + amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    this._rafId = requestAnimationFrame(this._boundDraw);
  }
}

/**
 * Waveform visualizer: shows the time-domain audio signal
 * as a scrolling oscilloscope display.
 */

export class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = null;
    this.analyser = null;
    this.buffer = null;
    this._rafId = null;

    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  connect(analyser) {
    this.analyser = analyser;
    this.buffer = new Float32Array(analyser.fftSize);
  }

  start() {
    this._draw();
  }

  stop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    if (!this.analyser) {
      this._rafId = requestAnimationFrame(() => this._draw());
      return;
    }

    this.analyser.getFloatTimeDomainData(this.buffer);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;

    const sliceWidth = w / this.buffer.length;
    let x = 0;

    for (let i = 0; i < this.buffer.length; i++) {
      const v = this.buffer[i];
      const y = (1 - v) * (h / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();

    // Center line
    ctx.beginPath();
    ctx.strokeStyle = "#e2e5e9";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    this._rafId = requestAnimationFrame(() => this._draw());
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this._resize);
  }
}

/**
 * Canvas-based frequency tuner gauge.
 * Shows a horizontal scale with the target frequency in the center,
 * a moving indicator for the detected frequency, and color feedback.
 */

import { formatFreq, clamp } from "../utils/helpers.js";

export class FrequencyMeter {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.targetHz = 0;
    this.detectedHz = -1;
    this.clarity = 0;
    this.matchProgress = 0; // 0 to 1, fills up while in tolerance
    this.matched = false;
    this._rafId = null;

    this._createDOM();
  }

  _createDOM() {
    this.container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "meter-container";

    this.canvas = document.createElement("canvas");
    this.canvas.className = "meter-canvas";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "140px";
    wrapper.appendChild(this.canvas);

    this.readout = document.createElement("div");
    this.readout.className = "meter-readout";
    this.readout.innerHTML = `
      <span class="meter-target">Target: ---</span>
      <span class="meter-detected">You: ---</span>
    `;
    wrapper.appendChild(this.readout);

    this.statusEl = document.createElement("div");
    this.statusEl.className = "match-status";
    this.statusEl.textContent = "Listening...";
    wrapper.appendChild(this.statusEl);

    this.container.appendChild(wrapper);
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

  setTarget(hz) {
    this.targetHz = hz;
    this.matchProgress = 0;
    this.matched = false;
  }

  update(detectedHz, clarity) {
    this.detectedHz = detectedHz;
    this.clarity = clarity;
  }

  setMatchProgress(progress) {
    this.matchProgress = clamp(progress, 0, 1);
  }

  setMatched(matched) {
    this.matched = matched;
  }

  startRendering() {
    this._render();
  }

  stopRendering() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _render() {
    this._draw();
    this._updateReadout();
    this._rafId = requestAnimationFrame(() => this._render());
  }

  _draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const scaleY = h * 0.4;
    const scaleWidth = w - 40;
    const halfScale = scaleWidth / 2;

    // Background track
    ctx.fillStyle = "#f0f0f0";
    ctx.beginPath();
    ctx.roundRect(20, scaleY - 6, scaleWidth, 12, 6);
    ctx.fill();

    // Tolerance zone (+/- 5%)
    const tolWidth = (5 / 50) * halfScale;
    ctx.fillStyle = "rgba(22, 163, 74, 0.15)";
    ctx.beginPath();
    ctx.roundRect(centerX - tolWidth, scaleY - 14, tolWidth * 2, 28, 6);
    ctx.fill();

    // Center target line
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, scaleY - 18);
    ctx.lineTo(centerX, scaleY + 18);
    ctx.stroke();

    // Scale markers at -40%, -20%, 0%, +20%, +40%
    ctx.fillStyle = "#999";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    for (const pct of [-40, -20, 0, 20, 40]) {
      const x = centerX + (pct / 50) * halfScale;
      ctx.beginPath();
      ctx.moveTo(x, scaleY + 12);
      ctx.lineTo(x, scaleY + 18);
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (pct !== 0) {
        ctx.fillText(`${pct > 0 ? "+" : ""}${pct}%`, x, scaleY + 30);
      }
    }

    // Needle (detected frequency)
    if (this.detectedHz > 0 && this.clarity > 0.5) {
      const ratio = this.detectedHz / this.targetHz;
      const offset = (ratio - 1) * 100; // percentage offset
      const clampedOffset = clamp(offset, -50, 50);
      const needleX = centerX + (clampedOffset / 50) * halfScale;

      // Needle color based on distance
      const absOffset = Math.abs(offset);
      let color;
      if (this.matched) {
        color = "#16a34a";
      } else if (absOffset < 5) {
        color = "#16a34a"; // green
      } else if (absOffset < 15) {
        color = "#d97706"; // yellow
      } else {
        color = "#dc2626"; // red
      }

      // Needle shadow
      ctx.beginPath();
      ctx.arc(needleX, scaleY, 10, 0, Math.PI * 2);
      ctx.fillStyle = color + "30";
      ctx.fill();

      // Needle dot
      ctx.beginPath();
      ctx.arc(needleX, scaleY, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Hz offset label above needle
      ctx.fillStyle = color;
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      const sign = offset >= 0 ? "+" : "";
      ctx.fillText(`${sign}${offset.toFixed(1)}%`, needleX, scaleY - 26);
    }

    // Match progress bar at bottom
    if (this.matchProgress > 0 && !this.matched) {
      const barY = h - 20;
      const barWidth = w - 40;

      ctx.fillStyle = "#e5e7eb";
      ctx.beginPath();
      ctx.roundRect(20, barY, barWidth, 8, 4);
      ctx.fill();

      ctx.fillStyle = "#16a34a";
      ctx.beginPath();
      ctx.roundRect(20, barY, barWidth * this.matchProgress, 8, 4);
      ctx.fill();

      ctx.fillStyle = "#666";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Hold it...", w / 2, barY - 4);
    }

    // Matched celebration
    if (this.matched) {
      ctx.fillStyle = "#16a34a";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MATCHED!", w / 2, h - 16);
    }
  }

  _updateReadout() {
    const targetSpan = this.readout.querySelector(".meter-target");
    const detectedSpan = this.readout.querySelector(".meter-detected");

    targetSpan.textContent = `Target: ${formatFreq(this.targetHz)}`;

    if (this.detectedHz > 0 && this.clarity > 0.5) {
      detectedSpan.textContent = `You: ${formatFreq(this.detectedHz)}`;
    } else {
      detectedSpan.textContent = "You: ---";
    }

    // Update status
    if (this.matched) {
      this.statusEl.textContent = "Frequency matched!";
      this.statusEl.className = "match-status matched";
    } else if (this.detectedHz < 0 || this.clarity < 0.5) {
      this.statusEl.textContent = "Listening... make a sound";
      this.statusEl.className = "match-status";
    } else {
      const offset = Math.abs((this.detectedHz / this.targetHz - 1) * 100);
      if (offset < 5) {
        this.statusEl.textContent = "Almost there — hold it!";
        this.statusEl.className = "match-status close";
      } else if (offset < 15) {
        this.statusEl.textContent =
          this.detectedHz < this.targetHz ? "Go higher..." : "Go lower...";
        this.statusEl.className = "match-status close";
      } else {
        this.statusEl.textContent =
          this.detectedHz < this.targetHz ? "Too low" : "Too high";
        this.statusEl.className = "match-status far";
      }
    }
  }

  destroy() {
    this.stopRendering();
    window.removeEventListener("resize", this._resize);
  }
}

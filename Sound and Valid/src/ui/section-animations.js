/**
 * Interactive and animated visuals for the educational landing page sections.
 *
 * Each factory returns { element: HTMLElement, start(): void, destroy(): void }.
 *
 * 1. Sound Wave:    Tuning fork with expanding pressure arcs
 * 2. Freq Explorer: Sliders for stiffness / density / geometry + live readout
 * 3. Formula Flow:  Variables (E, ρ, L) feeding into frequency result
 * 4. Tuner Lock-on: Needle homing in on target frequency
 */

import { el } from "./components.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function css(prop) {
  return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
}

function hexAlpha(hex, a) {
  if (!hex || hex[0] !== "#") return `rgba(100,100,200,${a})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Canvas animation loop with DPR-aware sizing. */
function canvasAnim(className, drawFn) {
  const canvas = document.createElement("canvas");
  canvas.className = className;
  const ctx = canvas.getContext("2d");
  let rafId = null;
  let t0 = 0;

  function frame() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) {
      rafId = requestAnimationFrame(frame);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawFn(ctx, w, h, performance.now() / 1000 - t0);
    rafId = requestAnimationFrame(frame);
  }

  return {
    element: canvas,
    start() {
      t0 = performance.now() / 1000;
      frame();
    },
    destroy() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. SOUND WAVE: Tuning fork vibrating with expanding pressure arcs
// ═════════════════════════════════════════════════════════════════════════════

export function createSoundVisual() {
  return canvasAnim("section-anim-canvas", (ctx, w, h, t) => {
    const textColor = css("--color-text") || "#1a1a2e";
    const primary = css("--color-primary") || "#2563eb";

    const cx = w * 0.12;
    const cy = h * 0.5;

    // ── Tuning fork ──
    const vibAmp = 3;
    const dx = Math.sin(t * 18) * vibAmp;
    const gap = 8;
    const pH = h * 0.28;
    const hH = h * 0.18;

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Left prong
    ctx.beginPath();
    ctx.moveTo(cx - gap / 2, cy + pH * 0.3);
    ctx.lineTo(cx - gap / 2 - dx, cy - pH);
    ctx.stroke();

    // Right prong
    ctx.beginPath();
    ctx.moveTo(cx + gap / 2, cy + pH * 0.3);
    ctx.lineTo(cx + gap / 2 + dx, cy - pH);
    ctx.stroke();

    // Base curve
    ctx.beginPath();
    ctx.moveTo(cx - gap / 2, cy + pH * 0.3);
    ctx.quadraticCurveTo(cx, cy + pH * 0.3 + 5, cx + gap / 2, cy + pH * 0.3);
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.moveTo(cx, cy + pH * 0.3 + 5);
    ctx.lineTo(cx, cy + pH * 0.3 + 5 + hH);
    ctx.stroke();

    // ── Pressure wave arcs ──
    const interval = 0.4;
    const speed = w * 0.35;
    const maxAge = 2.2;
    const latest = Math.floor(t / interval);

    for (let n = latest; n >= Math.max(0, latest - 8); n--) {
      const age = t - n * interval;
      if (age > maxAge || age < 0) continue;

      const r = age * speed;
      const alpha = (1 - age / maxAge) * 0.4;

      ctx.beginPath();
      ctx.arc(cx, cy, r, -0.6, 0.6);
      ctx.strokeStyle = hexAlpha(primary, alpha);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. FREQUENCY EXPLORER: Interactive sliders + vibrating beam + readout
// ═════════════════════════════════════════════════════════════════════════════

export function createFrequencyExplorer() {
  // Default: steel-like bar
  const state = { E: 200, rho: 7800, len: 20 }; // GPa, kg/m³, cm

  function calcFreq() {
    const E = state.E * 1e9;
    const rho = state.rho;
    const L = state.len / 100;
    const h = 0.005; // fixed 5 mm thickness
    const betaL = 4.73004; // free-free fundamental
    return (
      ((betaL ** 2 * h) / (4 * Math.PI * Math.sqrt(3) * L ** 2)) *
      Math.sqrt(E / rho)
    );
  }

  const container = el("div", { className: "freq-explorer" });

  // ── Vibrating beam canvas ──
  const barAnim = canvasAnim("freq-explorer-canvas", (ctx, w, h, t) => {
    const primary = css("--color-primary") || "#2563eb";
    const secondary = css("--color-text-secondary") || "#6b7280";
    const freq = calcFreq();

    // Log-scale mapping so very high freqs don't spin insanely
    const visRate = 1 + Math.log2(Math.max(freq, 1)) * 0.7;
    const amp = 8;
    const cy = h / 2;

    ctx.strokeStyle = primary;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();

    for (let x = 0; x <= w; x += 2) {
      const nx = x / w;
      // Approximate free-free first bending mode shape
      const mode =
        Math.sin(Math.PI * nx) * (1 - 0.3 * Math.cos(2 * Math.PI * nx));
      const y = cy + amp * mode * Math.sin(t * visRate * Math.PI * 2);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // End support dots
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(3, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w - 3, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Frequency readout ──
  const readout = el("div", { className: "freq-explorer-readout" });

  function update() {
    const f = calcFreq();
    readout.textContent =
      f >= 1000 ? `${(f / 1000).toFixed(2)} kHz` : `${f.toFixed(1)} Hz`;
  }

  // ── Slider factory ──
  function makeSlider(label, min, max, value, unit, decimals, onChange) {
    const group = el("div", { className: "slider-group" });
    const row = el("div", { className: "slider-label" });
    const nameSpan = el("span", {}, label);
    const valSpan = el(
      "span",
      { className: "font-mono" },
      `${value.toFixed(decimals)} ${unit}`
    );
    row.appendChild(nameSpan);
    row.appendChild(valSpan);

    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = (max - min) / 200;
    input.value = value;
    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      valSpan.textContent = `${v.toFixed(decimals)} ${unit}`;
      onChange(v);
      update();
    });

    group.appendChild(row);
    group.appendChild(input);
    return group;
  }

  // Assemble
  container.appendChild(barAnim.element);
  container.appendChild(
    makeSlider("Stiffness (E)", 0.5, 400, state.E, "GPa", 1, (v) => {
      state.E = v;
    })
  );
  container.appendChild(
    makeSlider("Density (\u03C1)", 500, 20000, state.rho, "kg/m\u00B3", 0, (v) => {
      state.rho = v;
    })
  );
  container.appendChild(
    makeSlider("Length", 5, 50, state.len, "cm", 1, (v) => {
      state.len = v;
    })
  );
  container.appendChild(readout);

  update();

  return {
    element: container,
    start() {
      barAnim.start();
    },
    destroy() {
      barAnim.destroy();
    },
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. FORMULA FLOW: Variable nodes (E, ρ, L) pulsing into frequency output
// ═════════════════════════════════════════════════════════════════════════════

export function createFormulaVisual() {
  return canvasAnim("section-anim-canvas", (ctx, w, h, t) => {
    const primary = css("--color-primary") || "#2563eb";
    const secondary = css("--color-text-secondary") || "#6b7280";

    // Spread inputs across the wide canvas
    const inputs = [
      { label: "E", x: w * 0.12, color: css("--color-wave-1") || "#16a34a" },
      { label: "\u03C1", x: w * 0.32, color: css("--color-wave-2") || "#2563eb" },
      { label: "L", x: w * 0.52, color: css("--color-wave-3") || "#d97706" },
    ];

    const inputY = h * 0.45;
    const outputX = w * 0.82;
    const outputY = h * 0.45;
    const nodeR = Math.min(w * 0.06, h * 0.16);
    const bigR = nodeR * 1.5;

    // ── Connection lines ──
    for (const inp of inputs) {
      ctx.beginPath();
      ctx.moveTo(inp.x + nodeR, inputY);
      ctx.lineTo(outputX - bigR, outputY);
      ctx.strokeStyle = hexAlpha(secondary, 0.2);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── Traveling pulses ──
    const cycle = 3;
    for (let i = 0; i < inputs.length; i++) {
      const inp = inputs[i];
      const delay = i * 0.6;
      const raw = ((t - delay) % cycle + cycle) % cycle;
      const progress = raw / cycle;

      if (progress > 0.5) continue;

      const p = progress / 0.5;
      const lineStartX = inp.x + nodeR;
      const lineEndX = outputX - bigR;
      const px = lineStartX + (lineEndX - lineStartX) * p;
      const py = inputY + (outputY - inputY) * p;
      const pulseAlpha = Math.sin(p * Math.PI);

      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(inp.color, pulseAlpha * 0.8);
      ctx.fill();
    }

    // ── Input nodes ──
    const fontSize = Math.round(Math.max(nodeR * 0.9, 10));
    ctx.font = `bold ${fontSize}px ${css("--font-sans") || "sans-serif"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const inp of inputs) {
      ctx.beginPath();
      ctx.arc(inp.x, inputY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(inp.color, 0.15);
      ctx.strokeStyle = inp.color;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = inp.color;
      ctx.fillText(inp.label, inp.x, inputY);
    }

    // ── Arrow hints between nodes ──
    const arrowColor = hexAlpha(secondary, 0.3);
    for (let i = 0; i < inputs.length - 1; i++) {
      const x1 = inputs[i].x + nodeR + 4;
      const x2 = inputs[i + 1].x - nodeR - 4;
      const mx = (x1 + x2) / 2;
      ctx.beginPath();
      ctx.moveTo(x1, inputY);
      ctx.lineTo(x2, inputY);
      ctx.strokeStyle = arrowColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      // arrowhead
      ctx.beginPath();
      ctx.moveTo(x2, inputY);
      ctx.lineTo(x2 - 4, inputY - 3);
      ctx.lineTo(x2 - 4, inputY + 3);
      ctx.closePath();
      ctx.fillStyle = arrowColor;
      ctx.fill();
    }

    // ── Arrow from last input to output ──
    const lastX = inputs[2].x + nodeR + 4;
    const outLeftX = outputX - bigR - 4;
    ctx.beginPath();
    ctx.moveTo(lastX, inputY);
    ctx.lineTo(outLeftX, outputY);
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(outLeftX, outputY);
    ctx.lineTo(outLeftX - 4, outputY - 3);
    ctx.lineTo(outLeftX - 4, outputY + 3);
    ctx.closePath();
    ctx.fillStyle = arrowColor;
    ctx.fill();

    // ── Output node (f) ──
    const pulsePhase = ((t % cycle) + cycle) % cycle / cycle;
    const glow =
      pulsePhase > 0.5
        ? Math.sin((pulsePhase - 0.5) * 2 * Math.PI) * 0.3
        : 0;

    ctx.beginPath();
    ctx.arc(outputX, outputY, bigR + glow * 4, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(primary, 0.12 + glow * 0.15);
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = primary;
    ctx.font = `bold ${Math.round(Math.max(bigR * 0.7, 12))}px ${css("--font-mono") || "monospace"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("f", outputX, outputY);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. TUNER LOCK-ON: Needle oscillating then settling on target
// ═════════════════════════════════════════════════════════════════════════════

export function createTunerVisual() {
  return canvasAnim("section-anim-canvas", (ctx, w, h, t) => {
    const primary = css("--color-primary") || "#2563eb";
    const success = css("--color-success") || "#16a34a";
    const border = css("--color-border") || "#e2e5e9";
    const textColor = css("--color-text") || "#1a1a2e";

    const cy = h * 0.4;
    const gaugeL = w * 0.05;
    const gaugeR = w * 0.95;
    const gaugeW = gaugeR - gaugeL;
    const gaugeMid = (gaugeL + gaugeR) / 2;

    // ── Gauge line ──
    ctx.beginPath();
    ctx.moveTo(gaugeL, cy);
    ctx.lineTo(gaugeR, cy);
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── Tick marks ──
    for (let i = 0; i <= 10; i++) {
      const x = gaugeL + (gaugeW / 10) * i;
      const tickH = i === 5 ? 10 : 5;
      ctx.beginPath();
      ctx.moveTo(x, cy - tickH);
      ctx.lineTo(x, cy + tickH);
      ctx.strokeStyle = i === 5 ? primary : border;
      ctx.lineWidth = i === 5 ? 2 : 1;
      ctx.stroke();
    }

    // ── Target label ──
    ctx.fillStyle = primary;
    const labelSize = Math.round(Math.min(w, h) * 0.085);
    ctx.font = `600 ${labelSize}px ${css("--font-mono") || "monospace"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("target", gaugeMid, cy + 14);

    // ── Needle cycle ──
    const cycle = 5;
    const ct = ((t % cycle) + cycle) % cycle;
    let needleX;
    let matched = false;

    if (ct < 3) {
      // Oscillating with decreasing amplitude
      const amp = (1 - ct / 3) * 0.42;
      const freq = 1.5 + ct * 0.3;
      needleX = gaugeMid + amp * gaugeW * Math.sin(ct * freq * Math.PI * 2);
    } else if (ct < 4.5) {
      // Locked on
      needleX = gaugeMid;
      matched = true;
    } else {
      // Brief restart wobble
      const p = (ct - 4.5) / 0.5;
      needleX = gaugeMid + p * 0.3 * gaugeW * Math.sin(p * 8);
    }

    needleX = Math.max(gaugeL, Math.min(gaugeR, needleX));

    // ── Needle triangle ──
    const nw = 5;
    const nh = 10;
    ctx.beginPath();
    ctx.moveTo(needleX, cy - nh);
    ctx.lineTo(needleX - nw, cy - nh - 7);
    ctx.lineTo(needleX + nw, cy - nh - 7);
    ctx.closePath();
    ctx.fillStyle = matched ? success : textColor;
    ctx.fill();

    // ── Match indicator ──
    if (matched) {
      const checkY = h * 0.78;

      ctx.beginPath();
      ctx.arc(gaugeMid, checkY, 10, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(success, 0.15);
      ctx.strokeStyle = success;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // Checkmark
      ctx.beginPath();
      ctx.moveTo(gaugeMid - 4, checkY);
      ctx.lineTo(gaugeMid - 1, checkY + 3);
      ctx.lineTo(gaugeMid + 5, checkY - 4);
      ctx.strokeStyle = success;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  });
}

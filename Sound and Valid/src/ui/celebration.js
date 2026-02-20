/**
 * Celebration particle burst for a successful frequency match.
 *
 * Creates a fixed full-screen canvas overlay, animates for ~1.6s,
 * then self-removes. No cleanup needed by the caller.
 */

const COLORS = [
  "#0DA186", "#0D72A1", "#0DA13C",
  "#3ac4aa", "#3ba8d4", "#3ac46a",
  "#ffffff",
];

const DURATION = 1600; // ms

export function celebrate() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;" +
    "pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.scale(dpr, dpr);

  // Burst origin: horizontally centered, ~40% down (where the meter sits)
  const ox = W / 2;
  const oy = H * 0.4;

  // Particles: mix of small rectangles and circles
  const particles = Array.from({ length: 60 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 11;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4, // bias slightly upward
      size: 5 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rect: Math.random() > 0.4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.35,
    };
  });

  // Expanding rings (staggered)
  const rings = [0, 100, 200].map((delay) => ({ delay, maxR: 180 }));

  const start = performance.now();

  function draw(now) {
    const elapsed = now - start;
    if (elapsed > DURATION) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, W, H);
    const progress = elapsed / DURATION;

    // Rings
    for (const ring of rings) {
      if (elapsed < ring.delay) continue;
      const t = (elapsed - ring.delay) / (DURATION * 0.65);
      if (t > 1) continue;
      const r = t * ring.maxR;
      const alpha = (1 - t) * 0.55;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(61, 168, 212, ${alpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // gravity
      p.vx *= 0.985; // air resistance
      p.rot += p.rotV;
      const alpha = Math.max(0, 1 - progress * 1.3);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.rect) {
        ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

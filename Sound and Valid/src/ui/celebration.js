/**
 * Celebration confetti rain for a successful frequency match.
 *
 * Particles spawn across the top of the screen and fall with gravity,
 * with new batches spawning for the first half of the animation.
 * Self-removes after ~2.2s. No cleanup needed by the caller.
 */

const COLORS = [
  "#0DA186", "#0D72A1", "#0DA13C",
  "#3ac4aa", "#3ba8d4", "#3ac46a",
  "#ffffff",
];

const HARMONIC_COLORS = [
  "#d97706", "#f59e0b", "#fbbf24",
  "#b45309", "#fde68a", "#ffffff",
];

const DURATION    = 2200; // ms total
const SPAWN_UNTIL = 0.5;  // fraction of DURATION to keep spawning

export function celebrateHarmonic() {
  _run(HARMONIC_COLORS, 15, 3);
}

export function celebrate() {
  _run(COLORS, 35, 7);
}

function _run(colors, initialBurst, batchSize) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;" +
    "pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.scale(dpr, dpr);

  const particles = [];

  function spawnBatch(count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x:    Math.random() * W,
        y:    -10 - Math.random() * 30,
        vx:   (Math.random() - 0.5) * 3,
        vy:   1.5 + Math.random() * 4,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rect: Math.random() > 0.4,
        rot:  Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.25,
        alpha: 1,
      });
    }
  }

  spawnBatch(initialBurst);

  const start = performance.now();
  let lastSpawn = 0;

  function draw(now) {
    const elapsed = now - start;
    if (elapsed > DURATION) {
      canvas.remove();
      return;
    }

    // Keep spawning small batches in the first half
    if (elapsed < DURATION * SPAWN_UNTIL && elapsed - lastSpawn > 110) {
      spawnBatch(batchSize);
      lastSpawn = elapsed;
    }

    ctx.clearRect(0, 0, W, H);

    const fadeStart = DURATION * 0.65;

    for (const p of particles) {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.12;                          // gentle gravity
      p.vx  += (Math.random() - 0.5) * 0.08; // slight air drift
      p.rot += p.rotV;

      if (elapsed > fadeStart) {
        p.alpha = Math.max(0, 1 - (elapsed - fadeStart) / (DURATION * 0.35));
      }

      if (p.y > H + 20 || p.alpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
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

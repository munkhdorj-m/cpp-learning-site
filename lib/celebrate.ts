// The effect when a student gets something right.
//
// It used to be stock multicoloured confetti, which looks like every other
// website and has nothing to do with this one. This is built from the site's
// own palette instead: a shockwave ring, a burst of square "pixel" shards in
// the neon colours, and a scanline that sweeps once across the screen — the
// same language as the rest of the interface.
//
// No dependency, one canvas, removed as soon as it finishes.

interface Options {
  /** 1 is a quiz answer; 2 is finishing a level or solving a problem. */
  intensity?: number;
}

const FALLBACK = ["#7dd3fc", "#a3e635", "#c084fc", "#fbbf24"];

/** Read the theme's neon colours so the burst matches light and dark. */
function palette(): string[] {
  if (typeof window === "undefined") return FALLBACK;
  const style = getComputedStyle(document.documentElement);
  const names = [
    "--color-neon-cyan",
    "--color-neon-lime",
    "--color-neon-violet",
    "--color-neon-amber",
    "--color-primary",
  ];
  const found = names
    .map((n) => style.getPropertyValue(n).trim())
    .filter(Boolean);
  return found.length ? found : FALLBACK;
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  spin: number;
  angle: number;
  colour: string;
  life: number;
}

export function celebrate({ intensity = 1 }: Options = {}): void {
  if (typeof window === "undefined") return;
  // Somebody who has asked for less motion should not get a screen full of it.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const colours = palette();
  const cx = w / 2;
  const cy = h * 0.45;

  const count = Math.round(70 * intensity);
  const shards: Shard[] = Array.from({ length: count }, () => {
    // Fired outwards and slightly upward, so it reads as a burst rather
    // than falling paper.
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9 * intensity;
    return {
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 3 + Math.random() * 5,
      spin: (Math.random() - 0.5) * 0.3,
      angle: Math.random() * Math.PI,
      colour: colours[Math.floor(Math.random() * colours.length)],
      life: 1,
    };
  });

  const DURATION = 1100;
  const start = performance.now();
  let raf = 0;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(safety);
    canvas.remove();
  };

  // requestAnimationFrame does not run in a tab that is not being drawn, so
  // without this the canvas would sit on the page forever — invisible, but
  // accumulating one full-screen element per celebration.
  const safety = window.setTimeout(cleanup, DURATION + 400);

  const frame = (now: number) => {
    const elapsed = now - start;
    const t = Math.min(elapsed / DURATION, 1);
    ctx.clearRect(0, 0, w, h);

    // Shockwave: two rings, the second trailing the first.
    for (const [delay, colour] of [
      [0, colours[0]],
      [120, colours[1] ?? colours[0]],
    ] as [number, string][]) {
      const rt = Math.min(Math.max((elapsed - delay) / 620, 0), 1);
      if (rt <= 0 || rt >= 1) continue;
      ctx.globalAlpha = (1 - rt) * 0.5;
      ctx.strokeStyle = colour;
      ctx.lineWidth = 2 * (1 - rt) + 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rt * Math.max(w, h) * 0.42, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shards.
    for (const s of shards) {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.32; // gravity
      s.vx *= 0.985; // drag
      s.angle += s.spin;
      s.life = 1 - t;

      if (s.life <= 0) continue;
      ctx.globalAlpha = Math.min(1, s.life * 1.6);
      ctx.fillStyle = s.colour;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      // Squares, not circles — the interface is built from rectangles.
      ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
      ctx.restore();
    }

    // One scanline sweeping down, the motif used everywhere else.
    if (t < 0.75) {
      const y = (t / 0.75) * h;
      const grad = ctx.createLinearGradient(0, y - 60, 0, y + 6);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, colours[0]);
      ctx.globalAlpha = 0.18 * (1 - t);
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - 60, w, 66);
    }

    if (t < 1) {
      raf = requestAnimationFrame(frame);
    } else {
      cleanup();
    }
  };

  raf = requestAnimationFrame(frame);
}

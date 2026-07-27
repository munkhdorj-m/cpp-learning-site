"use client";

import { useEffect, useRef } from "react";

/**
 * Constellation background: drifting particles that link up with lines when
 * they come close. Canvas 2D, sized to the viewport, purely decorative.
 *
 * Kept cheap on purpose — this runs on school laptops and phones:
 *  - particle count scales with viewport area and is capped
 *  - links are found with a uniform grid, so it never does the full O(n²) scan
 *  - the loop stops when the tab is hidden
 *  - honours prefers-reduced-motion by drawing one static frame
 */
export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Resolve the theme's neon colour to rgb by letting the browser compute it.
    let rgb = "125, 211, 252";
    const readThemeColor = () => {
      const probe = document.createElement("span");
      probe.style.color = "var(--neon-cyan)";
      probe.style.display = "none";
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color; // "rgb(r, g, b)" / "oklch(...)"
      probe.remove();
      const m = c.match(/(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)/);
      if (m) rgb = `${Math.round(+m[1])}, ${Math.round(+m[2])}, ${Math.round(+m[3])}`;
    };
    readThemeColor();

    interface P {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    }
    let particles: P[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    const LINK_DIST = 130; // px — also the spatial-grid cell size
    const SPEED = 0.16;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ~1 particle per 16k px², clamped so phones stay light and huge
      // monitors don't melt.
      const target = Math.round((w * h) / 16000);
      const count = Math.max(28, Math.min(110, target));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        r: Math.random() * 1.4 + 0.9,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Bucket particles so each one only tests its 8 neighbouring cells.
      const cols = Math.max(1, Math.ceil(w / LINK_DIST));
      const rows = Math.max(1, Math.ceil(h / LINK_DIST));
      const cells: number[][] = Array.from({ length: cols * rows }, () => []);
      particles.forEach((p, i) => {
        const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / LINK_DIST)));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / LINK_DIST)));
        cells[cy * cols + cx].push(i);
      });

      ctx.lineWidth = 1;
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const bucket = cells[cy * cols + cx];
          if (!bucket.length) continue;
          for (let ny = cy; ny <= cy + 1; ny++) {
            for (let nx = cx - 1; nx <= cx + 1; nx++) {
              if (ny === cy && nx < cx) continue; // avoid testing pairs twice
              if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
              const other = cells[ny * cols + nx];
              // Each *pair of cells* is visited once, so only dedupe by index
              // inside a single cell. Applying j <= i across two cells would
              // drop links whose neighbour happens to have a lower index.
              const sameCell = nx === cx && ny === cy;
              for (const i of bucket) {
                for (const j of other) {
                  if (sameCell && j <= i) continue;
                  const a = particles[i];
                  const b = particles[j];
                  const dx = a.x - b.x;
                  const dy = a.y - b.y;
                  const d2 = dx * dx + dy * dy;
                  if (d2 > LINK_DIST * LINK_DIST) continue;
                  const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.28;
                  ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
                  ctx.beginPath();
                  ctx.moveTo(a.x, a.y);
                  ctx.lineTo(b.x, b.y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      ctx.fillStyle = `rgba(${rgb}, 0.55)`;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }
      draw();
    };

    let raf = 0;
    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    build();
    if (reduced) {
      draw(); // one static frame, no motion
    } else {
      start();
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        if (reduced) draw();
      }, 150);
    };
    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) stop();
      else start();
    };
    // Re-read the accent when the light/dark class flips.
    const themeObserver = new MutationObserver(() => {
      readThemeColor();
      if (reduced) draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60 dark:opacity-100"
    />
  );
}

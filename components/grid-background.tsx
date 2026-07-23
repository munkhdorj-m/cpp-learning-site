"use client";

import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  className?: string;
}

/**
 * Sci-fi ambient backdrop: a drifting holographic grid, a few soft neon
 * glow orbs, a slow scanline, and a vignette. Pure CSS, GPU-friendly,
 * pointer-events-none. Sits behind all content.
 */
export function GridBackground({ className }: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      {/* Drifting grid */}
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-[0.6]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--neon-cyan) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--neon-cyan) 12%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "grid-pan 18s linear infinite",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
        }}
      />

      {/* Neon glow orbs */}
      <div
        className="absolute -top-1/4 left-1/2 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full opacity-[0.1] dark:opacity-[0.18]"
        style={{
          background:
            "radial-gradient(circle, var(--neon-cyan), transparent 70%)",
          animation: "blob-float 24s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -left-1/4 h-[50vh] w-[50vh] rounded-full opacity-[0.07] dark:opacity-[0.14]"
        style={{
          background:
            "radial-gradient(circle, var(--neon-violet), transparent 70%)",
          animation: "blob-float 30s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute -bottom-1/4 right-0 h-[45vh] w-[45vh] rounded-full opacity-[0.06] dark:opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, var(--neon-pink), transparent 70%)",
          animation: "blob-float 28s ease-in-out infinite",
        }}
      />

      {/* Slow scanline */}
      <div
        className="absolute inset-x-0 top-0 h-24 opacity-40 dark:opacity-60"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--neon-cyan) 10%, transparent), transparent)",
          animation: "scan 9s linear infinite",
        }}
      />

      {/* Vignette to keep edges deep */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 0%, transparent 55%, oklch(0.12 0.02 264 / 0.55) 100%)",
        }}
      />
    </div>
  );
}

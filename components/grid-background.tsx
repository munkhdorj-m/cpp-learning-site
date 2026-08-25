"use client";

import { cn } from "@/lib/utils";
import { ParticleNetwork } from "@/components/particle-network";

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
      data-ambient=""
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      {/* Drifting grid. Weaker than it was: it is a backdrop behind a solid
          content slab now, not a texture under the text. */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--amber-mid) 14%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--amber-mid) 14%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 75%)",
        }}
      />

      {/* The constellation is the backdrop now. The drifting glow orbs and the
          scanline sweep used to sit here, but they washed the lines out — the
          network needs a flat, dark field behind it to read clearly. */}
      <ParticleNetwork />

      {/* Vignette to keep edges deep */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 0%, transparent 55%, rgb(0 0 0 / 0.6) 100%)",
        }}
      />
    </div>
  );
}

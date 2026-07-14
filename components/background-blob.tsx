"use client";

import { cn } from "@/lib/utils";

interface BackgroundBlobProps {
  className?: string;
}

/**
 * Subtle animated gradient blob for background atmosphere.
 * Uses pure CSS — no three.js overhead.
 * Placed behind main content with low opacity.
 */
export function BackgroundBlob({ className }: BackgroundBlobProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      {/* Primary blob — violet/purple */}
      <div
        className="absolute -top-1/4 -left-1/4 h-[60vh] w-[60vh] rounded-full opacity-[0.08] dark:opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, var(--color-chart-1, oklch(0.65 0.18 290)), transparent 70%)",
          animation: "blob-float 20s ease-in-out infinite",
        }}
      />
      {/* Secondary blob — amber/gold */}
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[50vh] w-[50vh] rounded-full opacity-[0.06] dark:opacity-[0.10]"
        style={{
          background:
            "radial-gradient(circle, var(--color-chart-2, oklch(0.65 0.18 30)), transparent 70%)",
          animation: "blob-float 25s ease-in-out infinite reverse",
        }}
      />
      {/* Tertiary blob — emerald */}
      <div
        className="absolute top-1/3 right-1/4 h-[35vh] w-[35vh] rounded-full opacity-[0.05] dark:opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, var(--color-chart-3, oklch(0.65 0.18 150)), transparent 70%)",
          animation: "blob-float 30s ease-in-out infinite",
        }}
      />
    </div>
  );
}

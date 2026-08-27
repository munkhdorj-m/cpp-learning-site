"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

/**
 * LEVEL UP, the way a cabinet would do it.
 *
 * A wall of blocks sweeps up the screen, the number lands on it, and the whole
 * thing is gone in under two seconds. Deliberately brief: it is a reward, not
 * an interruption, and a student who has just solved something wants to keep
 * going.
 *
 * Built from stepped keyframes rather than smooth ones — the blocks snap
 * column by column, which is what makes it read as an arcade machine instead
 * of a modal. Nothing here is interactive and nothing traps focus; it is
 * aria-hidden and the toast still carries the news for a screen reader.
 *
 * Portalled to <body> so no ancestor's overflow or stacking context can clip
 * it — the same trap that ate the badge tooltips twice.
 */

/** Long enough to register, short enough not to be in the way. */
const TOTAL_MS = 1900;
const COLUMNS = 14;

export function LevelUp({
  level,
  onDone,
}: {
  level: number;
  onDone: () => void;
}) {
  const t = useTranslations("reward");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Respect a student who has asked for less movement: they get the words
    // and none of the sweep.
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    const id = setTimeout(onDone, reduced ? 900 : TOTAL_MS);
    return () => clearTimeout(id);
  }, [onDone]);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
    >
      {/* The wall. Each column rises on its own beat, so the edge is a
          staircase rather than a line. */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLUMNS }, (_, i) => (
          <span
            key={i}
            className="lvlup-col h-full flex-1"
            style={{
              // Middle-out: the centre columns lead and the edges follow.
              animationDelay: `${Math.abs(i - (COLUMNS - 1) / 2) * 45}ms`,
            }}
          />
        ))}
      </div>

      {/* The words sit on a solid slab, not straight on the wall. Magenta
          lettering on magenta columns is invisible, and a marquee panel is
          what a cabinet would do anyway. */}
      <div className="lvlup-text absolute inset-0 flex items-center justify-center px-6">
        <div
          className="flex flex-col items-center gap-1 px-8 py-6 sm:px-14 sm:py-8"
          style={{
            background: "var(--background)",
            border: "4px solid var(--ink-hot)",
            boxShadow: "10px 10px 0 var(--ink-hot)",
          }}
        >
          <span
            className="font-heading leading-none"
            style={{
              fontSize: "clamp(3.5rem, 16vw, 9rem)",
              color: "var(--display-ink)",
              textShadow: "6px 6px 0 var(--display-shade)",
            }}
          >
            {level}
          </span>
          <span
            className="font-heading leading-none tracking-[0.25em]"
            style={{
              fontSize: "clamp(0.7rem, 2.4vw, 1.5rem)",
              color: "var(--foreground)",
            }}
          >
            {t("level_up_banner")}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Flame,
  Trophy,
  Crown,
  Mountain,
  Target,
  Medal,
  Award,
  Lock,
  type LucideIcon,
} from "lucide-react";

import type { BadgeProgress } from "@/lib/badges";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Flame,
  Trophy,
  Crown,
  Mountain,
  Target,
  Medal,
};

// Badge colours come from the DB (badges.color) — map them onto neon tokens.
const GLOWS: Record<string, string> = {
  amber: "var(--neon-amber)",
  orange: "var(--neon-amber)",
  yellow: "var(--neon-amber)",
  red: "var(--neon-pink)",
  rose: "var(--neon-pink)",
  emerald: "var(--neon-lime)",
  violet: "var(--neon-violet)",
};

export interface BadgeChipData {
  icon: string;
  color: string;
  name: string;
  /** Exactly what it takes, from lib/badges.ts. */
  requirement?: string;
  href?: string;
  /** ISO date, when this student earned it. Absent means locked. */
  earnedAt?: string | null;
  progress?: BadgeProgress | null;
}

const CARD_WIDTH = 250;
/** Enough room below for the tallest card (name, rule, progress bar). */
const CARD_ROOM = 150;
const EDGE = 8;

interface Placement {
  left: number;
  top: number;
  above: boolean;
}

/**
 * A compact badge, with its rule on hover.
 *
 * The card is `position: fixed` and placed from the chip's own bounding box,
 * which is the part that took three goes to get right. An absolutely
 * positioned card cannot escape `Card`'s `overflow-hidden`, so it was sliced
 * off at the card's edge; a fixed one is laid out against the viewport
 * instead, so no ancestor's overflow applies to it.
 *
 * Being fixed also means it does not follow the page, so it closes on scroll
 * rather than sitting somewhere the badge no longer is.
 */
export function BadgeChip({ badge }: { badge: BadgeChipData }) {
  const Icon = ICONS[badge.icon] ?? Award;
  const glow = GLOWS[badge.color] ?? GLOWS.violet;
  const locked = !badge.earnedAt;

  const anchor = useRef<HTMLSpanElement>(null);
  const [place, setPlace] = useState<Placement | null>(null);

  const open = useCallback(() => {
    const el = anchor.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    // Below by default; above when the bottom of the window is too close.
    const above = window.innerHeight - r.bottom < CARD_ROOM;
    // Centre on the chip, then pull back inside the window so a badge at
    // either end of a row is not half off the screen.
    const centred = r.left + r.width / 2 - CARD_WIDTH / 2;
    const left = Math.max(
      EDGE,
      Math.min(centred, window.innerWidth - CARD_WIDTH - EDGE),
    );

    setPlace({ left, top: above ? r.top - 6 : r.bottom + 6, above });
  }, []);

  const close = useCallback(() => setPlace(null), []);

  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    // Passive + capture so it fires for any scroller, not just the window.
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
    };
  }, [place, close]);

  const pct =
    badge.progress && badge.progress.target > 0
      ? Math.round((badge.progress.current / badge.progress.target) * 100)
      : null;

  return (
    <span
      ref={anchor}
      className="relative inline-flex"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <span
        // Reachable without a mouse. It carries no action, so not a button.
        tabIndex={0}
        onFocus={open}
        onBlur={close}
        aria-describedby={place ? `badge-${badge.name}` : undefined}
        className={`inline-flex cursor-help items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-semibold outline-none focus-visible:ring-2 ${
          locked ? "opacity-45 saturate-50" : ""
        }`}
        style={{
          color: glow,
          borderColor: `color-mix(in oklch, ${glow} 38%, transparent)`,
          background: `color-mix(in oklch, ${glow} 12%, transparent)`,
        }}
      >
        {locked ? <Lock className="h-3.5 w-3.5" /> : <Icon className="h-4 w-4" />}
        {badge.name}
      </span>

      {place && (
        <span
          id={`badge-${badge.name}`}
          role="tooltip"
          className="pointer-events-none fixed z-[100] rounded-lg border border-primary/25 bg-popover p-2.5 text-left shadow-xl"
          style={{
            left: place.left,
            top: place.top,
            width: CARD_WIDTH,
            // Placed above by its own height, which is only known once it is
            // rendered — so shift it rather than measure it.
            transform: place.above ? "translateY(-100%)" : undefined,
          }}
        >
          <span className="block text-sm font-semibold text-popover-foreground">
            {badge.name}
          </span>
          {badge.requirement && (
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              {badge.requirement}
            </span>
          )}

          {badge.earnedAt ? (
            <span className="mt-1.5 block font-code text-[11px] text-neon-lime">
              {new Date(badge.earnedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          ) : pct !== null ? (
            <span className="mt-1.5 block">
              <span className="mb-1 block font-code text-[11px] tabular-nums text-muted-foreground">
                {badge.progress!.current} / {badge.progress!.target}
              </span>
              <span className="block h-1 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, background: glow }}
                />
              </span>
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}

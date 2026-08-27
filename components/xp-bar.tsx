"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { levelProgress, xpForLevel } from "@/lib/levels";

interface XpBarProps {
  xp: number;
  level: number;
}

const CARD_WIDTH = 230;
const EDGE = 8;

/**
 * Level and XP, with the numbers behind them on hover.
 *
 * A bar that fills with no scale is a bar you cannot plan against: a student
 * can see they are part-way to something without knowing how far. The card
 * says how much this level costs, how much is left, and what the next few
 * levels need.
 *
 * `position: fixed`, placed from the bar's own rect — the header has
 * overflow-hidden ancestors, and an absolutely positioned card gets sliced off
 * at the edge of one of them. Same lesson as the badge tooltips.
 */
export function XpBar({ xp, level }: XpBarProps) {
  const t = useTranslations("profile");
  const p = levelProgress(xp, level);

  const anchor = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ left: number; top: number } | null>(null);

  const open = useCallback(() => {
    const el = anchor.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const centred = r.left + r.width / 2 - CARD_WIDTH / 2;
    setPlace({
      left: Math.max(
        EDGE,
        Math.min(centred, window.innerWidth - CARD_WIDTH - EDGE),
      ),
      top: r.bottom + 8,
    });
  }, []);

  const close = useCallback(() => setPlace(null), []);

  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
    };
  }, [place, close]);

  // The next few rungs, so the shape of the climb is visible.
  const ahead = [1, 2, 3].map((n) => ({
    level: level + n,
    xp: xpForLevel(level + n),
  }));

  return (
    <div
      ref={anchor}
      className="flex items-center gap-2.5"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <div
        className="hud-chip hidden sm:inline-flex"
        style={{ ["--glow" as string]: "var(--neon-amber)" }}
      >
        <Trophy className="h-3.5 w-3.5" />
        <motion.span
          key={level}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          LV{level}
        </motion.span>
      </div>

      <div
        className="hidden min-w-[150px] items-center gap-2 md:flex"
        tabIndex={0}
        onFocus={open}
        onBlur={close}
        aria-label={t("xp_progress", {
          into: p.into,
          span: p.span,
          level: p.level,
        })}
      >
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted ring-1 ring-primary/15">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${p.pct}%`, background: "var(--gradient-xp)" }}
          />
        </div>
        <span className="font-code text-[0.7rem] font-semibold tabular-nums text-muted-foreground">
          {xp}
          <span className="text-primary/70"> {t("xp")}</span>
        </span>
      </div>

      {place && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[100] rounded-lg border border-primary/25 bg-popover p-3 text-left shadow-xl"
          style={{ left: place.left, top: place.top, width: CARD_WIDTH }}
        >
          <div className="text-sm font-semibold text-popover-foreground">
            {t("level")} {p.level}
          </div>
          <div className="mt-0.5 font-code text-[11px] tabular-nums text-muted-foreground">
            {p.into} / {p.span} {t("xp")} · {t("xp_to_next", { n: p.remaining })}
          </div>

          <div className="mt-2 space-y-0.5 border-t border-border pt-2">
            {ahead.map((a) => (
              <div
                key={a.level}
                className="flex justify-between font-code text-[11px] tabular-nums text-muted-foreground"
              >
                <span>
                  {t("level")} {a.level}
                </span>
                <span>{a.xp} {t("xp")}</span>
              </div>
            ))}
          </div>

          {/* There is no top level, and saying so is kinder than letting a
              student wonder what they are climbing towards. */}
          <div className="mt-2 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
            {t("no_max_level")}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { StreakFlame } from "@/components/animations/streak-flame";

interface XpBarProps {
  xp: number;
  level: number;
  streakDays: number;
}

export function XpBar({ xp, level, streakDays }: XpBarProps) {
  const t = useTranslations("profile");
  const currentLevelXp = (level - 1) ** 2 * 50;
  const nextLevelXp = level ** 2 * 50;
  const progress = Math.max(
    0,
    Math.min(
      100,
      ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
    ),
  );

  return (
    <div className="flex items-center gap-2.5">
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
      <div className="hidden md:flex items-center gap-2 min-w-[150px]">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted ring-1 ring-primary/15">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "var(--gradient-xp)",
              boxShadow: "0 0 12px -2px var(--color-primary)",
            }}
          />
        </div>
        <span className="font-code text-[0.7rem] font-semibold text-muted-foreground tabular-nums">
          {xp}
          <span className="text-primary/70"> {t("xp")}</span>
        </span>
      </div>
      {streakDays > 0 && (
        <div
          className="hud-chip"
          style={{ ["--glow" as string]: "var(--neon-pink)" }}
        >
          <StreakFlame className="h-3.5 w-3.5" />
          <span className="tabular-nums">{streakDays}</span>
        </div>
      )}
    </div>
  );
}

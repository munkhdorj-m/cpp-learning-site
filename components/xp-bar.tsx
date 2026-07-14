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
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
        <Trophy className="h-3.5 w-3.5" />
        <motion.span
          className="text-xs font-semibold"
          key={level}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          Lv {level}
        </motion.span>
      </div>
      <div className="hidden md:flex items-center gap-2 min-w-[140px]">
        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {xp} {t("xp")}
        </span>
      </div>
      {streakDays > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400">
          <StreakFlame className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold tabular-nums">
            {streakDays}
          </span>
        </div>
      )}
    </div>
  );
}

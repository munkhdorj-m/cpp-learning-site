import {
  Sparkles,
  Flame,
  Trophy,
  Crown,
  Mountain,
  Target,
  Medal,
  Award,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Flame,
  Trophy,
  Crown,
  Mountain,
  Target,
  Medal,
};

const COLOR_STYLES: Record<string, string> = {
  amber:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-amber-200/50 dark:ring-amber-800/50",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 ring-orange-200/50 dark:ring-orange-800/50",
  red: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 ring-red-200/50 dark:ring-red-800/50",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 ring-yellow-200/50 dark:ring-yellow-800/50",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-emerald-200/50 dark:ring-emerald-800/50",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 ring-rose-200/50 dark:ring-rose-800/50",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 ring-violet-200/50 dark:ring-violet-800/50",
};

export interface BadgeChipData {
  icon: string;
  color: string;
  name: string;
  description?: string;
}

export function BadgeChip({
  badge,
  size = "md",
}: {
  badge: BadgeChipData;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = ICONS[badge.icon] ?? Award;
  const colorClass = COLOR_STYLES[badge.color] ?? COLOR_STYLES.violet;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-2.5 py-1.5 text-sm gap-1.5",
    lg: "px-3 py-2 text-base gap-2",
  }[size];

  const iconSize = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg font-semibold ring-1 ${colorClass} ${sizeClasses}`}
      title={badge.description}
    >
      <Icon className={iconSize} />
      <span>{badge.name}</span>
    </span>
  );
}

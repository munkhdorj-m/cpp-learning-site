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
  const glow = GLOWS[badge.color] ?? GLOWS.violet;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-2.5 py-1.5 text-sm gap-1.5",
    lg: "px-3 py-2 text-base gap-2",
  }[size];

  const iconSize = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-semibold ${sizeClasses}`}
      style={{
        color: glow,
        borderColor: `color-mix(in oklch, ${glow} 38%, transparent)`,
        background: `color-mix(in oklch, ${glow} 12%, transparent)`,
        }}
      title={badge.description}
    >
      <Icon className={iconSize} />
      <span>{badge.name}</span>
    </span>
  );
}

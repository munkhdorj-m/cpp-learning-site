import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  HardDrive,
  Bug,
  HelpCircle,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Verdict } from "@/types/database";

interface VerdictBadgeProps {
  verdict: Verdict;
  label: string;
  size?: "sm" | "md" | "lg";
}

// Each verdict maps to a neon accent; the chip is tinted + ringed in it.
const STYLES: Record<Verdict, { glow: string; Icon: typeof CheckCircle2 }> = {
  pending: { glow: "var(--muted-foreground)", Icon: HelpCircle },
  judging: { glow: "var(--neon-cyan)", Icon: Loader2 },
  accepted: { glow: "var(--neon-lime)", Icon: CheckCircle2 },
  wrong_answer: { glow: "var(--destructive)", Icon: XCircle },
  time_limit_exceeded: { glow: "var(--neon-amber)", Icon: Clock },
  memory_limit_exceeded: { glow: "var(--neon-amber)", Icon: HardDrive },
  runtime_error: { glow: "var(--neon-pink)", Icon: Bug },
  compile_error: { glow: "var(--neon-violet)", Icon: AlertTriangle },
  internal_error: { glow: "var(--muted-foreground)", Icon: AlertTriangle },
};

export function VerdictBadge({ verdict, label, size = "md" }: VerdictBadgeProps) {
  const { glow, Icon } = STYLES[verdict];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };
  const animate = verdict === "judging" ? "animate-spin" : "";
  const accepted = verdict === "accepted";
  return (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} gap-1.5 border font-code font-semibold tracking-wide ${
        accepted ? "text-glow-soft" : ""
      }`}
      style={{
        color: glow,
        borderColor: `color-mix(in oklch, ${glow} 40%, transparent)`,
        background: `color-mix(in oklch, ${glow} 12%, transparent)`,
        boxShadow: accepted ? `0 0 18px -6px ${glow}` : undefined,
      }}
    >
      <Icon className={`h-3.5 w-3.5 ${animate}`} />
      {label}
    </Badge>
  );
}

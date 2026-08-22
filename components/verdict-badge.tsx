import {
  Check,
  X,
  Clock,
  AlertTriangle,
  HardDrive,
  Bug,
  Minus,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Verdict } from "@/types/database";

interface VerdictBadgeProps {
  verdict: Verdict;
  label: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Colour here is a signal, not decoration, and it is always the second thing
 * a student reads — the icon carries the state on its own. That is deliberate:
 * simulated for deuteranopia, the ok green and the failed red come out at
 * 1.24:1, which is to say identical. Around one boy in twelve is affected.
 *
 * Three classes of outcome, because they need three different reactions:
 *   ok    it worked
 *   no    it ran and was wrong — fix the logic
 *   dead  it never ran — fix the syntax, or tell the teacher
 */
const STYLES: Record<
  Verdict,
  { tone: string; Icon: typeof Check }
> = {
  pending: { tone: "var(--amber-dim)", Icon: Minus },
  judging: { tone: "var(--signal-go)", Icon: Loader2 },
  accepted: { tone: "var(--signal-ok)", Icon: Check },
  wrong_answer: { tone: "var(--signal-no)", Icon: X },
  time_limit_exceeded: { tone: "var(--signal-no)", Icon: Clock },
  memory_limit_exceeded: { tone: "var(--signal-no)", Icon: HardDrive },
  runtime_error: { tone: "var(--signal-no)", Icon: Bug },
  compile_error: { tone: "var(--signal-dead)", Icon: AlertTriangle },
  internal_error: { tone: "var(--signal-dead)", Icon: AlertTriangle },
};

export function VerdictBadge({ verdict, label, size = "md" }: VerdictBadgeProps) {
  const { tone, Icon } = STYLES[verdict];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };
  return (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} gap-1.5 rounded-none border font-code font-semibold tracking-wide`}
      style={{
        color: tone,
        borderColor: tone,
        background: "transparent",
      }}
    >
      <Icon
        className={`h-3.5 w-3.5 ${verdict === "judging" ? "animate-spin" : ""}`}
      />
      {label}
    </Badge>
  );
}

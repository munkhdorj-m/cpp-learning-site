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

const STYLES: Record<Verdict, { className: string; Icon: typeof CheckCircle2 }> = {
  pending: {
    className: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
    Icon: HelpCircle,
  },
  judging: {
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    Icon: Loader2,
  },
  accepted: {
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    Icon: CheckCircle2,
  },
  wrong_answer: {
    className: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    Icon: XCircle,
  },
  time_limit_exceeded: {
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    Icon: Clock,
  },
  memory_limit_exceeded: {
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    Icon: HardDrive,
  },
  runtime_error: {
    className: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    Icon: Bug,
  },
  compile_error: {
    className: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    Icon: AlertTriangle,
  },
  internal_error: {
    className: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
    Icon: AlertTriangle,
  },
};

export function VerdictBadge({ verdict, label, size = "md" }: VerdictBadgeProps) {
  const { className, Icon } = STYLES[verdict];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };
  const animate = verdict === "judging" ? "animate-spin" : "";
  return (
    <Badge
      variant="outline"
      className={`${className} ${sizeClasses[size]} gap-1.5 border-0 font-medium`}
    >
      <Icon className={`h-3.5 w-3.5 ${animate}`} />
      {label}
    </Badge>
  );
}

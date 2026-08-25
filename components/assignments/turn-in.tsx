"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Send, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  turnInAssignment,
  undoTurnInAssignment,
} from "@/app/actions/assignment-work";

/**
 * "I am done with this."
 *
 * The one thing the assignment page was missing: the judge could fill a
 * progress bar, and a task could take a file, but a student had no way to say
 * they had finished the assignment itself — so a teacher had no way to tell
 * "not started" from "finished, nothing to upload".
 *
 * Turning in does not mark anything and does not lock the work. It records the
 * claim and the time, and it can be taken back while the assignment is open.
 */
export function TurnIn({
  assignmentId,
  turnedInAt,
  late,
  open,
  closed,
}: {
  assignmentId: string;
  /** ISO time, or null when they have not turned it in. */
  turnedInAt: string | null;
  late: boolean;
  /** Accepting work right now (started, and not past a hard deadline). */
  open: boolean;
  /** Past the deadline with late work refused. */
  closed: boolean;
}) {
  const t = useTranslations("assignments");
  const [pending, start] = useTransition();

  const act = (fn: () => Promise<{ error?: string; ok?: true }>, done: string) =>
    start(async () => {
      const res = await fn();
      if (res?.error) toast.error(res.error);
      else toast.success(done);
    });

  if (turnedInAt) {
    return (
      <Card className="border-signal-ok/40 bg-signal-ok/[0.06]">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-signal-ok" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-signal-ok">
              {t("turned_in")}
              {late && (
                <span className="ml-2 font-code text-[11px] text-neon-amber">
                  {t("late")}
                </span>
              )}
            </div>
            <div className="font-code text-xs text-muted-foreground">
              {new Date(turnedInAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          {!closed && (
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() =>
                act(() => undoTurnInAssignment(assignmentId), t("taken_back"))
              }
            >
              <Undo2 className="mr-1.5 h-3.5 w-3.5" />
              {t("unsubmit")}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!open) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {closed ? t("closed_no_turn_in") : t("not_open_yet")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{t("ready_to_turn_in")}</div>
          <div className="text-xs text-muted-foreground">
            {t("turn_in_hint")}
          </div>
        </div>
        <Button
          disabled={pending}
          onClick={() =>
            act(() => turnInAssignment(assignmentId), t("turned_in"))
          }
        >
          <Send className="mr-1.5 h-4 w-4" />
          {pending ? "…" : t("turn_in")}
        </Button>
      </CardContent>
    </Card>
  );
}

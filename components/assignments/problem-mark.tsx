"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { setProblemMark } from "@/app/actions/assignment-work";

/**
 * One coding problem, and the teacher's right to disagree with the judge.
 *
 * The judge is correct almost always: it ran the tests. It is wrong in exactly
 * the case a teacher cares most about — work that was copied or produced by an
 * AI passes the tests perfectly. Before this there was nothing to do about
 * that; the points were automatic and final.
 *
 * Empty means "leave it to the judge", which is the normal state and why the
 * box starts blank rather than pre-filled with the automatic figure. Typing a
 * number overrides it; the arrow puts the judge back in charge.
 */
export function ProblemMark({
  assignmentId,
  userId,
  problemId,
  title,
  autoPoints,
  maxPoints,
  mark,
  autoLabel,
}: {
  assignmentId: string;
  userId: string;
  problemId: string;
  title: string;
  /** What the judge decided: full points if accepted, otherwise zero. */
  autoPoints: number;
  maxPoints: number;
  mark: { points: number; note: string | null } | null;
  autoLabel: string;
}) {
  const [points, setPoints] = useState(mark ? String(mark.points) : "");
  const [note, setNote] = useState(mark?.note ?? "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const send = (nextPoints: string, nextNote: string) =>
    start(async () => {
      const res = await setProblemMark({
        assignmentId,
        userId,
        problemId,
        points: nextPoints.trim() === "" ? null : Number(nextPoints),
        note: nextNote,
      });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setSaved(true);
    });

  const overridden = points.trim() !== "";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border p-2",
        overridden ? "border-neon-amber/40 bg-neon-amber/[0.06]" : "border-border",
      )}
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>

      <span className="shrink-0 font-code text-[11px] text-muted-foreground">
        {autoLabel} {autoPoints}/{maxPoints}
      </span>

      <Input
        type="number"
        min={0}
        max={10000}
        value={points}
        onChange={(e) => {
          setPoints(e.target.value);
          setSaved(false);
        }}
        placeholder="—"
        aria-label={`Override the points for ${title}`}
        className="h-8 w-20 text-center font-code"
      />

      <Input
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        placeholder="Why? (the student sees this)"
        aria-label={`Reason for changing the points on ${title}`}
        className="h-8 min-w-[160px] flex-1"
      />

      <Button
        type="button"
        size="sm"
        variant={overridden ? "default" : "outline"}
        disabled={pending}
        onClick={() => send(points, note)}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : (
          "Save"
        )}
      </Button>

      {mark && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          title="Put the judge back in charge"
          onClick={() => {
            setPoints("");
            setNote("");
            send("", "");
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

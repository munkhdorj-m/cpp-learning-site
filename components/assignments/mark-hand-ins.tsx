"use client";

import { useState, useTransition } from "react";
import { Check, Link2, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markHandIn } from "@/app/actions/assignment-work";

/**
 * What a class handed in for one task, and the box to mark it in.
 *
 * Everyone who has handed in is listed, not just the unmarked ones: a teacher
 * going through a pile wants to see what they have already given as much as
 * what is left, and switching views to check a mark is how marks get given
 * twice.
 */

export interface HandInRow {
  submission_id: string;
  student_name: string;
  submitted_at: string;
  late: boolean;
  note: string | null;
  link: string | null;
  upload_id: string | null;
  upload_name: string | null;
  score: number | null;
  feedback: string | null;
}

export interface TaskWithHandIns {
  id: string;
  title: string;
  points: number;
  /** Students in the class who have handed nothing in. */
  missing: string[];
  handIns: HandInRow[];
}

export function OneHandIn({ row, points }: { row: HandInRow; points: number }) {
  const [score, setScore] = useState(row.score?.toString() ?? "");
  const [feedback, setFeedback] = useState(row.feedback ?? "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(row.score !== null);

  const save = () =>
    start(async () => {
      const res = await markHandIn(row.submission_id, {
        score: score.trim() === "" ? null : Number(score),
        feedback,
      });
      if (res?.error) toast.error(res.error);
      else {
        setSaved(true);
        toast.success(`Marked ${row.student_name}.`);
      }
    });

  return (
    <div className="space-y-2 rounded-lg border border-primary/15 p-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-semibold">{row.student_name}</span>
        {row.late && (
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-500">
            LATE
          </span>
        )}
        <span className="ml-auto font-code text-[11px] text-muted-foreground">
          {new Date(row.submitted_at).toLocaleString(undefined, {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      </div>

      {row.upload_id && (
        <a
          href={`/api/uploads/${row.upload_id}`}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Paperclip className="h-3.5 w-3.5" />
          {row.upload_name}
        </a>
      )}
      {row.link && (
        <a
          href={row.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 truncate text-sm text-primary hover:underline"
        >
          <Link2 className="h-3.5 w-3.5 shrink-0" />
          {row.link}
        </a>
      )}
      {row.note && (
        <p className="whitespace-pre-wrap rounded border border-primary/10 bg-background/40 p-2 text-sm">
          {row.note}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="number"
          min={0}
          max={points}
          value={score}
          onChange={(e) => {
            setScore(e.target.value);
            setSaved(false);
          }}
          placeholder="—"
          aria-label={`Score for ${row.student_name}, out of ${points}`}
          className="h-9 w-20 text-center font-code"
        />
        <span className="font-code text-xs text-muted-foreground">
          / {points}
        </span>
        <Input
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            setSaved(false);
          }}
          placeholder="Feedback (optional)"
          aria-label={`Feedback for ${row.student_name}`}
          className="h-9 min-w-[180px] flex-1"
        />
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}

export function MarkHandIns({ tasks }: { tasks: TaskWithHandIns[] }) {
  if (!tasks.length) return null;

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="space-y-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="font-semibold">{task.title}</h3>
            <span className="font-code text-xs text-muted-foreground">
              {task.handIns.length} handed in
              {task.missing.length > 0 && `, ${task.missing.length} not yet`}
            </span>
          </div>

          {task.handIns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nobody has handed this in yet.
            </p>
          ) : (
            task.handIns.map((row) => (
              <OneHandIn key={row.submission_id} row={row} points={task.points} />
            ))
          )}

          {task.missing.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Waiting on: {task.missing.join(", ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Minus,
  Paperclip,
  Search,
  XCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OneHandIn, type HandInRow } from "./mark-hand-ins";
import { ProblemMark } from "./problem-mark";

/**
 * One row per student, and their whole assignment behind it.
 *
 * The grid of ticks answers "who has done the problems". It could never answer
 * "what did this student actually hand me" — that lived in a separate list at
 * the bottom of the page, grouped by task, so finding one student's work meant
 * scrolling past everyone else's and reading names. With a class of forty that
 * is not a list, it is a search.
 *
 * So the student is the row, and their work opens underneath it: every task,
 * what they handed in, and the box to mark it, without leaving the table.
 */

export interface ProblemColumn {
  problem_id: string;
  points: number;
  slug: string | null;
  title: string;
}

export type CellStatus = "accepted" | "attempted" | "none";

export interface StudentWork {
  task_id: string;
  task_title: string;
  task_points: number;
  /** null when this student has handed nothing in for that task. */
  row: HandInRow | null;
}

export interface StudentRow {
  id: string;
  display_name: string;
  username: string;
  turned_in_at: string | null;
  turned_in_late: boolean;
  work: StudentWork[];
  /**
   * Teacher overrides on the judge's marking, keyed by problem id. Absent
   * means the automatic points stand.
   */
  marks: Record<string, { points: number; note: string | null }>;
}

export interface Labels {
  assignmentId: string;
  problemsHeading: string;
  autoPoints: string;
  overrideHint: string;
  student: string;
  total: string;
  turnedIn: string;
  late: string;
  search: string;
  noMatch: string;
  handedIn: string;
  notHandedIn: string;
  nothingToHandIn: string;
  marked: string;
}

export function ClassWorkTable({
  students,
  problems,
  status,
  labels,
}: {
  students: StudentRow[];
  problems: ProblemColumn[];
  status: Record<string, Record<string, CellStatus>>;
  labels: Labels;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return students;
    return students.filter(
      (s) =>
        s.display_name.toLowerCase().includes(needle) ||
        s.username.toLowerCase().includes(needle),
    );
  }, [students, search]);

  const anyTasks = students.some((s) => s.work.length > 0);
  // Problems + a hand-ins column when there are tasks + turned-in + total.
  const cols = problems.length + (anyTasks ? 1 : 0) + 3;

  return (
    <div className="space-y-2">
      {/* Forty names is a scroll, not a list. */}
      {students.length > 12 && (
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
            className="h-9 pl-8"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="sticky left-0 z-10 bg-card p-3 text-left">
                {labels.student}
              </th>
              {problems.map((p) => (
                <th key={p.problem_id} className="p-3 text-center font-normal">
                  <Link
                    href={p.slug ? `/problems/${p.slug}` : "#"}
                    className="font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-0.5 text-[10px] font-normal text-muted-foreground">
                    {p.points} pt
                  </div>
                </th>
              ))}
              {anyTasks && (
                <th className="p-3 text-center font-normal">
                  <span className="font-semibold">{labels.handedIn}</span>
                </th>
              )}
              <th className="p-3 text-center font-normal">
                <span className="font-semibold">{labels.turnedIn}</span>
              </th>
              <th className="p-3 text-right">{labels.total}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {shown.length === 0 ? (
              <tr>
                <td colSpan={cols} className="py-8 text-center text-muted-foreground">
                  {labels.noMatch}
                </td>
              </tr>
            ) : (
              shown.map((s) => {
                const expanded = open === s.id;
                let total = 0;
                for (const p of problems) {
                  // A teacher's override replaces the judge's answer, whether
                  // that raises the mark or zeroes it.
                  const mark = s.marks[p.problem_id];
                  if (mark) total += Number(mark.points);
                  else if (status[s.id]?.[p.problem_id] === "accepted") {
                    total += p.points;
                  }
                }
                // A marked hand-in adds to the same total the problems feed,
                // so the number in the last column is the whole assignment.
                for (const w of s.work) {
                  if (w.row?.score != null) total += Number(w.row.score);
                }

                const handed = s.work.filter((w) => w.row).length;
                const marked = s.work.filter((w) => w.row?.score != null).length;

                return (
                  <Fragment key={s.id}>
                    <tr
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        expanded && "bg-muted/40",
                      )}
                      onClick={() => setOpen(expanded ? null : s.id)}
                      aria-expanded={expanded}
                    >
                      <td className="sticky left-0 z-10 bg-card p-3">
                        <div className="flex items-center gap-1.5">
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                              expanded && "rotate-90",
                            )}
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <div className="max-w-[180px] truncate font-medium">
                              {s.display_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{s.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {problems.map((p) => {
                        const cell = status[s.id]?.[p.problem_id] ?? "none";
                        const mark = s.marks[p.problem_id];
                        if (mark) {
                          return (
                            <td key={p.problem_id} className="p-3 text-center">
                              <span
                                className="font-code text-xs font-bold text-neon-amber"
                                title={mark.note ?? undefined}
                              >
                                {mark.points}
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={p.problem_id} className="p-3 text-center">
                            {cell === "accepted" && (
                              <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                            )}
                            {cell === "attempted" && (
                              <XCircle className="mx-auto h-5 w-5 text-rose-500" />
                            )}
                            {cell === "none" && (
                              <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                            )}
                          </td>
                        );
                      })}

                      {anyTasks && (
                        <td className="p-3 text-center">
                          {handed === 0 ? (
                            <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                          ) : (
                            <span className="inline-flex items-center gap-1 font-code text-xs tabular-nums">
                              <Paperclip className="h-3 w-3 text-primary" />
                              {handed}/{s.work.length}
                              {marked > 0 && (
                                <span className="text-muted-foreground">
                                  ({marked} {labels.marked})
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                      )}

                      <td className="p-3 text-center">
                        {s.turned_in_at ? (
                          <span
                            className="inline-flex flex-col items-center"
                            title={new Date(s.turned_in_at).toLocaleString()}
                          >
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            {s.turned_in_late && (
                              <span className="font-code text-[9px] text-neon-amber">
                                {labels.late}
                              </span>
                            )}
                          </span>
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </td>

                      <td className="p-3 text-right font-semibold tabular-nums">
                        {total}
                      </td>
                    </tr>

                    {expanded && (
                      <tr className="bg-muted/20">
                        <td colSpan={cols} className="space-y-4 p-3">
                          {problems.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="hud-label">
                                {labels.problemsHeading}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {labels.overrideHint}
                              </p>
                              {problems.map((p) => (
                                <ProblemMark
                                  key={p.problem_id}
                                  assignmentId={labels.assignmentId}
                                  userId={s.id}
                                  problemId={p.problem_id}
                                  title={p.title}
                                  autoPoints={
                                    status[s.id]?.[p.problem_id] === "accepted"
                                      ? p.points
                                      : 0
                                  }
                                  maxPoints={p.points}
                                  mark={s.marks[p.problem_id] ?? null}
                                  autoLabel={labels.autoPoints}
                                />
                              ))}
                            </div>
                          )}

                          {s.work.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {labels.nothingToHandIn}
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {s.work.map((w) => (
                                <div key={w.task_id} className="space-y-1.5">
                                  <div className="flex flex-wrap items-baseline gap-2">
                                    <span className="font-semibold">
                                      {w.task_title}
                                    </span>
                                    <span className="font-code text-[11px] text-muted-foreground">
                                      / {w.task_points}
                                    </span>
                                  </div>
                                  {w.row ? (
                                    <OneHandIn row={w.row} points={w.task_points} />
                                  ) : (
                                    <p className="text-sm text-muted-foreground">
                                      {labels.notHandedIn}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

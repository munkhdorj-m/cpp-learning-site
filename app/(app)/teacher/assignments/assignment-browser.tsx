"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Calendar,
  Search,
  Users,
  FileText,
  Paperclip,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * The teacher's assignment list, once there are more than a screenful.
 *
 * A flat list sorted by due date works for the first term and then stops: by
 * the end of a year there are a hundred rows and the three that matter — the
 * ones due this week, and the pile nobody has handed in — are somewhere in the
 * middle of it.
 *
 * So: grouped by when, filtered by class, searchable, and every row says what
 * is actually in the assignment and how much of it is marked.
 */

export interface AssignmentRow {
  id: string;
  title: string;
  class_id: string;
  class_name: string;
  start_at: string;
  due_at: string;
  problems: number;
  materials: number;
  tasks: number;
  /** Hand-ins waiting for a mark across all of this assignment's tasks. */
  unmarked: number;
}

type Bucket = "overdue" | "week" | "later" | "upcoming" | "past";

/** Message keys under teacher.assignments.browse. */
const BUCKET_KEY: Record<Bucket, string> = {
  overdue: "bucket_overdue",
  week: "bucket_week",
  later: "bucket_later",
  upcoming: "bucket_upcoming",
  past: "bucket_past",
};

/**
 * Which pile an assignment belongs in.
 *
 * "Closed recently" is deliberately its own bucket and sits at the top: an
 * assignment whose deadline just passed is the one a teacher is about to mark,
 * and in a list sorted by date it is the easiest one to lose.
 */
function bucketFor(a: AssignmentRow, now: number): Bucket {
  const start = new Date(a.start_at).getTime();
  const due = new Date(a.due_at).getTime();
  const day = 24 * 60 * 60 * 1000;

  if (now < start) return "upcoming";
  if (due < now) return now - due <= 14 * day ? "overdue" : "past";
  return due - now <= 7 * day ? "week" : "later";
}

const ORDER: Bucket[] = ["overdue", "week", "later", "upcoming", "past"];

export function AssignmentBrowser({ rows }: { rows: AssignmentRow[] }) {
  const t = useTranslations("teacher.assignments.browse");
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState<string>("all");
  const [onlyUnmarked, setOnlyUnmarked] = useState(false);

  const classes = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) seen.set(r.class_id, r.class_name);
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const totalUnmarked = rows.reduce((n, r) => n + r.unmarked, 0);

  const grouped = useMemo(() => {
    const now = Date.now();
    const needle = search.trim().toLowerCase();
    const kept = rows.filter((r) => {
      if (classId !== "all" && r.class_id !== classId) return false;
      if (onlyUnmarked && r.unmarked === 0) return false;
      if (needle && !r.title.toLowerCase().includes(needle)) return false;
      return true;
    });

    const buckets = new Map<Bucket, AssignmentRow[]>();
    for (const r of kept) {
      const b = bucketFor(r, now);
      if (!buckets.has(b)) buckets.set(b, []);
      buckets.get(b)!.push(r);
    }
    // Inside a bucket, soonest deadline first — except the past, where the
    // most recent is the interesting end.
    for (const [b, list] of buckets) {
      list.sort((x, y) => {
        const dx = new Date(x.due_at).getTime();
        const dy = new Date(y.due_at).getTime();
        return b === "past" || b === "overdue" ? dy - dx : dx - dy;
      });
    }
    return ORDER.filter((b) => buckets.has(b)).map(
      (b) => [b, buckets.get(b)!] as const,
    );
  }, [rows, search, classId, onlyUnmarked]);

  const shown = grouped.reduce((n, [, list]) => n + list.length, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="h-9 pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setClassId("all")}
            aria-pressed={classId === "all"}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              classId === "all"
                ? "border-primary bg-primary/15 text-primary"
                : "border-primary/20 text-muted-foreground hover:text-foreground",
            )}
          >
            {t("all_classes")}
          </button>
          {classes.map(([id, name]) => (
            <button
              key={id}
              type="button"
              onClick={() => setClassId(id)}
              aria-pressed={classId === id}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                classId === id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-primary/20 text-muted-foreground hover:text-foreground",
              )}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Only offered when there is something to mark — a filter that can
            only ever empty the list is just a way to lose your work. */}
        {totalUnmarked > 0 && (
          <button
            type="button"
            onClick={() => setOnlyUnmarked((v) => !v)}
            aria-pressed={onlyUnmarked}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
              onlyUnmarked
                ? "border-neon-amber bg-neon-amber/15 text-neon-amber"
                : "border-neon-amber/40 text-neon-amber/80 hover:text-neon-amber",
            )}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {totalUnmarked} {t("to_mark")}
          </button>
        )}
      </div>

      {shown === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("no_match")}
          </p>
        </Card>
      ) : (
        grouped.map(([bucket, list]) => (
          <div key={bucket} className="space-y-1.5">
            <div className="hud-label flex items-center gap-2 pt-1">
              {t(BUCKET_KEY[bucket])}
              <span className="font-code text-[10px] font-normal opacity-60 tabular-nums">
                {list.length}
              </span>
            </div>
            {list.map((a) => (
              <Link key={a.id} href={`/teacher/assignments/${a.id}`}>
                <Card className="hud-hover py-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{a.title}</div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {a.class_name}
                        </span>
                        {a.problems > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {a.problems}{" "}
                            {a.problems === 1 ? t("problem_1") : t("problems_n")}
                          </span>
                        )}
                        {a.tasks > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <ClipboardList className="h-3 w-3" />
                            {a.tasks}{" "}
                            {a.tasks === 1 ? t("task_1") : t("tasks_n")}
                          </span>
                        )}
                        {a.materials > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            {a.materials}
                          </span>
                        )}
                      </div>
                    </div>

                    {a.unmarked > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-neon-amber/15 px-2 py-0.5 font-code text-[11px] font-semibold text-neon-amber">
                        {a.unmarked} {t("to_mark")}
                      </span>
                    )}

                    <span className="inline-flex shrink-0 items-center gap-1.5 font-code text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(a.due_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

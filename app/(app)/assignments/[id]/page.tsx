import Link from "next/link";

import { MaterialList } from "@/components/assignments/material-list";
import { HandIn } from "@/components/assignments/hand-in";
import { TurnIn } from "@/components/assignments/turn-in";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-helpers";
import { query } from "@/lib/mysql/pool";
import { hasTable } from "@/lib/mysql/has-table";
import { applyLatePenalty, isLate } from "@/lib/assignments";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // personal + class-scoped
  await requireAuth();

  const { id } = await params;
  const t = await getTranslations();
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, description, start_at, due_at, allow_late, late_penalty_pct")
    .eq("id", id)
    .maybeSingle();
  if (!assignment) notFound();

  const { data: links } = await supabase
    .from("assignment_problems")
    .select("problem_id, points, order_idx")
    .eq("assignment_id", id)
    .order("order_idx", { ascending: true });

  const [{ data: materialRows }, { data: taskRows }] = await Promise.all([
    supabase
      .from("assignment_materials")
      .select("id, kind, title, url, upload_id, order_idx")
      .eq("assignment_id", id)
      .order("order_idx", { ascending: true }),
    supabase
      .from("assignment_tasks")
      .select(
        "id, title, instructions, points, accept_file, accept_link, accept_text, accept_ide, starter_files, order_idx",
      )
      .eq("assignment_id", id)
      .order("order_idx", { ascending: true }),
  ]);

  // The size of a material's file, for the list. One query, not one per row.
  const uploadIds = (materialRows ?? [])
    .map((m: { upload_id: string | null }) => m.upload_id)
    .filter((v: string | null): v is string => !!v);
  const { data: uploadRows } = uploadIds.length
    ? await supabase.from("uploads").select("id, mime, bytes").in("id", uploadIds)
    : { data: [] };
  const uploadById = new Map<string, { mime: string; bytes: number }>(
    (uploadRows ?? []).map((u: { id: string; mime: string; bytes: number }) => [
      u.id,
      { mime: u.mime, bytes: u.bytes },
    ]),
  );

  const materials = (materialRows ?? []).map(
    (m: {
      id: string;
      kind: "link" | "file";
      title: string;
      url: string | null;
      upload_id: string | null;
    }) => ({
      id: m.id,
      kind: m.kind,
      title: m.title,
      url: m.url,
      upload_id: m.upload_id,
      mime: m.upload_id ? (uploadById.get(m.upload_id)?.mime ?? null) : null,
      bytes: m.upload_id ? (uploadById.get(m.upload_id)?.bytes ?? null) : null,
    }),
  );

  const taskIds = (taskRows ?? []).map((t: { id: string }) => t.id);
  const { data: mineRows } = taskIds.length
    ? await supabase
        .from("task_submissions")
        .select(
          "task_id, note, link, upload_id, ide_project_id, submitted_at, score, feedback",
        )
        .eq("user_id", user.id)
        .in("task_id", taskIds)
    : { data: [] };
  const mineByTask = new Map<string, Record<string, unknown>>(
    (mineRows ?? []).map((r: { task_id: string }) => [r.task_id, r]),
  );
  const mineUploadIds = (mineRows ?? [])
    .map((r: { upload_id: string | null }) => r.upload_id)
    .filter((v: string | null): v is string => !!v);
  const { data: mineUploads } = mineUploadIds.length
    ? await supabase
        .from("uploads")
        .select("id, original_name")
        .in("id", mineUploadIds)
    : { data: [] };
  const mineUploadName = new Map<string, string>(
    (mineUploads ?? []).map((u: { id: string; original_name: string }) => [
      u.id,
      u.original_name,
    ]),
  );

  const problemIds = (links ?? []).map((l) => l.problem_id);
  const { data: problems } = problemIds.length
    ? await supabase
        .from("problems")
        .select("id, slug, title_mn, title_en, difficulty")
        .in("id", problemIds)
    : { data: [] as { id: string; slug: string; title_mn: string; title_en: string | null; difficulty: "easy" | "medium" | "hard" }[] };
  const problemById = new Map((problems ?? []).map((p) => [p.id, p]));

  const solvedSet = new Set<string>();
  if (problemIds.length > 0) {
    const { data: mySubs } = await supabase
      .from("submissions")
      .select("problem_id")
      .eq("user_id", user.id)
      .eq("verdict", "accepted")
      .eq("is_first_accepted", true)
      // Scoped to THIS assignment. A problem the student solved as practice
      // does not tick off their homework, and vice versa.
      .eq("assignment_id", id)
      .in("problem_id", problemIds);
    for (const s of mySubs ?? []) solvedSet.add(s.problem_id);
  }

  // A teacher can overrule the judge on a problem — for copied or AI-written
  // work, or to credit a good attempt. The student sees the number and the
  // reason, because a mark they cannot see the cause of is just a mystery.
  const myMarks = new Map<string, { points: number; note: string | null }>();
  if (problemIds.length > 0 && (await hasTable("assignment_problem_marks"))) {
    const rows = await query<{
      problem_id: string;
      points: number;
      note: string | null;
    }>(
      `SELECT problem_id, points, note
         FROM assignment_problem_marks
        WHERE assignment_id = ? AND user_id = ?`,
      [id, user.id],
    );
    for (const r of rows) {
      myMarks.set(r.problem_id, { points: Number(r.points), note: r.note });
    }
  }

  const totalProblems = (links ?? []).length;
  const solvedCount = (links ?? []).filter((l) =>
    solvedSet.has(l.problem_id),
  ).length;

  // Work, as the student sees it: a problem the judge accepted and a task
  // they handed in both count as one thing done. Kept in step with the same
  // sum on the list page (lib/assignments.ts).
  const totalTasks = (taskRows ?? []).length;
  const handedIn = mineByTask.size;
  const totalWork = totalProblems + totalTasks;
  const doneWork = solvedCount + handedIn;

  // Points, likewise, are points wherever the teacher put them. Counting only
  // the judge problems meant an assignment made of one task worth 100 totalled
  // zero — so the student saw no points at all, and a mark of 100/100 never
  // showed up anywhere they looked.
  const taskPoints = (taskRows ?? []).reduce(
    (sum: number, t: { points: number }) => sum + Number(t.points),
    0,
  );
  // A hand-in with no score is waiting to be marked, which is not zero earned.
  const taskEarned = (taskRows ?? []).reduce((sum: number, t: { id: string }) => {
    const mine = mineByTask.get(t.id) as { score: number | null } | undefined;
    return sum + (mine?.score != null ? Number(mine.score) : 0);
  }, 0);

  const totalPoints =
    (links ?? []).reduce((sum, l) => sum + l.points, 0) + taskPoints;
  const rawEarned =
    (links ?? []).reduce((sum, l) => {
      const mark = myMarks.get(l.problem_id);
      if (mark) return sum + mark.points;
      return sum + (solvedSet.has(l.problem_id) ? l.points : 0);
    }, 0) + taskEarned;

  const now = Date.now();
  const start = new Date(assignment.start_at).getTime();
  const due = new Date(assignment.due_at).getTime();
  const status = now < start ? "upcoming" : now > due ? "past" : "live";

  // Applied by hand on the server, so the page has to cope with the table not
  // being there yet — see lib/mysql/has-table.ts.
  let turnedInAt: string | null = null;
  let turnedInLate = false;
  if (await hasTable("assignment_turnins")) {
    const mine = await query<{ turned_in_at: string; late: number }>(
      `SELECT turned_in_at, late
         FROM assignment_turnins
        WHERE assignment_id = ? AND user_id = ?`,
      [id, user.id],
    );
    if (mine[0]) {
      turnedInAt = String(mine[0].turned_in_at);
      turnedInLate = !!mine[0].late;
    }
  }

  // The late penalty. It has been stored on every assignment since assignments
  // existed, shown to students as "-50%", and applied to nothing at all — a
  // student a week late scored the same as one who was on time.
  const lateNow = isLate(
    {
      dueAt: assignment.due_at,
      turnedInAt: turnedInAt,
      turnedInLate: turnedInLate,
    },
    now,
  );
  const penaltyPct = Number(assignment.late_penalty_pct ?? 0);
  const earned = applyLatePenalty(rawEarned, penaltyPct, lateNow);
  const penaltyLost = rawEarned - earned;

  const acceptingWork =
    status !== "upcoming" && (status !== "past" || !!assignment.allow_late);
  const hardClosed = status === "past" && !assignment.allow_late;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/assignments"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3 text-sm">
          <StatusPill status={status} label={t(`assignments.status_${status === "live" ? "active" : status}`)} />
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {t("assignments.due")}{" "}
            {new Date(assignment.due_at).toLocaleString(locale, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {status === "past" && !assignment.allow_late && (
            <span className="text-xs font-medium text-destructive">
              {t("assignments.closed")}
            </span>
          )}
          {status === "past" && assignment.allow_late && (
            <span className="text-xs font-medium text-neon-amber">
              {t("assignments.late_penalty", {
                pct: assignment.late_penalty_pct,
              })}
            </span>
          )}
        </CardContent>
      </Card>

      <TurnIn
        assignmentId={assignment.id}
        turnedInAt={turnedInAt}
        late={turnedInLate}
        open={acceptingWork}
        closed={hardClosed}
      />

      {assignment.description && (
        <Card>
          <CardContent className="p-4">
            <Markdown>{assignment.description}</Markdown>
          </CardContent>
        </Card>
      )}

      {/* Only when there is something to count. This used to render for every
          assignment, so one made of a worksheet and nothing else showed
          "0 / 0 · 0 / 0 pts" — four counts of nothing, and no clue what any of
          the four were. Hand-in tasks count toward "done" here, the same as
          they do on the list, or an assignment made only of tasks showed an
          empty bar however much work had been handed in. */}
      {totalWork > 0 && (
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 text-sm">
                <span className="font-semibold">{t("assignments.progress")}</span>
                <span className="tabular-nums text-muted-foreground">
                  {t("assignments.done_count", {
                    done: doneWork,
                    total: totalWork,
                  })}
                  {totalPoints > 0 && (
                    <>
                      {" · "}
                      {t("assignments.points_count", {
                        earned,
                        total: totalPoints,
                      })}
                      {/* A student seeing 50/100 after earning 100 deserves to
                          be told why, next to the number, not in a banner
                          somewhere above it. */}
                      {penaltyLost > 0 && (
                        <span className="ml-1 text-neon-amber">
                          {t("assignments.penalty_applied", {
                            pct: penaltyPct,
                            lost: penaltyLost,
                          })}
                        </span>
                      )}
                    </>
                  )}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    doneWork >= totalWork
                      ? "h-full bg-signal-ok transition-all"
                      : "h-full bg-primary transition-all"
                  }
                  style={{ width: `${(doneWork / totalWork) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {materials.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("assignments.materials")}
          </div>
          <div className="p-3">
            <MaterialList materials={materials} />
          </div>
        </Card>
      )}

      {(links ?? []).length > 0 && (
      <Card className="overflow-hidden p-0">
        <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("teacher.assignments.field.problems")}
        </div>
        <div className="divide-y">
          {(links ?? []).map((link, i) => {
            const p = problemById.get(link.problem_id);
            if (!p) return null;
            const solved = solvedSet.has(p.id);
            const title = locale === "en" && p.title_en ? p.title_en : p.title_mn;
            const diffStyle =
              p.difficulty === "easy"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : p.difficulty === "medium"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
            return (
              <Link
                key={p.id}
                // Carries the track, so the solve counts as homework and is
                // worth the points set for it rather than the problem's own XP.
                href={`/problems/${p.slug}?assignment=${id}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 transition-colors",
                  solved
                    ? "bg-emerald-50/60 dark:bg-emerald-950/15 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/30"
                    : "hover:bg-muted/40",
                )}
              >
                <span className="text-xs text-muted-foreground tabular-nums w-6 text-right shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="shrink-0">
                  {solved ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </span>
                <span
                  className={cn(
                    "flex-1 truncate font-medium",
                    solved && "text-emerald-900 dark:text-emerald-200",
                  )}
                >
                  {title}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ${diffStyle}`}>
                  {t(`problems.difficulty.${p.difficulty}`)}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 font-code text-xs font-semibold tabular-nums text-arcade-yellow">
                  <Sparkles className="h-3 w-3" />
                  {(() => {
                    const mark = myMarks.get(p.id);
                    if (!mark) return link.points;
                    return (
                      <span
                        className="text-neon-amber"
                        title={mark.note ?? undefined}
                      >
                        {mark.points} / {link.points}
                      </span>
                    );
                  })()}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
        </div>
      </Card>
      )}

      {(taskRows ?? []).length > 0 && (
        <div className="space-y-3">
          <div className="hud-label flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            {t("assignments.work_to_hand_in")}
          </div>
          {(taskRows ?? []).map(
            (t: {
              id: string;
              title: string;
              instructions: string | null;
              points: number;
              accept_file: number | boolean;
              accept_link: number | boolean;
              accept_text: number | boolean;
              accept_ide: number | boolean;
              starter_files: string | null;
            }) => {
              const mine = mineByTask.get(t.id) as
                | {
                    note: string | null;
                    link: string | null;
                    upload_id: string | null;
                    ide_project_id: string | null;
                    submitted_at: string;
                    score: number | null;
                    feedback: string | null;
                  }
                | undefined;
              return (
                <HandIn
                  key={t.id}
                  open={acceptingWork}
                  task={{
                    id: t.id,
                    title: t.title,
                    instructions: t.instructions,
                    points: t.points,
                    accept_file: !!t.accept_file,
                    accept_link: !!t.accept_link,
                    accept_text: !!t.accept_text,
                    accept_ide: !!t.accept_ide,
                    has_starter: !!t.starter_files,
                    mine: mine
                      ? {
                          ...mine,
                          upload_name: mine.upload_id
                            ? (mineUploadName.get(mine.upload_id) ?? "file")
                            : null,
                          submitted_at: String(mine.submitted_at),
                        }
                      : null,
                  }}
                />
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({
  status,
  label,
}: {
  status: "live" | "upcoming" | "past";
  label: string;
}) {
  const styles = {
    live: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    upcoming: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    past: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status === "live" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      )}
      {label}
    </span>
  );
}

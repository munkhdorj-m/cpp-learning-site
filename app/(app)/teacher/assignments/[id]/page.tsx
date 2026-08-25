import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { ArrowLeft, CheckCircle2, XCircle, Minus, Calendar } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { query } from "@/lib/mysql/pool";
import { hasTable } from "@/lib/mysql/has-table";
import { createServiceClient } from "@/lib/supabase/server";
import {
  MarkHandIns,
  type TaskWithHandIns,
} from "@/components/assignments/mark-hand-ins";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { AssignmentActions } from "./assignment-actions";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The layout calls this too, but a layout's redirect does not stop
  // this page rendering: React renders them together, and whatever the
  // page produced is flushed into the redirect response for anyone who
  // reads the body instead of following the Location header.
  await requireTeacher();

  const { id } = await params;
  const tGrading = await getTranslations("teacher.assignments.grading");
  const tAssign = await getTranslations("assignments");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = createServiceClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!assignment) notFound();

  const [classRes, problemLinksRes, studentsRes] = await Promise.all([
    supabase.from("classes").select("name").eq("id", assignment.class_id).single(),
    supabase
      .from("assignment_problems")
      .select("problem_id, points, order_idx")
      .eq("assignment_id", id)
      .order("order_idx", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("class_id", assignment.class_id)
      .eq("role", "student")
      .order("display_name", { ascending: true }),
  ]);

  const problemLinks = problemLinksRes.data ?? [];
  const students = studentsRes.data ?? [];
  const nameById = new Map<string, string>(
    students.map((s: { id: string; display_name: string | null; username: string }) => [
      s.id,
      s.display_name || s.username,
    ]),
  );

  const { data: taskRows } = await supabase
    .from("assignment_tasks")
    .select("id, title, points, order_idx")
    .eq("assignment_id", id)
    .order("order_idx", { ascending: true });

  const taskIds = (taskRows ?? []).map((t: { id: string }) => t.id);
  const { data: handInRows } = taskIds.length
    ? await supabase
        .from("task_submissions")
        .select(
          "id, task_id, user_id, note, link, upload_id, submitted_at, score, feedback",
        )
        .in("task_id", taskIds)
    : { data: [] };

  const handInUploadIds = (handInRows ?? [])
    .map((r: { upload_id: string | null }) => r.upload_id)
    .filter((v: string | null): v is string => !!v);
  const { data: handInUploads } = handInUploadIds.length
    ? await supabase
        .from("uploads")
        .select("id, original_name")
        .in("id", handInUploadIds)
    : { data: [] };
  const uploadName = new Map<string, string>(
    (handInUploads ?? []).map((u: { id: string; original_name: string }) => [
      u.id,
      u.original_name,
    ]),
  );

  // Who says they are finished. Applied by hand on the server, so cope with
  // the table not being there yet — see lib/mysql/has-table.ts.
  const turnedIn = new Map<string, { at: string; late: boolean }>();
  if (await hasTable("assignment_turnins")) {
    const rows = await query<{
      user_id: string;
      turned_in_at: string;
      late: number;
    }>(
      `SELECT user_id, turned_in_at, late
         FROM assignment_turnins
        WHERE assignment_id = ?`,
      [id],
    );
    for (const r of rows) {
      turnedIn.set(r.user_id, {
        at: String(r.turned_in_at),
        late: !!r.late,
      });
    }
  }

  const dueMs = new Date(assignment.due_at).getTime();
  const tasksWithHandIns = (taskRows ?? []).map(
    (t: { id: string; title: string; points: number }) => {
      const rows = (handInRows ?? []).filter(
        (r: { task_id: string }) => r.task_id === t.id,
      );
      const handedIn = new Set(rows.map((r: { user_id: string }) => r.user_id));
      return {
        id: t.id,
        title: t.title,
        points: t.points,
        missing: students
          .filter((s: { id: string }) => !handedIn.has(s.id))
          .map((s: { id: string }) => nameById.get(s.id) ?? "?"),
        handIns: rows.map(
          (r: {
            id: string;
            user_id: string;
            note: string | null;
            link: string | null;
            upload_id: string | null;
            submitted_at: string;
            score: number | null;
            feedback: string | null;
          }) => ({
            submission_id: r.id,
            student_name: nameById.get(r.user_id) ?? "?",
            submitted_at: String(r.submitted_at),
            late: new Date(r.submitted_at).getTime() > dueMs,
            note: r.note,
            link: r.link,
            upload_id: r.upload_id,
            upload_name: r.upload_id ? (uploadName.get(r.upload_id) ?? "file") : null,
            score: r.score,
            feedback: r.feedback,
          }),
        ),
      };
    },
  );
  const problemIds = problemLinks.map((p) => p.problem_id);

  const [problemsRes, submissionsRes] = await Promise.all([
    problemIds.length > 0
      ? supabase
          .from("problems")
          .select("id, slug, title_mn, title_en")
          .in("id", problemIds)
      : Promise.resolve({ data: [] }),
    problemIds.length > 0 && students.length > 0
      ? supabase
          .from("submissions")
          .select("user_id, problem_id, verdict, created_at")
          .in("problem_id", problemIds)
          .in(
            "user_id",
            students.map((s) => s.id),
          )
          .eq("assignment_id", id)
      : Promise.resolve({ data: [] }),
  ]);

  const problemMap = new Map(
    (problemsRes.data ?? []).map((p) => [
      p.id,
      {
        slug: p.slug,
        title: locale === "en" && p.title_en ? p.title_en : p.title_mn,
      },
    ]),
  );

  // Best verdict per (student, problem): "accepted" wins over any failing verdict.
  type Status = "accepted" | "attempted" | "none";
  const status: Record<string, Record<string, Status>> = {};
  for (const s of submissionsRes.data ?? []) {
    if (!status[s.user_id]) status[s.user_id] = {};
    const current = status[s.user_id][s.problem_id];
    if (current === "accepted") continue;
    status[s.user_id][s.problem_id] =
      s.verdict === "accepted" ? "accepted" : "attempted";
  }

  const className = classRes.data?.name ?? "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/teacher/assignments"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
        </div>
        <AssignmentActions id={assignment.id} title={assignment.title} />
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 text-sm">
          <span>
            <span className="text-muted-foreground">Class: </span>
            <span className="font-medium">{className}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {new Date(assignment.start_at).toLocaleString(locale, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span className="text-muted-foreground">→</span>
            {new Date(assignment.due_at).toLocaleString(locale, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {assignment.description && (
            <p className="w-full text-muted-foreground">{assignment.description}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="text-left p-3 sticky left-0 bg-card z-10">
                  {tGrading("student")}
                </th>
                {problemLinks.map((pl) => {
                  const p = problemMap.get(pl.problem_id);
                  return (
                    <th
                      key={pl.problem_id}
                      className="text-center p-3 font-normal"
                    >
                      <Link
                        href={p ? `/problems/${p.slug}` : "#"}
                        className="text-foreground font-semibold hover:text-violet-600 hover:underline"
                      >
                        {p?.title ?? "—"}
                      </Link>
                      <div className="text-[10px] font-normal text-muted-foreground mt-0.5">
                        {pl.points} pt
                      </div>
                    </th>
                  );
                })}
                <th className="p-3 text-center font-normal">
                  <span className="font-semibold">
                    {tAssign("turned_in")}
                  </span>
                  <div className="mt-0.5 text-[10px] font-normal text-muted-foreground tabular-nums">
                    {turnedIn.size} / {students.length}
                  </div>
                </th>
                <th className="text-right p-3">{tGrading("total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={problemLinks.length + 3}
                    className="text-center text-muted-foreground py-8"
                  >
                    —
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  let total = 0;
                  return (
                    <tr key={s.id} className="hover:bg-muted/50">
                      <td className="p-3 sticky left-0 bg-card z-10">
                        <div className="font-medium truncate max-w-[180px]">
                          {s.display_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{s.username}
                        </div>
                      </td>
                      {problemLinks.map((pl) => {
                        const cellStatus =
                          status[s.id]?.[pl.problem_id] ?? "none";
                        if (cellStatus === "accepted") total += pl.points;
                        return (
                          <td
                            key={pl.problem_id}
                            className="text-center p-3"
                          >
                            {cellStatus === "accepted" && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
                            )}
                            {cellStatus === "attempted" && (
                              <XCircle className="h-5 w-5 text-rose-500 mx-auto" />
                            )}
                            {cellStatus === "none" && (
                              <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        {(() => {
                          const ti = turnedIn.get(s.id);
                          if (!ti) {
                            return (
                              <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                            );
                          }
                          return (
                            <span
                              className="inline-flex flex-col items-center"
                              title={new Date(ti.at).toLocaleString()}
                            >
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              {ti.late && (
                                <span className="font-code text-[9px] text-neon-amber">
                                  {tAssign("late")}
                                </span>
                              )}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-right tabular-nums font-semibold">
                        {total}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {tasksWithHandIns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Work handed in</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <MarkHandIns tasks={tasksWithHandIns as TaskWithHandIns[]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

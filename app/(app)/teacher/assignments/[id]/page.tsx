import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { ArrowLeft, CheckCircle2, XCircle, Minus, Calendar } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { AssignmentActions } from "./assignment-actions";

export const dynamic = "force-dynamic";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tGrading = await getTranslations("teacher.assignments.grading");
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
                <th className="text-right p-3">{tGrading("total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={problemLinks.length + 2}
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
    </div>
  );
}

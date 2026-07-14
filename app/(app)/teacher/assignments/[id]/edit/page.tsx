import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { createServiceClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { AssignmentForm } from "../../assignment-form";

export const dynamic = "force-dynamic";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = createServiceClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!assignment) notFound();

  const [classesRes, problemsRes, linksRes] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name, grade")
      .order("grade", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("problems")
      .select("id, title_mn, title_en, difficulty, xp_reward")
      .order("difficulty", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("assignment_problems")
      .select("problem_id, points, order_idx")
      .eq("assignment_id", id)
      .order("order_idx", { ascending: true }),
  ]);

  const classes = (classesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
  }));
  const problems = (problemsRes.data ?? []).map((p) => ({
    id: p.id,
    title: locale === "en" && p.title_en ? p.title_en : p.title_mn,
    difficulty: p.difficulty,
    xp_reward: p.xp_reward,
  }));
  const pickedProblems = (linksRes.data ?? []).map((l) => ({
    id: l.problem_id,
    points: l.points,
  }));

  return (
    <AssignmentForm
      classes={classes}
      problems={problems}
      initial={{
        id: assignment.id,
        class_id: assignment.class_id,
        title: assignment.title,
        description: assignment.description ?? "",
        start_at: toLocalInput(assignment.start_at),
        due_at: toLocalInput(assignment.due_at),
        allow_late: assignment.allow_late,
        late_penalty_pct: assignment.late_penalty_pct,
        problems: pickedProblems,
      }}
    />
  );
}

import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { createServiceClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { AssignmentForm } from "../../assignment-form";
import { requireTeacher } from "@/lib/auth-helpers";
import { parseStarterFiles } from "@/lib/github-starter";

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
  // The layout calls this too, but a layout's redirect does not stop
  // this page rendering: React renders them together, and whatever the
  // page produced is flushed into the redirect response for anyone who
  // reads the body instead of following the Location header.
  await requireTeacher();

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

  const [classesRes, problemsRes, linksRes, materialsRes, tasksRes] =
    await Promise.all([
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
    supabase
      .from("assignment_materials")
      .select("id, kind, title, url, upload_id, order_idx")
      .eq("assignment_id", id)
      .order("order_idx", { ascending: true }),
    supabase
      .from("assignment_tasks")
      .select(
        "id, title, instructions, points, accept_file, accept_link, accept_text, accept_ide, starter_repo, starter_files, order_idx",
      )
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
  const pickedProblems = (linksRes.data ?? []).map(
    (l: { problem_id: string; points: number }) => ({
      id: l.problem_id,
      points: l.points,
    }),
  );

  // The file itself is not re-fetched: the picker only needs enough to show
  // "this is already attached", and the id is what the action stores.
  const materials = (materialsRes.data ?? []).map(
    (m: {
      id: string;
      kind: "link" | "file";
      title: string;
      url: string | null;
      upload_id: string | null;
    }) => ({
      key: m.id,
      kind: m.kind,
      title: m.title,
      url: m.url ?? "",
      file: m.upload_id
        ? { id: m.upload_id, name: m.title, bytes: 0, mime: "" }
        : null,
    }),
  );

  const tasks = (tasksRes.data ?? []).map(
    (t: {
      id: string;
      title: string;
      instructions: string | null;
      points: number;
      accept_file: number | boolean;
      accept_link: number | boolean;
      accept_text: number | boolean;
      accept_ide: number | boolean;
      starter_repo: string | null;
      starter_files: string | null;
    }) => ({
      key: t.id,
      title: t.title,
      instructions: t.instructions ?? "",
      points: t.points,
      accept_file: !!t.accept_file,
      accept_link: !!t.accept_link,
      accept_text: !!t.accept_text,
      accept_ide: !!t.accept_ide,
      starter_repo: t.starter_repo ?? "",
      starter_files: parseStarterFiles(t.starter_files),
    }),
  );

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
        materials,
        tasks,
      }}
    />
  );
}

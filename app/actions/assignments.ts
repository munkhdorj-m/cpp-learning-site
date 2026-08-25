"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { requireTeacher } from "@/lib/auth-helpers";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * An assignment is three kinds of thing at once now.
 *
 *   problems  judge problems, marked automatically  (unchanged)
 *   materials what students read: a link or a file  (new)
 *   tasks     work the judge cannot mark, handed in and marked by hand (new)
 *
 * Any combination is allowed, including materials on their own — "read this
 * before Thursday" is a real thing to set, and it used to be impossible here.
 */

const material = z.object({
  kind: z.enum(["link", "file"]),
  title: z.string().trim().min(1).max(200),
  // Exactly one of these, enforced below.
  url: z.string().trim().max(2000).optional().nullable(),
  upload_id: z.string().uuid().optional().nullable(),
});

const task = z.object({
  title: z.string().trim().min(1).max(200),
  instructions: z.string().max(4000).optional().nullable(),
  points: z.coerce.number().int().min(1).max(10000),
  accept_file: z.boolean(),
  accept_link: z.boolean(),
  accept_text: z.boolean(),
  accept_ide: z.boolean(),
  starter_repo: z.string().trim().max(500).optional().nullable(),
  starter_files: z.string().max(400_000).optional().nullable(),
});

const schema = z
  .object({
    class_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional().nullable(),
    start_at: z.string().min(1),
    due_at: z.string().min(1),
    allow_late: z.boolean(),
    late_penalty_pct: z.coerce.number().int().min(0).max(100),
    problems: z
      .array(
        z.object({
          problem_id: z.string().uuid(),
          points: z.coerce.number().int().min(1).max(10000),
        }),
      )
      .default([]),
    materials: z.array(material).max(30).default([]),
    tasks: z.array(task).max(20).default([]),
  })
  .refine(
    (v) => v.problems.length + v.materials.length + v.tasks.length > 0,
    { message: "Add a problem, a task or something to read." },
  )
  .refine(
    (v) =>
      v.materials.every((m) =>
        m.kind === "link" ? !!m.url?.trim() : !!m.upload_id,
      ),
    { message: "Every material needs either a link or a file." },
  )
  .refine(
    (v) =>
      v.tasks.every(
        (t) => t.accept_file || t.accept_link || t.accept_text || t.accept_ide,
      ),
    { message: "Every task needs at least one way to hand it in." },
  );

export type AssignmentInput = z.input<typeof schema>;

/** A link a teacher typed goes on a student's page — so it has to be a URL. */
function safeUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    // javascript: and data: in an href are a click away from running script
    // in the student's session.
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString().slice(0, 2000);
  } catch {
    return null;
  }
}

type Db = ReturnType<typeof createServiceClient>;

/** Replace the three child lists. Called by both create and update. */
async function writeChildren(
  supabase: Db,
  assignmentId: string,
  data: z.output<typeof schema>,
): Promise<string | null> {
  await supabase
    .from("assignment_problems")
    .delete()
    .eq("assignment_id", assignmentId);
  await supabase
    .from("assignment_materials")
    .delete()
    .eq("assignment_id", assignmentId);
  // Tasks cascade to hand-ins, so they are replaced by id below rather than
  // wiped: deleting a task a student has already handed in would throw their
  // work away because the teacher fixed a typo in the title.
  const { data: existingTasks } = await supabase
    .from("assignment_tasks")
    .select("id, order_idx")
    .eq("assignment_id", assignmentId)
    .order("order_idx", { ascending: true });
  const keep = (existingTasks ?? []) as { id: string }[];

  if (data.problems.length) {
    const { error } = await supabase.from("assignment_problems").insert(
      data.problems.map((p, idx) => ({
        assignment_id: assignmentId,
        problem_id: p.problem_id,
        points: p.points,
        order_idx: idx,
      })),
    );
    if (error) return error.message;
  }

  if (data.materials.length) {
    const { error } = await supabase.from("assignment_materials").insert(
      data.materials.map((m, idx) => ({
        id: randomUUID(),
        assignment_id: assignmentId,
        kind: m.kind,
        title: m.title,
        url: m.kind === "link" ? safeUrl(m.url) : null,
        upload_id: m.kind === "file" ? (m.upload_id ?? null) : null,
        order_idx: idx,
      })),
    );
    if (error) return error.message;
  }

  // Update the tasks that already existed, insert the rest, remove the extras.
  for (let idx = 0; idx < data.tasks.length; idx++) {
    const t = data.tasks[idx];
    const row = {
      assignment_id: assignmentId,
      title: t.title,
      instructions: t.instructions?.trim() || null,
      points: t.points,
      accept_file: t.accept_file,
      accept_link: t.accept_link,
      accept_text: t.accept_text,
      accept_ide: t.accept_ide,
      starter_repo: safeUrl(t.starter_repo),
      starter_files: t.starter_files || null,
      order_idx: idx,
    };
    if (keep[idx]) {
      const { error } = await supabase
        .from("assignment_tasks")
        .update(row)
        .eq("id", keep[idx].id);
      if (error) return error.message;
    } else {
      const { error } = await supabase
        .from("assignment_tasks")
        .insert({ id: randomUUID(), ...row });
      if (error) return error.message;
    }
  }
  for (const extra of keep.slice(data.tasks.length)) {
    await supabase.from("assignment_tasks").delete().eq("id", extra.id);
  }

  return null;
}

function firstError(parsed: z.ZodSafeParseError<z.output<typeof schema>>): string {
  const flat = parsed.error.flatten();
  return (
    flat.formErrors[0] ??
    Object.values(flat.fieldErrors).flat()[0] ??
    "invalid_input"
  );
}

export async function updateAssignment(id: string, input: AssignmentInput) {
  await requireTeacher();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed) };
  const data = parsed.data;
  if (new Date(data.due_at) <= new Date(data.start_at)) {
    return { error: "due_before_start" };
  }

  const supabase = createServiceClient();
  const { error: updErr } = await supabase
    .from("assignments")
    .update({
      class_id: data.class_id,
      title: data.title,
      description: data.description?.trim() || null,
      start_at: new Date(data.start_at).toISOString(),
      due_at: new Date(data.due_at).toISOString(),
      allow_late: data.allow_late,
      late_penalty_pct: data.late_penalty_pct,
    })
    .eq("id", id);
  if (updErr) return { error: updErr.message };

  const childErr = await writeChildren(supabase, id, data);
  if (childErr) return { error: childErr };

  revalidatePath("/teacher/assignments");
  revalidatePath(`/teacher/assignments/${id}`);
  revalidatePath("/assignments");
  revalidatePath(`/assignments/${id}`);
  redirect(`/teacher/assignments/${id}`);
}

export async function deleteAssignment(id: string) {
  await requireTeacher();
  const supabase = createServiceClient();
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/teacher/assignments");
  redirect("/teacher/assignments");
}

export async function createAssignment(input: AssignmentInput) {
  const teacher = await requireTeacher();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed) };
  const data = parsed.data;

  if (new Date(data.due_at) <= new Date(data.start_at)) {
    return { error: "due_before_start" };
  }

  const supabase = createServiceClient();
  const { data: created, error } = await supabase
    .from("assignments")
    .insert({
      class_id: data.class_id,
      title: data.title,
      description: data.description?.trim() || null,
      start_at: new Date(data.start_at).toISOString(),
      due_at: new Date(data.due_at).toISOString(),
      allow_late: data.allow_late,
      late_penalty_pct: data.late_penalty_pct,
      created_by: teacher.id,
    })
    .select("id")
    .single();
  if (error || !created) return { error: error?.message ?? "insert_failed" };

  const childErr = await writeChildren(supabase, created.id, data);
  if (childErr) {
    await supabase.from("assignments").delete().eq("id", created.id);
    return { error: childErr };
  }

  revalidatePath("/teacher/assignments");
  revalidatePath("/assignments");
  redirect(`/teacher/assignments/${created.id}`);
}

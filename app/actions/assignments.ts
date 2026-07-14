"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTeacher } from "@/lib/auth-helpers";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
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
    .min(1, "Add at least one problem"),
});

export type AssignmentInput = z.input<typeof schema>;

export async function updateAssignment(id: string, input: AssignmentInput) {
  await requireTeacher();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "invalid_input" };
  }
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

  // Replace assignment_problems
  await supabase.from("assignment_problems").delete().eq("assignment_id", id);
  const { error: probsErr } = await supabase.from("assignment_problems").insert(
    data.problems.map((p, idx) => ({
      assignment_id: id,
      problem_id: p.problem_id,
      points: p.points,
      order_idx: idx,
    })),
  );
  if (probsErr) return { error: probsErr.message };

  revalidatePath("/teacher/assignments");
  revalidatePath(`/teacher/assignments/${id}`);
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
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "invalid_input" };
  }
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

  const { error: probsErr } = await supabase.from("assignment_problems").insert(
    data.problems.map((p, idx) => ({
      assignment_id: created.id,
      problem_id: p.problem_id,
      points: p.points,
      order_idx: idx,
    })),
  );
  if (probsErr) {
    await supabase.from("assignments").delete().eq("id", created.id);
    return { error: probsErr.message };
  }

  revalidatePath("/teacher/assignments");
  revalidatePath("/assignments");
  redirect(`/teacher/assignments/${created.id}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTeacher } from "@/lib/auth-helpers";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  start_at: z.string().min(1),
  end_at: z.string().min(1),
  class_id: z.string().uuid().nullable(),
  problems: z
    .array(
      z.object({
        problem_id: z.string().uuid(),
        points: z.coerce.number().int().min(1).max(10000),
      }),
    )
    .min(1, "Add at least one problem"),
});

export type ContestInput = z.input<typeof schema>;

export async function createContest(input: ContestInput) {
  const teacher = await requireTeacher();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "invalid_input" };
  }
  const data = parsed.data;
  if (new Date(data.end_at) <= new Date(data.start_at)) {
    return { error: "end_before_start" };
  }
  const supabase = createServiceClient();
  const { data: created, error } = await supabase
    .from("contests")
    .insert({
      title: data.title,
      description: data.description?.trim() || null,
      start_at: new Date(data.start_at).toISOString(),
      end_at: new Date(data.end_at).toISOString(),
      class_id: data.class_id,
      created_by: teacher.id,
    })
    .select("id")
    .single();
  if (error || !created) return { error: error?.message ?? "insert_failed" };

  const { error: probsErr } = await supabase.from("contest_problems").insert(
    data.problems.map((p, idx) => ({
      contest_id: created.id,
      problem_id: p.problem_id,
      points: p.points,
      order_idx: idx,
    })),
  );
  if (probsErr) {
    await supabase.from("contests").delete().eq("id", created.id);
    return { error: probsErr.message };
  }
  revalidatePath("/teacher/contests");
  revalidatePath("/contests");
  redirect(`/teacher/contests/${created.id}`);
}

export async function updateContest(id: string, input: ContestInput) {
  await requireTeacher();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "invalid_input" };
  }
  const data = parsed.data;
  if (new Date(data.end_at) <= new Date(data.start_at)) {
    return { error: "end_before_start" };
  }
  const supabase = createServiceClient();
  const { error: updErr } = await supabase
    .from("contests")
    .update({
      title: data.title,
      description: data.description?.trim() || null,
      start_at: new Date(data.start_at).toISOString(),
      end_at: new Date(data.end_at).toISOString(),
      class_id: data.class_id,
    })
    .eq("id", id);
  if (updErr) return { error: updErr.message };

  await supabase.from("contest_problems").delete().eq("contest_id", id);
  const { error: probsErr } = await supabase.from("contest_problems").insert(
    data.problems.map((p, idx) => ({
      contest_id: id,
      problem_id: p.problem_id,
      points: p.points,
      order_idx: idx,
    })),
  );
  if (probsErr) return { error: probsErr.message };

  revalidatePath("/teacher/contests");
  revalidatePath(`/teacher/contests/${id}`);
  revalidatePath(`/contests/${id}`);
  redirect(`/teacher/contests/${id}`);
}

export async function deleteContest(id: string) {
  await requireTeacher();
  const supabase = createServiceClient();
  const { error } = await supabase.from("contests").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/teacher/contests");
  revalidatePath("/contests");
  redirect("/teacher/contests");
}

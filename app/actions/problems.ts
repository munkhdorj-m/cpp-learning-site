"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTeacher } from "@/lib/auth-helpers";
import { createServiceClient } from "@/lib/supabase/server";

const testCaseSchema = z.object({
  stdin: z.string(),
  expected_stdout: z.string(),
  is_sample: z.boolean(),
});

const problemSchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits, hyphens"),
  title_mn: z.string().min(1).max(200),
  title_en: z.string().max(200).optional().nullable(),
  statement_mn: z.string().min(1),
  statement_en: z.string().optional().nullable(),
  input_format_mn: z.string().optional().nullable(),
  input_format_en: z.string().optional().nullable(),
  output_format_mn: z.string().optional().nullable(),
  output_format_en: z.string().optional().nullable(),
  constraints_mn: z.string().optional().nullable(),
  constraints_en: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  time_limit_ms: z.coerce.number().int().min(100).max(10000),
  memory_limit_kb: z.coerce.number().int().min(16384).max(524288),
  xp_reward: z.coerce.number().int().min(1).max(1000),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean(),
  tests: z.array(testCaseSchema).min(1, "Add at least one test case"),
});

export type ProblemInput = z.input<typeof problemSchema>;

function nullify(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function createProblem(input: ProblemInput) {
  const teacher = await requireTeacher();
  const parsed = problemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "invalid_input" };
  }
  const data = parsed.data;
  const supabase = createServiceClient();

  const { data: created, error } = await supabase
    .from("problems")
    .insert({
      slug: data.slug,
      title_mn: data.title_mn,
      title_en: nullify(data.title_en),
      statement_mn: data.statement_mn,
      statement_en: nullify(data.statement_en),
      input_format_mn: nullify(data.input_format_mn),
      input_format_en: nullify(data.input_format_en),
      output_format_mn: nullify(data.output_format_mn),
      output_format_en: nullify(data.output_format_en),
      constraints_mn: nullify(data.constraints_mn),
      constraints_en: nullify(data.constraints_en),
      difficulty: data.difficulty,
      time_limit_ms: data.time_limit_ms,
      memory_limit_kb: data.memory_limit_kb,
      xp_reward: data.xp_reward,
      tags: data.tags,
      is_public: data.is_public,
      created_by: teacher.id,
    })
    .select("id, slug")
    .single();

  if (error || !created) {
    if (error?.code === "23505") return { error: "slug_taken" };
    return { error: error?.message ?? "insert_failed" };
  }

  const { error: testsErr } = await supabase.from("test_cases").insert(
    data.tests.map((t, idx) => ({
      problem_id: created.id,
      stdin: t.stdin,
      expected_stdout: t.expected_stdout,
      is_sample: t.is_sample,
      order_idx: idx,
    })),
  );
  if (testsErr) {
    // Roll back the problem so the slug isn't taken
    await supabase.from("problems").delete().eq("id", created.id);
    return { error: testsErr.message };
  }

  revalidatePath("/teacher/problems");
  revalidatePath("/problems");
  redirect("/teacher/problems");
}

export async function updateProblem(id: string, input: ProblemInput) {
  await requireTeacher();
  const parsed = problemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(", ") || "invalid_input" };
  }
  const data = parsed.data;
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("problems")
    .update({
      slug: data.slug,
      title_mn: data.title_mn,
      title_en: nullify(data.title_en),
      statement_mn: data.statement_mn,
      statement_en: nullify(data.statement_en),
      input_format_mn: nullify(data.input_format_mn),
      input_format_en: nullify(data.input_format_en),
      output_format_mn: nullify(data.output_format_mn),
      output_format_en: nullify(data.output_format_en),
      constraints_mn: nullify(data.constraints_mn),
      constraints_en: nullify(data.constraints_en),
      difficulty: data.difficulty,
      time_limit_ms: data.time_limit_ms,
      memory_limit_kb: data.memory_limit_kb,
      xp_reward: data.xp_reward,
      tags: data.tags,
      is_public: data.is_public,
    })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") return { error: "slug_taken" };
    return { error: error.message };
  }

  // Replace test cases (delete + reinsert is simplest)
  await supabase.from("test_cases").delete().eq("problem_id", id);
  const { error: testsErr } = await supabase.from("test_cases").insert(
    data.tests.map((t, idx) => ({
      problem_id: id,
      stdin: t.stdin,
      expected_stdout: t.expected_stdout,
      is_sample: t.is_sample,
      order_idx: idx,
    })),
  );
  if (testsErr) return { error: testsErr.message };

  revalidatePath("/teacher/problems");
  revalidatePath("/problems");
  revalidatePath(`/problems/${data.slug}`);
  redirect("/teacher/problems");
}

export async function deleteProblem(id: string) {
  await requireTeacher();
  const supabase = createServiceClient();
  const { error } = await supabase.from("problems").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/teacher/problems");
  revalidatePath("/problems");
  return { ok: true as const };
}

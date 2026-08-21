import { notFound } from "next/navigation";

import { createServiceClient } from "@/lib/supabase/server";

import { ProblemForm } from "../../problem-form";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function EditProblemPage({
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
  const supabase = createServiceClient();

  const { data: problem } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!problem) notFound();

  const { data: tests } = await supabase
    .from("test_cases")
    .select("stdin, expected_stdout, is_sample, order_idx")
    .eq("problem_id", id)
    .order("order_idx", { ascending: true });

  return (
    <ProblemForm
      initial={{
        id: problem.id,
        slug: problem.slug,
        title_mn: problem.title_mn,
        title_en: problem.title_en ?? "",
        statement_mn: problem.statement_mn,
        statement_en: problem.statement_en ?? "",
        input_format_mn: problem.input_format_mn ?? "",
        input_format_en: problem.input_format_en ?? "",
        output_format_mn: problem.output_format_mn ?? "",
        output_format_en: problem.output_format_en ?? "",
        constraints_mn: problem.constraints_mn ?? "",
        constraints_en: problem.constraints_en ?? "",
        difficulty: problem.difficulty,
        time_limit_ms: problem.time_limit_ms,
        memory_limit_kb: problem.memory_limit_kb,
        xp_reward: problem.xp_reward,
        tags: problem.tags,
        is_public: problem.is_public,
        tests: (tests ?? []).map((t) => ({
          stdin: t.stdin,
          expected_stdout: t.expected_stdout,
          is_sample: t.is_sample,
        })),
      }}
    />
  );
}

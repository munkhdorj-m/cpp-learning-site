import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/get-session";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { ProblemView } from "./problem-view";

export const dynamic = "force-dynamic";

export default async function ProblemPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fromPage?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const fromPage = sp.fromPage ? parseInt(sp.fromPage, 10) : 1;
  const t = await getTranslations("problem");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();
  // Uses x-user-id header from middleware (fast path) — no network call
  const user = await getCachedSession();

  const { data: problem } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!problem) notFound();

  const { data: samples } = await supabase
    .from("test_cases")
    .select("stdin, expected_stdout, order_idx")
    .eq("problem_id", problem.id)
    .eq("is_sample", true)
    .order("order_idx", { ascending: true });

  // Fetch this user's past submissions for this problem
  const { data: mySubmissions } = user
    ? await supabase
        .from("submissions")
        .select(
          "id, verdict, runtime_ms, passed_tests, total_tests, created_at",
        )
        .eq("user_id", user.id)
        .eq("problem_id", problem.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const labels = {
    statement: t("statement"),
    input_format: t("input_format"),
    output_format: t("output_format"),
    constraints: t("constraints"),
    samples: t("samples"),
    sample_input: t("sample_input"),
    sample_output: t("sample_output"),
    time_limit: t("time_limit"),
    memory_limit: t("memory_limit"),
    your_solution: t("your_solution"),
    submit: t("submit"),
    submitting: t("submitting"),
  };

  const pickField = (mn: string | null, en: string | null) =>
    locale === "en" ? (en ?? mn ?? "") : (mn ?? "");

  return (
    <ProblemView
      problem={{
        id: problem.id,
        slug: problem.slug,
        title: pickField(problem.title_mn, problem.title_en),
        statement: pickField(problem.statement_mn, problem.statement_en),
        input_format: pickField(
          problem.input_format_mn,
          problem.input_format_en,
        ),
        output_format: pickField(
          problem.output_format_mn,
          problem.output_format_en,
        ),
        constraints: pickField(problem.constraints_mn, problem.constraints_en),
        difficulty: problem.difficulty,
        time_limit_ms: problem.time_limit_ms,
        memory_limit_kb: problem.memory_limit_kb,
        xp_reward: problem.xp_reward,
      }}
      samples={samples ?? []}
      labels={labels}
      fromPage={fromPage}
      pastSubmissions={(mySubmissions ?? []).map((s) => ({
        id: s.id,
        verdict: s.verdict,
        runtime_ms: s.runtime_ms,
        passed_tests: s.passed_tests,
        total_tests: s.total_tests,
        created_at: s.created_at,
      }))}
    />
  );
}

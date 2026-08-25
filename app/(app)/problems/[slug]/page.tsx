import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { ProblemView } from "./problem-view";

export const dynamic = "force-dynamic";

export default async function ProblemPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fromPage?: string; assignment?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const fromPage = sp.fromPage ? parseInt(sp.fromPage, 10) : 1;
  // Working on this problem for homework? The id is student-supplied, so it is
  // only a hint to the UI here — the submit route re-checks it before letting
  // anything into the assignment track. See lib/assignment-track.ts.
  const assignmentId = sp.assignment ?? null;

  const t = await getTranslations("problem");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();
  // Uses x-user-id header from middleware (fast path) — no network call
  const user = await getCachedSession();

  // The list at /problems filters on is_public; this page never did. That was
  // invisible while the whole app sat behind a login, but the moment a visitor
  // can reach this route, an unreleased assignment or contest problem is
  // readable by guessing its slug.
  //
  // Anonymous readers get public problems only. Signed-in users keep exactly
  // the access they had before — narrowing that as well would 404 the problems
  // a student reaches from their own assignment.
  const problemQuery = supabase.from("problems").select("*").eq("slug", slug);
  if (!user) problemQuery.eq("is_public", true);
  const { data: problem } = await problemQuery.maybeSingle();

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

  // The banner needs a title and the points, and doubles as the check that the
  // assignment is genuinely this student's — a made-up id simply shows nothing.
  let homework: { id: string; title: string; points: number } | null = null;
  if (assignmentId && user) {
    const found = await query<{ id: string; title: string; points: number }>(
      `SELECT a.id, a.title, ap.points
         FROM assignments a
         JOIN assignment_problems ap
           ON ap.assignment_id = a.id AND ap.problem_id = ?
         JOIN profiles p ON p.id = ? AND p.class_id = a.class_id
        WHERE a.id = ?
          AND NOW() >= a.start_at
          AND (NOW() <= a.due_at OR a.allow_late = TRUE)`,
      [problem.id, user.id, assignmentId],
    );
    if (found[0]) {
      homework = {
        id: found[0].id,
        title: found[0].title,
        points: Number(found[0].points),
      };
    }
  }

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
      homework={homework}
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

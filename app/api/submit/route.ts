import { NextResponse } from "next/server";
import { z } from "zod";

import { Judge0RateLimitError, grade } from "@/lib/judge0";
import { SIMILARITY_THRESHOLD, similarity } from "@/lib/plagiarism";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const schema = z.object({
  problem_id: z.string().uuid(),
  code: z.string().min(1).max(100_000),
  assignment_id: z.string().uuid().optional(),
  contest_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { problem_id, code, assignment_id, contest_id } = parsed.data;

  // Fetch problem + tests via service role (test cases are not all visible to students).
  const admin = createServiceClient();
  const { data: problem, error: problemErr } = await admin
    .from("problems")
    .select("id, time_limit_ms, memory_limit_kb")
    .eq("id", problem_id)
    .single();
  if (problemErr || !problem) {
    return NextResponse.json({ error: "problem_not_found" }, { status: 404 });
  }
  const { data: tests } = await admin
    .from("test_cases")
    .select("stdin, expected_stdout, order_idx")
    .eq("problem_id", problem_id)
    .order("order_idx", { ascending: true });
  if (!tests || tests.length === 0) {
    return NextResponse.json({ error: "no_tests_configured" }, { status: 500 });
  }

  // Snapshot level + badges before so we can report deltas if accepted.
  const [{ data: beforeProfile }, { data: beforeBadgeRows }] = await Promise.all([
    admin.from("profiles").select("level").eq("id", user.id).single(),
    admin.from("user_badges").select("badge_id").eq("user_id", user.id),
  ]);
  const beforeLevel = beforeProfile?.level ?? 1;
  const beforeBadgeIds = new Set(
    (beforeBadgeRows ?? []).map((b) => b.badge_id),
  );

  // Create the submission row up front so we have an id to return.
  const { data: created, error: insertErr } = await admin
    .from("submissions")
    .insert({
      user_id: user.id,
      problem_id,
      code,
      language: "cpp",
      verdict: "judging",
      assignment_id: assignment_id ?? null,
      contest_id: contest_id ?? null,
    })
    .select("id")
    .single();
  if (insertErr || !created) {
    return NextResponse.json({ error: insertErr?.message ?? "insert_failed" }, { status: 500 });
  }

  try {
    const result = await grade({
      source: code,
      tests: tests.map((t) => ({ stdin: t.stdin, expected_stdout: t.expected_stdout })),
      timeLimitMs: problem.time_limit_ms,
      memoryLimitKb: problem.memory_limit_kb,
    });

    await admin
      .from("submissions")
      .update({
        verdict: result.verdict,
        runtime_ms: result.runtime_ms,
        memory_kb: result.memory_kb,
        passed_tests: result.passed,
        total_tests: result.total,
        failed_test_idx: result.failedAt,
        compile_output: result.compile_output,
        stderr_output: result.stderr_output,
        judge_response: result.raw as Record<string, unknown>,
      })
      .eq("id", created.id);

    // Compute gamification deltas (only meaningful on first AC of a problem).
    let levelUp = false;
    let newLevel = beforeLevel;
    let newBadges: {
      code: string;
      name_mn: string;
      name_en: string;
      icon: string;
      color: string;
    }[] = [];
    if (result.verdict === "accepted") {
      const { data: afterProfile } = await admin
        .from("profiles")
        .select("level")
        .eq("id", user.id)
        .single();
      newLevel = afterProfile?.level ?? beforeLevel;
      levelUp = newLevel > beforeLevel;

      const { data: afterBadgeRows } = await admin
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user.id);
      const freshIds = (afterBadgeRows ?? [])
        .map((b) => b.badge_id)
        .filter((id) => !beforeBadgeIds.has(id));
      if (freshIds.length > 0) {
        const { data } = await admin
          .from("badges")
          .select("code, name_mn, name_en, icon, color")
          .in("id", freshIds);
        newBadges = data ?? [];
      }

      // Plagiarism scan: compare this code against classmates' accepted
      // submissions for the same problem. Cheap because a single class is
      // small (~30 students × 1 first-AC each).
      const { data: meProfile } = await admin
        .from("profiles")
        .select("class_id")
        .eq("id", user.id)
        .single();
      if (meProfile?.class_id) {
        const { data: classmates } = await admin
          .from("profiles")
          .select("id")
          .eq("class_id", meProfile.class_id)
          .eq("role", "student")
          .neq("id", user.id);
        const classmateIds = (classmates ?? []).map((c) => c.id);
        if (classmateIds.length > 0) {
          const { data: otherSubs } = await admin
            .from("submissions")
            .select("id, code")
            .eq("problem_id", problem_id)
            .eq("verdict", "accepted")
            .eq("is_first_accepted", true)
            .in("user_id", classmateIds);
          const pairs: {
            submission_a_id: string;
            submission_b_id: string;
            problem_id: string;
            similarity: number;
            class_id: string;
          }[] = [];
          for (const other of otherSubs ?? []) {
            const sim = similarity(code, other.code);
            if (sim >= SIMILARITY_THRESHOLD) {
              // Schema requires submission_a_id < submission_b_id
              const [a, b] =
                created.id < other.id
                  ? [created.id, other.id]
                  : [other.id, created.id];
              pairs.push({
                submission_a_id: a,
                submission_b_id: b,
                problem_id,
                similarity: sim,
                class_id: meProfile.class_id,
              });
            }
          }
          if (pairs.length > 0) {
            await admin
              .from("code_similarity")
              .upsert(pairs, {
                onConflict: "submission_a_id,submission_b_id",
                ignoreDuplicates: true,
              });
          }
        }
      }
    }

    return NextResponse.json({
      submission_id: created.id,
      verdict: result.verdict,
      passed: result.passed,
      total: result.total,
      runtime_ms: result.runtime_ms,
      memory_kb: result.memory_kb,
      compile_output: result.compile_output,
      stderr_output: result.stderr_output,
      level_up: levelUp,
      new_level: newLevel,
      new_badges: newBadges,
    });
  } catch (err) {
    const rateLimited = err instanceof Judge0RateLimitError;
    await admin
      .from("submissions")
      .update({ verdict: "internal_error" })
      .eq("id", created.id);
    return NextResponse.json(
      { error: rateLimited ? "rate_limited" : "judge_error" },
      { status: rateLimited ? 429 : 500 },
    );
  }
}

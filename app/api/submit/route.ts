import { NextResponse } from "next/server";
import { z } from "zod";

import { JudgeRateLimitError, grade } from "@/lib/judge";
import { SIMILARITY_THRESHOLD, compare } from "@/lib/plagiarism";
import { SIGNAL_THRESHOLD, analyse } from "@/lib/code-signals";
import { earnedClassChampion } from "@/lib/badge-rules";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { toLanguage } from "@/lib/languages";
import {
  awardAssignmentSolve,
  awardProblemSolve,
  awardBadges,
  nextStreak,
  utcToday,
} from "@/lib/gamification";
import { hasEarlierAccept, resolveTrack } from "@/lib/assignment-track";

export const maxDuration = 60;

const schema = z.object({
  problem_id: z.string().uuid(),
  code: z.string().min(1).max(100_000),
  language: z.string().optional(),
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
  const language = toLanguage(parsed.data.language);

  // Fetch problem + tests via service role (test cases are not all visible to students).
  const admin = createServiceClient();
  const { data: problem, error: problemErr } = await admin
    .from("problems")
    .select("id, time_limit_ms, memory_limit_kb, difficulty, xp_reward")
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

  // Which track this submission belongs to. The assignment id comes from the
  // URL and is therefore student-supplied, so resolveTrack re-checks that the
  // assignment is really theirs, really contains this problem and is really
  // open; anything that fails falls back to practice.
  const track = await resolveTrack(assignment_id, user.id, problem_id);

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
      language,
      verdict: "judging",
      assignment_id: track.assignmentId,
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
      language,
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
    // What is worth a teacher's glance about this submission. Every
    // submission, accepted or not: a copied wrong answer is still a copy, and
    // whoever supplied it is worth knowing about before the retry passes.
    {
      const { count: attemptsBefore } = await admin
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("problem_id", problem_id)
        .neq("id", created.id);
      const { data: previous } = await admin
        .from("submissions")
        .select("created_at")
        .eq("user_id", user.id)
        .neq("id", created.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const previousAt = previous?.[0]?.created_at
        ? new Date(previous[0].created_at as string).getTime()
        : null;
      const signals = analyse(code, language === "python" ? "python" : "cpp", {
        difficulty: problem.difficulty,
        attemptsBefore: attemptsBefore ?? 0,
        secondsSincePrevious:
          previousAt === null ? null : (Date.now() - previousAt) / 1000,
      });
      if (signals.score >= SIGNAL_THRESHOLD) {
        await admin
          .from("submissions")
          .update({
            signal_score: signals.score,
            signal_flags: JSON.stringify(signals.signals),
          })
          .eq("id", created.id);
      }
    }

    if (result.verdict === "accepted") {
      // --- gamification (previously done by Postgres triggers) ---
      //
      // Homework and practice are separate tracks. "First accepted" means
      // first in ITS track, so a problem solved for an assignment is still
      // open on the problems page and still worth solving there. See
      // lib/assignment-track.ts.
      const earlier = await hasEarlierAccept(
        user.id,
        problem_id,
        track.assignmentId,
        created.id,
      );

      if (!earlier) {
        const { data: prof } = await admin
          .from("profiles")
          .select("streak_days, last_solve_date")
          .eq("id", user.id)
          .single();
        const today = utcToday();
        const streak = nextStreak(
          prof?.last_solve_date,
          prof?.streak_days ?? 0,
          today,
        );

        // Homework is worth what the teacher set for it; practice is worth
        // the problem's own reward. That is the dial that lets an assignment
        // matter to the Class Cup more than idle practice does.
        const isHomework = track.assignmentId !== null;
        const xpReward = isHomework
          ? (track.points ?? problem.xp_reward ?? 10)
          : (problem.xp_reward ?? 10);

        if (isHomework) {
          await awardAssignmentSolve(user.id, xpReward, streak, today);
        } else {
          await awardProblemSolve(user.id, xpReward, streak, today);
        }
        await admin
          .from("submissions")
          .update({ is_first_accepted: true, xp_awarded: xpReward })
          .eq("id", created.id);

        // Badges (mirrors the old award_badges_on_accept trigger).
        //
        // Practice only, deliberately. problems_solved does not move for
        // homework, so the badges that read it would never fire here anyway —
        // and awarding first_hard or first_try off a homework solve while
        // first_solve stayed locked would be incoherent. One rule: homework
        // earns XP and keeps the streak, practice earns the badges.
        if (!isHomework) {
          const { data: prof2 } = await admin
            .from("profiles")
            .select("problems_solved, streak_days, class_id")
            .eq("id", user.id)
            .single();
          const { count: otherSubs } = await admin
            .from("submissions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("problem_id", problem_id)
            .neq("id", created.id);

          const codes = ["first_solve"];
          const ps = prof2?.problems_solved ?? 0;
          if (ps >= 10) codes.push("ten_solved");
          if (ps >= 50) codes.push("fifty_solved");
          if (ps >= 100) codes.push("hundred_solved");
          const st = prof2?.streak_days ?? 0;
          if (st >= 7) codes.push("streak_7");
          if (st >= 30) codes.push("streak_30");
          if (problem.difficulty === "hard") codes.push("first_hard");
          if ((otherSubs ?? 0) === 0) codes.push("first_try");
          // Top of their class for XP over the last seven days.
          if (await earnedClassChampion(user.id, prof2?.class_id)) {
            codes.push("class_champion");
          }
          await awardBadges(user.id, codes);
        }
      }
      // --- end gamification ---

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
          // Same language only — comparing C++ against Python would score
          // near zero and tell a teacher nothing.
          const { data: otherSubs } = await admin
            .from("submissions")
            .select("id, code")
            .eq("problem_id", problem_id)
            .eq("verdict", "accepted")
            .eq("is_first_accepted", true)
            .eq("language", language)
            .in("user_id", classmateIds);
          const pairs: {
            submission_a_id: string;
            submission_b_id: string;
            problem_id: string;
            similarity: number;
            jaccard: number;
            contained: number;
            longest_run: number;
            tokens: number;
            class_id: string;
          }[] = [];
          for (const other of otherSubs ?? []) {
            // The language is known here; passing it picks the right keyword
            // set and comment syntax, which the default never could.
            const report = compare(
              code,
              other.code,
              language === "python" ? "python" : "cpp",
            );
            if (report.score >= SIMILARITY_THRESHOLD) {
              // Schema requires submission_a_id < submission_b_id
              const [a, b] =
                created.id < other.id
                  ? [created.id, other.id]
                  : [other.id, created.id];
              pairs.push({
                submission_a_id: a,
                submission_b_id: b,
                problem_id,
                similarity: report.score,
                jaccard: report.jaccard,
                contained: report.contained,
                longest_run: report.longestRun,
                tokens: report.tokens,
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
    const rateLimited = err instanceof JudgeRateLimitError;
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

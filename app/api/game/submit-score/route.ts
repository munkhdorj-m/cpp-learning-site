import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { MAX_DAILY_PLAYS, ulaanbaatarToday } from "@/lib/bug-smash";

/**
 * Bug Smash is for fun, and it is not worth any XP.
 *
 * It used to pay 1 XP per point up to 60 a day, which made clicking bugs a
 * faster way up the leaderboard than solving a problem — the opposite of what
 * the leaderboard is for. XP now comes only from work: problems, quests and
 * the robot. The score is still recorded, so the badges and the high score
 * survive; only the XP is gone.
 *
 * Three rounds a day. The point is that it stops being something a student
 * can sit and do for an hour instead of the course.
 */

/** A score worth a badge. Reachable: a good round is well past this. */
const SMASH_100_SCORE = 100;

const schema = z.object({
  score: z.coerce.number().int().min(0).max(10_000),
  best_combo: z.coerce.number().int().min(0).max(1_000),
});


export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { score, best_combo } = parsed.data;
  const day = ulaanbaatarToday();
  const admin = createServiceClient();

  const { data: existing } = await admin
    .from("game_attempts")
    .select("score, xp_awarded, plays, best_combo")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle();

  const playsBefore = existing?.plays ?? 0;

  // The client hides the button, but the button is not the rule. A round that
  // is over the limit is not recorded at all — no score, no badge, no play
  // count — so replaying past the limit cannot improve anything.
  if (playsBefore >= MAX_DAILY_PLAYS) {
    return NextResponse.json(
      {
        error: "daily_limit",
        plays_used: playsBefore,
        plays_left: 0,
        limit: MAX_DAILY_PLAYS,
      },
      { status: 429 },
    );
  }

  const playsAfter = playsBefore + 1;

  if (existing) {
    const { error } = await admin
      .from("game_attempts")
      .update({
        score: Math.max(existing.score, score),
        best_combo: Math.max(existing.best_combo, best_combo),
        plays: playsAfter,
        played_at: new Date(),
      })
      .eq("user_id", user.id)
      .eq("day", day);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.from("game_attempts").insert({
      user_id: user.id,
      day,
      score,
      best_combo,
      xp_awarded: 0,
      plays: 1,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Badge awards (idempotent).
  //
  // smash_100 was "earn 100 XP from Bug Smash", which no student could ever
  // do: the daily XP cap was 60, and the check compared against today's total.
  // It is a score now — the same number, actually reachable, and it still
  // means the same thing to a student.
  const bestToday = Math.max(existing?.score ?? 0, score);
  const bestComboToday = Math.max(existing?.best_combo ?? 0, best_combo);
  const earnedCodes: string[] = ["first_smash"];
  if (bestToday >= SMASH_100_SCORE) earnedCodes.push("smash_100");
  if (bestComboToday >= 10) earnedCodes.push("smash_combo");
  const { data: badges } = await admin
    .from("badges")
    .select("id, code")
    .in("code", earnedCodes);
  if (badges && badges.length > 0) {
    await admin.from("user_badges").upsert(
      badges.map((b) => ({ user_id: user.id, badge_id: b.id })),
      { onConflict: "user_id,badge_id", ignoreDuplicates: true },
    );
  }

  return NextResponse.json({
    score,
    best_today: bestToday,
    plays_used: playsAfter,
    plays_left: MAX_DAILY_PLAYS - playsAfter,
    limit: MAX_DAILY_PLAYS,
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient, createServiceClient } from "@/lib/supabase/server";

// Daily cap so kids can't farm XP infinitely. The game is meant to be a
// supplement to real problem solving, not the main XP source.
const MAX_DAILY_XP = 60;
// Score-to-XP conversion. With ~3 XP per smash and the cap, ~20 smashes
// earn full daily XP. Above that the game is just for fun.
const XP_PER_SCORE_POINT = 1;

const schema = z.object({
  score: z.coerce.number().int().min(0).max(10_000),
  best_combo: z.coerce.number().int().min(0).max(1_000),
});

function ulaanbaatarToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

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

  // Look up today's existing attempt (if any)
  const { data: existing } = await admin
    .from("game_attempts")
    .select("score, xp_awarded, plays, best_combo")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle();

  // XP rule: only the BEST score of the day counts toward XP.
  // If today's new score beats the previous one, top up XP to match;
  // otherwise return XP earned so far without awarding more.
  const targetXp = Math.min(score * XP_PER_SCORE_POINT, MAX_DAILY_XP);
  const previousXp = existing?.xp_awarded ?? 0;
  const xpToAdd = Math.max(0, targetXp - previousXp);

  if (existing) {
    const newBest = Math.max(existing.score, score);
    const newCombo = Math.max(existing.best_combo, best_combo);
    const { error } = await admin
      .from("game_attempts")
      .update({
        score: newBest,
        best_combo: newCombo,
        xp_awarded: previousXp + xpToAdd,
        plays: existing.plays + 1,
        played_at: new Date().toISOString(),
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
      xp_awarded: xpToAdd,
      plays: 1,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Badge awards (idempotent)
  const totalEarned = previousXp + xpToAdd;
  const earnedCodes: string[] = ["first_smash"];
  if (totalEarned >= 100) earnedCodes.push("smash_100");
  if (best_combo >= 10) earnedCodes.push("smash_combo");
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
    xp_awarded: xpToAdd,
    xp_total_today: totalEarned,
    daily_cap: MAX_DAILY_XP,
    capped: totalEarned >= MAX_DAILY_XP,
  });
}

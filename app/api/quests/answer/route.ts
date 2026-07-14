import { NextResponse } from "next/server";
import { z } from "zod";

import { isCorrectAnswer } from "@/lib/quest-selection";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  quest_id: z.string().uuid(),
  user_answer: z.string().max(2000),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { quest_id, user_answer } = parsed.data;

  const admin = createServiceClient();

  // Already answered? Then return the previous result without re-awarding XP.
  const { data: existing } = await admin
    .from("user_quest_attempts")
    .select("was_correct, xp_awarded, user_answer")
    .eq("user_id", user.id)
    .eq("quest_id", quest_id)
    .maybeSingle();
  if (existing) {
    const { data: q } = await admin
      .from("quests")
      .select("correct_answer, explanation_mn, explanation_en, choices_mn, choices_en")
      .eq("id", quest_id)
      .single();
    return NextResponse.json({
      already_answered: true,
      was_correct: existing.was_correct,
      xp_awarded: existing.xp_awarded,
      correct_answer: q?.correct_answer ?? null,
      explanation_mn: q?.explanation_mn ?? null,
      explanation_en: q?.explanation_en ?? null,
    });
  }

  const { data: quest, error: questErr } = await admin
    .from("quests")
    .select("type, correct_answer, xp_reward, explanation_mn, explanation_en, is_active")
    .eq("id", quest_id)
    .single();
  if (questErr || !quest || !quest.is_active) {
    return NextResponse.json({ error: "quest_not_found" }, { status: 404 });
  }

  const correct = isCorrectAnswer(quest.type, user_answer, quest.correct_answer);
  const xp = correct ? quest.xp_reward : 0;

  const { error: attemptErr } = await admin.from("user_quest_attempts").insert({
    user_id: user.id,
    quest_id,
    was_correct: correct,
    user_answer,
    xp_awarded: xp,
  });
  if (attemptErr) {
    return NextResponse.json({ error: attemptErr.message }, { status: 500 });
  }

  // Quest-count badges (idempotent via ON CONFLICT)
  if (correct) {
    const { count } = await admin
      .from("user_quest_attempts")
      .select("quest_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("was_correct", true);
    const total = count ?? 0;
    const codes: string[] = [];
    if (total === 10) codes.push("quest_10");
    if (total === 50) codes.push("quest_50");
    if (codes.length > 0) {
      const { data: badges } = await admin
        .from("badges")
        .select("id")
        .in("code", codes);
      if (badges && badges.length > 0) {
        await admin
          .from("user_badges")
          .upsert(
            badges.map((b) => ({ user_id: user.id, badge_id: b.id })),
            { onConflict: "user_id,badge_id", ignoreDuplicates: true },
          );
      }
    }
  }

  return NextResponse.json({
    was_correct: correct,
    xp_awarded: xp,
    correct_answer: quest.correct_answer,
    explanation_mn: quest.explanation_mn,
    explanation_en: quest.explanation_en,
  });
}

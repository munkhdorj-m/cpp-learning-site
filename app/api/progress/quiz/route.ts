import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";

import { getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import { parseItemKey, resolveItem } from "@/lib/progress/items";
import { dueOn, nextReview, type ReviewState } from "@/lib/progress/schedule";

/**
 * Records one quiz answer and schedules when to ask again.
 *
 * Whether the answer was right is decided here, from the question itself,
 * rather than trusted from the browser — otherwise the class statistics a
 * teacher relies on could be edited by anyone with dev tools open.
 */

const answer = z.object({
  key: z.string().min(3).max(160),
  choice: z.number().int().min(0).max(25),
});

export async function POST(request: Request) {
  const user = await getCachedSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = answer.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { key, choice } = parsed.data;

  if (!parseItemKey(key)) {
    return NextResponse.json({ error: "unknown_item" }, { status: 400 });
  }
  const card = resolveItem(key, true);
  if (!card) return NextResponse.json({ error: "unknown_item" }, { status: 400 });

  const correct = choice === card.answer;

  try {
    await query(
      `INSERT INTO quiz_answers (id, user_id, item_key, choice, correct)
       VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), user.id, key, choice, correct ? 1 : 0],
    );

    const prev = await query<ReviewState>(
      `SELECT interval_days AS intervalDays, streak, lapses
         FROM review_items WHERE user_id = ? AND item_key = ?`,
      [user.id, key],
    );
    const state = nextReview(prev[0] ?? null, correct);

    await query(
      `INSERT INTO review_items
         (user_id, item_key, due_on, interval_days, streak, lapses, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(6))
       ON DUPLICATE KEY UPDATE
         due_on = VALUES(due_on),
         interval_days = VALUES(interval_days),
         streak = VALUES(streak),
         lapses = VALUES(lapses),
         last_seen = CURRENT_TIMESTAMP(6)`,
      [user.id, key, dueOn(state), state.intervalDays, state.streak, state.lapses],
    );

    return NextResponse.json({ ok: true, correct, dueInDays: state.intervalDays });
  } catch {
    // A quiz should still work when the database is having a bad day.
    return NextResponse.json({ ok: false, correct }, { status: 200 });
  }
}

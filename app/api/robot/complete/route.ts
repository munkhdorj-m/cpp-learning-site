import { NextResponse } from "next/server";
import { z } from "zod";

import {
  findLevel,
  dbRowToLevel,
  mergeLevels,
} from "@/app/(app)/game/robot/levels";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { addXp } from "@/lib/gamification";
import { hasTable } from "@/lib/mysql/has-table";

const schema = z.object({
  level_id: z.string().min(1).max(40),
  instruction_count: z.coerce.number().int().min(0).max(200),
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

  const { level_id, instruction_count } = parsed.data;

  // Check built-in levels first, then fall back to DB custom levels.
  const builtinLevel = findLevel(level_id);
  let xpReward = builtinLevel?.xp_reward ?? 0;
  if (!builtinLevel) {
    const svc = createServiceClient();
    const { data: dbLevel } = await svc
      .from("robot_levels")
      .select("*")
      .eq("id", level_id)
      .maybeSingle();
    if (dbLevel) {
      xpReward = dbRowToLevel(dbLevel).xp_reward;
    } else {
      return NextResponse.json({ error: "level_not_found" }, { status: 404 });
    }
  }

  const admin = createServiceClient();

  // Already completed?
  const { data: existing } = await admin
    .from("robot_progress")
    .select("xp_awarded")
    .eq("user_id", user.id)
    .eq("level_id", level_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      already_completed: true,
      xp_awarded: 0,
      previous_xp: existing.xp_awarded,
    });
  }

  const { error } = await admin.from("robot_progress").insert({
    user_id: user.id,
    level_id,
    xp_awarded: xpReward,
    instruction_count,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award XP (was the on_robot_progress trigger).
  if (xpReward > 0) await addXp(user.id, xpReward);

  // Badges.
  //
  // "Finish every level" is counted against the levels a student can actually
  // play. It used to be LEVELS.length + (rows in robot_levels), which
  // double-counted every override — an override is the SAME level, not an
  // extra one — so the target sat above the real number of levels and the
  // badge could not be earned by anybody. Both sides of the comparison now
  // come from the merged, de-duplicated, not-hidden set: exactly what the
  // game shows.
  // Same guard as the pages: finishing a level must not 500 because the
  // hide-a-level migration has not been run yet.
  const canHide = await hasTable("robot_hidden_levels");
  const [progressRes, dbRes, hiddenRes] = await Promise.all([
    admin.from("robot_progress").select("level_id").eq("user_id", user.id),
    admin.from("robot_levels").select("*"),
    canHide
      ? admin.from("robot_hidden_levels").select("level_id")
      : Promise.resolve({ data: [] as { level_id: string }[] }),
  ]);

  const hiddenIds = ((hiddenRes.data ?? []) as { level_id: string }[]).map(
    (r) => r.level_id,
  );
  const dbLevels = ((dbRes.data ?? []) as Record<string, unknown>[]).map((r) =>
    dbRowToLevel(r as Parameters<typeof dbRowToLevel>[0]),
  );
  const playable = mergeLevels(dbLevels, hiddenIds);
  const playableIds = new Set(playable.map((l) => l.id));

  const solvedIds = ((progressRes.data ?? []) as { level_id: string }[]).map(
    (r) => r.level_id,
  );
  const solved = solvedIds.length;
  // Progress rows survive a level being hidden, so the "all levels" count is
  // taken over playable levels only — otherwise an old solve of a removed
  // level would pay for a level still on the board.
  const solvedPlayable = solvedIds.filter((id) => playableIds.has(id)).length;

  const codes: string[] = [];
  if (solved >= 3) codes.push("robot_3");
  if (instruction_count > 0 && instruction_count <= 5) codes.push("robot_short");
  if (playable.length > 0 && solvedPlayable >= playable.length) {
    codes.push("robot_all");
  }
  if (codes.length > 0) {
    const { data: badges } = await admin
      .from("badges")
      .select("id")
      .in("code", codes);
    if (badges && badges.length > 0) {
      await admin.from("user_badges").upsert(
        badges.map((b) => ({ user_id: user.id, badge_id: b.id })),
        { onConflict: "user_id,badge_id", ignoreDuplicates: true },
      );
    }
  }

  return NextResponse.json({
    already_completed: false,
    xp_awarded: xpReward,
  });
}

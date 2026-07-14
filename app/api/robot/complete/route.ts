import { NextResponse } from "next/server";
import { z } from "zod";

import { findLevel, dbRowToLevel } from "@/app/(app)/game/robot/levels";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

  // Badges: count solved levels for this user
  const { count } = await admin
    .from("robot_progress")
    .select("level_id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const solved = count ?? 0;
  const codes: string[] = [];
  if (solved >= 3) codes.push("robot_3");
  if (instruction_count > 0 && instruction_count <= 5) codes.push("robot_short");
  // Award "robot_all" if they've solved every level (built-in + DB custom).
  const { LEVELS } = await import("@/app/(app)/game/robot/levels");
  const { count: dbCount } = await admin
    .from("robot_levels")
    .select("id", { count: "exact", head: true });
  const totalLevels = LEVELS.length + (dbCount ?? 0);
  if (solved >= totalLevels) codes.push("robot_all");
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

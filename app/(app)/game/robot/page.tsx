import { createClient } from "@/lib/supabase/server";

import { RobotClient } from "./robot-client";
import { dbRowToLevel, mergeLevels, type Level } from "./levels";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find the Egg",
};

export default async function RobotPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  // has no logged-out read path; crashes anonymous
  await requireAuth();

  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [progressRes, dbRes, hiddenRes] = await Promise.all([
    supabase.from("robot_progress").select("level_id").eq("user_id", user.id),
    supabase.from("robot_levels").select("*"),
    supabase.from("robot_hidden_levels").select("level_id"),
  ]);

  const completedLevelIds = (progressRes.data ?? []).map((r) => r.level_id);

  // Merge DB levels with built-in levels (DB overrides same IDs)
  const dbLevels: Level[] = (
    (dbRes.data ?? []) as Record<string, unknown>[]
  ).map((r) => dbRowToLevel(r as Parameters<typeof dbRowToLevel>[0]));
  const hiddenIds = (hiddenRes.data ?? []).map(
    (r: { level_id: string }) => r.level_id,
  );
  const allLevels = mergeLevels(dbLevels, hiddenIds);
  const total = allLevels.length;

  return (
    <RobotClient
      completedLevelIds={completedLevelIds}
      startLevelId={sp.level}
      allLevels={allLevels}
      totalLevels={total}
    />
  );
}

import { createClient } from "@/lib/supabase/server";

import { RobotClient } from "./robot-client";
import { LEVELS, dbRowToLevel, mergeLevels, type Level } from "./levels";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Robot Programmer",
};

export default async function RobotPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [progressRes, dbRes] = await Promise.all([
    supabase.from("robot_progress").select("level_id").eq("user_id", user.id),
    supabase.from("robot_levels").select("*"),
  ]);

  const completedLevelIds = (progressRes.data ?? []).map((r) => r.level_id);

  // Merge DB levels with built-in levels (DB overrides same IDs)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dbRowToLevel accepts a flexible DB row shape
  const dbLevels: Level[] = (
    (dbRes.data ?? []) as Record<string, unknown>[]
  ).map((r) => dbRowToLevel(r as Parameters<typeof dbRowToLevel>[0]));
  const allLevels = mergeLevels(dbLevels);
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

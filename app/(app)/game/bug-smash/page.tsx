import { getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import { MAX_DAILY_PLAYS, ulaanbaatarToday } from "@/lib/bug-smash";

import { GameClient } from "./game-client";

export const metadata = {
  title: "Debug",
};

export const dynamic = "force-dynamic";


export default async function GamePage() {
  const user = await getCachedSession();

  // A signed-out visitor can look at the game; nothing they do is recorded,
  // so there is no count to show them and no round to withhold.
  let playsUsed = 0;
  if (user) {
    const rows = await query<{ plays: number }>(
      "SELECT plays FROM game_attempts WHERE user_id = ? AND day = ?",
      [user.id, ulaanbaatarToday()],
    );
    playsUsed = rows[0]?.plays ?? 0;
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <GameClient
        playsUsed={Math.min(playsUsed, MAX_DAILY_PLAYS)}
        limit={MAX_DAILY_PLAYS}
      />
    </div>
  );
}

// The badge that existed in the database and nothing ever awarded.
//
// `class_champion` shipped as a row in the badges table with no code behind
// it, so students saw a badge they could never get. The rule below is what it
// means now, and lib/badges.ts states the same rule to students in both
// languages — if one changes, so must the other.
//
// `quest_perfect_day` used to live here too. It went when the daily quests
// did — see migration/remove-quest-badges.sql.

import { query } from "./mysql/pool";

/**
 * XP a student earned in their class over the last seven days.
 *
 * Counts both halves of the game — solving problems and answering quests —
 * because a badge that ignored one of them would quietly tell students which
 * half we thought mattered.
 */
interface Standing {
  user_id: string;
  xp: number;
}

async function weeklyStandings(classId: string): Promise<Standing[]> {
  const rows = await query<{ user_id: string; xp: string | number }>(
    `SELECT p.id AS user_id, COALESCE(SUM(x.xp), 0) AS xp
       FROM profiles p
       LEFT JOIN (
         SELECT user_id, xp_awarded AS xp, created_at AS at
           FROM submissions
          WHERE xp_awarded > 0
         UNION ALL
         SELECT user_id, xp_awarded AS xp, answered_at AS at
           FROM user_quest_attempts
          WHERE xp_awarded > 0
       ) x ON x.user_id = p.id AND x.at >= NOW() - INTERVAL 7 DAY
      WHERE p.class_id = ? AND p.role = 'student'
      GROUP BY p.id
      ORDER BY xp DESC`,
    [classId],
  );
  return rows.map((r) => ({ user_id: r.user_id, xp: Number(r.xp) }));
}

/**
 * Top of the class for the week.
 *
 * Three guards, each of which stops the badge being worthless:
 *
 *   * a class of one has no top, so nothing is awarded
 *   * zero XP is not a win, however few classmates there are
 *   * a tie awards nobody, because "champion" plural is not a thing
 *
 * Evaluated over a rolling seven days whenever the student earns XP, which is
 * why lib/badges.ts words it as "over the last 7 days" rather than promising a
 * fixed week that nothing here could measure.
 */
export async function earnedClassChampion(
  userId: string,
  classId: string | null | undefined,
): Promise<boolean> {
  if (!classId) return false;

  const standings = await weeklyStandings(classId);
  if (standings.length < 2) return false;

  const leader = standings[0];
  const runnerUp = standings[1];
  if (leader.xp <= 0) return false;
  if (leader.xp === runnerUp.xp) return false;

  return leader.user_id === userId;
}

// What each badge actually takes, and how close you are.
//
// The `badges` table has a description, but a description is not a rule:
// "7 days in a row" does not say in a row of WHAT, and "First Try" does not
// say first try at what. A student looking at a locked badge should be able to
// read exactly what to go and do.
//
// Every requirement here was read off the code that awards it — see the
// `awardBadges` calls in app/api/submit, app/api/robot/complete and
// app/api/game/submit-score. If an award condition changes, this file has to
// change with it or the site starts lying to students about how to earn
// things.
//
// The three daily-quest badges were removed with the daily quests
// themselves — see migration/remove-quest-badges.sql.

export interface BadgeSpec {
  /** Matches badges.code in the database. */
  code: string;
  requirement_en: string;
  requirement_mn: string;
  /** Where a student goes to work on it. */
  href?: string;
  /**
   * Countable progress, where the profile already knows the number. Badges
   * that are one-off events ("solve a Hard problem") have none: there is
   * nothing to show but locked or earned.
   */
  progress?: { field: "problems_solved" | "streak_days"; target: number };
  /**
   * Kept for the next time a badge row ships ahead of the code that awards it.
   * Nothing sets it today: every badge in the database is now reachable.
   */
  unobtainable?: boolean;
}

export const BADGE_SPECS: BadgeSpec[] = [
  {
    code: "first_solve",
    requirement_en: "Get any problem accepted.",
    requirement_mn: "Ямар нэг бодлогыг зөв бөглөж, хүлээн авагдуул.",
    href: "/problems",
    progress: { field: "problems_solved", target: 1 },
  },
  {
    code: "ten_solved",
    requirement_en: "Solve 10 problems.",
    requirement_mn: "10 бодлого бод.",
    href: "/problems",
    progress: { field: "problems_solved", target: 10 },
  },
  {
    code: "fifty_solved",
    requirement_en: "Solve 50 problems.",
    requirement_mn: "50 бодлого бод.",
    href: "/problems",
    progress: { field: "problems_solved", target: 50 },
  },
  {
    code: "hundred_solved",
    requirement_en: "Solve 100 problems.",
    requirement_mn: "100 бодлого бод.",
    href: "/problems",
    progress: { field: "problems_solved", target: 100 },
  },
  {
    code: "streak_7",
    requirement_en: "Solve at least one problem a day, 7 days running.",
    requirement_mn: "7 хоног дараалан өдөрт дор хаяж нэг бодлого бод.",
    href: "/problems",
    progress: { field: "streak_days", target: 7 },
  },
  {
    code: "streak_30",
    requirement_en: "Solve at least one problem a day, 30 days running.",
    requirement_mn: "30 хоног дараалан өдөрт дор хаяж нэг бодлого бод.",
    href: "/problems",
    progress: { field: "streak_days", target: 30 },
  },
  {
    code: "first_hard",
    requirement_en: "Solve a problem marked Hard.",
    requirement_mn: "Хүнд гэж тэмдэглэгдсэн бодлогыг бод.",
    href: "/problems",
  },
  {
    code: "first_try",
    requirement_en:
      "Get a problem accepted on your very first submission for it — no earlier attempts.",
    requirement_mn:
      "Бодлогыг хамгийн эхний илгээлтээрээ зөв бөглө — өмнө нь оролдоогүй байх.",
    href: "/problems",
  },
  {
    code: "first_smash",
    requirement_en: "Play one round of Bug Smash.",
    requirement_mn: "Bug Smash тоглоомыг нэг удаа тогло.",
    href: "/game/bug-smash",
  },
  {
    code: "smash_100",
    requirement_en: "Score 100 in a single round of Bug Smash.",
    requirement_mn: "Bug Smash-д нэг тойрогт 100 оноо ав.",
    href: "/game/bug-smash",
  },
  {
    code: "smash_combo",
    requirement_en: "Reach a 10-hit combo in one round of Bug Smash.",
    requirement_mn: "Bug Smash-д нэг тойрогт 10 дараалсан цохилт хий.",
    href: "/game/bug-smash",
  },
  {
    code: "robot_3",
    requirement_en: "Finish 3 robot levels.",
    requirement_mn: "Роботын 3 түвшинг дүүргэ.",
    href: "/game/robot",
  },
  {
    code: "robot_all",
    requirement_en: "Finish every robot level.",
    requirement_mn: "Роботын бүх түвшинг дүүргэ.",
    href: "/game/robot",
  },
  {
    code: "robot_short",
    requirement_en: "Finish a robot level using 5 instructions or fewer.",
    requirement_mn: "Роботын түвшинг 5 ба түүнээс бага командаар дүүргэ.",
    href: "/game/robot",
  },
  {
    code: "class_champion",
    requirement_en:
      "Be the top XP earner in your class over the last 7 days. Ties award nobody.",
    requirement_mn:
      "Сүүлийн 7 хоногт ангидаа хамгийн их XP цуглуул. Тэнцвэл хэнд ч өгөхгүй.",
    href: "/leaderboard",
  },
];

const BY_CODE = new Map(BADGE_SPECS.map((s) => [s.code, s]));

export function specFor(code: string): BadgeSpec | undefined {
  return BY_CODE.get(code);
}

export interface BadgeProgress {
  current: number;
  target: number;
}

/** How far along a countable badge is, from the numbers the profile holds. */
export function progressFor(
  code: string,
  stats: { problems_solved?: number; streak_days?: number },
): BadgeProgress | null {
  const spec = BY_CODE.get(code);
  if (!spec?.progress) return null;
  const current = stats[spec.progress.field] ?? 0;
  return { current: Math.min(current, spec.progress.target), target: spec.progress.target };
}

/**
 * Every badge, earned first and then the ones still to get.
 *
 * Unobtainable ones sink to the bottom: they are worth being honest about but
 * not worth putting in front of a student who could be earning a real one.
 */
export function orderBadges<T extends { code: string; earned_at?: string | null }>(
  badges: T[],
): T[] {
  const rank = (b: T) => {
    if (b.earned_at) return 0;
    return BY_CODE.get(b.code)?.unobtainable ? 2 : 1;
  };
  return [...badges].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    // Within earned, newest first; within locked, keep the declared order.
    if (a.earned_at && b.earned_at) {
      return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime();
    }
    // A code with no spec sorts last rather than first: findIndex returns -1
    // for one, and -1 would put an unknown badge at the head of the list. That
    // happens in the window between deploying a badge removal and running the
    // migration that deletes its row.
    const at = (x: T) => {
      const i = BADGE_SPECS.findIndex((s) => s.code === x.code);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    return at(a) - at(b);
  });
}

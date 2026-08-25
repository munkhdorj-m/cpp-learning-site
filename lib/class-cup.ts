/**
 * The Class Cup: which class is doing best this week.
 *
 * Two things were wrong with ranking classes by total XP.
 *
 * The first is size. A class of 35 out-earns a class of 5 by simply existing,
 * so the table was really a list of which years are biggest — the small senior
 * classes could never appear near the top no matter how hard they worked.
 * Ranking is by XP PER STUDENT now, which is the thing a class can actually
 * influence.
 *
 * The second is that everyone was in one table. A 7th-year class and a 12th-
 * year class are not doing the same work, so comparing them says very little.
 * Classes are grouped into divisions and ranked inside their own: each of the
 * younger years against itself, and the senior years pooled together because
 * there are too few classes in each to make a table of one.
 */

/** Grades from here up are pooled into a single senior division. */
export const SENIOR_FROM = 9;

export interface ClassRow {
  class_id: string;
  class_name: string;
  grade: number;
  week_xp: number;
  student_count: number;
}

export interface RankedClass extends ClassRow {
  /** XP per student this week. The number the table is ordered by. */
  average: number;
  /** 1-based, within the division. */
  rank: number;
  /** Share of the division leader's average, for the bar. 0–100. */
  share: number;
}

export interface Division {
  key: string;
  /** The grades in this division, ascending — for the heading. */
  grades: number[];
  classes: RankedClass[];
}

/**
 * Which division a grade belongs to.
 *
 * Every grade below the senior cut gets its own, so a 7th-year class is only
 * ever compared with other 7th-year classes. Grades 9 and up share one: the
 * school has a handful of classes across those four years, and four tables of
 * one class each is not a competition.
 */
export function divisionFor(grade: number): string {
  return grade >= SENIOR_FROM ? "senior" : String(grade);
}

/** XP per student, rounded to one decimal so 4.0 and 4.4 do not both read "4". */
export function averageXp(weekXp: number, studentCount: number): number {
  if (!studentCount || studentCount <= 0) return 0;
  return Math.round((weekXp / studentCount) * 10) / 10;
}

/**
 * Group classes into divisions and rank each division by average XP.
 *
 * A class with no students is dropped rather than ranked: its average would be
 * a division by zero, and an empty class is not competing.
 *
 * Ties break on total XP, then on name, so the order is stable between renders
 * rather than wandering with whatever the database returned first.
 */
export function buildDivisions(rows: ClassRow[]): Division[] {
  const byKey = new Map<string, ClassRow[]>();

  for (const r of rows) {
    const count = Number(r.student_count);
    if (!count || count <= 0) continue;
    const key = divisionFor(Number(r.grade));
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(r);
  }

  const divisions: Division[] = [];

  for (const [key, list] of byKey) {
    const withAverage = list.map((r) => ({
      ...r,
      grade: Number(r.grade),
      week_xp: Number(r.week_xp),
      student_count: Number(r.student_count),
      average: averageXp(Number(r.week_xp), Number(r.student_count)),
    }));

    withAverage.sort(
      (a, b) =>
        b.average - a.average ||
        b.week_xp - a.week_xp ||
        a.class_name.localeCompare(b.class_name),
    );

    const best = withAverage[0]?.average ?? 0;

    divisions.push({
      key,
      grades: [...new Set(withAverage.map((c) => c.grade))].sort((a, b) => a - b),
      classes: withAverage.map((c, i) => ({
        ...c,
        rank: i + 1,
        // Every average being zero is the normal state early in a week. A bar
        // at 100% for a class that has earned nothing reads as a win, so an
        // all-zero division shows empty bars instead of full ones.
        share: best > 0 ? (c.average / best) * 100 : 0,
      })),
    });
  }

  // Youngest first, seniors last.
  divisions.sort((a, b) => {
    const rank = (d: Division) =>
      d.key === "senior" ? Number.MAX_SAFE_INTEGER : (d.grades[0] ?? 0);
    return rank(a) - rank(b);
  });

  return divisions;
}

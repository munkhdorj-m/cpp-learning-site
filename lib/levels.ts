/**
 * The level curve, in one place.
 *
 * level = floor(sqrt(xp / 50)) + 1, which inverts to: level L begins at
 * (L-1)² × 50 XP. Quadratic, so each level costs more than the last — 50 XP
 * to reach level 2, 350 more to reach 4, 950 more to reach 10.
 *
 * There is NO maximum. The formula has no ceiling and nothing caps it, so the
 * ladder goes on as far as a student can climb; in practice the quadratic gap
 * is the limit. If a top level is ever wanted, it belongs here and nowhere
 * else.
 *
 * Kept apart from lib/gamification.ts because that module opens a database
 * connection, and this maths is needed in the browser too — the XP bar shows
 * it on hover.
 */

/** XP at which `level` begins. Level 1 begins at 0. */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return (l - 1) ** 2 * 50;
}

/** The level a given amount of XP puts you at. Minimum 1. */
export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1);
}

export interface LevelProgress {
  level: number;
  /** XP at the start of this level, and at the start of the next. */
  from: number;
  to: number;
  /** How far into this level they are, and how much the level costs. */
  into: number;
  span: number;
  /** Still to go before the next level. */
  remaining: number;
  /** 0–100, clamped. */
  pct: number;
}

/**
 * Where someone is within their level.
 *
 * `level` is passed in rather than derived, because profiles.level is stored
 * and could disagree with the XP after a manual edit; showing the bar for the
 * level the rest of the site says they are is less confusing than quietly
 * disagreeing with it.
 */
export function levelProgress(xp: number, level: number): LevelProgress {
  const from = xpForLevel(level);
  const to = xpForLevel(level + 1);
  const span = Math.max(1, to - from);
  const into = Math.max(0, xp - from);
  return {
    level,
    from,
    to,
    into,
    span,
    remaining: Math.max(0, to - xp),
    pct: Math.max(0, Math.min(100, (into / span) * 100)),
  };
}

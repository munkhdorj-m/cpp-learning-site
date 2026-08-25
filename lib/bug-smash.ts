/**
 * Bug Smash rules that more than one file needs to agree on.
 *
 * The page disables the button and the route refuses the round; if those two
 * ever disagree, a student either loses a round they were owed or plays one
 * that is silently discarded. One number, imported twice.
 */

/** Rounds a student may play in a day. */
export const MAX_DAILY_PLAYS = 3;

/**
 * The Ulaanbaatar-local day a round counts against.
 *
 * Not UTC: UTC midnight falls at 08:00 local, in the middle of a school
 * morning, which would hand half a class a fresh set of rounds during a
 * lesson.
 */
export function ulaanbaatarToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

// Generating logins for a whole class at once.
//
// These are read off a paper slip by a 12-year-old, often on a keyboard they
// don't own, so everything here optimises for "easy to type correctly":
// lowercase only, no Cyrillic, and no characters that look like each other.

import { randomInt } from "node:crypto";

/** Cyrillic → Latin, so a name typed in Mongolian still yields a typeable login. */
const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j",
  з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
  ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

export function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in CYRILLIC ? CYRILLIC[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 14);
}

/** Final grade of school — the year a student in this grade graduates. */
export const FINAL_GRADE = 12;

/**
 * The calendar year the current school year ENDS in.
 * The Mongolian school year runs Sept–June, so anything from June onwards
 * already belongs to the year that finishes next summer.
 */
export function academicEndYear(date = new Date()): number {
  return date.getMonth() >= 5 ? date.getFullYear() + 1 : date.getFullYear();
}

/**
 * The year a student currently in `grade` will graduate.
 * In the 2026–27 school year: grade 12 → 2027, 11 → 2028, … 8 → 2031.
 */
export function graduationYear(grade: number, date = new Date()): number {
  return academicEndYear(date) + (FINAL_GRADE - grade);
}

/**
 * Two-digit graduation year used as the username prefix, e.g. 2031 -> "31".
 * "Class of 2031" is how schools already talk about a cohort, and unlike the
 * grade it never changes as the student moves up.
 */
export function gradePrefix(grade: number, date = new Date()): string {
  return String(graduationYear(grade, date) % 100).padStart(2, "0");
}

/**
 * `31.bat` — prefixed with the year the student GRADUATES, not their class.
 *
 * A username is permanent (it is how they log in), so it must never contain
 * something that changes. Grade changes every year; the graduation year does
 * not. It is also how schools already refer to a cohort ("class of 2031"),
 * and it keeps each intake from colliding with the next.
 */
export function makeUsername(
  fullName: string,
  yearPrefix: string,
  taken: Set<string>,
): string {
  const first = transliterate(fullName.trim().split(/\s+/)[0] || "student");
  const prefix = transliterate(yearPrefix) || "s";
  const base = `${prefix}.${first || "student"}`.slice(0, 20);

  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}${n}`.slice(0, 20);
    if (!taken.has(candidate)) {
      taken.add(candidate);
      return candidate;
    }
  }
  const fallback = `${prefix}.${Date.now().toString(36)}`.slice(0, 20);
  taken.add(fallback);
  return fallback;
}

// Short, concrete, easy to spell.
const ADJECTIVES = [
  "red", "blue", "gold", "green", "big", "fast", "cool", "warm",
  "kind", "brave", "calm", "bright", "happy", "quick", "sharp", "quiet",
  "clever", "strong", "silver", "sunny",
];
const NOUNS = [
  "fox", "cat", "bear", "wolf", "star", "moon", "tree", "lion",
  "bird", "fish", "rock", "wind", "river", "cloud", "tiger", "eagle",
  "horse", "stone", "flame", "snow",
];

/**
 * `blue-fox-284`. 20 × 20 × 900 = 360,000 combinations, so a classmate
 * cannot realistically guess one, while it stays readable off a paper slip.
 */
export function makePassword(): string {
  const adj = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const noun = NOUNS[randomInt(NOUNS.length)];
  const num = randomInt(100, 1000); // three digits, never leading zero
  return `${adj}-${noun}-${num}`;
}

/** Students rarely have email, so give them a stable internal placeholder. */
export function placeholderEmail(username: string): string {
  return `${username}@students.local`;
}

export interface GeneratedStudent {
  displayName: string;
  username: string;
  password: string;
  email: string;
}

export function generateForNames(
  names: string[],
  yearPrefix: string,
  taken: Set<string>,
): GeneratedStudent[] {
  return names
    .map((n) => n.trim())
    .filter(Boolean)
    .map((displayName) => {
      const username = makeUsername(displayName, yearPrefix, taken);
      return {
        displayName: displayName.slice(0, 60),
        username,
        password: makePassword(),
        email: placeholderEmail(username),
      };
    });
}

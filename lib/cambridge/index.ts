// Cambridge International Computer Science study notes.
//
// Topics are split into one file per level because the full syllabus is long.
// Everything is re-exported here so pages can import from "@/lib/cambridge".

import { IGCSE_TOPICS } from "./igcse";
import { AS_TOPICS } from "./as";
import { A_LEVEL_TOPICS } from "./a-level";
import { LEVELS, type LevelId, type Topic } from "./types";
import { QUIZZES } from "./quizzes";
import { QUIZZES_2 } from "./quizzes-2";

export { LEVELS };

/** Every topic quiz, keyed by "level/slug". */
export const ALL_QUIZZES = { ...QUIZZES, ...QUIZZES_2 };
export type { QuizQuestion } from "./quizzes";
export type { Level, LevelId, Topic } from "./types";

export const TOPICS: Topic[] = [
  ...IGCSE_TOPICS,
  ...AS_TOPICS,
  ...A_LEVEL_TOPICS,
];

export function levelById(id: string) {
  return LEVELS.find((l) => l.id === id);
}

export function topicsForLevel(level: LevelId): Topic[] {
  return TOPICS.filter((t) => t.level === level);
}

export function findTopic(level: string, slug: string): Topic | undefined {
  return TOPICS.find((t) => t.level === level && t.slug === slug);
}

/** Unit headings in the order they appear, for grouping a level's topics. */
export function unitsForLevel(level: LevelId): string[] {
  return [...new Set(topicsForLevel(level).map((t) => t.unit))];
}

/** Self-check questions for a topic, if it has any. */
export function quizFor(level: string, slug: string) {
  return ALL_QUIZZES[`${level}/${slug}`] ?? null;
}

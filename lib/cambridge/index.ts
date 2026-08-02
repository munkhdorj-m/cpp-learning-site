// Cambridge International Computer Science study notes.
//
// Topics are split into one file per level because the full syllabus is long.
// Everything is re-exported here so pages can import from "@/lib/cambridge".

import { IGCSE_TOPICS } from "./igcse";
import { AS_TOPICS } from "./as";
import { A_LEVEL_TOPICS } from "./a-level";
import { LEVELS, type LevelId, type Topic } from "./types";

export { LEVELS };
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

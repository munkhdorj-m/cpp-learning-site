// Files problems under the topics taught in the Learn course.
//
// Problems carry free-form tags (imported from SPOJ, or typed by a teacher),
// so this is the single place that decides which lesson a problem practises.
// The problems list and the "practise this" link on a lesson both use it, so
// a student filtering by "Arrays" gets exactly what the arrays lesson taught.
//
// Matching is by EXACT tag, never substring: "implementation" contains "io",
// "formula" contains "for", and "minimum-spanning-tree" contains "min" — a
// substring rule quietly files graph problems under Reading Input.

import { LESSONS, UNITS, lessonIndex } from "./lessons";

/** A problem sits under one lesson slug, or in the after-the-course bucket. */
export const CHALLENGE = "challenge";

/**
 * Exact tag -> the lesson that tag practises.
 *
 * Every tag currently in the database is listed. Anything unknown falls into
 * CHALLENGE, so a new problem is never silently dropped from the list.
 */
const TAG_TOPIC: Record<string, string> = {};

function assign(topic: string, tags: string[]) {
  for (const t of tags) TAG_TOPIC[t] = topic;
}

// ── Unit 1 · First Steps ────────────────────────────────────────────────
assign("hello-world", ["intro", "basic"]);
assign("printing", ["output", "printing", "io-formatting"]);

// ── Unit 2 · Storing Information ────────────────────────────────────────
assign("comments", ["comments"]);
assign("variables", ["swap", "variables"]);
assign("types", ["floating-point", "rounding", "integer", "big-numbers"]);
assign("input", [
  "io",
  "basic-io",
  "input-output",
  "basic-input-output",
  "basics",
]);
assign("math", [
  "math",
  "basic-math",
  "arithmetic",
  "basic-arithmetic",
  "integer-arithmetic",
  "formula",
  "modulo",
  "divisibility",
  "divisors",
  "integer-division",
  "multiplication",
  "product",
  "sum",
  "summation",
  "digits",
  "digit-sum",
  "digit-extraction",
  "digit-manipulation",
  "armstrong-number",
  "number-theory",
  "primes",
  "gcd",
  "lcm",
  "factorial",
  "exponentiation",
  "parity",
  "even-numbers",
  "combinatorics",
  "permutation",
  "arithmetic-progression",
  "geometric-series",
  "time-conversion",
  "base-conversion",
  // Geometry here is formula work — area, distance, angles — not drawing.
  "geometry",
  "trigonometry",
  "heron-formula",
  "euclidean-distance",
  "torque",
  "balance",
  "limit",
  "quadrant",
]);

// The lessons added later needed tags of their own — without one, nothing can
// ever be filed under them.
assign("operators", ["operators", "increment", "compound-assignment"]);
assign("type-conversion", ["type-conversion", "cast", "casting"]);

// ── Unit 3 · Making Decisions ───────────────────────────────────────────
assign("if-else", [
  "if-else",
  "conditional",
  "conditionals",
  "conditional-statements",
  "conditional-sum",
  "triangle-inequality",
]);
assign("conditions", ["comparison"]);
assign("switch", ["switch", "ternary", "menu"]);

// ── Unit 4 · Repeating Things ───────────────────────────────────────────
assign("for-loop", [
  "for-loop",
  "loop",
  "loops",
  "iteration",
  "counting",
  "sequence",
  "fibonacci",
]);
assign("while-loop", ["while-loop"]);
assign("loop-control", ["break-continue", "do-while", "sentinel"]);
assign("putting-it-together", [
  "implementation",
  "simulation",
  "ad-hoc",
  "brute-force",
  "constructive",
  "observations",
  "time-calculation",
  "translation",
  "chess",
  "queen",
]);

// ── Unit 5 · Text and Lists ─────────────────────────────────────────────
assign("strings", [
  "string",
  "strings",
  "character",
  "ascii",
  "palindrome",
  "reversal",
  "bracket-matching",
]);
assign("getline", ["getline", "whole-line"]);
assign("string-tools", [
  "substring",
  "string-search",
  "string-convert",
  "string-case",
]);
assign("arrays", ["array", "arrays", "array-manipulation", "indexing"]);
assign("array-loops", [
  "linear-search",
  "sorting",
  "sorting-check",
  "max-element",
  "maximum",
  "maximum-difference",
  "minimum",
  "max",
  "min",
  "frequency",
  "prefix-sum",
  "difference-array",
  "sliding-window",
  "maximum-subarray",
  "kadane",
  "majority-vote",
  "reconstruction",
]);

// ── Unit 6 · Bigger Programs ────────────────────────────────────────────
assign("nested-loops", [
  "nested-loops",
  "matrix",
  "matrix-fill",
  "2d-array",
  "grid",
  "diagonal",
  "anti-diagonal",
  "rotation",
  "spiral",
  "pattern",
  "patterns",
  "pattern-printing",
  "stars-and-bars",
  "snake-pattern",
  "rhombus",
  "symmetry",
  "symmetric",
]);
assign("functions", ["recursion", "function", "functions"]);
assign("function-details", [
  "reference-parameter",
  "default-argument",
  "overloading",
]);
assign("structs", ["struct", "structs", "record"]);
assign("vectors", ["sets", "hash-set", "hash-map", "stack", "priority-queue"]);

// ── Beyond the course ───────────────────────────────────────────────────
// Real techniques, but none of them are taught in the 19 lessons. Grouping
// them separately keeps the course topics honest and gives strong students
// somewhere to go.
assign(CHALLENGE, [
  "dynamic-programming",
  "dp",
  "dp-on-digits",
  "digit-dp",
  "memoization",
  "lcs",
  "lis",
  "subsequence",
  "edit-distance",
  "levenshtein-distance",
  "partition",
  "greedy",
  "scheduling",
  "graph",
  "graphs",
  "tree",
  "bfs",
  "dfs",
  "shortest-path",
  "graph-coloring",
  "minimum-spanning-tree",
  "net-flow",
  "bit-manipulation",
  "binary-sequences",
  "sweep-line",
]);

export interface TopicOption {
  /** Lesson slug — also the value used in the ?topic= query. */
  id: string;
  label_mn: string;
  label_en: string;
  /** Position in the course, so problems sort the way lessons are taught. */
  order: number;
  unit: number;
  unitLabel_mn: string;
  unitLabel_en: string;
  /** Lessons link back to /learn; the challenge bucket has no lesson. */
  hasLesson: boolean;
}

const CHALLENGE_OPTION: TopicOption = {
  id: CHALLENGE,
  label_mn: "Нэмэлт сорилт",
  label_en: "Extra Challenge",
  order: LESSONS.length,
  unit: UNITS.length + 1,
  unitLabel_mn: "Хичээлээс цааш",
  unitLabel_en: "Beyond the Course",
  hasLesson: false,
};

/** Every topic a problem can be filed under, in the order it is taught. */
export const TOPIC_OPTIONS: TopicOption[] = [
  ...LESSONS.map((l, i) => {
    const unit = UNITS.find((u) => u.id === l.unit)!;
    return {
      id: l.slug,
      label_mn: l.title_mn,
      label_en: l.title_en,
      order: i,
      unit: l.unit,
      unitLabel_mn: unit.title_mn,
      unitLabel_en: unit.title_en,
      hasLesson: true,
    };
  }),
  CHALLENGE_OPTION,
];

const BY_ID = new Map(TOPIC_OPTIONS.map((o) => [o.id, o]));

export function topicById(id: string): TopicOption | undefined {
  return BY_ID.get(id);
}

/**
 * The one topic a problem is filed under: the LAST thing it needs.
 *
 * A problem tagged both `for-loop` and `array` cannot be attempted until
 * arrays have been taught, so it belongs with arrays. Taking the furthest
 * topic along the course means a student who has reached lesson N can
 * attempt everything filed at or before N.
 */
export function primaryTopic(tags: string[]): string {
  let best = -1;
  let bestId = CHALLENGE;
  for (const raw of tags) {
    const topic = TAG_TOPIC[raw.toLowerCase()];
    if (!topic) continue;
    const order = topic === CHALLENGE ? CHALLENGE_OPTION.order : lessonIndex(topic);
    if (order > best) {
      best = order;
      bestId = topic;
    }
  }
  return bestId;
}

/** Sort key for a problem, so the list runs in the order things are taught. */
export function topicOrder(topicId: string): number {
  return BY_ID.get(topicId)?.order ?? CHALLENGE_OPTION.order;
}

/** How many problems sit under each topic. */
export function countByTopic(problems: { tags: string[] }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of problems) {
    const id = primaryTopic(p.tags);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

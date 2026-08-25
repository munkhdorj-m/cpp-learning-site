/**
 * Deterministic choice ordering for quizzes.
 *
 * Every quiz in the course was authored with `answer: 0` — 26 in lessons.ts,
 * 13 in lessons-python.ts, 64 and 62 in the two Cambridge banks, 165 in total,
 * without exception — and the renderers walked `choices` in source order. The
 * correct answer was therefore always the first button, and a student could
 * score full marks on every quiz on the site without reading a single word.
 * Worse, those answers feed the spaced-repetition table, so the review queue
 * was being told a student had mastered material they never looked at.
 *
 * Fixed here rather than by renumbering 165 `answer` fields: rewriting the
 * content would have to be redone by hand every time a quiz is added, and the
 * next author would still naturally write the right answer first.
 *
 * Deterministic, not random. The order is derived from the quiz's own id, so
 * a student sees the same arrangement on every visit and on every device —
 * a re-render cannot shuffle the buttons under a hovering finger, and "the
 * second one" still means something if a teacher discusses it with a class.
 */

/** FNV-1a. Small, fast, and stable across engines — Math.random is not. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — one seeded generator, good enough to place four buttons. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ShuffledQuiz {
  /** Display position -> index in the original `choices` array. */
  order: number[];
  /** Where the correct answer now sits, in display positions. */
  answerAt: number;
}

/**
 * @param seed  stable id for this quiz — the same string used for review items
 * @param count how many choices there are
 * @param answer index of the correct choice in the ORIGINAL array
 */
export function shuffleQuiz(
  seed: string,
  count: number,
  answer: number,
): ShuffledQuiz {
  const order = Array.from({ length: count }, (_, i) => i);
  const next = rng(hash(seed));

  // Fisher-Yates, seeded.
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return { order, answerAt: order.indexOf(answer) };
}

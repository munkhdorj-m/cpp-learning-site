// When a question should come back.
//
// A plain spaced-repetition schedule. Getting something wrong brings it back
// tomorrow; each correct answer in a row pushes it further out. There is no
// grading of "how well" the student knew it — with four-choice questions a
// self-rating would be noise, and a right/wrong signal is enough to decide
// whether to ask again soon or later.

/** Days until the next sighting, by how many correct answers in a row. */
const INTERVALS = [2, 5, 12, 30, 90];

export interface ReviewState {
  intervalDays: number;
  streak: number;
  lapses: number;
}

export const FIRST_REVIEW: ReviewState = {
  intervalDays: 1,
  streak: 0,
  lapses: 0,
};

/**
 * The state after answering. `correct` decides whether the item moves further
 * away or comes straight back.
 */
export function nextReview(
  previous: ReviewState | null,
  correct: boolean,
): ReviewState {
  const prev = previous ?? FIRST_REVIEW;

  if (!correct) {
    // Straight back to tomorrow. Not today: answering the same question twice
    // in one sitting tests short-term memory, which is not the point.
    return { intervalDays: 1, streak: 0, lapses: prev.lapses + 1 };
  }

  const streak = prev.streak + 1;
  return {
    intervalDays: INTERVALS[Math.min(streak - 1, INTERVALS.length - 1)],
    streak,
    lapses: prev.lapses,
  };
}

/** The date an item is next due, as YYYY-MM-DD in UTC. */
export function dueOn(state: ReviewState, from: Date = new Date()): string {
  const d = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() + state.intervalDays);
  return d.toISOString().slice(0, 10);
}

/** Today, in the same form, so a query can ask for everything due. */
export function today(from: Date = new Date()): string {
  return new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

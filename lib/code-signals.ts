// Signals worth a teacher's attention on one submission.
//
// READ THIS BEFORE CHANGING ANYTHING HERE.
//
// This is deliberately NOT an "AI detector", and it must never grow into one.
// Every published detector of machine-written text has a false-positive rate
// far too high to point at a named child, and on thirty lines of beginner code
// there is simply not enough signal to be right. A number claiming "84% AI"
// would be invented, and a teacher would believe it. Accusing a grade-7
// student of cheating on a fabricated score is worse than missing the cheat.
//
// So this reports EVIDENCE, never a verdict:
//
//   * constructs the course has not taught, which the student would have had
//     to get from somewhere outside it
//   * comments written like documentation rather than like a 13-year-old
//   * a hard problem solved first time, in almost no time
//
// Each one has an innocent explanation — a keen student reads ahead, a careful
// student comments well, a bright student solves it first time. That is the
// point. The output is a prompt to go and look at the work and talk to the
// student, and the wording in the UI says exactly that.

export type Language = "cpp" | "python";

export interface Signal {
  code: string;
  label_en: string;
  label_mn: string;
  /** What was actually found, so a teacher can check rather than trust. */
  detail?: string;
}

export interface SignalReport {
  signals: Signal[];
  /**
   * 0-100, and it means "how much is here worth a look", NOT "how likely is
   * this cheating". Three weak signals score the same as one strong one
   * because that is genuinely how much there is to look at.
   */
  score: number;
}

export interface SubmissionContext {
  difficulty?: "easy" | "medium" | "hard";
  /** Submissions this student already made on this problem. */
  attemptsBefore?: number;
  /** Seconds between their previous activity anywhere and this submission. */
  secondsSincePrevious?: number | null;
}

/**
 * Things the course does not teach.
 *
 * Drawn from lib/lessons.ts: the curriculum runs to vectors, structs, classes,
 * recursion, the standard containers and simple algorithms. Anything here is
 * beyond all twelve units, so a student using it did not get it from us.
 *
 * Being on this list is not wrong — it is unexplained, which is different.
 */
const BEYOND_COURSE: { pattern: RegExp; what: string; language: Language | "any" }[] = [
  { pattern: /\[\s*\]\s*\(/, what: "a lambda", language: "cpp" },
  { pattern: /\bauto\s*&?&?\s*\[/, what: "structured bindings", language: "cpp" },
  { pattern: /\btemplate\s*</, what: "templates", language: "cpp" },
  { pattern: /\bstd::accumulate|\baccumulate\s*\(/, what: "accumulate", language: "cpp" },
  { pattern: /\bunordered_map\b|\bunordered_set\b/, what: "unordered containers", language: "cpp" },
  { pattern: /\bstd::function\b/, what: "std::function", language: "cpp" },
  { pattern: /\bnullptr\b/, what: "nullptr", language: "cpp" },
  { pattern: /\bconstexpr\b|\bnoexcept\b/, what: "constexpr or noexcept", language: "cpp" },
  { pattern: /\bios_base::sync_with_stdio|\bcin\.tie\b/, what: "fast-IO idioms", language: "cpp" },
  { pattern: /\btuple\s*<|\bmake_tuple\b/, what: "tuples", language: "cpp" },
  { pattern: /\biterator\b|->\s*begin\s*\(/, what: "explicit iterators", language: "cpp" },

  { pattern: /\bfor\s+\w+\s+in\s+.*\bif\b.*\]/, what: "a filtered comprehension", language: "python" },
  { pattern: /\blambda\b/, what: "lambda", language: "python" },
  { pattern: /\bfrom\s+collections\b|\bimport\s+collections\b/, what: "collections", language: "python" },
  { pattern: /\bfrom\s+itertools\b|\bimport\s+itertools\b/, what: "itertools", language: "python" },
  { pattern: /\bzip\s*\(|\benumerate\s*\(/, what: "zip or enumerate", language: "python" },
  { pattern: /f["']/, what: "f-strings", language: "python" },
  { pattern: /\bdef\s+\w+\s*\([^)]*:\s*\w+/, what: "type hints", language: "python" },
  { pattern: /@\w+\s*\n\s*def\b/, what: "a decorator", language: "python" },
  { pattern: /\*\*?\w+\s*[,)]/, what: "argument unpacking", language: "python" },
  { pattern: /\btry\s*:/, what: "exception handling", language: "python" },
];

/** Comment lines and code lines, ignoring blanks. */
function countLines(code: string, language: Language) {
  const lines = code.split(/\r?\n/);
  let comment = 0;
  let codeLines = 0;
  const commentTexts: string[] = [];

  let inBlock = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (language === "cpp") {
      if (inBlock) {
        comment++;
        if (line.includes("*/")) inBlock = false;
        continue;
      }
      if (line.startsWith("/*")) {
        comment++;
        if (!line.includes("*/")) inBlock = true;
        continue;
      }
      if (line.startsWith("//")) {
        comment++;
        commentTexts.push(line.slice(2).trim());
        continue;
      }
      const at = line.indexOf("//");
      if (at > 0) {
        comment++;
        commentTexts.push(line.slice(at + 2).trim());
        codeLines++;
        continue;
      }
    } else {
      if (line.startsWith("#")) {
        comment++;
        commentTexts.push(line.slice(1).trim());
        continue;
      }
      const at = line.indexOf("#");
      if (at > 0) {
        comment++;
        commentTexts.push(line.slice(at + 1).trim());
        codeLines++;
        continue;
      }
    }
    codeLines++;
  }
  return { comment, codeLines, commentTexts };
}

/**
 * Does this read like documentation?
 *
 * A 13-year-old's comment is "count them" or "dont forget +1". Generated code
 * writes "Initialize the counter variable to zero." — sentence case, an
 * article, a full stop, and one on nearly every line. Any single one of those
 * proves nothing; all of them together on a beginner's first attempt is a
 * pattern worth noticing.
 */
function commentsLookWritten(texts: string[]): boolean {
  if (texts.length < 4) return false;
  let polished = 0;
  for (const t of texts) {
    const startsUpper = /^[A-Z]/.test(t);
    const hasArticle = /\b(the|a|an|this|each|all|its)\b/i.test(t);
    const severalWords = t.split(/\s+/).length >= 4;
    if (startsUpper && hasArticle && severalWords) polished++;
  }
  return polished / texts.length >= 0.6;
}

export function analyse(
  code: string,
  language: Language,
  ctx: SubmissionContext = {},
): SignalReport {
  const signals: Signal[] = [];
  const { comment, codeLines, commentTexts } = countLines(code, language);

  // 1. Constructs from outside the course.
  const found = BEYOND_COURSE.filter(
    (b) => (b.language === "any" || b.language === language) && b.pattern.test(code),
  ).map((b) => b.what);
  if (found.length > 0) {
    signals.push({
      code: "beyond_course",
      label_en: "Uses things the course has not taught",
      label_mn: "Хичээлд заагаагүй хэрэгслүүд ашигласан",
      detail: [...new Set(found)].slice(0, 5).join(", "),
    });
  }

  // 2. Documentation-style comments, densely.
  //    The density test matters as much as the wording: a student who writes
  //    two careful comments is not the pattern, one comment per line is.
  if (codeLines >= 6 && comment / codeLines >= 0.5 && commentsLookWritten(commentTexts)) {
    signals.push({
      code: "comment_style",
      label_en: "Commented like documentation, on almost every line",
      label_mn: "Бараг мөр бүрт нь тайлбар, гарын авлага шиг",
      detail: `${comment} comments across ${codeLines} lines of code`,
    });
  }

  // 3. A hard problem, right first time, almost immediately.
  const attempts = ctx.attemptsBefore ?? 0;
  const seconds = ctx.secondsSincePrevious;
  if (
    attempts === 0 &&
    ctx.difficulty === "hard" &&
    seconds !== null &&
    seconds !== undefined &&
    seconds < 180
  ) {
    signals.push({
      code: "instant_hard",
      label_en: "A hard problem, right first time, within three minutes",
      label_mn: "Хүнд бодлогыг гурван минутад, эхний оролдлогоор",
      detail: `${Math.round(seconds)}s after their previous activity`,
    });
  }

  // Weighted so that "uses things we never taught" carries most, because it is
  // the one with a checkable answer: the teacher can ask where it came from.
  const weights: Record<string, number> = {
    beyond_course: 45,
    comment_style: 35,
    instant_hard: 30,
  };
  const score = Math.min(
    100,
    signals.reduce((sum, s) => sum + (weights[s.code] ?? 0), 0),
  );

  return { signals, score };
}

/** Anything at or above this is worth putting in front of a teacher. */
export const SIGNAL_THRESHOLD = 35;

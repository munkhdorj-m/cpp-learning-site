// How alike are two submissions?
//
// The previous version compared raw lowercased tokens and its comment claimed
// it survived variable renames. It did not: `total` and `sum` are different
// tokens, so renaming one identifier broke every shingle that contained it.
// A student who changed three names went undetected.
//
// This version normalises before comparing, which is what MOSS and JPlag do:
// every identifier becomes V, every number N, every string S, and the
// language's own keywords and operators are kept. What is left is the SHAPE of
// the program. Renaming, reformatting, re-commenting and reordering
// declarations all stop mattering; only the structure does.
//
// Three measures, because copying takes three shapes:
//
//   jaccard   the whole program is the same, perhaps shuffled
//   contained one program contains the other, plus extra code around it
//   longestRun a verbatim block sits inside otherwise different work
//
// A pair is reported on the strongest of the three. Reporting only Jaccard
// missed "their solution plus a function I wrote myself", which is the most
// common way a copy arrives.

/** Tokens per window. Six is long enough that ordinary code does not collide. */
const K = 6;

/**
 * Below this many normalised tokens a program is all boilerplate, and any two
 * of them look identical. Comparing them produces nothing but false alarms.
 */
const MIN_TOKENS = 25;

/** Kept verbatim: these carry the program's structure. */
const CPP_KEYWORDS = new Set([
  "alignas", "alignof", "and", "asm", "auto", "bool", "break", "case", "catch",
  "char", "class", "const", "constexpr", "continue", "decltype", "default",
  "delete", "do", "double", "dynamic_cast", "else", "enum", "explicit",
  "export", "extern", "false", "float", "for", "friend", "goto", "if",
  "inline", "int", "long", "mutable", "namespace", "new", "noexcept",
  "nullptr", "operator", "or", "private", "protected", "public", "register",
  "reinterpret_cast", "return", "short", "signed", "sizeof", "static",
  "static_cast", "struct", "switch", "template", "this", "throw", "true",
  "try", "typedef", "typeid", "typename", "union", "unsigned", "using",
  "virtual", "void", "volatile", "while", "xor",
]);

const PYTHON_KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue",
  "def", "del", "elif", "else", "except", "false", "finally", "for", "from",
  "global", "if", "import", "in", "is", "lambda", "none", "nonlocal", "not",
  "or", "pass", "raise", "return", "true", "try", "while", "with", "yield",
]);

/** Multi-character operators, longest first so `<<=` beats `<<`. */
const OPERATORS = [
  "<<=", ">>=", "...", "->*", "<=>",
  "==", "!=", "<=", ">=", "&&", "||", "++", "--", "->", "::", "<<", ">>",
  "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "**", "//",
  "+", "-", "*", "/", "%", "=", "<", ">", "!", "&", "|", "^", "~", "?", ":",
  ";", ",", ".", "(", ")", "[", "]", "{", "}",
];

export type Language = "cpp" | "python";

/**
 * Strip everything a rename or a reformat can change.
 *
 * Order matters: comments go before strings, or a `//` inside a string literal
 * would eat the rest of the line.
 */
function stripNoise(code: string, language: Language): string {
  let s = code;
  if (language === "python") {
    // Triple-quoted blocks first: they are usually docstrings, and they can
    // contain anything at all including quotes and hashes.
    s = s.replace(/"""[\s\S]*?"""/g, " S ").replace(/'''[\s\S]*?'''/g, " S ");
    s = s.replace(/#[^\n]*/g, " ");
  } else {
    s = s.replace(/\/\*[\s\S]*?\*\//g, " ");
    s = s.replace(/\/\/[^\n]*/g, " ");
    // Boilerplate every submission shares. Left in, two hello-worlds look
    // like the same program because in these tokens they are.
    s = s.replace(/#\s*include\s*[<"][^>"]*[>"]/g, " ");
    s = s.replace(/#\s*define[^\n]*/g, " ");
    s = s.replace(/using\s+namespace\s+\w+\s*;/g, " ");
  }
  // Strings and character literals, in both languages.
  s = s.replace(/"(?:\\.|[^"\\])*"/g, " S ");
  s = s.replace(/'(?:\\.|[^'\\])*'/g, " S ");
  return s;
}

/**
 * The program's shape, as a token list.
 *
 * Exported because the checker asserts on it directly: "did renaming change
 * the tokens?" is the question this module got wrong before.
 */
export function normalise(code: string, language: Language = "cpp"): string[] {
  const keywords = language === "python" ? PYTHON_KEYWORDS : CPP_KEYWORDS;
  const src = stripNoise(code, language);
  const out: string[] = [];

  let i = 0;
  while (i < src.length) {
    const c = src[i];

    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }

    // Word: a keyword of the language, or a name we flatten to V.
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      const lower = word.toLowerCase();
      if (lower === "s" && src.slice(i - 1, i + 2) === " S ") {
        out.push("S");
      } else if (keywords.has(lower)) {
        out.push(lower);
      } else {
        // EVERY other name flattens, including cin, cout and push_back.
        // An allowlist of library names was tried and made things worse: it
        // preserved `count`, `sum`, `size`, `max` and `first`, which are what
        // students call their variables, so renaming `total` to `sum` slipped
        // straight through. Structure lives in the keywords and operators —
        // `cin >> x` and `cout << x` already differ by their operator.
        out.push("V");
      }
      i = j;
      continue;
    }

    // Number.
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.xXa-fA-F]/.test(src[j])) j++;
      out.push("N");
      i = j;
      continue;
    }

    // Operator or punctuation.
    const op = OPERATORS.find((o) => src.startsWith(o, i));
    if (op) {
      out.push(op);
      i += op.length;
      continue;
    }

    i++; // Anything else (stray unicode) contributes nothing.
  }

  return out;
}

function grams(tokens: string[], k: number): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i + k <= tokens.length; i++) {
    out.add(tokens.slice(i, i + k).join(" "));
  }
  return out;
}

/** Longest run of tokens appearing in both, as a fraction of the shorter one. */
function longestCommonRun(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  // Rolling row rather than a full table: two 5,000-token programs would
  // otherwise allocate 25 million cells on a 4 GB shared host.
  let previous = new Uint32Array(b.length + 1);
  let current = new Uint32Array(b.length + 1);
  let best = 0;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      current[j] = a[i - 1] === b[j - 1] ? previous[j - 1] + 1 : 0;
      if (current[j] > best) best = current[j];
    }
    const swap = previous;
    previous = current;
    current = swap;
    current.fill(0);
  }
  return best / Math.min(a.length, b.length);
}

export interface SimilarityReport {
  /** The strongest of the three, which is what a teacher is shown. */
  score: number;
  /** Whole-program overlap, order-insensitive. */
  jaccard: number;
  /** How much of the smaller program appears inside the larger. */
  contained: number;
  /** Longest verbatim block, as a fraction of the shorter program. */
  longestRun: number;
  /** Normalised length of the shorter program, for judging significance. */
  tokens: number;
}

/**
 * Compare two submissions.
 *
 * Both must be the same language: comparing C++ against Python scores near
 * zero and tells a teacher nothing.
 */
export function compare(
  codeA: string,
  codeB: string,
  language: Language = "cpp",
): SimilarityReport {
  const ta = normalise(codeA, language);
  const tb = normalise(codeB, language);
  const shorter = Math.min(ta.length, tb.length);

  const empty: SimilarityReport = {
    score: 0,
    jaccard: 0,
    contained: 0,
    longestRun: 0,
    tokens: shorter,
  };
  if (shorter < MIN_TOKENS) return empty;

  const ga = grams(ta, K);
  const gb = grams(tb, K);
  if (!ga.size || !gb.size) return empty;

  let shared = 0;
  const [small, large] = ga.size <= gb.size ? [ga, gb] : [gb, ga];
  for (const g of small) if (large.has(g)) shared++;

  const jaccard = shared / (ga.size + gb.size - shared);
  const contained = shared / small.size;
  const longestRun = longestCommonRun(ta, tb);

  return {
    // Containment is discounted a little: a long program legitimately
    // containing a short standard pattern should not read as a copy.
    score: Math.max(jaccard, contained * 0.9, longestRun),
    jaccard,
    contained,
    longestRun,
    tokens: shorter,
  };
}

/** Kept for the call site that only wants a number. */
export function similarity(
  codeA: string,
  codeB: string,
  language: Language = "cpp",
): number {
  return compare(codeA, codeB, language).score;
}

/**
 * Where to start telling a teacher.
 *
 * Lower than the old 0.85 because normalised tokens make a real copy score
 * higher AND make unrelated work score lower — the two distributions moved
 * apart, so the line between them can sit lower and catch more.
 */
export const SIMILARITY_THRESHOLD = 0.75;

export { K as GRAM_SIZE, MIN_TOKENS };

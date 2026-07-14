// Token-shingle Jaccard similarity for C++ submissions.
// Catches obvious copy-paste even after variable renames and reformatting.

const K = 5; // shingle size (tokens per window)

function preprocess(code: string): string[] {
  // 1. Drop block comments /* ... */ (non-greedy, multi-line)
  let s = code.replace(/\/\*[\s\S]*?\*\//g, " ");
  // 2. Drop line comments
  s = s.replace(/\/\/[^\n]*/g, " ");
  // 3. Collapse string literals to a single token so renaming text doesn't dodge detection
  s = s.replace(/"(?:\\.|[^"\\])*"/g, " STR ");
  s = s.replace(/'(?:\\.|[^'\\])'/g, " CHAR ");
  // 4. Lowercase
  s = s.toLowerCase();
  // 5. Split on whitespace and on every non-word character (operators, brackets, etc.)
  //    keeping numeric/identifier-like sequences.
  return s.split(/[^a-z0-9_]+/).filter((t) => t.length > 0);
}

function shingles(tokens: string[], k: number): Set<string> {
  const out = new Set<string>();
  if (tokens.length < k) {
    // Short snippets: still compare them as a single shingle so we don't
    // declare two empty programs identical.
    if (tokens.length > 0) out.add(tokens.join(" "));
    return out;
  }
  for (let i = 0; i + k <= tokens.length; i++) {
    out.add(tokens.slice(i, i + k).join(" "));
  }
  return out;
}

/**
 * Jaccard similarity in [0, 1]. 1.0 = identical token-shingle sets.
 * Returns 0 for trivially short inputs to avoid false positives on
 * boilerplate-only code.
 */
export function similarity(codeA: string, codeB: string): number {
  const ta = preprocess(codeA);
  const tb = preprocess(codeB);
  if (ta.length < K || tb.length < K) return 0;

  const a = shingles(ta, K);
  const b = shingles(tb, K);
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const s of a) if (b.has(s)) intersection++;
  const union = a.size + b.size - intersection;
  return intersection / union;
}

export const SIMILARITY_THRESHOLD = 0.85;

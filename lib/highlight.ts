// Syntax highlighting for the two languages the course teaches.
//
// A full grammar engine (Shiki, Prism) would be a heavy dependency for a site
// that only ever shows short C++ and Python teaching examples, and it would
// bring its own colour scheme to fight with this one. This is a single-pass
// tokeniser instead: small, instant, and coloured from the site's own palette.
//
// The one rule it must never break is that the visible text is exactly the
// source. scripts/test-highlight.mts checks that against every snippet in the
// course — a highlighter that quietly drops a character would teach students
// code that does not compile.

export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "type"
  | "preproc"
  | "func";

export interface Token {
  text: string;
  kind: TokenKind;
}

export type HighlightLang = "cpp" | "python";

const CPP_KEYWORDS = new Set([
  "alignas", "alignof", "and", "asm", "break", "case", "catch", "class",
  "const", "constexpr", "continue", "default", "delete", "do", "else", "enum",
  "explicit", "export", "extern", "false", "friend", "goto", "if", "inline",
  "mutable", "namespace", "new", "noexcept", "not", "nullptr", "operator",
  "or", "private", "protected", "public", "register", "return", "sizeof",
  "static", "struct", "switch", "template", "this", "throw", "true", "try",
  "typedef", "typename", "union", "using", "virtual", "volatile", "while",
  "for",
]);

const CPP_TYPES = new Set([
  "auto", "bool", "char", "double", "float", "int", "long", "short",
  "signed", "unsigned", "void", "string", "vector", "size_t", "wchar_t",
]);

const PY_KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break",
  "class", "continue", "def", "del", "elif", "else", "except", "finally",
  "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
  "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
]);

const PY_BUILTINS = new Set([
  "abs", "bool", "dict", "enumerate", "filter", "float", "input", "int",
  "len", "list", "map", "max", "min", "open", "print", "range", "round",
  "set", "sorted", "str", "sum", "tuple", "zip",
]);

const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
const isIdent = (c: string) => /[A-Za-z0-9_]/.test(c);
const isDigit = (c: string) => c >= "0" && c <= "9";

export function tokenize(src: string, lang: HighlightLang): Token[] {
  const out: Token[] = [];
  const push = (text: string, kind: TokenKind) => {
    if (!text) return;
    // Merge runs of plain text so the DOM stays small.
    const last = out[out.length - 1];
    if (last && last.kind === kind && kind === "plain") last.text += text;
    else out.push({ text, kind });
  };

  const n = src.length;
  let i = 0;
  let atLineStart = true;

  while (i < n) {
    const c = src[i];

    // ---- newlines keep the line-start flag honest ----
    if (c === "\n") {
      push(c, "plain");
      i++;
      atLineStart = true;
      continue;
    }
    if (c === " " || c === "\t") {
      push(c, "plain");
      i++;
      continue;
    }

    // ---- preprocessor (C++ only): colour the whole directive line ----
    if (lang === "cpp" && c === "#" && atLineStart) {
      let j = i;
      while (j < n && src[j] !== "\n") j++;
      push(src.slice(i, j), "preproc");
      i = j;
      continue;
    }

    // ---- comments ----
    if (lang === "python" && c === "#") {
      let j = i;
      while (j < n && src[j] !== "\n") j++;
      push(src.slice(i, j), "comment");
      i = j;
      atLineStart = false;
      continue;
    }
    if (lang === "cpp" && c === "/" && src[i + 1] === "/") {
      let j = i;
      while (j < n && src[j] !== "\n") j++;
      push(src.slice(i, j), "comment");
      i = j;
      atLineStart = false;
      continue;
    }
    if (lang === "cpp" && c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end === -1 ? n : end + 2;
      push(src.slice(i, j), "comment");
      i = j;
      atLineStart = false;
      continue;
    }

    // ---- triple-quoted Python strings, which are often used as comments ----
    if (lang === "python" && (src.startsWith('"""', i) || src.startsWith("'''", i))) {
      const quote = src.slice(i, i + 3);
      const end = src.indexOf(quote, i + 3);
      const j = end === -1 ? n : end + 3;
      push(src.slice(i, j), "string");
      i = j;
      atLineStart = false;
      continue;
    }

    // ---- strings and characters ----
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") {
          j += 2; // an escaped character cannot end the literal
          continue;
        }
        if (src[j] === c) {
          j++;
          break;
        }
        // An unterminated literal must not swallow the rest of the file.
        if (src[j] === "\n") break;
        j++;
      }
      push(src.slice(i, j), "string");
      i = j;
      atLineStart = false;
      continue;
    }

    // ---- numbers ----
    if (isDigit(c)) {
      let j = i;
      while (j < n && /[0-9._a-fA-FxXeE+-]/.test(src[j])) {
        // Stop at a + or - unless it is an exponent sign.
        if (
          (src[j] === "+" || src[j] === "-") &&
          !(src[j - 1] === "e" || src[j - 1] === "E")
        ) {
          break;
        }
        j++;
      }
      push(src.slice(i, j), "number");
      i = j;
      atLineStart = false;
      continue;
    }

    // ---- identifiers, keywords, types, calls ----
    if (isIdentStart(c)) {
      let j = i;
      while (j < n && isIdent(src[j])) j++;
      const word = src.slice(i, j);

      const keywords = lang === "cpp" ? CPP_KEYWORDS : PY_KEYWORDS;
      const types = lang === "cpp" ? CPP_TYPES : PY_BUILTINS;

      if (keywords.has(word)) push(word, "keyword");
      else if (types.has(word)) push(word, "type");
      else {
        // A name immediately followed by "(" is being called.
        let k = j;
        while (k < n && (src[k] === " " || src[k] === "\t")) k++;
        push(word, src[k] === "(" ? "func" : "plain");
      }
      i = j;
      atLineStart = false;
      continue;
    }

    // ---- anything else ----
    push(c, "plain");
    i++;
    atLineStart = false;
  }

  return out;
}

/**
 * Highlighting has its own palette, scoped to the inside of a code block.
 *
 * The site rule is that a hue means a state — but no verdict, progress bar or
 * next-lesson marker is ever rendered inside a <pre>, so nothing in here can
 * be mistaken for one. Colour in code is information about the code, and a
 * single-hue listing turned out to be genuinely harder to read.
 *
 * Every tone is measured against --surface-code in both themes.
 */
export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "text-[var(--code-plain)]",
  comment: "text-[var(--code-comment)] italic",
  string: "text-[var(--code-string)]",
  number: "text-[var(--code-number)]",
  keyword: "text-[var(--code-keyword)] font-semibold",
  type: "text-[var(--code-type)]",
  preproc: "text-[var(--code-preproc)]",
  func: "text-[var(--code-func)] font-semibold",
};

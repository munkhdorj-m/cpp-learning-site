// Syntax highlighting, done properly — Shiki with real TextMate grammars and
// real VS Code themes, rather than the hand-rolled tokeniser this replaces.
//
// The trick that makes a student-switchable theme cheap: Shiki can emit EVERY
// theme at once as CSS custom properties on each token, with no `color:` of
// its own. One render carries all six palettes, and switching between them is
// a single attribute on <html> — no re-highlighting, no client-side Shiki, no
// flash, and it costs nothing at runtime.
//
// Highlighting happens on the server. Nothing here is shipped to the browser.

import { createHighlighter, type Highlighter } from "shiki";

/**
 * What a student can choose between. Keys are deliberately two characters:
 * every token in every snippet carries one variable per theme, so the key
 * length is multiplied by a few thousand across a page.
 */
export const CODE_THEMES = [
  { key: "t0", label: "GitHub Dark", theme: "github-dark", dark: true },
  { key: "t1", label: "Dracula", theme: "dracula", dark: true },
  { key: "t2", label: "Monokai", theme: "monokai", dark: true },
  { key: "t3", label: "Nord", theme: "nord", dark: true },
  { key: "t4", label: "One Dark Pro", theme: "one-dark-pro", dark: true },
  { key: "t5", label: "GitHub Light", theme: "github-light", dark: false },
] as const;

export type CodeThemeKey = (typeof CODE_THEMES)[number]["key"];

export const DEFAULT_CODE_THEME: CodeThemeKey = "t0";
export const CODE_THEME_COOKIE = "code-theme";
export const CODE_THEME_STORAGE = "cs.code-theme";

export function isCodeTheme(v: unknown): v is CodeThemeKey {
  return typeof v === "string" && CODE_THEMES.some((t) => t.key === v);
}

export type CodeLang = "cpp" | "python";

/** Grammars are expensive to load, so the highlighter is built once. */
let pending: Promise<Highlighter> | null = null;
function getHighlighter(): Promise<Highlighter> {
  pending ??= createHighlighter({
    themes: CODE_THEMES.map((t) => t.theme),
    langs: ["cpp", "python"],
  });
  return pending;
}

const THEME_MAP = Object.fromEntries(
  CODE_THEMES.map((t) => [t.key, t.theme]),
) as Record<CodeThemeKey, string>;

/**
 * Returns a <pre class="shiki"> carrying one CSS variable per theme per token.
 * `defaultColor: false` is what stops Shiki writing a literal colour, which is
 * what leaves the choice to CSS.
 */
export async function highlightCode(
  code: string,
  lang: CodeLang,
): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code.replace(/\s+$/, ""), {
    lang,
    themes: THEME_MAP,
    defaultColor: false,
    cssVariablePrefix: "--s-",
  });
}

/** Highlight several snippets at once, keeping nulls for missing ones. */
export async function highlightMany(
  snippets: (readonly [string | undefined | null, CodeLang])[],
): Promise<(string | null)[]> {
  return Promise.all(
    snippets.map(async ([code, lang]) =>
      code ? highlightCode(code, lang) : null,
    ),
  );
}

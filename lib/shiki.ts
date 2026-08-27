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
 * What a student can choose between: twenty dark, six light.
 *
 * Keys are deliberately two characters. Every token in every snippet carries
 * one variable per theme, so the key length is multiplied by a few thousand
 * across a page. Measured at 26 themes a typical snippet is ~62 KB of HTML
 * but ~4 KB on the wire — the colours repeat and gzip eats them. That is the
 * price of switching with no re-render and no flash.
 *
 * ORDER MATTERS. The key is positional and is stored in a cookie and in
 * localStorage, so inserting a theme in the middle silently changes what
 * every student who already picked one is looking at. Add to the END.
 */
export const CODE_THEMES = [
  { key: "t0", label: "GitHub Dark", theme: "github-dark", dark: true },
  { key: "t1", label: "Dracula", theme: "dracula", dark: true },
  { key: "t2", label: "Monokai", theme: "monokai", dark: true },
  { key: "t3", label: "Nord", theme: "nord", dark: true },
  { key: "t4", label: "One Dark Pro", theme: "one-dark-pro", dark: true },
  { key: "t5", label: "Tokyo Night", theme: "tokyo-night", dark: true },
  { key: "t6", label: "Catppuccin Mocha", theme: "catppuccin-mocha", dark: true },
  { key: "t7", label: "Ayu Dark", theme: "ayu-dark", dark: true },
  { key: "t8", label: "Night Owl", theme: "night-owl", dark: true },
  { key: "t9", label: "Palenight", theme: "material-theme-palenight", dark: true },
  { key: "t10", label: "Gruvbox Dark", theme: "gruvbox-dark-medium", dark: true },
  { key: "t11", label: "Everforest Dark", theme: "everforest-dark", dark: true },
  { key: "t12", label: "Kanagawa Wave", theme: "kanagawa-wave", dark: true },
  { key: "t13", label: "Rose Pine", theme: "rose-pine", dark: true },
  { key: "t14", label: "Synthwave '84", theme: "synthwave-84", dark: true },
  { key: "t15", label: "Laserwave", theme: "laserwave", dark: true },
  { key: "t16", label: "Poimandres", theme: "poimandres", dark: true },
  { key: "t17", label: "Vitesse Dark", theme: "vitesse-dark", dark: true },
  { key: "t18", label: "Solarized Dark", theme: "solarized-dark", dark: true },
  { key: "t19", label: "Min Dark", theme: "min-dark", dark: true },
  { key: "t20", label: "GitHub Light", theme: "github-light", dark: false },
  { key: "t21", label: "Catppuccin Latte", theme: "catppuccin-latte", dark: false },
  { key: "t22", label: "Solarized Light", theme: "solarized-light", dark: false },
  { key: "t23", label: "Vitesse Light", theme: "vitesse-light", dark: false },
  { key: "t24", label: "Gruvbox Light", theme: "gruvbox-light-medium", dark: false },
  { key: "t25", label: "Min Light", theme: "min-light", dark: false },
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

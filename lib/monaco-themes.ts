import type { CodeThemeKey } from "./shiki";
import { CODE_THEMES } from "./shiki";

/**
 * The same code themes, in the IDE.
 *
 * Lesson pages are highlighted by Shiki on the server; the IDE is Monaco,
 * which has its own tokeniser and its own theme format. Rather than run two
 * unrelated sets of colours — and have a student pick "Dracula" for the
 * lessons and get VS Code blue in the editor — the Shiki theme is translated
 * into a Monaco one here.
 *
 * The translation is honest but not exact. Shiki colours TextMate scopes
 * ("entity.name.function.cpp"); Monaco colours its own coarser token types
 * ("type.identifier", "keyword"). Mapping the former onto the latter gets the
 * background, the foreground and the half-dozen token colours anybody
 * actually notices. It will not be pixel-identical to VS Code, and it does not
 * need to be.
 *
 * Themes are loaded one at a time, on demand: the map below is 26 dynamic
 * imports so the bundler splits each into its own chunk and a student
 * downloads only the one they chose.
 */

interface ShikiThemeJson {
  colors?: Record<string, string>;
  tokenColors?: {
    scope?: string | string[];
    settings?: { foreground?: string; fontStyle?: string };
  }[];
  type?: string;
}

export interface MonacoThemeData {
  base: "vs" | "vs-dark";
  inherit: boolean;
  rules: { token: string; foreground?: string; fontStyle?: string }[];
  colors: Record<string, string>;
}

/**
 * Which TextMate scope to take each Monaco token's colour from.
 *
 * Ordered: the first scope that the theme actually defines wins, so a theme
 * that only styles the general case still produces a sensible colour.
 */
const TOKEN_SOURCES: [monacoToken: string, scopes: string[]][] = [
  ["comment", ["comment", "punctuation.definition.comment"]],
  ["string", ["string", "string.quoted"]],
  ["string.escape", ["constant.character.escape", "string"]],
  ["keyword", ["keyword", "keyword.control", "storage"]],
  ["keyword.flow", ["keyword.control", "keyword"]],
  ["number", ["constant.numeric", "constant"]],
  ["constant", ["constant.language", "constant"]],
  ["type", ["entity.name.type", "support.type", "storage.type"]],
  ["type.identifier", ["entity.name.type", "support.type", "storage.type"]],
  ["identifier", ["variable", "variable.other"]],
  ["function", ["entity.name.function", "support.function"]],
  ["operator", ["keyword.operator", "keyword"]],
  ["delimiter", ["punctuation", "meta.brace"]],
  ["tag", ["entity.name.tag"]],
  ["attribute.name", ["entity.other.attribute-name"]],
  ["namespace", ["entity.name.namespace", "entity.name.type"]],
];

/** Colour for the first of `scopes` the theme defines, if any. */
function colourFor(
  json: ShikiThemeJson,
  scopes: string[],
): { foreground?: string; fontStyle?: string } | null {
  for (const wanted of scopes) {
    for (const entry of json.tokenColors ?? []) {
      const list =
        typeof entry.scope === "string"
          ? entry.scope.split(",").map((s) => s.trim())
          : (entry.scope ?? []);
      // A scope matches if it IS the one we want or is more specific than it,
      // which is how TextMate scoping works: "comment.line" is a comment.
      const hit = list.some((s) => s === wanted || s.startsWith(`${wanted}.`));
      if (hit && entry.settings?.foreground) {
        return {
          foreground: entry.settings.foreground,
          fontStyle: entry.settings.fontStyle,
        };
      }
    }
  }
  return null;
}

/**
 * Six hex digits, always.
 *
 * Themes write colours however they like — "#fff", "#CCC", "#1e1e1eff" — and
 * Monaco rejects anything that is not exactly six digits, refusing the whole
 * theme rather than the one colour. github-light and min-light both do this.
 */
function hex6(value?: string): string | undefined {
  if (!value) return undefined;
  const raw = value.replace("#", "");
  // Shorthand: #abc -> #aabbcc
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return raw
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase();
  }
  if (/^[0-9a-fA-F]{4}$/.test(raw)) {
    return raw
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase();
  }
  if (/^[0-9a-fA-F]{6,8}$/.test(raw)) return raw.slice(0, 6).toLowerCase();
  return undefined;
}

/** Monaco's `rules` want bare hex; its `colors` want it with the hash. */
const bare = hex6;
const withHash = (value: string | undefined, fallback: string) => {
  const h = hex6(value);
  return h ? `#${h}` : fallback;
};

export function shikiToMonaco(json: ShikiThemeJson, dark: boolean): MonacoThemeData {
  const rules: MonacoThemeData["rules"] = [];
  for (const [token, scopes] of TOKEN_SOURCES) {
    const found = colourFor(json, scopes);
    if (!found?.foreground) continue;
    rules.push({
      token,
      foreground: bare(found.foreground),
      // Monaco accepts "italic", "bold", "underline" — and chokes on the
      // "italic bold" pair some themes use, so only the first is kept.
      ...(found.fontStyle && found.fontStyle !== "normal"
        ? { fontStyle: found.fontStyle.split(" ")[0] }
        : {}),
    });
  }

  const c = json.colors ?? {};
  const fallbackBg = dark ? "#1e1e1e" : "#ffffff";
  const fallbackFg = dark ? "#d4d4d4" : "#1e1e1e";

  return {
    base: dark ? "vs-dark" : "vs",
    // Inherit so anything unmapped still has a sane colour rather than none.
    inherit: true,
    rules,
    colors: {
      "editor.background": withHash(c["editor.background"], fallbackBg),
      "editor.foreground": withHash(c["editor.foreground"], fallbackFg),
      "editorLineNumber.foreground": withHash(
        c["editorLineNumber.foreground"],
        dark ? "#5a5a5a" : "#9a9a9a",
      ),
      "editorLineNumber.activeForeground": withHash(
        c["editorLineNumber.activeForeground"],
        fallbackFg,
      ),
      "editor.selectionBackground": withHash(
        c["editor.selectionBackground"],
        dark ? "#264f78" : "#add6ff",
      ),
      "editor.lineHighlightBackground": withHash(
        c["editor.lineHighlightBackground"] ?? c["editor.background"],
        fallbackBg,
      ),
      "editorCursor.foreground": withHash(
        c["editorCursor.foreground"],
        fallbackFg,
      ),
      "editorIndentGuide.background1": withHash(
        c["editorIndentGuide.background1"],
        dark ? "#404040" : "#d3d3d3",
      ),
    },
  };
}

/**
 * One dynamic import per theme.
 *
 * Written out rather than built from a template string because a bundler
 * cannot split `import(\`@shikijs/themes/${name}\`)` — it would either bundle
 * all twenty-six into the main chunk or fail to resolve them at all.
 */
const LOADERS: Record<string, () => Promise<{ default: ShikiThemeJson }>> = {
  "github-dark": () => import("@shikijs/themes/github-dark"),
  dracula: () => import("@shikijs/themes/dracula"),
  monokai: () => import("@shikijs/themes/monokai"),
  nord: () => import("@shikijs/themes/nord"),
  "one-dark-pro": () => import("@shikijs/themes/one-dark-pro"),
  "tokyo-night": () => import("@shikijs/themes/tokyo-night"),
  "catppuccin-mocha": () => import("@shikijs/themes/catppuccin-mocha"),
  "ayu-dark": () => import("@shikijs/themes/ayu-dark"),
  "night-owl": () => import("@shikijs/themes/night-owl"),
  "material-theme-palenight": () =>
    import("@shikijs/themes/material-theme-palenight"),
  "gruvbox-dark-medium": () => import("@shikijs/themes/gruvbox-dark-medium"),
  "everforest-dark": () => import("@shikijs/themes/everforest-dark"),
  "kanagawa-wave": () => import("@shikijs/themes/kanagawa-wave"),
  "rose-pine": () => import("@shikijs/themes/rose-pine"),
  "synthwave-84": () => import("@shikijs/themes/synthwave-84"),
  laserwave: () => import("@shikijs/themes/laserwave"),
  poimandres: () => import("@shikijs/themes/poimandres"),
  "vitesse-dark": () => import("@shikijs/themes/vitesse-dark"),
  "solarized-dark": () => import("@shikijs/themes/solarized-dark"),
  "min-dark": () => import("@shikijs/themes/min-dark"),
  "github-light": () => import("@shikijs/themes/github-light"),
  "catppuccin-latte": () => import("@shikijs/themes/catppuccin-latte"),
  "solarized-light": () => import("@shikijs/themes/solarized-light"),
  "vitesse-light": () => import("@shikijs/themes/vitesse-light"),
  "gruvbox-light-medium": () => import("@shikijs/themes/gruvbox-light-medium"),
  "min-light": () => import("@shikijs/themes/min-light"),
};

/** Every theme in CODE_THEMES must have a loader, or the IDE cannot show it. */
export function missingLoaders(): string[] {
  return CODE_THEMES.filter((t) => !LOADERS[t.theme]).map((t) => t.theme);
}

/** The Monaco theme name for a code-theme key. */
export const monacoThemeName = (key: CodeThemeKey) => `cs-${key}`;

/**
 * Load one theme and convert it. Returns null when the key is unknown or the
 * chunk fails to load — the caller keeps whatever theme is already applied,
 * which is better than an editor with no colours at all.
 */
export async function loadMonacoTheme(
  key: CodeThemeKey,
): Promise<MonacoThemeData | null> {
  const spec = CODE_THEMES.find((t) => t.key === key);
  if (!spec) return null;
  const load = LOADERS[spec.theme];
  if (!load) return null;
  try {
    const mod = await load();
    return shikiToMonaco(mod.default, spec.dark);
  } catch {
    return null;
  }
}

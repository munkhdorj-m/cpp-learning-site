// Every code theme is real, loadable, and produces usable colours.
//
//   node_modules/.bin/jiti scripts/check-code-themes.mts
//
// Three ways this goes wrong quietly:
//
//   * a theme name that Shiki does not have — the server throws on first
//     render of any page with code on it
//   * a theme in the list with no CSS block, which silently shows theme t0
//     instead and looks like the picker is broken
//   * a theme with no Monaco loader, so the lesson pages change and the IDE
//     does not
//
// The keys are positional and stored in a cookie, so this also guards the
// thing that would quietly change what every existing student sees: reordering.
import fs from "node:fs";

import { CODE_THEMES, DEFAULT_CODE_THEME, isCodeTheme } from "../lib/shiki.ts";
import { shikiToMonaco } from "../lib/monaco-themes.ts";

const problems: string[] = [];
const rows: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  if (!ok) problems.push(name + (detail ? ` — ${detail}` : ""));
}

check("at least 20 themes", CODE_THEMES.length >= 20, `${CODE_THEMES.length} themes`);
check(
  "both dark and light are offered",
  CODE_THEMES.some((t) => t.dark) && CODE_THEMES.some((t) => !t.dark),
  `${CODE_THEMES.filter((t) => t.dark).length} dark, ${CODE_THEMES.filter((t) => !t.dark).length} light`,
);
check("the default is one of them", isCodeTheme(DEFAULT_CODE_THEME));

// Keys must be t0..tN in order: they are positional, stored in a cookie, and
// renumbering them changes what every student who already chose one sees.
const keysInOrder = CODE_THEMES.every((t, i) => t.key === `t${i}`);
check("keys are t0..tN with no gaps", keysInOrder);

const labels = new Set(CODE_THEMES.map((t) => t.label));
check("no two themes share a label", labels.size === CODE_THEMES.length);
const names = new Set(CODE_THEMES.map((t) => t.theme));
check("no theme is listed twice", names.size === CODE_THEMES.length);

/* ------------------------------------------------- every theme resolves */

let converted = 0;
const emptyRules: string[] = [];
for (const t of CODE_THEMES) {
  let json: Record<string, unknown> | null = null;
  try {
    const mod = await import(`@shikijs/themes/${t.theme}`);
    json = mod.default;
  } catch {
    problems.push(`"${t.theme}" is not a Shiki theme — every code page throws`);
    continue;
  }
  if (!json) continue;

  // And it has to survive the Monaco translation with real colours, or the
  // IDE shows an editor with a background and nothing else.
  const monaco = shikiToMonaco(json, t.dark);
  if (monaco.rules.length === 0) emptyRules.push(t.theme);
  if (!monaco.colors["editor.background"]) {
    problems.push(`${t.theme}: no editor background after conversion`);
  }
  // Monaco rejects a colour with a "#" or an alpha channel.
  for (const r of monaco.rules) {
    if (r.foreground && !/^[0-9a-fA-F]{6}$/.test(r.foreground)) {
      problems.push(`${t.theme}: rule "${r.token}" has a bad colour "${r.foreground}"`);
      break;
    }
  }
  for (const [k, v] of Object.entries(monaco.colors)) {
    if (!/^#[0-9a-fA-F]{6,8}$/.test(v)) {
      problems.push(`${t.theme}: colour "${k}" is "${v}", which Monaco will reject`);
      break;
    }
  }
  converted++;
}
check(`all ${CODE_THEMES.length} themes load and convert`, converted === CODE_THEMES.length,
  `${converted} converted`);
check(
  "every theme produces token colours",
  emptyRules.length === 0,
  emptyRules.length ? `bare: ${emptyRules.join(", ")}` : "",
);

/* ------------------------------------------- the CSS keeps up with them */

const css = fs.readFileSync("app/globals.css", "utf8");
const missingCss = CODE_THEMES.slice(1)
  .filter((t) => !css.includes(`[data-code-theme="${t.key}"]`))
  .map((t) => t.key);
check(
  "every theme has a CSS block",
  missingCss.length === 0,
  missingCss.length ? `missing: ${missingCss.join(", ")} (they would show as t0)` : "",
);

/* ------------------------------------ and the IDE can load each of them */

const loaders = fs.readFileSync("lib/monaco-themes.ts", "utf8");
const missingLoader = CODE_THEMES.filter(
  (t) => !loaders.includes(`@shikijs/themes/${t.theme}`),
).map((t) => t.theme);
check(
  "every theme has a Monaco loader",
  missingLoader.length === 0,
  missingLoader.length ? `missing: ${missingLoader.join(", ")}` : "",
);

/* ------------------------------------------ native controls follow suit */

check(
  "the dark theme declares color-scheme",
  /\.dark\s*\{[\s\S]{0,400}color-scheme:\s*dark/.test(css),
  "without it the OS draws select popups white on a dark page",
);
check(
  "the light theme declares it too",
  /:root\s*\{[\s\S]{0,600}color-scheme:\s*light/.test(css),
);

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);

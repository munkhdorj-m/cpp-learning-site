// A Select shows the option's NAME, not its id.
//
//   node_modules/.bin/jiti scripts/check-select-labels.mts
//
// Base UI renders the raw value on a closed trigger unless the root is handed
// an `items` map. Nothing passed one, so every select keyed by an id showed a
// bare UUID — "d791a9ed-b193-4b4f-99e9-b4d9f9e0b10c" where a class name should
// be. Selects whose value equals its label ("easy", "medium") looked correct,
// which is exactly why it survived so long.
//
// components/ui/select.tsx now derives that map from the options. This checks
// the derivation, and that no call site has been left to fend for itself.
import fs from "node:fs";
import path from "node:path";
import { createElement as h, Fragment } from "react";

import { deriveSelectItems, labelOf } from "../lib/select-items.ts";

const problems: string[] = [];
const rows: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  if (!ok) problems.push(name + (detail ? ` — ${detail}` : ""));
}

// Stand-ins for SelectItem / SelectContent. Options are recognised by having a
// string `value`, not by identity, so plain elements are a fair test.
const item = (value: string, ...kids: unknown[]) =>
  h("div" as string, { value, key: value }, ...(kids as never[]));

/* ------------------------------------------------------- the basic case */

const flat = deriveSelectItems([
  item("id-1", "Munkhdorj Munkhbaatar"),
  item("id-2", "Erkhembaatar Dashdorj"),
]);
check(
  "an id maps to the person's name",
  flat["id-1"] === "Munkhdorj Munkhbaatar" && flat["id-2"] === "Erkhembaatar Dashdorj",
  JSON.stringify(flat),
);

/* ------------------------------------------------ nested and decorated */

// Options are usually inside a content wrapper, sometimes several deep.
const nested = deriveSelectItems(
  h("div" as string, null, h("div" as string, null, item("c-1", "7A"))),
);
check("options nested inside wrappers are found", nested["c-1"] === "7A");

// Labels are often assembled from several children.
const composed = deriveSelectItems([item("c-2", "7A", " ", "(Grade 7)")]);
check(
  "a label built from several children is joined",
  composed["c-2"] === "7A (Grade 7)",
  JSON.stringify(composed["c-2"]),
);

// An icon alongside the text must not break the label.
const withIcon = deriveSelectItems([
  item("c-3", h("svg" as string, null), "Loops"),
]);
check("an icon contributes nothing", withIcon["c-3"] === "Loops");

// A fragment is transparent.
const frag = deriveSelectItems([item("c-4", h(Fragment, null, "Basics"))]);
check("a fragment is seen through", frag["c-4"] === "Basics");

/* ----------------------------------------------------------- edge cases */

// An option with no readable text is omitted rather than mapped to "": an
// empty trigger is worse than showing the raw value.
const blank = deriveSelectItems([item("c-5", h("svg" as string, null))]);
check("an option with no text is left out", !("c-5" in blank), JSON.stringify(blank));

check("no options is an empty map", Object.keys(deriveSelectItems(null)).length === 0);
check(
  "a non-string value is ignored",
  Object.keys(deriveSelectItems([h("div" as string, { value: 7 }, "seven")])).length === 0,
);

// Numbers are legitimate label text.
check("a numeric label survives", labelOf(["Grade ", 7]) === "Grade 7");
check("booleans and null contribute nothing", labelOf([null, false, "x"]) === "x");

/* --------------------------------------------- the wrapper is still used */

const sel = fs.readFileSync("components/ui/select.tsx", "utf8");
check(
  "the Select root receives an items map",
  /<SelectPrimitive\.Root\s+items=\{/.test(sel),
  "without it Base UI falls back to rendering the raw value",
);
check(
  "an explicit items prop still wins",
  /items \?\? deriveSelectItems\(children\)/.test(sel),
);

/* -------------------------------- every call site goes through the wrapper */

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(p, out);
    } else if (e.name.endsWith(".tsx")) {
      out.push(p);
    }
  }
  return out;
}

let callSites = 0;
for (const f of [...walk("app"), ...walk("components")]) {
  if (f.replace(/\\/g, "/").endsWith("components/ui/select.tsx")) continue;
  const src = fs.readFileSync(f, "utf8");
  if (!/<Select[\s>]/.test(src)) continue;
  callSites++;
  // Importing the primitive directly would bypass the label derivation.
  if (/@base-ui\/react\/select/.test(src)) {
    problems.push(
      `${f} imports Base UI's Select directly, skipping the label derivation`,
    );
  }
  if (!/from "@\/components\/ui\/select"/.test(src)) {
    problems.push(`${f} renders <Select> without importing the wrapper`);
  }
}
rows.push(`  ok    ${callSites} call sites all go through the wrapper`);

/* ------------------------------- no native <select> anywhere in the app */

// A native select's popup list is drawn by the operating system from the
// element's own background colour. On a dark page with a transparent control
// that is a sheet of white with grey text on it, and no amount of CSS fixes
// it — `color-scheme: dark` reaches the arrow and the scrollbar and stops
// there. The shared Select renders its popup in the DOM, where it can be
// themed like everything else.
let natives = 0;
for (const f of [...walk("app"), ...walk("components")]) {
  if (f.replace(/\\/g, "/").endsWith("components/ui/select.tsx")) continue;
  // Comments stripped: several of these files EXPLAIN why a native select is
  // wrong, and a check that fires on its own documentation is a check people
  // learn to switch off.
  const src = fs
    .readFileSync(f, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  if (/<select[\s>]/.test(src)) {
    natives++;
    problems.push(
      `${f} renders a native <select> — its popup cannot be themed and shows ` +
        "white on a dark page. Use the Select from @/components/ui/select.",
    );
  }
}
if (natives === 0) {
  rows.push("  ok    no native <select> left to render white in the dark");
}

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);

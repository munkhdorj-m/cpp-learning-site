// The C++ starter template, and the promise that goes with it.
//
//   node_modules/.bin/jiti scripts/check-starter.mts
//
// Two separate things, and only one of them is a preference:
//
//   * what an empty editor contains. That is <iostream> now — the header the
//     course teaches and the standard actually defines.
//   * that <bits/stdc++.h> still WORKS. That is not a preference, it is a
//     promise: every competitive-programming page a student finds opens with
//     it, and half the code they are shown online uses it. Nothing in this app
//     may reject, penalise or flag it.
//
// The second is what this file mostly guards, because it is the one that could
// be broken later by someone tidying up the first.
import fs from "node:fs";

import { LANGUAGES } from "../lib/languages.ts";
import { analyse, SIGNAL_THRESHOLD } from "../lib/code-signals.ts";

const problems: string[] = [];
const rows: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  if (!ok) problems.push(name + (detail ? ` — ${detail}` : ""));
}

/* ------------------------------------------------- the default template */

const cpp = LANGUAGES.cpp.starter;

check("the C++ starter includes <iostream>", cpp.includes("#include <iostream>"));
check(
  "the C++ starter no longer includes <bits/stdc++.h>",
  !cpp.includes("bits/stdc++.h"),
);
check("it still opens namespace std", cpp.includes("using namespace std;"));
check("it still has a main()", /int main\s*\(\s*\)\s*\{/.test(cpp));
check("it still returns 0", cpp.includes("return 0;"));
// The cursor lands on the blank line inside main; losing it means a student
// starts typing on top of the closing brace.
check(
  "there is a blank line inside main to type into",
  /\{\n\n/.test(cpp),
);

check(
  "the Python starter is untouched",
  !LANGUAGES.python.starter.includes("#include"),
);

/* ------------------------------- bits/stdc++.h is not penalised anywhere */

// The submission signals are shown to a teacher as "worth a look". A student
// writing the header every online tutorial uses must not land there.
const withBits = `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total = total + x;
    }
    cout << total << endl;
    return 0;
}
`;
const report = analyse(withBits, "cpp", {
  difficulty: "easy",
  attemptsBefore: 1,
  secondsSincePrevious: 600,
});
check(
  "ordinary work using <bits/stdc++.h> raises no signal",
  report.score < SIGNAL_THRESHOLD && report.signals.length === 0,
  `score ${report.score} [${report.signals.map((s) => s.code).join(",") || "-"}]`,
);

// The same program on <iostream> must score identically — the include must
// make no difference at all to how a student is judged.
const withIostream = withBits.replace("<bits/stdc++.h>", "<iostream>");
const plain = analyse(withIostream, "cpp", {
  difficulty: "easy",
  attemptsBefore: 1,
  secondsSincePrevious: 600,
});
check(
  "the two headers score exactly the same",
  plain.score === report.score,
  `${plain.score} vs ${report.score}`,
);

// And no rule anywhere keys on an include at all.
const signals = fs.readFileSync("lib/code-signals.ts", "utf8");
const beyond = signals.slice(
  signals.indexOf("const BEYOND_COURSE"),
  signals.indexOf("];", signals.indexOf("const BEYOND_COURSE")),
);
check(
  "no submission signal keys on an #include",
  !/#include|bits\/stdc|iostream/.test(beyond),
);

/* ---------------------------- nothing in the pipeline filters the source */

for (const f of ["app/api/submit/route.ts", "app/api/run/route.ts"]) {
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, "utf8");
  check(
    `${f} does not filter includes`,
    !/bits\/stdc|banned|blocklist|forbidden.*include/i.test(src),
  );
}

// Both judge backends are GCC, which is what ships bits/stdc++.h. If either
// ever moves to clang, bits/stdc++.h stops existing and this promise breaks —
// so the compiler is asserted, not assumed.
const goJudge = fs.readFileSync("lib/judge/go-judge.ts", "utf8");
check(
  "go-judge compiles C++ with g++",
  /\/usr\/bin\/g\+\+/.test(goJudge),
  "bits/stdc++.h is a libstdc++ header — clang would not find it",
);
check(
  "the Judge0 fallback is a GCC image",
  LANGUAGES.cpp.judge0Id === 54,
  `judge0Id=${LANGUAGES.cpp.judge0Id} (54 = GCC 9.2.0)`,
);

/* ------------------------------------------------- the editor snippets */

const completions = fs.readFileSync("lib/editor-completions.ts", "utf8");
check(
  "the suggested opening lines use <iostream>",
  /label: "include",[\s\S]{0,120}<iostream>/.test(completions),
);
check(
  "bits/stdc++.h is still offered as its own snippet",
  /label: "include-all",[\s\S]{0,200}bits\/stdc\+\+\.h/.test(completions),
);
// The snippet strings are JS source with escaped newlines in them; a real
// newline there is a syntax error, and it is an easy one to introduce.
check(
  "no snippet has a raw newline inside its insert string",
  !/insert: "[^"]*\n/.test(completions),
);

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);

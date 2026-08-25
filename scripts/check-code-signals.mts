// What the submission signals must and must not fire on.
//
//   node_modules/.bin/jiti scripts/check-code-signals.mts
//
// The failure that matters here is the false positive: a signal on ordinary
// work sends a teacher to accuse a child who did nothing. Most of these cases
// exist to prove something stays QUIET.
import { SIGNAL_THRESHOLD, analyse } from "../lib/code-signals.ts";

const problems: string[] = [];
const rows: string[] = [];

/** Fires the named signal, but not enough of them to reach the threshold. */
function expectSignalButQuiet(
  name: string,
  got: { score: number; signals: { code: string }[] },
  wantCode: string,
) {
  const fired = got.signals.some((s) => s.code === wantCode);
  const quiet = got.score < SIGNAL_THRESHOLD;
  const ok = fired && quiet;
  rows.push(
    `  ${ok ? "ok  " : "FAIL"}  ${String(got.score).padStart(3)}  ${name}  [${got.signals.map((s) => s.code).join(",") || "-"}] on its own, below the bar`,
  );
  if (!fired) problems.push(`${name}: the "${wantCode}" signal did not fire at all`);
  if (!quiet) {
    problems.push(
      `${name}: scored ${got.score} on its own — this signal must not reach the threshold alone`,
    );
  }
}

function expect(
  name: string,
  got: { score: number; signals: { code: string }[] },
  want: "quiet" | "flagged",
  wantCodes: string[] = [],
) {
  const flagged = got.score >= SIGNAL_THRESHOLD;
  const ok = want === "flagged" ? flagged : !flagged;
  const codes = got.signals.map((s) => s.code).join(",") || "-";
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${String(got.score).padStart(3)}  ${name}  [${codes}]`);
  if (!ok) problems.push(`${name}: scored ${got.score}, expected ${want}`);
  for (const c of wantCodes) {
    if (!got.signals.some((s) => s.code === c)) {
      problems.push(`${name}: expected the "${c}" signal and it did not fire`);
    }
  }
}

/* ---------------------------------------------------- ordinary student work */

// Exactly what a grade-7 student hands in. Must stay silent.
expect(
  "a plain student solution",
  analyse(
    `#include <iostream>
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
}`,
    "cpp",
    { difficulty: "easy", attemptsBefore: 2, secondsSincePrevious: 900 },
  ),
  "quiet",
);

// A careful student who comments — terse, lowercase, a few of them.
expect(
  "a student who comments in their own voice",
  analyse(
    `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;      // how many
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total = total + x;   // add it on
    }
    cout << total << endl;
    return 0;
}`,
    "cpp",
    { difficulty: "medium", attemptsBefore: 1, secondsSincePrevious: 600 },
  ),
  "quiet",
);

// A bright student who gets an EASY problem first time and fast. The signal is
// deliberately limited to hard problems, so this must stay quiet.
expect(
  "an easy problem solved first time, fast",
  analyse(
    `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
    "cpp",
    { difficulty: "easy", attemptsBefore: 0, secondsSincePrevious: 40 },
  ),
  "quiet",
);

// A student who took several goes at a hard problem and got there. Must be
// quiet: this is what learning looks like.
expect(
  "a hard problem after four attempts",
  analyse(
    `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    int best = v[0];
    for (int i = 1; i < n; i++) {
        if (v[i] > best) best = v[i];
    }
    cout << best << endl;
    return 0;
}`,
    "cpp",
    { difficulty: "hard", attemptsBefore: 4, secondsSincePrevious: 120 },
  ),
  "quiet",
);

// Python, written the way the course teaches it.
expect(
  "plain student python",
  analyse(
    `n = int(input())
total = 0
for i in range(n):
    x = int(input())
    total = total + x
print(total)`,
    "python",
    { difficulty: "easy", attemptsBefore: 1, secondsSincePrevious: 500 },
  ),
  "quiet",
);

/* ------------------------------------------------------- worth a look */

// Constructs nothing in twelve units covers.
expect(
  "C++ using lambdas and accumulate",
  analyse(
    `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> v(n);
    for (auto &x : v) cin >> x;
    auto total = accumulate(v.begin(), v.end(), 0, [](int a, int b) { return a + b; });
    cout << total << '\\n';
    return 0;
}`,
    "cpp",
    { difficulty: "easy", attemptsBefore: 1, secondsSincePrevious: 700 },
  ),
  "flagged",
  ["beyond_course"],
);

// A comment on every line, in full sentences.
expect(
  "documentation-style comments throughout",
  analyse(
    `#include <iostream>
using namespace std;

int main() {
    // Declare the variable to hold the count of numbers.
    int n;
    // Read the count from the standard input stream.
    cin >> n;
    // Initialise the running total to zero.
    int total = 0;
    // Iterate over each of the numbers in turn.
    for (int i = 0; i < n; i++) {
        // Declare a temporary variable for the value.
        int x;
        // Read the next value from the input.
        cin >> x;
        // Add the value to the running total.
        total = total + x;
    }
    // Print the final total to the output.
    cout << total << endl;
    return 0;
}`,
    "cpp",
    { difficulty: "easy", attemptsBefore: 0, secondsSincePrevious: 800 },
  ),
  "flagged",
  ["comment_style"],
);

// Python reaching well past the course.
expect(
  "python with comprehensions and f-strings",
  analyse(
    `from collections import Counter

def solve(values: list) -> int:
    counts = Counter(values)
    best = max((v for v in values if counts[v] > 1), default=0)
    return best

n = int(input())
data = [int(x) for x in input().split() if x]
print(f"{solve(data)}")`,
    "python",
    { difficulty: "medium", attemptsBefore: 1, secondsSincePrevious: 600 },
  ),
  "flagged",
  ["beyond_course"],
);

// A hard problem, first go, ninety seconds after their last activity.
//
// This one fires as a signal but is deliberately NOT enough on its own: a
// genuinely strong student does exactly this, and a tool that tells a teacher
// to investigate their best student every week gets switched off — and then it
// catches nothing at all. It only reaches the threshold alongside something
// checkable, which is the right trade.
expectSignalButQuiet(
  "a hard problem in ninety seconds, first try",
  analyse(
    `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; cin >> n;
    vector<long long> dp(n + 1, 0);
    dp[0] = 1; dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
    cout << dp[n] << endl;
    return 0;
}`,
    "cpp",
    { difficulty: "hard", attemptsBefore: 0, secondsSincePrevious: 90 },
  ),
  "instant_hard",
);

/* ------------------------------------------------------- boundary sanity */

// A two-line program with one comment must never trip the comment test.
const tiny = analyse(
  `# add them
print(int(input()) + int(input()))`,
  "python",
  {},
);
if (tiny.signals.some((s) => s.code === "comment_style")) {
  problems.push("the comment signal fired on a two-line program");
}
rows.push(
  `  ${tiny.signals.some((s) => s.code === "comment_style") ? "FAIL" : "ok  "}    ${tiny.score}  a two-line program with a comment`,
);

// No context at all must not invent a timing signal.
const noCtx = analyse("int main(){int a;a=1;return a;}", "cpp");
if (noCtx.signals.some((s) => s.code === "instant_hard")) {
  problems.push("the timing signal fired with no timing information");
}

console.log(`threshold: ${SIGNAL_THRESHOLD}`);
for (const r of rows) console.log(r);

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("\nno problems");

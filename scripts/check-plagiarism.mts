// What the similarity detector must and must not flag.
//
//   node_modules/.bin/jiti scripts/check-plagiarism.mts
//
// Every case here is a thing a student actually does. The rename case is the
// reason this file exists: the old detector's comment promised it survived
// renames and it did not, and nothing in the repo would have told anyone.
import {
  MIN_TOKENS,
  SIMILARITY_THRESHOLD,
  compare,
  normalise,
} from "../lib/plagiarism.ts";

const problems: string[] = [];
const rows: string[] = [];

function report(name: string, got: number, expect: "high" | "low", note = "") {
  const ok = expect === "high" ? got >= SIMILARITY_THRESHOLD : got < SIMILARITY_THRESHOLD;
  rows.push(
    `  ${ok ? "ok  " : "FAIL"}  ${(got * 100).toFixed(0).padStart(3)}%  ${name}${note ? "  (" + note + ")" : ""}`,
  );
  if (!ok) {
    problems.push(
      `${name}: scored ${(got * 100).toFixed(0)}% but should be ${expect} (threshold ${(SIMILARITY_THRESHOLD * 100).toFixed(0)}%)`,
    );
  }
}

/* ------------------------------------------------------- the original work */

const ORIGINAL = `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> values(n);
    for (int i = 0; i < n; i++) {
        cin >> values[i];
    }
    int total = 0;
    for (int i = 0; i < n; i++) {
        total = total + values[i];
    }
    cout << total << endl;
    return 0;
}`;

/* --------------------------------------------- copies, dressed up a bit */

// 1. Every name changed. This is the case the old detector missed.
const RENAMED = `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int count;
    cin >> count;
    vector<int> numbers(count);
    for (int k = 0; k < count; k++) {
        cin >> numbers[k];
    }
    int sum = 0;
    for (int k = 0; k < count; k++) {
        sum = sum + numbers[k];
    }
    cout << sum << endl;
    return 0;
}`;
report("renamed every variable", compare(ORIGINAL, RENAMED).score, "high");

// 2. Reformatted: braces moved, indentation destroyed, blank lines added.
const REFORMATTED = `#include <iostream>
#include <vector>
using namespace std;
int main()
{
  int n; cin >> n;

  vector<int> values(n);

  for (int i = 0; i < n; i++) { cin >> values[i]; }
  int total = 0;
  for (int i = 0; i < n; i++)
  {
        total = total + values[i];
  }
  cout << total << endl; return 0;
}`;
report("reformatted", compare(ORIGINAL, REFORMATTED).score, "high");

// 3. Comments bolted on, which is what a student does to make it "theirs".
const COMMENTED = `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // read how many numbers there are
    int n;
    cin >> n;
    /* make room for them */
    vector<int> values(n);
    for (int i = 0; i < n; i++) {
        cin >> values[i];   // read one
    }
    int total = 0;  // running total
    for (int i = 0; i < n; i++) {
        total = total + values[i];  // add it on
    }
    cout << total << endl;  // print the answer
    return 0;
}`;
report("comments added", compare(ORIGINAL, COMMENTED).score, "high");

// 4. Renamed AND reformatted AND commented, all at once.
const DISGUISED = `#include <iostream>
#include <vector>
using namespace std;
int main(){
  // how many
  int howMany; cin >> howMany;
  vector<int> data(howMany);
  /* read them all in */
  for(int idx=0; idx<howMany; idx++){ cin >> data[idx]; }
  int answer=0;
  for(int idx=0; idx<howMany; idx++){ answer=answer+data[idx]; }
  cout << answer << endl;   // done
  return 0;
}`;
report("renamed, reformatted and commented", compare(ORIGINAL, DISGUISED).score, "high");

// 5. Their code, with a function of the student's own bolted on top. Jaccard
//    alone scores this low; containment is what catches it.
const PLUS_EXTRA = `#include <iostream>
#include <vector>
using namespace std;

int biggest(vector<int> v) {
    int best = v[0];
    for (int i = 1; i < (int)v.size(); i++) {
        if (v[i] > best) best = v[i];
    }
    return best;
}

void greet() {
    cout << "hello" << endl;
    cout << "starting" << endl;
}

int main() {
    int n;
    cin >> n;
    vector<int> values(n);
    for (int i = 0; i < n; i++) {
        cin >> values[i];
    }
    int total = 0;
    for (int i = 0; i < n; i++) {
        total = total + values[i];
    }
    cout << total << endl;
    return 0;
}`;
const extra = compare(ORIGINAL, PLUS_EXTRA);
report("copied, with extra code around it", extra.score, "high",
  `jaccard ${(extra.jaccard * 100).toFixed(0)}%, contained ${(extra.contained * 100).toFixed(0)}%`);

/* ---------------------------------------------------- genuinely different */

// A different algorithm for a different problem.
const DIFFERENT = `#include <iostream>
#include <string>
using namespace std;

int main() {
    string word;
    cin >> word;
    bool same = true;
    int left = 0;
    int right = (int)word.length() - 1;
    while (left < right) {
        if (word[left] != word[right]) {
            same = false;
            break;
        }
        left++;
        right--;
    }
    if (same) {
        cout << "yes" << endl;
    } else {
        cout << "no" << endl;
    }
    return 0;
}`;
report("a different problem entirely", compare(ORIGINAL, DIFFERENT).score, "low");

// The same problem, solved a different way. Two students who both understood
// it are allowed to look somewhat alike, but not like a copy.
const OWN_WORK = `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long running = 0;
    while (n > 0) {
        int x;
        cin >> x;
        running += x;
        n--;
    }
    cout << running << "\\n";
    return 0;
}`;
const own = compare(ORIGINAL, OWN_WORK);
report("same problem, own approach", own.score, "low",
  `jaccard ${(own.jaccard * 100).toFixed(0)}%`);

/* ------------------------------------------------- boilerplate must not flag */

const HELLO_A = `#include <iostream>
using namespace std;
int main() {
    cout << "Hello" << endl;
    return 0;
}`;
const HELLO_B = `#include <iostream>
using namespace std;
int main() {
    cout << "Sain baina uu" << endl;
    return 0;
}`;
const hello = compare(HELLO_A, HELLO_B);
if (hello.score !== 0) {
  problems.push(
    `two hello-worlds scored ${(hello.score * 100).toFixed(0)}% — anything under ${MIN_TOKENS} normalised tokens must score 0`,
  );
}
rows.push(`  ${hello.score === 0 ? "ok  " : "FAIL"}    0%  two hello-worlds are not comparable`);

/* ------------------------------------------------------------- python too */

const PY = `n = int(input())
values = []
for i in range(n):
    values.append(int(input()))
total = 0
for i in range(n):
    total = total + values[i]
print(total)`;
const PY_RENAMED = `count = int(input())
numbers = []
for k in range(count):
    numbers.append(int(input()))
# add them up
sum_so_far = 0
for k in range(count):
    sum_so_far = sum_so_far + numbers[k]
print(sum_so_far)`;
report("python, renamed and commented", compare(PY, PY_RENAMED, "python").score, "high");

const PY_DIFFERENT = `word = input()
print("yes" if word == word[::-1] else "no")`;
report("python, different problem", compare(PY, PY_DIFFERENT, "python").score, "low");

/* ------------------------------------------- normalisation, checked directly */

// The property the whole thing rests on: a rename must not change the shape.
const shapeA = normalise(ORIGINAL).join(" ");
const shapeB = normalise(RENAMED).join(" ");
if (shapeA !== shapeB) {
  problems.push(
    "normalise() gave different token streams for the same program with renamed variables",
  );
}
rows.push(
  `  ${shapeA === shapeB ? "ok  " : "FAIL"}       renaming does not change the normalised shape`,
);

// Comments and formatting must not either.
if (normalise(ORIGINAL).join(" ") !== normalise(REFORMATTED).join(" ")) {
  problems.push("normalise() was changed by reformatting alone");
}
if (normalise(ORIGINAL).join(" ") !== normalise(COMMENTED).join(" ")) {
  problems.push("normalise() was changed by comments alone");
}
// And identifiers really are flattened.
if (normalise("int abc = 1;").join(" ") !== normalise("int xyz = 1;").join(" ")) {
  problems.push("normalise() kept identifier names");
}
// But keywords are not.
if (normalise("int x;").join(" ") === normalise("float x;").join(" ")) {
  problems.push("normalise() flattened a type keyword, which is real structure");
}

console.log(`threshold: ${(SIMILARITY_THRESHOLD * 100).toFixed(0)}%`);
for (const r of rows) console.log(r);

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("\nno problems");

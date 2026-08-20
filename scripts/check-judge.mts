// Points the site's own judging code at whatever judge is configured and
// checks it end to end.
//
//   npx tsx scripts/check-judge.mts
//
// Run this the moment the sandbox is up. It exercises the things that can
// only be confirmed against a real instance: that the compiler and Python are
// where the config expects them, that a compiled binary can actually be run
// back, and that limits are enforced rather than ignored.

import fs from "node:fs";

// Read .env.local the way Next does, so this checks the real configuration.
for (const file of [".env.development.local", ".env.local"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const judge = await import("../lib/judge/index");

const active = judge.activeBackend();
console.log(`primary  : ${active.primary}`);
console.log(`fallback : ${active.fallback ?? "none"}`);
if (active.primary === "go-judge" || active.fallback === "go-judge") {
  console.log(`go-judge : ${process.env.GO_JUDGE_URL ?? "http://127.0.0.1:5050"}`);
  console.log(`token    : ${process.env.GO_JUDGE_TOKEN ? "set" : "NOT SET"}`);
}
console.log("");

let failures = 0;
async function scenario(name: string, fn: () => Promise<string | null>) {
  process.stdout.write(name.padEnd(46));
  try {
    const problem = await fn();
    if (problem) {
      console.log("FAIL  " + problem);
      failures++;
    } else console.log("ok");
  } catch (e) {
    console.log("ERROR " + (e instanceof Error ? e.message : String(e)));
    failures++;
  }
}

const CPP_SUM = `#include <iostream>
int main(){ long long a,b; std::cin>>a>>b; std::cout<<a+b<<"\\n"; }`;

const PY_SUM = `a, b = map(int, input().split())
print(a + b)`;

await scenario("C++ compiles and runs", async () => {
  const r = await judge.runOnce({ source: CPP_SUM, stdin: "2 3\n", language: "cpp" });
  if (r.compile_output) return "compiler said: " + r.compile_output.slice(0, 200);
  return r.stdout.trim() === "5" ? null : `printed ${JSON.stringify(r.stdout)}`;
});

await scenario("C++ graded over several tests", async () => {
  const r = await judge.grade({
    source: CPP_SUM,
    tests: [
      { stdin: "1 1\n", expected_stdout: "2\n" },
      { stdin: "10 -4\n", expected_stdout: "6\n" },
      { stdin: "0 0\n", expected_stdout: "0\n" },
    ],
    timeLimitMs: 2000,
    memoryLimitKb: 131072,
    language: "cpp",
  });
  return r.verdict === "accepted" ? null : `${r.verdict} at test ${r.failedAt}`;
});

await scenario("a wrong answer is marked wrong", async () => {
  const r = await judge.grade({
    source: CPP_SUM,
    tests: [{ stdin: "1 1\n", expected_stdout: "3\n" }],
    timeLimitMs: 2000,
    memoryLimitKb: 131072,
    language: "cpp",
  });
  return r.verdict === "wrong_answer" ? null : "got " + r.verdict;
});

await scenario("a broken program is a compile error", async () => {
  const r = await judge.grade({
    source: "int main(){ this is not c++ }",
    tests: [{ stdin: "", expected_stdout: "" }],
    timeLimitMs: 2000,
    memoryLimitKb: 131072,
    language: "cpp",
  });
  if (r.verdict !== "compile_error") return "got " + r.verdict;
  return r.compile_output ? null : "no compiler message was passed through";
});

await scenario("an endless loop is stopped", async () => {
  const r = await judge.grade({
    source: "int main(){ while(true){} }",
    tests: [{ stdin: "", expected_stdout: "" }],
    timeLimitMs: 1000,
    memoryLimitKb: 131072,
    language: "cpp",
  });
  return r.verdict === "time_limit_exceeded" ? null : "got " + r.verdict;
});

await scenario("a crash is a runtime error", async () => {
  const r = await judge.grade({
    source: "int main(){ int* p = 0; *p = 1; }",
    tests: [{ stdin: "", expected_stdout: "" }],
    timeLimitMs: 2000,
    memoryLimitKb: 131072,
    language: "cpp",
  });
  return r.verdict === "runtime_error" ? null : "got " + r.verdict;
});

await scenario("Python runs", async () => {
  const r = await judge.runOnce({ source: PY_SUM, stdin: "4 5\n", language: "python" });
  return r.stdout.trim() === "9" ? null : `printed ${JSON.stringify(r.stdout)} ${r.stderr}`;
});

await scenario("Python is graded", async () => {
  const r = await judge.grade({
    source: PY_SUM,
    tests: [
      { stdin: "2 2\n", expected_stdout: "4\n" },
      { stdin: "-1 1\n", expected_stdout: "0\n" },
    ],
    timeLimitMs: 3000,
    memoryLimitKb: 131072,
    language: "python",
  });
  return r.verdict === "accepted" ? null : `${r.verdict} at test ${r.failedAt}`;
});

await scenario("the sandbox is not on the network", async () => {
  // A student's program must not be able to phone home. If this ever passes,
  // the sandbox is not isolated and should not be exposed to a class.
  const r = await judge.runOnce({
    source: `#include <cstdlib>
#include <iostream>
int main(){ int rc = system("curl -s -m 3 https://example.com > /dev/null"); std::cout << rc << "\\n"; }`,
    stdin: "",
    language: "cpp",
  });
  const rc = parseInt(r.stdout.trim(), 10);
  return Number.isFinite(rc) && rc !== 0
    ? null
    : `the program reached the network (exit ${r.stdout.trim() || "?"})`;
});

console.log("");
console.log(failures ? `${failures} check(s) failed` : "the judge is working");
process.exit(failures ? 1 : 0);

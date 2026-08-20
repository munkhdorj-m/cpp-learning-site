// Tests the backend switch and the failover between judges.
//
// The point of the fallback is a bad afternoon: the VPS is reclaimed, or the
// firewall changes, mid-lesson. Submissions must quietly carry on elsewhere.
// Just as important is the opposite rule — a judge that is merely BUSY must
// not trigger a retry on the other one, or a rate limit on one service turns
// into a rate limit on both.
//
// The backend is chosen when the module first loads, so each scenario needs
// its own process:
//
//   MODE=failover     node scripts/test-judge-fallback.mts
//   MODE=busy         node scripts/test-judge-fallback.mts

import http from "node:http";
import type { AddressInfo } from "node:net";

const MODE = process.env.MODE ?? "failover";

let judge0Hits = 0;
const b64 = (s: string) => Buffer.from(s, "utf-8").toString("base64");

const judge0 = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    judge0Hits++;
    if (MODE === "busy") {
      res.writeHead(429).end("too many requests");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: { id: 3, description: "Accepted" },
        stdout: b64("ok\n"),
        stderr: null,
        compile_output: null,
        message: null,
        time: "0.05",
        memory: 2048,
        exit_code: 0,
      }),
    );
  });
});
await new Promise<void>((r) => judge0.listen(0, "127.0.0.1", r));
const judge0Port = (judge0.address() as AddressInfo).port;

// A port with nothing listening: what a reclaimed VPS looks like from here.
const probe = http.createServer();
await new Promise<void>((r) => probe.listen(0, "127.0.0.1", r));
const deadPort = (probe.address() as AddressInfo).port;
await new Promise<void>((r) => probe.close(() => r()));

process.env.GO_JUDGE_URL = `http://127.0.0.1:${deadPort}`;
process.env.JUDGE0_API_URL = `http://127.0.0.1:${judge0Port}`;
process.env.JUDGE0_API_KEY = "unused-by-the-fake";

if (MODE === "failover") {
  process.env.JUDGE_BACKEND = "go-judge"; // unreachable
  process.env.JUDGE_FALLBACK = "judge0"; // healthy
} else {
  process.env.JUDGE_BACKEND = "judge0"; // reachable, but rate limited
  process.env.JUDGE_FALLBACK = "go-judge"; // unreachable, must not be tried
}

const judge = await import("../lib/judge/index");

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) console.log("  ok   " + name);
  else {
    console.log("  FAIL " + name + (detail ? "  — " + detail : ""));
    failures++;
  }
}

const tests = [{ stdin: "", expected_stdout: "ok" }];
const args = {
  source: "int main(){}",
  tests,
  timeLimitMs: 1000,
  memoryLimitKb: 65536,
  language: "cpp" as const,
};

if (MODE === "failover") {
  console.log("\nThe sandbox is unreachable");
  const active = judge.activeBackend();
  check("primary is go-judge", active.primary === "go-judge", active.primary);
  check("fallback is judge0", active.fallback === "judge0", String(active.fallback));

  judge0Hits = 0;
  const r = await judge.grade(args);
  check("the submission still gets a verdict", r.verdict === "accepted", r.verdict);
  check("it was judged by the fallback", judge0Hits === 1, `${judge0Hits} calls`);

  judge0Hits = 0;
  const p = await judge.runOnce({ source: "x", stdin: "", language: "cpp" });
  check("the playground still runs", p.stdout === "ok\n", JSON.stringify(p.stdout));
  check("also via the fallback", judge0Hits === 1, `${judge0Hits} calls`);
} else {
  console.log("\nThe judge is merely busy");
  const active = judge.activeBackend();
  check("primary is judge0", active.primary === "judge0", active.primary);

  judge0Hits = 0;
  let caught: unknown = null;
  try {
    await judge.grade(args);
  } catch (e) {
    caught = e;
  }
  // Had it failed over, the dead port would have produced JudgeUnavailableError
  // instead — so the error type alone proves the fallback was not attempted.
  check(
    "a rate limit is reported as a rate limit",
    caught instanceof judge.JudgeRateLimitError,
    String(caught),
  );
  check(
    "the other judge was not dragged in",
    !(caught instanceof judge.JudgeUnavailableError),
    String(caught),
  );
  check("the busy judge was asked exactly once", judge0Hits === 1, `${judge0Hits} calls`);
}

judge0.close();
console.log(failures ? `\n${failures} FAILURE(S)` : "\nall checks passed");
process.exit(failures ? 1 : 0);

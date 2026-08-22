// Tests the go-judge client against a stand-in for go-judge itself.
//
// The real sandbox needs Linux namespaces, so it cannot run here. What can be
// checked without it is everything this repo is actually responsible for: the
// shape of the requests, the unit conversions, compiling once and reusing the
// binary, releasing the cached file, comparing output, and turning a sandbox
// status into a verdict a student sees.

import http from "node:http";
import type { AddressInfo } from "node:net";

interface Recorded {
  method: string;
  url: string;
  body: any;
  auth: string | undefined;
}

const recorded: Recorded[] = [];
/** Replies the fake sandbox will give, in order. */
let queue: any[] = [];

const server = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    recorded.push({
      method: req.method ?? "",
      url: req.url ?? "",
      body: raw ? JSON.parse(raw) : null,
      auth: req.headers.authorization,
    });
    if (req.method === "DELETE") {
      res.writeHead(200).end("{}");
      return;
    }
    const next = queue.shift() ?? {
      status: "Internal Error",
      error: "fake sandbox ran out of scripted replies",
      exitStatus: 1,
      time: 0,
      runTime: 0,
      memory: 0,
    };
    if (next.__http) {
      res.writeHead(next.__http).end(next.__body ?? "");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([next]));
  });
});

await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const port = (server.address() as AddressInfo).port;
process.env.GO_JUDGE_URL = `http://127.0.0.1:${port}`;
process.env.GO_JUDGE_TOKEN = "test-token";

const { goJudgeBackend } = await import("../lib/judge/go-judge");
const { JudgeUnavailableError } = await import("../lib/judge/types");

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) console.log("  ok   " + name);
  else {
    console.log("  FAIL " + name + (detail ? "  — " + detail : ""));
    failures++;
  }
}
function reset(replies: any[]) {
  recorded.length = 0;
  queue = replies.slice();
}

const ok = (stdout: string, extra: Record<string, unknown> = {}) => ({
  status: "Accepted",
  exitStatus: 0,
  time: 12_000_000, // 12 ms of CPU
  runTime: 20_000_000,
  memory: 3 * 1024 * 1024, // 3 MB
  files: { stdout, stderr: "" },
  ...extra,
});
const compiled = () => ({
  status: "Accepted",
  exitStatus: 0,
  time: 400_000_000,
  runTime: 500_000_000,
  memory: 50 * 1024 * 1024,
  files: { stdout: "", stderr: "" },
  fileIds: { main: "CACHED123" },
});

const T = (stdin: string, expected: string) => ({
  stdin,
  expected_stdout: expected,
});

console.log("\nC++ — all tests pass");
{
  reset([compiled(), ok("3\n"), ok("7\n")]);
  const r = await goJudgeBackend.grade({
    source: "int main(){}",
    tests: [T("1 2\n", "3\n"), T("3 4\n", "7\n")],
    timeLimitMs: 1000,
    memoryLimitKb: 65536,
    language: "cpp",
  });
  check("verdict is accepted", r.verdict === "accepted", r.verdict);
  check("counts both tests", r.passed === 2 && r.total === 2);
  check("reports slowest run in ms", r.runtime_ms === 12, String(r.runtime_ms));
  check("reports peak memory in KB", r.memory_kb === 3072, String(r.memory_kb));

  const posts = recorded.filter((x) => x.method === "POST");
  check("compiles once, then one run per test", posts.length === 3, String(posts.length));

  const compile = posts[0].body.cmd[0];
  check("compile sends the source", compile.copyIn["main.cpp"].content === "int main(){}");
  check("compile asks for the binary back", compile.copyOutCached?.[0] === "main");

  const run = posts[1].body.cmd[0];
  check("run reuses the cached binary", run.copyIn.main?.fileId === "CACHED123");
  check("run does not resend the source", !run.copyIn["main.cpp"]);
  check("stdin is passed as the first file", run.files[0].content === "1 2\n");
  check("time limit converted ms to ns", run.cpuLimit === 1_000_000_000, String(run.cpuLimit));
  check("wall clock is more generous than CPU", run.clockLimit > run.cpuLimit);
  check("memory converted KB to bytes", run.memoryLimit === 65536 * 1024);

  const del = recorded.find((x) => x.method === "DELETE");
  check("cached binary is released", del?.url === "/file/CACHED123", del?.url ?? "none");
}

console.log("\nOutput comparison");
{
  reset([compiled(), ok("3\n")]);
  const r = await goJudgeBackend.grade({
    source: "x", tests: [T("", "3")], timeLimitMs: 1000, memoryLimitKb: 65536, language: "cpp",
  });
  check("trailing newline does not fail a student", r.verdict === "accepted", r.verdict);

  reset([compiled(), ok("3 \n4\t\n")]);
  const r2 = await goJudgeBackend.grade({
    source: "x", tests: [T("", "3\n4")], timeLimitMs: 1000, memoryLimitKb: 65536, language: "cpp",
  });
  check("trailing spaces on a line are ignored", r2.verdict === "accepted", r2.verdict);

  reset([compiled(), ok("4\n")]);
  const r3 = await goJudgeBackend.grade({
    source: "x", tests: [T("", "3")], timeLimitMs: 1000, memoryLimitKb: 65536, language: "cpp",
  });
  check("a genuinely different answer is wrong", r3.verdict === "wrong_answer", r3.verdict);

  reset([compiled(), ok("3\n"), ok("9\n")]);
  const r4 = await goJudgeBackend.grade({
    source: "x",
    tests: [T("", "3"), T("", "7"), T("", "11")],
    timeLimitMs: 1000, memoryLimitKb: 65536, language: "cpp",
  });
  check("stops at the first failure", r4.passed === 1 && r4.failedAt === 1, JSON.stringify(r4.passed));
  check("does not run the tests after it", recorded.filter((x) => x.method === "POST").length === 3);
}

console.log("\nThings that go wrong");
{
  reset([{ status: "Nonzero Exit Status", exitStatus: 1, time: 0, runTime: 0, memory: 0,
           files: { stdout: "", stderr: "main.cpp:3:5: error: expected ';'" } }]);
  const r = await goJudgeBackend.grade({
    source: "bad", tests: [T("", "x")], timeLimitMs: 1000, memoryLimitKb: 65536, language: "cpp",
  });
  check("failed compile is a compile error", r.verdict === "compile_error", r.verdict);
  check("the compiler message reaches the student",
    (r.compile_output ?? "").includes("expected ';'"), r.compile_output ?? "");
  check("no test was attempted", r.passed === 0);

  for (const [status, want] of [
    ["Time Limit Exceeded", "time_limit_exceeded"],
    ["Memory Limit Exceeded", "memory_limit_exceeded"],
    ["Signalled", "runtime_error"],
    ["Nonzero Exit Status", "runtime_error"],
    ["Output Limit Exceeded", "runtime_error"],
  ] as const) {
    reset([compiled(), { status, exitStatus: 1, time: 0, runTime: 0, memory: 0,
                         files: { stdout: "", stderr: "boom" } }]);
    const g = await goJudgeBackend.grade({
      source: "x", tests: [T("", "1")], timeLimitMs: 1000, memoryLimitKb: 65536, language: "cpp",
    });
    check(`${status} becomes ${want}`, g.verdict === want, g.verdict);
    const del = recorded.find((x) => x.method === "DELETE");
    check(`${status} still releases the binary`, !!del, "no DELETE");
  }
}

console.log("\nPython — nothing to compile");
{
  reset([ok("hello\n")]);
  const r = await goJudgeBackend.grade({
    source: "print('hello')", tests: [T("", "hello")],
    timeLimitMs: 2000, memoryLimitKb: 65536, language: "python",
  });
  check("accepted", r.verdict === "accepted", r.verdict);
  const posts = recorded.filter((x) => x.method === "POST");
  check("no compile step", posts.length === 1, String(posts.length));
  const cmd = posts[0].body.cmd[0];
  check("source travels with the run", cmd.copyIn["main.py"].content === "print('hello')");
  check("runs python3", cmd.args[0].endsWith("python3"), cmd.args.join(" "));
  check("nothing to release", !recorded.some((x) => x.method === "DELETE"));
}

console.log("\nThe playground (runOnce)");
{
  reset([compiled(), ok("42\n")]);
  const r = await goJudgeBackend.runOnce({
    source: "x", stdin: "", language: "cpp",
  });
  check("status id matches Judge0's Accepted", r.statusId === 3, String(r.statusId));
  check("stdout is returned", r.stdout === "42\n", JSON.stringify(r.stdout));
  check("timing reported", r.runtime_ms === 12, String(r.runtime_ms));

  reset([{ status: "Nonzero Exit Status", exitStatus: 1, time: 0, runTime: 0, memory: 0,
           files: { stdout: "", stderr: "syntax error" } }]);
  const c = await goJudgeBackend.runOnce({ source: "bad", stdin: "", language: "cpp" });
  check("compile error shows as Judge0 status 6", c.statusId === 6, String(c.statusId));
  check("message is shown as compiler output", c.compile_output.includes("syntax error"));
}

console.log("\nAuth and unreachability");
{
  reset([compiled(), ok("1\n")]);
  await goJudgeBackend.runOnce({ source: "x", stdin: "", language: "cpp" });
  check(
    "every request carries the bearer token",
    recorded.length > 0 && recorded.every((r) => r.auth === "Bearer test-token"),
    JSON.stringify(recorded.map((r) => r.auth)),
  );

  reset([{ __http: 401, __body: "unauthorized" }]);
  let caught: unknown = null;
  try {
    await goJudgeBackend.runOnce({ source: "x", stdin: "", language: "cpp" });
  } catch (e) { caught = e; }
  check("a rejected token is 'unavailable', not a crash",
    caught instanceof JudgeUnavailableError, String(caught));

  reset([{ __http: 503, __body: "down" }]);
  caught = null;
  try {
    await goJudgeBackend.grade({ source: "x", tests: [T("", "1")], timeLimitMs: 1000,
      memoryLimitKb: 65536, language: "cpp" });
  } catch (e) { caught = e; }
  check("a 5xx is 'unavailable' so it can fail over",
    caught instanceof JudgeUnavailableError, String(caught));
}

server.close();
console.log(failures ? `\n${failures} FAILURE(S)` : "\nall checks passed");
process.exit(failures ? 1 : 0);

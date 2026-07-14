// For each scraped SPOJ problem, ask DeepSeek to:
//   - clean the statement into Markdown (MN + EN)
//   - write a C++ reference solution
//   - propose ~10 additional test inputs
// Then compile the reference, validate it on every visible sample, and run it
// against the extra inputs to capture expected outputs. Problems that fail
// sample validation are quarantined (status: "ref_wrong") and NOT imported.
//
// Required env: DEEPSEEK_API_KEY (DeepSeek API is OpenAI-compatible — get a
// key at https://platform.deepseek.com/api_keys)
// Usage:  node scripts/build-tests.mjs
//         node scripts/build-tests.mjs --only ABC,DEF      (filter by code)
//         node scripts/build-tests.mjs --limit 5            (process N then stop)

import OpenAI from "openai";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const IN_DIR = path.resolve(SCRIPT_DIR, "data/spoj-rgb7");
const OUT_DIR = path.resolve(SCRIPT_DIR, "data/spoj-rgb7-built");
const MODEL = "deepseek-chat";
const MAX_COMPILE_SEC = 15;
const MAX_RUN_SEC = 5;

const args = process.argv.slice(2);
const only = (() => {
  const i = args.indexOf("--only");
  return i >= 0 ? new Set(args[i + 1].split(",")) : null;
})();
const limit = (() => {
  const i = args.indexOf("--limit");
  return i >= 0 ? parseInt(args[i + 1], 10) : Infinity;
})();

if (!process.env.DEEPSEEK_API_KEY) {
  console.error("Set DEEPSEEK_API_KEY in your .env.local (sign up at https://platform.deepseek.com).");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const TOOL_SCHEMA = {
  type: "function",
  function: {
    name: "submit_problem",
    description:
      "Submit the cleaned problem definition, reference C++ solution, and extra test inputs.",
    parameters: {
      type: "object",
      properties: {
      slug: {
        type: "string",
        description:
          "URL-safe lowercase slug derived from the problem code, e.g. 'sum-of-two' (3-40 chars, [a-z0-9-]+)",
      },
      title_mn: { type: "string" },
      title_en: { type: "string", description: "English translation/transliteration" },
      statement_mn: {
        type: "string",
        description:
          "Markdown of the main statement in Mongolian (or the source language). Preserve math, lists, examples wording — but exclude separate input/output/constraints sections.",
      },
      statement_en: { type: "string", description: "English Markdown translation" },
      input_format_mn: { type: "string" },
      input_format_en: { type: "string" },
      output_format_mn: { type: "string" },
      output_format_en: { type: "string" },
      constraints_mn: { type: "string" },
      constraints_en: { type: "string" },
      difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
      tags: { type: "array", items: { type: "string" } },
      time_limit_ms: { type: "integer", minimum: 100, maximum: 10000 },
      memory_limit_kb: { type: "integer", minimum: 16384, maximum: 524288 },
      xp_reward: { type: "integer", minimum: 5, maximum: 100 },
      reference_cpp: {
        type: "string",
        description:
          "Full standalone C++17 reference solution. Reads stdin, writes stdout. Must compile with g++ -O2 -std=c++17.",
      },
      samples: {
        type: "array",
        description:
          "The visible sample inputs and outputs from the problem statement, verbatim.",
        items: {
          type: "object",
          properties: { input: { type: "string" }, output: { type: "string" } },
          required: ["input", "output"],
        },
      },
      extra_test_inputs: {
        type: "array",
        description:
          "8-12 additional test inputs covering edge cases and stress (within constraints). Inputs only — outputs are computed by running the reference.",
        items: { type: "string" },
      },
    },
      required: [
        "slug",
        "title_mn",
        "title_en",
        "statement_mn",
        "statement_en",
        "difficulty",
        "tags",
        "time_limit_ms",
        "memory_limit_kb",
        "xp_reward",
        "reference_cpp",
        "samples",
        "extra_test_inputs",
      ],
    },
  },
};

function buildPrompt(raw) {
  const samplesHint = raw.pres && raw.pres.length > 0
    ? raw.pres.map((p, i) => `<pre id="${i}">\n${p}\n</pre>`).join("\n\n")
    : "(no <pre> blocks found)";
  return `You are preparing a competitive-programming problem for import into a Mongolian C++ learning site for 7th-8th graders.

Source problem (scraped from SPOJ /RGB7/):
- Code: ${raw.code}
- URL: ${raw.url}
- Title (as scraped): ${raw.title}
- Time limit (scraped): ${raw.timeLimit || "unknown"}
- Memory limit (scraped): ${raw.memoryLimit || "unknown"}

Full HTML body of the statement (you must read carefully to identify the problem, input format, output format, constraints, and sample I/O):

<<<HTML
${raw.bodyHtml.slice(0, 12000)}
HTML

Pre-formatted text blocks (usually contain samples):
${samplesHint}

YOUR JOB
1. Identify the problem statement, input format, output format, and constraints from the HTML.
2. Translate / clean-up everything to clear Markdown in BOTH Mongolian (statement_mn …) and English (statement_en …). Keep the math notation.
3. Identify the visible sample input/output pairs verbatim. Each sample = one (input, output) pair.
4. Write a correct, idiomatic C++17 reference solution that reads stdin and writes stdout. It must be standalone (compileable with \`g++ -O2 -std=c++17\`), efficient enough for the stated constraints, and produce output that EXACTLY matches the sample outputs (no extra blank lines or trailing spaces).
5. Propose 8-12 additional test inputs that probe edge cases and stress within the constraints. Do NOT include outputs — the harness will compute them by running your reference.
6. Pick an appropriate difficulty (easy / medium / hard) and 1-4 short kebab-case tags.
7. Set xp_reward roughly: easy=10, medium=20, hard=35.

Submit everything via the submit_problem tool. DO NOT respond in any other form.`;
}

function compile(cpp, exePath) {
  const srcPath = path.join(tmpdir(), `ref_${Date.now()}_${Math.random().toString(36).slice(2)}.cpp`);
  writeFileSync(srcPath, cpp, "utf8");
  try {
    execFileSync("g++", ["-O2", "-std=c++17", "-w", srcPath, "-o", exePath], {
      timeout: MAX_COMPILE_SEC * 1000,
      stdio: "pipe",
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.stderr?.toString() || e.message };
  } finally {
    try { unlinkSync(srcPath); } catch { /* noop */ }
  }
}

async function runRef(exePath, stdin) {
  // execFile + input is broken for native exes on Windows (silently fails).
  // spawnSync works correctly.
  const r = spawnSync(exePath, [], {
    input: stdin,
    encoding: "utf8",
    timeout: MAX_RUN_SEC * 1000,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (r.error) return { ok: false, error: r.error.message };
  if (r.status !== 0) return { ok: false, error: `exit ${r.status}: ${(r.stderr || "").slice(0, 200)}` };
  // Normalize line endings + collapse trailing whitespace to a single \n, so
  // the saved expected_stdout matches the typical "ends with one newline"
  // convention regardless of whether the program emitted \n or not.
  const stdout = (r.stdout || "").replace(/\r\n/g, "\n").replace(/\s+$/g, "") + "\n";
  return { ok: true, stdout };
}

function normalize(s) {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\s+$/g, "");
}

async function processOne(raw) {
  console.log(`\n=== ${raw.code} :: ${raw.title?.slice(0, 60) || ""} ===`);

  // Pre-flight: skip problems that don't have enough content for us to
  // build verifiable tests for. This saves API spend on hopeless inputs.
  if (!raw.bodyText || raw.bodyText.replace(/\s+/g, " ").trim().length < 40) {
    return { code: raw.code, status: "skipped_no_description" };
  }
  if (!raw.pres || raw.pres.length === 0) {
    return { code: raw.code, status: "skipped_no_samples" };
  }

  const exePath = path.join(tmpdir(), `ref_${raw.code}.exe`);

  let resp;
  try {
    resp = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 8000,
      tools: [TOOL_SCHEMA],
      tool_choice: { type: "function", function: { name: "submit_problem" } },
      messages: [{ role: "user", content: buildPrompt(raw) }],
    });
  } catch (e) {
    return { code: raw.code, status: "llm_error", error: e.message };
  }
  const toolCall = resp.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    return { code: raw.code, status: "no_tool_call", raw: resp };
  }
  let data;
  try {
    data = JSON.parse(toolCall.function.arguments);
  } catch (e) {
    return { code: raw.code, status: "json_parse_error", error: e.message, raw: toolCall.function.arguments };
  }
  // DeepSeek sometimes serializes nested array fields as JSON strings.
  // Normalize the ones we know should be arrays.
  for (const field of ["tags", "samples", "extra_test_inputs"]) {
    if (typeof data[field] === "string") {
      try { data[field] = JSON.parse(data[field]); } catch { /* leave as-is */ }
    }
  }

  const c = compile(data.reference_cpp, exePath);
  if (!c.ok) {
    return { code: raw.code, status: "compile_error", error: c.error?.slice(0, 1000), data };
  }

  // Validate against every visible sample
  const sampleResults = [];
  for (const [i, s] of (data.samples || []).entries()) {
    const r = await runRef(exePath, s.input);
    if (!r.ok) { sampleResults.push({ i, ok: false, err: r.error }); break; }
    const expected = normalize(s.output);
    const got = normalize(r.stdout);
    sampleResults.push({ i, ok: got === expected, expected, got });
    if (got !== expected) break;
  }
  const allSamplesPass = sampleResults.length > 0 && sampleResults.every((r) => r.ok);
  if (!allSamplesPass && (data.samples || []).length > 0) {
    try { unlinkSync(exePath); } catch { /* noop */ }
    return { code: raw.code, status: "ref_wrong_on_samples", sampleResults, data };
  }

  // Capture expected outputs for extra inputs
  const extraTests = [];
  for (const stdin of data.extra_test_inputs || []) {
    const r = await runRef(exePath, stdin);
    if (!r.ok) {
      extraTests.push({ stdin, error: r.error });
      continue;
    }
    extraTests.push({ stdin, stdout: r.stdout });
  }
  try { unlinkSync(exePath); } catch { /* noop */ }

  return {
    code: raw.code,
    status: "ok",
    data,
    sampleResults,
    extraTests,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(IN_DIR)).filter((f) => f.endsWith(".json"));
  console.log(`${files.length} scraped problems available.`);

  let processed = 0;
  const stats = {
    ok: 0,
    ref_wrong: 0,
    compile_err: 0,
    llm_err: 0,
    no_desc: 0,
    no_samples: 0,
    already_built: 0,
  };
  for (const file of files) {
    if (processed >= limit) break;
    const code = file.replace(/\.json$/, "");
    if (only && !only.has(code)) continue;
    const outFile = path.join(OUT_DIR, file);
    if (existsSync(outFile)) {
      stats.already_built++;
      continue;
    }
    const raw = JSON.parse(await readFile(path.join(IN_DIR, file), "utf8"));
    const result = await processOne(raw);
    await writeFile(outFile, JSON.stringify(result, null, 2), "utf8");
    if (result.status === "ok") stats.ok++;
    else if (result.status === "ref_wrong_on_samples") stats.ref_wrong++;
    else if (result.status === "compile_error") stats.compile_err++;
    else if (result.status === "skipped_no_description") stats.no_desc++;
    else if (result.status === "skipped_no_samples") stats.no_samples++;
    else stats.llm_err++;
    const suffix =
      result.status === "ok"
        ? `samples ${result.sampleResults.length}/${result.sampleResults.length}, extras ${result.extraTests.length}`
        : "";
    console.log(`  ${result.status}  ${suffix}`);
    processed++;
  }
  console.log("\n=== Summary ===");
  console.log(stats);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

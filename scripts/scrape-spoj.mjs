// Scrape SPOJ /RGB7/ problem set.
//
// Usage: node scripts/scrape-spoj.mjs
//   First run opens a visible Chromium. If Cloudflare shows a challenge,
//   solve it once (one click) — the scraper then reuses the session for
//   every subsequent page.
//
// Output: scripts/data/spoj-rgb7/<problem-code>.json (one file per problem)
//         Re-running skips problems already scraped.

import { chromium } from "playwright";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = "https://www.spoj.com";
const SET = "/RGB7";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(SCRIPT_DIR, "data/spoj-rgb7");
const DELAY_MS = 600; // be nice to SPOJ

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureCloudflarePassed(page, attemptUrl) {
  await page.goto(attemptUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  // Cloudflare interstitials have title "Just a moment..."
  for (let i = 0; i < 60; i++) {
    const title = await page.title();
    if (!/just a moment/i.test(title)) return;
    await sleep(2_000);
  }
  console.warn(
    "\n  ⚠ Still on Cloudflare challenge after 2 min.\n" +
    "  Click the checkbox manually in the visible Chromium window,\n" +
    "  then press ENTER in this terminal to continue.\n",
  );
  await new Promise((r) => process.stdin.once("data", r));
}

async function scrapeProblemList(page) {
  await ensureCloudflarePassed(page, `${ROOT}${SET}/problems/main/`);
  // SPOJ problem list pages are paginated via ?start=offset. We collect all
  // pages until none remain.
  const codes = new Set();
  let start = 0;
  while (true) {
    if (start > 0) {
      await ensureCloudflarePassed(page, `${ROOT}${SET}/problems/main/sort=0,start=${start}`);
    }
    // Each problem row has a link like /RGB7/problems/CODE/
    const found = await page.$$eval(
      `a[href^="${SET}/problems/"]`,
      (els, set) =>
        els
          .map((a) => a.getAttribute("href") || "")
          .filter((h) =>
            new RegExp(`^${set}/problems/[A-Z0-9_]+/?$`, "i").test(h),
          )
          .map((h) => h.replace(/\/$/, "").split("/").pop()),
      SET,
    );
    let added = 0;
    for (const c of found) {
      if (c && c !== "main" && !codes.has(c)) {
        codes.add(c);
        added++;
      }
    }
    console.log(`  page start=${start}: +${added} (total ${codes.size})`);
    if (added === 0) break;
    start += 50;
    await sleep(DELAY_MS);
  }
  return [...codes];
}

async function scrapeProblem(page, code) {
  await ensureCloudflarePassed(page, `${ROOT}${SET}/problems/${code}/`);
  return await page.evaluate(() => {
    const txt = (sel) => document.querySelector(sel)?.textContent?.trim() || "";
    const htmlOf = (sel) => document.querySelector(sel)?.innerHTML?.trim() || "";

    // Title is in the h2/h3 / breadcrumb. Fall back to <title>.
    const title =
      document.querySelector("#problem-name")?.textContent?.trim() ||
      document.querySelector("h1, h2, h3")?.textContent?.trim() ||
      document.title.replace(/^SPOJ\.com\s*-\s*/i, "");

    // SPOJ uses #problem-body for the rendered statement.
    const bodyEl = document.querySelector("#problem-body");
    const bodyHtml = bodyEl?.innerHTML?.trim() || "";
    const bodyText = bodyEl?.textContent?.trim() || "";

    // Sidebar: time / source limit / tags. Layout varies — pull anything
    // matching the expected labels.
    const sideText = document.querySelector("#problem-meta, .prob, body")?.innerText || "";
    const tlMatch = sideText.match(/Time limit:\s*([0-9.]+s)/i);
    const slMatch = sideText.match(/Source limit:\s*([0-9.]+[A-Za-z]*)/i);
    const mlMatch = sideText.match(/Memory limit:\s*([0-9.]+\s*[KMG]?B)/i);

    // Sample I/O lives inside <pre> blocks in the statement.
    const pres = [...(bodyEl?.querySelectorAll("pre") || [])].map((p) =>
      p.textContent.replace(/\r\n/g, "\n").trim(),
    );

    return {
      title,
      bodyHtml,
      bodyText,
      timeLimit: tlMatch?.[1] || null,
      memoryLimit: mlMatch?.[1] || null,
      sourceLimit: slMatch?.[1] || null,
      pres,
      url: location.href,
    };
  });
}

async function alreadyScraped() {
  try {
    const files = await readdir(OUT_DIR);
    return new Set(files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")));
  } catch {
    return new Set();
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const done = await alreadyScraped();
  console.log(`${done.size} problems already scraped — will skip them.`);

  // Use a persistent profile so cookies/history survive between runs — gives
  // Cloudflare a "real user" footprint to look at. Also explicitly disable
  // the AutomationControlled flag so navigator.webdriver isn't true.
  const profileDir = path.resolve(SCRIPT_DIR, ".chrome-profile");
  await mkdir(profileDir, { recursive: true });
  const ctx = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: null,
    locale: "en-US",
    timezoneId: "Asia/Ulaanbaatar",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--start-maximized",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  // Mask navigator.webdriver before any page script runs.
  await ctx.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => undefined });
  });
  const page = ctx.pages()[0] || (await ctx.newPage());

  console.log("Fetching problem index…");
  const codes = await scrapeProblemList(page);
  console.log(`Found ${codes.length} problem codes.`);

  let saved = 0;
  let skipped = 0;
  let failed = 0;
  for (const [i, code] of codes.entries()) {
    if (done.has(code)) {
      skipped++;
      continue;
    }
    try {
      const data = await scrapeProblem(page, code);
      data.code = code;
      data.scrapedAt = new Date().toISOString();
      await writeFile(path.join(OUT_DIR, `${code}.json`), JSON.stringify(data, null, 2), "utf8");
      saved++;
      console.log(`[${i + 1}/${codes.length}] ${code} — ${data.title.slice(0, 60)}`);
    } catch (e) {
      failed++;
      console.error(`[${i + 1}/${codes.length}] ${code} — FAILED: ${e.message}`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\nDone. saved=${saved}, skipped=${skipped}, failed=${failed}`);
  await ctx.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

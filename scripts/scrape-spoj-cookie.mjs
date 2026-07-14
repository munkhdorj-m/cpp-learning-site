// Cookie-based SPOJ scraper. No browser, no Playwright.
// Reads scripts/.spoj-cookies.txt for COOKIE + USER_AGENT, then uses plain
// Node fetch + cheerio to walk /RGB7/problems/main/ and save each problem.
//
// Steps to populate scripts/.spoj-cookies.txt:
//   1. Open https://www.spoj.com/RGB7/problems/main/ in your real Chrome.
//      Solve the Cloudflare challenge if shown.
//   2. F12 → Application → Cookies → https://www.spoj.com. Copy cf_clearance
//      and SPOJ values. Put them on the COOKIE= line as:
//         cf_clearance=...; SPOJ=...
//   3. F12 → Console → run navigator.userAgent. Paste into USER_AGENT=.
//
// Usage:  node scripts/scrape-spoj-cookie.mjs
//         node scripts/scrape-spoj-cookie.mjs --probe         (fetch first page only)

import { load as loadHtml } from "cheerio";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = "https://www.spoj.com";
const SET = "/RGB7";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(SCRIPT_DIR, "data/spoj-rgb7");
const COOKIES_FILE = path.resolve(SCRIPT_DIR, ".spoj-cookies.txt");
const DELAY_MS = 800; // be nice

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const probeOnly = process.argv.includes("--probe");

async function loadCookies() {
  if (!existsSync(COOKIES_FILE)) {
    console.error(`Missing ${COOKIES_FILE}.\nCopy scripts/.spoj-cookies.example.txt → scripts/.spoj-cookies.txt and fill it in.`);
    process.exit(1);
  }
  const text = await readFile(COOKIES_FILE, "utf8");
  const cookie = text.match(/^COOKIE=(.+)$/m)?.[1]?.trim();
  const ua = text.match(/^USER_AGENT=(.+)$/m)?.[1]?.trim();
  if (!cookie || !ua) {
    console.error("scripts/.spoj-cookies.txt is missing COOKIE= or USER_AGENT= line.");
    process.exit(1);
  }
  return { cookie, ua };
}

function makeFetcher({ cookie, ua }) {
  return async function get(url) {
    const res = await fetch(url, {
      headers: {
        cookie,
        "user-agent": ua,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        referer: `${ROOT}${SET}/problems/main/`,
      },
      redirect: "follow",
    });
    const body = await res.text();
    if (/Just a moment|Performing security verification/i.test(body)) {
      throw new Error("Cloudflare challenge — your cf_clearance cookie is stale. Re-export it from your browser.");
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return body;
  };
}

async function listProblems(get) {
  const codes = new Set();
  let start = 0;
  while (true) {
    const url =
      start === 0
        ? `${ROOT}${SET}/problems/main/`
        : `${ROOT}${SET}/problems/main/sort=0,start=${start}`;
    const html = await get(url);
    const $ = loadHtml(html);
    let added = 0;
    $(`a[href^="${SET}/problems/"]`).each((_, el) => {
      const href = ($(el).attr("href") || "").replace(/\/$/, "");
      const code = href.split("/").pop();
      // Only accept SPOJ problem codes (start with uppercase, contain digits)
      if (
        code &&
        /^[A-Z][A-Z0-9_]+$/.test(code) &&
        /\d/.test(code) &&
        !codes.has(code)
      ) {
        codes.add(code);
        added++;
      }
    });
    console.log(`  page start=${start}: +${added} (total ${codes.size})`);
    if (added === 0) break;
    start += 50;
    await sleep(DELAY_MS);
  }
  return [...codes];
}

function extractProblem(html, url) {
  const $ = loadHtml(html);
  // h2 looks like "RGB7002 - Гурвалжин" — strip the code prefix.
  const rawTitle = $("h2").first().text().trim();
  const title = rawTitle.replace(/^[A-Z0-9_]+\s*[-–—]\s*/, "").trim() || rawTitle;

  const bodyEl = $(".prob").first();
  const bodyHtml = bodyEl.html()?.trim() || "";
  const bodyText = bodyEl.text().trim();

  const side = $("#content, body").text();
  const tlMatch = side.match(/(?:Time limit|Хугацааны хязгаар|Хугацаа)\s*[:：]\s*([0-9.]+\s*s)/i);
  const slMatch = side.match(/Source limit\s*[:：]\s*([0-9.]+\s*[A-Za-z]*)/i);
  const mlMatch = side.match(/(?:Memory limit|Санах ой)\s*[:：]\s*([0-9.]+\s*[KMG]?B)/i);

  const pres = [];
  bodyEl.find("pre").each((_, p) => {
    pres.push($(p).text().replace(/\r\n/g, "\n").trim());
  });

  const hidden = $("#h_problem_hidden").text().trim().length > 0;

  return {
    title,
    hidden,
    bodyHtml,
    bodyText,
    timeLimit: tlMatch?.[1]?.trim() || null,
    memoryLimit: mlMatch?.[1]?.trim() || null,
    sourceLimit: slMatch?.[1]?.trim() || null,
    pres,
    url,
  };
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
  const cookies = await loadCookies();
  const get = makeFetcher(cookies);

  if (probeOnly) {
    console.log("Probing first page…");
    const html = await get(`${ROOT}${SET}/problems/main/`);
    console.log(`  fetched ${html.length} bytes`);
    const $ = loadHtml(html);
    const links = $(`a[href^="${SET}/problems/"]`)
      .map((_, el) => $(el).attr("href"))
      .get();
    console.log(`  ${links.length} problem links found`);
    console.log(`  first 5:`, links.slice(0, 5));
    return;
  }

  const done = await alreadyScraped();
  console.log(`${done.size} problems already scraped — will skip them.`);

  console.log("Fetching problem index…");
  const codes = await listProblems(get);
  console.log(`Found ${codes.length} problem codes.`);

  let saved = 0, skipped = 0, failed = 0;
  for (const [i, code] of codes.entries()) {
    if (done.has(code)) {
      skipped++;
      continue;
    }
    try {
      const html = await get(`${ROOT}${SET}/problems/${code}/`);
      const data = extractProblem(html, `${ROOT}${SET}/problems/${code}/`);
      data.code = code;
      data.scrapedAt = new Date().toISOString();
      await writeFile(path.join(OUT_DIR, `${code}.json`), JSON.stringify(data, null, 2), "utf8");
      saved++;
      console.log(`[${i + 1}/${codes.length}] ${code} — ${data.title.slice(0, 60)}`);
    } catch (e) {
      failed++;
      console.error(`[${i + 1}/${codes.length}] ${code} — FAILED: ${e.message}`);
      if (/cf_clearance.*stale/.test(e.message)) {
        console.error("Stopping — refresh your cookie and rerun.");
        break;
      }
    }
    await sleep(DELAY_MS);
  }
  console.log(`\nDone. saved=${saved}, skipped=${skipped}, failed=${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

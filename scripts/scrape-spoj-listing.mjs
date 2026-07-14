// Scrape SPOJ /RGB7/problems/main/ listing pages to extract per-problem
// acceptance %, user count, and ordering. Saves to data/spoj-listing.json.
//
// Usage:  node scripts/scrape-spoj-listing.mjs

import { load as loadHtml } from "cheerio";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = "https://www.spoj.com";
const SET = "/RGB7";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(SCRIPT_DIR, "data/spoj-listing.json");
const COOKIES_FILE = path.resolve(SCRIPT_DIR, ".spoj-cookies.txt");
const DELAY_MS = 800;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadCookies() {
  if (!existsSync(COOKIES_FILE)) {
    console.error(`Missing ${COOKIES_FILE}`);
    process.exit(1);
  }
  const text = await readFile(COOKIES_FILE, "utf8");
  return {
    cookie: text.match(/^COOKIE=(.+)$/m)?.[1]?.trim(),
    ua: text.match(/^USER_AGENT=(.+)$/m)?.[1]?.trim(),
  };
}

async function get(url, { cookie, ua }) {
  const res = await fetch(url, {
    headers: {
      cookie,
      "user-agent": ua,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
      "accept-language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });
  const body = await res.text();
  if (/Just a moment|Performing security verification/i.test(body)) {
    throw new Error("Cloudflare challenge — refresh cookie");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return body;
}

function parsePage(html, position0) {
  const $ = loadHtml(html);
  const rows = [];
  // The listing table has a row per problem. Look for any <tr> that contains
  // a link to /RGB7/problems/CODE/ — that's a real row, not a header.
  $("tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length < 4) return;
    const link = $(tr).find(`a[href^="${SET}/problems/"]`).first();
    const code = (link.attr("href") || "").replace(/\/$/, "").split("/").pop();
    if (!code || !/^[A-Z][A-Z0-9_]+$/.test(code) || !/\d/.test(code)) return;
    // Find the acceptance % cell — last column that ends with a digit + maybe a decimal
    let pct = null;
    let users = null;
    tds.each((_, td) => {
      const t = $(td).text().trim();
      if (/^\d+\.\d+$/.test(t)) pct = parseFloat(t);
      else if (/^\d+$/.test(t)) {
        const n = parseInt(t, 10);
        if (n > 50 && (users == null || n > users)) users = n;
      }
    });
    rows.push({
      code,
      name: link.text().trim(),
      users,
      accepted_pct: pct,
      position: position0 + rows.length,
    });
  });
  return rows;
}

async function main() {
  await mkdir(path.dirname(OUT), { recursive: true });
  const cookies = await loadCookies();
  const seen = new Set();
  const all = [];
  let start = 0;
  // SPOJ keeps serving the last page's rows when start exceeds the total,
  // so we have to detect "no new codes" instead of "no rows".
  while (true) {
    const url =
      start === 0
        ? `${ROOT}${SET}/problems/main/`
        : `${ROOT}${SET}/problems/main/sort=0,start=${start}`;
    console.log(`fetching start=${start}…`);
    const html = await get(url, cookies);
    const rows = parsePage(html, all.length);
    let added = 0;
    for (const r of rows) {
      if (!seen.has(r.code)) {
        seen.add(r.code);
        all.push(r);
        added++;
      }
    }
    console.log(`  +${added} new (total ${all.length})`);
    if (added === 0) {
      console.log("  → no new rows; done");
      break;
    }
    start += 50;
    await sleep(DELAY_MS);
  }
  const list = all;
  await writeFile(OUT, JSON.stringify(list, null, 2), "utf8");

  // Summary
  const buckets = { vEasy: 0, easy: 0, medium: 0, hard: 0, vHard: 0, noPct: 0 };
  for (const r of list) {
    if (r.accepted_pct == null) buckets.noPct++;
    else if (r.accepted_pct >= 75) buckets.vEasy++;
    else if (r.accepted_pct >= 60) buckets.easy++;
    else if (r.accepted_pct >= 45) buckets.medium++;
    else if (r.accepted_pct >= 30) buckets.hard++;
    else buckets.vHard++;
  }
  console.log(`\nSaved ${list.length} problems to ${OUT}`);
  console.log("Acceptance buckets:", buckets);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

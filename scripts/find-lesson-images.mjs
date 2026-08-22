// Finds a photograph for each lesson and Cambridge topic.
//
// Searches Openverse, which indexes Flickr, Wikimedia, museums and other
// libraries and returns only openly licensed results — so the pictures can sit
// on a school site without a licensing problem, and each one carries the
// credit it needs.
//
// This step only SEARCHES and writes a manifest. Downloading is a separate
// script, so the picks can be reviewed first.

import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] ?? "image-manifest.json";

// id → what to search for. The id is what a lesson or topic refers to.
const SUBJECTS = [
  // ── Learn: C++ course ────────────────────────────────────────────────
  ["hello-world", "computer screen programming code"],
  ["printing", "computer monitor text display"],
  ["comments", "sticky notes reminder"],
  ["variables", "labelled storage boxes"],
  ["types", "glass jars different sizes"],
  ["input", "computer keyboard typing"],
  ["math", "calculator numbers"],
  ["operators", "mathematics symbols blackboard"],
  ["type-conversion", "measuring jug kitchen scales"],
  ["if-else", "fork in the road path"],
  ["conditions", "traffic lights"],
  ["switch", "row of light switches"],
  ["for-loop", "running track lanes"],
  ["while-loop", "conveyor belt factory"],
  ["loop-control", "stop sign road"],
  ["putting-it-together", "jigsaw puzzle pieces"],
  ["strings", "letter tiles alphabet"],
  ["getline", "typewriter paper"],
  ["string-tools", "scissors cutting paper"],
  ["arrays", "post office boxes numbered"],
  ["array-loops", "row of lockers"],
  ["nested-loops", "chessboard squares"],
  ["functions", "factory machine gears"],
  ["function-details", "mechanical gears"],
  ["structs", "filing cabinet index cards"],
  ["vectors", "stack of cardboard boxes warehouse"],

  // ── Cambridge: devices students must recognise ───────────────────────
  ["dev-keyboard", "computer keyboard"],
  ["dev-barcode", "barcode scanner shop"],
  ["dev-printer", "laser printer office"],
  ["dev-3d-printer", "3d printer printing"],
  ["dev-hdd", "hard disk drive open platter"],
  ["dev-ssd", "solid state drive ssd"],
  ["dev-usb", "usb flash drive"],
  ["dev-optical", "dvd disc"],
  ["dev-cpu", "cpu processor chip"],
  ["dev-ram", "ram memory module"],
  ["dev-motherboard", "computer motherboard"],
  ["dev-router", "network router"],
  ["dev-switch", "network switch ports"],
  ["dev-ethernet", "ethernet cable rj45"],
  ["dev-fibre", "fibre optic cable light"],
  ["dev-robot", "industrial robot arm factory"],
  ["dev-sensor", "temperature sensor greenhouse"],
  ["dev-server", "server room data centre"],
  ["dev-security", "padlock security computer"],
];

const OK_LICENCES = ["cc0", "pdm", "by", "by-sa"];

async function search(query) {
  const url =
    "https://api.openverse.org/v1/images/?" +
    new URLSearchParams({
      q: query,
      license: OK_LICENCES.join(","),
      category: "photograph",
      size: "medium,large",
      mature: "false",
      page_size: "12",
    });

  const res = await fetch(url, {
    headers: { "User-Agent": "cs.ub.mn school course builder" },
  });
  if (res.status === 429) return { rateLimited: true, results: [] };
  if (!res.ok) return { error: `HTTP ${res.status}`, results: [] };
  return res.json();
}

/** Prefer a wide-ish, decent-sized picture — these sit above lesson text. */
function score(r) {
  if (!r.url || !r.width || !r.height) return -1;
  const ratio = r.width / r.height;
  if (ratio < 0.9 || ratio > 2.4) return -1;
  if (r.width < 600) return -1;
  let s = 0;
  if (ratio >= 1.2 && ratio <= 1.9) s += 3; // comfortable banner shape
  if (r.width >= 1000) s += 2;
  if (["cc0", "pdm"].includes(r.license)) s += 2; // no attribution burden
  if (r.license === "by") s += 1;
  return s;
}

const manifest = [];
const problems = [];

for (const [id, query] of SUBJECTS) {
  const data = await search(query);
  if (data.rateLimited) {
    problems.push(`${id}: rate limited`);
    await new Promise((r) => setTimeout(r, 5000));
    continue;
  }
  const ranked = (data.results ?? [])
    .map((r) => ({ r, s: score(r) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s);

  if (ranked.length === 0) {
    problems.push(`${id}: nothing usable for "${query}"`);
    continue;
  }

  const best = ranked[0].r;
  manifest.push({
    id,
    query,
    src: best.url,
    width: best.width,
    height: best.height,
    title: best.title ?? "",
    creator: best.creator ?? "",
    license: `${(best.license ?? "").toUpperCase()} ${best.license_version ?? ""}`.trim(),
    source: best.foreign_landing_url ?? best.url,
    alternatives: ranked.length,
  });
  process.stdout.write(".");
  await new Promise((r) => setTimeout(r, 350)); // be polite to the API
}

fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log(`\n\nfound ${manifest.length}/${SUBJECTS.length}`);
for (const p of problems) console.log("  ! " + p);
console.log(`\nmanifest → ${OUT}`);

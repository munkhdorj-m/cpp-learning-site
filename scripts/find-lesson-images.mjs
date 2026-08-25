// Search Wikimedia Commons for a picture to illustrate each lesson, and write
// the manifest that fetch-lesson-images.mjs downloads.
//
//   node scripts/find-lesson-images.mjs > scripts/data/image-manifest.json
//   node scripts/fetch-lesson-images.mjs scripts/data/image-manifest.json
//
// Only openly licensed results are accepted, and the licence and author come
// back from the API rather than being typed in, so an image cannot end up on
// the site with the wrong credit.
//
// The search terms are deliberately CONCRETE objects, not abstract concepts:
// a photograph of a real thing a 13-year-old recognises does the teaching. A
// picture captioned "recursion" is decoration; a set of nesting dolls is an
// explanation.

const QUERIES = {
  // Unit 7 — foundations
  recursion: "matryoshka nesting dolls",
  complexity: "queue of people waiting line",
  grids: "chessboard empty board",
  "arrays-in-functions": "conveyor belt boxes factory",
  "fast-io": "water flowing pipe tap",

  // Unit 8 — searching and sorting
  "linear-search": "library bookshelf row books",
  "sorting-tools": "sorted books by colour shelf",
  "binary-search": "dictionary open page thumb index",
  "binary-search-answer": "measuring cup kitchen scale",
  "prefix-sums": "cash register receipt running total",

  // Unit 9 — containers
  "stl-map-set": "post office pigeon holes labelled",
  "stack-queue": "stack of plates restaurant",
  "priority-queue": "hospital triage waiting room",
  "two-pointers": "two hands measuring tape",

  // Unit 10 — techniques
  greedy: "coins mongolian tugrik money",
  backtracking: "hedge maze from above",
  "dp-intro": "sticky notes reminder wall",
  "dp-1d": "staircase steps climbing",
  "dp-grid": "city street grid from above",

  // Unit 11 — graphs
  "graphs-intro": "subway metro map diagram",
  dfs: "cave passage exploring",
  bfs: "water ripples circles pond",
  dijkstra: "road signs distance kilometres",

  // Unit 12 — objects
  classes: "cookie cutter dough shapes",
  "class-methods": "vending machine buttons",
  "operator-overload": "balance scales weighing",
};

const OK_LICENCE =
  /^(CC0|Public domain|PDM|CC BY [0-9.]+|CC BY-SA [0-9.]+|CC-BY|CC-BY-SA)/i;

const UA = "cs.ub.mn-school-course-builder/1.0 (https://cs.ub.mn; school course material)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const manifest = [];
const missing = [];

for (const [id, query] of Object.entries(QUERIES)) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    "&generator=search&gsrnamespace=6&gsrlimit=12" +
    `&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}` +
    "&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400";

  let picked = null;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const json = await res.json();
    const pages = Object.values(json.query?.pages ?? {});
    // Commons orders by relevance; take the first acceptably licensed hit.
    for (const p of pages) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      const em = ii.extmetadata ?? {};
      const licence = strip(em.LicenseShortName?.value);
      if (!OK_LICENCE.test(licence)) continue;
      if (!/\.(jpe?g|png)$/i.test(p.title)) continue;
      picked = {
        id,
        src: ii.thumburl ?? ii.url,
        title: p.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, ""),
        creator: strip(em.Artist?.value) || "unknown",
        license: licence,
        source: ii.descriptionurl ?? "",
      };
      break;
    }
  } catch (e) {
    missing.push(`${id}: ${e.message}`);
    continue;
  }

  if (picked) manifest.push(picked);
  else missing.push(`${id}: nothing openly licensed for "${query}"`);
  await sleep(300);
}

console.log(JSON.stringify(manifest, null, 2));
console.error(`\nfound ${manifest.length}/${Object.keys(QUERIES).length}`);
for (const m of missing) console.error("  ! " + m);

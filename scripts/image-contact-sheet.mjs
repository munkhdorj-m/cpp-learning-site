// Builds a numbered contact sheet from a list of image files or URLs, so a
// whole batch of candidate pictures can be judged in one look instead of
// opening them one at a time.
//
//   node scripts/image-contact-sheet.mjs out.jpg cols file1 file2 …
//   node scripts/image-contact-sheet.mjs out.jpg cols --urls a.jpg b.jpg …

import fs from "node:fs";
import sharp from "sharp";

const [out, colsRaw, ...rest] = process.argv.slice(2);
const cols = Number(colsRaw);
const fromUrls = rest[0] === "--urls";
const inputs = fromUrls ? rest.slice(1) : rest;

const CELL = 300;
const LABEL = 26;
const rows = Math.ceil(inputs.length / cols);

// Wikimedia throttles bursts, so fetch politely and retry once on failure.
const UA =
  "cs.ub.mn-school-course-builder/1.0 (https://cs.ub.mn; school course material)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function load(src) {
  if (!fromUrls) return fs.readFileSync(src);

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(src, { headers: { "User-Agent": UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (attempt === 0) await sleep(1500);
    else throw new Error(`HTTP ${res.status}`);
  }
  throw new Error("unreachable");
}

const tiles = [];
let failures = 0;
for (let i = 0; i < inputs.length; i++) {
  if (fromUrls && i > 0) await sleep(250);
  let body;
  try {
    body = await sharp(await load(inputs[i]))
      .resize(CELL, CELL - LABEL, { fit: "cover" })
      .toBuffer();
  } catch {
    failures++;
    body = await sharp({
      create: {
        width: CELL,
        height: CELL - LABEL,
        channels: 3,
        background: { r: 60, g: 20, b: 20 },
      },
    })
      .jpeg()
      .toBuffer();
  }

  // A numbered strip above each picture, so a choice can be named.
  const label = Buffer.from(
    `<svg width="${CELL}" height="${LABEL}">
       <rect width="100%" height="100%" fill="#111"/>
       <text x="6" y="18" font-family="sans-serif" font-size="15" fill="#fff">${i + 1}</text>
     </svg>`,
  );

  tiles.push(
    await sharp({
      create: { width: CELL, height: CELL, channels: 3, background: "#111" },
    })
      .composite([
        { input: label, top: 0, left: 0 },
        { input: body, top: LABEL, left: 0 },
      ])
      .jpeg()
      .toBuffer(),
  );
}

await sharp({
  create: {
    width: cols * CELL,
    height: rows * CELL,
    channels: 3,
    background: "#111",
  },
})
  .composite(
    tiles.map((input, i) => ({
      input,
      top: Math.floor(i / cols) * CELL,
      left: (i % cols) * CELL,
    })),
  )
  .jpeg({ quality: 78 })
  .toFile(out);

console.log(
  `${inputs.length} tiles → ${out}${failures ? `  (${failures} could not be loaded)` : ""}`,
);

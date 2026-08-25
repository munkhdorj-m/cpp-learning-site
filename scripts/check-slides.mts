// Integrity check for lib/lesson-slides.ts.
//
// A deck is data the renderer trusts: it lays a grid out from `w * h` and
// draws an edge between two node ids without checking they exist. Getting
// that wrong produces a silently broken diagram rather than an error, so
// everything the renderer assumes is asserted here instead.
//
//   node_modules/.bin/jiti scripts/check-slides.mts
import { LESSON_SLIDES } from "../lib/lesson-slides.ts";
import type { Scene } from "../lib/lesson-slides.ts";
import { LESSONS } from "../lib/lessons.ts";
import { LESSON_SECTIONS } from "../lib/lesson-sections.ts";
import { LESSON_IMAGES } from "../lib/lesson-images.ts";
import { NODE_R, graphLayout } from "../lib/lesson-slides.ts";

/**
 * Two nodes clash when their CENTRES land closer than a diameter apart on the
 * page. The raw coordinates do not tell you that: the renderer fits them to
 * their bounding box in a frame far wider than it is tall, so the same gap is
 * generous horizontally and tight vertically. graphLayout is shared with the
 * renderer so this measures what actually gets drawn.
 */
const MIN_GAP = 2 * NODE_R + 8;

const problems: string[] = [];
const slugs = new Set(LESSONS.map((l) => l.slug));

/** Longest label the renderer can show before it shrinks it to a smear. */
const MAX_CELL_LABEL = 14;
const MAX_WIDE_LABEL = 24;

/** Prose in a label breaks the one-deck-serves-both-languages rule. */
const CYRILLIC = /[Ѐ-ӿ]/;

function checkScene(where: string, s: Scene, depth = 0) {
  if (depth > 2) {
    problems.push(`${where}: scenes nested too deep`);
    return;
  }

  const labels: { text: string; max: number; what: string }[] = [];

  switch (s.kind) {
    case "stack":
      if (!s.frames.length) problems.push(`${where}: stack with no frames`);
      if (s.frames.length > 9)
        problems.push(`${where}: ${s.frames.length} stack frames is too many`);
      s.frames.forEach((f, i) =>
        labels.push({
          text: f.label ?? "",
          max: MAX_WIDE_LABEL,
          what: `frame ${i}`,
        }),
      );
      break;

    case "rows":
      if (!s.rows.length) problems.push(`${where}: rows with no rows`);
      s.rows.forEach((r, ri) => {
        if (!r.cells.length) problems.push(`${where}: row ${ri} has no cells`);
        if (r.cells.length > 12)
          problems.push(`${where}: row ${ri} has ${r.cells.length} cells (max 12)`);
        r.cells.forEach((c, ci) =>
          labels.push({
            text: c.label ?? "",
            max: MAX_CELL_LABEL,
            what: `row ${ri} cell ${ci}`,
          }),
        );
        (r.pointers ?? []).forEach((p) => {
          if (p.at < 0 || p.at >= r.cells.length)
            problems.push(
              `${where}: pointer "${p.label}" points at ${p.at}, row ${ri} has ${r.cells.length} cells`,
            );
        });
      });
      break;

    case "grid":
      if (s.cells.length !== s.w * s.h)
        problems.push(
          `${where}: grid is ${s.w}x${s.h} = ${s.w * s.h} but has ${s.cells.length} cells`,
        );
      if (s.w > 10 || s.h > 10)
        problems.push(`${where}: grid ${s.w}x${s.h} is too big to read`);
      s.cells.forEach((c, i) =>
        labels.push({ text: c.label ?? "", max: 5, what: `cell ${i}` }),
      );
      break;

    case "graph": {
      const ids = new Set(s.nodes.map((n) => n.id));
      if (ids.size !== s.nodes.length)
        problems.push(`${where}: two graph nodes share an id`);
      for (const e of s.edges) {
        if (!ids.has(e.a)) problems.push(`${where}: edge from unknown node "${e.a}"`);
        if (!ids.has(e.b)) problems.push(`${where}: edge to unknown node "${e.b}"`);
      }
      for (const n of s.nodes) {
        if (n.x < 0 || n.x > 100 || n.y < 0 || n.y > 100)
          problems.push(`${where}: node ${n.id} at (${n.x}, ${n.y}) is outside 0-100`);
        labels.push({ text: n.label, max: 4, what: `node ${n.id}` });
      }
      // Overlapping circles are the one layout failure the renderer cannot
      // save us from, since positions are the author's to choose.
      const layout = graphLayout(s.nodes);
      for (let i = 0; i < s.nodes.length; i++) {
        for (let j = i + 1; j < s.nodes.length; j++) {
          const a = s.nodes[i];
          const b = s.nodes[j];
          const pa = layout.at(a);
          const pb = layout.at(b);
          const d = Math.hypot(pa.cx - pb.cx, pa.cy - pb.cy);
          if (d < MIN_GAP)
            problems.push(
              `${where}: nodes ${a.id} and ${b.id} land ${d.toFixed(0)}px apart on the page (need ${MIN_GAP}) — they will overlap`,
            );
        }
      }
      break;
    }

    case "flow":
      if (!s.steps.length) problems.push(`${where}: flow with no steps`);
      if (!s.horizontal && s.steps.length > 6)
        problems.push(`${where}: ${s.steps.length} stacked flow steps is too tall`);
      s.steps.forEach((c, i) =>
        labels.push({
          text: c.label ?? "",
          max: MAX_WIDE_LABEL,
          what: `step ${i}`,
        }),
      );
      break;

    case "bars":
      s.bars.forEach((b, i) => {
        if (b.value < 0 || b.value > 100)
          problems.push(`${where}: bar ${i} value ${b.value} is outside 0-100`);
        labels.push({ text: b.label, max: 12, what: `bar ${i}` });
      });
      break;

    case "pairs":
      s.pairs.forEach((p, i) => {
        labels.push({ text: p.key, max: 16, what: `pair ${i} key` });
        labels.push({ text: p.value, max: 16, what: `pair ${i} value` });
      });
      break;

    case "split":
      checkScene(`${where} left`, s.left, depth + 1);
      checkScene(`${where} right`, s.right, depth + 1);
      return;
  }

  for (const l of labels) {
    if (l.text.length > l.max)
      problems.push(
        `${where}: ${l.what} label "${l.text}" is ${l.text.length} chars (max ${l.max})`,
      );
    if (CYRILLIC.test(l.text))
      problems.push(
        `${where}: ${l.what} label "${l.text}" has Mongolian in it — labels must be language-neutral`,
      );
  }
}

let slideCount = 0;
for (const [slug, deck] of Object.entries(LESSON_SLIDES)) {
  if (!slugs.has(slug)) problems.push(`${slug}: no lesson has this slug`);
  if (!deck.title_mn || !deck.title_en)
    problems.push(`${slug}: deck is missing a title`);
  if (deck.slides.length < 4)
    problems.push(`${slug}: ${deck.slides.length} slides is not a walkthrough`);
  if (deck.slides.length > 12)
    problems.push(`${slug}: ${deck.slides.length} slides is too many to follow`);

  deck.slides.forEach((sl, i) => {
    slideCount++;
    const where = `${slug} slide ${i + 1}`;
    if (!sl.title_mn || !sl.title_en) problems.push(`${where}: missing a title`);
    if (sl.title_mn === sl.title_en)
      problems.push(`${where}: mn and en titles are identical`);
    if (sl.title_mn && !CYRILLIC.test(sl.title_mn))
      problems.push(`${where}: title_mn has no Mongolian in it`);
    checkScene(where, sl.scene);
  });
}

// Every deck has to be reachable, and every slides block has to resolve.
const referenced = new Set<string>();
for (const [slug, sections] of Object.entries(LESSON_SECTIONS)) {
  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.kind !== "slides") continue;
      referenced.add(b.deck);
      if (!LESSON_SLIDES[b.deck])
        problems.push(`${slug}/${s.id}: names deck "${b.deck}", which does not exist`);
    }
  }
}
for (const slug of Object.keys(LESSON_SLIDES))
  if (!referenced.has(slug))
    problems.push(`${slug}: deck exists but no section shows it`);

// A lesson gets a metaphor photograph OR a deck, never both: the deck already
// shows the idea, and the photo above it only pushes the lesson down the page.
// Re-running scripts/fetch-lesson-images.mjs with an old manifest would put
// them back silently, which is what this catches.
for (const slug of Object.keys(LESSON_SLIDES))
  if (LESSON_IMAGES[slug])
    problems.push(`${slug}: has a deck AND a hero photo — drop the photo`);

console.log(`decks: ${Object.keys(LESSON_SLIDES).length}`);
console.log(`slides: ${slideCount}`);

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("\nno problems");

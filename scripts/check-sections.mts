// Integrity check for lib/lesson-sections.ts against lib/lessons.ts.
//
// Catches the failure modes that do not show up in tsc: a key that matches no
// lesson slug, a duplicated section id, and — the one that bit us before — a
// section every one of whose blocks is tagged for the other language, which
// renders as a heading with nothing under it.
//
//   node_modules/.bin/jiti scripts/check-sections.mts
import { LESSONS } from "../lib/lessons.ts";
import { LESSON_SECTIONS } from "../lib/lesson-sections.ts";
import { PYTHON_VARIANTS } from "../lib/lessons-python.ts";

const slugs = new Set(LESSONS.map((l) => l.slug));
const problems: string[] = [];

let sectionCount = 0;
for (const [slug, sections] of Object.entries(LESSON_SECTIONS)) {
  if (!slugs.has(slug)) problems.push(`${slug}: no lesson has this slug`);
  const hasPy = !!PYTHON_VARIANTS[slug];

  const ids = new Set<string>();
  for (const s of sections) {
    sectionCount++;
    if (ids.has(s.id)) problems.push(`${slug}/${s.id}: duplicate section id`);
    ids.add(s.id);

    if (!s.title_mn || !s.title_en)
      problems.push(`${slug}/${s.id}: missing a title`);
    if (!s.blocks.length) problems.push(`${slug}/${s.id}: no blocks`);

    // The same filter LessonBlocks applies when rendering.
    const forCpp = s.blocks.filter((b) => b.only !== "py");
    const forPy = s.blocks.filter((b) => b.only !== "cpp");
    if (!forCpp.length)
      problems.push(`${slug}/${s.id}: empty for a C++ reader`);
    if (!s.cppOnly && hasPy && !forPy.length)
      problems.push(`${slug}/${s.id}: empty for a Python reader`);

    for (const b of s.blocks) {
      switch (b.kind) {
        case "text":
        case "note":
          if (!b.mn || !b.en)
            problems.push(`${slug}/${s.id}: ${b.kind} missing mn or en`);
          break;
        case "list":
          if (b.mn.length !== b.en.length)
            problems.push(
              `${slug}/${s.id}: list has ${b.mn.length} mn vs ${b.en.length} en`,
            );
          break;
        case "table":
          if (b.head_mn.length !== b.head_en.length)
            problems.push(`${slug}/${s.id}: table head mn/en lengths differ`);
          for (const r of b.rows)
            if (r.length !== b.head_mn.length)
              problems.push(
                `${slug}/${s.id}: row "${r[0]}" has ${r.length} cells, head has ${b.head_mn.length}`,
              );
          break;
        case "code":
          if (!b.cpp) problems.push(`${slug}/${s.id}: code block without cpp`);
          break;
      }
    }
  }
}

// The array's order IS the curriculum's order: the index page numbers each
// lesson by its position, and next/previous walks the array. Units 7-12 were
// once spliced in ahead of units 5-6, which numbered unit 5 from 43 and sent a
// student finishing unit 4 straight to recursion.
let previousUnit = 0;
LESSONS.forEach((l, i) => {
  if (l.unit < previousUnit)
    problems.push(
      `lesson ${i + 1} (${l.slug}) is in unit ${l.unit}, after unit ${previousUnit} — LESSONS is out of curriculum order`,
    );
  previousUnit = l.unit;
});

const missing = LESSONS.filter((l) => !LESSON_SECTIONS[l.slug]).map(
  (l) => l.slug,
);

console.log(`lessons: ${LESSONS.length}`);
console.log(`lessons with sections: ${Object.keys(LESSON_SECTIONS).length}`);
console.log(`sections: ${sectionCount}`);
console.log(
  `lessons without sections: ${missing.length}` +
    (missing.length ? ` — ${missing.join(", ")}` : ""),
);

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("\nno problems");

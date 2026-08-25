import { LESSONS } from "../lib/lessons.ts";
const want = process.argv.slice(2);
for (const l of LESSONS) {
  if (!want.includes(l.slug)) continue;
  console.log("=".repeat(60));
  console.log(l.slug, "|", l.title_en);
  console.log("--- code ---");
  console.log(l.code);
  console.log("--- output ---");
  console.log(JSON.stringify(l.output));
}

// How this school is organised. Cambridge International curriculum:
//
//   grades 7-8    lower secondary, split into sections (7A, 7B, …)
//   grades 9-10   IGCSE          — one cohort per grade, no sections
//   grade  11     AS Level       — one cohort
//   grade  12     A Level        — one cohort
//
// Grade stays the number we store, because the graduation year (and so the
// username prefix) is worked out from it. The stage is what people actually
// call the class.

export interface Stage {
  id: "lower" | "igcse" | "as" | "a";
  label: string;
  /** Lower secondary is streamed into A/B/C/D; the senior years are not. */
  hasSections: boolean;
}

export const SECTIONS = ["A", "B", "C", "D"] as const;

export function stageFor(grade: number): Stage {
  if (grade <= 8) return { id: "lower", label: "Lower Secondary", hasSections: true };
  if (grade <= 10) return { id: "igcse", label: "IGCSE", hasSections: false };
  if (grade === 11) return { id: "as", label: "AS Level", hasSections: false };
  return { id: "a", label: "A Level", hasSections: false };
}

/** "8" -> "8 — Lower Secondary", "11" -> "11 — AS Level". */
export function gradeOptionLabel(grade: number): string {
  return `${grade} — ${stageFor(grade).label}`;
}

/**
 * The name a class would normally be given:
 *   grade 8 + section B -> "8B"
 *   grade 9             -> "IGCSE 9"
 *   grade 11            -> "AS Level"
 * Teachers can still type whatever they want over the top.
 */
export function suggestedClassName(grade: number, section?: string): string {
  const stage = stageFor(grade);
  if (stage.hasSections) return `${grade}${section ?? "A"}`;
  if (stage.id === "igcse") return `IGCSE ${grade}`;
  return stage.label;
}

/** Grades the school actually teaches computer science to. */
export const TAUGHT_GRADES = [7, 8, 9, 10, 11, 12];

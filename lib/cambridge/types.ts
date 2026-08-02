// Shared shape for the Cambridge study notes.
//
// Topics live in one file per level (igcse.ts, as.ts, a-level.ts) because the
// full syllabus is long, and keeping each level separate makes it possible to
// work on one without scrolling past the others.

export type LevelId = "igcse" | "as" | "a-level";

export interface Level {
  id: LevelId;
  code: string;
  title: string;
  grade: string;
  blurb: string;
  papers: string[];
}

export interface Topic {
  slug: string;
  level: LevelId;
  /** The unit heading it sits under, matching the syllabus contents page. */
  unit: string;
  title: string;
  /** Syllabus reference, e.g. "1.1.2". */
  ref: string;
  /** One line saying what this topic is really about, in plain words. */
  summary: string;
  /** What you must be able to DO — phrased as the syllabus phrases it. */
  objectives: string[];
  /** Vocabulary that appears in mark schemes. */
  terms?: { term: string; def: string }[];
  /** Worked explanation of the parts that are easy to get wrong. */
  notes?: { heading: string; body: string; code?: string }[];
  /** Exam-technique warnings. */
  examTips?: string[];
}

export const LEVELS: Level[] = [
  {
    id: "igcse",
    code: "0478 / 0984",
    title: "IGCSE",
    grade: "Grades 9–10",
    blurb:
      "Computer systems, plus algorithms, programming and logic. Two written papers — there is no coursework.",
    papers: [
      "Paper 1 — Computer Systems",
      "Paper 2 — Algorithms, Programming and Logic",
    ],
  },
  {
    id: "as",
    code: "9618 (AS)",
    title: "AS Level",
    grade: "Grade 11",
    blurb:
      "The first half of A Level: deeper theory, procedural programming, databases and software development.",
    papers: [
      "Paper 1 — Theory Fundamentals",
      "Paper 2 — Fundamental Problem-solving and Programming Skills",
    ],
  },
  {
    id: "a-level",
    code: "9618 (A Level)",
    title: "A Level",
    grade: "Grade 12",
    blurb:
      "Builds on AS: advanced theory, data structures, computational thinking and object-oriented programming.",
    papers: ["Paper 3 — Advanced Theory", "Paper 4 — Practical"],
  },
];

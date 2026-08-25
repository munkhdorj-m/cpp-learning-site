// What the editor offers while a student types.
//
// Monaco on its own only suggests words already present in the file, so
// `cout` was not offered until the student had typed `cout` once — useless
// exactly when a beginner needs it. Real IntelliSense would mean clangd over
// LSP, which is tens of megabytes of WASM and a language server this hosting
// cannot run.
//
// A hand-written provider is not a poor substitute here, it is the better
// tool: the list is short enough to read, contains only what a grade 7-8
// course actually uses, and every entry explains itself IN MONGOLIAN. A
// language server cannot do that last part.
//
// Anything worth explaining is also registered as a hover, so pointing at a
// word a classmate wrote answers the question too.

import type { LanguageId } from "@/lib/languages";

export interface CompletionSpec {
  /** What the student types to find it. */
  label: string;
  /** Snippet text. `${1:x}` are tab stops, `$0` is where the cursor lands. */
  insert: string;
  /** Roughly: keyword / function / snippet. Maps to a Monaco icon. */
  kind: "keyword" | "function" | "snippet" | "variable";
  /** One line, shown greyed next to the label. */
  detail: { mn: string; en: string };
  /** The longer explanation, shown in the side panel and on hover. */
  doc?: { mn: string; en: string };
}

const CPP: CompletionSpec[] = [
  {
    label: "cout",
    insert: "cout << $0",
    kind: "function",
    detail: { mn: "Дэлгэц рүү хэвлэх", en: "Print to the screen" },
    doc: {
      mn: "cout << x; гэвэл x-ийг дэлгэц дээр гаргана. Хэд хэдэн зүйлийг << -ээр залгаж болно.",
      en: "cout << x; prints x. Chain several values with <<.",
    },
  },
  {
    label: "cin",
    insert: "cin >> $0",
    kind: "function",
    detail: { mn: "Оролтоос унших", en: "Read from input" },
    doc: {
      mn: "cin >> a; дараагийн тоог уншина. Зай эсвэл мөр аль нь ч байсан ялгаагүй.",
      en: "cin >> a; reads the next number. Spaces or newlines both work.",
    },
  },
  {
    label: "endl",
    insert: "endl",
    kind: "variable",
    detail: { mn: "Мөр таслах", en: "End the line" },
  },
  {
    label: "include",
    insert: "#include <iostream>\nusing namespace std;\n$0",
    kind: "snippet",
    detail: { mn: "Эхлэлийн мөрүүд", en: "Standard opening lines" },
  },
  {
    // Kept, and kept working: most competitive-programming material a
    // student finds online opens with this, and it compiles on both
    // judges. It is simply no longer what they are handed by default.
    label: "include-all",
    insert: "#include <bits/stdc++.h>\nusing namespace std;\n$0",
    kind: "snippet",
    detail: {
      mn: "Бүх санг оруулах (GCC)",
      en: "Include everything (GCC only)",
    },
  },
  {
    label: "main",
    insert: "int main() {\n    $0\n    return 0;\n}",
    kind: "snippet",
    detail: { mn: "Үндсэн функц", en: "The main function" },
  },
  {
    label: "for",
    insert: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    $0\n}",
    kind: "snippet",
    detail: { mn: "Давталт (тоолуурт)", en: "Counting loop" },
    doc: {
      mn: "0-ээс n-1 хүртэл n удаа давтана.",
      en: "Repeats n times, counting 0 up to n-1.",
    },
  },
  {
    label: "while",
    insert: "while (${1:condition}) {\n    $0\n}",
    kind: "snippet",
    detail: { mn: "Нөхцөлт давталт", en: "Conditional loop" },
  },
  {
    label: "if",
    insert: "if (${1:condition}) {\n    $0\n}",
    kind: "snippet",
    detail: { mn: "Нөхцөл шалгах", en: "Check a condition" },
  },
  {
    label: "ifelse",
    insert: "if (${1:condition}) {\n    $2\n} else {\n    $0\n}",
    kind: "snippet",
    detail: { mn: "Нөхцөл ба өөр тохиолдол", en: "If / else" },
  },
  {
    label: "long long",
    insert: "long long ",
    kind: "keyword",
    detail: { mn: "Том бүхэл тоо", en: "Big whole number" },
    doc: {
      mn: "int нь ойролцоогоор 2 тэрбумаас цааш тоо агуулж чадахгүй. Хариу түүнээс том байж болох бол long long хэрэглэ.",
      en: "int cannot hold past about 2 billion. If the answer can be larger, use long long.",
    },
  },
  {
    label: "vector",
    insert: "vector<${1:int}> ${2:a}($0);",
    kind: "snippet",
    detail: { mn: "Жагсаалт (динамик массив)", en: "A list (dynamic array)" },
  },
  {
    label: "string",
    insert: "string ${1:s};",
    kind: "snippet",
    detail: { mn: "Тэмдэгт мөр", en: "Text" },
  },
  {
    label: "sort",
    insert: "sort(${1:a}.begin(), ${1:a}.end());",
    kind: "snippet",
    detail: { mn: "Эрэмбэлэх", en: "Sort a list" },
  },
];

const PYTHON: CompletionSpec[] = [
  {
    label: "print",
    insert: "print($0)",
    kind: "function",
    detail: { mn: "Дэлгэц рүү хэвлэх", en: "Print to the screen" },
  },
  {
    label: "input",
    insert: "input()",
    kind: "function",
    detail: { mn: "Бүтэн мөр уншина", en: "Read a whole line" },
    doc: {
      mn: "input() бүтэн мөрийг БИЧВЭР болгон уншина. Тоо болгохын тулд int(input()) гэж бич.",
      en: "input() reads a whole line as TEXT. Wrap it in int(input()) to get a number.",
    },
  },
  {
    // The single most common way a correct-looking solution fails here: the
    // numbers arrive on ONE line, and int(input()) three times throws
    // ValueError: invalid literal for int() with base 10: '1 2 3'.
    // Offering it as a completion puts the answer where the mistake happens.
    label: "map",
    insert: "${1:a}, ${2:b} = map(int, input().split())",
    kind: "snippet",
    detail: {
      mn: "Нэг мөрнөөс хэд хэдэн тоо унших",
      en: "Read several numbers from one line",
    },
    doc: {
      mn: "Тоонууд нэг мөрөнд зайгаар тусгаарлагдан ирвэл ингэж уншина. int(input()) -ийг дахин дахин бичвэл алдаа гарна.",
      en: "Use this when the numbers arrive on one line separated by spaces. Repeating int(input()) will fail instead.",
    },
  },
  {
    label: "split",
    insert: "input().split()",
    kind: "function",
    detail: { mn: "Мөрийг зайгаар хуваах", en: "Split a line on spaces" },
    doc: {
      mn: "'1 2 3' гэсэн мөрийг ['1', '2', '3'] болгож хуваана. Тоо болгохын тулд int() -ээр ороо.",
      en: "Turns the line '1 2 3' into ['1', '2', '3']. Wrap in int() to get numbers.",
    },
  },
  {
    label: "for",
    insert: "for ${1:i} in range(${2:n}):\n    $0",
    kind: "snippet",
    detail: { mn: "Давталт", en: "Counting loop" },
    doc: {
      mn: "range(n) нь 0-ээс n-1 хүртэл тоолно.",
      en: "range(n) counts 0 up to n-1.",
    },
  },
  {
    label: "while",
    insert: "while ${1:condition}:\n    $0",
    kind: "snippet",
    detail: { mn: "Нөхцөлт давталт", en: "Conditional loop" },
  },
  {
    label: "if",
    insert: "if ${1:condition}:\n    $0",
    kind: "snippet",
    detail: { mn: "Нөхцөл шалгах", en: "Check a condition" },
  },
  {
    label: "ifelse",
    insert: "if ${1:condition}:\n    $2\nelse:\n    $0",
    kind: "snippet",
    detail: { mn: "Нөхцөл ба өөр тохиолдол", en: "If / else" },
  },
  {
    label: "def",
    insert: "def ${1:name}(${2:args}):\n    $0",
    kind: "snippet",
    detail: { mn: "Функц тодорхойлох", en: "Define a function" },
  },
  {
    label: "range",
    insert: "range($0)",
    kind: "function",
    detail: { mn: "Тоон дараалал", en: "A run of numbers" },
  },
  {
    label: "len",
    insert: "len($0)",
    kind: "function",
    detail: { mn: "Урт", en: "How many items" },
  },
  {
    label: "int",
    insert: "int($0)",
    kind: "function",
    detail: { mn: "Бичвэрийг тоо болгох", en: "Turn text into a number" },
  },
  {
    label: "sorted",
    insert: "sorted($0)",
    kind: "function",
    detail: { mn: "Эрэмбэлэх", en: "Sort a list" },
  },
  {
    label: "sum",
    insert: "sum($0)",
    kind: "function",
    detail: { mn: "Нийлбэр", en: "Add everything up" },
  },
];

export const COMPLETIONS: Record<LanguageId, CompletionSpec[]> = {
  cpp: CPP,
  python: PYTHON,
};

/** Only entries worth a paragraph get a hover. */
export function hoverDocFor(
  language: LanguageId,
  word: string,
  locale: "mn" | "en",
): string | null {
  const hit = COMPLETIONS[language].find((c) => c.label === word);
  if (!hit?.doc) return null;
  return `**${hit.label}** — ${hit.detail[locale]}\n\n${hit.doc[locale]}`;
}

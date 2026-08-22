// The programming languages students can write in.
//
// One place decides the Judge0 id, the Monaco syntax mode and the starter
// code, so adding another language later means editing only this file.

export type LanguageId = "cpp" | "python";

export interface Language {
  id: LanguageId;
  /** Shown in pickers. */
  label: string;
  /** Judge0 CE language id used when compiling/running. */
  judge0Id: number;
  /** Monaco editor syntax mode. */
  monaco: string;
  /** What a blank editor starts with. */
  starter: string;
  /** Used for the tab label in the playground. */
  filename: string;
  /** Line-comment marker, for generated snippets. */
  comment: string;
}

export const LANGUAGES: Record<LanguageId, Language> = {
  cpp: {
    id: "cpp",
    label: "C++",
    judge0Id: 54, // C++ (GCC 9.2.0)
    monaco: "cpp",
    filename: "main.cpp",
    comment: "//",
    starter: `#include <bits/stdc++.h>
using namespace std;

int main() {

    return 0;
}
`,
  },
  python: {
    id: "python",
    label: "Python",
    // Judge0 also offers 3.8.1 (71), but 3.11+ rewrote error messages to point
    // at the exact spot in the line, which matters a lot for beginners.
    judge0Id: 100, // Python (3.12.5)
    monaco: "python",
    filename: "main.py",
    comment: "#",
    starter: `# Write your code here

`,
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
export const DEFAULT_LANGUAGE: LanguageId = "cpp";

/** Narrow an untrusted string to a known language, falling back to C++. */
export function toLanguage(value: unknown): LanguageId {
  return value === "python" || value === "cpp"
    ? (value as LanguageId)
    : DEFAULT_LANGUAGE;
}

export function judge0IdFor(language: LanguageId): number {
  return LANGUAGES[language].judge0Id;
}

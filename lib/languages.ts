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
    // <iostream> is what the course teaches and what the standard actually
    // defines; <bits/stdc++.h> is a GCC implementation detail that happens to
    // pull in the whole library. Starting a beginner on the real header means
    // the first line of their program is a line they can be told the meaning
    // of.
    //
    // Writing <bits/stdc++.h> still compiles and always will — both judge
    // backends are GCC (go-judge runs `/usr/bin/g++`, the Judge0 fallback is
    // GCC 9.2.0), and nothing in this app inspects or filters includes. This
    // is the text in an empty editor, not a rule.
    starter: `#include <iostream>
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
    // An empty page on purpose. A read_int() helper briefly lived here so a
    // C++ solution could be translated line for line without split(), but it
    // filled the editor with a wall of code a beginner had not written and
    // could not yet read. Reading one line and splitting it is taught in
    // lessons-python.ts instead, which is where it belongs.
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

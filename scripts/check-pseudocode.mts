// Checks the Cambridge pseudocode interpreter.
//   node --experimental-strip-types scripts/check-pseudocode.mts
//
// A parser that marks a correct algorithm wrong is worse than no runner at
// all, so every construct the syllabus publishes is exercised here.
import { runPseudocode } from "../lib/cambridge/pseudocode.ts";

let pass = 0;
const fails: string[] = [];

function check(name: string, src: string, expect: string[], stdin: string[] = []) {
  const r = runPseudocode(src, stdin);
  const got = r.output;
  const same = got.length === expect.length && got.every((l, i) => l === expect[i]);
  if (same && !r.error) { pass++; return; }
  fails.push(`${name}\n    expected ${JSON.stringify(expect)}\n    got      ${JSON.stringify(got)}${r.error ? `\n    error    ${r.error} (line ${r.errorLine})` : ""}`);
}

function checkError(name: string, src: string, fragment: string, stdin: string[] = []) {
  const r = runPseudocode(src, stdin);
  if (r.error && r.error.toLowerCase().includes(fragment.toLowerCase())) { pass++; return; }
  fails.push(`${name}\n    expected an error containing ${JSON.stringify(fragment)}\n    got      ${r.error ?? "no error, output " + JSON.stringify(r.output)}`);
}

// --- output and expressions -------------------------------------------
check("OUTPUT string", `OUTPUT "Hello"`, ["Hello"]);
check("OUTPUT number", `OUTPUT 42`, ["42"]);
check("arithmetic", `OUTPUT 2 + 3 * 4`, ["14"]);
check("brackets", `OUTPUT (2 + 3) * 4`, ["20"]);
check("real division", `OUTPUT 7 / 2`, ["3.5"]);
check("DIV and MOD", `OUTPUT 7 DIV 2\nOUTPUT 7 MOD 2`, ["3", "1"]);
check("concat with &", `OUTPUT "a" & "b" & 1`, ["ab1"]);
check("comma joins", `OUTPUT "n = ", 5`, ["n = 5"]);
check("comparison", `OUTPUT 3 > 2`, ["TRUE"]);
check("boolean ops", `OUTPUT TRUE AND FALSE\nOUTPUT NOT FALSE`, ["FALSE", "TRUE"]);
check("unary minus", `OUTPUT -5 + 2`, ["-3"]);
check("comment ignored", `// note\nOUTPUT 1`, ["1"]);

// --- variables --------------------------------------------------------
check("declare and assign", `DECLARE X : INTEGER\nX <- 5\nOUTPUT X`, ["5"]);
check("arrow variants", `DECLARE X : INTEGER\nX ← 7\nOUTPUT X`, ["7"]);
check("assign without declare", `Count <- 3\nOUTPUT Count`, ["3"]);
check("CONSTANT", `CONSTANT Pi <- 3\nOUTPUT Pi`, ["3"]);
checkError("CONSTANT is protected", `CONSTANT Pi <- 3\nPi <- 4`, "CONSTANT");
checkError("undefined variable", `OUTPUT Missing`, "has not been given a value");

// --- selection --------------------------------------------------------
check("IF THEN", `IF 5 > 3 THEN\n  OUTPUT "yes"\nENDIF`, ["yes"]);
check("IF ELSE", `IF 1 > 3 THEN\n  OUTPUT "a"\nELSE\n  OUTPUT "b"\nENDIF`, ["b"]);
check("THEN on next line", `IF 5 > 3\nTHEN\n  OUTPUT "ok"\nENDIF`, ["ok"]);
check("nested IF", `DECLARE N : INTEGER\nN <- 5\nIF N > 0 THEN\n IF N > 3 THEN\n  OUTPUT "big"\n ENDIF\nENDIF`, ["big"]);
check("CASE", `DECLARE D : INTEGER\nD <- 2\nCASE OF D\n 1 : OUTPUT "Mon"\n 2 : OUTPUT "Tue"\n OTHERWISE : OUTPUT "other"\nENDCASE`, ["Tue"]);
check("CASE otherwise", `DECLARE D : INTEGER\nD <- 9\nCASE OF D\n 1 : OUTPUT "Mon"\n OTHERWISE : OUTPUT "other"\nENDCASE`, ["other"]);

// --- loops ------------------------------------------------------------
check("FOR", `DECLARE I : INTEGER\nFOR I <- 1 TO 3\n OUTPUT I\nNEXT I`, ["1", "2", "3"]);
check("FOR STEP", `DECLARE I : INTEGER\nFOR I <- 10 TO 1 STEP -3\n OUTPUT I\nNEXT I`, ["10", "7", "4", "1"]);
check("WHILE", `DECLARE I : INTEGER\nI <- 1\nWHILE I <= 3 DO\n OUTPUT I\n I <- I + 1\nENDWHILE`, ["1", "2", "3"]);
check("WHILE without DO", `DECLARE I : INTEGER\nI <- 1\nWHILE I < 3\n OUTPUT I\n I <- I + 1\nENDWHILE`, ["1", "2"]);
check("REPEAT UNTIL runs once", `DECLARE I : INTEGER\nI <- 9\nREPEAT\n OUTPUT I\n I <- I + 1\nUNTIL I > 0`, ["9"]);
checkError("infinite loop is stopped", `DECLARE I : INTEGER\nI <- 1\nWHILE I > 0 DO\n I <- I + 1\nENDWHILE`, "still running");
checkError("STEP 0 refused", `DECLARE I : INTEGER\nFOR I <- 1 TO 5 STEP 0\n OUTPUT I\nNEXT I`, "never finish");

// --- arrays -----------------------------------------------------------
check("1-D array", `DECLARE A : ARRAY[1:3] OF INTEGER\nA[1] <- 10\nA[2] <- 20\nOUTPUT A[1] + A[2]`, ["30"]);
check("array default", `DECLARE A : ARRAY[1:3] OF INTEGER\nOUTPUT A[3]`, ["0"]);
check("2-D array", `DECLARE G : ARRAY[1:2, 1:2] OF INTEGER\nG[2,1] <- 7\nOUTPUT G[2,1]`, ["7"]);
checkError("index out of range", `DECLARE A : ARRAY[1:3] OF INTEGER\nOUTPUT A[5]`, "outside the array");
check("array in a loop", `DECLARE A : ARRAY[1:5] OF INTEGER\nDECLARE I : INTEGER\nFOR I <- 1 TO 5\n A[I] <- I * I\nNEXT I\nOUTPUT A[4]`, ["16"]);

// --- input ------------------------------------------------------------
check("INPUT number", `DECLARE N : INTEGER\nINPUT N\nOUTPUT N * 2`, ["8"], ["4"]);
check("INPUT string", `DECLARE S : STRING\nINPUT S\nOUTPUT "Hi ", S`, ["Hi Bat"], ["Bat"]);
checkError("INPUT with no input", `DECLARE N : INTEGER\nINPUT N`, "none was given");

// --- procedures and functions ----------------------------------------
check(
  "FUNCTION",
  `FUNCTION Double(N) RETURNS INTEGER\n RETURN N * 2\nENDFUNCTION\nOUTPUT Double(21)`,
  ["42"],
);
check(
  "PROCEDURE with CALL",
  `PROCEDURE Greet(Name)\n OUTPUT "Hi ", Name\nENDPROCEDURE\nCALL Greet("Bat")`,
  ["Hi Bat"],
);
check(
  "recursive FUNCTION",
  `FUNCTION Fact(N) RETURNS INTEGER\n IF N <= 1 THEN\n  RETURN 1\n ENDIF\n RETURN N * Fact(N - 1)\nENDFUNCTION\nOUTPUT Fact(5)`,
  ["120"],
);

// --- built-in library -------------------------------------------------
check("LENGTH", `OUTPUT LENGTH("hello")`, ["5"]);
check("UCASE LCASE", `OUTPUT UCASE("ab")\nOUTPUT LCASE("AB")`, ["AB", "ab"]);
check("SUBSTRING is 1-based", `OUTPUT SUBSTRING("Ulaanbaatar", 1, 5)`, ["Ulaan"]);
check("MID", `OUTPUT MID("Ulaanbaatar", 6, 6)`, ["baatar"]);
check("INT and ROUND", `OUTPUT INT(3.7)\nOUTPUT ROUND(3.7)`, ["3", "4"]);
check("ASC and CHR", `OUTPUT ASC("A")\nOUTPUT CHR(66)`, ["65", "B"]);

// --- errors report a line --------------------------------------------
const e = runPseudocode(`OUTPUT 1\nOUTPUT 2\nOUTPUT Missing`);
if (e.errorLine === 3) pass++;
else fails.push(`error line number\n    expected 3, got ${e.errorLine}`);

const div = runPseudocode(`OUTPUT 1 / 0`);
if (div.error?.includes("divide by zero")) pass++;
else fails.push(`divide by zero\n    got ${div.error}`);

// --- a whole realistic program ---------------------------------------
check(
  "exam-style program",
  `DECLARE Total : INTEGER
DECLARE Count : INTEGER
DECLARE Mark : INTEGER
Total <- 0
FOR Count <- 1 TO 5
  INPUT Mark
  Total <- Total + Mark
NEXT Count
OUTPUT "Total = ", Total
OUTPUT "Average = ", Total / 5`,
  ["Total = 350", "Average = 70"],
  ["60", "70", "80", "90", "50"],
);

console.log(`${pass} passed, ${fails.length} failed`);
if (fails.length) process.exitCode = 1;
for (const f of fails) console.log("\nFAIL " + f);

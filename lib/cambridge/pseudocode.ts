// A small interpreter for Cambridge pseudocode.
//
// The syllabus is examined in pseudocode, not in a real language, so students
// write it constantly and never once see it run. Every mistake has to be found
// by a teacher reading it. This runs it.
//
// Like sql-db.ts it lives in lib/ with no React in sight, so it can be
// tested on its own — telling a student their correct algorithm is wrong
// because of a parser bug is far worse than offering no runner at all.
//
// It implements the pseudocode Cambridge actually publishes: DECLARE, CONSTANT,
// assignment with ←, OUTPUT, INPUT, IF/ELSE, CASE, FOR/NEXT, WHILE, REPEAT,
// one-and two-dimensional ARRAY, PROCEDURE/FUNCTION, and the standard string
// and maths library. Anything outside that is reported as an error rather than
// quietly guessed at.

export type Value = number | string | boolean;

export interface RunResult {
  output: string[];
  /** Set when the program stopped early. */
  error?: string;
  /** 1-based line the error is on, for the editor gutter. */
  errorLine?: number;
  /** Input lines the program never consumed. */
  unusedInput: number;
}

/* ------------------------------------------------------------------ lexer */

type TokType =
  | "num" | "str" | "char" | "ident" | "kw" | "op" | "newline" | "eof";

interface Tok {
  type: TokType;
  value: string;
  line: number;
}

const KEYWORDS = new Set([
  "DECLARE", "CONSTANT", "OUTPUT", "INPUT", "IF", "THEN", "ELSE", "ENDIF",
  "CASE", "OF", "OTHERWISE", "ENDCASE", "FOR", "TO", "STEP", "NEXT",
  "WHILE", "DO", "ENDWHILE", "REPEAT", "UNTIL", "PROCEDURE", "ENDPROCEDURE",
  "FUNCTION", "RETURNS", "RETURN", "ENDFUNCTION", "CALL", "ARRAY",
  "AND", "OR", "NOT", "DIV", "MOD", "TRUE", "FALSE",
  "INTEGER", "REAL", "STRING", "CHAR", "BOOLEAN", "BYREF", "BYVAL",
]);

/** Longest first, so <- and <> are not read as < . */
const OPS = [
  "<--", "<-", "←", "<>", "<=", ">=", "=", "<", ">",
  "+", "-", "*", "/", "&", "(", ")", "[", "]", ",", ":",
];

function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let line = 1;

  while (i < src.length) {
    const c = src[i];

    if (c === "\n") { toks.push({ type: "newline", value: "\n", line }); line++; i++; continue; }
    if (c === " " || c === "\t" || c === "\r") { i++; continue; }

    // Comments run to the end of the line.
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }

    if (c === '"') {
      let j = i + 1;
      let s = "";
      while (j < src.length && src[j] !== '"') {
        if (src[j] === "\n") break;
        s += src[j++];
      }
      if (src[j] !== '"') throw new PseudoError("A string is missing its closing quote", line);
      toks.push({ type: "str", value: s, line });
      i = j + 1;
      continue;
    }

    if (c === "'") {
      const ch = src[i + 1];
      if (src[i + 2] !== "'") throw new PseudoError("A character literal must be one letter in single quotes", line);
      toks.push({ type: "char", value: ch, line });
      i += 3;
      continue;
    }

    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      if (src[j] === "." && /[0-9]/.test(src[j + 1] ?? "")) {
        j++;
        while (j < src.length && /[0-9]/.test(src[j])) j++;
      }
      toks.push({ type: "num", value: src.slice(i, j), line });
      i = j;
      continue;
    }

    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      const upper = word.toUpperCase();
      toks.push({
        type: KEYWORDS.has(upper) ? "kw" : "ident",
        value: KEYWORDS.has(upper) ? upper : word,
        line,
      });
      i = j;
      continue;
    }

    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) {
      toks.push({ type: "op", value: op === "<--" || op === "←" ? "<-" : op, line });
      i += op.length;
      continue;
    }

    throw new PseudoError(`I do not understand the character ${JSON.stringify(c)}`, line);
  }

  toks.push({ type: "eof", value: "", line });
  return toks;
}

export class PseudoError extends Error {
  line: number;
  constructor(message: string, line: number) {
    super(message);
    this.line = line;
  }
}

/* ----------------------------------------------------------------- values */

function isNum(v: Value): v is number { return typeof v === "number"; }

function show(v: Value): string {
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") {
    // Whole numbers print without a decimal point, as the exam papers do.
    return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(10)));
  }
  return v;
}

interface ArrayVal {
  kind: "array";
  /** [lower, upper] per dimension — Cambridge arrays are inclusive. */
  dims: [number, number][];
  data: Map<string, Value>;
  of: string;
}

type Slot = Value | ArrayVal;

function isArray(v: Slot): v is ArrayVal {
  return typeof v === "object" && v !== null && (v as ArrayVal).kind === "array";
}

function zeroOf(type: string): Value {
  if (type === "INTEGER" || type === "REAL") return 0;
  if (type === "BOOLEAN") return false;
  return "";
}

/* ----------------------------------------------------------------- parser */

interface Ctx {
  toks: Tok[];
  pos: number;
}

const peek = (c: Ctx) => c.toks[c.pos];
const next = (c: Ctx) => c.toks[c.pos++];

function at(c: Ctx, type: TokType, value?: string) {
  const t = peek(c);
  return t.type === type && (value === undefined || t.value === value);
}

function eat(c: Ctx, type: TokType, value?: string) {
  if (!at(c, type, value)) return false;
  c.pos++;
  return true;
}

function expect(c: Ctx, type: TokType, value?: string): Tok {
  if (!at(c, type, value)) {
    const t = peek(c);
    const got = t.type === "eof" ? "the end of the program" : `"${t.value}"`;
    throw new PseudoError(`Expected ${value ?? type} but found ${got}`, t.line);
  }
  return next(c);
}

function skipNewlines(c: Ctx) {
  while (at(c, "newline")) c.pos++;
}

/* ---- expressions: precedence climbing ---- */

type Expr =
  | { k: "lit"; v: Value }
  | { k: "var"; name: string; line: number }
  | { k: "index"; name: string; idx: Expr[]; line: number }
  | { k: "un"; op: string; e: Expr; line: number }
  | { k: "bin"; op: string; l: Expr; r: Expr; line: number }
  | { k: "call"; name: string; args: Expr[]; line: number };

const BIN_PREC: Record<string, number> = {
  OR: 1, AND: 2,
  "=": 3, "<>": 3, "<": 3, ">": 3, "<=": 3, ">=": 3,
  "&": 4,
  "+": 5, "-": 5,
  "*": 6, "/": 6, DIV: 6, MOD: 6,
};

function parseExpr(c: Ctx, minPrec = 0): Expr {
  let left = parseUnary(c);
  for (;;) {
    const t = peek(c);
    const op = t.type === "op" || t.type === "kw" ? t.value : null;
    if (!op || BIN_PREC[op] === undefined || BIN_PREC[op] < minPrec) break;
    next(c);
    const right = parseExpr(c, BIN_PREC[op] + 1);
    left = { k: "bin", op, l: left, r: right, line: t.line };
  }
  return left;
}

function parseUnary(c: Ctx): Expr {
  const t = peek(c);
  if (at(c, "kw", "NOT") || at(c, "op", "-")) {
    next(c);
    return { k: "un", op: t.value, e: parseUnary(c), line: t.line };
  }
  return parsePrimary(c);
}

function parsePrimary(c: Ctx): Expr {
  const t = peek(c);

  if (eat(c, "op", "(")) {
    const e = parseExpr(c);
    expect(c, "op", ")");
    return e;
  }
  if (at(c, "num")) return { k: "lit", v: Number(next(c).value) };
  if (at(c, "str")) return { k: "lit", v: next(c).value };
  if (at(c, "char")) return { k: "lit", v: next(c).value };
  if (eat(c, "kw", "TRUE")) return { k: "lit", v: true };
  if (eat(c, "kw", "FALSE")) return { k: "lit", v: false };

  if (at(c, "ident")) {
    const name = next(c).value;
    if (eat(c, "op", "(")) {
      const args: Expr[] = [];
      if (!at(c, "op", ")")) {
        do { args.push(parseExpr(c)); } while (eat(c, "op", ","));
      }
      expect(c, "op", ")");
      return { k: "call", name, args, line: t.line };
    }
    if (eat(c, "op", "[")) {
      const idx: Expr[] = [];
      do { idx.push(parseExpr(c)); } while (eat(c, "op", ","));
      expect(c, "op", "]");
      return { k: "index", name, idx, line: t.line };
    }
    return { k: "var", name, line: t.line };
  }

  throw new PseudoError(
    t.type === "eof" ? "The program ended in the middle of an expression" : `I did not expect "${t.value}" here`,
    t.line,
  );
}

/* ---- statements ---- */

type Stmt =
  | { k: "declare"; name: string; type: string; dims?: [Expr, Expr][]; line: number }
  | { k: "const"; name: string; e: Expr; line: number }
  | { k: "assign"; target: Expr; e: Expr; line: number }
  | { k: "output"; parts: Expr[]; line: number }
  | { k: "input"; target: Expr; line: number }
  | { k: "if"; cond: Expr; then: Stmt[]; else?: Stmt[]; line: number }
  | { k: "case"; subject: Expr; arms: { match: Expr; body: Stmt[] }[]; other?: Stmt[]; line: number }
  | { k: "for"; varName: string; from: Expr; to: Expr; step?: Expr; body: Stmt[]; line: number }
  | { k: "while"; cond: Expr; body: Stmt[]; line: number }
  | { k: "repeat"; body: Stmt[]; cond: Expr; line: number }
  | { k: "proc"; name: string; params: string[]; body: Stmt[]; line: number }
  | { k: "func"; name: string; params: string[]; body: Stmt[]; line: number }
  | { k: "call"; name: string; args: Expr[]; line: number }
  | { k: "return"; e: Expr; line: number };

function parseBlock(c: Ctx, until: string[]): Stmt[] {
  const out: Stmt[] = [];
  for (;;) {
    skipNewlines(c);
    const t = peek(c);
    if (t.type === "eof") break;
    if (t.type === "kw" && until.includes(t.value)) break;
    out.push(parseStmt(c));
  }
  return out;
}

function parseParams(c: Ctx): string[] {
  const params: string[] = [];
  if (eat(c, "op", "(")) {
    if (!at(c, "op", ")")) {
      do {
        eat(c, "kw", "BYREF");
        eat(c, "kw", "BYVAL");
        params.push(expect(c, "ident").value);
        if (eat(c, "op", ":")) next(c); // the declared type, not enforced
      } while (eat(c, "op", ","));
    }
    expect(c, "op", ")");
  }
  return params;
}

function parseStmt(c: Ctx): Stmt {
  const t = peek(c);
  const line = t.line;

  if (eat(c, "kw", "DECLARE")) {
    const name = expect(c, "ident").value;
    expect(c, "op", ":");
    if (eat(c, "kw", "ARRAY")) {
      expect(c, "op", "[");
      const dims: [Expr, Expr][] = [];
      do {
        const lo = parseExpr(c);
        expect(c, "op", ":");
        const hi = parseExpr(c);
        dims.push([lo, hi]);
      } while (eat(c, "op", ","));
      expect(c, "op", "]");
      expect(c, "kw", "OF");
      const of = next(c).value;
      return { k: "declare", name, type: of, dims, line };
    }
    const type = next(c).value;
    return { k: "declare", name, type, line };
  }

  if (eat(c, "kw", "CONSTANT")) {
    const name = expect(c, "ident").value;
    if (!eat(c, "op", "<-")) expect(c, "op", "=");
    return { k: "const", name, e: parseExpr(c), line };
  }

  if (eat(c, "kw", "OUTPUT")) {
    const parts: Expr[] = [];
    do { parts.push(parseExpr(c)); } while (eat(c, "op", ","));
    return { k: "output", parts, line };
  }

  if (eat(c, "kw", "INPUT")) {
    return { k: "input", target: parsePrimary(c), line };
  }

  if (eat(c, "kw", "IF")) {
    const cond = parseExpr(c);
    skipNewlines(c);
    expect(c, "kw", "THEN");
    const then = parseBlock(c, ["ELSE", "ENDIF"]);
    let els: Stmt[] | undefined;
    if (eat(c, "kw", "ELSE")) els = parseBlock(c, ["ENDIF"]);
    expect(c, "kw", "ENDIF");
    return { k: "if", cond, then, else: els, line };
  }

  if (eat(c, "kw", "CASE")) {
    expect(c, "kw", "OF");
    const subject = parseExpr(c);
    const arms: { match: Expr; body: Stmt[] }[] = [];
    let other: Stmt[] | undefined;
    for (;;) {
      skipNewlines(c);
      if (at(c, "kw", "ENDCASE")) break;
      if (eat(c, "kw", "OTHERWISE")) {
        eat(c, "op", ":");
        other = parseBlock(c, ["ENDCASE"]);
        break;
      }
      const match = parseExpr(c);
      expect(c, "op", ":");
      const body: Stmt[] = [];
      // One statement per arm unless it runs onto its own lines.
      if (!at(c, "newline")) body.push(parseStmt(c));
      else body.push(...parseBlock(c, ["ENDCASE", "OTHERWISE"]));
      arms.push({ match, body });
    }
    expect(c, "kw", "ENDCASE");
    return { k: "case", subject, arms, other, line };
  }

  if (eat(c, "kw", "FOR")) {
    const varName = expect(c, "ident").value;
    expect(c, "op", "<-");
    const from = parseExpr(c);
    expect(c, "kw", "TO");
    const to = parseExpr(c);
    const step = eat(c, "kw", "STEP") ? parseExpr(c) : undefined;
    const body = parseBlock(c, ["NEXT"]);
    expect(c, "kw", "NEXT");
    if (at(c, "ident")) next(c);
    return { k: "for", varName, from, to, step, body, line };
  }

  if (eat(c, "kw", "WHILE")) {
    const cond = parseExpr(c);
    eat(c, "kw", "DO");
    const body = parseBlock(c, ["ENDWHILE"]);
    expect(c, "kw", "ENDWHILE");
    return { k: "while", cond, body, line };
  }

  if (eat(c, "kw", "REPEAT")) {
    const body = parseBlock(c, ["UNTIL"]);
    expect(c, "kw", "UNTIL");
    return { k: "repeat", body, cond: parseExpr(c), line };
  }

  if (eat(c, "kw", "PROCEDURE")) {
    const name = expect(c, "ident").value;
    const params = parseParams(c);
    const body = parseBlock(c, ["ENDPROCEDURE"]);
    expect(c, "kw", "ENDPROCEDURE");
    return { k: "proc", name, params, body, line };
  }

  if (eat(c, "kw", "FUNCTION")) {
    const name = expect(c, "ident").value;
    const params = parseParams(c);
    if (eat(c, "kw", "RETURNS")) next(c);
    const body = parseBlock(c, ["ENDFUNCTION"]);
    expect(c, "kw", "ENDFUNCTION");
    return { k: "func", name, params, body, line };
  }

  if (eat(c, "kw", "RETURN")) {
    return { k: "return", e: parseExpr(c), line };
  }

  if (eat(c, "kw", "CALL")) {
    const name = expect(c, "ident").value;
    const args: Expr[] = [];
    if (eat(c, "op", "(")) {
      if (!at(c, "op", ")")) {
        do { args.push(parseExpr(c)); } while (eat(c, "op", ","));
      }
      expect(c, "op", ")");
    }
    return { k: "call", name, args, line };
  }

  // Otherwise it must be an assignment.
  const target = parsePrimary(c);
  if (eat(c, "op", "<-")) {
    return { k: "assign", target, e: parseExpr(c), line };
  }
  if (target.k === "call") return { k: "call", name: target.name, args: target.args, line };

  throw new PseudoError(
    'I expected an instruction here. Assignment is written with the arrow, as in  Count <- 0',
    line,
  );
}

/* -------------------------------------------------------------- interpreter */

/** Written the long way: a parameter property cannot be type-stripped. */
class ReturnSignal {
  value: Value;
  constructor(value: Value) {
    this.value = value;
  }
}

interface Scope {
  vars: Map<string, Slot>;
  consts: Set<string>;
  parent?: Scope;
}

function lookup(s: Scope | undefined, name: string): Scope | undefined {
  for (let cur = s; cur; cur = cur.parent) if (cur.vars.has(name)) return cur;
  return undefined;
}

const MAX_STEPS = 2_000_000;

export function runPseudocode(source: string, stdin: string[] = []): RunResult {
  const output: string[] = [];
  const input = [...stdin];
  let steps = 0;

  try {
    const toks = lex(source);
    const c: Ctx = { toks, pos: 0 };
    const program = parseBlock(c, []);
    if (!at(c, "eof")) {
      const t = peek(c);
      throw new PseudoError(`"${t.value}" does not belong here`, t.line);
    }

    const procs = new Map<string, Stmt & { k: "proc" }>();
    const funcs = new Map<string, Stmt & { k: "func" }>();
    const collect = (list: Stmt[]) => {
      for (const s of list) {
        if (s.k === "proc") procs.set(s.name.toLowerCase(), s);
        if (s.k === "func") funcs.set(s.name.toLowerCase(), s);
      }
    };
    collect(program);

    const global: Scope = { vars: new Map(), consts: new Set() };

    const tick = (line: number) => {
      if (++steps > MAX_STEPS) {
        throw new PseudoError("This program is still running after a very long time — is a loop missing its end condition?", line);
      }
    };

    /* ---- expression evaluation ---- */

    const evalExpr = (e: Expr, scope: Scope): Value => {
      switch (e.k) {
        case "lit": return e.v;

        case "var": {
          const owner = lookup(scope, e.name);
          if (!owner) throw new PseudoError(`${e.name} has not been given a value yet`, e.line);
          const v = owner.vars.get(e.name)!;
          if (isArray(v)) throw new PseudoError(`${e.name} is an array — say which element, like ${e.name}[1]`, e.line);
          return v;
        }

        case "index": {
          const owner = lookup(scope, e.name);
          if (!owner) throw new PseudoError(`${e.name} has not been declared`, e.line);
          const arr = owner.vars.get(e.name)!;
          if (!isArray(arr)) throw new PseudoError(`${e.name} is not an array`, e.line);
          const idx = e.idx.map((x) => evalExpr(x, scope));
          return arr.data.get(keyFor(arr, idx, e.line)) ?? zeroOf(arr.of);
        }

        case "un": {
          const v = evalExpr(e.e, scope);
          if (e.op === "NOT") return !truthy(v, e.line);
          if (!isNum(v)) throw new PseudoError("Minus needs a number", e.line);
          return -v;
        }

        case "bin": {
          const l = evalExpr(e.l, scope);
          if (e.op === "AND") return truthy(l, e.line) ? truthy(evalExpr(e.r, scope), e.line) : false;
          if (e.op === "OR") return truthy(l, e.line) ? true : truthy(evalExpr(e.r, scope), e.line);
          const r = evalExpr(e.r, scope);
          return binop(e.op, l, r, e.line);
        }

        case "call": {
          const builtin = callBuiltin(e.name, e.args.map((a) => evalExpr(a, scope)), e.line);
          if (builtin !== undefined) return builtin;
          const fn = funcs.get(e.name.toLowerCase());
          if (!fn) throw new PseudoError(`There is no function called ${e.name}`, e.line);
          return callUser(fn, e.args.map((a) => evalExpr(a, scope)), e.line);
        }
      }
    };

    const callUser = (fn: Stmt & { k: "func" | "proc" }, args: Value[], line: number): Value => {
      if (args.length !== fn.params.length) {
        throw new PseudoError(`${fn.name} expects ${fn.params.length} value(s) but got ${args.length}`, line);
      }
      const scope: Scope = { vars: new Map(), consts: new Set(), parent: global };
      fn.params.forEach((p, i) => scope.vars.set(p, args[i]));
      try {
        exec(fn.body, scope);
      } catch (err) {
        if (err instanceof ReturnSignal) return err.value;
        throw err;
      }
      return "";
    };

    /* ---- statements ---- */

    const exec = (list: Stmt[], scope: Scope): void => {
      for (const s of list) {
        tick(s.line);
        switch (s.k) {
          case "proc": case "func": break; // hoisted already

          case "declare": {
            if (s.dims) {
              const dims = s.dims.map(([lo, hi]) => {
                const a = evalExpr(lo, scope), b = evalExpr(hi, scope);
                if (!isNum(a) || !isNum(b)) throw new PseudoError("Array bounds must be numbers", s.line);
                return [a, b] as [number, number];
              });
              scope.vars.set(s.name, { kind: "array", dims, data: new Map(), of: s.type });
            } else {
              scope.vars.set(s.name, zeroOf(s.type));
            }
            break;
          }

          case "const": {
            scope.vars.set(s.name, evalExpr(s.e, scope));
            scope.consts.add(s.name);
            break;
          }

          case "assign": {
            const v = evalExpr(s.e, scope);
            if (s.target.k === "var") {
              const owner = lookup(scope, s.target.name) ?? scope;
              if (owner.consts.has(s.target.name)) {
                throw new PseudoError(`${s.target.name} is a CONSTANT and cannot be changed`, s.line);
              }
              owner.vars.set(s.target.name, v);
            } else if (s.target.k === "index") {
              const owner = lookup(scope, s.target.name);
              if (!owner) throw new PseudoError(`${s.target.name} has not been declared`, s.line);
              const arr = owner.vars.get(s.target.name)!;
              if (!isArray(arr)) throw new PseudoError(`${s.target.name} is not an array`, s.line);
              const idx = s.target.idx.map((x) => evalExpr(x, scope));
              arr.data.set(keyFor(arr, idx, s.line), v);
            } else {
              throw new PseudoError("You can only assign to a variable or an array element", s.line);
            }
            break;
          }

          case "output": {
            output.push(s.parts.map((p) => show(evalExpr(p, scope))).join(""));
            if (output.length > 10000) throw new PseudoError("This program has printed far too many lines", s.line);
            break;
          }

          case "input": {
            if (!input.length) throw new PseudoError("The program asked for input but none was given", s.line);
            const raw = input.shift()!;
            const v: Value = raw.trim() !== "" && !Number.isNaN(Number(raw)) ? Number(raw) : raw;
            if (s.target.k === "var") {
              const owner = lookup(scope, s.target.name) ?? scope;
              owner.vars.set(s.target.name, v);
            } else if (s.target.k === "index") {
              const owner = lookup(scope, s.target.name);
              const arr = owner?.vars.get(s.target.name);
              if (!arr || !isArray(arr)) throw new PseudoError(`${s.target.name} is not an array`, s.line);
              arr.data.set(keyFor(arr, s.target.idx.map((x) => evalExpr(x, scope)), s.line), v);
            }
            break;
          }

          case "if": {
            if (truthy(evalExpr(s.cond, scope), s.line)) exec(s.then, scope);
            else if (s.else) exec(s.else, scope);
            break;
          }

          case "case": {
            const subject = evalExpr(s.subject, scope);
            let ran = false;
            for (const arm of s.arms) {
              if (equal(subject, evalExpr(arm.match, scope))) { exec(arm.body, scope); ran = true; break; }
            }
            if (!ran && s.other) exec(s.other, scope);
            break;
          }

          case "for": {
            const from = evalExpr(s.from, scope);
            const to = evalExpr(s.to, scope);
            const step = s.step ? evalExpr(s.step, scope) : 1;
            if (!isNum(from) || !isNum(to) || !isNum(step)) throw new PseudoError("FOR needs numbers", s.line);
            if (step === 0) throw new PseudoError("A STEP of 0 would never finish", s.line);
            const owner = lookup(scope, s.varName) ?? scope;
            for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
              tick(s.line);
              owner.vars.set(s.varName, i);
              exec(s.body, scope);
            }
            break;
          }

          case "while": {
            while (truthy(evalExpr(s.cond, scope), s.line)) { tick(s.line); exec(s.body, scope); }
            break;
          }

          case "repeat": {
            do { tick(s.line); exec(s.body, scope); } while (!truthy(evalExpr(s.cond, scope), s.line));
            break;
          }

          case "call": {
            const p = procs.get(s.name.toLowerCase());
            if (p) { callUser(p, s.args.map((a) => evalExpr(a, scope)), s.line); break; }
            const f = funcs.get(s.name.toLowerCase());
            if (f) { callUser(f, s.args.map((a) => evalExpr(a, scope)), s.line); break; }
            throw new PseudoError(`There is no procedure called ${s.name}`, s.line);
          }

          case "return": throw new ReturnSignal(evalExpr(s.e, scope));
        }
      }
    };

    exec(program, global);
    return { output, unusedInput: input.length };
  } catch (err) {
    if (err instanceof PseudoError) {
      return { output, error: err.message, errorLine: err.line, unusedInput: input.length };
    }
    if (err instanceof ReturnSignal) {
      return { output, error: "RETURN only makes sense inside a FUNCTION", unusedInput: input.length };
    }
    return { output, error: err instanceof Error ? err.message : String(err), unusedInput: input.length };
  }
}

/* ------------------------------------------------------------- operations */

function keyFor(arr: ArrayVal, idx: Value[], line: number): string {
  if (idx.length !== arr.dims.length) {
    throw new PseudoError(`This array needs ${arr.dims.length} index value(s)`, line);
  }
  return idx
    .map((v, d) => {
      if (!isNum(v)) throw new PseudoError("An array index must be a number", line);
      const [lo, hi] = arr.dims[d];
      if (v < lo || v > hi) {
        throw new PseudoError(`Index ${show(v)} is outside the array — it goes from ${lo} to ${hi}`, line);
      }
      return String(v);
    })
    .join(",");
}

function truthy(v: Value, line: number): boolean {
  if (typeof v === "boolean") return v;
  throw new PseudoError("This needs to be TRUE or FALSE", line);
}

function equal(a: Value, b: Value): boolean {
  return a === b;
}

function binop(op: string, l: Value, r: Value, line: number): Value {
  if (op === "&") return show(l) + show(r);

  if (op === "=") return equal(l, r);
  if (op === "<>") return !equal(l, r);

  if (op === "+" && typeof l === "string" && typeof r === "string") return l + r;

  if (["<", ">", "<=", ">="].includes(op)) {
    if (typeof l === "string" && typeof r === "string") {
      const cmp = l < r ? -1 : l > r ? 1 : 0;
      return op === "<" ? cmp < 0 : op === ">" ? cmp > 0 : op === "<=" ? cmp <= 0 : cmp >= 0;
    }
  }

  if (!isNum(l) || !isNum(r)) {
    throw new PseudoError(`${op} needs numbers, but got ${JSON.stringify(show(l))} and ${JSON.stringify(show(r))}`, line);
  }

  switch (op) {
    case "+": return l + r;
    case "-": return l - r;
    case "*": return l * r;
    case "/":
      if (r === 0) throw new PseudoError("Cannot divide by zero", line);
      return l / r;
    case "DIV":
      if (r === 0) throw new PseudoError("Cannot divide by zero", line);
      return Math.trunc(l / r);
    case "MOD":
      if (r === 0) throw new PseudoError("Cannot take MOD zero", line);
      return l % r;
    case "<": return l < r;
    case ">": return l > r;
    case "<=": return l <= r;
    case ">=": return l >= r;
  }
  throw new PseudoError(`I do not know the operator ${op}`, line);
}

/** The standard library the syllabus lists. Returns undefined if not one. */
function callBuiltin(name: string, args: Value[], line: number): Value | undefined {
  const n = name.toUpperCase();
  const num = (i: number) => {
    const v = args[i];
    if (!isNum(v)) throw new PseudoError(`${n} needs a number`, line);
    return v;
  };
  const str = (i: number) => show(args[i]);

  switch (n) {
    case "LENGTH": return str(0).length;
    case "UCASE": return str(0).toUpperCase();
    case "LCASE": return str(0).toLowerCase();
    // Cambridge SUBSTRING/MID are 1-based and take a length.
    case "SUBSTRING":
    case "MID": return str(0).substr(num(1) - 1, num(2));
    case "LEFT": return str(0).slice(0, num(1));
    case "RIGHT": return str(0).slice(-num(1));
    case "INT": return Math.trunc(num(0));
    case "ROUND": return Number(num(0).toFixed(args.length > 1 ? num(1) : 0));
    case "ABS": return Math.abs(num(0));
    case "SQRT": return Math.sqrt(num(0));
    case "DIV": return Math.trunc(num(0) / num(1));
    case "MOD": return num(0) % num(1);
    case "NUM_TO_STRING": case "STR": return show(args[0]);
    case "STRING_TO_NUM": case "VAL": {
      const v = Number(str(0));
      if (Number.isNaN(v)) throw new PseudoError(`${JSON.stringify(str(0))} is not a number`, line);
      return v;
    }
    case "ASC": return str(0).charCodeAt(0);
    case "CHR": return String.fromCharCode(num(0));
    default: return undefined;
  }
}

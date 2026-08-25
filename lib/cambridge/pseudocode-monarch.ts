// Syntax highlighting for Cambridge pseudocode.
//
// Monaco has a grammar for every real language and none for this one, because
// pseudocode is not a real language — it is what the 0478 and 9618 papers are
// written in. Without a grammar the editor shows one flat colour, which is a
// poor signal for the mistake students actually make: writing a keyword the
// exam does not use. A word that does not light up is a word to check.
//
// Kept next to the interpreter so the two lists stay in step: anything
// lib/cambridge/pseudocode.ts accepts should colour here.

export const PSEUDOCODE_LANGUAGE_ID = "cambridge-pseudocode";

const KEYWORDS = [
  "DECLARE", "CONSTANT", "OUTPUT", "INPUT", "IF", "THEN", "ELSE", "ENDIF",
  "CASE", "OF", "OTHERWISE", "ENDCASE", "FOR", "TO", "STEP", "NEXT",
  "WHILE", "DO", "ENDWHILE", "REPEAT", "UNTIL", "PROCEDURE", "ENDPROCEDURE",
  "FUNCTION", "RETURNS", "RETURN", "ENDFUNCTION", "CALL", "ARRAY",
  "AND", "OR", "NOT", "DIV", "MOD", "BYREF", "BYVAL",
];

const TYPES = ["INTEGER", "REAL", "STRING", "CHAR", "BOOLEAN"];

const LITERALS = ["TRUE", "FALSE"];

/** The standard library the interpreter implements. */
const BUILTINS = [
  "LENGTH", "UCASE", "LCASE", "SUBSTRING", "MID", "LEFT", "RIGHT",
  "INT", "ROUND", "ABS", "SQRT",
  "NUM_TO_STRING", "STR", "STRING_TO_NUM", "VAL", "ASC", "CHR",
];

/** Minimal shape of the Monaco namespace this module touches. */
interface MonacoLike {
  languages: {
    getLanguages(): { id: string }[];
    register(l: { id: string }): void;
    setMonarchTokensProvider(id: string, def: unknown): void;
    setLanguageConfiguration(id: string, config: unknown): void;
  };
}

/**
 * Teach Monaco the language. Safe to call more than once — registering the
 * same id twice stacks duplicate tokenisers.
 */
export function registerPseudocodeLanguage(monaco: MonacoLike) {
  const id = PSEUDOCODE_LANGUAGE_ID;
  if (monaco.languages.getLanguages().some((l) => l.id === id)) return;

  monaco.languages.register({ id });

  monaco.languages.setLanguageConfiguration(id, {
    comments: { lineComment: "//" },
    brackets: [
      ["(", ")"],
      ["[", "]"],
    ],
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: '"', close: '"' },
    ],
    // Indent after anything that opens a block, outdent on what closes it.
    indentationRules: {
      increaseIndentPattern:
        /^\s*(IF\b.*\bTHEN\b|ELSE\b|FOR\b|WHILE\b.*\bDO\b|REPEAT\b|CASE\s+OF\b|PROCEDURE\b|FUNCTION\b|OTHERWISE\b)\s*$/i,
      decreaseIndentPattern:
        /^\s*(ENDIF|ELSE|NEXT\b|ENDWHILE|UNTIL\b|ENDCASE|ENDPROCEDURE|ENDFUNCTION)\b/i,
    },
  });

  monaco.languages.setMonarchTokensProvider(id, {
    // The exam writes keywords in capitals; accept either so a student's
    // lowercase draft still reads, and the interpreter is case-insensitive.
    ignoreCase: true,
    keywords: KEYWORDS,
    typeKeywords: TYPES,
    literals: LITERALS,
    builtins: BUILTINS,

    tokenizer: {
      root: [
        [/\/\/.*$/, "comment"],
        [
          /[A-Za-z_][A-Za-z0-9_]*/,
          {
            cases: {
              "@literals": "constant",
              "@typeKeywords": "type",
              "@keywords": "keyword",
              "@builtins": "predefined",
              "@default": "identifier",
            },
          },
        ],
        [/\d+\.\d+/, "number.float"],
        [/\d+/, "number"],
        [/"/, { token: "string.quote", next: "@string" }],
        [/'[^']*'/, "string"],
        // The assignment arrow, in both spellings the papers use.
        [/<-|←/, "keyword.operator"],
        [/<>|<=|>=|[=<>+\-*/^]/, "operator"],
        [/[[\]()]/, "@brackets"],
        [/[,:]/, "delimiter"],
      ],
      string: [
        [/[^"]+/, "string"],
        [/"/, { token: "string.quote", next: "@pop" }],
      ],
    },
  });
}

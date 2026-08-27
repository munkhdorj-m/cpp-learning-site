"use client";

import {
  DEFAULT_CODE_THEME,
  isCodeTheme,
  type CodeThemeKey,
} from "@/lib/shiki";
import { loadMonacoTheme, monacoThemeName } from "@/lib/monaco-themes";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { useEffect, useState, useRef } from "react";
import type { Monaco } from "@monaco-editor/react";

import {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  type LanguageId,
} from "@/lib/languages";
import { COMPLETIONS, hoverDocFor } from "@/lib/editor-completions";
import { registerPseudocodeLanguage } from "@/lib/cambridge/pseudocode-monarch";

const MonacoEditor = dynamic(
  async () => {
    const mod = await import("@monaco-editor/react");
    // Serve the editor from our own origin. Left alone, @monaco-editor/loader
    // fetches it from cdn.jsdelivr.net, so a school network that blocks the
    // CDN leaves the student staring at the loading dots on the one page that
    // is meant to be the IDE. scripts/copy-monaco.mjs puts the files here.
    //
    // Configured inside the dynamic import, not at module scope: importing
    // `loader` statically would pull @monaco-editor/react into the main bundle
    // and undo the code-splitting. This still runs before the Editor mounts,
    // which is when the loader actually initialises.
    mod.loader.config({ paths: { vs: "/monaco/vs" } });
    return mod.default;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm">
        ...
      </div>
    ),
  },
);

/**
 * Providers are global to the Monaco instance, not to this component, so they
 * are registered exactly once. Registering per mount would stack duplicates
 * and every suggestion would appear two, three, four times.
 *
 * The locale is read through a module-level box rather than captured in the
 * closure, because the provider outlives any single render — capturing it
 * would freeze the suggestions in whatever language the first editor mounted
 * with, even after the student switches to English.
 */
let providersRegistered = false;
const activeLocale = { current: "mn" as "mn" | "en" };

// The slice of Monaco's model API these two providers actually touch, declared
// here rather than imported from "monaco-editor". That package is only an
// auto-installed peer of @monaco-editor/react and is not in our package.json,
// so importing its types would tie compilation to npm's hoisting decisions.
interface MonacoPosition {
  lineNumber: number;
  column: number;
}
interface MonacoModel {
  getWordUntilPosition(p: MonacoPosition): {
    startColumn: number;
    endColumn: number;
  };
  getWordAtPosition(p: MonacoPosition): { word: string } | null;
}

function registerProviders(monaco: Monaco) {
  if (providersRegistered) return;
  providersRegistered = true;

  const kindOf = (kind: string) => {
    const K = monaco.languages.CompletionItemKind;
    if (kind === "keyword") return K.Keyword;
    if (kind === "function") return K.Function;
    if (kind === "variable") return K.Variable;
    return K.Snippet;
  };

  for (const id of Object.keys(COMPLETIONS) as LanguageId[]) {
    const monacoLang = LANGUAGES[id].monaco;
    const specs = COMPLETIONS[id];

    const completionProvider = {
      provideCompletionItems: (model: MonacoModel, position: MonacoPosition) => {
        // Replace the word being typed, otherwise accepting a suggestion
        // appends to the fragment and yields "cocout".
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const locale = activeLocale.current;
        return {
          suggestions: specs.map((s) => ({
            label: s.label,
            kind: kindOf(s.kind),
            insertText: s.insert,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: s.detail[locale],
            documentation: s.doc ? { value: s.doc[locale] } : undefined,
            range,
          })),
        };
      },
    };
    monaco.languages.registerCompletionItemProvider(
      monacoLang,
      completionProvider,
    );

    const hoverProvider = {
      provideHover: (model: MonacoModel, position: MonacoPosition) => {
        const w = model.getWordAtPosition(position);
        if (!w) return null;
        const md = hoverDocFor(id, w.word, activeLocale.current);
        return md ? { contents: [{ value: md }] } : null;
      },
    };
    monaco.languages.registerHoverProvider(monacoLang, hoverProvider);
  }
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string | number;
  readOnly?: boolean;
  /** Which syntax to highlight. Defaults to C++. */
  language?: LanguageId;
  /**
   * A Monaco language id, for the syntaxes that are not a judge language —
   * `sql` and the Cambridge pseudocode grammar. Wins over `language`, and
   * turns off the C++/Python completions, which would be noise there.
   */
  monacoLanguage?: string;
}

export function CodeEditor({
  value,
  onChange,
  height = "100%",
  readOnly = false,
  language = DEFAULT_LANGUAGE,
  monacoLanguage,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(0);
  useEffect(() => setMounted(true), []);

  // Keep the box the providers read in step with the chosen language.
  useEffect(() => {
    activeLocale.current = locale === "en" ? "en" : "mn";
  }, [locale]);

  // ---- the student's chosen code theme, in the editor -------------------
  //
  // The same choice that colours the lesson snippets colours the editor. It
  // lives on <html data-code-theme>, so this watches that attribute rather
  // than duplicating the cookie/localStorage reading the picker already does.
  const [codeTheme, setCodeTheme] = useState<CodeThemeKey | null>(null);
  const [editorBg, setEditorBg] = useState<string | null>(null);
  const monacoRef = useRef<Parameters<
    NonNullable<React.ComponentProps<typeof MonacoEditor>["beforeMount"]>
  >[0] | null>(null);

  useEffect(() => {
    const read = () => {
      const v = document.documentElement.dataset.codeTheme;
      setCodeTheme(isCodeTheme(v) ? v : DEFAULT_CODE_THEME);
    };
    read();
    // The picker sets the attribute; this follows it without a page reload.
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-code-theme"],
    });
    return () => obs.disconnect();
  }, []);

  // Define and apply it whenever either the theme or Monaco itself arrives.
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco || !codeTheme) return;
    let cancelled = false;
    void (async () => {
      const data = await loadMonacoTheme(codeTheme);
      if (cancelled || !data) return;
      const name = monacoThemeName(codeTheme);
      monaco.editor.defineTheme(name, data);
      monaco.editor.setTheme(name);
      setEditorBg(data.colors["editor.background"] ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [codeTheme, ready]);

  // Until the chosen theme's chunk has loaded, fall back to the plain pair so
  // the editor is never unreadable white-on-white in the dark.
  const monacoTheme =
    mounted && resolvedTheme === "dark" ? "vs-dark" : "vs-light";

  return (
    <div
      className="h-full w-full"
      // The theme's own background, so the frame around the editor matches it
      // rather than showing the card through while Monaco loads.
      style={editorBg ? { background: editorBg } : undefined}
    >
    <MonacoEditor
      height={height}
      language={monacoLanguage ?? LANGUAGES[language].monaco}
      theme={monacoTheme}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      beforeMount={(monaco) => {
        // The pseudocode grammar has to exist before a model asks for it.
        registerPseudocodeLanguage(monaco);
        if (!monacoLanguage) registerProviders(monaco);
        monacoRef.current = monaco;
        setReady((n) => n + 1);
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "var(--font-mono), JetBrains Mono, Menlo, monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        readOnly,
        tabSize: 4,
        insertSpaces: true,
        automaticLayout: true,
        renderLineHighlight: "gutter",
        padding: { top: 12, bottom: 12 },

        // The suggest widget is taller than the editor's card, which is
        // overflow-hidden. Without this it gets clipped to a sliver.
        fixedOverflowWidgets: true,

        quickSuggestions: { other: true, comments: false, strings: false },
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: "currentDocument",
        // Tab accepts, Enter does not. A beginner presses Enter meaning
        // "new line" and would otherwise keep accepting a suggestion by
        // accident, which reads as the editor typing on its own.
        acceptSuggestionOnEnter: "off",
        tabCompletion: "on",
        suggestSelection: "first",
        parameterHints: { enabled: true },
        bracketPairColorization: { enabled: true },
      }}
    />
    </div>
  );
}

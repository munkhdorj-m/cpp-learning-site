"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  type LanguageId,
} from "@/lib/languages";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm">
      ...
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string | number;
  readOnly?: boolean;
  /** Which syntax to highlight. Defaults to C++. */
  language?: LanguageId;
}

export function CodeEditor({
  value,
  onChange,
  height = "100%",
  readOnly = false,
  language = DEFAULT_LANGUAGE,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const monacoTheme =
    mounted && resolvedTheme === "dark" ? "vs-dark" : "vs-light";

  return (
    <MonacoEditor
      height={height}
      language={LANGUAGES[language].monaco}
      theme={monacoTheme}
      value={value}
      onChange={(v) => onChange(v ?? "")}
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
      }}
    />
  );
}

"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm">
      ...
    </div>
  ),
});

export const STARTER_CPP = `#include <bits/stdc++.h>
using namespace std;

int main() {

    return 0;
}
`;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string | number;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  height = "100%",
  readOnly = false,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const monacoTheme =
    mounted && resolvedTheme === "dark" ? "vs-dark" : "vs-light";

  return (
    <MonacoEditor
      height={height}
      language="cpp"
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

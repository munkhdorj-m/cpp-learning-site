"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  tokenize,
  TOKEN_CLASS,
  type HighlightLang,
  type Token,
} from "@/lib/highlight";

/** Split the token stream into lines so a gutter can be drawn beside them. */
function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokens) {
    const parts = token.text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind: token.kind });
    });
  }
  // A trailing newline should not draw an extra empty line.
  if (lines.length > 1 && lines[lines.length - 1].length === 0) lines.pop();
  return lines;
}

export function CodeBlock({
  code,
  lang,
  filename,
  /** Line numbers and a copy button — for full examples, not one-liners. */
  numbered = false,
  className,
}: {
  code: string;
  lang: HighlightLang;
  filename?: string;
  numbered?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => toLines(tokenize(code, lang)), [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked — the code is still selectable by hand.
    }
  };

  const gutterWidth = String(lines.length).length;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-primary/15 bg-[var(--surface-code)]",
        className,
      )}
    >
      {(filename || numbered) && (
        <div className="flex items-center gap-1.5 border-b border-primary/15 bg-black/25 px-3 py-1.5">
          {filename && (
            <>
              <span className="h-2 w-2 rounded-full bg-neon-pink/70" />
              <span className="h-2 w-2 rounded-full bg-neon-amber/70" />
              <span className="h-2 w-2 rounded-full bg-neon-lime/70" />
              <span className="ml-1 font-code text-[10px] tracking-widest text-muted-foreground">
                {filename}
              </span>
            </>
          )}
          <button
            onClick={copy}
            aria-label="Copy code"
            className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-code text-[10px] tracking-widest text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-neon-lime" />
                COPIED
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                COPY
              </>
            )}
          </button>
        </div>
      )}

      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
        <code>
          {lines.map((tokens, i) => (
            <span key={i} className="block">
              {numbered && (
                <span
                  aria-hidden
                  className="mr-3 inline-block select-none text-right text-amber-dim/60"
                  style={{ width: `${gutterWidth}ch` }}
                >
                  {i + 1}
                </span>
              )}
              {tokens.map((t, j) => (
                <span key={j} className={TOKEN_CLASS[t.kind]}>
                  {t.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

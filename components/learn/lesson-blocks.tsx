"use client";

import { Lightbulb, AlertTriangle } from "lucide-react";

import type { Deck } from "@/lib/lesson-slides";
import { cn } from "@/lib/utils";
import { Prose } from "./prose";
import { Figure } from "./figure";
import { CodeBlock } from "./code-block";
import { SlideDeck } from "./slide-deck";

/** A lesson section, already resolved to one language of the site. */
export interface ViewSection {
  id: string;
  title: string;
  cppOnly?: boolean;
  blocks: ViewBlock[];
}

export type ViewBlock = (
  | { kind: "text"; text: string }
  | {
      kind: "code";
      cpp: string;
      py?: string;
      output?: string;
      caption?: string;
      /** Shiki output for each language, highlighted on the server. */
      cppHtml?: string | null;
      pyHtml?: string | null;
    }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "note"; tone: "tip" | "warn"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "image"; image: string; caption?: string }
  /** The deck arrives resolved: only this lesson's is sent to the browser. */
  | { kind: "slides"; deck: Deck }
) & {
  /** Mirrors Block.only in lib/lessons.ts — see the note there. */
  only?: "cpp" | "py";
};

function SectionCode({
  block,
  python,
  en,
}: {
  block: Extract<ViewBlock, { kind: "code" }>;
  python: boolean;
  en: boolean;
}) {
  // Fall back to the C++ snippet when the idea has no Python spelling, and
  // say so — silently showing C++ to a Python student is what confused them
  // the last time round.
  const usePy = python && !!block.py;
  const code = usePy ? block.py! : block.cpp;
  const html = usePy ? block.pyHtml : block.cppHtml;
  const fallback = python && !block.py;

  return (
    <div className="space-y-1.5">
      {block.caption && (
        <p className="text-sm text-muted-foreground">
          <Prose text={block.caption} />
        </p>
      )}
      <div className="overflow-hidden rounded-lg border border-primary/15">
        {fallback && (
          <div className="border-b border-primary/15 bg-black/25 px-3 py-1 font-code text-[10px] tracking-widest text-muted-foreground">
            {en ? "C++ ONLY" : "ЗӨВХӨН C++"}
          </div>
        )}
        <CodeBlock
          code={code}
          html={html}
          lang={usePy ? "python" : "cpp"}
          className="rounded-none border-0"
        />
        {block.output && (
          <div className="border-t border-neon-lime/20 bg-neon-lime/[0.06]">
            <div className="px-3 pt-1.5 font-code text-[10px] tracking-widest text-neon-lime">
              {en ? "> what you see" : "> гарах хариу"}
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap px-3 pb-2 pt-1 font-mono text-xs leading-relaxed text-neon-lime">
              {block.output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function LessonBlocks({
  blocks,
  python,
  en,
}: {
  blocks: ViewBlock[];
  python: boolean;
  en: boolean;
}) {
  // A block marked `only` belongs to one language. Filtered here rather than
  // at the section level so a mostly-universal section can still say two
  // different things about the one detail that differs.
  const visible = blocks.filter(
    (b) => !b.only || b.only === (python ? "py" : "cpp"),
  );

  return (
    <div className="space-y-3">
      {visible.map((b, i) => {
        switch (b.kind) {
          case "text":
            return (
              <p
                key={i}
                className="text-[15px] leading-relaxed text-muted-foreground"
              >
                <Prose text={b.text} />
              </p>
            );

          case "code":
            return <SectionCode key={i} block={b} python={python} en={en} />;

          case "image":
            return <Figure key={i} id={b.image} caption={b.caption} />;

          case "slides":
            return <SlideDeck key={i} deck={b.deck} en={en} />;

          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={i} className="space-y-1.5">
                {b.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-[15px] leading-relaxed text-muted-foreground"
                  >
                    {b.ordered ? (
                      <span className="mt-px font-code text-xs font-bold text-primary tabular-nums">
                        {j + 1}.
                      </span>
                    ) : (
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <span>
                      <Prose text={item} />
                    </span>
                  </li>
                ))}
              </Tag>
            );
          }

          case "note":
            return (
              <p
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-3 text-sm",
                  b.tone === "warn"
                    ? "border-neon-amber/30 bg-neon-amber/[0.06]"
                    : "border-primary/25 bg-primary/[0.06]",
                )}
              >
                {b.tone === "warn" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neon-amber" />
                ) : (
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                )}
                <span>
                  <Prose text={b.text} />
                </span>
              </p>
            );

          case "table":
            return (
              <div
                key={i}
                className="overflow-x-auto rounded-lg border border-primary/15"
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-primary/15 bg-primary/[0.06]">
                      {b.head.map((h) => (
                        <th
                          key={h}
                          className="hud-label whitespace-nowrap px-3 py-2 text-[10px]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/10">
                    {b.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className="px-3 py-2 align-top text-muted-foreground"
                          >
                            <Prose text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}

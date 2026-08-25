"use client";

import { useState } from "react";
import { Play, RotateCcw, Terminal, AlertTriangle, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/code-editor";
import { runPseudocode, type RunResult } from "@/lib/cambridge/pseudocode";
import { PSEUDOCODE_LANGUAGE_ID } from "@/lib/cambridge/pseudocode-monarch";
import {
  PSEUDOCODE_EXAMPLES,
  type PseudocodeExample,
} from "@/lib/cambridge/pseudocode-examples";

/**
 * A full page for writing and running pseudocode.
 *
 * The small runner inside a practice topic is for checking one idea. This is
 * for writing a whole answer the way the exam asks for it — a proper editor,
 * room for the program, and somewhere to put the INPUT lines.
 *
 * It all happens in the browser. No judge, no account, no network: a class of
 * thirty pressing Run at the same moment costs nothing, and it works on the
 * school connection.
 */

/** Split the input box into the lines INPUT will read. */
function inputLines(stdin: string): string[] {
  const lines = stdin.split(/\r?\n/);
  // A trailing newline is how a text box ends, not an empty line of data.
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function PseudocodeWorkbench() {
  const [code, setCode] = useState(PSEUDOCODE_EXAMPLES[0].code);
  const [stdin, setStdin] = useState(PSEUDOCODE_EXAMPLES[0].stdin ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [loaded, setLoaded] = useState(PSEUDOCODE_EXAMPLES[0].name);

  const run = () => setResult(runPseudocode(code, inputLines(stdin)));

  const load = (ex: PseudocodeExample) => {
    setCode(ex.code);
    setStdin(ex.stdin ?? "");
    setResult(null);
    setLoaded(ex.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">{"//"}</span>
            CAMBRIDGE.PSEUDOCODE
          </div>
          <h1 className="text-2xl font-bold">Pseudocode playground</h1>
          <p className="text-sm text-muted-foreground">
            The pseudocode the 0478 and 9618 papers are written in — but it
            runs. Write it, press Run, and see whether it does what you meant.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCode("");
              setStdin("");
              setResult(null);
              setLoaded("");
            }}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
          <Button onClick={run} size="sm" className="font-code">
            <Play className="mr-1.5 h-4 w-4" />
            Run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* The card is a grid item, so on a wide screen it stretches to the
            height of the taller right-hand column; flex-1 makes the editor
            fill that instead of leaving a band of empty card beneath it.
            py-0 lets it sit flush to the border. */}
        <Card className="overflow-hidden py-0 lg:col-span-2">
          <div className="h-[520px] lg:h-auto lg:min-h-[520px] lg:flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              monacoLanguage={PSEUDOCODE_LANGUAGE_ID}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {PSEUDOCODE_EXAMPLES.map((ex) => (
                  <li key={ex.name}>
                    <button
                      type="button"
                      onClick={() => load(ex)}
                      className={`hud-hover w-full truncate border border-transparent px-2 py-1 text-left font-code text-xs ${
                        ex.name === loaded
                          ? "border-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {ex.name}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                INPUT
                <span className="ml-2 font-code text-[11px] font-normal text-muted-foreground">
                  one value per line
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                // The heading above is a card title, not a <label>, so the box
                // would otherwise reach a screen reader unnamed.
                aria-label="INPUT lines, one value per line"
                className="min-h-[90px] font-mono text-sm"
                spellCheck={false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Terminal className="h-4 w-4" />
                OUTPUT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <pre className="min-h-[110px] whitespace-pre-wrap break-words rounded border border-primary/15 bg-[var(--surface-code)] p-2.5 font-mono text-sm text-neon-lime">
                {result ? (
                  result.output.join("\n") || (
                    <span className="text-muted-foreground/60">
                      (the program printed nothing)
                    </span>
                  )
                ) : (
                  <span className="text-muted-foreground/60">
                    {"// press Run"}
                  </span>
                )}
              </pre>

              {result?.error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-2.5 text-sm text-destructive"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {result.errorLine !== undefined && (
                      <span className="font-code">
                        Line {result.errorLine}:{" "}
                      </span>
                    )}
                    {result.error}
                  </span>
                </p>
              )}

              {result && !result.error && result.unusedInput > 0 && (
                <p className="text-xs text-muted-foreground">
                  {result.unusedInput} input line
                  {result.unusedInput === 1 ? "" : "s"} were never read.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

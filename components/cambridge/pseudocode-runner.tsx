"use client";

import { useState } from "react";
import { Play, RotateCcw, Terminal, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { runPseudocode } from "@/lib/cambridge/pseudocode";
import {
  PSEUDOCODE_EXAMPLES,
  type PseudocodeExample,
} from "@/lib/cambridge/pseudocode-examples";

/**
 * Pseudocode that actually runs.
 *
 * The syllabus is examined in pseudocode, so students write a great deal of it
 * and never once see it execute — every mistake has to be caught by a teacher
 * reading the page. Here they press Run and the machine answers.
 *
 * Everything happens in the browser: no judge, no account, no network. That
 * matters because this is the one exercise on the site a visitor can use
 * before they have signed in, and because a class of thirty pressing Run at
 * once should cost nothing.
 */

export function PseudocodeRunner() {
  const [code, setCode] = useState(PSEUDOCODE_EXAMPLES[0].code);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<ReturnType<typeof runPseudocode> | null>(
    null,
  );

  const run = () => {
    const lines = stdin.split("\n").filter((l, i, a) => l !== "" || i < a.length - 1);
    setResult(runPseudocode(code, lines));
  };

  const load = (ex: PseudocodeExample) => {
    setCode(ex.code);
    setStdin(ex.stdin ?? "");
    setResult(null);
  };

  return (
    <section className="space-y-2">
      <h2 className="hud-label flex items-center gap-2">
        <Terminal className="h-3.5 w-3.5 text-primary" />
        RUN THE PSEUDOCODE
        <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
      </h2>

      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Write the pseudocode the syllabus uses and press Run. Assignment is
          the arrow — type <code className="font-code">{"<-"}</code> and it
          works the same as <code className="font-code">←</code>.
        </p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {PSEUDOCODE_EXAMPLES.map((ex) => (
            <button
              key={ex.name}
              type="button"
              onClick={() => load(ex)}
              className="hud-hover border border-primary/20 px-2 py-1 font-code text-xs text-muted-foreground"
            >
              {ex.name}
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="pseudo-code" className="hud-label">
              PROGRAM
            </label>
            <Textarea
              id="pseudo-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-[280px] font-code text-[13px] leading-relaxed"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="pseudo-input" className="hud-label">
                INPUT — ONE VALUE PER LINE
              </label>
              <Textarea
                id="pseudo-input"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                spellCheck={false}
                placeholder="Only needed if the program uses INPUT"
                className="min-h-[86px] font-code text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="hud-label">OUTPUT</span>
              <pre className="min-h-[150px] whitespace-pre-wrap break-words border border-primary/15 bg-[var(--surface-code)] p-2.5 font-code text-[13px] leading-relaxed">
                {result?.output.length ? result.output.join("\n") : null}
                {result && !result.output.length && !result.error && (
                  <span className="text-muted-foreground/60">
                    (the program printed nothing)
                  </span>
                )}
                {!result && (
                  <span className="text-muted-foreground/60">
                    Press Run to see what it does
                  </span>
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* A glyph first, colour second. */}
        {result?.error && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 border border-destructive/40 bg-destructive/10 p-2.5 text-sm"
            style={{ color: "var(--signal-no)" }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              {result.errorLine !== undefined && (
                <strong className="font-code">Line {result.errorLine}: </strong>
              )}
              {result.error}
            </span>
          </p>
        )}

        {result && !result.error && result.unusedInput > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {result.unusedInput} input line(s) were never read — the program may
            be asking for fewer values than you gave it.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={run} size="sm" className="font-code">
            <Play className="mr-1.5 h-4 w-4" />
            Run
          </Button>
          <Button
            onClick={() => load(PSEUDOCODE_EXAMPLES[0])}
            size="sm"
            variant="outline"
            className="font-code"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </section>
  );
}

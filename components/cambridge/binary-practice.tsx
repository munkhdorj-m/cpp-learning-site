"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "den2bin" | "bin2den" | "den2hex" | "hex2den";

const MODES: { id: Mode; label: string }[] = [
  { id: "den2bin", label: "Denary → Binary" },
  { id: "bin2den", label: "Binary → Denary" },
  { id: "den2hex", label: "Denary → Hex" },
  { id: "hex2den", label: "Hex → Denary" },
];

function newQuestion(mode: Mode) {
  const n = Math.floor(Math.random() * 255) + 1;
  switch (mode) {
    case "den2bin":
      return { prompt: String(n), answer: n.toString(2).padStart(8, "0"), hint: "8 bits" };
    case "bin2den":
      return { prompt: n.toString(2).padStart(8, "0"), answer: String(n), hint: "a denary number" };
    case "den2hex":
      return { prompt: String(n), answer: n.toString(16).toUpperCase(), hint: "hex digits" };
    default:
      return { prompt: n.toString(16).toUpperCase(), answer: String(n), hint: "a denary number" };
  }
}

/** Endless self-marking conversion practice — the most drilled IGCSE skill. */
export function BinaryPractice() {
  const [mode, setMode] = useState<Mode>("den2bin");
  const [q, setQ] = useState(() => newQuestion("den2bin"));
  const [value, setValue] = useState("");
  const [state, setState] = useState<"asking" | "right" | "wrong">("asking");
  const [score, setScore] = useState({ right: 0, total: 0 });

  const next = useCallback(
    (m: Mode = mode) => {
      setQ(newQuestion(m));
      setValue("");
      setState("asking");
    },
    [mode],
  );

  useEffect(() => {
    next(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const check = () => {
    if (state !== "asking" || !value.trim()) return;
    // Leading zeros and case should not matter.
    const given = value.trim().toUpperCase().replace(/^0+(?=.)/, "");
    const want = q.answer.toUpperCase().replace(/^0+(?=.)/, "");
    const ok = given === want;
    setState(ok ? "right" : "wrong");
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">PRACTICE</span>
        <span className="ml-auto font-code text-xs text-muted-foreground">
          {score.right}/{score.total} correct
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-lg border px-2.5 py-1 font-code text-xs transition-colors",
              mode === m.id
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="font-mono text-2xl font-bold text-primary">
          {q.prompt}
        </div>
        <span className="text-muted-foreground">→</span>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (state === "asking" ? check() : next());
          }}
          placeholder={q.hint}
          disabled={state !== "asking"}
          className="w-40 font-mono"
          aria-label="Your answer"
        />
        {state === "asking" ? (
          <Button size="sm" onClick={check} className="font-code">
            Check
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => next()} className="font-code">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Next
          </Button>
        )}
      </div>

      {state === "right" && (
        <p className="flex items-center gap-1.5 text-sm text-neon-lime">
          <Check className="h-4 w-4" /> Correct.
        </p>
      )}
      {state === "wrong" && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <X className="h-4 w-4" /> Not quite — the answer is{" "}
          <code className="font-mono font-bold">{q.answer}</code>
        </p>
      )}
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Calculating the size of an image or a sound file from its settings. It is a
 * two-mark question in almost every paper, and it is pure formula practice —
 * exactly the sort of thing that only sticks by doing it repeatedly.
 *
 * Answers are asked for in kibibytes, because that is where students actually
 * lose the marks: dividing by 8 and then by 1024, in that order.
 */
type Kind = "image" | "sound";

interface Question {
  kind: Kind;
  facts: { label: string; value: string }[];
  /** Total size in bits. */
  bits: number;
  formula: string;
}

const randOf = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

function newQuestion(kind: Kind): Question {
  if (kind === "image") {
    const width = randOf([100, 200, 256, 400, 512, 800, 1024]);
    const height = randOf([100, 200, 256, 400, 512, 600, 768]);
    const depth = randOf([1, 4, 8, 16, 24]);
    return {
      kind,
      facts: [
        { label: "Width", value: `${width} pixels` },
        { label: "Height", value: `${height} pixels` },
        { label: "Colour depth", value: `${depth} bits per pixel` },
      ],
      bits: width * height * depth,
      formula: `width × height × colour depth = ${width} × ${height} × ${depth} = ${(
        width *
        height *
        depth
      ).toLocaleString()} bits`,
    };
  }

  const rate = randOf([8000, 11025, 22050, 44100, 48000]);
  const res = randOf([8, 16, 24]);
  const secs = randOf([10, 15, 30, 60, 120]);
  const channels = randOf([1, 2]);
  return {
    kind,
    facts: [
      { label: "Sample rate", value: `${rate.toLocaleString()} Hz` },
      { label: "Sample resolution", value: `${res} bits` },
      { label: "Length", value: `${secs} seconds` },
      { label: "Channels", value: channels === 1 ? "1 (mono)" : "2 (stereo)" },
    ],
    bits: rate * res * secs * channels,
    formula: `sample rate × resolution × seconds × channels = ${rate.toLocaleString()} × ${res} × ${secs} × ${channels} = ${(
      rate *
      res *
      secs *
      channels
    ).toLocaleString()} bits`,
  };
}

/** Close enough: students round, and the mark scheme allows it. */
function near(given: number, want: number) {
  return Math.abs(given - want) <= Math.max(0.5, want * 0.01);
}

export function FileSizePractice() {
  const [kind, setKind] = useState<Kind>("image");
  const [q, setQ] = useState(() => newQuestion("image"));
  const [value, setValue] = useState("");
  const [state, setState] = useState<"asking" | "right" | "wrong">("asking");
  const [score, setScore] = useState({ right: 0, total: 0 });

  const kib = q.bits / 8 / 1024;

  const next = useCallback((k: Kind) => {
    setQ(newQuestion(k));
    setValue("");
    setState("asking");
  }, []);

  const choose = (k: Kind) => {
    setKind(k);
    next(k);
  };

  const check = () => {
    if (state !== "asking") return;
    const given = Number(value.trim().replace(/,/g, ""));
    if (!Number.isFinite(given) || !value.trim()) return;
    const ok = near(given, kib);
    setState(ok ? "right" : "wrong");
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">FILE SIZE</span>
        <span className="ml-auto font-code text-xs text-muted-foreground">
          {score.right}/{score.total} correct
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {(["image", "sound"] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => choose(k)}
            className={cn(
              "rounded-lg border px-2.5 py-1 font-code text-xs capitalize transition-colors",
              kind === k
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {k} file
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-primary/15 bg-background/40 p-3 sm:grid-cols-4">
        {q.facts.map((f) => (
          <div key={f.label}>
            <dt className="hud-label text-[10px]">{f.label}</dt>
            <dd className="font-code text-sm text-primary">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-muted-foreground" htmlFor="fsize">
          Size in kibibytes (KiB):
        </label>
        <Input
          id="fsize"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") state === "asking" ? check() : next(kind);
          }}
          placeholder="e.g. 150"
          disabled={state !== "asking"}
          className="w-32 font-mono"
          inputMode="decimal"
        />
        {state === "asking" ? (
          <Button size="sm" onClick={check} className="font-code">
            Check
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => next(kind)}
            className="font-code"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Next
          </Button>
        )}
      </div>

      {state !== "asking" && (
        <div
          className={cn(
            "space-y-1 rounded-lg border p-3 text-sm",
            state === "right"
              ? "border-neon-lime/40 bg-neon-lime/[0.08]"
              : "border-destructive/40 bg-destructive/[0.08]",
          )}
        >
          <p
            className={cn(
              "flex items-center gap-1.5 font-medium",
              state === "right" ? "text-neon-lime" : "text-destructive",
            )}
          >
            {state === "right" ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {kib.toFixed(kib < 10 ? 2 : 0)} KiB
          </p>
          <p className="font-mono text-xs text-muted-foreground">{q.formula}</p>
          <p className="font-mono text-xs text-muted-foreground">
            ÷ 8 = {(q.bits / 8).toLocaleString()} bytes ÷ 1024 ={" "}
            {kib.toFixed(kib < 10 ? 2 : 0)} KiB
          </p>
        </div>
      )}
    </div>
  );
}

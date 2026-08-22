"use client";

import { useCallback, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Encryption you have to actually perform.
 *
 * Caesar shifts and XOR against a key are both examined by asking a student
 * to produce the output, not to describe the method — so reading about them
 * is close to useless. Both directions are asked, because decrypting is where
 * the off-by-one mistakes show up.
 */
type Mode = "caesar" | "xor";

const WORDS = [
  "COMPUTER",
  "NETWORK",
  "PACKET",
  "BINARY",
  "SERVER",
  "MEMORY",
  "CIPHER",
  "SECRET",
  "DATA",
  "ROUTER",
];

const A = "A".charCodeAt(0);

function caesar(text: string, shift: number): string {
  return text
    .split("")
    .map((ch) => {
      const i = ch.charCodeAt(0) - A;
      if (i < 0 || i > 25) return ch;
      return String.fromCharCode(A + (((i + shift) % 26) + 26) % 26);
    })
    .join("");
}

const bin8 = (n: number) => n.toString(2).padStart(8, "0");
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

interface Question {
  prompt: string;
  ask: string;
  answer: string;
  working: string;
}

function newQuestion(mode: Mode): Question {
  if (mode === "caesar") {
    const word = pick(WORDS);
    const shift = 1 + Math.floor(Math.random() * 25);
    const encrypting = Math.random() < 0.5;

    if (encrypting) {
      return {
        prompt: word,
        ask: `Encrypt with a shift of ${shift}`,
        answer: caesar(word, shift),
        working: `Each letter moves ${shift} place${shift === 1 ? "" : "s"} forward, wrapping round from Z to A.`,
      };
    }
    const cipher = caesar(word, shift);
    return {
      prompt: cipher,
      ask: `Decrypt — it was encrypted with a shift of ${shift}`,
      answer: word,
      working: `To decrypt you move each letter ${shift} place${shift === 1 ? "" : "s"} back.`,
    };
  }

  const data = Math.floor(Math.random() * 256);
  const key = Math.floor(Math.random() * 256);
  return {
    prompt: `${bin8(data)}  XOR  ${bin8(key)}`,
    ask: "Give the 8-bit result",
    answer: bin8(data ^ key),
    working:
      "XOR gives 1 only where the two bits are different, so compare the columns one at a time.",
  };
}

export function CipherPractice() {
  const [mode, setMode] = useState<Mode>("caesar");
  const [q, setQ] = useState(() => newQuestion("caesar"));
  const [value, setValue] = useState("");
  const [state, setState] = useState<"asking" | "right" | "wrong">("asking");
  const [score, setScore] = useState({ right: 0, total: 0 });

  const next = useCallback((m: Mode) => {
    setQ(newQuestion(m));
    setValue("");
    setState("asking");
  }, []);

  const choose = (m: Mode) => {
    setMode(m);
    next(m);
  };

  const check = () => {
    if (state !== "asking" || !value.trim()) return;
    const given = value.trim().toUpperCase().replace(/\s+/g, "");
    const ok = given === q.answer.toUpperCase();
    setState(ok ? "right" : "wrong");
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">ENCRYPTION</span>
        <span className="ml-auto font-code text-xs text-muted-foreground">
          {score.right}/{score.total} correct
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {(
          [
            { id: "caesar" as Mode, label: "Caesar cipher" },
            { id: "xor" as Mode, label: "XOR with a key" },
          ]
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => choose(m.id)}
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

      <p className="text-sm text-muted-foreground">{q.ask}</p>

      <div className="break-all font-mono text-lg font-bold text-primary sm:text-xl">
        {q.prompt}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") state === "asking" ? check() : next(mode);
          }}
          placeholder={mode === "caesar" ? "letters" : "8 bits"}
          disabled={state !== "asking"}
          className="w-56 font-mono uppercase"
          aria-label="Your answer"
        />
        {state === "asking" ? (
          <Button size="sm" onClick={check} className="font-code">
            Check
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => next(mode)}
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
              "flex items-center gap-1.5 font-mono font-bold",
              state === "right" ? "text-neon-lime" : "text-destructive",
            )}
          >
            {state === "right" ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {q.answer}
          </p>
          <p className="text-xs text-muted-foreground">{q.working}</p>
        </div>
      )}
    </div>
  );
}

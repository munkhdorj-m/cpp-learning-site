"use client";

import { useEffect, useState } from "react";

import { TypewriterText } from "@/components/animations/typewriter-text";

/**
 * Both languages the course teaches. The hero cycles between them, because a
 * home page that only ever types C++ reads as a C++-only site — students pick
 * either one, and most lessons are written in both.
 */
const PROGRAMS = [
  {
    label: "C++",
    filename: "main.cpp",
    code: [
      "#include <iostream>",
      "using namespace std;",
      "",
      "int main() {",
      '  cout << "Hello, World!";',
      "  return 0;",
      "}",
    ],
    output: ["> ./a.out", "Hello, World!"],
  },
  {
    label: "Python",
    filename: "main.py",
    code: ['print("Hello, World!")'],
    output: ["> python main.py", "Hello, World!"],
  },
];

const START_DELAY = 300;
const SPEED = 35;
const LINE_PAUSE = 250;
const OUT_SPEED = 30;
const OUT_LINE_PAUSE = 100;
/** How long the finished program stays up before the other language starts. */
const HOLD = 2600;

/**
 * Neon terminal hero: types out a program and shows what it prints.
 * Sci-fi HUD styling — glowing panel with a mono status bar.
 */
export function TypewriterHero() {
  const [index, setIndex] = useState(0);
  const program = PROGRAMS[index];

  const typingMs =
    program.code.join("").length * SPEED + LINE_PAUSE * program.code.length;
  const outputStart = START_DELAY + typingMs + 600;
  const outputMs =
    program.output.join("").length * OUT_SPEED +
    OUT_LINE_PAUSE * program.output.length;

  useEffect(() => {
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % PROGRAMS.length),
      outputStart + outputMs + HOLD,
    );
    return () => clearTimeout(t);
  }, [index, outputStart, outputMs]);

  return (
    <div className="hud-panel hud-corners mx-auto max-w-md overflow-hidden rounded-2xl backdrop-blur-sm">
      {/* Status bar */}
      <div className="flex items-center gap-1.5 border-b border-primary/15 bg-black/20 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-pink/80 shadow-[0_0_8px_var(--neon-pink)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-amber/80 shadow-[0_0_8px_var(--neon-amber)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-lime/80 shadow-[0_0_8px_var(--neon-lime)]" />
        <span className="flex-1 text-center font-code text-[10px] tracking-widest text-muted-foreground">
          {program.filename}
        </span>
        <span className="font-code text-[10px] text-primary/70">
          {program.label}
        </span>
      </div>

      {/* Code area. Held at the height of the longest program so the page does
          not jump when a seven-line C++ file is replaced by one line of Python. */}
      <div className="min-h-[160px] px-4 py-3 text-left">
        <TypewriterText
          key={`code-${index}`}
          lines={program.code}
          startDelay={START_DELAY}
          speed={SPEED}
          linePause={LINE_PAUSE}
          className="text-primary text-glow-soft"
        />
      </div>

      {/* Output — appears after typing. Also held at its finished height:
          the panel now cycles, so an unpinned box would bounce every few
          seconds instead of just once on load. */}
      <div className="min-h-[49px] border-t border-primary/15 bg-neon-lime/[0.06] px-4 py-2 text-left">
        <TypewriterText
          key={`out-${index}`}
          lines={program.output}
          startDelay={outputStart}
          speed={OUT_SPEED}
          linePause={OUT_LINE_PAUSE}
          className="text-neon-lime text-glow-soft text-xs"
        />
      </div>
    </div>
  );
}

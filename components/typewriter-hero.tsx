"use client";

import { TypewriterText } from "@/components/animations/typewriter-text";

const CPP_CODE = [
  "#include <iostream>",
  "using namespace std;",
  "",
  "int main() {",
  '  cout << "Hello, World!";',
  "  return 0;",
  "}",
];

const OUTPUT = ["> ./a.out", "Hello, World!"];

/**
 * Neon terminal hero: types out C++ and shows compiled output.
 * Sci-fi HUD styling — glowing panel with a mono status bar.
 */
export function TypewriterHero() {
  return (
    <div className="hud-panel hud-corners mx-auto max-w-md overflow-hidden rounded-2xl backdrop-blur-sm">
      {/* Status bar */}
      <div className="flex items-center gap-1.5 border-b border-primary/15 bg-black/20 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-neon-pink/80 shadow-[0_0_8px_var(--neon-pink)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-amber/80 shadow-[0_0_8px_var(--neon-amber)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-lime/80 shadow-[0_0_8px_var(--neon-lime)]" />
        <span className="flex-1 text-center font-code text-[10px] tracking-widest text-muted-foreground">
          main.cpp
        </span>
        <span className="font-code text-[10px] text-primary/70">C++</span>
      </div>

      {/* Code area */}
      <div className="px-4 py-3 text-left">
        <TypewriterText
          lines={CPP_CODE}
          startDelay={300}
          speed={35}
          linePause={250}
          className="text-primary text-glow-soft"
        />
      </div>

      {/* Output — appears after typing */}
      <div className="border-t border-primary/15 bg-neon-lime/[0.06] px-4 py-2 text-left">
        <TypewriterText
          lines={OUTPUT}
          startDelay={
            CPP_CODE.join("").length * 35 + 250 * CPP_CODE.length + 600
          }
          speed={30}
          linePause={100}
          className="text-neon-lime text-glow-soft text-xs"
        />
      </div>
    </div>
  );
}

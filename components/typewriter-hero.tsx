"use client";

import { TypewriterText } from "@/components/animations/typewriter-text";

const CPP_CODE = [
  "#include <iostream>",
  "using namespace std;",
  "",
  "int main() {",
  '  cout << "Hello, World!" << endl;',
  "  return 0;",
  "}",
];

const OUTPUT = ["> Hello, World!"];

/**
 * Animated hero component that types out C++ code and shows its output.
 * Placed above the landing page heading.
 */
export function TypewriterHero() {
  return (
    <div className="mx-auto max-w-md rounded-xl border bg-card/80 backdrop-blur-sm overflow-hidden shadow-lg">
      {/* macOS-style title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
          main.cpp
        </span>
      </div>

      {/* Code area */}
      <div className="px-4 py-3 bg-muted/20 text-left">
        <TypewriterText
          lines={CPP_CODE}
          startDelay={300}
          speed={35}
          linePause={250}
          className="text-violet-800 dark:text-violet-300"
        />
      </div>

      {/* Output area — appears after typing is done */}
      <div className="border-t px-4 py-2 bg-emerald-50/50 dark:bg-emerald-950/30 text-left">
        <TypewriterText
          lines={OUTPUT}
          startDelay={
            CPP_CODE.join("").length * 35 + 250 * CPP_CODE.length + 600
          }
          speed={30}
          linePause={100}
          className="text-emerald-700 dark:text-emerald-400 text-xs"
        />
      </div>
    </div>
  );
}

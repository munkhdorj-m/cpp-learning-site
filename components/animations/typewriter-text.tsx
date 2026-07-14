"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  lines: string[];
  /** Delay before starting (ms) */
  startDelay?: number;
  /** Milliseconds per character */
  speed?: number;
  /** Pause between lines (ms) */
  linePause?: number;
  className?: string;
}

/**
 * Types out multiple lines of text sequentially, simulating a code editor.
 * Each line appears character by character.
 */
export function TypewriterText({
  lines,
  startDelay = 500,
  speed = 40,
  linePause = 400,
  className,
}: TypewriterTextProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  // Initial delay before starting
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  // Typewriter engine
  useEffect(() => {
    if (!started || done) return;
    if (currentLineIndex >= lines.length) {
      setDone(true);
      return;
    }

    const line = lines[currentLineIndex];
    if (currentCharIndex < line.length) {
      const t = setTimeout(() => {
        setCurrentCharIndex((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      // Line complete, move to next
      setVisibleLines((prev) => [...prev, line]);
      const t = setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
      }, linePause);
      return () => clearTimeout(t);
    }
  }, [
    started,
    done,
    currentLineIndex,
    currentCharIndex,
    lines,
    speed,
    linePause,
  ]);

  const currentLine =
    currentLineIndex < lines.length ? lines[currentLineIndex] : "";
  const isMidType =
    currentCharIndex > 0 && currentCharIndex < currentLine.length;
  const partialLine = isMidType ? currentLine.slice(0, currentCharIndex) : null;

  const fullLines = [...visibleLines, ...(partialLine ? [partialLine] : [])];

  return (
    <div className={cn("font-mono text-sm leading-relaxed", className)}>
      {fullLines.map((line, i) => (
        <div key={i} className="whitespace-pre">
          <span>{line}</span>
          {i === fullLines.length - 1 && !done && (
            <motion.span
              className="inline-block w-2 h-[1em] bg-current align-middle ml-0.5"
              animate={{ opacity: [1, 0, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                times: [0, 0.5, 1],
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface StreakFlameProps {
  className?: string;
}

/**
 * Animated flame icon using CSS.
 * Replaces the static <Flame> icon for a more alive feel.
 */
export function StreakFlame({ className }: StreakFlameProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full"
        fill="none"
        stroke="none"
      >
        {/* Main flame body */}
        <path
          d="M12 2C8.5 6.5 6 10 6 13.5C6 16.6 8.7 19 12 19C15.3 19 18 16.6 18 13.5C18 10 15.5 6.5 12 2Z"
          className="flame-main fill-orange-500 dark:fill-orange-400"
          style={{
            animation: "flame-flicker 0.15s ease-in-out infinite alternate",
            transformOrigin: "bottom center",
          }}
        />
        {/* Inner flame core */}
        <path
          d="M12 5C10 8 8.5 10.5 8.5 13C8.5 15 10 16.5 12 16.5C14 16.5 15.5 15 15.5 13C15.5 10.5 14 8 12 5Z"
          className="flame-inner fill-amber-300 dark:fill-amber-200"
          style={{
            animation:
              "flame-flicker 0.12s ease-in-out infinite alternate-reverse",
            transformOrigin: "bottom center",
          }}
        />
      </svg>
    </span>
  );
}

"use client";

import { LANGUAGE_LIST, type LanguageId } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * Segmented C++ / Python switch. Used in the playground and on a problem,
 * so a student picks the language in the same place either way.
 */
export function LanguagePicker({
  value,
  onChange,
  disabled,
  className,
}: {
  value: LanguageId;
  onChange: (next: LanguageId) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-primary/20 p-0.5",
        className,
      )}
    >
      {LANGUAGE_LIST.map((lang) => {
        const active = lang.id === value;
        return (
          <button
            key={lang.id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(lang.id)}
            className={cn(
              "rounded-md px-2.5 py-1 font-code text-xs font-semibold transition-colors disabled:opacity-50",
              active
                ? "bg-primary/15 text-primary text-glow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}

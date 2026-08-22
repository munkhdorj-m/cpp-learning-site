"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

import {
  CODE_THEMES,
  DEFAULT_CODE_THEME,
  CODE_THEME_COOKIE,
  CODE_THEME_STORAGE,
  isCodeTheme,
  type CodeThemeKey,
} from "@/lib/shiki";

/**
 * Lets a student pick the colours their code is shown in.
 *
 * The choice is written three places, each for a different reason:
 *   the <html> attribute   so every code block on the page changes at once,
 *   localStorage           so it survives a reload on this device,
 *   a cookie               so the server can set the attribute before the
 *                          first paint, which is what stops the flash of the
 *                          old theme on the next page load.
 *
 * A year is deliberate: this is a preference, not a session.
 */
export function CodeThemePicker({ className }: { className?: string }) {
  const [theme, setTheme] = useState<CodeThemeKey>(DEFAULT_CODE_THEME);

  // Read back what the document already has, so the control starts in step
  // with the page the server rendered.
  useEffect(() => {
    const current = document.documentElement.dataset.codeTheme;
    if (isCodeTheme(current)) setTheme(current);
  }, []);

  const choose = (next: string) => {
    if (!isCodeTheme(next)) return;
    setTheme(next);
    document.documentElement.dataset.codeTheme = next;
    try {
      window.localStorage.setItem(CODE_THEME_STORAGE, next);
    } catch {
      // Private browsing — the cookie below still carries it.
    }
    document.cookie = `${CODE_THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  const label = CODE_THEMES.find((t) => t.key === theme)?.label ?? "";

  return (
    <label
      className={className}
      title={`Code theme: ${label}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
    >
      <Palette className="h-3 w-3" aria-hidden />
      <span className="sr-only">Code theme</span>
      <select
        value={theme}
        onChange={(e) => choose(e.target.value)}
        className="cursor-pointer border-0 bg-transparent font-code text-[10px] tracking-widest text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
      >
        {CODE_THEMES.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
 *                          and so the Monaco editor can follow it,
 *   localStorage           so it survives a reload on this device,
 *   a cookie               so the server can set the attribute before the
 *                          first paint, which is what stops the flash of the
 *                          old theme on the next page load.
 *
 * A year is deliberate: this is a preference, not a session.
 *
 * This was a native <select>, which cannot be themed: the popup list is drawn
 * by the operating system from the element's own background, and the element
 * is transparent, so on a dark page it came out as a sheet of white with grey
 * text on it. `color-scheme: dark` fixes the arrow and the scrollbar but not
 * that. The only real fix is a popup that lives in the DOM, which is what the
 * shared Select renders — and it can then look like the rest of the site.
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

  // Twenty-six in one list is a wall. Split the way a student thinks about
  // them: the dark ones, then the light ones.
  const dark = CODE_THEMES.filter((t) => t.dark);
  const light = CODE_THEMES.filter((t) => !t.dark);

  return (
    <Select value={theme} onValueChange={(v) => v && choose(v as string)}>
      <SelectTrigger
        size="sm"
        aria-label="Code theme"
        className={[
          // The cabinet treatment: square, hairline, and the same tiny
          // letter-spaced caps as the labels it sits beside.
          "h-6 gap-1.5 rounded-none border-primary/30 bg-transparent px-1.5",
          "font-code text-[10px] tracking-widest text-muted-foreground",
          "hover:border-primary/60 hover:text-foreground",
          className ?? "",
        ].join(" ")}
      >
        <Palette className="h-3 w-3 shrink-0" aria-hidden />
        <SelectValue />
      </SelectTrigger>

      <SelectContent className={[
          // The popup takes the trigger's width by default, and the trigger is
          // a tiny chip — "Catppuccin Mocha" came out as "CATPPUCCIN MOCH".
          "max-h-72 w-auto min-w-[16rem] rounded-none border border-primary/30",
          "font-code text-[11px] tracking-wider",
        ].join(" ")}>
        <SelectGroup>
          <SelectLabel className="hud-label px-2 pt-2 text-[9px]">
            Dark
          </SelectLabel>
          {dark.map((t) => (
            <SelectItem key={t.key} value={t.key} className="rounded-none">
              {t.label.toUpperCase()}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="hud-label px-2 pt-2 text-[9px]">
            Light
          </SelectLabel>
          {light.map((t) => (
            <SelectItem key={t.key} value={t.key} className="rounded-none">
              {t.label.toUpperCase()}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

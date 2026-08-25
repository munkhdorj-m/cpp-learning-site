"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LEVELS } from "@/lib/cambridge";
import { LanguageToggle } from "@/components/language-toggle";

interface MobileNavProps {
  showAssignments: boolean;
  isTeacher?: boolean;
  /** Drives the log-in row at the foot of the panel. */
  signedIn?: boolean;
}

/**
 * Hamburger menu for phones. The desktop <NavLinks> is hidden below md,
 * so without this there is no way to reach any section on a phone.
 */
export function MobileNav({
  showAssignments,
  isTeacher,
  signedIn,
}: MobileNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Don't let the page scroll behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = [
    { href: "/learn", label: locale === "en" ? "Learn" : "Сурах" },
    { href: "/problems", label: t("problems") },
    { href: "/game", label: t("game") },
    { href: "/leaderboard", label: t("leaderboard") },
    ...(showAssignments ? [{ href: "/assignments", label: t("assignments") }] : []),
    { href: "/contests", label: t("contests") },
    { href: "/ide", label: t("ide") },
    ...(isTeacher ? [{ href: "/teacher", label: t("teacher") }] : []),
  ];

  // Cambridge levels get their own group rather than one flat entry.
  const cambridge = [
    { href: "/cambridge", label: "Overview" },
    ...LEVELS.map((l) => ({ href: `/cambridge/${l.id}`, label: l.title })),
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 text-primary transition-colors hover:bg-primary/10 md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="fixed inset-x-0 top-14 z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-primary/20 bg-background/95 p-3 backdrop-blur-xl md:hidden">
            <ul className="space-y-1">
              {items.map(({ href, label }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-3 font-code text-base transition-colors",
                        active
                          ? "border border-primary/40 bg-primary/10 text-primary text-glow-soft"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <span className="text-primary/60">/</span>
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 border-t border-primary/15 pt-3">
              <div className="hud-label mb-1 px-4">CAMBRIDGE</div>
              <ul className="space-y-1">
                {cambridge.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-4 py-3 font-code text-base transition-colors",
                          active
                            ? "border border-primary/40 bg-primary/10 text-primary text-glow-soft"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <span className="text-primary/60">/</span>
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Theme + language live here on phones — the header has no room. */}
            <div className="mt-3 flex items-center gap-2 border-t border-primary/15 pt-3">
              <ThemeToggle />
              <LanguageToggle />
              {/* A second way in, for a student who opened the menu looking
                  for one. The header button is the first. */}
              {!signedIn && (
                <Link
                  href="/login"
                  className="ml-auto rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 font-code text-base text-primary"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { LEVELS } from "@/lib/cambridge";

interface NavLinksProps {
  showAssignments: boolean;
}

export function NavLinks({ showAssignments }: NavLinksProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click and on navigation.
  useEffect(() => setOpenMenu(false), [pathname]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const items = [
    { href: "/learn", label: locale === "en" ? "Learn" : "Сурах" },
    { href: "/problems", label: t("problems") },
    { href: "/game", label: t("game") },
    { href: "/leaderboard", label: t("leaderboard") },
    ...(showAssignments
      ? [{ href: "/assignments", label: t("assignments") }]
      : []),
    { href: "/contests", label: t("contests") },
    { href: "/ide", label: t("ide") },
  ];

  const linkClass = (active: boolean) =>
    cn(
      "relative px-3 py-1.5 rounded-lg font-code text-[0.8rem] font-medium tracking-wide transition-colors",
      active
        ? "text-primary text-glow-soft"
        : "text-muted-foreground hover:text-foreground",
    );

  const cambridgeActive = pathname.startsWith("/cambridge");

  return (
    <nav className="hidden md:flex items-center gap-0.5">
      {items.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={href} href={href} className={linkClass(active)}>
            {active && (
              <>
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-lg border border-primary/40 bg-primary/10"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-[7px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_1px_var(--color-primary)]"
                />
              </>
            )}
            {label}
          </Link>
        );
      })}

      {/* Cambridge — a menu, because each level is its own section. */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((v) => !v)}
          aria-expanded={openMenu}
          aria-haspopup="menu"
          className={cn(linkClass(cambridgeActive), "inline-flex items-center gap-1")}
        >
          {cambridgeActive && (
            <>
              <span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-lg border border-primary/40 bg-primary/10"
              />
              <span
                aria-hidden
                className="absolute -bottom-[7px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_1px_var(--color-primary)]"
              />
            </>
          )}
          Cambridge
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              openMenu && "rotate-180",
            )}
          />
        </button>

        {openMenu && (
          <div
            role="menu"
            className="hud-panel absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl p-1 backdrop-blur-xl"
          >
            <Link
              href="/cambridge"
              className="block rounded-lg px-3 py-2 font-code text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Overview
            </Link>
            <div className="my-1 h-px bg-primary/15" />
            {LEVELS.map((l) => {
              const active = pathname.startsWith(`/cambridge/${l.id}`);
              return (
                <Link
                  key={l.id}
                  href={`/cambridge/${l.id}`}
                  className={cn(
                    "block rounded-lg px-3 py-2 transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div className="font-code text-sm font-semibold">
                    {l.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {l.grade} · {l.code}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}

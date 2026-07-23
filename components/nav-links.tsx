"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import { cn } from "@/lib/utils";

interface NavLinksProps {
  showAssignments: boolean;
}

export function NavLinks({ showAssignments }: NavLinksProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();

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

  return (
    <nav className="hidden md:flex items-center gap-0.5">
      {items.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative px-3 py-1.5 rounded-lg font-code text-[0.8rem] font-medium tracking-wide transition-colors",
              active
                ? "text-primary text-glow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-lg border border-primary/40 bg-primary/10"
              />
            )}
            {active && (
              <span
                aria-hidden
                className="absolute -bottom-[7px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_1px_var(--color-primary)]"
              />
            )}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

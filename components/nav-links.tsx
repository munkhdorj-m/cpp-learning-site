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
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

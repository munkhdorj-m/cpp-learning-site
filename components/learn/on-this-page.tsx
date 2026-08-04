"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface PageAnchor {
  id: string;
  title: string;
}

/**
 * The left rail: every section of this lesson, with the one you are reading
 * highlighted. A lesson is now long enough that a student needs to be able to
 * jump straight to "Type Conversions" without scrolling for it.
 */
export function OnThisPage({
  items,
  en,
  className,
}: {
  items: PageAnchor[];
  en: boolean;
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // Whichever heading most recently crossed the top of the reading area is
    // the one being read. A plain "is visible" test lights up several at once
    // on a tall screen.
    const onScroll = () => {
      const line = 140; // just under the sticky header
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className={className} aria-label={en ? "On this page" : "Энэ хуудсанд"}>
      <div className="hud-label mb-2 px-3">
        {en ? "ON THIS PAGE" : "ЭНЭ ХУУДСАНД"}
      </div>
      <ul className="space-y-0.5">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-colors",
                active === i.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {i.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

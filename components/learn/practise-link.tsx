"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Now go solve some" — sends the student from a lesson to the problems that
 * practise exactly what they just read.
 *
 * The count is fetched rather than passed in, because lesson pages are static
 * and the tags live in the database. Renders nothing at all until we know
 * there is something to practise, so a lesson never links to an empty list.
 */
export function PractiseLink({ slug, en }: { slug: string; en: boolean }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/problems/topic-counts")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.counts) setCount(d.counts[slug] ?? 0);
      })
      .catch(() => {
        /* offline or the API is down — just stay hidden */
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!count) return null;

  return (
    <Card className="border-primary/30 bg-primary/[0.05]">
      <CardContent className="flex flex-wrap items-center gap-3 p-4">
        <Dumbbell className="h-4 w-4 shrink-0 text-primary" />
        <p className="min-w-[180px] flex-1 text-sm">
          <span className="hud-label mr-1">
            {en ? "PRACTISE" : "ДАСГАЛ"}
          </span>
          {en
            ? `${count} problem${count === 1 ? "" : "s"} use this lesson.`
            : `Энэ хичээлийг ашигласан ${count} бодлого байна.`}
        </p>
        <Link
          href={`/problems?topic=${slug}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "font-code",
          )}
        >
          {en ? "Solve them" : "Бодох"}
        </Link>
      </CardContent>
    </Card>
  );
}

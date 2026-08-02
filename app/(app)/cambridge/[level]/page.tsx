import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  LEVELS,
  levelById,
  topicsForLevel,
  unitsForLevel,
  type LevelId,
} from "@/lib/cambridge";

export function generateStaticParams() {
  return LEVELS.map((l) => ({ level: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const found = levelById(level);
  return { title: found ? `${found.title} — Cambridge` : "Cambridge" };
}

export default async function CambridgeLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const info = levelById(level);
  if (!info) notFound();

  const id = info.id as LevelId;
  const units = unitsForLevel(id);
  const topics = topicsForLevel(id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/cambridge"
          className="inline-flex items-center gap-1.5 font-code text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All levels
        </Link>
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">//</span>
          {info.code}
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">{info.title}</h1>
        <p className="text-sm text-muted-foreground">{info.blurb}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {info.papers.map((p) => (
            <span key={p} className="hud-chip">
              <FileText className="h-3 w-3" />
              {p}
            </span>
          ))}
        </div>
      </div>

      {units.map((unit) => (
        <section key={unit} className="space-y-2">
          <h2 className="hud-label flex items-center gap-2">
            <span className="text-primary">//</span>
            {unit}
            <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {topics
              .filter((t) => t.unit === unit)
              .map((t) => (
                <Link
                  key={t.slug}
                  href={`/cambridge/${info.id}/${t.slug}`}
                  className="group"
                >
                  <Card className="hud-hover h-full">
                    <CardContent className="flex items-start gap-3 p-4">
                      <span className="flex h-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-2 font-code text-xs font-bold text-primary">
                        {t.ref}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold leading-tight">
                          {t.title}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {t.objectives.length} learning objectives
                        </div>
                      </div>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

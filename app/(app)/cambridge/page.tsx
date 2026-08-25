import Link from "next/link";
import {
  GraduationCap,
  ChevronRight,
  FileText,
  Database,
  SquareTerminal,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { LEVELS, topicsForLevel } from "@/lib/cambridge";

export const metadata = { title: "Cambridge" };

const GLOW: Record<string, string> = {
  igcse: "var(--neon-cyan)",
  as: "var(--neon-violet)",
  "a-level": "var(--neon-amber)",
};

/**
 * The two things on this syllabus that students write constantly and never see
 * run. Both playgrounds work entirely in the browser, so they open instantly
 * and need no account.
 */
const TOOLS = [
  {
    href: "/cambridge/pseudocode",
    icon: SquareTerminal,
    title: "Pseudocode playground",
    blurb:
      "Write the pseudocode the papers use, then press Run and watch it do what you actually wrote.",
    cta: "Write pseudocode",
    glow: "var(--neon-lime)",
  },
  {
    href: "/cambridge/sql",
    icon: Database,
    title: "SQL playground",
    blurb:
      "A sample school database and real SQLite. Query it, change it, break it — Reset puts it back.",
    cta: "Write SQL",
    glow: "var(--neon-cyan)",
  },
] as const;

export default function CambridgePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">{"//"}</span>
          CAMBRIDGE.SYLLABUS
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary"
          >
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cambridge Computer Science</h1>
            <p className="text-sm text-muted-foreground">
              Study notes for each level we teach — what the syllabus expects,
              the vocabulary examiners use, and the parts students lose marks on.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {LEVELS.map((level) => {
          const glow = GLOW[level.id];
          const count = topicsForLevel(level.id).length;
          return (
            <Link
              key={level.id}
              href={`/cambridge/${level.id}`}
              className="group block"
            >
              <Card
                className="hud-hover h-full"
                style={{
                  ["--glow" as string]: glow,
                  ["--neon-cyan" as string]: glow,
                }}
              >
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-bold" style={{ color: glow }}>
                        {level.title}
                      </div>
                      <div className="font-code text-[11px] text-muted-foreground">
                        {level.code} · {level.grade}
                      </div>
                    </div>
                    <span className="hud-chip" style={{ ["--glow" as string]: glow }}>
                      {count}
                    </span>
                  </div>
                  <p className="flex-1 text-sm text-muted-foreground">
                    {level.blurb}
                  </p>
                  <ul className="space-y-0.5">
                    {level.papers.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-1.5 font-code text-[11px] text-muted-foreground"
                      >
                        <FileText className="mt-0.5 h-3 w-3 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="flex items-center gap-1 font-code text-xs font-semibold"
                    style={{ color: glow }}
                  >
                    Open
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block">
            <Card
              className="hud-hover h-full"
              style={{
                ["--glow" as string]: tool.glow,
                ["--neon-cyan" as string]: tool.glow,
              }}
            >
              <CardContent className="flex h-full flex-col gap-2 p-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: tool.glow,
                      color: tool.glow,
                      background: "color-mix(in srgb, currentColor 10%, transparent)",
                    }}
                  >
                    <tool.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-base font-bold" style={{ color: tool.glow }}>
                    {tool.title}
                  </div>
                </div>
                <p className="flex-1 text-sm text-muted-foreground">
                  {tool.blurb}
                </p>
                <div
                  className="flex items-center gap-1 font-code text-xs font-semibold"
                  style={{ color: tool.glow }}
                >
                  {tool.cta}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="hud-panel">
        <CardContent className="space-y-2 p-5 text-sm">
          <div className="hud-label">HOW TO USE THIS</div>
          <p className="text-muted-foreground">
            These notes are a companion to your textbook and lessons, not a
            replacement. Each topic lists the syllabus objectives so you can
            check what you are expected to be able to <em>do</em>, then covers
            the points that are most often examined or misunderstood. Practise
            the programming side in{" "}
            <Link href="/problems" className="text-primary hover:underline">
              Problems
            </Link>{" "}
            and the{" "}
            <Link href="/ide" className="text-primary hover:underline">
              C++ playground
            </Link>
            , and the two things this syllabus examines on paper in the{" "}
            <Link
              href="/cambridge/pseudocode"
              className="text-primary hover:underline"
            >
              pseudocode
            </Link>{" "}
            and{" "}
            <Link href="/cambridge/sql" className="text-primary hover:underline">
              SQL
            </Link>{" "}
            playgrounds above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

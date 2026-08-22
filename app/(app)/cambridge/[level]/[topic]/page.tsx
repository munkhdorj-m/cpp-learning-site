import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  BookMarked,
  Lightbulb,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TOPICS,
  levelById,
  findTopic,
  topicsForLevel,
  quizFor,
  type LevelId,
} from "@/lib/cambridge";
import { TopicQuiz } from "@/components/cambridge/topic-quiz";
import { TermFlashcards } from "@/components/cambridge/term-flashcards";
import { PracticeFor } from "@/components/cambridge/practice-for";
import { TopicImages } from "@/components/cambridge/topic-images";
import { TopicDone } from "@/components/cambridge/topic-done";
import { CodeBlock } from "@/components/learn/code-block";
import { highlightCode } from "@/lib/shiki";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ level: t.level, topic: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string; topic: string }>;
}) {
  const { level, topic } = await params;
  const t = findTopic(level, topic);
  return { title: t ? t.title : "Cambridge" };
}

export default async function CambridgeTopicPage({
  params,
}: {
  params: Promise<{ level: string; topic: string }>;
}) {
  const { level, topic } = await params;
  const info = levelById(level);
  const t = findTopic(level, topic);
  if (!info || !t) notFound();

  const quiz = quizFor(level, topic);
  const siblings = topicsForLevel(info.id as LevelId);
  const i = siblings.findIndex((s) => s.slug === t.slug);
  const prev = i > 0 ? siblings[i - 1] : null;
  const next = i < siblings.length - 1 ? siblings[i + 1] : null;

  return (
    <article className="mx-auto max-w-3xl space-y-5 pb-4">
      <div className="space-y-2">
        <Link
          href={`/cambridge/${info.id}`}
          className="inline-flex items-center gap-1.5 font-code text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {info.title}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hud-chip">{info.title}</span>
          <span className="hud-chip">{t.ref}</span>
          <span className="font-code text-xs text-muted-foreground">
            {t.unit}
          </span>
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {t.summary}
        </p>
      </div>

      {/* Objectives */}
      <Card className="hud-panel">
        <CardContent className="space-y-2 p-4">
          <div className="hud-label flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-primary" />
            YOU SHOULD BE ABLE TO
          </div>
          <ul className="space-y-1.5">
            {t.objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {o}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Photographs of the hardware this topic is about */}
      <TopicImages slug={t.slug} />

      {/* Hands-on practice, where the topic has a skill to practise */}
      <PracticeFor slug={t.slug} />

      {/* Notes */}
      {await Promise.all((t.notes ?? []).map(async (n) => (
        <section key={n.heading} className="space-y-2">
          <h2 className="hud-label flex items-center gap-2">
            <span className="text-primary">//</span>
            {n.heading}
            <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {n.body}
          </p>
          {n.code && (
            <CodeBlock
              code={n.code}
              html={await highlightCode(n.code, "cpp")}
              lang="cpp"
            />
          )}
        </section>
      )))}

      {/* Key terms — as flashcards, so they are recalled rather than re-read */}
      {t.terms && t.terms.length > 0 && (
        <section className="space-y-2">
          <h2 className="hud-label flex items-center gap-2">
            <BookMarked className="h-3.5 w-3.5 text-primary" />
            KEY TERMS
            <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
          </h2>
          <TermFlashcards terms={t.terms} />
        </section>
      )}

      {/* Exam tips */}
      {t.examTips && t.examTips.length > 0 && (
        <Card className="border-neon-amber/30 bg-neon-amber/[0.05]">
          <CardContent className="space-y-2 p-4">
            <div className="hud-label flex items-center gap-2 text-neon-amber">
              <Lightbulb className="h-3.5 w-3.5" />
              IN THE EXAM
            </div>
            <ul className="space-y-1.5">
              {t.examTips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-amber" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {quiz && (
        <TopicQuiz questions={quiz} itemPrefix={`cambridge:${level}/${topic}`} />
      )}

      <div className="border-t border-primary/15 pt-4">
        <TopicDone slug={t.slug} />
      </div>

      {/* Prev / next */}
      <div className="flex flex-wrap gap-2">
        {prev && (
          <Link
            href={`/cambridge/${info.id}/${prev.slug}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "min-w-0 flex-1",
            )}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />
            <span className="truncate">{prev.title}</span>
          </Link>
        )}
        {next && (
          <Link
            href={`/cambridge/${info.id}/${next.slug}`}
            className={cn(
              buttonVariants({ size: "sm" }),
              "min-w-0 flex-1 font-code",
            )}
          >
            <span className="truncate">{next.title}</span>
            <ArrowRight className="ml-1.5 h-4 w-4 shrink-0" />
          </Link>
        )}
      </div>
    </article>
  );
}

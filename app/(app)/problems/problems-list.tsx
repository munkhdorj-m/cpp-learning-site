"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  CheckCircle2,
  Circle,
  Sparkles,
  GraduationCap,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { AnimatedList } from "@/components/animations/animated-list";
import { cn } from "@/lib/utils";
import {
  TOPIC_OPTIONS,
  primaryTopic,
  topicOrder,
  topicById,
  type TopicOption,
} from "@/lib/problem-topics";
import type { Difficulty } from "@/types/database";

interface Item {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  xp_reward: number;
  tags: string[];
  solved: boolean;
}

async function fetchSolvedIds(): Promise<Set<string>> {
  try {
    const res = await fetch("/api/problems/solved");
    if (!res.ok) return new Set();
    const data = await res.json();
    return new Set<string>(data.solved ?? []);
  } catch {
    return new Set();
  }
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "text-emerald-700 bg-emerald-100/70 dark:text-emerald-300 dark:bg-emerald-950/40",
  medium:
    "text-amber-700 bg-amber-100/70 dark:text-amber-300 dark:bg-amber-950/40",
  hard: "text-rose-700 bg-rose-100/70 dark:text-rose-300 dark:bg-rose-950/40",
};

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
};

/** Strip LaTeX $ delimiters for plain-text display (e.g. "$k$" → "k") */
function stripLatex(s: string): string {
  return s.replace(/\$+/g, "");
}

const PAGE_SIZE = 30;

export function ProblemsList({ items: initialItems }: { items: Item[] }) {
  const t = useTranslations("problems");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [diff, setDiff] = useState<"all" | Difficulty>("all");
  const [solvedFilter, setSolvedFilter] = useState<
    "all" | "solved" | "unsolved"
  >("all");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Keep items in local state so we can hydrate solved status client-side
  const [items, setItems] = useState(initialItems);

  // Hydrate solved status from the server AFTER the cached page loads
  useEffect(() => {
    let cancelled = false;
    fetchSolvedIds().then((ids) => {
      if (cancelled || ids.size === 0) return;
      setItems((prev) =>
        prev.map((p) => ({
          ...p,
          solved: p.solved || ids.has(p.id),
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Read page from URL (?page=2), default to 1.
  // Derived from searchParams so it stays in sync after client-side
  // navigation — useState initializer runs during SSR where
  // useSearchParams() returns empty, locking page to 1 forever.
  const page = useMemo(() => {
    const p = Number(searchParams.get("page"));
    return p >= 1 ? p : 1;
  }, [searchParams]);

  // The chosen topic also lives in the URL, so /problems?topic=arrays is a
  // shareable link — that is how each lesson links to its own practice.
  const topic = searchParams.get("topic") ?? "all";

  // File each problem under the lesson it practises, once, up front.
  const itemsWithTopic = useMemo(
    () => items.map((p) => ({ item: p, topic: primaryTopic(p.tags) })),
    [items],
  );

  // Which topics actually have problems — empty lessons stay out of the menu.
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const { topic: id } of itemsWithTopic) {
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [itemsWithTopic]);

  const availableTopics = useMemo(
    () => TOPIC_OPTIONS.filter((o) => (topicCounts[o.id] ?? 0) > 0),
    [topicCounts],
  );

  // Sorted in the order the course teaches things. The server already
  // returned easy → hard, and sort() is stable, so within one topic the
  // problems still run from easiest to hardest.
  const filtered = useMemo(() => {
    return itemsWithTopic
      .filter(({ item: p, topic: id }) => {
        if (diff !== "all" && p.difficulty !== diff) return false;
        if (solvedFilter === "solved" && !p.solved) return false;
        if (solvedFilter === "unsolved" && p.solved) return false;
        if (topic !== "all" && id !== topic) return false;
        if (query && !p.title.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      })
      .sort((a, b) => topicOrder(a.topic) - topicOrder(b.topic));
  }, [itemsWithTopic, query, diff, topic, solvedFilter]);

  // Reset to page 1 when user changes a filter.
  // Moved out of useEffect into each filter's onChange handler so it
  // never fires on mount. This prevents a race where React Strict Mode
  // double-invocation (or Next.js navigation quirks) could reset the
  // page param read from the URL (e.g. ?page=3 when using back button).
  const resetPageTo1 = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("page")) return; // already on page 1
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `/problems?${qs}` : "/problems", { scroll: false });
  }, [router]);

  // Topic lives in the URL, so changing it also drops back to page 1.
  const selectTopic = useCallback(
    (next: string) => {
      const params = new URLSearchParams(window.location.search);
      params.delete("page");
      if (next === "all") params.delete("topic");
      else params.set("topic", next);
      const qs = params.toString();
      router.replace(qs ? `/problems?${qs}` : "/problems", { scroll: false });
    },
    [router],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOffset = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageOffset, pageOffset + PAGE_SIZE);

  // Update URL when page changes (URL is source of truth —
  // useMemo derives page from searchParams automatically).
  const goToPage = (p: number) => {
    const newPage = Math.max(1, Math.min(totalPages, p));
    const params = new URLSearchParams(window.location.search);
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    const qs = params.toString();
    router.replace(qs ? `/problems?${qs}` : "/problems", { scroll: false });
  };

  const en = locale === "en";
  const labelOf = (o: TopicOption) => (en ? o.label_en : o.label_mn);
  const unitLabelOf = (o: TopicOption) => (en ? o.unitLabel_en : o.unitLabel_mn);

  const selected = topic === "all" ? null : topicById(topic);

  // The picker mirrors the Learn page: one section per unit, lessons in order.
  const topicGroups = useMemo(() => {
    const groups: { unit: number; label: string; topics: TopicOption[] }[] = [];
    for (const o of availableTopics) {
      const last = groups[groups.length - 1];
      if (last && last.unit === o.unit) last.topics.push(o);
      else groups.push({ unit: o.unit, label: unitLabelOf(o), topics: [o] });
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTopics, en]);

  const solvedCount = items.filter((p) => p.solved).length;
  const totalCount = items.length;

  const diffLabel = (v: "all" | Difficulty) =>
    v === "all" ? t("all") : t(`difficulty.${v}`);
  const solvedLabel = (v: "all" | "solved" | "unsolved") =>
    v === "all" ? t("all") : v === "solved" ? t("solved") : t("unsolved");

  return (
    <div className="space-y-4">
      {/* Progress strip */}
      <div className="flex items-center gap-3 text-sm">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted ring-1 ring-primary/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${totalCount > 0 ? (solvedCount / totalCount) * 100 : 0}%`,
              background: "var(--gradient-solved)",
              boxShadow: "0 0 12px -2px var(--neon-lime)",
            }}
          />
        </div>
        <span className="font-code text-xs text-muted-foreground tabular-nums">
          {solvedCount}
          <span className="text-neon-lime">/</span>
          {totalCount}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPageTo1();
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={diff}
          onValueChange={(v) => {
            if (v) {
              setDiff(v as typeof diff);
              resetPageTo1();
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <span className="text-sm">{diffLabel(diff)}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="easy">{t("difficulty.easy")}</SelectItem>
            <SelectItem value="medium">{t("difficulty.medium")}</SelectItem>
            <SelectItem value="hard">{t("difficulty.hard")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={topic}
          onValueChange={(v) => {
            if (v) selectTopic(v);
          }}
        >
          <SelectTrigger className="w-full sm:w-[190px]">
            <span className="truncate text-sm">
              {selected ? labelOf(selected) : en ? "All topics" : "Бүх сэдэв"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {en ? "All topics" : "Бүх сэдэв"}
            </SelectItem>
            {topicGroups.map((g) => (
              <SelectGroup key={g.unit}>
                <SelectLabel className="hud-label text-[10px]">
                  {g.label}
                </SelectLabel>
                {g.topics.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    <span className="flex w-full items-center gap-2">
                      <span className="truncate">{labelOf(o)}</span>
                      <span className="ml-auto font-code text-xs text-muted-foreground tabular-nums">
                        {topicCounts[o.id]}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={solvedFilter}
          onValueChange={(v) => {
            if (v) {
              setSolvedFilter(v as typeof solvedFilter);
              resetPageTo1();
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <span className="text-sm">{solvedLabel(solvedFilter)}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="solved">{t("solved")}</SelectItem>
            <SelectItem value="unsolved">{t("unsolved")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* When one topic is picked, point straight at the lesson that teaches
          it — a student who cannot solve these needs the lesson, not a hint. */}
      {selected && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2">
          <span className="hud-label text-[10px] text-muted-foreground">
            {unitLabelOf(selected)}
          </span>
          <span className="text-primary">/</span>
          <span className="font-code text-sm font-bold text-primary">
            {labelOf(selected)}
          </span>
          {selected.hasLesson && (
            <Link
              href={`/learn/${selected.id}`}
              className="ml-auto inline-flex items-center gap-1.5 font-code text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              {en ? "Read the lesson" : "Хичээлийг унших"}
            </Link>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="animate-flicker-in">
          <Card>
            <p className="text-center text-muted-foreground py-12">
              {t("no_problems")}
            </p>
          </Card>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <AnimatedList as="ol" className="divide-y" stagger={0.04}>
            {visible.map(({ item: p, topic: id }, idx) => (
              <li key={p.id}>
                {/* Topic heading — shown when the topic changes, and always
                    at the top of a page so the group is never anonymous. */}
                {(idx === 0 || visible[idx - 1].topic !== id) &&
                  topic === "all" &&
                  (() => {
                    const o = topicById(id);
                    if (!o) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-primary/15 bg-primary/[0.06] px-4 py-2">
                        <span className="hud-label text-[10px] text-muted-foreground">
                          {unitLabelOf(o)}
                        </span>
                        <span className="text-primary">/</span>
                        <span className="font-code text-sm font-bold text-primary">
                          {labelOf(o)}
                        </span>
                        <span className="font-code text-xs text-muted-foreground tabular-nums">
                          ({topicCounts[id]})
                        </span>
                        {o.hasLesson && (
                          <Link
                            href={`/learn/${o.id}`}
                            className="ml-auto inline-flex items-center gap-1 font-code text-xs text-muted-foreground transition-colors hover:text-primary"
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            {en ? "lesson" : "хичээл"}
                          </Link>
                        )}
                      </div>
                    );
                  })()}
                <Link
                  href={`/problems/${p.slug}?fromPage=${currentPage}`}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-2.5 transition-colors",
                    p.solved
                      ? "bg-neon-lime/[0.08] ring-1 ring-inset ring-neon-lime/25 hover:bg-neon-lime/[0.14]"
                      : "hover:bg-muted/60 hover:translate-x-1",
                  )}
                >
                  {p.solved && (
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-[3px] bg-neon-lime shadow-[0_0_10px_1px_var(--neon-lime)]"
                    />
                  )}
                  <span className="hidden w-6 shrink-0 text-right font-code text-xs tabular-nums text-muted-foreground sm:inline">
                    {pageOffset + idx + 1}
                  </span>
                  <span className="shrink-0">
                    {p.solved ? (
                      <CheckCircle2 className="h-5 w-5 text-neon-lime drop-shadow-[0_0_6px_var(--neon-lime)]" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "truncate font-semibold leading-tight",
                          p.solved && "text-neon-lime text-glow-soft",
                        )}
                      >
                        {stripLatex(p.title)}
                      </span>
                      {p.solved && (
                        <span
                          className="hud-chip hidden shrink-0 sm:inline-flex"
                          style={{ ["--glow" as string]: "var(--neon-lime)" }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {t("solved")}
                        </span>
                      )}
                    </div>
                    {p.tags.length > 0 && (
                      <div className="mt-0.5 truncate text-xs text-muted-foreground/70">
                        {p.tags.map((tag) => `#${tag}`).join(" ")}
                      </div>
                    )}
                  </div>

                  <span
                    className={cn(
                      "hidden shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium sm:inline-flex",
                      p.solved
                        ? "opacity-60"
                        : DIFFICULTY_STYLES[p.difficulty],
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        DIFFICULTY_DOT[p.difficulty],
                      )}
                    />
                    {t(`difficulty.${p.difficulty}`)}
                  </span>

                  <span
                    className={cn(
                      "inline-flex min-w-[2.5rem] shrink-0 items-center justify-end gap-1 text-xs font-semibold tabular-nums",
                      p.solved
                        ? "text-neon-lime"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    {p.xp_reward}
                  </span>
                </Link>
              </li>
            ))}
          </AnimatedList>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 p-3 border-t flex-wrap">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 2,
                )
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-muted-foreground">…</span>
                    )}
                    <button
                      onClick={() => goToPage(p)}
                      className={cn(
                        "h-8 min-w-[2rem] rounded px-2 py-1 font-code text-sm font-medium transition-colors",
                        p === currentPage
                          ? "bg-primary text-primary-foreground shadow-[0_0_16px_-4px_var(--color-primary)]"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

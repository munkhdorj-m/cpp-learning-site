"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { AnimatedList } from "@/components/animations/animated-list";
import { cn } from "@/lib/utils";
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

// Map any raw tag to one of the canonical topic buckets shown in the filter.
const TOPIC_MAP: Record<string, string[]> = {
  math: [
    "math",
    "basic-math",
    "arithmetic",
    "number-theory",
    "modulo",
    "modular",
    "divisibility",
    "primes",
    "gcd",
    "lcm",
    "factorial",
    "digits",
  ],
  conditionals: [
    "if-else",
    "conditional",
    "conditionals",
    "branching",
    "comparison",
  ],
  loops: [
    "for-loop",
    "while-loop",
    "loops",
    "loop",
    "nested-loops",
    "iteration",
  ],
  strings: ["string", "strings", "char", "characters", "text"],
  arrays: [
    "array",
    "arrays",
    "matrix",
    "matrices",
    "2d-array",
    "1d-array",
    "vector",
  ],
  geometry: [
    "geometry",
    "area",
    "perimeter",
    "euclidean-distance",
    "circle",
    "triangle",
    "rectangle",
  ],
  patterns: ["pattern", "patterns", "ascii-art", "printing"],
  io: ["io", "input-output", "basics", "starter", "implementation"],
  sequences: ["sequence", "sequences", "fibonacci", "series", "progression"],
};
const TOPIC_KEYS = Object.keys(TOPIC_MAP) as Array<
  keyof typeof TOPIC_MAP & string
>;

function topicsOf(tags: string[]): Set<string> {
  const out = new Set<string>();
  for (const t of tags) {
    const lower = t.toLowerCase();
    for (const topic of TOPIC_KEYS) {
      if (TOPIC_MAP[topic].some((m) => lower === m || lower.includes(m))) {
        out.add(topic);
      }
    }
  }
  return out;
}

const TOPIC_LABEL_MN: Record<string, string> = {
  math: "Математик",
  conditionals: "if/else",
  loops: "for/while",
  strings: "Мөр",
  arrays: "Массив",
  geometry: "Геометр",
  patterns: "Загвар",
  io: "Үндэс",
  sequences: "Дараалал",
};
const TOPIC_LABEL_EN: Record<string, string> = {
  math: "Math",
  conditionals: "if/else",
  loops: "for/while",
  strings: "Strings",
  arrays: "Arrays",
  geometry: "Geometry",
  patterns: "Patterns",
  io: "Basics",
  sequences: "Sequences",
};

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
  const [topic, setTopic] = useState<string>("all");
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

  // Read page from URL (?page=2), default to 1
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get("page"));
    return p >= 1 ? p : 1;
  });

  // Pre-compute topic set per item so filtering is O(1) per row
  const itemsWithTopics = useMemo(
    () => items.map((p) => ({ item: p, topics: topicsOf(p.tags) })),
    [items],
  );

  const filtered = useMemo(() => {
    return itemsWithTopics
      .filter(({ item: p, topics }) => {
        if (diff !== "all" && p.difficulty !== diff) return false;
        if (solvedFilter === "solved" && !p.solved) return false;
        if (solvedFilter === "unsolved" && p.solved) return false;
        if (topic !== "all" && !topics.has(topic)) return false;
        if (query && !p.title.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      })
      .map(({ item }) => item);
  }, [itemsWithTopics, query, diff, topic, solvedFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [query, diff, topic, solvedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOffset = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageOffset, pageOffset + PAGE_SIZE);

  // Update URL when page changes (so back button returns to correct page)
  const goToPage = (p: number) => {
    const newPage = Math.max(1, Math.min(totalPages, p));
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    const qs = params.toString();
    router.replace(qs ? `/problems?${qs}` : "/problems", { scroll: false });
  };

  const topicLabel = locale === "en" ? TOPIC_LABEL_EN : TOPIC_LABEL_MN;

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
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
            style={{
              width: `${totalCount > 0 ? (solvedCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {solvedCount} / {totalCount}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={diff}
          onValueChange={(v) => v && setDiff(v as typeof diff)}
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
        <Select value={topic} onValueChange={(v) => v && setTopic(v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <span className="text-sm">
              {topic === "all" ? t("all") : topicLabel[topic] || topic}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            {TOPIC_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {topicLabel[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={solvedFilter}
          onValueChange={(v) => v && setSolvedFilter(v as typeof solvedFilter)}
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

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <p className="text-center text-muted-foreground py-12">
              {t("no_problems")}
            </p>
          </Card>
        </motion.div>
      ) : (
        <Card className="overflow-hidden p-0">
          <AnimatedList as="ol" className="divide-y" stagger={0.04}>
            {visible.map((p, idx) => (
              <li key={p.id}>
                <Link
                  href={`/problems/${p.slug}`}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 transition-colors",
                    p.solved
                      ? "bg-emerald-50/60 dark:bg-emerald-950/15 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/30 glow-solved"
                      : "hover:bg-muted/60 hover:translate-x-1",
                  )}
                >
                  <span className="text-xs text-muted-foreground tabular-nums w-6 text-right shrink-0 hidden sm:inline">
                    {pageOffset + idx + 1}
                  </span>
                  <span className="shrink-0">
                    {p.solved ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "font-semibold truncate leading-tight",
                        p.solved && "text-emerald-900 dark:text-emerald-200",
                      )}
                    >
                      {stripLatex(p.title)}
                    </div>
                    {p.tags.length > 0 && (
                      <div className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                        {p.tags.map((tag) => `#${tag}`).join(" ")}
                      </div>
                    )}
                  </div>

                  <span
                    className={cn(
                      "hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium shrink-0",
                      DIFFICULTY_STYLES[p.difficulty],
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

                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold tabular-nums shrink-0 min-w-[2.5rem] justify-end">
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
                        "min-w-[2rem] h-8 px-2 py-1 text-sm rounded font-medium transition-colors",
                        p === currentPage
                          ? "bg-violet-600 text-white"
                          : "hover:bg-muted text-muted-foreground",
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

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Check, Undo2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { setReviewed } from "@/app/actions/plagiarism";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  similarity: number;
  reviewed: boolean;
  created_at: string;
  problem_slug: string | null;
  problem_title: string;
  class_name: string;
  student_a: string;
  student_b: string;
  code_a: string;
  code_b: string;
}

export function PlagiarismList({ items }: { items: Item[] }) {
  const t = useTranslations("teacher.plagiarism");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggleReviewed = (id: string, value: boolean) => {
    startTransition(async () => {
      const res = await setReviewed(id, value);
      if (res && "error" in res) toast.error(res.error);
    });
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="divide-y">
        {items.map((item) => {
          const isOpen = expanded === item.id;
          const simPct = Math.round(item.similarity * 100);
          const simColor =
            simPct >= 95
              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              : simPct >= 90
                ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
          return (
            <div
              key={item.id}
              className={cn(item.reviewed && "opacity-60")}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 text-left"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span
                  className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-sm font-bold tabular-nums shrink-0 min-w-[3.5rem] ${simColor}`}
                >
                  {simPct}%
                </span>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                  <span className="font-semibold truncate">
                    {item.student_a} ↔ {item.student_b}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {item.problem_title} · {item.class_name}
                  </span>
                </div>
                {item.reviewed && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    {t("reviewed_filter")}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.problem_slug && (
                      <Link
                        href={`/problems/${item.problem_slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t("problem")}
                      </Link>
                    )}
                    {item.reviewed ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleReviewed(item.id, false)}
                        disabled={pending}
                      >
                        <Undo2 className="h-3.5 w-3.5 mr-1" />
                        {t("mark_unreviewed")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => toggleReviewed(item.id, true)}
                        disabled={pending}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        {t("mark_reviewed")}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <CodePanel label={item.student_a} code={item.code_a} />
                    <CodePanel label={item.student_b} code={item.code_b} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CodePanel({ label, code }: { label: string; code: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <pre className="font-mono text-xs bg-muted rounded p-3 overflow-x-auto max-h-96 leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

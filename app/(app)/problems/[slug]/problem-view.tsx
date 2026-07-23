"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Play,
  Sparkles,
  Clock,
  HardDrive,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeEditor, STARTER_CPP } from "@/components/code-editor";
import { Markdown } from "@/components/markdown";
import { VerdictBadge } from "@/components/verdict-badge";
import { cn } from "@/lib/utils";
import type { Difficulty, Verdict } from "@/types/database";

interface Problem {
  id: string;
  slug: string;
  title: string;
  statement: string;
  input_format: string;
  output_format: string;
  constraints: string;
  difficulty: Difficulty;
  time_limit_ms: number;
  memory_limit_kb: number;
  xp_reward: number;
}

interface Sample {
  stdin: string;
  expected_stdout: string;
  order_idx: number;
}

interface Labels {
  statement: string;
  input_format: string;
  output_format: string;
  constraints: string;
  samples: string;
  sample_input: string;
  sample_output: string;
  time_limit: string;
  memory_limit: string;
  your_solution: string;
  submit: string;
  submitting: string;
}

interface RewardedBadge {
  code: string;
  name_mn: string;
  name_en: string;
  icon: string;
  color: string;
}

interface PastSubmission {
  id: string;
  verdict: Verdict;
  runtime_ms: number | null;
  passed_tests: number;
  total_tests: number;
  created_at: string;
}

interface SubmissionResult {
  verdict: Verdict;
  passed: number;
  total: number;
  runtime_ms: number | null;
  memory_kb: number | null;
  compile_output: string | null;
  stderr_output: string | null;
  level_up?: boolean;
  new_level?: number;
  new_badges?: RewardedBadge[];
}

function fireConfetti() {
  // Two bursts, fired from slightly different points for a fuller spray.
  const defaults = {
    spread: 70,
    ticks: 200,
    gravity: 0.9,
    startVelocity: 35,
    decay: 0.92,
    scalar: 1.05,
    colors: ["#a78bfa", "#f59e0b", "#10b981", "#ec4899", "#3b82f6"],
  };
  confetti({ ...defaults, particleCount: 60, origin: { x: 0.3, y: 0.7 } });
  confetti({ ...defaults, particleCount: 60, origin: { x: 0.7, y: 0.7 } });
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  medium:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  hard: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
};

export function ProblemView({
  problem,
  samples,
  labels,
  fromPage = 1,
  pastSubmissions = [],
}: {
  problem: Problem;
  samples: Sample[];
  labels: Labels;
  fromPage?: number;
  pastSubmissions?: PastSubmission[];
}) {
  const tDiff = useTranslations("problems.difficulty");
  const tVerdict = useTranslations("verdict");
  const tCommon = useTranslations("common");
  const tReward = useTranslations("reward");
  const tProblems = useTranslations("problems");
  const locale = useLocale();
  const router = useRouter();

  const [code, setCode] = useState(STARTER_CPP);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [pending, startTransition] = useTransition();

  // Solved = accepted in a past submission, or accepted just now this session.
  const solved =
    result?.verdict === "accepted" ||
    pastSubmissions.some((s) => s.verdict === "accepted");

  const submit = () => {
    setResult(null);
    startTransition(async () => {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_id: problem.id, code }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          toast.error("Rate limited. Try again in a minute.");
        } else {
          toast.error(tCommon("error"));
        }
        return;
      }
      const data = (await res.json()) as SubmissionResult;
      setResult(data);
      if (data.verdict === "accepted") {
        fireConfetti();
        toast.success(tVerdict("accepted"));
        // Re-render server components so the nav XP bar shows the new value
        router.refresh();
        if (data.level_up) {
          const lvl = data.new_level ?? 1;
          // Stagger so the AC toast lands first
          setTimeout(
            () => toast.success(tReward("level_up", { level: lvl })),
            400,
          );
        }
        (data.new_badges ?? []).forEach((b, i) => {
          const name = locale === "en" ? b.name_en : b.name_mn;
          setTimeout(
            () => toast.success(`${tReward("new_badge")} — ${name}`),
            700 + i * 300,
          );
        });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4 max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
        {/* Back button */}
        <button
          onClick={() =>
            router.replace(
              fromPage > 1 ? `/problems?page=${fromPage}` : "/problems",
            )
          }
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-1 px-1 py-0.5 rounded-md hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon("back")}
        </button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {solved && (
              <span
                className="hud-chip"
                style={{ ["--glow" as string]: "var(--neon-lime)" }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {tProblems("solved")}
              </span>
            )}
            <Badge
              variant="outline"
              className={`${DIFFICULTY_STYLES[problem.difficulty]} border`}
            >
              {tDiff(problem.difficulty)}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {labels.time_limit}:{" "}
              {problem.time_limit_ms}ms
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <HardDrive className="h-3 w-3" /> {labels.memory_limit}:{" "}
              {Math.round(problem.memory_limit_kb / 1024)}MB
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                solved ? "text-neon-lime" : "text-amber-600",
              )}
            >
              <Sparkles className="h-3 w-3" /> {problem.xp_reward} XP
            </span>
          </div>
          <h1
            className={cn(
              "flex items-center gap-2 text-2xl font-bold",
              solved && "text-neon-lime text-glow-soft",
            )}
          >
            {solved && (
              <CheckCircle2 className="h-6 w-6 shrink-0 drop-shadow-[0_0_6px_var(--neon-lime)]" />
            )}
            {problem.title}
          </h1>
        </div>

        <Section title={labels.statement} body={problem.statement} />
        {problem.input_format && (
          <Section title={labels.input_format} body={problem.input_format} />
        )}
        {problem.output_format && (
          <Section title={labels.output_format} body={problem.output_format} />
        )}
        {problem.constraints && (
          <Section title={labels.constraints} body={problem.constraints} />
        )}

        {samples.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold">{labels.samples}</h2>
            {samples.map((s, i) => (
              <Card key={i}>
                <CardContent className="p-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {labels.sample_input}
                    </div>
                    <pre className="font-mono text-xs bg-muted rounded p-2 whitespace-pre-wrap">
                      {s.stdin}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {labels.sample_output}
                    </div>
                    <pre className="font-mono text-xs bg-muted rounded p-2 whitespace-pre-wrap">
                      {s.expected_stdout}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{labels.your_solution}</h2>
          <Button
            onClick={submit}
            disabled={pending}
            className="font-code"
            size="sm"
          >
            <Play className="mr-1.5 h-4 w-4" />
            {pending ? labels.submitting : labels.submit}
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="h-[500px]">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </Card>

        <AnimatePresence>
          {(pending || result) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {pending ? (
                      <VerdictBadge
                        verdict="judging"
                        label={tVerdict("judging")}
                        size="lg"
                      />
                    ) : result ? (
                      <VerdictBadge
                        verdict={result.verdict}
                        label={tVerdict(result.verdict)}
                        size="lg"
                      />
                    ) : null}
                    {result && (
                      <>
                        <span className="text-sm tabular-nums">
                          {result.passed}/{result.total}
                        </span>
                        {result.runtime_ms !== null && (
                          <span className="text-sm text-muted-foreground">
                            {result.runtime_ms}ms
                          </span>
                        )}
                        {result.memory_kb !== null && (
                          <span className="text-sm text-muted-foreground">
                            {result.memory_kb}KB
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {result?.compile_output && (
                    <pre className="font-mono text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 rounded p-2 whitespace-pre-wrap">
                      {result.compile_output}
                    </pre>
                  )}
                  {result?.stderr_output && (
                    <pre className="font-mono text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 rounded p-2 whitespace-pre-wrap">
                      {result.stderr_output}
                    </pre>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past submissions */}
        {pastSubmissions.length > 0 && (
          <Card className="overflow-hidden p-0">
            <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Submission History
            </div>
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {pastSubmissions.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-2 text-sm"
                >
                  <span className="text-xs text-muted-foreground tabular-nums w-6 shrink-0">
                    {pastSubmissions.length - i}
                  </span>
                  <VerdictBadge
                    verdict={s.verdict}
                    label={tVerdict(s.verdict)}
                    size="sm"
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {s.passed_tests}/{s.total_tests}
                  </span>
                  {s.runtime_ms !== null && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {s.runtime_ms}ms
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                    {new Date(s.created_at).toLocaleString(locale, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-1.5">
      <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <Markdown>{body}</Markdown>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RotateCcw,
  Play,
  StepForward,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Bot,
  Lightbulb,
  AlertTriangle,
  Bomb,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BlocklyWorkspace,
  type BlocklyWorkspaceHandle,
} from "@/components/blockly-workspace";
import { cn } from "@/lib/utils";
import {
  RobotInterpreter,
  type RobotInstruction,
} from "@/lib/robot-interpreter";

import { PhaserMaze } from "./phaser-maze-client";
import {
  COURSES,
  COURSE_THEMES,
  LEVELS,
  TOTAL_LEVELS,
  type Direction,
} from "./levels";

const STEP_MS = 380;

interface MazeState {
  x: number;
  y: number;
  dir: Direction; // 0=N, 1=E, 2=S, 3=W
  lit: Set<string>;
  flash?: { x: number; y: number; kind: "crash" | "danger" } | null;
  showSuccess?: boolean;
}

type RunPhase = "idle" | "running" | "success" | "crash" | "danger";

import type { Level } from "./levels";

export function RobotProgrammer({
  completedLevelIds,
  startLevelId,
  allLevels,
  totalLevels: totalOverride,
}: {
  completedLevelIds: string[];
  startLevelId?: string;
  allLevels?: Level[];
  totalLevels?: number;
}) {
  const levels = allLevels ?? LEVELS;
  const total = totalOverride ?? TOTAL_LEVELS;
  const t = useTranslations("robot");
  const locale = useLocale();
  const router = useRouter();

  const blockLabels = useMemo(
    () => ({
      when_run: locale === "en" ? "When ▶ Run" : "Ажиллах ▶",
      forward: locale === "en" ? "move forward" : "урагшаа",
      left: locale === "en" ? "turn left" : "зүүн эргэх",
      right: locale === "en" ? "turn right" : "баруун эргэх",
      light: locale === "en" ? "pick egg" : "өндөг авах",
      repeat: locale === "en" ? "repeat" : "давтах",
      repeat_do: locale === "en" ? "do" : "хийх:",
      repeat_until:
        locale === "en" ? "repeat until target" : "өндөг хүртэл давтах",
      repeat_until_do: locale === "en" ? "do" : "хийх:",
      if_path: locale === "en" ? "if path ahead" : "урд зам байвал",
      if_path_do: locale === "en" ? "do" : "хийх:",
      while_path: locale === "en" ? "while path ahead" : "урд зам байсаар",
      while_path_do: locale === "en" ? "do" : "хийх:",
      cat_actions: locale === "en" ? "Actions" : "Үйлдэл",
      cat_control: locale === "en" ? "Control" : "Удирдлага",
    }),
    [locale],
  );

  const initialLevelIdx = (() => {
    if (startLevelId) {
      const idx = levels.findIndex((l) => l.id === startLevelId);
      if (idx !== -1) return idx;
    }
    const idx = levels.findIndex((l) => !completedLevelIds.includes(l.id));
    return idx === -1 ? 0 : idx;
  })();
  const [levelIdx, setLevelIdx] = useState(initialLevelIdx);
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(completedLevelIds),
  );

  const level = levels[levelIdx];
  const course = COURSES.find((c) => c.id === level.course) ?? COURSES[0];

  const [phase, setPhase] = useState<RunPhase>("idle");
  const [program, setProgram] = useState<RobotInstruction[]>([]);
  const [view, setView] = useState<MazeState>(() => ({
    x: level.robot.x,
    y: level.robot.y,
    dir: level.robot.dir,
    lit: new Set(),
    flash: null,
    showSuccess: false,
  }));
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [blockCount, setBlockCount] = useState(1);

  const workspaceRef = useRef<BlocklyWorkspaceHandle>(null);
  const interpRef = useRef<RobotInterpreter | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetState = useCallback(() => {
    clearTimer();
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    interpRef.current = null;
    setPhase("idle");
    setView({
      x: level.robot.x,
      y: level.robot.y,
      dir: level.robot.dir,
      lit: new Set(),
      flash: null,
      showSuccess: false,
    });
  }, [level]);

  useEffect(() => {
    resetState();
    setXpEarned(null);
    setHintsShown(0);
  }, [resetState]);

  useEffect(
    () => () => {
      clearTimer();
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    },
    [],
  );

  const buildInterpreter = useCallback(() => {
    interpRef.current = new RobotInterpreter(
      program,
      {
        x: level.robot.x,
        y: level.robot.y,
        dir: level.robot.dir,
        lit: new Set(),
      },
      {
        width: level.width,
        height: level.height,
        walls: level.walls,
        dangers: level.dangers,
        targets: new Set(level.targets.map((t) => `${t.x},${t.y}`)),
      },
    );
  }, [program, level]);

  /** Advance one step. Returns true if another step can follow. */
  const advanceOne = useCallback((): boolean => {
    const interp = interpRef.current;
    if (!interp) return false;

    const result = interp.next();

    if (result.kind === "done") {
      // Check if all targets are lit
      const lit = interp.state.lit;
      const won = level.targets.every((tg) => lit.has(`${tg.x},${tg.y}`));
      if (won) {
        setPhase("success");
        setView((v) => ({ ...v, showSuccess: true }));
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        submitCompletion();
      } else {
        setPhase("idle");
        toast.message(
          locale === "en"
            ? "Not all eggs collected! Try again."
            : "Бүх өндөг цуглуулаагүй байна! Дахин оролдоно уу.",
        );
      }
      return false;
    }

    if (result.kind === "blocked") {
      // Crash into wall
      const [dx, dy] = dirVec(interp.state.dir);
      const crashX = interp.state.x + dx;
      const crashY = interp.state.y + dy;
      setView((v) => ({
        ...v,
        flash: { x: crashX, y: crashY, kind: "crash" },
      }));
      flashTimerRef.current = setTimeout(() => {
        setView((v) => ({ ...v, flash: null }));
      }, 800);
      setPhase("crash");
      return false;
    }

    if (result.kind === "danger") {
      // TNT explosion
      setView((v) => ({
        x: interp.state.x,
        y: interp.state.y,
        dir: interp.state.dir,
        lit: new Set(interp.state.lit),
        flash: { x: interp.state.x, y: interp.state.y, kind: "danger" },
      }));
      flashTimerRef.current = setTimeout(() => {
        setView((v) => ({ ...v, flash: null }));
      }, 1000);
      setPhase("danger");
      return false;
    }

    // Normal step
    setView((v) => ({
      x: interp.state.x,
      y: interp.state.y,
      dir: interp.state.dir,
      lit: new Set(interp.state.lit),
      flash: null,
      showSuccess: false,
    }));
    return true;
  }, [level, locale]);

  const onRun = () => {
    if (program.length === 0) {
      toast.message(
        locale === "en"
          ? "Add some instructions first"
          : "Эхлээд заавар нэмнэ үү",
      );
      return;
    }
    resetState();
    buildInterpreter();
    setPhase("running");
    timerRef.current = setTimeout(function loop() {
      if (advanceOne()) {
        timerRef.current = setTimeout(loop, STEP_MS);
      }
    }, 80);
  };

  const onStep = () => {
    if (program.length === 0) {
      toast.message(
        locale === "en"
          ? "Add some instructions first"
          : "Эхлээд заавар нэмнэ үү",
      );
      return;
    }
    clearTimer();
    if (!interpRef.current) {
      buildInterpreter();
      setPhase("running");
    }
    advanceOne();
  };

  const submitCompletion = async () => {
    if (completed.has(level.id)) {
      setXpEarned(0);
      return;
    }
    try {
      const res = await fetch("/api/robot/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level_id: level.id,
          instruction_count: 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Save failed");
        setXpEarned(0);
        return;
      }
      setXpEarned(data.xp_awarded ?? 0);
      setCompleted((prev) => new Set(prev).add(level.id));
      if ((data.xp_awarded ?? 0) > 0) {
        toast.success(`+${data.xp_awarded} XP`);
        router.refresh();
      }
    } catch {
      toast.error("Network error");
    }
  };

  const nextLevel = () => {
    if (levelIdx < levels.length - 1) setLevelIdx(levelIdx + 1);
  };

  const levelName = locale === "en" ? level.name_en : level.name_mn;
  const levelHint = locale === "en" ? level.hint_en : level.hint_mn;
  const completedCount = completed.size;

  const extraHints = (locale === "en" ? level.hints_en : level.hints_mn) ?? [];
  const visibleExtraHints = extraHints.slice(0, hintsShown);
  const canShowMoreHints = hintsShown < extraHints.length;

  const levelsByCourse = COURSES.map((c) => ({
    course: c,
    levels: levels
      .map((l, idx) => ({ ...l, idx }))
      .filter((l) => l.course === c.id),
  }));

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      {/* Top header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 shrink-0">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("progress")}
          </div>
          <div className="font-bold tabular-nums">
            {completedCount} / {total}
          </div>
        </div>
      </div>

      {/* Progress dots grouped by course */}
      <div className="space-y-1.5">
        {levelsByCourse.map(({ course: c, levels }) => (
          <div key={c.id} className="flex items-center gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground min-w-[80px] sm:min-w-[110px]">
              {locale === "en" ? c.name_en : c.name_mn}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {levels.map((l) => {
                const isCurrent = l.idx === levelIdx;
                const isCompleted = completed.has(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => setLevelIdx(l.idx)}
                    className={cn(
                      "shrink-0 h-6 w-6 rounded-full text-[11px] font-semibold flex items-center justify-center transition-all border-2",
                      isCurrent ? "border-violet-500" : "border-transparent",
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted-foreground/20",
                    )}
                    title={locale === "en" ? l.name_en : l.name_mn}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      l.idx + 1
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Level header with hint */}
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 flex items-start gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground tabular-nums">
              {t("level")} {levelIdx + 1}
            </span>
            <span className="font-semibold">{levelName}</span>
            {completed.has(level.id) && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            <span className="text-xs rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
              {locale === "en" ? course.name_en : course.name_mn}
            </span>
          </div>
          <div className="flex items-start gap-2 flex-1 min-w-[200px] ml-auto">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-muted-foreground space-y-0.5">
              <p>{levelHint}</p>
              {visibleExtraHints.map((h, i) => (
                <p key={i} className="text-amber-700 dark:text-amber-400">
                  {h}
                </p>
              ))}
            </div>
            {canShowMoreHints && (
              <button
                onClick={() => setHintsShown((n) => n + 1)}
                className="text-xs text-violet-600 hover:underline shrink-0"
              >
                {t("more_hint")}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,_2fr)_3fr] gap-3">
        {/* LEFT: maze + run controls */}
        <div className="space-y-3">
          <div className="relative">
            <PhaserMaze
              level={level}
              themeId={course.theme}
              view={{
                robotX: view.x,
                robotY: view.y,
                robotDir: view.dir,
                litTiles: view.lit,
              }}
            />

            {phase === "success" && (
              <Overlay>
                <Sparkles className="h-10 w-10 text-amber-300 mb-1" />
                <h2 className="text-2xl font-bold text-white">
                  {t("success")}
                </h2>
                {xpEarned !== null && xpEarned > 0 && (
                  <p className="text-amber-300 text-base font-semibold mt-1">
                    +{xpEarned} XP
                  </p>
                )}
                {xpEarned === 0 && (
                  <p className="text-white/60 text-xs mt-1">
                    {t("already_done")}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={resetState}>
                    <RotateCcw className="h-4 w-4 mr-1.5" />
                    {t("play_again")}
                  </Button>
                  {levelIdx < levels.length - 1 && (
                    <Button
                      size="sm"
                      onClick={nextLevel}
                      className="bg-violet-600 text-white hover:bg-violet-700"
                    >
                      {t("next_level")}
                      <ChevronRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  )}
                </div>
              </Overlay>
            )}

            {phase === "crash" && (
              <Overlay variant="danger">
                <AlertTriangle className="h-10 w-10 text-amber-400 mb-1" />
                <h2 className="text-xl font-bold text-white">
                  {locale === "en" ? "CRASH!" : "МӨРГӨЛДӨӨ!"}
                </h2>
                <p className="text-white/60 text-xs mt-1">
                  {locale === "en"
                    ? "YOU HIT A WALL. Try again."
                    : "ХАНА МӨРГӨСӨН. Дахин оролдоно уу."}
                </p>
                <Button
                  size="sm"
                  onClick={resetState}
                  className="bg-violet-600 text-white hover:bg-violet-700 mt-3"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  {t("try_again")}
                </Button>
              </Overlay>
            )}

            {phase === "danger" && (
              <Overlay variant="danger">
                <Bomb className="h-10 w-10 text-rose-400 mb-1" />
                <h2 className="text-xl font-bold text-white">
                  {locale === "en" ? "TNT!" : "ТЭСЭРСЭН!"}
                </h2>
                <p className="text-white/60 text-xs mt-1">
                  {locale === "en"
                    ? "YOU HIT A TNT. Try again."
                    : "ТЭСРЭХ БОДИС ДЭЭР ГИШГЭСЭН. Дахин оролдоно уу."}
                </p>
                <Button
                  size="sm"
                  onClick={resetState}
                  className="bg-violet-600 text-white hover:bg-violet-700 mt-3"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  {t("try_again")}
                </Button>
              </Overlay>
            )}
          </div>

          {/* Big Run button */}
          <button
            onClick={onRun}
            disabled={phase === "running" || program.length === 0}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 text-base font-bold shadow-md transition-all",
              "bg-amber-500 text-white hover:bg-amber-600 active:translate-y-0.5",
              "disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed disabled:active:translate-y-0",
            )}
          >
            <Play className="h-5 w-5 fill-white" />
            {t("run")}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onStep}
              disabled={program.length === 0}
            >
              <StepForward className="h-4 w-4 mr-1.5" />
              {t("step")}
            </Button>
            <Button variant="outline" onClick={resetState}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              {t("reset")}
            </Button>
          </div>
        </div>

        {/* RIGHT: Blockly workspace */}
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              "self-end inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums",
              blockCount >= level.max_blocks
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                : blockCount > level.max_blocks - 2
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {t("blocks")}: {blockCount} / {level.max_blocks}
          </div>
          <div className="min-h-[480px] lg:min-h-[560px] flex-1">
            <BlocklyWorkspace
              ref={workspaceRef}
              allowed={level.palette}
              labels={blockLabels}
              levelKey={level.id}
              onChange={setProgram}
              onBlockCount={setBlockCount}
              maxBlocks={level.max_blocks}
              readOnly={phase === "running"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- helpers ----------

function dirVec(dir: Direction): [number, number] {
  if (dir === 0) return [0, 1];
  if (dir === 1) return [1, 0];
  if (dir === 2) return [0, -1];
  return [-1, 0];
}

function Overlay({
  children,
  variant = "success",
}: {
  children: React.ReactNode;
  variant?: "success" | "danger";
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center px-4 text-center rounded-xl",
        variant === "success" ? "bg-black/70" : "bg-red-950/80",
      )}
    >
      {children}
    </div>
  );
}

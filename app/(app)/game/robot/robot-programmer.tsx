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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BlocklyWorkspace,
  type BlocklyWorkspaceHandle,
} from "@/components/blockly-workspace";
import { cn } from "@/lib/utils";
import { celebrate } from "@/lib/celebrate";
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
  /** Stars/keys already picked up — the renderer hides those tiles. */
  collected?: Set<string>;
  /** Whether the robot is carrying a key (doors render open). */
  hasKey?: boolean;
  /** Live positions of patrolling hazards. */
  movers?: { x: number; y: number }[];
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
        collected: new Set(),
        keys: 0,
        movers: [],
      },
      {
        width: level.width,
        height: level.height,
        walls: level.walls,
        dangers: level.dangers,
        targets: new Set(level.targets.map((t) => `${t.x},${t.y}`)),
        stars: level.stars,
        keys: level.keys,
        doors: level.doors,
        portals: level.portals,
        movers: level.movers,
      },
    );
  }, [program, level]);

  /** Advance one step. Returns true if another step can follow. */
  const advanceOne = useCallback((): boolean => {
    const interp = interpRef.current;
    if (!interp) return false;

    const result = interp.next();

    if (result.kind === "done") {
      // Win = every egg lit AND every star picked up.
      const lit = interp.state.lit;
      const allEggs = level.targets.every((tg) => lit.has(`${tg.x},${tg.y}`));
      const allStars = [...level.stars].every((k) =>
        interp.state.collected.has(k),
      );
      const won = allEggs && allStars;
      if (won) {
        setPhase("success");
        setView((v) => ({ ...v, showSuccess: true }));
        celebrate({ intensity: 2 });
        submitCompletion();
      } else {
        setPhase("idle");
        const msg = !allStars
          ? locale === "en"
            ? "You missed some stars! Try again."
            : "Од дутуу байна! Дахин оролдоно уу."
          : locale === "en"
            ? "Not all eggs collected! Try again."
            : "Бүх өндөг цуглуулаагүй байна! Дахин оролдоно уу.";
        toast.message(msg);
      }
      return false;
    }

    // Door without a key — treated like a crash, with its own message.
    if (result.kind === "locked") {
      const [ldx, ldy] = dirVec(interp.state.dir);
      setView((v) => ({
        ...v,
        flash: {
          x: interp.state.x + ldx,
          y: interp.state.y + ldy,
          kind: "crash",
        },
      }));
      flashTimerRef.current = setTimeout(
        () => setView((v) => ({ ...v, flash: null })),
        800,
      );
      setPhase("crash");
      toast.message(
        locale === "en"
          ? "The door is locked — find the key first!"
          : "Хаалга түгжээтэй — эхлээд түлхүүрээ ол!",
      );
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
      setView(() => ({
        x: interp.state.x,
        y: interp.state.y,
        dir: interp.state.dir,
        lit: new Set(interp.state.lit),
        collected: new Set(interp.state.collected),
        hasKey: interp.state.keys > 0,
        movers: interp.state.movers.map((m) => ({ x: m.x, y: m.y })),
        flash: { x: interp.state.x, y: interp.state.y, kind: "danger" },
      }));
      flashTimerRef.current = setTimeout(() => {
        setView((v) => ({ ...v, flash: null }));
      }, 1000);
      setPhase("danger");
      return false;
    }

    // Normal step (also covers collect / key / portal — all keep running)
    setView(() => ({
      x: interp.state.x,
      y: interp.state.y,
      dir: interp.state.dir,
      lit: new Set(interp.state.lit),
      collected: new Set(interp.state.collected),
      hasKey: interp.state.keys > 0,
      movers: interp.state.movers.map((m) => ({ x: m.x, y: m.y })),
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

  // Explain only the props this level contains, so it never overwhelms.
  const en = locale === "en";
  const legendItems = [
    level.dangers.size > 0 && {
      glyph: "💣",
      label: en ? "Bomb — avoid!" : "Бөмбөг — зайлсхий!",
    },
    level.stars.size > 0 && {
      glyph: "⭐",
      label: en ? "Collect every star" : "Бүх одыг цуглуул",
    },
    level.keys.size > 0 && {
      glyph: "🔑",
      label: en ? "Key opens doors" : "Түлхүүр хаалга нээнэ",
    },
    level.doors.size > 0 && {
      glyph: "🚪",
      label: en ? "Locked door" : "Түгжээтэй хаалга",
    },
    level.portals.length > 0 && {
      glyph: "🌀",
      label: en ? "Portal — teleports you" : "Портал — зөөнө",
    },
    level.movers.length > 0 && {
      glyph: "🔴",
      label: en ? "Moving hazard" : "Хөдөлгөөнт аюул",
    },
  ].filter(Boolean) as { glyph: string; label: string }[];

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
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neon-violet/40 bg-neon-violet/10 text-neon-violet"
        >
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">//</span>
            ROBOT.LAB
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="text-right">
          <div className="hud-label">{t("progress")}</div>
          <div className="font-code text-lg font-bold tabular-nums text-neon-lime text-glow-soft">
            {completedCount}
            <span className="text-muted-foreground">/{total}</span>
          </div>
          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted ring-1 ring-primary/15">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${total > 0 ? (completedCount / total) * 100 : 0}%`,
                background: "var(--gradient-solved)",
                }}
            />
          </div>
        </div>
      </div>

      {/* Progress dots grouped by course */}
      <div className="space-y-1.5">
        {levelsByCourse.map(({ course: c, levels }) => (
          <div key={c.id} className="flex items-center gap-2">
            <div className="hud-label min-w-[80px] sm:min-w-[110px]">
              {locale === "en" ? c.name_en : c.name_mn}
            </div>
            {/* overflow-y-hidden: the scaled-up current chip would otherwise
                push a vertical scrollbar (with arrows) into this strip. */}
            <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:thin]">
              {levels.map((l) => {
                const isCurrent = l.idx === levelIdx;
                const isCompleted = completed.has(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => setLevelIdx(l.idx)}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-code text-[11px] font-semibold transition-all",
                      isCurrent
                        ? "border-primary text-primary shadow-[0_0_14px_-3px_var(--color-primary)] scale-110"
                        : "border-transparent",
                      isCompleted
                        ? "border-neon-lime/50 bg-neon-lime/15 text-neon-lime"
                        : !isCurrent &&
                            "bg-muted text-muted-foreground hover:bg-muted-foreground/20",
                    )}
                    title={`${l.order_idx}. ${locale === "en" ? l.name_en : l.name_mn}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      l.order_idx
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
            <span className="hud-chip">
              {t("level")} {level.order_idx}
            </span>
            <span className="font-semibold">{levelName}</span>
            {completed.has(level.id) && (
              <CheckCircle2 className="h-4 w-4 text-neon-lime drop-shadow-[0_0_5px_var(--neon-lime)]" />
            )}
            <span className="rounded-full bg-muted px-2 py-0.5 font-code text-[10px] uppercase tracking-wider text-muted-foreground">
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
                className="shrink-0 font-code text-xs text-primary hover:underline"
              >
                {t("more_hint")}
              </button>
            )}
          </div>
        </div>

        {/* Legend — only shows the props this level actually uses. */}
        {legendItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-primary/10 px-4 py-2">
            <span className="hud-label">{locale === "en" ? "WATCH FOR" : "АНХААР"}</span>
            {legendItems.map((it) => (
              <span
                key={it.label}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              >
                <span aria-hidden>{it.glyph}</span>
                {it.label}
              </span>
            ))}
          </div>
        )}
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
                collected: view.collected,
                hasKey: view.hasKey,
                movers: view.movers,
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
                      className="font-code"
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
                  className="font-code mt-3"
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
                  className="font-code mt-3"
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

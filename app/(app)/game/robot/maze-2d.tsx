"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import type { Level, ThemeId } from "./levels";
import { COURSE_THEMES } from "./levels";

const STEP_MS = 360;

export interface MazeView {
  robotX: number;
  robotY: number;
  robotDir: number; // radians used by the visual rotation
  litTiles: Set<string>;
  pendingHighlight?: { x: number; y: number } | null;
  flash?: { x: number; y: number; kind: "crash" | "danger" };
}

interface Props {
  level: Level;
  themeId: ThemeId;
  view: MazeView;
}

/**
 * Pure 2D renderer. Robot is an absolutely-positioned element that animates
 * via CSS transitions (no useFrame, no Three.js). Much cheaper than the 3D
 * scene and matches the Code.org "Classic Maze" feel.
 */
export function Maze2D({ level, themeId, view }: Props) {
  const theme = COURSE_THEMES[themeId];

  // Stable per-tile data
  const tiles = useMemo(() => {
    const out: { x: number; y: number; isTarget: boolean }[] = [];
    // Render top-row first so grid template flows correctly: y from top (height-1) to 0
    for (let y = level.height - 1; y >= 0; y--) {
      for (let x = 0; x < level.width; x++) {
        const isTarget = level.targets.some((t) => t.x === x && t.y === y);
        out.push({ x, y, isTarget });
      }
    }
    return out;
  }, [level]);

  // Visual robot position: animate from (oldX, oldY) to (view.robotX, view.robotY) via CSS transition.
  // We track a "rendered" position to re-trigger transitions.
  const [render, setRender] = useState({
    x: view.robotX,
    y: view.robotY,
    rot: view.robotDir,
  });

  // Update render state on each view change. CSS transition handles tweening.
  useEffect(() => {
    setRender({ x: view.robotX, y: view.robotY, rot: view.robotDir });
  }, [view.robotX, view.robotY, view.robotDir]);

  // Theme-specific tile background classes (using Tailwind classes for nice rendering)
  const themePalette = TILE_PALETTES[themeId];

  return (
    <div
      className={cn(
        "relative aspect-square w-full rounded-xl overflow-hidden p-2 shadow-inner bg-gradient-to-br",
        theme.bg,
      )}
      style={{
        // Reserve a constant size so the robot's % positions are stable
        ["--cols" as never]: level.width,
        ["--rows" as never]: level.height,
      }}
    >
      {/* Tile grid */}
      <div
        className="grid w-full h-full gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${level.width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${level.height}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((t) => {
          const lit = view.litTiles.has(`${t.x},${t.y}`);
          return (
            <div
              key={`${t.x},${t.y}`}
              className={cn(
                "rounded-sm transition-colors",
                themePalette.tile,
                t.isTarget && !lit && themePalette.target,
                lit && themePalette.lit,
              )}
            >
              {t.isTarget && !lit && (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className={cn(
                      "block h-1/2 w-1/2 rounded-full ring-2 ring-inset",
                      themePalette.targetDot,
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Robot */}
      <Robot
        x={render.x}
        y={render.y}
        rotation={render.rot}
        cols={level.width}
        rows={level.height}
      />
    </div>
  );
}

function Robot({
  x,
  y,
  rotation,
  cols,
  rows,
}: {
  x: number;
  y: number;
  rotation: number;
  cols: number;
  rows: number;
}) {
  // Position in % of container, accounting for the small (p-2) padding via padding-aware coords.
  // The grid is inset by 8px (p-2). We approximate with raw % which is close enough; the robot
  // sits ON TOP of the grid so a small offset error doesn't affect gameplay.
  const stepX = 100 / cols;
  const stepY = 100 / rows;
  const left = x * stepX + stepX / 2; // center of cell
  // y=0 is bottom in our grid coords; CSS top grows downward
  const top = (rows - 1 - y) * stepY + stepY / 2;

  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${stepX}%`,
        height: `${stepY}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}rad)`,
        transition: `left ${STEP_MS}ms cubic-bezier(.33,.1,.25,1), top ${STEP_MS}ms cubic-bezier(.33,.1,.25,1), transform ${STEP_MS}ms cubic-bezier(.33,.1,.25,1)`,
      }}
    >
      <div className="relative w-[78%] h-[78%]">
        {/* Body */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-violet-400 to-violet-700 shadow-lg shadow-violet-900/40 border-2 border-violet-300" />
        {/* Direction triangle (points up = forward) */}
        <div
          className="absolute left-1/2 -top-2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "10px solid #f59e0b",
          }}
        />
        {/* Eyes */}
        <div className="absolute top-[28%] left-[20%] w-[18%] h-[18%] rounded-full bg-white" />
        <div className="absolute top-[28%] right-[20%] w-[18%] h-[18%] rounded-full bg-white" />
        <div className="absolute top-[34%] left-[26%] w-[7%] h-[7%] rounded-full bg-slate-900" />
        <div className="absolute top-[34%] right-[26%] w-[7%] h-[7%] rounded-full bg-slate-900" />
        {/* Mouth */}
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[40%] h-[10%] rounded-b-full bg-slate-900/70" />
      </div>
    </div>
  );
}

// Per-theme Tailwind class sets so JIT can pick them up.
const TILE_PALETTES: Record<
  ThemeId,
  { tile: string; target: string; lit: string; targetDot: string }
> = {
  ice: {
    tile: "bg-indigo-900/70 ring-1 ring-inset ring-indigo-800/60",
    target: "bg-violet-700/70 ring-1 ring-inset ring-violet-500/60",
    lit: "bg-amber-300 ring-2 ring-inset ring-amber-500 shadow-[0_0_18px_rgba(252,211,77,0.55)]",
    targetDot: "ring-violet-300/70 bg-violet-500/30",
  },
  jungle: {
    tile: "bg-emerald-800/70 ring-1 ring-inset ring-emerald-700/60",
    target: "bg-emerald-600/70 ring-1 ring-inset ring-emerald-400/60",
    lit: "bg-amber-200 ring-2 ring-inset ring-amber-400 shadow-[0_0_18px_rgba(252,211,77,0.55)]",
    targetDot: "ring-emerald-200 bg-emerald-400/30",
  },
  space: {
    tile: "bg-slate-800/80 ring-1 ring-inset ring-slate-700/60",
    target: "bg-fuchsia-800/70 ring-1 ring-inset ring-fuchsia-500/60",
    lit: "bg-cyan-300 ring-2 ring-inset ring-cyan-500 shadow-[0_0_18px_rgba(103,232,249,0.55)]",
    targetDot: "ring-fuchsia-300/70 bg-fuchsia-500/30",
  },
  lava: {
    tile: "bg-orange-900/70 ring-1 ring-inset ring-orange-700/60",
    target: "bg-orange-600/70 ring-1 ring-inset ring-orange-400/60",
    lit: "bg-yellow-200 ring-2 ring-inset ring-yellow-400 shadow-[0_0_22px_rgba(253,224,71,0.65)]",
    targetDot: "ring-orange-200/80 bg-orange-400/30",
  },
};

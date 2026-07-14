"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import type { Level, ThemeId } from "./levels";

const TILE = 100; // SVG units per cell
const BORDER = 1; // tiles of decorative border

export interface MazeView {
  robotX: number;
  robotY: number;
  /** Direction in radians (CSS sense — clockwise positive). */
  robotDir: number;
  litTiles: Set<string>;
}

interface Props {
  level: Level;
  themeId: ThemeId;
  view: MazeView;
}

type Palette = {
  bg: string;
  tileTop: string;
  tileBottom: string;
  tileEdge: string;
  bladeDark: string;
  bladeLight: string;
  flower1: string;
  flower2: string;
  mushroomCap: string;
  mushroomStem: string;
  borderTop: string;
  borderBottom: string;
  borderEdge: string;
  borderDot: string;
  targetBase: string;
  targetRim: string;
  gem: string;
  gemHi: string;
  glow: string;
  litTop: string;
  litBottom: string;
  treeLeaf: string;
  treeLeafDark: string;
  treeTrunk: string;
};

const PALETTES: Record<ThemeId, Palette> = {
  jungle: {
    bg: "from-emerald-800 via-emerald-700 to-green-900",
    tileTop: "#86d960",
    tileBottom: "#3f9c2c",
    tileEdge: "#2d6b1c",
    bladeDark: "#1f4d12",
    bladeLight: "#a8e676",
    flower1: "#fde047",
    flower2: "#f87171",
    mushroomCap: "#dc2626",
    mushroomStem: "#fef3c7",
    borderTop: "#caa472",
    borderBottom: "#8a6a3f",
    borderEdge: "#5a4222",
    borderDot: "#a78c5e",
    targetBase: "#fcd34d",
    targetRim: "#f59e0b",
    gem: "#fef3c7",
    gemHi: "#ffffff",
    glow: "#fbbf24",
    litTop: "#fde68a",
    litBottom: "#f59e0b",
    treeLeaf: "#16a34a",
    treeLeafDark: "#0f5f29",
    treeTrunk: "#7c4a1c",
  },
  ice: {
    bg: "from-slate-800 via-indigo-900 to-violet-950",
    tileTop: "#c7d2fe",
    tileBottom: "#6366f1",
    tileEdge: "#4338ca",
    bladeDark: "#1e1b4b",
    bladeLight: "#e0e7ff",
    flower1: "#f9a8d4",
    flower2: "#fbcfe8",
    mushroomCap: "#7c3aed",
    mushroomStem: "#ddd6fe",
    borderTop: "#94a3b8",
    borderBottom: "#475569",
    borderEdge: "#1f2937",
    borderDot: "#cbd5e1",
    targetBase: "#a78bfa",
    targetRim: "#7c3aed",
    gem: "#e9d5ff",
    gemHi: "#ffffff",
    glow: "#a855f7",
    litTop: "#fef9c3",
    litBottom: "#fbbf24",
    treeLeaf: "#6366f1",
    treeLeafDark: "#3730a3",
    treeTrunk: "#4b5563",
  },
  space: {
    bg: "from-black via-slate-950 to-indigo-950",
    tileTop: "#475569",
    tileBottom: "#1e293b",
    tileEdge: "#0f172a",
    bladeDark: "#020617",
    bladeLight: "#94a3b8",
    flower1: "#22d3ee",
    flower2: "#a5f3fc",
    mushroomCap: "#a855f7",
    mushroomStem: "#e2e8f0",
    borderTop: "#475569",
    borderBottom: "#1e293b",
    borderEdge: "#020617",
    borderDot: "#64748b",
    targetBase: "#c084fc",
    targetRim: "#9333ea",
    gem: "#67e8f9",
    gemHi: "#cffafe",
    glow: "#06b6d4",
    litTop: "#67e8f9",
    litBottom: "#0891b2",
    treeLeaf: "#06b6d4",
    treeLeafDark: "#0e7490",
    treeTrunk: "#334155",
  },
  lava: {
    bg: "from-rose-950 via-red-900 to-orange-950",
    tileTop: "#9a3412",
    tileBottom: "#7c2d12",
    tileEdge: "#431407",
    bladeDark: "#3f1d0e",
    bladeLight: "#fb923c",
    flower1: "#fcd34d",
    flower2: "#fde68a",
    mushroomCap: "#7f1d1d",
    mushroomStem: "#fef3c7",
    borderTop: "#a16207",
    borderBottom: "#713f12",
    borderEdge: "#3f1d0e",
    borderDot: "#ca8a04",
    targetBase: "#fb923c",
    targetRim: "#c2410c",
    gem: "#fef3c7",
    gemHi: "#ffffff",
    glow: "#fbbf24",
    litTop: "#fef9c3",
    litBottom: "#fbbf24",
    treeLeaf: "#dc2626",
    treeLeafDark: "#7f1d1d",
    treeTrunk: "#451a03",
  },
};

export function MazeCanvas({ level, themeId, view }: Props) {
  const W = level.width * TILE;
  const H = level.height * TILE;
  const pal = PALETTES[themeId];

  // Extend viewBox by BORDER tiles in each direction
  const vbX = -BORDER * TILE;
  const vbY = -BORDER * TILE;
  const vbW = W + 2 * BORDER * TILE;
  const vbH = H + 2 * BORDER * TILE;

  const tiles = useMemo(() => {
    const out: { x: number; y: number; isTarget: boolean }[] = [];
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        out.push({
          x,
          y,
          isTarget: level.targets.some((t) => t.x === x && t.y === y),
        });
      }
    }
    return out;
  }, [level]);

  // Border decorations: trees in the 4 corners of the border ring.
  const treeCorners = useMemo(
    () => [
      { x: -TILE / 2, y: -TILE / 2 },
      { x: W + TILE / 2 - 30, y: -TILE / 2 },
      { x: -TILE / 2, y: H + TILE / 2 - 30 },
      { x: W + TILE / 2 - 30, y: H + TILE / 2 - 30 },
    ],
    [W, H],
  );

  const robotPxX = view.robotX * TILE + TILE / 2;
  const robotPxY = (level.height - 1 - view.robotY) * TILE + TILE / 2;
  const rotateDeg = (view.robotDir * 180) / Math.PI;

  // Detect whether the robot is currently animating from a position change.
  const [isMoving, setIsMoving] = useState(false);
  useEffect(() => {
    setIsMoving(true);
    const t = setTimeout(() => setIsMoving(false), 320);
    return () => clearTimeout(t);
  }, [view.robotX, view.robotY, view.robotDir]);

  return (
    <div
      className={`relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${pal.bg} shadow-inner`}
    >
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id={`tileGrad-${themeId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.tileTop} />
            <stop offset="100%" stopColor={pal.tileBottom} />
          </linearGradient>
          <linearGradient id={`litGrad-${themeId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.litTop} />
            <stop offset="100%" stopColor={pal.litBottom} />
          </linearGradient>
          <linearGradient id={`borderGrad-${themeId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.borderTop} />
            <stop offset="100%" stopColor={pal.borderBottom} />
          </linearGradient>
          <radialGradient id={`glowGrad-${themeId}`}>
            <stop offset="0%" stopColor={pal.glow} stopOpacity="0.7" />
            <stop offset="100%" stopColor={pal.glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="robotBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="60%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="robotPlateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Border tiles */}
        <BorderRing
          cols={level.width}
          rows={level.height}
          pal={pal}
          themeId={themeId}
        />

        {/* Corner trees */}
        {treeCorners.map((c, i) => (
          <g key={i} transform={`translate(${c.x}, ${c.y})`}>
            <Tree pal={pal} variant={i % 2} />
          </g>
        ))}

        {/* Playable tiles */}
        {tiles.map((t) => {
          const lit = view.litTiles.has(`${t.x},${t.y}`);
          const seed = t.x * 13 + t.y * 7 + 1;
          return (
            <g
              key={`${t.x},${t.y}`}
              transform={`translate(${t.x * TILE}, ${(level.height - 1 - t.y) * TILE})`}
            >
              {lit ? (
                <LitTile pal={pal} themeId={themeId} />
              ) : t.isTarget ? (
                <TargetTile pal={pal} themeId={themeId} />
              ) : (
                <GrassTile pal={pal} themeId={themeId} seed={seed} />
              )}
            </g>
          );
        })}

        {/* Robot */}
        <motion.g
          initial={false}
          animate={{ x: robotPxX, y: robotPxY, rotate: rotateDeg }}
          transition={{
            type: "tween",
            duration: 0.3,
            ease: [0.33, 0.1, 0.25, 1],
          }}
        >
          <g className={isMoving ? "robot-walking" : "robot-idle"}>
            <Robot isMoving={isMoving} />
          </g>
        </motion.g>
      </svg>

      <style jsx>{`
        :global(.robot-idle) {
          animation: idleBob 1.6s ease-in-out infinite;
        }
        @keyframes idleBob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        :global(.robot-walking) {
          animation: walkBob 0.35s ease-in-out infinite;
        }
        @keyframes walkBob {
          0%,
          100% {
            transform: translateY(0) scaleY(1);
          }
          50% {
            transform: translateY(-4px) scaleY(1.04);
          }
        }
        :global(.tread-roll) {
          animation: treadRoll 0.32s linear infinite;
        }
        @keyframes treadRoll {
          to {
            transform: translateX(-8px);
          }
        }
        :global(.target-pulse) {
          animation: targetPulse 2.2s ease-in-out infinite;
        }
        @keyframes targetPulse {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 0.95;
          }
        }
        :global(.gem-spin) {
          animation: gemSpin 4s linear infinite;
        }
        @keyframes gemSpin {
          to {
            transform: rotate(360deg);
          }
        }
        :global(.lit-sparkle) {
          animation: litSparkle 1.6s ease-in-out infinite;
        }
        @keyframes litSparkle {
          0%,
          100% {
            opacity: 0.85;
          }
          50% {
            opacity: 0.3;
          }
        }
        :global(.tree-sway) {
          animation: treeSway 4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes treeSway {
          0%,
          100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }
      `}</style>
    </div>
  );
}

// ============ Border ring + decorations ============

function BorderRing({
  cols,
  rows,
  pal,
  themeId,
}: {
  cols: number;
  rows: number;
  pal: Palette;
  themeId: ThemeId;
}) {
  // Top + bottom rows of border
  const cells: { x: number; y: number; seed: number }[] = [];
  for (let i = -1; i <= cols; i++) {
    cells.push({ x: i, y: -1, seed: i * 3 + 1 });
    cells.push({ x: i, y: rows, seed: i * 5 + 2 });
  }
  for (let j = 0; j < rows; j++) {
    cells.push({ x: -1, y: j, seed: j * 11 + 3 });
    cells.push({ x: cols, y: j, seed: j * 17 + 4 });
  }
  return (
    <>
      {cells.map((c) => (
        <g
          key={`b-${c.x},${c.y}`}
          transform={`translate(${c.x * TILE}, ${(rows - 1 - c.y) * TILE})`}
        >
          <BorderTile pal={pal} themeId={themeId} seed={c.seed} />
        </g>
      ))}
    </>
  );
}

function BorderTile({
  pal,
  themeId,
  seed,
}: {
  pal: Palette;
  themeId: ThemeId;
  seed: number;
}) {
  // Pseudo-random dot positions for texture
  const dots = [
    { x: (seed * 7) % 70 + 15, y: (seed * 11) % 70 + 15, r: 2 },
    { x: (seed * 13) % 70 + 15, y: (seed * 17) % 70 + 15, r: 1.5 },
    { x: (seed * 19) % 70 + 15, y: (seed * 23) % 70 + 15, r: 1 },
  ];
  return (
    <g>
      <rect
        x={2}
        y={2}
        width={TILE - 4}
        height={TILE - 4}
        rx={6}
        fill={`url(#borderGrad-${themeId})`}
        stroke={pal.borderEdge}
        strokeWidth={1.5}
      />
      <rect
        x={4}
        y={3}
        width={TILE - 8}
        height={6}
        rx={3}
        fill="#ffffff"
        opacity={0.12}
      />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={pal.borderDot} opacity={0.5} />
      ))}
    </g>
  );
}

function Tree({ pal, variant }: { pal: Palette; variant: number }) {
  // A simple stylized tree. Variant changes leaf shape.
  return (
    <g className="tree-sway">
      {/* Trunk */}
      <rect x={20} y={50} width={10} height={32} rx={3} fill={pal.treeTrunk} />
      {/* Leaves */}
      {variant === 0 ? (
        <>
          <circle cx={25} cy={40} r={20} fill={pal.treeLeafDark} />
          <circle cx={18} cy={32} r={14} fill={pal.treeLeaf} />
          <circle cx={32} cy={32} r={14} fill={pal.treeLeaf} />
          <circle cx={25} cy={22} r={12} fill={pal.treeLeaf} />
        </>
      ) : (
        <>
          <ellipse cx={25} cy={35} rx={22} ry={18} fill={pal.treeLeafDark} />
          <ellipse cx={25} cy={30} rx={16} ry={14} fill={pal.treeLeaf} />
          <ellipse cx={20} cy={26} rx={6} ry={4} fill="#ffffff" opacity={0.2} />
        </>
      )}
    </g>
  );
}

// ============ Playable tile sprites ============

function GrassTile({
  pal,
  themeId,
  seed,
}: {
  pal: Palette;
  themeId: ThemeId;
  seed: number;
}) {
  const tuftA = [(seed * 7) % 70 + 12, (seed * 11) % 25 + 65];
  const tuftB = [(seed * 13) % 70 + 12, (seed * 17) % 25 + 65];
  // Decoration roll: based on seed, pick none / flower / mushroom / pebble
  const roll = seed % 7;
  return (
    <g>
      <rect
        x={2}
        y={2}
        width={TILE - 4}
        height={TILE - 4}
        rx={6}
        fill={`url(#tileGrad-${themeId})`}
        stroke={pal.tileEdge}
        strokeWidth={1.5}
      />
      <rect
        x={4}
        y={3}
        width={TILE - 8}
        height={7}
        rx={3.5}
        fill={pal.bladeLight}
        opacity={0.2}
      />
      <GrassTuft x={tuftA[0]} y={tuftA[1]} color={pal.bladeDark} />
      <GrassTuft x={tuftB[0]} y={tuftB[1]} color={pal.bladeDark} />
      {roll === 0 && (
        <Flower x={(seed * 19) % 50 + 25} y={(seed * 23) % 30 + 30} pal={pal} />
      )}
      {roll === 1 && (
        <Mushroom x={(seed * 19) % 50 + 25} y={(seed * 23) % 30 + 35} pal={pal} />
      )}
      {roll === 2 && (
        <Pebble x={(seed * 19) % 60 + 20} y={(seed * 23) % 30 + 40} />
      )}
      {/* roll 3..6 → no decoration, keeps things uncluttered */}
    </g>
  );
}

function GrassTuft({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d="M -4,4 Q -2,-3 0,4 Q 2,-2 4,4"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function Flower({ x, y, pal }: { x: number; y: number; pal: Palette }) {
  const color = (x + y) % 2 === 0 ? pal.flower1 : pal.flower2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Petals */}
      <circle cx={-3} cy={-3} r={2.5} fill={color} />
      <circle cx={3} cy={-3} r={2.5} fill={color} />
      <circle cx={-3} cy={3} r={2.5} fill={color} />
      <circle cx={3} cy={3} r={2.5} fill={color} />
      {/* Center */}
      <circle cx={0} cy={0} r={1.6} fill="#fef3c7" stroke="#92400e" strokeWidth={0.4} />
    </g>
  );
}

function Mushroom({ x, y, pal }: { x: number; y: number; pal: Palette }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Stem */}
      <rect x={-2.5} y={-2} width={5} height={6} rx={1.5} fill={pal.mushroomStem} />
      {/* Cap */}
      <ellipse cx={0} cy={-3} rx={6} ry={4} fill={pal.mushroomCap} />
      {/* Spots */}
      <circle cx={-2} cy={-4} r={1} fill="#fff" opacity={0.85} />
      <circle cx={2} cy={-3} r={0.8} fill="#fff" opacity={0.85} />
    </g>
  );
}

function Pebble({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx={0} cy={0} rx={4} ry={2.5} fill="#94a3b8" stroke="#475569" strokeWidth={0.5} />
      <ellipse cx={-1} cy={-0.5} rx={1.5} ry={0.7} fill="#cbd5e1" opacity={0.7} />
    </g>
  );
}

function TargetTile({ pal, themeId }: { pal: Palette; themeId: ThemeId }) {
  return (
    <g>
      <rect
        x={2}
        y={2}
        width={TILE - 4}
        height={TILE - 4}
        rx={6}
        fill={`url(#tileGrad-${themeId})`}
        stroke={pal.tileEdge}
        strokeWidth={1.5}
      />
      <g className="target-pulse">
        <circle
          cx={TILE / 2}
          cy={TILE / 2}
          r={TILE / 2 - 8}
          fill={`url(#glowGrad-${themeId})`}
        />
      </g>
      <ellipse cx={TILE / 2} cy={TILE / 2 + 18} rx={22} ry={6} fill="rgba(0,0,0,0.25)" />
      <circle
        cx={TILE / 2}
        cy={TILE / 2}
        r={20}
        fill={pal.targetRim}
        stroke={pal.tileEdge}
        strokeWidth={1.5}
      />
      <circle cx={TILE / 2} cy={TILE / 2} r={14} fill={pal.targetBase} />
      <g className="gem-spin" transform={`translate(${TILE / 2}, ${TILE / 2})`}>
        <polygon
          points="0,-12 10,0 0,12 -10,0"
          fill={pal.gem}
          stroke={pal.targetRim}
          strokeWidth={1.5}
        />
        <polygon
          points="0,-12 5,-3 0,2 -5,-3"
          fill={pal.gemHi}
          opacity={0.9}
        />
      </g>
    </g>
  );
}

function LitTile({ pal, themeId }: { pal: Palette; themeId: ThemeId }) {
  return (
    <g>
      <rect
        x={2}
        y={2}
        width={TILE - 4}
        height={TILE - 4}
        rx={6}
        fill={`url(#litGrad-${themeId})`}
        stroke={pal.targetRim}
        strokeWidth={2}
      />
      <g className="lit-sparkle">
        <circle
          cx={TILE / 2}
          cy={TILE / 2}
          r={TILE / 2 - 6}
          fill="none"
          stroke={pal.gemHi}
          strokeWidth={2}
          opacity={0.7}
        />
      </g>
      <circle cx={TILE / 2} cy={TILE / 2} r={18} fill={pal.gem} opacity={0.95} />
      <Sparkle x={28} y={28} />
      <Sparkle x={TILE - 28} y={32} />
      <Sparkle x={28} y={TILE - 28} />
      <Sparkle x={TILE - 28} y={TILE - 28} />
    </g>
  );
}

function Sparkle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="lit-sparkle">
      <path
        d="M 0,-5 L 1.5,-1.5 L 5,0 L 1.5,1.5 L 0,5 L -1.5,1.5 L -5,0 L -1.5,-1.5 Z"
        fill="#fff"
        opacity={0.9}
      />
    </g>
  );
}

// ============ Robot character ============

function Robot({ isMoving }: { isMoving: boolean }) {
  return (
    <g>
      {/* Soft ground shadow */}
      <ellipse cx={0} cy={32} rx={28} ry={5} fill="rgba(0,0,0,0.25)" />

      {/* Treads */}
      <rect x={-28} y={14} width={56} height={16} rx={8} fill="#1f1f33" />
      <rect x={-28} y={14} width={56} height={5} rx={2.5} fill="#3b3b5e" />

      {/* Tread pattern (scrolls when moving) — uses clipPath to stay inside treads */}
      <g
        className={isMoving ? "tread-roll" : ""}
        style={{ transformOrigin: "0 22px" }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <rect
            key={i}
            x={-28 + i * 8}
            y={24}
            width={4}
            height={4}
            rx={1}
            fill="#3b3b5e"
            opacity={0.6}
          />
        ))}
      </g>

      {/* Wheel hubs */}
      <circle cx={-18} cy={22} r={4.5} fill="#4b4b73" stroke="#1f1f33" strokeWidth={1} />
      <circle cx={0} cy={22} r={4.5} fill="#4b4b73" stroke="#1f1f33" strokeWidth={1} />
      <circle cx={18} cy={22} r={4.5} fill="#4b4b73" stroke="#1f1f33" strokeWidth={1} />

      {/* Body */}
      <rect
        x={-26}
        y={-26}
        width={52}
        height={42}
        rx={12}
        fill="url(#robotBodyGrad)"
        stroke="#4c1d95"
        strokeWidth={2}
      />
      <rect x={-26} y={-6} width={52} height={4} fill="#5b21b6" opacity={0.4} />

      {/* Antenna */}
      <line x1={0} y1={-26} x2={0} y2={-40} stroke="#1f1f33" strokeWidth={3} strokeLinecap="round" />
      <circle cx={0} cy={-43} r={5} fill="#f59e0b" stroke="#b45309" strokeWidth={1.5} />
      <circle cx={-1.5} cy={-44} r={1.5} fill="#fef3c7" />

      {/* Face plate */}
      <rect
        x={-19}
        y={-19}
        width={38}
        height={22}
        rx={5}
        fill="url(#robotPlateGrad)"
        stroke="#0f172a"
        strokeWidth={1.2}
      />
      {/* Eyes */}
      <circle cx={-9} cy={-8} r={4.5} fill="#fff" />
      <circle cx={9} cy={-8} r={4.5} fill="#fff" />
      <circle cx={-8} cy={-7} r={2.2} fill="#0f172a" />
      <circle cx={10} cy={-7} r={2.2} fill="#0f172a" />
      <circle cx={-7.2} cy={-8.5} r={0.9} fill="#fff" />
      <circle cx={10.8} cy={-8.5} r={0.9} fill="#fff" />
      {/* Smile */}
      <path
        d="M -8,1 Q 0,5 8,1"
        stroke="#ffffff"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      {/* Direction arrow */}
      <polygon
        points="0,-30 -5,-22 5,-22"
        fill="#fbbf24"
        stroke="#b45309"
        strokeWidth={1}
      />
    </g>
  );
}

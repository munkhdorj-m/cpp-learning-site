"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Sparkles as ThreeSparkles } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Play, RotateCcw, Sparkles, Clock, Zap, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROUND_SECONDS = 60;
const FIELD_HALF = 4;
const MAX_BUGS = 7;
const COMBO_WINDOW_MS = 1400;
const BUG_LIFETIME_MS = 5500;
const SPAWN_INTERVAL_MS = 700;

const BUG_COLORS = [
  "#a78bfa",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
  "#eab308",
];

interface BugState {
  id: number;
  color: string;
  spawnPos: [number, number, number];
  bornAt: number;
}

interface BurstState {
  id: number;
  position: [number, number, number];
  color: string;
  bornAt: number;
}

type Phase = "idle" | "playing" | "over";

export function BugSmash() {
  const t = useTranslations("bug_smash");
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [bugs, setBugs] = useState<BugState[]>([]);
  const [bursts, setBursts] = useState<BurstState[]>([]);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const nextBugId = useRef(0);
  const nextBurstId = useRef(0);
  const lastSmashAt = useRef(0);
  const startedAt = useRef(0);
  const phaseRef = useRef<Phase>("idle");

  // keep a ref that mirrors phase so async closures see the current value
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---- Timer ----
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt.current) / 1000;
      const left = Math.max(0, ROUND_SECONDS - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        setPhase("over");
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  // ---- Spawn ----
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setBugs((current) => {
        if (current.length >= MAX_BUGS) return current;
        return [
          ...current,
          {
            id: nextBugId.current++,
            color: BUG_COLORS[Math.floor(Math.random() * BUG_COLORS.length)],
            spawnPos: [
              (Math.random() - 0.5) * 2 * FIELD_HALF * 0.85,
              0.4,
              (Math.random() - 0.5) * 2 * FIELD_HALF * 0.85,
            ],
            bornAt: Date.now(),
          },
        ];
      });
    }, SPAWN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [phase]);

  // ---- Despawn old bugs + bursts ----
  useEffect(() => {
    if (phase === "idle") return;
    const interval = setInterval(() => {
      const now = Date.now();
      setBugs((bs) => bs.filter((b) => now - b.bornAt < BUG_LIFETIME_MS));
      setBursts((bs) => bs.filter((b) => now - b.bornAt < 700));
    }, 250);
    return () => clearInterval(interval);
  }, [phase]);

  // ---- Submit score when game ends ----
  useEffect(() => {
    if (phase !== "over") return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/game/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, best_combo: bestCombo }),
      });
      if (cancelled) return;
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg: string | undefined = data?.error;
        // Most common cause: migration 007_game.sql hasn't been run yet.
        const friendly = msg && msg.toLowerCase().includes("game_attempts")
          ? "Database not migrated — run supabase/migrations/007_game.sql"
          : msg || `Score submit failed (${res.status})`;
        toast.error(friendly);
        setXpEarned(0);
        return;
      }
      setXpEarned(data.xp_awarded ?? 0);
      if (data.xp_awarded > 0) {
        toast.success(`+${data.xp_awarded} XP`);
        // Refresh server components so nav XP bar updates immediately
        router.refresh();
      } else if (data.xp_total_today >= data.daily_cap) {
        toast.message(t("daily_cap_hit", { cap: data.daily_cap }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, score, bestCombo, t]);

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setTimeLeft(ROUND_SECONDS);
    setBugs([]);
    setBursts([]);
    setXpEarned(null);
    nextBugId.current = 0;
    nextBurstId.current = 0;
    lastSmashAt.current = 0;
    startedAt.current = Date.now();
    setPhase("playing");
  };

  const smash = (bug: BugState) => {
    if (phaseRef.current !== "playing") return;
    const now = Date.now();
    const sinceLast = now - lastSmashAt.current;
    const isCombo = lastSmashAt.current > 0 && sinceLast <= COMBO_WINDOW_MS;
    const newCombo = isCombo ? combo + 1 : 1;
    const points = 1 + Math.floor((newCombo - 1) / 3); // base 1, +1 every 3 combo
    setCombo(newCombo);
    setBestCombo((b) => Math.max(b, newCombo));
    setScore((s) => s + points);
    lastSmashAt.current = now;
    setBugs((bs) => bs.filter((b) => b.id !== bug.id));
    // We don't know the exact current position from the state, but a burst
    // at the spawn point reads close enough on screen and keeps things cheap.
    setBursts((bs) => [
      ...bs,
      {
        id: nextBurstId.current++,
        position: bug.spawnPos,
        color: bug.color,
        bornAt: Date.now(),
      },
    ]);
  };

  const missClick = () => {
    if (phaseRef.current !== "playing") return;
    // Reset combo on missed clicks
    setCombo(0);
  };

  const stars = computeStars(score);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 shrink-0">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 shadow-inner">
        <Canvas
          shadows
          camera={{ position: [0, 7.5, 6], fov: 50 }}
          onPointerMissed={missClick}
        >
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[5, 9, 5]}
            intensity={1.3}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <hemisphereLight args={["#a78bfa", "#1e293b", 0.4]} />

          <Floor />

          {bugs.map((b) => (
            <Bug key={b.id} bug={b} onSmash={() => smash(b)} />
          ))}

          {bursts.map((b) => (
            <Burst key={b.id} burst={b} />
          ))}

          <ThreeSparkles
            count={50}
            scale={[FIELD_HALF * 2, 1.5, FIELD_HALF * 2]}
            position={[0, 1, 0]}
            size={2}
            speed={0.4}
            color="#a78bfa"
          />
        </Canvas>

        {/* HUD */}
        <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start pointer-events-none">
          <HudCard>
            <div className="text-[10px] uppercase tracking-wide opacity-70">
              {t("score")}
            </div>
            <div className="text-2xl font-bold tabular-nums">{score}</div>
          </HudCard>
          <HudCard>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide opacity-70">
              <Clock className="h-3 w-3" />
              {t("time")}
            </div>
            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                timeLeft <= 10 && "text-rose-300",
              )}
            >
              {Math.ceil(timeLeft)}
            </div>
          </HudCard>
        </div>

        {combo > 1 && phase === "playing" && (
          <div
            key={combo}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="text-5xl font-extrabold text-amber-300 drop-shadow-lg combo-pop inline-flex items-center gap-1">
              <Zap className="h-8 w-8 fill-amber-300" />×{combo}
            </div>
          </div>
        )}

        {phase === "idle" && (
          <Overlay>
            <h2 className="text-3xl font-bold text-white mb-2">
              {t("ready_title")}
            </h2>
            <p className="text-white/70 text-sm max-w-md text-center mb-6">
              {t("instructions")}
            </p>
            <Button
              onClick={startGame}
              size="lg"
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {t("start")}
            </Button>
          </Overlay>
        )}

        {phase === "over" && (
          <Overlay>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map((i) => (
                <Sparkles
                  key={i}
                  className={cn(
                    "h-10 w-10",
                    i <= stars
                      ? "text-amber-300 fill-amber-300"
                      : "text-white/20",
                  )}
                />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white">{t("over_title")}</h2>
            <div className="grid grid-cols-3 gap-6 text-center my-5 text-white">
              <Stat label={t("score")} value={score} />
              <Stat label={t("best_combo")} value={bestCombo} />
              <Stat
                label="XP"
                value={xpEarned !== null ? `+${xpEarned}` : "..."}
                amber
              />
            </div>
            <Button
              onClick={startGame}
              size="lg"
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("play_again")}
            </Button>
          </Overlay>
        )}
      </div>

      <style jsx global>{`
        @keyframes comboPop {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          40% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        .combo-pop {
          animation: comboPop 0.25s ease-out;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}

// ---------------- Three.js components ----------------

function Floor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[FIELD_HALF * 2.4, FIELD_HALF * 2.4]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.9} />
      </mesh>
      {/* Grid lines for visual interest */}
      <gridHelper
        args={[FIELD_HALF * 2.4, 16, "#6d28d9", "#4c1d95"]}
        position={[0, 0.01, 0]}
      />
      {/* Border frame */}
      <mesh position={[0, 0.05, FIELD_HALF * 1.2]}>
        <boxGeometry args={[FIELD_HALF * 2.4, 0.15, 0.1]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.05, -FIELD_HALF * 1.2]}>
        <boxGeometry args={[FIELD_HALF * 2.4, 0.15, 0.1]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[FIELD_HALF * 1.2, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.15, FIELD_HALF * 2.4]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-FIELD_HALF * 1.2, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.15, FIELD_HALF * 2.4]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" emissiveIntensity={0.6} />
      </mesh>
    </>
  );
}

function Bug({ bug, onSmash }: { bug: BugState; onSmash: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const directionRef = useRef(Math.random() * Math.PI * 2);
  // Slower so kids' clicks actually land
  const speedRef = useRef(0.014 + Math.random() * 0.014);
  const scaleRef = useRef(0);

  // Cache materials to avoid recreating per render
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: bug.color, roughness: 0.4 }),
    [bug.color],
  );

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const age = (Date.now() - bug.bornAt) / 1000;

    // Spawn pop-in
    scaleRef.current = Math.min(1, scaleRef.current + delta * 6);
    g.scale.setScalar(scaleRef.current);

    // Movement
    const dx = Math.cos(directionRef.current) * speedRef.current;
    const dz = Math.sin(directionRef.current) * speedRef.current;
    g.position.x += dx;
    g.position.z += dz;
    g.rotation.y = -directionRef.current + Math.PI / 2;

    // Bob
    g.position.y = 0.4 + Math.sin(age * 9 + bug.id) * 0.06;

    // Bounce off boundaries
    if (Math.abs(g.position.x) > FIELD_HALF * 0.95) {
      directionRef.current = Math.PI - directionRef.current;
      g.position.x = Math.sign(g.position.x) * FIELD_HALF * 0.95;
    }
    if (Math.abs(g.position.z) > FIELD_HALF * 0.95) {
      directionRef.current = -directionRef.current;
      g.position.z = Math.sign(g.position.z) * FIELD_HALF * 0.95;
    }

    // Random direction nudge
    if (Math.random() < 0.012) {
      directionRef.current += (Math.random() - 0.5) * 1.3;
    }

    // Fade out toward end of life
    const lifeFrac = (Date.now() - bug.bornAt) / BUG_LIFETIME_MS;
    if (lifeFrac > 0.85) {
      const fade = Math.max(0, 1 - (lifeFrac - 0.85) / 0.15);
      bodyMat.opacity = fade;
      bodyMat.transparent = true;
    }
  });

  return (
    <group
      ref={groupRef}
      position={bug.spawnPos}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSmash();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      {/* Invisible hitbox — much bigger than the visible body so clicks land
          even on a fast-moving target. Transparent material still raycasts. */}
      <mesh>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Body */}
      <mesh castShadow material={bodyMat}>
        <sphereGeometry args={[0.32, 16, 14]} />
      </mesh>
      {/* Back stripe (so they look more bug-like) */}
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.05]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Eyes (whites) */}
      <mesh position={[0.13, 0.1, 0.26]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.13, 0.1, 0.26]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Pupils */}
      <mesh position={[0.13, 0.1, 0.32]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-0.13, 0.1, 0.32]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Antennae */}
      <mesh position={[0.1, 0.42, 0.18]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.015, 0.015, 0.32, 6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.13, 0.55, 0.21]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color={bug.color} />
      </mesh>
      <mesh position={[-0.1, 0.42, 0.18]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.015, 0.015, 0.32, 6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-0.13, 0.55, 0.21]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color={bug.color} />
      </mesh>
      {/* Legs — simple short stubs at 4 corners */}
      {([[0.2, 0.15], [-0.2, 0.15], [0.2, -0.15], [-0.2, -0.15]] as const).map(
        ([x, z], i) => (
          <mesh key={i} position={[x, 0, z]} rotation={[0, 0, x > 0 ? 0.5 : -0.5]}>
            <cylinderGeometry args={[0.018, 0.018, 0.22, 5]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ),
      )}
    </group>
  );
}

function Burst({ burst }: { burst: BurstState }) {
  const groupRef = useRef<THREE.Group>(null);
  const startedAt = useRef(Date.now());

  useFrame(() => {
    if (!groupRef.current) return;
    const t = Math.min(1, (Date.now() - startedAt.current) / 700);
    const g = groupRef.current;
    g.scale.setScalar(0.4 + t * 1.4);
    g.children.forEach((child) => {
      const m = child as THREE.Mesh;
      if (m.material && "opacity" in m.material) {
        (m.material as THREE.MeshBasicMaterial).opacity = 1 - t;
        (m.material as THREE.MeshBasicMaterial).transparent = true;
      }
    });
  });

  // Emit several small spheres in a spread
  const offsets = useMemo(
    () =>
      Array.from({ length: 10 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const r = 0.2 + Math.random() * 0.4;
        return [
          Math.cos(angle) * r,
          Math.random() * 0.3,
          Math.sin(angle) * r,
        ] as [number, number, number];
      }),
    [],
  );

  return (
    <group ref={groupRef} position={burst.position}>
      {offsets.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshBasicMaterial color={burst.color} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------- HUD helpers ----------------

function HudCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black/55 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg min-w-[80px]">
      {children}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center px-4">
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  amber,
}: {
  label: string;
  value: string | number;
  amber?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide opacity-60">{label}</div>
      <div
        className={cn(
          "text-2xl font-bold tabular-nums",
          amber && "text-amber-300",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function computeStars(score: number): 0 | 1 | 2 | 3 {
  if (score >= 60) return 3;
  if (score >= 35) return 2;
  if (score >= 15) return 1;
  return 0;
}

"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

import type { Level, ThemeId } from "./levels";

export interface MazeView {
  robotX: number;
  robotY: number;
  robotDir: number;
  litTiles: Set<string>;
}

interface Props {
  level: Level;
  themeId: ThemeId;
  view: MazeView;
}

// We import Phaser + the scene lazily so they don't end up in the server bundle.
type SceneType = import("@/lib/phaser-maze-scene").MazeScene;

export function PhaserMaze({ level, themeId, view }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<SceneType | null>(null);

  // Init Phaser game once
  useEffect(() => {
    let cancelled = false;
    const node = containerRef.current;
    if (!node) return;

    (async () => {
      const PhaserMod = (await import("phaser")).default;
      const { MazeScene } = await import("@/lib/phaser-maze-scene");
      if (cancelled) return;

      const initialBoundsW = (level.width + 2) * 64;
      const initialBoundsH = (level.height + 2) * 64;

      const game = new PhaserMod.Game({
        type: PhaserMod.AUTO,
        parent: node,
        transparent: true,
        width: initialBoundsW,
        height: initialBoundsH,
        scale: {
          mode: PhaserMod.Scale.FIT,
          autoCenter: PhaserMod.Scale.CENTER_BOTH,
        },
        render: {
          // Pixel-perfect scaling so the Sprout Lands sprites stay crisp
          // when scaled up 4× (16 → 64 px tiles).
          pixelArt: true,
          antialias: false,
        },
        scene: [MazeScene],
        callbacks: {
          postBoot: (g) => {
            const scene = g.scene.getScene("MazeScene") as SceneType;
            sceneRef.current = scene;
            scene.setLevel(level, themeId, view);
          },
        },
      });

      gameRef.current = game;
    })();

    return () => {
      cancelled = true;
      sceneRef.current = null;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild scene when level / theme changes
  useEffect(() => {
    sceneRef.current?.setLevel(level, themeId, view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id, themeId]);

  // Push view updates (robot pos / lit tiles)
  useEffect(() => {
    sceneRef.current?.setView(view);
  }, [view]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-xl overflow-hidden shadow-inner bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950"
    />
  );
}

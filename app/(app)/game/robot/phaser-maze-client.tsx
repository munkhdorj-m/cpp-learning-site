"use client";

import dynamic from "next/dynamic";

const PhaserMaze = dynamic(
  () => import("./phaser-maze").then((m) => m.PhaserMaze),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full aspect-square rounded-xl bg-muted animate-pulse" />
    ),
  },
);

export { PhaserMaze };

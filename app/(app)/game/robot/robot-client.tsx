"use client";

import dynamic from "next/dynamic";

import { Card, CardContent } from "@/components/ui/card";

const RobotProgrammer = dynamic(
  () => import("./robot-programmer").then((m) => m.RobotProgrammer),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardContent className="aspect-video flex items-center justify-center text-muted-foreground">
          Loading 3D scene…
        </CardContent>
      </Card>
    ),
  },
);

import type { Level } from "./levels";

export function RobotClient({
  completedLevelIds,
  startLevelId,
  allLevels,
  totalLevels,
}: {
  completedLevelIds: string[];
  startLevelId?: string;
  allLevels?: Level[];
  totalLevels?: number;
}) {
  return (
    <RobotProgrammer
      completedLevelIds={completedLevelIds}
      startLevelId={startLevelId}
      allLevels={allLevels}
      totalLevels={totalLevels}
    />
  );
}

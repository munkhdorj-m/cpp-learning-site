"use client";

import dynamic from "next/dynamic";

import { Card, CardContent } from "@/components/ui/card";

const BugSmash = dynamic(
  () => import("./bug-smash").then((m) => m.BugSmash),
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

export function GameClient() {
  return <BugSmash />;
}

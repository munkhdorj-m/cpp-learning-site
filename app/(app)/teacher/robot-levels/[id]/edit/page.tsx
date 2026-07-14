"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import {
  RobotLevelEditor,
  type RobotLevelForm,
} from "@/components/robot-level-editor";
import { LEVELS } from "@/app/(app)/game/robot/levels";

/** Convert a built-in Level to the form shape the editor expects. */
function builtInToForm(id: string): RobotLevelForm {
  const l = LEVELS.find((lv) => lv.id === id)!;
  const height = l.height;
  const layout: string[] = [];
  for (let y = height - 1; y >= 0; y--) {
    let line = "";
    for (let x = 0; x < l.width; x++) {
      const key = `${x},${y}`;
      if (x === l.robot.x && y === l.robot.y) {
        line += "R";
      } else if (l.walls.has(key)) {
        line += "#";
      } else if (l.dangers.has(key)) {
        line += "T";
      } else if (l.targets.some((t) => t.x === x && t.y === y)) {
        line += "E";
      } else {
        line += ".";
      }
    }
    layout.push(line);
  }
  return {
    id: l.id,
    course: l.course,
    name_mn: l.name_mn,
    name_en: l.name_en,
    hint_mn: l.hint_mn,
    hint_en: l.hint_en,
    hints_mn: l.hints_mn ?? [],
    hints_en: l.hints_en ?? [],
    width: l.width,
    height: l.height,
    layout,
    robot_x: l.robot.x,
    robot_y: l.height - 1 - l.robot.y, // game y -> editor y
    robot_dir: l.robot.dir,
    targets: l.targets.map((t) => ({ x: t.x, y: l.height - 1 - t.y })),
    dangers: [...l.dangers].map((k) => {
      const [x, y] = k.split(",").map(Number);
      return { x, y: l.height - 1 - y };
    }),
    palette: l.palette as string[],
    max_blocks: l.max_blocks,
    xp_reward: l.xp_reward,
  };
}

export default function EditRobotLevelPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [initial, setInitial] = useState<Partial<RobotLevelForm> | null>(null);
  const [loading, setLoading] = useState(true);
  const [builtIn, setBuiltIn] = useState(false);

  useEffect(() => {
    if (!id) return;

    // A built-in level id stays "built-in" (so the id is locked and saving
    // upserts an override). But a built-in may already have a DB override,
    // so always try the DB first and prefer it when present — otherwise
    // re-editing would show the original layout instead of the user's edits.
    const isBuiltInId = !!LEVELS.find((l) => l.id === id);
    setBuiltIn(isBuiltInId);

    fetch(`/api/robot/levels/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) {
          setInitial(data);
        } else if (isBuiltInId) {
          setInitial(builtInToForm(id));
        }
      })
      .catch(() => {
        if (isBuiltInId) setInitial(builtInToForm(id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading level...
        </div>
      </Card>
    );
  }

  if (!initial) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Level not found.
        </div>
      </Card>
    );
  }

  return <RobotLevelEditor initial={initial} isEdit isBuiltIn={!!builtIn} />;
}

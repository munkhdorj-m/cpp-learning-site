"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Play,
  Square,
  Grid3X3,
  Egg,
  Bomb,
  Bot,
  Eraser,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CellType = "." | "#" | "R" | "E" | "T";
type Tool = "path" | "wall" | "robot" | "egg" | "tnt" | "erase";

interface GridCell {
  x: number;
  y: number;
  type: CellType;
}

export interface RobotLevelForm {
  id: string;
  course: string;
  name_mn: string;
  name_en: string;
  hint_mn: string;
  hint_en: string;
  hints_mn: string[];
  hints_en: string[];
  width: number;
  height: number;
  layout: string[];
  robot_x: number;
  robot_y: number;
  robot_dir: number;
  targets: { x: number; y: number }[];
  dangers: { x: number; y: number }[];
  palette: string[];
  max_blocks: number;
  xp_reward: number;
}

const ROWS = 8;
const COLS = 8;
const ALL_BLOCKS = [
  "move_forward",
  "turn_left",
  "turn_right",
  "light",
  "repeat",
  "repeat_until_target",
  "if_path_ahead",
  "while_path_ahead",
] as const;

const BLOCK_LABELS: Record<string, string> = {
  move_forward: "↑ forward",
  turn_left: "↺ left",
  turn_right: "↻ right",
  light: "💡 light",
  repeat: "🔁 repeat N",
  repeat_until_target: "🔁 until target",
  if_path_ahead: "❓ if path",
  while_path_ahead: "🔄 while path",
};

function buildLayout(
  cells: GridCell[][],
  robotX: number,
  robotY: number,
): string[] {
  const lines: string[] = [];
  for (let row = 0; row < ROWS; row++) {
    let line = "";
    for (let col = 0; col < COLS; col++) {
      if (col === robotX && row === robotY) {
        line += "R";
      } else {
        line += cells[row][col].type;
      }
    }
    lines.push(line);
  }
  return lines;
}

// Returns true if every egg can be collected from the robot's start (BFS).
function isSolvable(params: {
  cells: GridCell[][];
  robotX: number;
  robotY: number;
  robotDir: number;
}): { solvable: boolean; reachableEggs: number; totalEggs: number } {
  const { cells, robotX, robotY, robotDir } = params;
  const eggs: { x: number; y: number }[] = [];
  const walls = new Set<string>();
  const dangers = new Set<string>();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = cells[y][x].type;
      if (t === "E") eggs.push({ x, y });
      else if (t === "#") walls.add(`${x},${y}`);
      else if (t === "T") dangers.add(`${x},${y}`);
    }
  }
  const totalEggs = eggs.length;
  if (totalEggs === 0) return { solvable: false, reachableEggs: 0, totalEggs: 0 };
  const dirVec = (d: number): [number, number] =>
    d === 0 ? [0, 1] : d === 1 ? [1, 0] : d === 2 ? [0, -1] : [-1, 0];
  const tileToEgg = new Map<string, number>();
  eggs.forEach((e, i) => tileToEgg.set(`${e.x},${e.y}`, i));
  const allCollected = (1 << totalEggs) - 1;
  const startEggIdx = tileToEgg.get(`${robotX},${robotY}`);
  const startMask = startEggIdx !== undefined ? 1 << startEggIdx : 0;
  const startKey = `${robotX},${robotY},${robotDir},${startMask}`;
  const queue: { x: number; y: number; dir: number; mask: number }[] = [
    { x: robotX, y: robotY, dir: robotDir, mask: startMask },
  ];
  const visited = new Set([startKey]);
  let head = 0;
  let maxMask = startMask;
  const MAX_ITERS = 200000;
  while (head < queue.length) {
    if (head > MAX_ITERS) break;
    const s = queue[head++];
    if (s.mask === allCollected)
      return { solvable: true, reachableEggs: totalEggs, totalEggs };
    maxMask = Math.max(maxMask, s.mask);
    // left
    {
      const nd = (s.dir + 3) % 4;
      const k = `${s.x},${s.y},${nd},${s.mask}`;
      if (!visited.has(k)) { visited.add(k); queue.push({ x: s.x, y: s.y, dir: nd, mask: s.mask }); }
    }
    // right
    {
      const nd = (s.dir + 1) % 4;
      const k = `${s.x},${s.y},${nd},${s.mask}`;
      if (!visited.has(k)) { visited.add(k); queue.push({ x: s.x, y: s.y, dir: nd, mask: s.mask }); }
    }
    // forward
    {
      const [dx, dy] = dirVec(s.dir);
      const nx = s.x + dx, ny = s.y + dy;
      const key = `${nx},${ny}`;
      if (nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS && !walls.has(key) && !dangers.has(key)) {
        const k = `${nx},${ny},${s.dir},${s.mask}`;
        if (!visited.has(k)) { visited.add(k); queue.push({ x: nx, y: ny, dir: s.dir, mask: s.mask }); }
      }
    }
    // light
    {
      const ei = tileToEgg.get(`${s.x},${s.y}`);
      if (ei !== undefined) {
        const nm = s.mask | (1 << ei);
        const k = `${s.x},${s.y},${s.dir},${nm}`;
        if (!visited.has(k)) {
          visited.add(k);
          queue.push({ x: s.x, y: s.y, dir: s.dir, mask: nm });
          if (nm === allCollected) return { solvable: true, reachableEggs: totalEggs, totalEggs };
        }
      }
    }
  }
  let reachable = 0;
  for (let i = 0; i < totalEggs; i++) if (maxMask & (1 << i)) reachable++;
  return { solvable: false, reachableEggs: reachable, totalEggs };
}

interface Props {
  initial?: Partial<RobotLevelForm>;
  isEdit?: boolean;
  isBuiltIn?: boolean;
}

export function RobotLevelEditor({
  initial,
  isEdit = false,
  isBuiltIn = false,
}: Props) {
  const router = useRouter();

  const [id, setId] = useState(initial?.id ?? "");
  const [course, setCourse] = useState(initial?.course ?? "basics");
  const [nameMn, setNameMn] = useState(initial?.name_mn ?? "");
  const [nameEn, setNameEn] = useState(initial?.name_en ?? "");
  const [hintMn, setHintMn] = useState(initial?.hint_mn ?? "");
  const [hintEn, setHintEn] = useState(initial?.hint_en ?? "");
  const [hintsMn, setHintsMn] = useState<string[]>(initial?.hints_mn ?? []);
  const [hintsEn, setHintsEn] = useState<string[]>(initial?.hints_en ?? []);
  const [maxBlocks, setMaxBlocks] = useState(initial?.max_blocks ?? 10);
  const [xpReward, setXpReward] = useState(initial?.xp_reward ?? 20);
  const [palette, setPalette] = useState<string[]>(
    initial?.palette ?? ["move_forward", "turn_left", "turn_right", "light"],
  );

  const [cells, setCells] = useState<GridCell[][]>(() => {
    const grid: GridCell[][] = [];
    for (let y = 0; y < ROWS; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < COLS; x++) {
        let type: CellType = ".";
        if (initial?.layout) {
          const ch = initial.layout[y]?.[x] ?? ".";
          if (ch === "#") type = "#";
          else if (ch === "E") type = "E";
          else if (ch === "T") type = "T";
        }
        row.push({ x, y, type });
      }
      grid.push(row);
    }
    return grid;
  });

  const [robotX, setRobotX] = useState(initial?.robot_x ?? 0);
  const [robotY, setRobotY] = useState(initial?.robot_y ?? 0);
  const [robotDir, setRobotDir] = useState(initial?.robot_dir ?? 0);
  const [tool, setTool] = useState<Tool>("wall");

  const cellClick = useCallback(
    (x: number, y: number) => {
      setCells((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        if (tool === "robot") {
          setRobotX(x);
          setRobotY(y);
          return next;
        }
        let newType: CellType;
        switch (tool) {
          case "path":
            newType = ".";
            break;
          case "wall":
            newType = "#";
            break;
          case "egg":
            newType = "E";
            break;
          case "tnt":
            newType = "T";
            break;
          case "erase":
          default:
            newType = ".";
            break;
        }
        next[y][x].type = newType;
        return next;
      });
    },
    [tool],
  );

  const togglePalette = (key: string) => {
    setPalette((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const layout = buildLayout(cells, robotX, robotY);
  const targets = cells
    .flatMap((row) => row.filter((c) => c.type === "E"))
    .map((c) => ({ x: c.x, y: c.y }));
  const dangers = cells
    .flatMap((row) => row.filter((c) => c.type === "T"))
    .map((c) => ({ x: c.x, y: c.y }));

  // ── Validation ───────────────────────────────────────────────────────────
  const robotOnWall = cells[robotY]?.[robotX]?.type === "#";
  const solvability = useMemo(
    () => isSolvable({ cells, robotX, robotY, robotDir }),
    [cells, robotX, robotY, robotDir],
  );
  const errors: string[] = [];
  if (!id.trim()) errors.push("Level ID is required");
  if (!nameMn.trim()) errors.push("Mongolian name is required");
  if (!nameEn.trim()) errors.push("English name is required");
  if (targets.length === 0) errors.push("At least one egg is required");
  if (robotOnWall) errors.push("Robot is on a wall — move it to an open cell");
  if (!solvability.solvable && targets.length > 0)
    errors.push(
      `Level is unsolvable — only ${solvability.reachableEggs}/${solvability.totalEggs} eggs reachable`,
    );
  if (palette.length === 0) errors.push("Select at least one block");
  if (maxBlocks < 3) errors.push("Max blocks must be at least 3");

  const payload: RobotLevelForm = {
    id,
    course,
    name_mn: nameMn,
    name_en: nameEn,
    hint_mn: hintMn,
    hint_en: hintEn,
    hints_mn: hintsMn.filter((h) => h.trim()),
    hints_en: hintsEn.filter((h) => h.trim()),
    width: COLS,
    height: ROWS,
    layout,
    robot_x: robotX,
    robot_y: robotY,
    robot_dir: robotDir,
    targets,
    dangers,
    palette,
    max_blocks: maxBlocks,
    xp_reward: xpReward,
  };

  const handleSave = async () => {
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    const usePost = !isEdit || isBuiltIn;
    const url = usePost ? "/api/robot/levels" : `/api/robot/levels/${id}`;
    const method = usePost ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown" }));
      toast.error(err.error ?? "Save failed");
      return;
    }
    toast.success(
      isEdit && !isBuiltIn ? "Level updated!" : "Level saved to database!",
    );
    router.push("/teacher/robot-levels");
  };

  const handleTest = async () => {
    if (errors.length > 0) {
      toast.error("Fix errors before testing: " + errors[0]);
      return;
    }
    // Save first so the level exists, then navigate to the game
    const usePost = !isEdit || isBuiltIn;
    const url = usePost ? "/api/robot/levels" : `/api/robot/levels/${id}`;
    const method = usePost ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown" }));
      toast.error(err.error ?? "Save failed");
      return;
    }
    toast.success("Saved! Opening game…");
    router.push(`/game/robot?level=${id}`);
  };

  // ── Hints helpers ─────────────────────────────────────────────────────────
  const updateHint = (
    list: string[],
    setter: (v: string[]) => void,
    i: number,
    val: string,
  ) => {
    const next = [...list];
    next[i] = val;
    setter(next);
  };
  const addHint = (list: string[], setter: (v: string[]) => void) =>
    setter([...list, ""]);
  const removeHint = (
    list: string[],
    setter: (v: string[]) => void,
    i: number,
  ) => setter(list.filter((_, idx) => idx !== i));

  const DirIcon = (d: number) => {
    if (d === 0) return <ArrowUp className="h-3.5 w-3.5" />;
    if (d === 1) return <ArrowRight className="h-3.5 w-3.5" />;
    if (d === 2) return <ArrowDown className="h-3.5 w-3.5" />;
    return <ArrowLeftIcon className="h-3.5 w-3.5" />;
  };

  const tools: Array<{
    tool: Tool;
    Icon: typeof Square;
    label: string;
    color: string;
  }> = [
    { tool: "path", Icon: Square, label: "Path", color: "bg-emerald-500" },
    { tool: "wall", Icon: Square, label: "Wall", color: "bg-slate-700" },
    { tool: "robot", Icon: Bot, label: "Robot", color: "bg-violet-500" },
    { tool: "egg", Icon: Egg, label: "Egg", color: "bg-amber-500" },
    { tool: "tnt", Icon: Bomb, label: "TNT", color: "bg-rose-500" },
    {
      tool: "erase",
      Icon: Eraser,
      label: "Erase",
      color: "bg-muted-foreground",
    },
  ];

  const dirs = [
    [0, ArrowUp] as const,
    [1, ArrowRight] as const,
    [2, ArrowDown] as const,
    [3, ArrowLeftIcon] as const,
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Level" : "Create Level"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save
          </Button>
          <Button variant="outline" onClick={handleTest}>
            <Play className="h-4 w-4 mr-1.5" />
            Save & Test
          </Button>
        </div>
      </div>

      {/* Validation status */}
      {errors.length > 0 ? (
        <Card className="border-rose-300 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800">
          <CardContent className="py-3 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {errors.map((e, i) => (
                <p key={i} className="text-sm text-rose-700 dark:text-rose-300">
                  {e}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardContent className="py-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Level looks good! {targets.length} egg(s), all reachable. Save to publish.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        {/* LEFT: Grid editor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Maze Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center gap-1 flex-wrap">
              {tools.map(({ tool: t, Icon, label, color }) => (
                <button
                  key={t}
                  onClick={() => setTool(t)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                    tool === t
                      ? "ring-2 ring-offset-1 ring-violet-500 text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  style={tool === t ? { backgroundColor: color } : undefined}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Robot direction */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Direction:</span>
              {dirs.map(([d, Icon]) => (
                <button
                  key={d}
                  onClick={() => setRobotDir(d)}
                  className={cn(
                    "p-1 rounded",
                    robotDir === d
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* Grid */}
            <div
              className="grid gap-0.5 border rounded-md p-0.5 bg-muted/30"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              }}
            >
              {cells.map((row, y) =>
                row.map((cell, x) => {
                  const isRobot = x === robotX && y === robotY;
                  return (
                    <button
                      key={`${x}-${y}`}
                      onClick={() => cellClick(x, y)}
                      className={cn(
                        "aspect-square rounded-sm transition-colors flex items-center justify-center text-[10px] font-bold",
                        isRobot
                          ? "bg-violet-500 text-white"
                          : cell.type === "#"
                            ? "bg-slate-700"
                            : cell.type === "E"
                              ? "bg-amber-500"
                              : cell.type === "T"
                                ? "bg-rose-500"
                                : "bg-emerald-600/60 hover:bg-emerald-500/60",
                      )}
                    >
                      {isRobot
                        ? DirIcon(robotDir)
                        : cell.type === "E"
                          ? "🥚"
                          : cell.type === "T"
                            ? "💣"
                            : ""}
                    </button>
                  );
                }),
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Metadata form */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>ID (slug)</Label>
                <Input
                  value={id}
                  onChange={(e) => setId(e.target.value.toLowerCase())}
                  placeholder="my-custom-level"
                  pattern="[a-z0-9-]+"
                  required
                  disabled={isBuiltIn}
                />
                {isBuiltIn && (
                  <p className="text-xs text-muted-foreground">
                    This is a built-in level. The ID is locked — saving
                    creates an override that replaces the original in the game.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select value={course} onValueChange={(v) => v && setCourse(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basics">Basics</SelectItem>
                    <SelectItem value="loops">Loops</SelectItem>
                    <SelectItem value="conditionals">Conditionals</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Name (Mongolian)</Label>
                <Input
                  value={nameMn}
                  onChange={(e) => setNameMn(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Name (English)</Label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Hint (Mongolian)</Label>
                <Textarea
                  value={hintMn}
                  onChange={(e) => setHintMn(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Hint (English)</Label>
                <Textarea
                  value={hintEn}
                  onChange={(e) => setHintEn(e.target.value)}
                  rows={2}
                />
              </div>
              {/* Progressive hints */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-sm font-semibold">
                  Progressive Hints (Mongolian)
                </Label>
                {hintsMn.map((h, i) => (
                  <div key={i} className="flex gap-1.5">
                    <Input
                      value={h}
                      onChange={(e) => updateHint(hintsMn, setHintsMn, i, e.target.value)}
                      placeholder={`Hint ${i + 1}`}
                      className="text-sm"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeHint(hintsMn, setHintsMn, i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addHint(hintsMn, setHintsMn)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add hint
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Progressive Hints (English)
                </Label>
                {hintsEn.map((h, i) => (
                  <div key={i} className="flex gap-1.5">
                    <Input
                      value={h}
                      onChange={(e) => updateHint(hintsEn, setHintsEn, i, e.target.value)}
                      placeholder={`Hint ${i + 1}`}
                      className="text-sm"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeHint(hintsEn, setHintsEn, i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addHint(hintsEn, setHintsEn)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add hint
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div className="space-y-1.5">
                  <Label>Max Blocks</Label>
                  <Input
                    type="number"
                    min={3}
                    max={50}
                    value={maxBlocks}
                    onChange={(e) => setMaxBlocks(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Block Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {ALL_BLOCKS.map((key) => {
                  const active = palette.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => togglePalette(key)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                        active
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 ring-1 ring-violet-400"
                          : "bg-muted text-muted-foreground hover:bg-muted-foreground/20",
                      )}
                    >
                      {BLOCK_LABELS[key]}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

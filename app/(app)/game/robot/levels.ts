// Level data for Robot Programmer.
// 20 levels with progressive pedagogy — each teaches a specific new concept.
//
// Layouts:
//   '.' = walkable grass
//   '#' = wall (impassable)
//   'R' = robot start (also walkable)
//   'E' = egg target (also walkable)
//   'T' = TNT hazard (walkable but triggers explosion)
//
// Top row of `layout` is the HIGHEST y. y=0 is the BOTTOM.
// max_blocks counts EVERY workspace block (including the when_run hat).

import type { ToolboxBlock } from "@/lib/robot-blocks";

export type Direction = 0 | 1 | 2 | 3;
export type Instruction = "forward" | "left" | "right" | "light";
export type CourseId = "basics" | "loops" | "conditionals" | "master";
export type ThemeId = "ice" | "jungle" | "space" | "lava";

export interface Tile {
  x: number;
  y: number;
}

export interface Level {
  id: string;
  course: CourseId;
  name_mn: string;
  name_en: string;
  hint_mn: string;
  hint_en: string;
  hints_mn?: string[];
  hints_en?: string[];
  width: number;
  height: number;
  robot: { x: number; y: number; dir: Direction };
  targets: Tile[];
  walls: Set<string>;
  dangers: Set<string>;
  xp_reward: number;
  palette: ToolboxBlock[];
  max_blocks: number;
}

export interface Course {
  id: CourseId;
  name_mn: string;
  name_en: string;
  theme: ThemeId;
  blurb_mn: string;
  blurb_en: string;
}

export const COURSES: Course[] = [
  {
    id: "basics",
    name_mn: "Суурь",
    name_en: "Maze Basics",
    theme: "jungle",
    blurb_mn: "Урагш алхаж, эргэж сур.",
    blurb_en: "Learn to walk forward and turn.",
  },
  {
    id: "loops",
    name_mn: "Давталт",
    name_en: "Loops",
    theme: "ice",
    blurb_mn: "repeat ашиглан богино код бич.",
    blurb_en: "Use repeat to write shorter code.",
  },
  {
    id: "conditionals",
    name_mn: "Нөхцөл",
    name_en: "Conditionals",
    theme: "space",
    blurb_mn: "if / while ашиглан шийдвэр гарга.",
    blurb_en: "Use if / while to make decisions.",
  },
  {
    id: "master",
    name_mn: "Мастер",
    name_en: "Master Challenges",
    theme: "lava",
    blurb_mn: "Бүх мэдлэгээ нэгтгэ.",
    blurb_en: "Combine everything you know.",
  },
];

export const COURSE_THEMES: Record<
  ThemeId,
  {
    bg: string;
    tileColor: string;
    tileEmissive: string;
    targetColor: string;
    targetEmissive: string;
    litColor: string;
    litEmissive: string;
  }
> = {
  ice: {
    bg: "from-slate-900 via-indigo-950 to-violet-950",
    tileColor: "#312e81",
    tileEmissive: "#0f172a",
    targetColor: "#7c3aed",
    targetEmissive: "#5b21b6",
    litColor: "#fcd34d",
    litEmissive: "#fcd34d",
  },
  jungle: {
    bg: "from-emerald-950 via-green-900 to-teal-950",
    tileColor: "#14532d",
    tileEmissive: "#052e16",
    targetColor: "#16a34a",
    targetEmissive: "#15803d",
    litColor: "#fde68a",
    litEmissive: "#facc15",
  },
  space: {
    bg: "from-black via-slate-950 to-indigo-950",
    tileColor: "#1e293b",
    tileEmissive: "#020617",
    targetColor: "#a855f7",
    targetEmissive: "#7e22ce",
    litColor: "#67e8f9",
    litEmissive: "#06b6d4",
  },
  lava: {
    bg: "from-rose-950 via-red-950 to-orange-950",
    tileColor: "#7c2d12",
    tileEmissive: "#431407",
    targetColor: "#f97316",
    targetEmissive: "#c2410c",
    litColor: "#fef3c7",
    litEmissive: "#fbbf24",
  },
};

const BASIC: ToolboxBlock[] = [
  "move_forward",
  "turn_left",
  "turn_right",
  "light",
];
const WITH_LOOP: ToolboxBlock[] = [...BASIC, "repeat"];
const WITH_ALL: ToolboxBlock[] = [
  ...BASIC,
  "repeat",
  "repeat_until_target",
  "if_path_ahead",
  "while_path_ahead",
];

interface RawLevel {
  id: string;
  course: CourseId;
  name_mn: string;
  name_en: string;
  hint_mn: string;
  hint_en: string;
  hints_mn?: string[];
  hints_en?: string[];
  layout: string[];
  robotDir: Direction;
  xp_reward: number;
  palette: ToolboxBlock[];
  max_blocks: number;
}

// ─────────────────────────────────────────────────────────────────────
// 20 levels with progressive pedagogy
// ─────────────────────────────────────────────────────────────────────
const RAW_LEVELS: RawLevel[] = [
  // ═══════════════════════════════════════════════════════════════════
  // COURSE 1: BASICS (levels 1–6) — Jungle theme
  // ═══════════════════════════════════════════════════════════════════

  // Level 1 — forward + light (the absolute simplest)
  {
    id: "maze-01",
    course: "basics",
    name_mn: "Эхний алхам",
    name_en: "First Step",
    hint_mn: "Урагшаа нэг алхаад өндөг ав.",
    hint_en: "Walk forward once and pick the egg.",
    hints_mn: [
      "Хоёр блок л хэрэгтэй: `move forward` дараа нь `pick egg`.",
      "Робот урагшаа харсан байгаа — `move forward`-г нэг удаа тавь.",
    ],
    hints_en: [
      "You only need two blocks: `move forward` then `pick egg`.",
      "The robot already faces the egg — drop one `move forward`.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "###R####",
      "###E####",
      "########",
      "########",
      "########",
    ],
    robotDir: 2, // South
    xp_reward: 5,
    palette: ["move_forward", "light"],
    max_blocks: 4,
  },

  // Level 2 — multiple forwards in a row
  {
    id: "maze-02",
    course: "basics",
    name_mn: "Гурван алхам",
    name_en: "Three Steps",
    hint_mn: "3 удаа урагшаа алх, тэгээд өндөг ав.",
    hint_en: "Walk forward 3 times, then pick the egg.",
    hints_mn: [
      "`move forward` блокыг 3 удаа дарааллуул.",
      "Өндөг дээр очсон хойноо `pick egg`-г мартаж бүү үлдээ.",
    ],
    hints_en: [
      "Stack three `move forward` blocks in a row.",
      "Once you reach the egg, finish with `pick egg`.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "########",
      "#R..E###",
      "########",
      "########",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 8,
    palette: ["move_forward", "light"],
    max_blocks: 6,
  },

  // Level 3 — turn right (L-shape)
  {
    id: "maze-03",
    course: "basics",
    name_mn: "Баруун эргэлт",
    name_en: "Right Turn",
    hint_mn: "Урагш 2 алх, баруун эргэ, урагш 1 алх, өндөг ав.",
    hint_en: "Walk 2, turn right, walk 1, pick egg.",
    hints_mn: [
      "Эхлээд `move forward` 2 удаа.",
      "Хананд хүрсний дараа `turn right` хийгээд цаашаа яв.",
    ],
    hints_en: [
      "Start with two `move forward`.",
      "When you hit the wall, `turn right` and keep going.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "##R..###",
      "####E###",
      "########",
      "########",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 12,
    palette: BASIC,
    max_blocks: 7,
  },

  // Level 4 — turn left (reverse L)
  {
    id: "maze-04",
    course: "basics",
    name_mn: "Зүүн эргэлт",
    name_en: "Left Turn",
    hint_mn: "Урагш 2 алх, зүүн эргэ, урагш 1 алх, өндөг ав.",
    hint_en: "Walk 2, turn left, walk 1, pick egg.",
    hints_mn: [
      "Үе 4-тэй ижил боловч эсрэг тийш эргэлт хийнэ.",
      "`turn left`-г ашигла, `turn right` биш.",
    ],
    hints_en: [
      "Like level 4 but you turn the other way.",
      "Use `turn left`, not `turn right`.",
    ],
    layout: [
      "########",
      "########",
      "##.E####",
      "#R..####",
      "########",
      "########",
      "########",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 12,
    palette: BASIC,
    max_blocks: 7,
  },

  // Level 5 — two eggs requiring sequential planning
  {
    id: "maze-05",
    course: "basics",
    name_mn: "Хоёр өндөг",
    name_en: "Two Eggs",
    hint_mn: "Эхний өндөг ав, баруун эргэ, 2 алх, хоёр дахь өндгийг ав.",
    hint_en: "Pick the first egg, turn right, walk 2, pick the second.",
    hints_mn: [
      "Эхний өндөг дээр `pick egg`-г бүү мартаарай.",
      "Хоёр дахь өндөг рүү очихын тулд `turn right` хийгээд 2 алх.",
    ],
    hints_en: [
      "Remember to `pick egg` on the first egg.",
      "Reach the second egg with `turn right` then 2 steps.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "####.###",
      "#R.E####",
      "###.####",
      "###E####",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 18,
    palette: BASIC,
    max_blocks: 9,
  },

  // Level 6 — zigzag path with multiple turns
  {
    id: "maze-06",
    course: "basics",
    name_mn: "Зигзаг",
    name_en: "The Zigzag",
    hint_mn: "Замаа анхааралтай дага — 2 эргэлт хэрэгтэй.",
    hint_en: "Follow the path carefully — you need 2 turns.",
    hints_mn: [
      "Эхлээд урагш (хойш) 3 алх.",
      "Дараа нь баруун эргэ, 3 алх, зүүн эргэ, 2 алх.",
    ],
    hints_en: [
      "First go forward (north) 3 steps.",
      "Then turn right, go 3, turn left, go 2 to the egg.",
    ],
    layout: [
      "########",
      "#####E##",
      "#####.##",
      "##....##",
      "##.##.##",
      "##.##.##",
      "##R#####",
      "########",
    ],
    robotDir: 0, // North
    xp_reward: 22,
    palette: BASIC,
    max_blocks: 14,
  },

  // ═══════════════════════════════════════════════════════════════════
  // COURSE 2: LOOPS (levels 7–11) — Ice theme
  // ═══════════════════════════════════════════════════════════════════

  // Level 7 — first repeat block (3 eggs in a row)
  {
    id: "maze-07",
    course: "loops",
    name_mn: "Давталт 3",
    name_en: "Repeat 3",
    hint_mn: "3 өндөг дараалан байна. `repeat 3 { move forward; pick egg }`",
    hint_en: "3 eggs in a row. `repeat 3 { move forward; pick egg }`",
    hints_mn: [
      "Үе 2-т 3 `move forward` бичсэн байсан. Одоо `repeat`-т оруулж богиносго.",
      "`repeat` блокын тоог 3 болго, дотроо `move forward` + `pick egg` тавь.",
    ],
    hints_en: [
      "In level 2 you wrote 3 `move forward`. Now shorten it with `repeat`.",
      "Set the `repeat` count to 3 and put `move forward` + `pick egg` inside.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "########",
      "#REEE###",
      "########",
      "########",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 20,
    palette: WITH_LOOP,
    max_blocks: 5,
  },

  // Level 8 — square perimeter (repeat a side, then turn)
  {
    id: "maze-08",
    course: "loops",
    name_mn: "Дөрвөлжин бүжиг",
    name_en: "Square Dance",
    hint_mn:
      "Тойрог замаар яв. `repeat 4 { repeat 3 { move forward; pick egg }; turn left }`",
    hint_en:
      "Go around the square. `repeat 4 { repeat 3 { move forward; pick egg }; turn left }`",
    hints_mn: [
      "Тал бүрийг `repeat 3 { move forward; pick egg }`-ээр явна.",
      "Булан бүрт `turn left` хийгээд дараагийн тал руу ор.",
    ],
    hints_en: [
      "Each side is `repeat 3 { move forward; pick egg }`.",
      "At every corner `turn left` and start the next side.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "########",
      "#E..E###",
      "#....###",
      "#....###",
      "#R..E###",
    ],
    robotDir: 1, // East
    xp_reward: 28,
    palette: WITH_LOOP,
    max_blocks: 8,
  },

  // Level 9 — staircase with repeat (forward, light, turn, forward, turn-back)
  {
    id: "maze-09",
    course: "loops",
    name_mn: "Шат",
    name_en: "Staircase",
    hint_mn:
      "Шат хэлбэртэй зам. `repeat 3 { move forward; pick egg; turn right; move forward; turn left }`",
    hint_en:
      "Stair-step path. `repeat 3 { move forward; pick egg; turn right; move forward; turn left }`",
    hints_mn: [
      "Нэг шатны алхам: яв, өндөг ав, баруун эргэ, яв, зүүн эргэ (анхны чиглэлдээ буцна).",
      "Үүнийг `repeat 3`-т оруул.",
    ],
    hints_en: [
      "One stair step: walk, pick egg, turn right, walk, turn left (face original way).",
      "Put that inside `repeat 3`.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "####E.##",
      "###E.###",
      "##E.####",
      "##R#####",
      "########",
    ],
    robotDir: 0, // North
    xp_reward: 32,
    palette: WITH_LOOP,
    max_blocks: 9,
  },

  // Level 10 — two rows with repeat (introduces repeat inside repeat)
  {
    id: "maze-10",
    course: "loops",
    name_mn: "Хоёр эгнээ",
    name_en: "Two Rows",
    hint_mn:
      "2 эгнээ өндөг. `repeat 4 { move forward; pick egg }; turn left; repeat 4 { move forward; pick egg }`",
    hint_en:
      "2 rows of eggs. `repeat 4 { move forward; pick egg }; turn left; repeat 4 { move forward; pick egg }`",
    hints_mn: [
      "Эхний эгнээгээр `repeat 4 { move forward; pick egg }`-ээр яв.",
      "Дараа нь `turn left` хийгээд хоёр дахь эгнээг ижил давталтаар яв.",
    ],
    hints_en: [
      "Do the first row with `repeat 4 { move forward; pick egg }`.",
      "Then `turn left` and do the second row with the same repeat.",
    ],
    layout: [
      "########",
      "########",
      "#####E##",
      "#####E##",
      "#####E##",
      "#####E##",
      "#REEEE##",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 38,
    palette: WITH_LOOP,
    max_blocks: 10,
  },

  // Level 11 — nested loops (small square inside repeat)
  {
    id: "maze-11",
    course: "loops",
    name_mn: "Шаталсан давталт",
    name_en: "Nested Loops",
    hint_mn:
      "Жижик дөрвөлжин. `repeat 4 { repeat 2 { move forward; pick egg }; turn left }`",
    hint_en:
      "A small square. `repeat 4 { repeat 2 { move forward; pick egg }; turn left }`",
    hints_mn: [
      "Тал бүр `repeat 2 { move forward; pick egg }` — давталт дотор давталт.",
      "Булан бүрт `turn left`.",
    ],
    hints_en: [
      "Each side is `repeat 2 { move forward; pick egg }` — a loop inside a loop.",
      "At every corner `turn left`.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "########",
      "#EEE####",
      "#E#E####",
      "#REE####",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 35,
    palette: WITH_LOOP,
    max_blocks: 8,
  },

  // ═══════════════════════════════════════════════════════════════════
  // COURSE 3: CONDITIONALS (levels 12–16) — Space theme
  // ═══════════════════════════════════════════════════════════════════

  // Level 12 — unknown-length corridor (repeat until target)
  {
    id: "maze-12",
    course: "conditionals",
    name_mn: "Нууц урт",
    name_en: "Hidden Length",
    hint_mn:
      "Коридорын уртыг мэдэхгүй. `repeat until target { move forward }; pick egg`",
    hint_en:
      "You don't know the corridor length. `repeat until target { move forward }; pick egg`",
    hints_mn: [
      "`repeat until target` нь өндөг дээр хүртлээ давтана.",
      "Дотроо зөвхөн `move forward` тавь, хүрсний дараа `pick egg`.",
    ],
    hints_en: [
      "`repeat until target` repeats until you stand on an egg.",
      "Put just `move forward` inside; add `pick egg` after the loop.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "########",
      "########",
      "########",
      "#R....E#",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 30,
    palette: WITH_ALL,
    max_blocks: 6,
  },

  // Level 13 — first while (corridor + turn to the egg)
  {
    id: "maze-13",
    course: "conditionals",
    name_mn: "Хүртэл яв",
    name_en: "Go Until",
    hint_mn:
      "`while path ahead { move forward }`-аар яв, дараа нь эргээд дахин яв.",
    hint_en:
      "Use `while path ahead { move forward }` to walk, then turn and walk again.",
    hints_mn: [
      "Эхний коридор: `while path ahead { move forward }` — хананд хүртлээ яв.",
      "Дараа нь `turn right` хийгээд хоёр дахь коридорт ижил `while`-г давт.",
    ],
    hints_en: [
      "First corridor: `while path ahead { move forward }` — go till the wall.",
      "Then `turn right` and repeat the same `while` for the next corridor.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "#...E###",
      "#.######",
      "#.######",
      "#R######",
      "########",
    ],
    robotDir: 0, // North
    xp_reward: 38,
    palette: WITH_ALL,
    max_blocks: 8,
  },

  // Level 14 — while with light (collect a column of eggs)
  {
    id: "maze-14",
    course: "conditionals",
    name_mn: "Баганат өндөг",
    name_en: "Egg Column",
    hint_mn:
      "Багана өндөг. `while path ahead { move forward; pick egg }`, эргээд дахин.",
    hint_en:
      "A column of eggs. `while path ahead { move forward; pick egg }`, then turn and repeat.",
    hints_mn: [
      "Багана бүр `while path ahead { move forward; pick egg }` — өндгүүдийг замдаа ав.",
      "Буланд `turn right` хийгээд дараагийн баганад ижил `while` давт.",
    ],
    hints_en: [
      "Each column is `while path ahead { move forward; pick egg }` — grab eggs as you go.",
      "At the corner `turn right` and repeat the same `while` for the next column.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "#EEEE###",
      "#E######",
      "#E######",
      "#R######",
      "########",
    ],
    robotDir: 0, // North
    xp_reward: 42,
    palette: WITH_ALL,
    max_blocks: 10,
  },

  // Level 15 — if path ahead (enter a branch when it's open)
  {
    id: "maze-15",
    course: "conditionals",
    name_mn: "Салбар зам",
    name_en: "The Branch",
    hint_mn:
      "`while path ahead { move forward; pick egg }`, эргээд `if path ahead { move forward }`-аар салбарт ор.",
    hint_en:
      "`while path ahead { move forward; pick egg }`, then turn and use `if path ahead { move forward }` to enter the branch.",
    hints_mn: [
      "Үндсэн замыг `while path ahead { move forward; pick egg }`-ээр яв.",
      "Салбарт орохын өмнө `if path ahead { move forward }`-аар зам нээлттэй эсэхийг шалга.",
    ],
    hints_en: [
      "Walk the main path with `while path ahead { move forward; pick egg }`.",
      "Before entering the branch, check with `if path ahead { move forward }`.",
    ],
    layout: [
      "########",
      "########",
      "####E###",
      "####.###",
      "####.###",
      "#R.E.###",
      "########",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 40,
    palette: WITH_ALL,
    max_blocks: 16,
  },

  // Level 16 — combine: three corridors with while + turns (comb)
  {
    id: "maze-16",
    course: "conditionals",
    name_mn: "Тойруулга",
    name_en: "The Comb",
    hint_mn:
      "Гурван коридор. `while path ahead { move forward; pick egg }` + `turn right`-ыг ээлжилнэ.",
    hint_en:
      "Three corridors. Alternate `while path ahead { move forward; pick egg }` and `turn right`.",
    hints_mn: [
      "Зүүн багана: `while path ahead { move forward; pick egg }` — дээш яв.",
      "Дээд шугам: `turn right`-ээр эргэлээд `while path ahead { ... }`-аар баруунш яв.",
      "Баруун багана: `turn right`-ээр эргэлээд `while path ahead { ... }`-аар доош яв.",
    ],
    hints_en: [
      "Left column: `while path ahead { move forward; pick egg }` — go up.",
      "Top row: `turn right` then `while path ahead { ... }` to go right.",
      "Right column: `turn right` then `while path ahead { ... }` to go down.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "#EEEE###",
      "#E##E###",
      "#E##E###",
      "#R##E###",
      "########",
    ],
    robotDir: 0, // North
    xp_reward: 48,
    palette: WITH_ALL,
    max_blocks: 14,
  },

  // ═══════════════════════════════════════════════════════════════════
  // COURSE 4: MASTER (levels 17–20) — Lava theme
  // ═══════════════════════════════════════════════════════════════════

  // Level 17 — large ring perimeter (nested loops)
  {
    id: "maze-17",
    course: "master",
    name_mn: "Цагираг",
    name_en: "The Ring",
    hint_mn:
      "Том тойрог замаар бүх өндөг цуглуул. `repeat 4 { repeat 3 { move forward; pick egg }; turn left }`",
    hint_en:
      "Collect all eggs around the ring. `repeat 4 { repeat 3 { move forward; pick egg }; turn left }`",
    hints_mn: [
      "Тал бүр `repeat 3 { move forward; pick egg }` — давталт дотор давталт.",
      "Булан бүрт `turn left` (цагийн зүүний чиглэлд тойрно).",
    ],
    hints_en: [
      "Each side is `repeat 3 { move forward; pick egg }` — a loop inside a loop.",
      "At every corner `turn left` (go around clockwise).",
    ],
    layout: [
      "########",
      "########",
      "##EEEE##",
      "##E##E##",
      "##E##E##",
      "##REEE##",
      "########",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 60,
    palette: WITH_ALL,
    max_blocks: 10,
  },

  // Level 18 — snake path (while + turns, unknown segment lengths)
  {
    id: "maze-18",
    course: "master",
    name_mn: "Могой зам",
    name_en: "Snake Path",
    hint_mn:
      "Могой шиг ороомог зам. `while path ahead { move forward }` + эргэлтүүдийг хослуул.",
    hint_en:
      "A winding snake path. Combine `while path ahead { move forward }` with turns.",
    hints_mn: [
      "Коридор бүр `while path ahead { move forward }` — уртыг мэдэхгүй байж яв.",
      "Булан бүрт `turn right` / `turn left` хийгээд дараагийн `while`-г эхлүүл.",
    ],
    hints_en: [
      "Each corridor is `while path ahead { move forward }` — go without knowing the length.",
      "At each corner `turn right` / `turn left` and start the next `while`.",
    ],
    layout: [
      "########",
      "#####E##",
      "#####.##",
      "##....##",
      "##.#####",
      "##.#####",
      "##R#####",
      "########",
    ],
    robotDir: 0, // North
    xp_reward: 70,
    palette: WITH_ALL,
    max_blocks: 11,
  },

  // Level 19 — minefield (TNT dodge, no loops needed)
  {
    id: "maze-19",
    course: "master",
    name_mn: "Миний талбар",
    name_en: "Minefield",
    hint_mn: "Нарийн зам. TNT-с зайлсхий. Чигээрээ яв!",
    hint_en: "Narrow path. Dodge the TNT. Go around it!",
    hints_mn: [
      "TNT-д хүрвэл дэлбэрнэ — тойроод яв.",
      "Дээгүүр тойрох зам нь баруун, дээш, зүүн гэх мэт эргэлттэй.",
    ],
    hints_en: [
      "Touch the TNT and you explode — go around it.",
      "The safe detour goes up and around with several turns.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "##...###",
      "#R.T.E##",
      "########",
      "########",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 75,
    palette: WITH_ALL,
    max_blocks: 14,
  },

  // Level 20 — final challenge (combine while + loops, many eggs)
  {
    id: "maze-20",
    course: "master",
    name_mn: "Эцсийн дайсан",
    name_en: "Final Challenge",
    hint_mn:
      "ЭЦСИЙН ШАЛГАЛТ. `while path ahead { move forward; pick egg }` + эргэлт + `repeat`-ийг хослуул.",
    hint_en:
      "THE FINAL TEST. Combine `while path ahead { move forward; pick egg }`, turns, and `repeat`.",
    hints_mn: [
      "Багана бүр `while path ahead { move forward; pick egg }`-ээр яв.",
      "Эргэлт бүрт `turn left` хийгээд дараагийн хэсэгт шилж. Сүүлийн хэсэгт `repeat` ашиглаж болно.",
    ],
    hints_en: [
      "Walk each column with `while path ahead { move forward; pick egg }`.",
      "At each turn `turn left` and move to the next part. Use `repeat` for the last stretch.",
    ],
    layout: [
      "########",
      "########",
      "########",
      "##EEEE##",
      "#####E##",
      "#####E##",
      "#REEEE##",
      "########",
    ],
    robotDir: 1, // East
    xp_reward: 100,
    palette: WITH_ALL,
    max_blocks: 14,
  },
];

// ─────────────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────────────

function parseRawLevel(raw: RawLevel): Level {
  const height = raw.layout.length;
  const width = Math.max(...raw.layout.map((r) => r.length));
  const walls = new Set<string>();
  const dangers = new Set<string>();
  const targets: Tile[] = [];
  let robotX = 0;
  let robotY = 0;
  for (let row = 0; row < height; row++) {
    const line = raw.layout[row].padEnd(width, "#");
    const y = height - 1 - row;
    for (let col = 0; col < width; col++) {
      const ch = line[col];
      const key = `${col},${y}`;
      if (ch === "#") {
        walls.add(key);
      } else if (ch === "T") {
        dangers.add(key);
      } else if (ch === "R") {
        robotX = col;
        robotY = y;
      } else if (ch === "E") {
        targets.push({ x: col, y });
      }
    }
  }
  return {
    id: raw.id,
    course: raw.course,
    name_mn: raw.name_mn,
    name_en: raw.name_en,
    hint_mn: raw.hint_mn,
    hint_en: raw.hint_en,
    hints_mn: raw.hints_mn,
    hints_en: raw.hints_en,
    width,
    height,
    robot: { x: robotX, y: robotY, dir: raw.robotDir },
    targets,
    walls,
    dangers,
    xp_reward: raw.xp_reward,
    palette: raw.palette,
    max_blocks: raw.max_blocks,
  };
}

export const LEVELS: Level[] = RAW_LEVELS.map(parseRawLevel);
export const TOTAL_LEVELS = LEVELS.length;

export function findLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

/** Convert a DB robot_levels row into the Level format used by the game. */
export function dbRowToLevel(row: {
  id: string;
  course: string;
  name_mn: string;
  name_en: string;
  hint_mn: string;
  hint_en: string;
  hints_mn?: string[];
  hints_en?: string[];
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
}): Level {
  // Parse EVERYTHING from the layout string — same logic as parseRawLevel.
  // This ensures robot/targets/dangers use the same game coordinate system
  // (y=0 = bottom) as the walls, instead of mixing in editor-screen coords.
  const height = row.layout.length;
  const width = row.width || Math.max(...row.layout.map((r) => r.length));
  const walls = new Set<string>();
  const dangers = new Set<string>();
  const targets: Tile[] = [];
  let robotX = 0;
  let robotY = 0;
  for (let layoutRow = 0; layoutRow < height; layoutRow++) {
    const line = row.layout[layoutRow].padEnd(width, "#");
    const y = height - 1 - layoutRow;
    for (let col = 0; col < width; col++) {
      const ch = line[col];
      const key = `${col},${y}`;
      if (ch === "#") walls.add(key);
      else if (ch === "T") dangers.add(key);
      else if (ch === "R") { robotX = col; robotY = y; }
      else if (ch === "E") targets.push({ x: col, y });
    }
  }

  return {
    id: row.id,
    course: row.course as CourseId,
    name_mn: row.name_mn,
    name_en: row.name_en,
    hint_mn: row.hint_mn,
    hint_en: row.hint_en,
    hints_mn: row.hints_mn,
    hints_en: row.hints_en,
    width,
    height,
    robot: { x: robotX, y: robotY, dir: row.robot_dir as Direction },
    targets,
    walls,
    dangers,
    xp_reward: row.xp_reward,
    palette: (row.palette ?? []) as ToolboxBlock[],
    max_blocks: row.max_blocks,
  };
}

/**
 * Merge built-in levels with DB custom levels.
 * If a DB level has the same ID as a built-in level, the DB version overrides.
 */
export function mergeLevels(dbRows: Level[]): Level[] {
  const dbMap = new Map(dbRows.map((r) => [r.id, r]));
  const builtIn = LEVELS.map((l) => dbMap.get(l.id) ?? l);
  // Add any DB-only levels
  for (const row of dbRows) {
    if (!LEVELS.some((l) => l.id === row.id)) {
      builtIn.push(row);
    }
  }
  return builtIn;
}

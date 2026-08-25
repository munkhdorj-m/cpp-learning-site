// Step-by-step diagrams for the lessons.
//
// The photographs in lesson-images.ts are metaphors — a matryoshka doll for
// recursion, a maze for backtracking. They set a mood, but a student stuck on
// "what actually happens when sum(3) calls sum(2)" cannot get the answer from
// a photograph. These decks are the answer to that: one idea, walked through
// a frame at a time, in the student's own language.
//
// A deck is DATA, not a drawing. Each slide names a scene made of a handful
// of primitives — a stack, a row of cells, a grid, a graph — and
// components/learn/slide-deck.tsx works out the geometry. That split is
// deliberate: hand-drawn SVG would be a thousand chances to overlap two
// labels, whereas the worst a bad deck here can do is highlight the wrong
// cell, which the checker script catches.
//
// Cell and node labels stay language-neutral (numbers, variable names, A/B/C)
// so one deck serves both readers. Every word of prose is bilingual.

/**
 * Geometry shared by the renderer and scripts/check-slides.mts.
 *
 * A graph is drawn into a frame far wider than it is tall, so the same gap in
 * these 0-100 coordinates is generous horizontally and tight vertically. The
 * checker reproduces the mapping from these numbers to decide whether two
 * nodes would actually overlap on the page.
 */
export const GRAPH_H = 300;
export const NODE_R = 17;
/** viewBox width, and the padding inside it. */
export const VIEW_W = 660;
export const VIEW_PAD = 14;

/**
 * Where each node lands inside the graph frame, in frame-local pixels.
 *
 * The node coordinates are fitted to their own bounding box rather than read
 * as absolute 0-100 positions, so a deck fills the frame whatever range its
 * author happened to use — and nobody has to hand-tune numbers to stop a
 * drawing sitting in the top third. A layout with every node on one line has
 * no span to fit, so it is centred on that axis instead of dividing by zero.
 */
export function graphLayout(nodes: { x: number; y: number }[]) {
  const w = VIEW_W - 2 * VIEW_PAD - 2 * (NODE_R + 6);
  const h = GRAPH_H - 2 * (NODE_R + 6);
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX;
  const spanY = maxY - minY;

  return {
    w,
    h,
    at(n: { x: number; y: number }) {
      return {
        cx: spanX > 0 ? ((n.x - minX) / spanX) * w : w / 2,
        cy: spanY > 0 ? ((n.y - minY) / spanY) * h : h / 2,
      };
    },
  };
}

/** What a cell or node is doing at this step. Drives its colour. */
export type Tone =
  /** Not involved yet. */
  | "idle"
  /** Where the algorithm is looking right now. */
  | "active"
  /** Settled — the answer here will not change again. */
  | "done"
  /** Ruled out, pruned, or a wall. */
  | "bad"
  /** Reachable but not yet visited; drawn faintly. */
  | "ghost";

export interface Cell {
  /** Short, language-neutral: a number, a name, `i`, `A`. */
  label?: string;
  tone?: Tone;
  /** Smaller text under the cell — an index, a distance. */
  sub?: string;
}

export interface Pointer {
  /** Index of the cell it points at. */
  at: number;
  /** `lo`, `hi`, `i`, `j` — kept short, it sits under one cell. */
  label: string;
  tone?: Tone;
}

export interface Row {
  /** Left-hand label for the row: `v`, `dp`, `prefix`. */
  name?: string;
  cells: Cell[];
  /** Drawn under this row, one arrow per pointer. */
  pointers?: Pointer[];
}

export interface GraphNode {
  id: string;
  /** Position in a 0–100 square. The renderer maps it into the frame. */
  x: number;
  y: number;
  label: string;
  tone?: Tone;
  /** Small text beside the node — a distance, a visit order. */
  sub?: string;
}

export interface GraphEdge {
  a: string;
  b: string;
  /** A weight, where the lesson has weights. */
  label?: string;
  tone?: Tone;
  /** Draws an arrowhead at `b`. */
  directed?: boolean;
}

export type Scene =
  /** Frames of a call stack. First entry is the bottom of the stack. */
  | { kind: "stack"; frames: Cell[]; caption_mn?: string; caption_en?: string }
  /** One or more labelled rows of cells — arrays, dp tables, two pointers. */
  | { kind: "rows"; rows: Row[]; caption_mn?: string; caption_en?: string }
  /** A 2-D grid, row-major. `cells.length` must be `w * h`. */
  | {
      kind: "grid";
      w: number;
      h: number;
      cells: Cell[];
      caption_mn?: string;
      caption_en?: string;
    }
  /** Nodes and edges. Also used for trees — give the nodes tree positions. */
  | {
      kind: "graph";
      nodes: GraphNode[];
      edges: GraphEdge[];
      caption_mn?: string;
      caption_en?: string;
    }
  /** Boxes joined by arrows, top to bottom. */
  | {
      kind: "flow";
      steps: Cell[];
      horizontal?: boolean;
      caption_mn?: string;
      caption_en?: string;
    }
  /** Labelled bars — how work grows with n. `value` is relative, 0–100. */
  | {
      kind: "bars";
      bars: { label: string; value: number; sub?: string; tone?: Tone }[];
      caption_mn?: string;
      caption_en?: string;
    }
  /** A key → value table: a map, or the fields of one object. */
  | {
      kind: "pairs";
      pairs: { key: string; value: string; tone?: Tone }[];
      caption_mn?: string;
      caption_en?: string;
    }
  /** Two scenes side by side — the call chain next to the stack it builds. */
  | { kind: "split"; left: Scene; right: Scene };

export interface Slide {
  /** What this step does, in one short line. Shown above the drawing. */
  title_mn: string;
  title_en: string;
  scene: Scene;
}

export interface Deck {
  /** Heading for the whole deck. */
  title_mn: string;
  title_en: string;
  slides: Slide[];
}

/** Keyed by lesson slug. */
export const LESSON_SLIDES: Record<string, Deck> = {
  recursion: {
    title_mn: "factorial(5) хэрхэн ажилладаг вэ",
    title_en: "How factorial(5) actually runs",
    slides: [
      {
        title_mn: "factorial(5) дуудагдаж, дуудлагын стек рүү орно.",
        title_en: "factorial(5) is called, and goes onto the call stack.",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [{ label: "factorial(5)", tone: "active" }],
            caption_mn: "Дуудлагын гинж",
            caption_en: "The chain of calls",
          },
          right: {
            kind: "stack",
            frames: [{ label: "factorial(5)", tone: "active" }],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "5 нь 1-ээс их тул хариу нь 5 × factorial(4) болно.",
        title_en: "5 is bigger than 1, so the answer is 5 × factorial(4).",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [
              { label: "factorial(5)" },
              { label: "5 * factorial(4)", tone: "active" },
            ],
            caption_mn: "Дуудлагын гинж",
            caption_en: "The chain of calls",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "factorial(5)" },
              { label: "factorial(4)", tone: "active" },
            ],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "factorial(4) мөн адил factorial(3)-ыг дуудна.",
        title_en: "factorial(4) does the same, and calls factorial(3).",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [
              { label: "factorial(5)" },
              { label: "5 * factorial(4)" },
              { label: "4 * factorial(3)", tone: "active" },
            ],
            caption_mn: "Дуудлагын гинж",
            caption_en: "The chain of calls",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "factorial(5)" },
              { label: "factorial(4)" },
              { label: "factorial(3)", tone: "active" },
            ],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "Гурав дахь давхарга: factorial(2) стек рүү орлоо.",
        title_en: "One layer deeper: factorial(2) joins the stack.",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [
              { label: "5 * factorial(4)" },
              { label: "4 * factorial(3)" },
              { label: "3 * factorial(2)", tone: "active" },
            ],
            caption_mn: "Хүлээж буй үржүүлэлтүүд",
            caption_en: "Multiplications still waiting",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "factorial(5)" },
              { label: "factorial(4)" },
              { label: "factorial(3)" },
              { label: "factorial(2)", tone: "active" },
            ],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "factorial(1) хамгийн дээр орлоо. Стек хамгийн гүн нь энэ.",
        title_en: "factorial(1) goes on top. This is as deep as it gets.",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [
              { label: "4 * factorial(3)" },
              { label: "3 * factorial(2)" },
              { label: "2 * factorial(1)", tone: "active" },
            ],
            caption_mn: "Хүлээж буй үржүүлэлтүүд",
            caption_en: "Multiplications still waiting",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "factorial(5)" },
              { label: "factorial(4)" },
              { label: "factorial(3)" },
              { label: "factorial(2)" },
              { label: "factorial(1)", tone: "active" },
            ],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "Зогсох нөхцөл: 1 <= 1 тул шууд 1 буцаана. Энд эргэлт эхэлнэ.",
        title_en: "The stopping case: 1 <= 1, so it returns 1 outright. Now it unwinds.",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [
              { label: "3 * factorial(2)" },
              { label: "2 * factorial(1)" },
              { label: "factorial(1) = 1", tone: "done" },
            ],
            caption_mn: "Анхны бодит хариу",
            caption_en: "The first real answer",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "factorial(5)" },
              { label: "factorial(4)" },
              { label: "factorial(3)" },
              { label: "factorial(2)" },
              { label: "factorial(1) = 1", tone: "done" },
            ],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "factorial(1) стекээс гарч, factorial(2) = 2 × 1 = 2 болно.",
        title_en: "factorial(1) leaves the stack, and factorial(2) = 2 × 1 = 2.",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [
              { label: "4 * factorial(3)" },
              { label: "3 * factorial(2)" },
              { label: "2 * 1 = 2", tone: "done" },
            ],
            caption_mn: "Хариу буцаж эхэллээ",
            caption_en: "The answers start coming back",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "factorial(5)" },
              { label: "factorial(4)" },
              { label: "factorial(3)" },
              { label: "factorial(2) = 2", tone: "done" },
            ],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "Ижил зүйл дахин давтагдана: factorial(3) = 3 × 2 = 6.",
        title_en: "The same thing happens again: factorial(3) = 3 × 2 = 6.",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [
              { label: "5 * factorial(4)" },
              { label: "4 * factorial(3)" },
              { label: "3 * 2 = 6", tone: "done" },
            ],
            caption_mn: "Хариу буцаж байна",
            caption_en: "Answers coming back",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "factorial(5)" },
              { label: "factorial(4)" },
              { label: "factorial(3) = 6", tone: "done" },
            ],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "Дараагийн давхарга: factorial(4) = 4 × 6 = 24.",
        title_en: "One layer up: factorial(4) = 4 × 6 = 24.",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [
              { label: "5 * factorial(4)" },
              { label: "4 * 6 = 24", tone: "done" },
            ],
            caption_mn: "Хариу буцаж байна",
            caption_en: "Answers coming back",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "factorial(5)" },
              { label: "factorial(4) = 24", tone: "done" },
            ],
            caption_mn: "Дуудлагын стек",
            caption_en: "Call stack",
          },
        },
      },
      {
        title_mn: "factorial(5) = 5 × 24 = 120. Стек хоосорч, хариу гарна.",
        title_en: "factorial(5) = 5 × 24 = 120. The stack empties and the answer comes out.",
        scene: {
          kind: "split",
          left: {
            kind: "flow",
            steps: [{ label: "5 * 24 = 120", tone: "done" }],
            caption_mn: "Эцсийн хариу",
            caption_en: "The final answer",
          },
          right: {
            kind: "stack",
            frames: [{ label: "", tone: "ghost" }],
            caption_mn: "Стек хоосон",
            caption_en: "Stack empty",
          },
        },
      },
    ],
  },
  "binary-search": {
    title_mn: "23-ыг хэрхэн олох вэ",
    title_en: "Finding 23, step by step",
    slides: [
      {
        title_mn: "Бүх массив хайлтын мужид байна: lo = 0, hi = 5.",
        title_en: "The whole array is still in play: lo = 0, hi = 5.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0" },
                { label: "8", sub: "1" },
                { label: "15", sub: "2" },
                { label: "16", sub: "3" },
                { label: "23", sub: "4" },
                { label: "42", sub: "5" },
              ],
              pointers: [
                { at: 0, label: "lo" },
                { at: 5, label: "hi" },
              ],
            },
          ],
          caption_mn: "Хайж буй утга: 23",
          caption_en: "Looking for 23",
        },
      },
      {
        title_mn: "mid = 0 + (5 - 0) / 2 = 2. Дунд нүдийг шалгана.",
        title_en: "mid = 0 + (5 - 0) / 2 = 2. Check the middle cell.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0" },
                { label: "8", sub: "1" },
                { label: "15", sub: "2", tone: "active" },
                { label: "16", sub: "3" },
                { label: "23", sub: "4" },
                { label: "42", sub: "5" },
              ],
              pointers: [
                { at: 0, label: "lo" },
                { at: 2, label: "mid" },
                { at: 5, label: "hi" },
              ],
            },
          ],
          caption_mn: "Хайж буй утга: 23",
          caption_en: "Looking for 23",
        },
      },
      {
        title_mn: "v[2] = 15, энэ нь 23-аас бага. Тэгвэл 23 нь баруун талд байна.",
        title_en: "v[2] = 15, which is less than 23. So 23 must be to the right.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "bad" },
                { label: "8", sub: "1", tone: "bad" },
                { label: "15", sub: "2", tone: "bad" },
                { label: "16", sub: "3" },
                { label: "23", sub: "4" },
                { label: "42", sub: "5" },
              ],
            },
          ],
          caption_mn: "Зүүн хагас бүхэлдээ хасагдана",
          caption_en: "The whole left half is thrown away",
        },
      },
      {
        title_mn: "lo = mid + 1 = 3. Одоо ердөө гурван нүд үлдлээ.",
        title_en: "lo = mid + 1 = 3. Only three cells are left.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "ghost" },
                { label: "8", sub: "1", tone: "ghost" },
                { label: "15", sub: "2", tone: "ghost" },
                { label: "16", sub: "3" },
                { label: "23", sub: "4" },
                { label: "42", sub: "5" },
              ],
              pointers: [
                { at: 3, label: "lo" },
                { at: 5, label: "hi" },
              ],
            },
          ],
          caption_mn: "Нэг алхмаар зургаагаас гурав болов",
          caption_en: "One step took six cells down to three",
        },
      },
      {
        title_mn: "mid = 3 + (5 - 3) / 2 = 4. Дахин дундыг нь шалгана.",
        title_en: "mid = 3 + (5 - 3) / 2 = 4. Check the middle again.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "ghost" },
                { label: "8", sub: "1", tone: "ghost" },
                { label: "15", sub: "2", tone: "ghost" },
                { label: "16", sub: "3" },
                { label: "23", sub: "4", tone: "active" },
                { label: "42", sub: "5" },
              ],
              pointers: [
                { at: 3, label: "lo" },
                { at: 4, label: "mid" },
                { at: 5, label: "hi" },
              ],
            },
          ],
          caption_mn: "Хайж буй утга: 23",
          caption_en: "Looking for 23",
        },
      },
      {
        title_mn: "v[4] = 23 — оллоо. Хариу нь индекс 4, хоёрхон шалгалтаар.",
        title_en: "v[4] = 23 — found it. The answer is index 4, after just two checks.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "ghost" },
                { label: "8", sub: "1", tone: "ghost" },
                { label: "15", sub: "2", tone: "ghost" },
                { label: "16", sub: "3", tone: "ghost" },
                { label: "23", sub: "4", tone: "done" },
                { label: "42", sub: "5", tone: "ghost" },
              ],
              pointers: [{ at: 4, label: "return 4", tone: "done" }],
            },
          ],
          caption_mn: "Шугаман хайлт бол 5 шалгалт хийх байсан",
          caption_en: "A linear search would have taken 5 checks",
        },
      },
    ],
  },
  complexity: {
    title_mn: "Нэг давталт ба давхар давталтын ялгаа",
    title_en: "One loop against two loops",
    slides: [
      {
        title_mn: "6 элементтэй массив. Нэг давталт нүд бүрийг нэг л удаа хардаг.",
        title_en: "An array of 6. One loop looks at each cell exactly once.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", tone: "active" },
                { label: "8" },
                { label: "15" },
                { label: "16" },
                { label: "23" },
                { label: "42" },
              ],
              pointers: [{ at: 0, label: "i" }],
            },
          ],
          caption_mn: "Одоогийн алхам: 1",
          caption_en: "Steps so far: 1",
        },
      },
      {
        title_mn: "Давталт төгсөхөд яг 6 алхам болсон байна.",
        title_en: "When the loop ends it has taken exactly 6 steps.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", tone: "done" },
                { label: "8", tone: "done" },
                { label: "15", tone: "done" },
                { label: "16", tone: "done" },
                { label: "23", tone: "done" },
                { label: "42", tone: "done" },
              ],
              pointers: [{ at: 5, label: "i", tone: "done" }],
            },
          ],
          caption_mn: "Нийт алхам: 6",
          caption_en: "Steps in total: 6",
        },
      },
      {
        title_mn: "Давхар давталт нүд бүрийг нүд бүртэй хослуулна: 6 × 6 = 36.",
        title_en: "Two nested loops pair every cell with every cell: 6 × 6 = 36.",
        scene: {
          kind: "grid",
          w: 6,
          h: 6,
          cells: [
            { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" },
            { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" },
            { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" },
            { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" },
            { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" },
            { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" }, { tone: "active" },
          ],
          caption_mn: "Нүд бүр нэг i, j хосыг илэрхийлнэ",
          caption_en: "Each square is one i, j pair",
        },
      },
      {
        title_mn: "6 элемент дээр ялгаа нь ердөө 6 ба 36 — тэвчиж болно.",
        title_en: "At 6 elements the gap is only 6 against 36 — nothing to worry about.",
        scene: {
          kind: "bars",
          bars: [
            { label: "O(n)", value: 17, sub: "6", tone: "done" },
            { label: "O(n^2)", value: 100, sub: "36", tone: "active" },
          ],
          caption_mn: "n = 6 үед",
          caption_en: "when n = 6",
        },
      },
      {
        title_mn: "Гэхдээ n томрох тусам давхар давталт хэдэн зуу дахин ажил нэмнэ.",
        title_en: "But as n grows, two loops pile on hundreds of times the work.",
        scene: {
          kind: "bars",
          bars: [
            { label: "n = 10", value: 1, sub: "100", tone: "done" },
            { label: "n = 100", value: 10, sub: "10 000", tone: "active" },
            { label: "n = 1000", value: 100, sub: "1 000 000", tone: "bad" },
          ],
          caption_mn: "Давхар давталтын алхмын тоо",
          caption_en: "Steps taken by the two loops",
        },
      },
      {
        title_mn: "Тиймээс 1 секундэд багтах эсэхийг n-ээс нь харж таамаглаж болно.",
        title_en: "So you can guess from n alone whether it will fit in one second.",
        scene: {
          kind: "bars",
          bars: [
            { label: "O(n)", value: 1, sub: "100 000", tone: "done" },
            { label: "O(n log n)", value: 2, sub: "1 700 000", tone: "done" },
            { label: "O(n^2)", value: 100, sub: "10 000 000 000", tone: "bad" },
          ],
          caption_mn: "n = 100 000 үеийн алхмын тоо",
          caption_en: "Steps when n = 100 000",
        },
      },
    ],
  },
  grids: {
    title_mn: "3 × 4 хүснэгт хэрхэн дүүрдэг вэ",
    title_en: "Filling a 3 by 4 grid",
    slides: [
      {
        title_mn: "3 мөр, 4 багана. Бүх нүд 0-ээр эхэлнэ.",
        title_en: "Three rows, four columns. Every cell starts at 0.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "0" },
          ],
          caption_mn: "vector<vector<int>> g(3, vector<int>(4, 0))",
          caption_en: "vector<vector<int>> g(3, vector<int>(4, 0))",
        },
      },
      {
        title_mn: "g[0][0] = 1. Эхний тоо нь МӨР, хоёр дахь нь БАГАНА.",
        title_en: "g[0][0] = 1. The first number is the ROW, the second the COLUMN.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "active" }, { label: "0" }, { label: "0" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "0" },
          ],
          caption_mn: "Мөр 0, багана 0",
          caption_en: "Row 0, column 0",
        },
      },
      {
        title_mn: "g[1][2] = 7 — нэг доош, хоёр баруун тийш.",
        title_en: "g[1][2] = 7 — one down, two across.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "0" }, { label: "0" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "7", tone: "active" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "0" },
          ],
          caption_mn: "Мөр 1, багана 2",
          caption_en: "Row 1, column 2",
        },
      },
      {
        title_mn: "g[2][3] = 9 — сүүлийн мөрийн сүүлийн нүд.",
        title_en: "g[2][3] = 9 — the last cell of the last row.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "0" }, { label: "0" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "7", tone: "done" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "9", tone: "active" },
          ],
          caption_mn: "Мөр 2, багана 3",
          caption_en: "Row 2, column 3",
        },
      },
      {
        title_mn: "Гадна давталт мөр сонгоно. Эхлээд мөр 0-ыг бүхэлд нь хэвлэнэ.",
        title_en: "The outer loop picks a row. Row 0 is printed first, all of it.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "active" }, { label: "0", tone: "active" }, { label: "0", tone: "active" }, { label: "0", tone: "active" },
            { label: "0" }, { label: "0" }, { label: "7" }, { label: "0" },
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "9" },
          ],
          caption_mn: "Хэвлэв: 1 0 0 0",
          caption_en: "Printed: 1 0 0 0",
        },
      },
      {
        title_mn: "Дараа нь мөр 1. Дотор давталт багана бүрийг гүйнэ.",
        title_en: "Then row 1. The inner loop runs across the columns.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "0", tone: "done" }, { label: "0", tone: "done" }, { label: "0", tone: "done" },
            { label: "0", tone: "active" }, { label: "0", tone: "active" }, { label: "7", tone: "active" }, { label: "0", tone: "active" },
            { label: "0" }, { label: "0" }, { label: "0" }, { label: "9" },
          ],
          caption_mn: "Хэвлэв: 0 0 7 0",
          caption_en: "Printed: 0 0 7 0",
        },
      },
      {
        title_mn: "Эцэст нь мөр 2. Хүснэгт бүхэлдээ хэвлэгдлээ.",
        title_en: "Finally row 2. The whole grid has been printed.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "0", tone: "done" }, { label: "0", tone: "done" }, { label: "0", tone: "done" },
            { label: "0", tone: "done" }, { label: "0", tone: "done" }, { label: "7", tone: "done" }, { label: "0", tone: "done" },
            { label: "0", tone: "done" }, { label: "0", tone: "done" }, { label: "0", tone: "done" }, { label: "9", tone: "done" },
          ],
          caption_mn: "Хэвлэв: 0 0 0 9",
          caption_en: "Printed: 0 0 0 9",
        },
      },
    ],
  },
  "arrays-in-functions": {
    title_mn: "& тэмдэг байхад юу өөрчлөгддөг вэ",
    title_en: "What the & actually changes",
    slides: [
      {
        title_mn: "main дотор nums = {1, 2, 3} гэсэн ганц вектор байна.",
        title_en: "Inside main there is one vector, nums = {1, 2, 3}.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [{ label: "1" }, { label: "2" }, { label: "3" }],
            },
          ],
          caption_mn: "Санах ойд ганцхан хуулбар",
          caption_en: "One copy, in memory",
        },
      },
      {
        title_mn: "addOne(vector<int>& v) — & тул v нь ЯГ ЭНЭ вектор, хуулбар биш.",
        title_en: "addOne(vector<int>& v) — the & means v IS this vector, not a copy.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [
                { label: "1", tone: "active" },
                { label: "2", tone: "active" },
                { label: "3", tone: "active" },
              ],
            },
            {
              name: "v",
              cells: [
                { label: "1", tone: "ghost" },
                { label: "2", tone: "ghost" },
                { label: "3", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "Хоёр нэр, нэг л массив",
          caption_en: "Two names for one array",
        },
      },
      {
        title_mn: "Функц утга бүр дээр 1 нэмнэ. Өөрчлөлт nums дээр шууд суулаа.",
        title_en: "The function adds 1 to each value. The change lands on nums itself.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [
                { label: "2", tone: "done" },
                { label: "3", tone: "done" },
                { label: "4", tone: "done" },
              ],
            },
          ],
          caption_mn: "main дотор хэвлэвэл: 2 3 4",
          caption_en: "Printed back in main: 2 3 4",
        },
      },
      {
        title_mn: "& байхгүй бол хуулбар үүсэх байсан ба nums хэвээрээ үлдэнэ.",
        title_en: "Without the &, a copy would be made and nums would be untouched.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [{ label: "1" }, { label: "2" }, { label: "3" }],
            },
            {
              name: "v",
              cells: [
                { label: "2", tone: "bad" },
                { label: "3", tone: "bad" },
                { label: "4", tone: "bad" },
              ],
            },
          ],
          caption_mn: "Хуулбар өөрчлөгдөөд шууд устана",
          caption_en: "The copy changes, then is thrown away",
        },
      },
      {
        title_mn: "sum нь const & — уншина, гэхдээ өөрчилж чадахгүй. Нэмж эхэллээ.",
        title_en: "sum takes const & — it can read but not change. It starts adding.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [
                { label: "2", tone: "active" },
                { label: "3" },
                { label: "4" },
              ],
              pointers: [{ at: 0, label: "x" }],
            },
            { name: "total", cells: [{ label: "2", tone: "active" }] },
          ],
          caption_mn: "total = 0 + 2",
          caption_en: "total = 0 + 2",
        },
      },
      {
        title_mn: "Гурван утгыг нэмж дуусахад total = 9 болно.",
        title_en: "After all three values, total = 9.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [
                { label: "2", tone: "done" },
                { label: "3", tone: "done" },
                { label: "4", tone: "done" },
              ],
              pointers: [{ at: 2, label: "x", tone: "done" }],
            },
            { name: "total", cells: [{ label: "9", tone: "done" }] },
          ],
          caption_mn: "2 + 3 + 4 = 9",
          caption_en: "2 + 3 + 4 = 9",
        },
      },
    ],
  },
  "fast-io": {
    title_mn: "Тоонууд хэрхэн уншигдаж, нийлбэр гарах вэ",
    title_en: "How the numbers get read and added up",
    slides: [
      {
        title_mn: "Оролт бол ганц урт урсгал: 10 20 5 15 10.",
        title_en: "The input is one long stream: 10 20 5 15 10.",
        scene: {
          kind: "flow",
          horizontal: true,
          steps: [
            { label: "10" },
            { label: "20" },
            { label: "5" },
            { label: "15" },
            { label: "10" },
          ],
          caption_mn: "cin >> x нэг дор нэг тоо салгаж авна",
          caption_en: "cin >> x pulls off one number at a time",
        },
      },
      {
        title_mn: "cin >> x эхний тоог авч, nums руу хийнэ.",
        title_en: "cin >> x takes the first number and pushes it into nums.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [{ label: "10", tone: "active" }],
            },
          ],
          caption_mn: "Уншсан: 10",
          caption_en: "Read: 10",
        },
      },
      {
        title_mn: "Урсгал дуустал давтана. Таван тоо орж ирлээ.",
        title_en: "It repeats until the stream runs dry. Five numbers arrive.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [
                { label: "10", tone: "done" },
                { label: "20", tone: "done" },
                { label: "5", tone: "done" },
                { label: "15", tone: "done" },
                { label: "10", tone: "active" },
              ],
            },
          ],
          caption_mn: "nums.size() = 5",
          caption_en: "nums.size() = 5",
        },
      },
      {
        title_mn: "Хоёр дахь давталт нийлбэрийг цуглуулна.",
        title_en: "A second loop collects the total.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [
                { label: "10", tone: "done" },
                { label: "20", tone: "done" },
                { label: "5", tone: "active" },
                { label: "15" },
                { label: "10" },
              ],
              pointers: [{ at: 2, label: "v" }],
            },
            { name: "total", cells: [{ label: "35", tone: "active" }] },
          ],
          caption_mn: "10 + 20 + 5 = 35",
          caption_en: "10 + 20 + 5 = 35",
        },
      },
      {
        title_mn: "Дуусахад 5 ба 60 гэж хэвлэнэ.",
        title_en: "At the end it prints 5 and 60.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "nums",
              cells: [
                { label: "10", tone: "done" },
                { label: "20", tone: "done" },
                { label: "5", tone: "done" },
                { label: "15", tone: "done" },
                { label: "10", tone: "done" },
              ],
            },
            { name: "total", cells: [{ label: "60", tone: "done" }] },
          ],
          caption_mn: "5 60",
          caption_en: "5 60",
        },
      },
      {
        title_mn: "sync_with_stdio(false) нь энэ уншилтыг олон дахин хурдасгана.",
        title_en: "sync_with_stdio(false) makes that reading several times faster.",
        scene: {
          kind: "bars",
          bars: [
            { label: "true", value: 100, sub: "~1.2 s", tone: "bad" },
            { label: "false", value: 20, sub: "~0.25 s", tone: "done" },
          ],
          caption_mn: "sync_with_stdio(...) — 1 сая тоо уншихад",
          caption_en: "sync_with_stdio(...) — reading a million numbers",
        },
      },
    ],
  },
  "linear-search": {
    title_mn: "15-ыг, дараа нь 99-ийг хайх нь",
    title_en: "Looking for 15, then for 99",
    slides: [
      {
        title_mn: "i = 0. v[0] = 4, энэ нь 15 биш. Цааш үргэлжилнэ.",
        title_en: "i = 0. v[0] = 4, which is not 15. Keep going.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "active" },
                { label: "8", sub: "1" },
                { label: "15", sub: "2" },
                { label: "16", sub: "3" },
                { label: "23", sub: "4" },
                { label: "42", sub: "5" },
              ],
              pointers: [{ at: 0, label: "i" }],
            },
          ],
          caption_mn: "Хайж буй утга: 15",
          caption_en: "Looking for 15",
        },
      },
      {
        title_mn: "i = 1. v[1] = 8, мөн биш. Нэг нүд урагшилна.",
        title_en: "i = 1. v[1] = 8, not it either. One cell forward.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "bad" },
                { label: "8", sub: "1", tone: "active" },
                { label: "15", sub: "2" },
                { label: "16", sub: "3" },
                { label: "23", sub: "4" },
                { label: "42", sub: "5" },
              ],
              pointers: [{ at: 1, label: "i" }],
            },
          ],
          caption_mn: "Хайж буй утга: 15",
          caption_en: "Looking for 15",
        },
      },
      {
        title_mn: "i = 2. v[2] = 15 — таарлаа. Функц шууд 2 буцаана.",
        title_en: "i = 2. v[2] = 15 — a match. The function returns 2 straight away.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "bad" },
                { label: "8", sub: "1", tone: "bad" },
                { label: "15", sub: "2", tone: "done" },
                { label: "16", sub: "3", tone: "ghost" },
                { label: "23", sub: "4", tone: "ghost" },
                { label: "42", sub: "5", tone: "ghost" },
              ],
              pointers: [{ at: 2, label: "return 2", tone: "done" }],
            },
          ],
          caption_mn: "Үлдсэн гурван нүдийг хармаар ч үгүй",
          caption_en: "The last three cells are never even looked at",
        },
      },
      {
        title_mn: "Одоо 99-ийг хайя. Дахин эхнээс нь эхэлнэ.",
        title_en: "Now look for 99. It starts again from the front.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "active" },
                { label: "8", sub: "1" },
                { label: "15", sub: "2" },
                { label: "16", sub: "3" },
                { label: "23", sub: "4" },
                { label: "42", sub: "5" },
              ],
              pointers: [{ at: 0, label: "i" }],
            },
          ],
          caption_mn: "Хайж буй утга: 99",
          caption_en: "Looking for 99",
        },
      },
      {
        title_mn: "Бүх зургаан нүдийг шалгасан ч 99 олдсонгүй.",
        title_en: "All six cells checked, and 99 is nowhere.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "4", sub: "0", tone: "bad" },
                { label: "8", sub: "1", tone: "bad" },
                { label: "15", sub: "2", tone: "bad" },
                { label: "16", sub: "3", tone: "bad" },
                { label: "23", sub: "4", tone: "bad" },
                { label: "42", sub: "5", tone: "bad" },
              ],
              pointers: [{ at: 5, label: "i", tone: "bad" }],
            },
          ],
          caption_mn: "Давталт дуусав",
          caption_en: "The loop has run out",
        },
      },
      {
        title_mn: "Тиймээс -1 буцаана. Индекс сөрөг байдаггүй тул энэ нь аюулгүй тэмдэг.",
        title_en: "So it returns -1. An index is never negative, so that is a safe marker.",
        scene: {
          kind: "bars",
          bars: [
            { label: "15", value: 50, sub: "3", tone: "done" },
            { label: "99", value: 100, sub: "6", tone: "bad" },
          ],
          caption_mn: "Утга олохын тулд хийсэн шалгалтын тоо",
          caption_en: "Checks made to find each value",
        },
      },
    ],
  },
  "sorting-tools": {
    title_mn: "sort юуг, ямар дарааллаар байрлуулдаг вэ",
    title_en: "What sort puts where, and in what order",
    slides: [
      {
        title_mn: "v = {5, 2, 9, 1}. Ямар ч дараалалгүй.",
        title_en: "v = {5, 2, 9, 1}. No order at all.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "5" },
                { label: "2" },
                { label: "9" },
                { label: "1" },
              ],
            },
          ],
          caption_mn: "Эрэмбэлэхийн өмнө",
          caption_en: "Before sorting",
        },
      },
      {
        title_mn: "sort(v.begin(), v.end()) — өсөх дарааллаар нэг мөрөөр эрэмбэлнэ.",
        title_en: "sort(v.begin(), v.end()) — one line, and it is in ascending order.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "1", tone: "done" },
                { label: "2", tone: "done" },
                { label: "5", tone: "done" },
                { label: "9", tone: "done" },
              ],
            },
          ],
          caption_mn: "Дотор нь ямар арга ажилласныг мэдэх шаардлагагүй",
          caption_en: "You never need to know which method it used",
        },
      },
      {
        title_mn: "Одоо оюутнууд. Тэднийг оноогоор нь эрэмбэлмээр байна.",
        title_en: "Now the students. We want them ordered by score.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "Bat", value: "70" },
            { key: "Suvd", value: "95" },
            { key: "Tuul", value: "82" },
          ],
          caption_mn: "Анхны дараалал",
          caption_en: "The order they were written in",
        },
      },
      {
        title_mn: "byScore нь a.score > b.score гэж хэлнэ: их оноо түрүүлнэ.",
        title_en: "byScore says a.score > b.score: the bigger score comes first.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "Bat", value: "70", tone: "active" },
            { key: "Suvd", value: "95", tone: "active" },
            { key: "Tuul", value: "82" },
          ],
          caption_mn: "70 > 95 худал, тиймээс Suvd урагшилна",
          caption_en: "70 > 95 is false, so Suvd moves ahead",
        },
      },
      {
        title_mn: "Үр дүнд оноо буурах дарааллаар байрлана.",
        title_en: "The result is in descending order of score.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "Suvd", value: "95", tone: "done" },
            { key: "Tuul", value: "82", tone: "done" },
            { key: "Bat", value: "70", tone: "done" },
          ],
          caption_mn: "Хэвлэв: Suvd Tuul Bat",
          caption_en: "Printed: Suvd Tuul Bat",
        },
      },
      {
        title_mn: "Харьцуулагч нь дарааллыг эргүүлэх ганц зүйл. Бусад нь ижил.",
        title_en: "The comparator is the only thing that flipped the order. Nothing else changed.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "<",
              cells: [
                { label: "1", tone: "done" },
                { label: "2", tone: "done" },
                { label: "5", tone: "done" },
                { label: "9", tone: "done" },
              ],
            },
            {
              name: ">",
              cells: [
                { label: "9", tone: "active" },
                { label: "5", tone: "active" },
                { label: "2", tone: "active" },
                { label: "1", tone: "active" },
              ],
            },
          ],
          caption_mn: "Дээд нь анхдагч, доод нь харьцуулагчтай",
          caption_en: "Top is the default, bottom is with a comparator",
        },
      },
    ],
  },
  "binary-search-answer": {
    title_mn: "Хамгийн урт хэрчмийг хайх нь",
    title_en: "Hunting for the longest piece",
    slides: [
      {
        title_mn: "8, 12, 5 урттай гурван банз байна. 4 ижил хэрчим хэрэгтэй.",
        title_en: "Three boards of length 8, 12 and 5. We need 4 equal pieces.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "b",
              cells: [
                { label: "8" },
                { label: "12" },
                { label: "5" },
              ],
            },
          ],
          caption_mn: "k = 4. Хэрчим хамгийн ихдээ хэдэн урт байж болох вэ?",
          caption_en: "k = 4. How long can each piece be?",
        },
      },
      {
        title_mn: "Хариу нь 1-ээс 12-ын хооронд байх ёстой. Тэр мужаас хайна.",
        title_en: "The answer has to be between 1 and 12. That range is what we search.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "len",
              cells: [
                { label: "1" }, { label: "2" }, { label: "3" }, { label: "4" },
                { label: "5" }, { label: "6" }, { label: "7" }, { label: "8" },
                { label: "9" }, { label: "10" }, { label: "11" }, { label: "12" },
              ],
              pointers: [
                { at: 0, label: "lo" },
                { at: 11, label: "hi" },
              ],
            },
          ],
          caption_mn: "Урт бүрийг тусад нь шалгах шаардлагагүй",
          caption_en: "We will not have to test every length",
        },
      },
      {
        title_mn: "mid = 6. 8/6 + 12/6 + 5/6 = 1 + 2 + 0 = 3 хэрчим. 4 хүрэхгүй.",
        title_en: "mid = 6. 8/6 + 12/6 + 5/6 = 1 + 2 + 0 = 3 pieces. Not enough.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "len",
              cells: [
                { label: "1" }, { label: "2" }, { label: "3" }, { label: "4" },
                { label: "5" }, { label: "6", tone: "bad" }, { label: "7", tone: "bad" }, { label: "8", tone: "bad" },
                { label: "9", tone: "bad" }, { label: "10", tone: "bad" }, { label: "11", tone: "bad" }, { label: "12", tone: "bad" },
              ],
              pointers: [{ at: 5, label: "mid", tone: "bad" }],
            },
          ],
          caption_mn: "6 болохгүй бол 7, 8, ... ч бас болохгүй",
          caption_en: "If 6 fails, so does 7, 8 and everything above",
        },
      },
      {
        title_mn: "mid = 3. 2 + 4 + 1 = 7 хэрчим. Хангалттай — гэхдээ илүү урт байж болох уу?",
        title_en: "mid = 3. 2 + 4 + 1 = 7 pieces. Enough — but could it be longer?",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "len",
              cells: [
                { label: "1", tone: "ghost" }, { label: "2", tone: "ghost" }, { label: "3", tone: "done" }, { label: "4" },
                { label: "5" }, { label: "6", tone: "ghost" }, { label: "7", tone: "ghost" }, { label: "8", tone: "ghost" },
                { label: "9", tone: "ghost" }, { label: "10", tone: "ghost" }, { label: "11", tone: "ghost" }, { label: "12", tone: "ghost" },
              ],
              pointers: [
                { at: 2, label: "best", tone: "done" },
                { at: 3, label: "lo" },
                { at: 4, label: "hi" },
              ],
            },
          ],
          caption_mn: "best = 3, гэхдээ баруун тийш үргэлжилнэ",
          caption_en: "best = 3, but keep pushing right",
        },
      },
      {
        title_mn: "mid = 4. 2 + 3 + 1 = 6 хэрчим. Мөн хангалттай, best = 4.",
        title_en: "mid = 4. 2 + 3 + 1 = 6 pieces. Also enough, so best = 4.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "len",
              cells: [
                { label: "1", tone: "ghost" }, { label: "2", tone: "ghost" }, { label: "3", tone: "ghost" }, { label: "4", tone: "done" },
                { label: "5" }, { label: "6", tone: "ghost" }, { label: "7", tone: "ghost" }, { label: "8", tone: "ghost" },
                { label: "9", tone: "ghost" }, { label: "10", tone: "ghost" }, { label: "11", tone: "ghost" }, { label: "12", tone: "ghost" },
              ],
              pointers: [
                { at: 3, label: "best", tone: "done" },
                { at: 4, label: "lo" },
              ],
            },
          ],
          caption_mn: "Ганцхан нэр дэвшигч үлдлээ",
          caption_en: "Only one candidate is left",
        },
      },
      {
        title_mn: "mid = 5. 1 + 2 + 1 = 4 хэрчим — яг таарлаа. best = 5.",
        title_en: "mid = 5. 1 + 2 + 1 = 4 pieces — exactly enough. best = 5.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "len",
              cells: [
                { label: "1", tone: "ghost" }, { label: "2", tone: "ghost" }, { label: "3", tone: "ghost" }, { label: "4", tone: "ghost" },
                { label: "5", tone: "done" }, { label: "6", tone: "ghost" }, { label: "7", tone: "ghost" }, { label: "8", tone: "ghost" },
                { label: "9", tone: "ghost" }, { label: "10", tone: "ghost" }, { label: "11", tone: "ghost" }, { label: "12", tone: "ghost" },
              ],
              pointers: [{ at: 4, label: "best", tone: "done" }],
            },
          ],
          caption_mn: "lo нь hi-г давсан тул давталт зогсоно",
          caption_en: "lo has passed hi, so the loop stops",
        },
      },
      {
        title_mn: "Хариу нь 5. Арван хоёр сонголтыг дөрөвхөн шалгалтаар шүүлээ.",
        title_en: "The answer is 5. Twelve candidates, settled in four checks.",
        scene: {
          kind: "bars",
          bars: [
            { label: "1..12", value: 100, sub: "12", tone: "bad" },
            { label: "lo..hi", value: 33, sub: "4", tone: "done" },
          ],
          caption_mn: "Нэг бүрчлэн шалгах ба хоёртын хайлт",
          caption_en: "Testing one by one, against binary search",
        },
      },
    ],
  },
  "prefix-sums": {
    title_mn: "p хүснэгт хэрхэн бүтэж, асуултад хариулах вэ",
    title_en: "Building p, then answering with it",
    slides: [
      {
        title_mn: "Эх массив: v = {3, 1, 4, 1, 5, 9}.",
        title_en: "The original array: v = {3, 1, 4, 1, 5, 9}.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "3", sub: "0" },
                { label: "1", sub: "1" },
                { label: "4", sub: "2" },
                { label: "1", sub: "3" },
                { label: "5", sub: "4" },
                { label: "9", sub: "5" },
              ],
            },
          ],
          caption_mn: "Зорилго: дурын мужийн нийлбэрийг шууд өгөх",
          caption_en: "The goal: any range total, instantly",
        },
      },
      {
        title_mn: "p нь нэгээр урт бөгөөд p[0] = 0-ээс эхэлнэ.",
        title_en: "p is one longer, and starts with p[0] = 0.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "3" }, { label: "1" }, { label: "4" },
                { label: "1" }, { label: "5" }, { label: "9" },
              ],
            },
            {
              name: "p",
              cells: [
                { label: "0", sub: "0", tone: "active" },
                { label: "?", sub: "1", tone: "ghost" },
                { label: "?", sub: "2", tone: "ghost" },
                { label: "?", sub: "3", tone: "ghost" },
                { label: "?", sub: "4", tone: "ghost" },
                { label: "?", sub: "5", tone: "ghost" },
                { label: "?", sub: "6", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "Тэр 0 нь «юу ч аваагүй» гэсэн үг",
          caption_en: "That 0 means \"nothing taken yet\"",
        },
      },
      {
        title_mn: "p[i+1] = p[i] + v[i]. Гурван алхмын дараа p[3] = 8 болов.",
        title_en: "p[i+1] = p[i] + v[i]. Three steps in, p[3] = 8.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "3", tone: "done" }, { label: "1", tone: "done" }, { label: "4", tone: "done" },
                { label: "1" }, { label: "5" }, { label: "9" },
              ],
            },
            {
              name: "p",
              cells: [
                { label: "0", sub: "0", tone: "done" },
                { label: "3", sub: "1", tone: "done" },
                { label: "4", sub: "2", tone: "done" },
                { label: "8", sub: "3", tone: "active" },
                { label: "?", sub: "4", tone: "ghost" },
                { label: "?", sub: "5", tone: "ghost" },
                { label: "?", sub: "6", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "4 + 4 = 8",
          caption_en: "4 + 4 = 8",
        },
      },
      {
        title_mn: "Нэг удаагийн давталтаар p бүрэн дүүрлээ.",
        title_en: "One pass, and p is complete.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "3", tone: "done" }, { label: "1", tone: "done" }, { label: "4", tone: "done" },
                { label: "1", tone: "done" }, { label: "5", tone: "done" }, { label: "9", tone: "done" },
              ],
            },
            {
              name: "p",
              cells: [
                { label: "0", sub: "0", tone: "done" },
                { label: "3", sub: "1", tone: "done" },
                { label: "4", sub: "2", tone: "done" },
                { label: "8", sub: "3", tone: "done" },
                { label: "9", sub: "4", tone: "done" },
                { label: "14", sub: "5", tone: "done" },
                { label: "23", sub: "6", tone: "done" },
              ],
            },
          ],
          caption_mn: "p[i] нь эхний i ширхэг тооны нийлбэр",
          caption_en: "p[i] is the total of the first i numbers",
        },
      },
      {
        title_mn: "v[1..3]-ын нийлбэр: p[4] - p[1] = 9 - 3 = 6. Ганц хасалт.",
        title_en: "The total of v[1..3]: p[4] - p[1] = 9 - 3 = 6. One subtraction.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "3", tone: "ghost" },
                { label: "1", tone: "active" },
                { label: "4", tone: "active" },
                { label: "1", tone: "active" },
                { label: "5", tone: "ghost" },
                { label: "9", tone: "ghost" },
              ],
            },
            {
              name: "p",
              cells: [
                { label: "0", sub: "0", tone: "ghost" },
                { label: "3", sub: "1", tone: "bad" },
                { label: "4", sub: "2", tone: "ghost" },
                { label: "8", sub: "3", tone: "ghost" },
                { label: "9", sub: "4", tone: "done" },
                { label: "14", sub: "5", tone: "ghost" },
                { label: "23", sub: "6", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "1 + 4 + 1 = 6",
          caption_en: "1 + 4 + 1 = 6",
        },
      },
      {
        title_mn: "Бүх массивын нийлбэр ч ялгаагүй: p[6] - p[0] = 23.",
        title_en: "The whole array is no different: p[6] - p[0] = 23.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "3", tone: "active" }, { label: "1", tone: "active" }, { label: "4", tone: "active" },
                { label: "1", tone: "active" }, { label: "5", tone: "active" }, { label: "9", tone: "active" },
              ],
            },
            {
              name: "p",
              cells: [
                { label: "0", sub: "0", tone: "bad" },
                { label: "3", sub: "1", tone: "ghost" },
                { label: "4", sub: "2", tone: "ghost" },
                { label: "8", sub: "3", tone: "ghost" },
                { label: "9", sub: "4", tone: "ghost" },
                { label: "14", sub: "5", tone: "ghost" },
                { label: "23", sub: "6", tone: "done" },
              ],
            },
          ],
          caption_mn: "Асуулт хэдэн ч байсан хариулт нь ижилхэн хурдан",
          caption_en: "However many questions come, each costs the same",
        },
      },
    ],
  },
  "stl-map-set": {
    title_mn: "map тоолж, set давхардлыг хаяна",
    title_en: "The map counts, the set throws duplicates away",
    slides: [
      {
        title_mn: "map хоосон эхэлнэ. Дотор нь ямар ч түлхүүр байхгүй.",
        title_en: "The map starts empty. Not a single key in it.",
        scene: {
          kind: "pairs",
          pairs: [{ key: "-", value: "-", tone: "ghost" }],
          caption_mn: "map<string, int> count;",
          caption_en: "map<string, int> count;",
        },
      },
      {
        title_mn: "count[\"cat\"]++ — түлхээр байхгүй тул 0-ээр үүсгээд 1 болгоно.",
        title_en: "count[\"cat\"]++ — the key is missing, so it is made at 0 and raised to 1.",
        scene: {
          kind: "pairs",
          pairs: [{ key: "cat", value: "1", tone: "active" }],
          caption_mn: "Байхгүй түлхүүр өөрөө үүсдэг нь map-ийн онцлог",
          caption_en: "A missing key creating itself is what a map does",
        },
      },
      {
        title_mn: "count[\"dog\"]++ — өөр түлхүүр, өөр нүд.",
        title_en: "count[\"dog\"]++ — a different key, a different slot.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "cat", value: "1" },
            { key: "dog", value: "1", tone: "active" },
          ],
          caption_mn: "Түлхүүр бүр ганц удаа л оршино",
          caption_en: "Each key exists exactly once",
        },
      },
      {
        title_mn: "count[\"cat\"]++ дахин. Шинэ нүд биш, байгаа нь 2 болно.",
        title_en: "count[\"cat\"]++ again. No new slot — the one there becomes 2.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "cat", value: "2", tone: "done" },
            { key: "dog", value: "1" },
          ],
          caption_mn: "Хэвлэв: cat=2 dog=1",
          caption_en: "Printed: cat=2 dog=1",
        },
      },
      {
        title_mn: "set нь утга хадгална, тоо биш. 5, дараа нь 2 орлоо.",
        title_en: "A set holds values, not counts. In go 5, then 2.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "seen",
              cells: [
                { label: "2", tone: "done" },
                { label: "5", tone: "done" },
              ],
            },
          ],
          caption_mn: "Оруулсан дараалал 5, 2 ч set нь эрэмбэлж хадгалдаг",
          caption_en: "They went in as 5 then 2, but a set keeps them sorted",
        },
      },
      {
        title_mn: "Дахин 5 хийхэд юу ч болохгүй. Хэмжээ 2 хэвээр.",
        title_en: "Inserting 5 again does nothing at all. The size stays 2.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "seen",
              cells: [
                { label: "2", tone: "done" },
                { label: "5", tone: "bad" },
              ],
            },
          ],
          caption_mn: "seen.size() = 2, seen.count(2) = 1",
          caption_en: "seen.size() = 2, seen.count(2) = 1",
        },
      },
    ],
  },
  "stack-queue": {
    title_mn: "Хаалт шалгах стек, ээлж барих дараалал",
    title_en: "A stack checks the brackets, a queue holds the line",
    slides: [
      {
        title_mn: "\"(()())\" мөрийг зүүнээс нь уншина. Стек хоосон.",
        title_en: "Reading \"(()())\" from the left. The stack is empty.",
        scene: {
          kind: "split",
          left: {
            kind: "rows",
            rows: [
              {
                cells: [
                  { label: "(", tone: "active" },
                  { label: "(" },
                  { label: ")" },
                  { label: "(" },
                  { label: ")" },
                  { label: ")" },
                ],
              },
            ],
            caption_mn: "Оролт",
            caption_en: "The input",
          },
          right: {
            kind: "stack",
            frames: [{ label: "", tone: "ghost" }],
            caption_mn: "Стек",
            caption_en: "Stack",
          },
        },
      },
      {
        title_mn: "Нээх хаалт бүр стек рүү орно. Хоёр орлоо.",
        title_en: "Every opening bracket goes on the stack. Two so far.",
        scene: {
          kind: "split",
          left: {
            kind: "rows",
            rows: [
              {
                cells: [
                  { label: "(", tone: "done" },
                  { label: "(", tone: "active" },
                  { label: ")" },
                  { label: "(" },
                  { label: ")" },
                  { label: ")" },
                ],
              },
            ],
            caption_mn: "Оролт",
            caption_en: "The input",
          },
          right: {
            kind: "stack",
            frames: [
              { label: "(" },
              { label: "(", tone: "active" },
            ],
            caption_mn: "Стек",
            caption_en: "Stack",
          },
        },
      },
      {
        title_mn: "Хаах хаалт ирвэл дээд талынхыг гаргана. Нэг үлдлээ.",
        title_en: "A closing bracket pops the top one off. One left.",
        scene: {
          kind: "split",
          left: {
            kind: "rows",
            rows: [
              {
                cells: [
                  { label: "(", tone: "done" },
                  { label: "(", tone: "done" },
                  { label: ")", tone: "active" },
                  { label: "(" },
                  { label: ")" },
                  { label: ")" },
                ],
              },
            ],
            caption_mn: "Оролт",
            caption_en: "The input",
          },
          right: {
            kind: "stack",
            frames: [{ label: "(", tone: "active" }],
            caption_mn: "Стек",
            caption_en: "Stack",
          },
        },
      },
      {
        title_mn: "Мөр дуусахад стек хоосон — бүх хаалт тохирсон гэсэн үг.",
        title_en: "The string ends with the stack empty — every bracket matched.",
        scene: {
          kind: "split",
          left: {
            kind: "rows",
            rows: [
              {
                cells: [
                  { label: "(", tone: "done" },
                  { label: "(", tone: "done" },
                  { label: ")", tone: "done" },
                  { label: "(", tone: "done" },
                  { label: ")", tone: "done" },
                  { label: ")", tone: "done" },
                ],
              },
            ],
            caption_mn: "Хариу: yes",
            caption_en: "Answer: yes",
          },
          right: {
            kind: "stack",
            frames: [{ label: "", tone: "ghost" }],
            caption_mn: "Стек хоосон",
            caption_en: "Stack empty",
          },
        },
      },
      {
        title_mn: "\"(()\" дээр бол нэг хаалт стект үлдэнэ. Тиймээс no.",
        title_en: "With \"(()\" one bracket is left on the stack. So the answer is no.",
        scene: {
          kind: "split",
          left: {
            kind: "rows",
            rows: [
              {
                cells: [
                  { label: "(", tone: "done" },
                  { label: "(", tone: "done" },
                  { label: ")", tone: "done" },
                ],
              },
            ],
            caption_mn: "Хариу: no",
            caption_en: "Answer: no",
          },
          right: {
            kind: "stack",
            frames: [{ label: "(", tone: "bad" }],
            caption_mn: "Хаагдаагүй хаалт",
            caption_en: "An unclosed bracket",
          },
        },
      },
      {
        title_mn: "Дараалал бол эсрэгээрээ: хэн эхэлж орсон, тэр эхэлж гарна.",
        title_en: "A queue is the other way round: first in, first out.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "line",
              cells: [
                { label: "Bat", tone: "active" },
                { label: "Suvd" },
              ],
              pointers: [{ at: 0, label: "front" }],
            },
          ],
          caption_mn: "line.front() = Bat",
          caption_en: "line.front() = Bat",
        },
      },
      {
        title_mn: "pop хийвэл Bat явж, Suvd тэргүүн болно.",
        title_en: "After pop, Bat is gone and Suvd is at the front.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "line",
              cells: [
                { label: "Bat", tone: "ghost" },
                { label: "Suvd", tone: "done" },
              ],
              pointers: [{ at: 1, label: "front", tone: "done" }],
            },
          ],
          caption_mn: "Стек дээд талаасаа, дараалал урд талаасаа",
          caption_en: "A stack takes from the top, a queue from the front",
        },
      },
    ],
  },
  "priority-queue": {
    title_mn: "Хамгийн том нь өөрөө дээшээ гарч ирдэг",
    title_en: "The biggest one rises to the top by itself",
    slides: [
      {
        title_mn: "priority_queue<int> big. 5-ыг хийлээ.",
        title_en: "priority_queue<int> big. Push 5.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "big",
              cells: [{ label: "5", tone: "active" }],
              pointers: [{ at: 0, label: "top" }],
            },
          ],
          caption_mn: "big.top() = 5",
          caption_en: "big.top() = 5",
        },
      },
      {
        title_mn: "1-ийг хийлээ. 1 нь 5-аас бага тул дээр гарахгүй.",
        title_en: "Push 1. It is smaller than 5, so it does not come to the top.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "big",
              cells: [
                { label: "5", tone: "active" },
                { label: "1" },
              ],
              pointers: [{ at: 0, label: "top" }],
            },
          ],
          caption_mn: "big.top() = 5",
          caption_en: "big.top() = 5",
        },
      },
      {
        title_mn: "9-ийг хийлээ. Энэ бол хамгийн том тул шууд дээр гарна.",
        title_en: "Push 9. It is the biggest, so it goes straight to the top.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "big",
              cells: [
                { label: "9", tone: "done" },
                { label: "5" },
                { label: "1" },
              ],
              pointers: [{ at: 0, label: "top", tone: "done" }],
            },
          ],
          caption_mn: "Хэвлэв: 9",
          caption_en: "Printed: 9",
        },
      },
      {
        title_mn: "pop нь дээд талынхыг л авна. Дараа нь 5 дээр гарч ирнэ.",
        title_en: "pop only ever removes the top. Now 5 rises to take its place.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "big",
              cells: [
                { label: "9", tone: "bad" },
                { label: "5", tone: "done" },
                { label: "1" },
              ],
              pointers: [{ at: 1, label: "top", tone: "done" }],
            },
          ],
          caption_mn: "Хэвлэв: 5",
          caption_en: "Printed: 5",
        },
      },
      {
        title_mn: "greater<int> нэмбэл дараалал эсрэгээрээ ажиллана.",
        title_en: "Add greater<int> and the queue works the other way round.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "big",
              cells: [
                { label: "9", tone: "active" },
                { label: "5" },
                { label: "1" },
              ],
              pointers: [{ at: 0, label: "top" }],
            },
            {
              name: "small",
              cells: [
                { label: "1", tone: "done" },
                { label: "5" },
                { label: "9" },
              ],
              pointers: [{ at: 0, label: "top", tone: "done" }],
            },
          ],
          caption_mn: "Ижил гурван тоо, өөр хоёр дараалал",
          caption_en: "The same three numbers, two different queues",
        },
      },
      {
        title_mn: "Аль ч тохиолдолд дундах утгууд эрэмбэлэгдээгүй — зөвхөн дээд нь баталгаатай.",
        title_en: "Either way the middle is not sorted — only the top is guaranteed.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "small",
              cells: [
                { label: "1", tone: "done" },
                { label: "9", tone: "ghost" },
                { label: "5", tone: "ghost" },
              ],
              pointers: [{ at: 0, label: "top", tone: "done" }],
            },
          ],
          caption_mn: "Дундыг нь харах ч, гүйлгэх ч аргагүй",
          caption_en: "There is no way to look at, or walk, the middle",
        },
      },
    ],
  },
  "two-pointers": {
    title_mn: "Нийлбэр нь 10 болох хосыг олох нь",
    title_en: "Finding the pair that adds to 10",
    slides: [
      {
        title_mn: "Эрэмбэлэгдсэн массив. lo зүүн захад, hi баруун захад.",
        title_en: "A sorted array. lo starts at the left end, hi at the right.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "1", tone: "active" },
                { label: "3" },
                { label: "4" },
                { label: "7" },
                { label: "11", tone: "active" },
              ],
              pointers: [
                { at: 0, label: "lo" },
                { at: 4, label: "hi" },
              ],
            },
          ],
          caption_mn: "Зорилт: 10",
          caption_en: "Target: 10",
        },
      },
      {
        title_mn: "1 + 11 = 12. Хэтэрхий их, тиймээс баруун заагчийг зөөнө.",
        title_en: "1 + 11 = 12. Too big, so the right pointer moves in.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "1", tone: "active" },
                { label: "3" },
                { label: "4" },
                { label: "7" },
                { label: "11", tone: "bad" },
              ],
              pointers: [
                { at: 0, label: "lo" },
                { at: 4, label: "hi", tone: "bad" },
              ],
            },
          ],
          caption_mn: "12 > 10",
          caption_en: "12 > 10",
        },
      },
      {
        title_mn: "1 + 7 = 8. Одоо бага байна, зүүн заагчийг зөөнө.",
        title_en: "1 + 7 = 8. Now it is too small, so the left pointer moves in.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "1", tone: "bad" },
                { label: "3" },
                { label: "4" },
                { label: "7", tone: "active" },
                { label: "11", tone: "ghost" },
              ],
              pointers: [
                { at: 0, label: "lo", tone: "bad" },
                { at: 3, label: "hi" },
              ],
            },
          ],
          caption_mn: "8 < 10",
          caption_en: "8 < 10",
        },
      },
      {
        title_mn: "3 + 7 = 10 — яг таарлаа. Хос олдлоо.",
        title_en: "3 + 7 = 10 — exactly right. The pair is found.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "1", tone: "ghost" },
                { label: "3", tone: "done" },
                { label: "4" },
                { label: "7", tone: "done" },
                { label: "11", tone: "ghost" },
              ],
              pointers: [
                { at: 1, label: "lo", tone: "done" },
                { at: 3, label: "hi", tone: "done" },
              ],
            },
          ],
          caption_mn: "Хэвлэв: 3 7",
          caption_en: "Printed: 3 7",
        },
      },
      {
        title_mn: "Заагч бүр массивыг нэг л удаа гатлав — гуравхан алхам.",
        title_en: "Each pointer crossed the array once — three steps in all.",
        scene: {
          kind: "bars",
          bars: [
            { label: "O(n^2)", value: 100, sub: "10", tone: "bad" },
            { label: "O(n)", value: 30, sub: "3", tone: "done" },
          ],
          caption_mn: "Бүх хосыг шалгах ба хоёр заагч",
          caption_en: "Testing every pair, against two pointers",
        },
      },
      {
        title_mn: "Заагчид уулзвал зогсоно. Хос байхгүй бол none гэж хэвлэнэ.",
        title_en: "It stops when the pointers meet. If no pair exists, it prints none.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "v",
              cells: [
                { label: "1", tone: "ghost" },
                { label: "3", tone: "ghost" },
                { label: "4", tone: "active" },
                { label: "7", tone: "ghost" },
                { label: "11", tone: "ghost" },
              ],
              pointers: [{ at: 2, label: "lo hi" }],
            },
          ],
          caption_mn: "lo < hi нөхцөл хангагдахаа болино",
          caption_en: "The lo < hi condition stops holding",
        },
      },
    ],
  },
  greedy: {
    title_mn: "680 төгрөгийг задлах нь, дараа нь шуналт арга бүдрэх нь",
    title_en: "Making 680, and then watching greedy fail",
    slides: [
      {
        title_mn: "680 төгрөг задлана. Дэвсгэртүүд томоос нь жижиг рүү эрэмбэлэгдсэн.",
        title_en: "We have to make 680. The coins are listed largest first.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "mnt",
              cells: [
                { label: "500" },
                { label: "100" },
                { label: "50" },
                { label: "10" },
              ],
            },
            { name: "left", cells: [{ label: "680", tone: "active" }] },
            { name: "used", cells: [{ label: "0" }] },
          ],
          caption_mn: "Дүрэм: багтаж байвал хамгийн томыг ав",
          caption_en: "The rule: take the biggest that still fits",
        },
      },
      {
        title_mn: "500 багтана. Нэг ширхэг авахад 180 үлдэнэ.",
        title_en: "500 fits. Take one and 180 is left.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "mnt",
              cells: [
                { label: "500", tone: "active" },
                { label: "100" },
                { label: "50" },
                { label: "10" },
              ],
            },
            { name: "left", cells: [{ label: "180", tone: "active" }] },
            { name: "used", cells: [{ label: "1" }] },
          ],
          caption_mn: "500 дахин багтахгүй тул цааш шилжинэ",
          caption_en: "A second 500 will not fit, so move on",
        },
      },
      {
        title_mn: "100 багтана. Нэг ширхэг, 80 үлдлээ.",
        title_en: "100 fits. One of those, and 80 is left.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "mnt",
              cells: [
                { label: "500", tone: "done" },
                { label: "100", tone: "active" },
                { label: "50" },
                { label: "10" },
              ],
            },
            { name: "left", cells: [{ label: "80", tone: "active" }] },
            { name: "used", cells: [{ label: "2" }] },
          ],
          caption_mn: "Хоёр дахь 100 бол 80-аас их",
          caption_en: "A second 100 is more than the 80 left",
        },
      },
      {
        title_mn: "50 багтана. 30 үлдлээ.",
        title_en: "50 fits. That leaves 30.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "mnt",
              cells: [
                { label: "500", tone: "done" },
                { label: "100", tone: "done" },
                { label: "50", tone: "active" },
                { label: "10" },
              ],
            },
            { name: "left", cells: [{ label: "30", tone: "active" }] },
            { name: "used", cells: [{ label: "3" }] },
          ],
          caption_mn: "Ганц 50 л багтана",
          caption_en: "Only one 50 fits",
        },
      },
      {
        title_mn: "10 гурван удаа орж, үлдэгдэл 0. Нийт 6 зоос.",
        title_en: "Three 10s clear the rest. Six coins in total.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "mnt",
              cells: [
                { label: "500", tone: "done" },
                { label: "100", tone: "done" },
                { label: "50", tone: "done" },
                { label: "10", tone: "done" },
              ],
            },
            { name: "left", cells: [{ label: "0", tone: "done" }] },
            { name: "used", cells: [{ label: "6", tone: "done" }] },
          ],
          caption_mn: "Монгол дэвсгэрт дээр энэ арга үргэлж зөв",
          caption_en: "On Mongolian coins this rule is always right",
        },
      },
      {
        title_mn: "Одоо хачин дэвсгэрт: 4, 3, 1. Задлах дүн 6.",
        title_en: "Now some odd coins: 4, 3 and 1. The amount is 6.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "odd",
              cells: [{ label: "4" }, { label: "3" }, { label: "1" }],
            },
            { name: "left", cells: [{ label: "6", tone: "active" }] },
            { name: "used", cells: [{ label: "0" }] },
          ],
          caption_mn: "Ижил дүрэм, өөр дэвсгэрт",
          caption_en: "The same rule, different coins",
        },
      },
      {
        title_mn: "Шуналт арга 4-ийг авна. Дараа нь 3 багтахгүй тул 1, 1. Гурван зоос.",
        title_en: "Greedy grabs the 4. Then 3 will not fit, so 1 and 1. Three coins.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "odd",
              cells: [
                { label: "4", tone: "bad" },
                { label: "3", tone: "ghost" },
                { label: "1", tone: "bad" },
              ],
            },
            { name: "left", cells: [{ label: "0", tone: "bad" }] },
            { name: "used", cells: [{ label: "3", tone: "bad" }] },
          ],
          caption_mn: "4 + 1 + 1 = 6",
          caption_en: "4 + 1 + 1 = 6",
        },
      },
      {
        title_mn: "Гэтэл 3 + 3 бол хоёрхон зоос. Шуналт арга үүнийг олж чадсангүй.",
        title_en: "But 3 + 3 is only two coins. Greedy never even looked at it.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "odd",
              cells: [
                { label: "4", tone: "ghost" },
                { label: "3", tone: "done" },
                { label: "1", tone: "ghost" },
              ],
            },
            { name: "left", cells: [{ label: "0", tone: "done" }] },
            { name: "used", cells: [{ label: "2", tone: "done" }] },
          ],
          caption_mn: "Эхний алхамдаа хамгийн томыг авсан нь буруудсан",
          caption_en: "Taking the biggest first is what went wrong",
        },
      },
    ],
  },
  backtracking: {
    title_mn: "1, 2, 3-ын бүх сэлгэмэл хэрхэн гарах вэ",
    title_en: "How every arrangement of 1, 2, 3 comes out",
    slides: [
      {
        title_mn: "Хоосон жагсаалтаас эхэлнэ. Гурван сонголт нээлттэй.",
        title_en: "It starts with an empty list. Three choices are open.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "r", x: 50, y: 10, label: "-", tone: "active" },
            { id: "n1", x: 18, y: 40, label: "1", tone: "ghost" },
            { id: "n2", x: 50, y: 40, label: "2", tone: "ghost" },
            { id: "n3", x: 82, y: 40, label: "3", tone: "ghost" },
            { id: "n12", x: 8, y: 72, label: "12", tone: "ghost" },
            { id: "n13", x: 30, y: 72, label: "13", tone: "ghost" },
            { id: "n123", x: 8, y: 96, label: "123", tone: "ghost" },
            { id: "n132", x: 30, y: 96, label: "132", tone: "ghost" },
          ],
          edges: [
            { a: "r", b: "n1", directed: true },
            { a: "r", b: "n2", directed: true },
            { a: "r", b: "n3", directed: true },
            { a: "n1", b: "n12", directed: true },
            { a: "n1", b: "n13", directed: true },
            { a: "n12", b: "n123", directed: true },
            { a: "n13", b: "n132", directed: true },
          ],
          caption_mn: "Мөчир бүр нэг сонголт",
          caption_en: "Each branch is one choice",
        },
      },
      {
        title_mn: "Эхний сонголт: 1. used[0] = true болж, гүн рүү орно.",
        title_en: "First choice: 1. used[0] becomes true and it goes deeper.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "r", x: 50, y: 10, label: "-", tone: "done" },
            { id: "n1", x: 18, y: 40, label: "1", tone: "active" },
            { id: "n2", x: 50, y: 40, label: "2", tone: "ghost" },
            { id: "n3", x: 82, y: 40, label: "3", tone: "ghost" },
            { id: "n12", x: 8, y: 72, label: "12", tone: "ghost" },
            { id: "n13", x: 30, y: 72, label: "13", tone: "ghost" },
            { id: "n123", x: 8, y: 96, label: "123", tone: "ghost" },
            { id: "n132", x: 30, y: 96, label: "132", tone: "ghost" },
          ],
          edges: [
            { a: "r", b: "n1", tone: "active", directed: true },
            { a: "r", b: "n2", directed: true },
            { a: "r", b: "n3", directed: true },
            { a: "n1", b: "n12", directed: true },
            { a: "n1", b: "n13", directed: true },
            { a: "n12", b: "n123", directed: true },
            { a: "n13", b: "n132", directed: true },
          ],
          caption_mn: "cur = [1]",
          caption_en: "cur = [1]",
        },
      },
      {
        title_mn: "1 аль хэдийн хэрэглэгдсэн тул алгасана. Дараагийнх нь 2.",
        title_en: "1 is already used, so it is skipped. The next one is 2.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "r", x: 50, y: 10, label: "-", tone: "done" },
            { id: "n1", x: 18, y: 40, label: "1", tone: "done" },
            { id: "n2", x: 50, y: 40, label: "2", tone: "ghost" },
            { id: "n3", x: 82, y: 40, label: "3", tone: "ghost" },
            { id: "n12", x: 8, y: 72, label: "12", tone: "active" },
            { id: "n13", x: 30, y: 72, label: "13", tone: "ghost" },
            { id: "n123", x: 8, y: 96, label: "123", tone: "ghost" },
            { id: "n132", x: 30, y: 96, label: "132", tone: "ghost" },
          ],
          edges: [
            { a: "r", b: "n1", tone: "done", directed: true },
            { a: "r", b: "n2", directed: true },
            { a: "r", b: "n3", directed: true },
            { a: "n1", b: "n12", tone: "active", directed: true },
            { a: "n1", b: "n13", directed: true },
            { a: "n12", b: "n123", directed: true },
            { a: "n13", b: "n132", directed: true },
          ],
          caption_mn: "cur = [1, 2]",
          caption_en: "cur = [1, 2]",
        },
      },
      {
        title_mn: "3 нэмэгдэхэд урт нь гурав болж, 123 хэвлэгдэнэ.",
        title_en: "Adding 3 makes the length three, so 123 is printed.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "r", x: 50, y: 10, label: "-", tone: "done" },
            { id: "n1", x: 18, y: 40, label: "1", tone: "done" },
            { id: "n2", x: 50, y: 40, label: "2", tone: "ghost" },
            { id: "n3", x: 82, y: 40, label: "3", tone: "ghost" },
            { id: "n12", x: 8, y: 72, label: "12", tone: "done" },
            { id: "n13", x: 30, y: 72, label: "13", tone: "ghost" },
            { id: "n123", x: 8, y: 96, label: "123", tone: "done" },
            { id: "n132", x: 30, y: 96, label: "132", tone: "ghost" },
          ],
          edges: [
            { a: "r", b: "n1", tone: "done", directed: true },
            { a: "r", b: "n2", directed: true },
            { a: "r", b: "n3", directed: true },
            { a: "n1", b: "n12", tone: "done", directed: true },
            { a: "n1", b: "n13", directed: true },
            { a: "n12", b: "n123", tone: "done", directed: true },
            { a: "n13", b: "n132", directed: true },
          ],
          caption_mn: "Хэвлэв: 123",
          caption_en: "Printed: 123",
        },
      },
      {
        title_mn: "Одоо ухран буцна: 3-ыг, дараа нь 2-ыг буцааж авна.",
        title_en: "Now it backs up: it takes the 3 back, then the 2.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "r", x: 50, y: 10, label: "-", tone: "done" },
            { id: "n1", x: 18, y: 40, label: "1", tone: "active" },
            { id: "n2", x: 50, y: 40, label: "2", tone: "ghost" },
            { id: "n3", x: 82, y: 40, label: "3", tone: "ghost" },
            { id: "n12", x: 8, y: 72, label: "12", tone: "bad" },
            { id: "n13", x: 30, y: 72, label: "13", tone: "ghost" },
            { id: "n123", x: 8, y: 96, label: "123", tone: "done" },
            { id: "n132", x: 30, y: 96, label: "132", tone: "ghost" },
          ],
          edges: [
            { a: "r", b: "n1", tone: "active", directed: true },
            { a: "r", b: "n2", directed: true },
            { a: "r", b: "n3", directed: true },
            { a: "n1", b: "n12", tone: "bad", directed: true },
            { a: "n1", b: "n13", directed: true },
            { a: "n12", b: "n123", directed: true },
            { a: "n13", b: "n132", directed: true },
          ],
          caption_mn: "cur = [1] рүү буцлаа — энэ бол undo алхам",
          caption_en: "Back to cur = [1] — this is the undo step",
        },
      },
      {
        title_mn: "1-ийн дараа 3-ыг сонгоод 2-ыг нэмбэл 132 гарна.",
        title_en: "After the 1 it picks 3, then adds 2, and out comes 132.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "r", x: 50, y: 10, label: "-", tone: "done" },
            { id: "n1", x: 18, y: 40, label: "1", tone: "done" },
            { id: "n2", x: 50, y: 40, label: "2", tone: "ghost" },
            { id: "n3", x: 82, y: 40, label: "3", tone: "ghost" },
            { id: "n12", x: 8, y: 72, label: "12", tone: "done" },
            { id: "n13", x: 30, y: 72, label: "13", tone: "done" },
            { id: "n123", x: 8, y: 96, label: "123", tone: "done" },
            { id: "n132", x: 30, y: 96, label: "132", tone: "done" },
          ],
          edges: [
            { a: "r", b: "n1", tone: "done", directed: true },
            { a: "r", b: "n2", directed: true },
            { a: "r", b: "n3", directed: true },
            { a: "n1", b: "n12", tone: "done", directed: true },
            { a: "n1", b: "n13", tone: "done", directed: true },
            { a: "n12", b: "n123", tone: "done", directed: true },
            { a: "n13", b: "n132", tone: "done", directed: true },
          ],
          caption_mn: "1-ээр эхэлсэн мөчир дуусав",
          caption_en: "The branch starting with 1 is finished",
        },
      },
      {
        title_mn: "2 ба 3-аар эхэлсэн мөчрүүд ч мөн адил. Нийт зургаан хариу.",
        title_en: "The branches starting with 2 and 3 go the same way. Six answers in all.",
        scene: {
          kind: "rows",
          rows: [
            {
              cells: [
                { label: "123", tone: "done" },
                { label: "132", tone: "done" },
                { label: "213", tone: "active" },
                { label: "231", tone: "active" },
                { label: "312", tone: "active" },
                { label: "321", tone: "active" },
              ],
            },
          ],
          caption_mn: "3 × 2 × 1 = 6",
          caption_en: "3 × 2 × 1 = 6",
        },
      },
    ],
  },
  "dp-intro": {
    title_mn: "Ижил ажлыг хоёр удаа хийхээс хэрхэн зайлсхийх вэ",
    title_en: "How to stop doing the same work twice",
    slides: [
      {
        title_mn: "fib(5) нь fib(4) ба fib(3)-ыг дуудна. Тэд нь дахин хуваагдана.",
        title_en: "fib(5) calls fib(4) and fib(3). Those split again in turn.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "f5", x: 50, y: 6, label: "f(5)", tone: "active" },
            { id: "f4", x: 28, y: 46, label: "f(4)" },
            { id: "f3a", x: 72, y: 46, label: "f(3)" },
            { id: "f3b", x: 10, y: 88, label: "f(3)" },
            { id: "f2a", x: 44, y: 88, label: "f(2)" },
            { id: "f2b", x: 78, y: 88, label: "f(2)" },
          ],
          edges: [
            { a: "f5", b: "f4", directed: true },
            { a: "f5", b: "f3a", directed: true },
            { a: "f4", b: "f3b", directed: true },
            { a: "f4", b: "f2a", directed: true },
            { a: "f3a", b: "f2b", directed: true },
          ],
          caption_mn: "Дуудлагын мод",
          caption_en: "The call tree",
        },
      },
      {
        title_mn: "Гэхдээ f(3) хоёр өөр газар гарч ирж байна. Ижил ажил хоёр удаа.",
        title_en: "But f(3) turns up in two different places. The same work, twice.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "f5", x: 50, y: 6, label: "f(5)" },
            { id: "f4", x: 28, y: 46, label: "f(4)" },
            { id: "f3a", x: 72, y: 46, label: "f(3)", tone: "bad" },
            { id: "f3b", x: 10, y: 88, label: "f(3)", tone: "bad" },
            { id: "f2a", x: 44, y: 88, label: "f(2)" },
            { id: "f2b", x: 78, y: 88, label: "f(2)" },
          ],
          edges: [
            { a: "f5", b: "f4", directed: true },
            { a: "f5", b: "f3a", tone: "bad", directed: true },
            { a: "f4", b: "f3b", tone: "bad", directed: true },
            { a: "f4", b: "f2a", directed: true },
            { a: "f3a", b: "f2b", directed: true },
          ],
          caption_mn: "n томрох тусам энэ давхардал тэсрэлт болно",
          caption_en: "As n grows this duplication explodes",
        },
      },
      {
        title_mn: "memo нэмбэл эхнийх нь бодогдож, хоёр дахь нь зүгээр л уншина.",
        title_en: "With a memo the first one is worked out and the second is just read back.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "f5", x: 50, y: 6, label: "f(5)" },
            { id: "f4", x: 28, y: 46, label: "f(4)" },
            { id: "f3a", x: 72, y: 46, label: "f(3)", tone: "done" },
            { id: "f3b", x: 10, y: 88, label: "f(3)", tone: "ghost" },
            { id: "f2a", x: 44, y: 88, label: "f(2)" },
            { id: "f2b", x: 78, y: 88, label: "f(2)", tone: "ghost" },
          ],
          edges: [
            { a: "f5", b: "f4", directed: true },
            { a: "f5", b: "f3a", tone: "done", directed: true },
            { a: "f4", b: "f3b", tone: "ghost", directed: true },
            { a: "f4", b: "f2a", directed: true },
            { a: "f3a", b: "f2b", tone: "ghost", directed: true },
          ],
          caption_mn: "Тасархай мөчир огт бодогдохгүй",
          caption_en: "The dashed branch is never worked out at all",
        },
      },
      {
        title_mn: "memo бол зүгээр л массив. Эхлээд бүгд -1, өөрөөр хэлбэл «мэдэхгүй».",
        title_en: "The memo is just an array. Everything starts at -1, meaning \"not known\".",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "memo",
              cells: [
                { label: "-1", sub: "0", tone: "ghost" },
                { label: "-1", sub: "1", tone: "ghost" },
                { label: "-1", sub: "2", tone: "ghost" },
                { label: "-1", sub: "3", tone: "ghost" },
                { label: "-1", sub: "4", tone: "ghost" },
                { label: "-1", sub: "5", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "memo.assign(31, -1)",
          caption_en: "memo.assign(31, -1)",
        },
      },
      {
        title_mn: "Бодсон утга бүр тэмдэглэгдэнэ. Дараагийн дуудлага шууд хариу авна.",
        title_en: "Each value worked out is written down. The next call gets it instantly.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "memo",
              cells: [
                { label: "0", sub: "0", tone: "done" },
                { label: "1", sub: "1", tone: "done" },
                { label: "1", sub: "2", tone: "done" },
                { label: "2", sub: "3", tone: "done" },
                { label: "3", sub: "4", tone: "done" },
                { label: "5", sub: "5", tone: "active" },
              ],
            },
          ],
          caption_mn: "n бүр яг нэг л удаа бодогдоно",
          caption_en: "Each n is worked out exactly once",
        },
      },
      {
        title_mn: "fib(30) дээр ялгаа нь ийм: хоёр сая гаруй дуудлага, эсвэл 59.",
        title_en: "At fib(30) that is the difference: over two million calls, or 59.",
        scene: {
          kind: "bars",
          bars: [
            { label: "-memo", value: 100, sub: "2 692 537", tone: "bad" },
            { label: "+memo", value: 1, sub: "59", tone: "done" },
          ],
          caption_mn: "fib(30) бодоход хийсэн дуудлагын тоо",
          caption_en: "Calls made to work out fib(30)",
        },
      },
    ],
  },
  "dp-1d": {
    title_mn: "6 шатыг гарах замууд хэрхэн тоологдох вэ",
    title_en: "Counting the ways up six steps",
    slides: [
      {
        title_mn: "Хоёр суурь утга: 0 шатанд 1 арга, 1 шатанд 1 арга.",
        title_en: "Two starting values: one way to stand still, one way to climb one step.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "ways",
              cells: [
                { label: "1", sub: "0", tone: "done" },
                { label: "1", sub: "1", tone: "done" },
                { label: "?", sub: "2", tone: "ghost" },
                { label: "?", sub: "3", tone: "ghost" },
                { label: "?", sub: "4", tone: "ghost" },
                { label: "?", sub: "5", tone: "ghost" },
                { label: "?", sub: "6", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "Эдгээрийг бодох шаардлагагүй — шууд мэднэ",
          caption_en: "These are not worked out — you just know them",
        },
      },
      {
        title_mn: "Эндээс дүрэм эхэлнэ: ways[2] = ways[1] + ways[0] = 2.",
        title_en: "ways[2] = ways[1] + ways[0] = 1 + 1 = 2.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "ways",
              cells: [
                { label: "1", sub: "0", tone: "active" },
                { label: "1", sub: "1", tone: "active" },
                { label: "2", sub: "2", tone: "done" },
                { label: "?", sub: "3", tone: "ghost" },
                { label: "?", sub: "4", tone: "ghost" },
                { label: "?", sub: "5", tone: "ghost" },
                { label: "?", sub: "6", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "2 шатанд ирэхийн тулд 1-ээс эсвэл 0-ээс ирнэ",
          caption_en: "To reach step 2 you came from step 1 or step 0",
        },
      },
      {
        title_mn: "ways[3] = 2 + 1 = 3. Дүрэм өөрчлөгдөхгүй.",
        title_en: "ways[3] = 2 + 1 = 3. The rule never changes.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "ways",
              cells: [
                { label: "1", sub: "0" },
                { label: "1", sub: "1", tone: "active" },
                { label: "2", sub: "2", tone: "active" },
                { label: "3", sub: "3", tone: "done" },
                { label: "?", sub: "4", tone: "ghost" },
                { label: "?", sub: "5", tone: "ghost" },
                { label: "?", sub: "6", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "Үргэлж өмнөх хоёр нүд",
          caption_en: "Always the two cells before it",
        },
      },
      {
        title_mn: "Дараагийнх: ways[4] = 3 + 2 = 5.",
        title_en: "That gives ways[4] = 3 + 2 = 5.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "ways",
              cells: [
                { label: "1", sub: "0" },
                { label: "1", sub: "1" },
                { label: "2", sub: "2", tone: "active" },
                { label: "3", sub: "3", tone: "active" },
                { label: "5", sub: "4", tone: "done" },
                { label: "?", sub: "5", tone: "ghost" },
                { label: "?", sub: "6", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "Нүд бүр нэг удаа л бодогдоно",
          caption_en: "Each cell is worked out once and once only",
        },
      },
      {
        title_mn: "Мөн адилаар ways[5] = 5 + 3 = 8.",
        title_en: "And ways[5] = 5 + 3 = 8.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "ways",
              cells: [
                { label: "1", sub: "0" },
                { label: "1", sub: "1" },
                { label: "2", sub: "2" },
                { label: "3", sub: "3", tone: "active" },
                { label: "5", sub: "4", tone: "active" },
                { label: "8", sub: "5", tone: "done" },
                { label: "?", sub: "6", tone: "ghost" },
              ],
            },
          ],
          caption_mn: "Зүүнээс баруун тийш нэг чигт",
          caption_en: "Left to right, one direction only",
        },
      },
      {
        title_mn: "ways[6] = 8 + 5 = 13. Энэ бол хайсан хариу.",
        title_en: "ways[6] = 8 + 5 = 13. That is the answer we wanted.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "ways",
              cells: [
                { label: "1", sub: "0", tone: "done" },
                { label: "1", sub: "1", tone: "done" },
                { label: "2", sub: "2", tone: "done" },
                { label: "3", sub: "3", tone: "done" },
                { label: "5", sub: "4", tone: "active" },
                { label: "8", sub: "5", tone: "active" },
                { label: "13", sub: "6", tone: "done" },
              ],
            },
          ],
          caption_mn: "Хэвлэв: 13",
          caption_en: "Printed: 13",
        },
      },
    ],
  },
  "dp-grid": {
    title_mn: "Зөвхөн баруун, доош явж хэдэн зам байх вэ",
    title_en: "Counting routes when you can only go right or down",
    slides: [
      {
        title_mn: "3 × 4 хүснэгт. Зүүн дээд булангаас баруун доод булан руу.",
        title_en: "A 3 by 4 grid. Top-left corner to bottom-right corner.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "Эхлэх нүдэнд ирэх ганцхан арга бий: хөдлөхгүй байх",
          caption_en: "There is one way to be at the start: do not move",
        },
      },
      {
        title_mn: "Эхний мөрөнд дээрээс ирэх зам байхгүй. Бүгд 1.",
        title_en: "In the top row nothing can come from above. They are all 1.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "1", tone: "active" }, { label: "1", tone: "active" }, { label: "1", tone: "active" },
            { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "Шулуун баруун тийш явахаас өөр аргагүй",
          caption_en: "Straight along, and no other option",
        },
      },
      {
        title_mn: "Эхний баганад ч мөн адил: зүүнээс ирэх зам байхгүй.",
        title_en: "The first column is the same: nothing can come from the left.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "1", tone: "done" }, { label: "1", tone: "done" }, { label: "1", tone: "done" },
            { label: "1", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "1", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "Шулуун доош",
          caption_en: "Straight down",
        },
      },
      {
        title_mn: "Дундах нүд бүр дээрээсээ ба зүүнээсээ ирсэн замуудын нийлбэр.",
        title_en: "Every inside cell is what came from above plus what came from the left.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "1", tone: "active" }, { label: "1", tone: "done" }, { label: "1", tone: "done" },
            { label: "1", tone: "active" }, { label: "2", tone: "done" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "1", tone: "done" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "1 + 1 = 2",
          caption_en: "1 + 1 = 2",
        },
      },
      {
        title_mn: "Мөр 1 дүүрэв: 1, 2, 3, 4.",
        title_en: "Row 1 is full: 1, 2, 3, 4.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "1", tone: "done" }, { label: "1", tone: "done" }, { label: "1", tone: "done" },
            { label: "1", tone: "done" }, { label: "2", tone: "done" }, { label: "3", tone: "active" }, { label: "4", tone: "active" },
            { label: "1", tone: "done" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "2 + 1 = 3, дараа нь 3 + 1 = 4",
          caption_en: "2 + 1 = 3, then 3 + 1 = 4",
        },
      },
      {
        title_mn: "Сүүлийн мөр: 1, 3, 6, 10. Хариу нь 10 зам.",
        title_en: "The last row: 1, 3, 6, 10. The answer is 10 routes.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "1", tone: "done" }, { label: "1", tone: "done" }, { label: "1", tone: "done" }, { label: "1", tone: "done" },
            { label: "1", tone: "done" }, { label: "2", tone: "done" }, { label: "3", tone: "done" }, { label: "4", tone: "done" },
            { label: "1", tone: "done" }, { label: "3", tone: "done" }, { label: "6", tone: "done" }, { label: "10", tone: "active" },
          ],
          caption_mn: "Нэг ч замыг зурж үзэлгүйгээр тоолов",
          caption_en: "Counted without drawing a single route",
        },
      },
    ],
  },
  "graphs-intro": {
    title_mn: "Тав хот, гурван зам, нэг тусгаарлагдсан цэг",
    title_en: "Five places, three roads, one left on its own",
    slides: [
      {
        title_mn: "Тав цэг байна. Одоохондоо ямар ч холбоос алга.",
        title_en: "There are five nodes. So far nothing joins any of them.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "a", x: 25, y: 15, label: "0" },
            { id: "b", x: 62, y: 15, label: "1" },
            { id: "c", x: 25, y: 82, label: "2" },
            { id: "d", x: 62, y: 82, label: "3" },
            { id: "e", x: 92, y: 48, label: "4" },
          ],
          edges: [],
          caption_mn: "vector<vector<int>> adj(5)",
          caption_en: "vector<vector<int>> adj(5)",
        },
      },
      {
        title_mn: "0 ба 1-ийг холбоно. Чиглэлгүй тул ХОЁУЛАНД нь бичих ёстой.",
        title_en: "Join 0 and 1. It is undirected, so it has to be written on BOTH sides.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "a", x: 25, y: 15, label: "0", tone: "active" },
            { id: "b", x: 62, y: 15, label: "1", tone: "active" },
            { id: "c", x: 25, y: 82, label: "2" },
            { id: "d", x: 62, y: 82, label: "3" },
            { id: "e", x: 92, y: 48, label: "4" },
          ],
          edges: [{ a: "a", b: "b", tone: "active" }],
          caption_mn: "adj[0].push_back(1); adj[1].push_back(0);",
          caption_en: "adj[0].push_back(1); adj[1].push_back(0);",
        },
      },
      {
        title_mn: "0 ба 2 хоёр дахь холбоос. Одоо 0 хоёр хөрштэй боллоо.",
        title_en: "0 and 2 make a second edge. Now 0 has two neighbours.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "a", x: 25, y: 15, label: "0", tone: "active" },
            { id: "b", x: 62, y: 15, label: "1", tone: "done" },
            { id: "c", x: 25, y: 82, label: "2", tone: "active" },
            { id: "d", x: 62, y: 82, label: "3" },
            { id: "e", x: 92, y: 48, label: "4" },
          ],
          edges: [
            { a: "a", b: "b", tone: "done" },
            { a: "a", b: "c", tone: "active" },
          ],
          caption_mn: "Нэг цэг хэдэн ч хөрштэй байж болно",
          caption_en: "A node may have as many neighbours as it likes",
        },
      },
      {
        title_mn: "1 ба 3-ыг холбоно. Гурван холбоос болов.",
        title_en: "Join 1 and 3. That makes three edges.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "a", x: 25, y: 15, label: "0", tone: "done" },
            { id: "b", x: 62, y: 15, label: "1", tone: "active" },
            { id: "c", x: 25, y: 82, label: "2", tone: "done" },
            { id: "d", x: 62, y: 82, label: "3", tone: "active" },
            { id: "e", x: 92, y: 48, label: "4" },
          ],
          edges: [
            { a: "a", b: "b", tone: "done" },
            { a: "a", b: "c", tone: "done" },
            { a: "b", b: "d", tone: "active" },
          ],
          caption_mn: "adj[1].push_back(3); adj[3].push_back(1);",
          caption_en: "adj[1].push_back(3); adj[3].push_back(1);",
        },
      },
      {
        title_mn: "Санах ойд граф ийм харагдана: цэг бүрийн хөршүүдийн жагсаалт.",
        title_en: "In memory the graph looks like this: a list of neighbours per node.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "0", value: "1 2", tone: "done" },
            { key: "1", value: "0 3", tone: "done" },
            { key: "2", value: "0", tone: "done" },
            { key: "3", value: "1", tone: "done" },
            { key: "4", value: "-", tone: "ghost" },
          ],
          caption_mn: "Зэргэлдээх жагсаалт",
          caption_en: "The adjacency list",
        },
      },
      {
        title_mn: "4 цэг ганцаараа үлдэв. Граф заавал холбоотой байх албагүй.",
        title_en: "Node 4 is left alone. A graph does not have to be connected.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "a", x: 25, y: 15, label: "0", tone: "done" },
            { id: "b", x: 62, y: 15, label: "1", tone: "done" },
            { id: "c", x: 25, y: 82, label: "2", tone: "done" },
            { id: "d", x: 62, y: 82, label: "3", tone: "done" },
            { id: "e", x: 92, y: 48, label: "4", tone: "bad" },
          ],
          edges: [
            { a: "a", b: "b", tone: "done" },
            { a: "a", b: "c", tone: "done" },
            { a: "b", b: "d", tone: "done" },
          ],
          caption_mn: "adj[4] хоосон хэвээр",
          caption_en: "adj[4] is still empty",
        },
      },
    ],
  },
  dfs: {
    title_mn: "Хэдэн тусдаа бүлэг байгааг тоолох нь",
    title_en: "Counting how many separate groups there are",
    slides: [
      {
        title_mn: "Зургаан цэг, гурван холбоос. Хэн ч хараахан очоогүй.",
        title_en: "Six nodes and three edges. Nothing has been visited yet.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "n0", x: 12, y: 18, label: "0" },
            { id: "n1", x: 38, y: 18, label: "1" },
            { id: "n2", x: 64, y: 18, label: "2" },
            { id: "n3", x: 12, y: 84, label: "3" },
            { id: "n4", x: 38, y: 84, label: "4" },
            { id: "n5", x: 84, y: 50, label: "5" },
          ],
          edges: [
            { a: "n0", b: "n1" },
            { a: "n1", b: "n2" },
            { a: "n3", b: "n4" },
          ],
          caption_mn: "seen бүхэлдээ false",
          caption_en: "seen is false everywhere",
        },
      },
      {
        title_mn: "0-ээс эхэлнэ. groups = 1 болж, dfs(0) дуудагдана.",
        title_en: "Start at 0. groups becomes 1 and dfs(0) is called.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "n0", x: 12, y: 18, label: "0", tone: "active" },
            { id: "n1", x: 38, y: 18, label: "1" },
            { id: "n2", x: 64, y: 18, label: "2" },
            { id: "n3", x: 12, y: 84, label: "3" },
            { id: "n4", x: 38, y: 84, label: "4" },
            { id: "n5", x: 84, y: 50, label: "5" },
          ],
          edges: [
            { a: "n0", b: "n1" },
            { a: "n1", b: "n2" },
            { a: "n3", b: "n4" },
          ],
          caption_mn: "groups = 1",
          caption_en: "groups = 1",
        },
      },
      {
        title_mn: "0-ийн хөрш нь 1. Тэр рүү шууд гүн рүү орно.",
        title_en: "The neighbour of 0 is 1. It dives straight in there.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "n0", x: 12, y: 18, label: "0", tone: "done" },
            { id: "n1", x: 38, y: 18, label: "1", tone: "active" },
            { id: "n2", x: 64, y: 18, label: "2" },
            { id: "n3", x: 12, y: 84, label: "3" },
            { id: "n4", x: 38, y: 84, label: "4" },
            { id: "n5", x: 84, y: 50, label: "5" },
          ],
          edges: [
            { a: "n0", b: "n1", tone: "active" },
            { a: "n1", b: "n2" },
            { a: "n3", b: "n4" },
          ],
          caption_mn: "0 рүү буцахгүй — тэмдэглэгдсэн",
          caption_en: "It will not go back to 0 — that one is marked",
        },
      },
      {
        title_mn: "1-ээс 2 рүү. Энэ бүлэгт өөр очих газар үлдсэнгүй.",
        title_en: "From 1 on to 2. There is nowhere else to go in this group.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "n0", x: 12, y: 18, label: "0", tone: "done" },
            { id: "n1", x: 38, y: 18, label: "1", tone: "done" },
            { id: "n2", x: 64, y: 18, label: "2", tone: "done" },
            { id: "n3", x: 12, y: 84, label: "3" },
            { id: "n4", x: 38, y: 84, label: "4" },
            { id: "n5", x: 84, y: 50, label: "5" },
          ],
          edges: [
            { a: "n0", b: "n1", tone: "done" },
            { a: "n1", b: "n2", tone: "done" },
            { a: "n3", b: "n4" },
          ],
          caption_mn: "Эхний бүлэг: 0, 1, 2",
          caption_en: "First group: 0, 1, 2",
        },
      },
      {
        title_mn: "Гол давталт 3 дээр ирэхэд тэр тэмдэглэгдээгүй байна. Шинэ бүлэг.",
        title_en: "The main loop reaches 3 and finds it unmarked. A new group.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "n0", x: 12, y: 18, label: "0", tone: "done" },
            { id: "n1", x: 38, y: 18, label: "1", tone: "done" },
            { id: "n2", x: 64, y: 18, label: "2", tone: "done" },
            { id: "n3", x: 12, y: 84, label: "3", tone: "active" },
            { id: "n4", x: 38, y: 84, label: "4", tone: "active" },
            { id: "n5", x: 84, y: 50, label: "5" },
          ],
          edges: [
            { a: "n0", b: "n1", tone: "done" },
            { a: "n1", b: "n2", tone: "done" },
            { a: "n3", b: "n4", tone: "active" },
          ],
          caption_mn: "groups = 2",
          caption_en: "groups = 2",
        },
      },
      {
        title_mn: "5 цэг хэнтэй ч холбогдоогүй ч бас нэг бүлэг. Хариу нь 3.",
        title_en: "Node 5 joins nothing, but it is still a group. The answer is 3.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "n0", x: 12, y: 18, label: "0", tone: "done" },
            { id: "n1", x: 38, y: 18, label: "1", tone: "done" },
            { id: "n2", x: 64, y: 18, label: "2", tone: "done" },
            { id: "n3", x: 12, y: 84, label: "3", tone: "done" },
            { id: "n4", x: 38, y: 84, label: "4", tone: "done" },
            { id: "n5", x: 84, y: 50, label: "5", tone: "active" },
          ],
          edges: [
            { a: "n0", b: "n1", tone: "done" },
            { a: "n1", b: "n2", tone: "done" },
            { a: "n3", b: "n4", tone: "done" },
          ],
          caption_mn: "groups = 3",
          caption_en: "groups = 3",
        },
      },
    ],
  },
  bfs: {
    title_mn: "Давалгаа хүснэгтээр хэрхэн тархах вэ",
    title_en: "How the wave spreads across the grid",
    slides: [
      {
        title_mn: "Зөвхөн эхлэх нүд мэдэгдэж байна: dist[0][0] = 0.",
        title_en: "Only the starting cell is known: dist[0][0] = 0.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "0", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "Бусад бүгд -1, өөрөөр хэлбэл «хараахан хүрээгүй»",
          caption_en: "Everything else is -1, meaning \"not reached yet\"",
        },
      },
      {
        title_mn: "Эхний давалгаа: нэг алхмын зайд байгаа хоёр нүд.",
        title_en: "The first wave: the two cells one step away.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "0", tone: "done" }, { label: "1", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "1", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "Дараалалд орох үедээ тэмдэглэгдэнэ",
          caption_en: "They are marked as they go into the queue",
        },
      },
      {
        title_mn: "Хоёр дахь давалгаа: хоёр алхмын зайд байгаа гурван нүд.",
        title_en: "The second wave: the three cells two steps away.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "0", tone: "done" }, { label: "1", tone: "done" }, { label: "2", tone: "active" }, { label: "?", tone: "ghost" },
            { label: "1", tone: "done" }, { label: "2", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
            { label: "2", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "Давалгаа тэгш өнцөгт биш, ташуу тархана",
          caption_en: "The wave spreads on a diagonal, not in a box",
        },
      },
      {
        title_mn: "Гурав дахь давалгаа. Хүснэгтийн тал хувь дүүрлээ.",
        title_en: "The third wave. Half the grid is filled.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "0", tone: "done" }, { label: "1", tone: "done" }, { label: "2", tone: "done" }, { label: "3", tone: "active" },
            { label: "1", tone: "done" }, { label: "2", tone: "done" }, { label: "3", tone: "active" }, { label: "?", tone: "ghost" },
            { label: "2", tone: "done" }, { label: "3", tone: "active" }, { label: "?", tone: "ghost" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "Нүд бүр НЭГ л удаа дараалалд ордог",
          caption_en: "Each cell enters the queue exactly once",
        },
      },
      {
        title_mn: "Дөрөв дэх давалгаа. Хоёр нүд үлдлээ.",
        title_en: "The fourth wave. Two cells to go.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "0", tone: "done" }, { label: "1", tone: "done" }, { label: "2", tone: "done" }, { label: "3", tone: "done" },
            { label: "1", tone: "done" }, { label: "2", tone: "done" }, { label: "3", tone: "done" }, { label: "4", tone: "active" },
            { label: "2", tone: "done" }, { label: "3", tone: "done" }, { label: "4", tone: "active" }, { label: "?", tone: "ghost" },
          ],
          caption_mn: "Давалгаа баруун доод булан руу дөхөж байна",
          caption_en: "The wave is closing on the far corner",
        },
      },
      {
        title_mn: "Тав дахь давалгаа буланд хүрлээ. dist[2][3] = 5.",
        title_en: "The fifth wave reaches the corner. dist[2][3] = 5.",
        scene: {
          kind: "grid",
          w: 4,
          h: 3,
          cells: [
            { label: "0", tone: "done" }, { label: "1", tone: "done" }, { label: "2", tone: "done" }, { label: "3", tone: "done" },
            { label: "1", tone: "done" }, { label: "2", tone: "done" }, { label: "3", tone: "done" }, { label: "4", tone: "done" },
            { label: "2", tone: "done" }, { label: "3", tone: "done" }, { label: "4", tone: "done" }, { label: "5", tone: "active" },
          ],
          caption_mn: "Эхлээд хүрсэн зам нь хамгийн богино зам",
          caption_en: "The first route to arrive is the shortest one",
        },
      },
    ],
  },
  dijkstra: {
    title_mn: "Хамгийн хямд зам үргэлж хамгийн цөөн холбоостой байдаггүй",
    title_en: "The cheapest route is not the one with the fewest hops",
    slides: [
      {
        title_mn: "Дөрвөн цэг, жинтэй холбоосууд. 0-ээс бусад руу зай нь мэдэгдэхгүй.",
        title_en: "Four nodes, weighted edges. Every distance but the start is unknown.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "v0", x: 10, y: 55, label: "0", tone: "active", sub: "0" },
            { id: "v1", x: 40, y: 14, label: "1", sub: "inf" },
            { id: "v2", x: 70, y: 55, label: "2", sub: "inf" },
            { id: "v3", x: 94, y: 14, label: "3", sub: "inf" },
          ],
          edges: [
            { a: "v0", b: "v1", label: "1", directed: true },
            { a: "v0", b: "v2", label: "8", directed: true },
            { a: "v1", b: "v2", label: "2", directed: true },
            { a: "v2", b: "v3", label: "3", directed: true },
          ],
          caption_mn: "dist[0] = 0, бусад нь маш том тоо",
          caption_en: "dist[0] = 0, the rest are a very large number",
        },
      },
      {
        title_mn: "0-ээс гарах хоёр холбоос. dist[1] = 1, dist[2] = 8 болов.",
        title_en: "Two edges leave 0. dist[1] becomes 1 and dist[2] becomes 8.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "v0", x: 10, y: 55, label: "0", tone: "done", sub: "0" },
            { id: "v1", x: 40, y: 14, label: "1", tone: "active", sub: "1" },
            { id: "v2", x: 70, y: 55, label: "2", tone: "active", sub: "8" },
            { id: "v3", x: 94, y: 14, label: "3", sub: "inf" },
          ],
          edges: [
            { a: "v0", b: "v1", label: "1", tone: "active", directed: true },
            { a: "v0", b: "v2", label: "8", tone: "active", directed: true },
            { a: "v1", b: "v2", label: "2", directed: true },
            { a: "v2", b: "v3", label: "3", directed: true },
          ],
          caption_mn: "Аль нь ч эцсийн хариу гэж баталгаагүй",
          caption_en: "Neither of those is settled yet",
        },
      },
      {
        title_mn: "Дараалалаас хамгийн бага нь буюу 1 гарна. Тэр нь эцсийн утга.",
        title_en: "The smallest in the queue comes out — that is 1, and it is now final.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "v0", x: 10, y: 55, label: "0", tone: "done", sub: "0" },
            { id: "v1", x: 40, y: 14, label: "1", tone: "done", sub: "1" },
            { id: "v2", x: 70, y: 55, label: "2", tone: "active", sub: "8" },
            { id: "v3", x: 94, y: 14, label: "3", sub: "inf" },
          ],
          edges: [
            { a: "v0", b: "v1", label: "1", tone: "done", directed: true },
            { a: "v0", b: "v2", label: "8", directed: true },
            { a: "v1", b: "v2", label: "2", tone: "active", directed: true },
            { a: "v2", b: "v3", label: "3", directed: true },
          ],
          caption_mn: "1 цэгээс 2 руу шалгах ээлж",
          caption_en: "Now check the edge from 1 to 2",
        },
      },
      {
        title_mn: "1 + 2 = 3, энэ нь 8-аас хямд. dist[2] нь 3 болж сайжирлаа.",
        title_en: "1 + 2 = 3, which beats 8. dist[2] improves to 3.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "v0", x: 10, y: 55, label: "0", tone: "done", sub: "0" },
            { id: "v1", x: 40, y: 14, label: "1", tone: "done", sub: "1" },
            { id: "v2", x: 70, y: 55, label: "2", tone: "done", sub: "3" },
            { id: "v3", x: 94, y: 14, label: "3", sub: "inf" },
          ],
          edges: [
            { a: "v0", b: "v1", label: "1", tone: "done", directed: true },
            { a: "v0", b: "v2", label: "8", tone: "bad", directed: true },
            { a: "v1", b: "v2", label: "2", tone: "done", directed: true },
            { a: "v2", b: "v3", label: "3", directed: true },
          ],
          caption_mn: "Шууд 8-ын зам ялагдлаа",
          caption_en: "The direct road of 8 has been beaten",
        },
      },
      {
        title_mn: "2 цэг гарахад 3 руу очно: 3 + 3 = 6.",
        title_en: "Node 2 comes out and reaches 3: 3 + 3 = 6.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "v0", x: 10, y: 55, label: "0", tone: "done", sub: "0" },
            { id: "v1", x: 40, y: 14, label: "1", tone: "done", sub: "1" },
            { id: "v2", x: 70, y: 55, label: "2", tone: "done", sub: "3" },
            { id: "v3", x: 94, y: 14, label: "3", tone: "active", sub: "6" },
          ],
          edges: [
            { a: "v0", b: "v1", label: "1", tone: "done", directed: true },
            { a: "v0", b: "v2", label: "8", tone: "bad", directed: true },
            { a: "v1", b: "v2", label: "2", tone: "done", directed: true },
            { a: "v2", b: "v3", label: "3", tone: "active", directed: true },
          ],
          caption_mn: "dist[3] = 6",
          caption_en: "dist[3] = 6",
        },
      },
      {
        title_mn: "Дараалалд үлдсэн (8, 2) бичлэг хуучирсан тул алгасагдана.",
        title_en: "The (8, 2) entry still in the queue is out of date, so it is skipped.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "pq",
              cells: [
                { label: "8,2", tone: "bad" },
              ],
            },
            {
              name: "dist",
              cells: [
                { label: "3", sub: "2", tone: "done" },
              ],
            },
          ],
          caption_mn: "8 > 3 тул энэ мөр л зогсооно: if (d > dist[v]) continue;",
          caption_en: "8 > 3, so one line stops it: if (d > dist[v]) continue;",
        },
      },
      {
        title_mn: "Хариу нь 6. Гурван холбоосоор явсан нь ганц холбоосоос хямд байлаа.",
        title_en: "The answer is 6. Three hops turned out cheaper than one.",
        scene: {
          kind: "graph",
          nodes: [
            { id: "v0", x: 10, y: 55, label: "0", tone: "done", sub: "0" },
            { id: "v1", x: 40, y: 14, label: "1", tone: "done", sub: "1" },
            { id: "v2", x: 70, y: 55, label: "2", tone: "done", sub: "3" },
            { id: "v3", x: 94, y: 14, label: "3", tone: "done", sub: "6" },
          ],
          edges: [
            { a: "v0", b: "v1", label: "1", tone: "done", directed: true },
            { a: "v0", b: "v2", label: "8", tone: "bad", directed: true },
            { a: "v1", b: "v2", label: "2", tone: "done", directed: true },
            { a: "v2", b: "v3", label: "3", tone: "done", directed: true },
          ],
          caption_mn: "BFS бол 0 → 2 → 3 гэж хариулж, 11 гэж алдах байсан",
          caption_en: "BFS would have said 0 to 2 to 3, and got 11",
        },
      },
    ],
  },
  classes: {
    title_mn: "private нь 150 оноог хэрхэн зогсоох вэ",
    title_en: "How private stops a score of 150",
    slides: [
      {
        title_mn: "Student a; гэж үүсгэлээ. Хоёр талбар нь гаднаас харагдахгүй.",
        title_en: "Student a; is made. Neither field can be seen from outside.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "name", value: "-", tone: "ghost" },
            { key: "score", value: "-", tone: "ghost" },
          ],
          caption_mn: "private: гаднаас хүрэх арга байхгүй",
          caption_en: "private: there is no way in from outside",
        },
      },
      {
        title_mn: "a.set(\"Bat\", 150) дуудагдлаа. 150 нь боломжгүй оноо.",
        title_en: "a.set(\"Bat\", 150) is called. 150 is not a possible score.",
        scene: {
          kind: "flow",
          horizontal: true,
          steps: [
            { label: "150", tone: "bad" },
            { label: "if (s > 100)", tone: "active" },
            { label: "100", tone: "done" },
          ],
          caption_mn: "set нь орж ирсэн утгыг шалгана",
          caption_en: "set checks the value on its way in",
        },
      },
      {
        title_mn: "Хадгалагдсан утга 100. Тэнэг оноо хэзээ ч дотогш орохгүй.",
        title_en: "What gets stored is 100. A silly score never gets inside.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "name", value: "Bat", tone: "done" },
            { key: "score", value: "100", tone: "done" },
          ],
          caption_mn: "a.get() = 100",
          caption_en: "a.get() = 100",
        },
      },
      {
        title_mn: "a.set(\"Bat\", 72) — энэ утга зөв тул хэвээрээ өнгөрнө.",
        title_en: "a.set(\"Bat\", 72) — this one is sensible, so it passes straight through.",
        scene: {
          kind: "flow",
          horizontal: true,
          steps: [
            { label: "72", tone: "active" },
            { label: "if (s > 100)", tone: "ghost" },
            { label: "72", tone: "done" },
          ],
          caption_mn: "Шалгалт зөвхөн шаардлагатай үедээ ажиллана",
          caption_en: "The guard only bites when it has to",
        },
      },
      {
        title_mn: "Одоо score = 72. Обьект үргэлж утга учиртай байдалд байна.",
        title_en: "Now score = 72. The object is never in a nonsense state.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "name", value: "Bat", tone: "done" },
            { key: "score", value: "72", tone: "done" },
          ],
          caption_mn: "a.get() = 72",
          caption_en: "a.get() = 72",
        },
      },
      {
        title_mn: "a.score = 150 гэж бичих гэвэл компилятор татгалзана. Энэ л гол утга.",
        title_en: "Try writing a.score = 150 and the compiler refuses. That is the whole point.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "a.set(...)", value: "100", tone: "done" },
            { key: "a.score = ...", value: "x", tone: "bad" },
          ],
          caption_mn: "Ганц хаалга нээлттэй, тэр нь шалгалттай",
          caption_en: "One door in, and it has a guard on it",
        },
      },
    ],
  },
  "class-methods": {
    title_mn: "Обьект бүр өөрийн гэсэн утгатай",
    title_en: "Every object carries its own values",
    slides: [
      {
        title_mn: "Rect r(3, 4); — байгуулагч w ба h-ийг нэг дор дүүргэнэ.",
        title_en: "Rect r(3, 4); — the constructor fills w and h in one go.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "w", value: "3", tone: "active" },
            { key: "h", value: "4", tone: "active" },
          ],
          caption_mn: "Хагас дүүрсэн Rect гэж байхгүй",
          caption_en: "There is no such thing as a half-filled Rect",
        },
      },
      {
        title_mn: "r.area() нь w ба h-ийг мэднэ. Аргумент дамжуулах шаардлагагүй.",
        title_en: "r.area() already knows w and h. Nothing needs to be passed in.",
        scene: {
          kind: "flow",
          horizontal: true,
          steps: [
            { label: "w * h", tone: "active" },
            { label: "3 * 4" },
            { label: "12", tone: "done" },
          ],
          caption_mn: "Метод нь дуудагдсан обьектоо нууцаар хүлээж авна",
          caption_en: "A method quietly receives the object it was called on",
        },
      },
      {
        title_mn: "r.perimeter() ижил хоёр утгыг өөрөөр ашиглана.",
        title_en: "r.perimeter() uses the same two values a different way.",
        scene: {
          kind: "flow",
          horizontal: true,
          steps: [
            { label: "2 * (w + h)", tone: "active" },
            { label: "2 * 7" },
            { label: "14", tone: "done" },
          ],
          caption_mn: "Нэг обьект, олон метод",
          caption_en: "One object, several methods",
        },
      },
      {
        title_mn: "Rect small(2, 2); — хоёр дахь обьект. Өөрийн гэсэн w, h-тэй.",
        title_en: "Rect small(2, 2); — a second object, with a w and h of its own.",
        scene: {
          kind: "split",
          left: {
            kind: "pairs",
            pairs: [
              { key: "w", value: "3", tone: "done" },
              { key: "h", value: "4", tone: "done" },
            ],
            caption_mn: "r",
            caption_en: "r",
          },
          right: {
            kind: "pairs",
            pairs: [
              { key: "w", value: "2", tone: "active" },
              { key: "h", value: "2", tone: "active" },
            ],
            caption_mn: "small",
            caption_en: "small",
          },
        },
      },
      {
        title_mn: "small.area() нь 4. Ижил код, өөр утга.",
        title_en: "small.area() gives 4. The same code, different values.",
        scene: {
          kind: "flow",
          horizontal: true,
          steps: [
            { label: "w * h", tone: "active" },
            { label: "2 * 2" },
            { label: "4", tone: "done" },
          ],
          caption_mn: "Код нэг л удаа бичигдсэн",
          caption_en: "The code was written once",
        },
      },
      {
        title_mn: "Байгуулагчгүй бол w, h нь хог утгатай эхлэх байсан.",
        title_en: "Without a constructor, w and h would start out as rubbish.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "w", value: "?", tone: "bad" },
            { key: "h", value: "?", tone: "bad" },
          ],
          caption_mn: "area() нь утгагүй тоо буцаах байсан",
          caption_en: "area() would have returned a meaningless number",
        },
      },
    ],
  },
  "operator-overload": {
    title_mn: "sort яагаад оноог мэддэг болов",
    title_en: "How sort came to know about scores",
    slides: [
      {
        title_mn: "Гурван оюутан, бичигдсэн дарааллаараа.",
        title_en: "Three students, in the order they were written.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "Bat", value: "70" },
            { key: "Suvd", value: "95" },
            { key: "Tuul", value: "82" },
          ],
          caption_mn: "sort(v.begin(), v.end()) — харьцуулагч дамжуулаагүй",
          caption_en: "sort(v.begin(), v.end()) — no comparator passed",
        },
      },
      {
        title_mn: "Харьцуулагчгүй үед sort нь бүтцийн өөрийнх нь < операторыг хайна.",
        title_en: "With no comparator, sort goes looking for the type's own < operator.",
        scene: {
          kind: "flow",
          horizontal: true,
          steps: [
            { label: "sort", tone: "active" },
            { label: "a < b ?" },
            { label: "operator<", tone: "done" },
          ],
          caption_mn: "Бид түүнийг Student дотор өөрсдөө бичсэн",
          caption_en: "We wrote that one ourselves, inside Student",
        },
      },
      {
        title_mn: "Bat < Suvd мөн үү? Оператор 70 > 95 гэж шалгаад худал гэнэ.",
        title_en: "Is Bat < Suvd? The operator asks 70 > 95, and says no.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "Bat", value: "70", tone: "bad" },
            { key: "Suvd", value: "95", tone: "active" },
            { key: "Tuul", value: "82" },
          ],
          caption_mn: "Тиймээс Suvd урагшилна",
          caption_en: "So Suvd moves ahead",
        },
      },
      {
        title_mn: "Suvd < Tuul мөн үү? 95 > 82 үнэн, тиймээс Suvd түрүүлж үлдэнэ.",
        title_en: "Is Suvd < Tuul? 95 > 82 is true, so Suvd stays in front.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "Suvd", value: "95", tone: "done" },
            { key: "Tuul", value: "82", tone: "active" },
            { key: "Bat", value: "70" },
          ],
          caption_mn: "Оператор бүр хосыг ингэж шийднэ",
          caption_en: "Every pair is decided the same way",
        },
      },
      {
        title_mn: "Эцсийн дараалал: оноо буурахаар. Дуудлагад ганц ч нэмэлт үг алга.",
        title_en: "The final order is by descending score. Not one extra word at the call site.",
        scene: {
          kind: "pairs",
          pairs: [
            { key: "Suvd", value: "95", tone: "done" },
            { key: "Tuul", value: "82", tone: "done" },
            { key: "Bat", value: "70", tone: "done" },
          ],
          caption_mn: "Хэвлэв: Suvd 95, Tuul 82, Bat 70",
          caption_en: "Printed: Suvd 95, Tuul 82, Bat 70",
        },
      },
      {
        title_mn: "Заль нь операторын дотор: < гэж нэрлээд > гэж бичсэн.",
        title_en: "The trick is inside the operator: it is called <, but written with >.",
        scene: {
          kind: "rows",
          rows: [
            {
              name: "<",
              cells: [
                { label: "70", tone: "ghost" },
                { label: "82", tone: "ghost" },
                { label: "95", tone: "ghost" },
              ],
            },
            {
              name: ">",
              cells: [
                { label: "95", tone: "done" },
                { label: "82", tone: "done" },
                { label: "70", tone: "done" },
              ],
            },
          ],
          caption_mn: "Дээд нь энгийн <, доод нь бидний бичсэн нь",
          caption_en: "Top is what a plain < would give, bottom is ours",
        },
      },
    ],
  },
  // __DECKS__ — splice point, keep this line
};

export function deckFor(slug: string): Deck | undefined {
  return LESSON_SLIDES[slug];
}

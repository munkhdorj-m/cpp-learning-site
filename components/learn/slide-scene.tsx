import {
  GRAPH_H,
  NODE_R,
  VIEW_PAD,
  VIEW_W,
  graphLayout,
} from "@/lib/lesson-slides";
import type { Cell, Scene, Tone } from "@/lib/lesson-slides";

/**
 * Draws one scene of a lesson slide as SVG.
 *
 * The decks in lib/lesson-slides.ts describe WHAT is on a slide — five frames
 * on a stack, a row with `lo` and `hi` under it. Every coordinate is worked
 * out here, from the counts. Authors never place anything by hand, so a deck
 * cannot produce two labels on top of each other.
 *
 * Colours come from the theme's own custom properties, so a slide follows the
 * student's light/dark choice without a second palette to keep in step.
 */

const PAD = VIEW_PAD;

/** Fill, border and text for each tone. */
function toneStyle(tone: Tone = "idle"): {
  fill: string;
  stroke: string;
  text: string;
  dash?: string;
} {
  switch (tone) {
    case "active":
      return {
        fill: "color-mix(in srgb, var(--primary) 20%, transparent)",
        stroke: "var(--primary)",
        text: "var(--primary)",
      };
    case "done":
      return {
        fill: "color-mix(in srgb, var(--signal-ok) 18%, transparent)",
        stroke: "var(--signal-ok)",
        text: "var(--signal-ok)",
      };
    case "bad":
      return {
        fill: "color-mix(in srgb, var(--signal-no) 16%, transparent)",
        stroke: "var(--signal-no)",
        text: "var(--signal-no)",
      };
    case "ghost":
      return {
        fill: "transparent",
        stroke: "var(--rail)",
        text: "var(--muted-foreground)",
        dash: "4 3",
      };
    default:
      return {
        fill: "var(--muted)",
        stroke: "var(--rail)",
        text: "var(--foreground)",
      };
  }
}

/** Shrink the type until the label fits the box it has to sit in. */
function fitFont(text: string, boxW: number, base: number): number {
  if (!text) return base;
  // Monospace advance is close enough to 0.6em to size from the count alone.
  const needed = (boxW - 8) / (text.length * 0.6);
  return Math.max(8, Math.min(base, needed));
}

function Box({
  x,
  y,
  w,
  h,
  cell,
  radius = 3,
  font = 14,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  cell: Cell;
  radius?: number;
  font?: number;
}) {
  const s = toneStyle(cell.tone);
  const label = cell.label ?? "";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={radius}
        style={{ fill: s.fill, stroke: s.stroke }}
        strokeWidth={1.5}
        strokeDasharray={s.dash}
      />
      {label && (
        <text
          x={x + w / 2}
          y={y + h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-code"
          fontSize={fitFont(label, w, font)}
          style={{ fill: s.text }}
        >
          {label}
        </text>
      )}
      {cell.sub && (
        <text
          x={x + w / 2}
          y={y + h + 9}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-code"
          fontSize={9}
          style={{ fill: "var(--muted-foreground)" }}
        >
          {cell.sub}
        </text>
      )}
    </g>
  );
}

function Caption({
  x,
  y,
  w,
  text,
}: {
  x: number;
  y: number;
  w: number;
  text: string;
}) {
  return (
    <text
      x={x + w / 2}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      style={{ fill: "var(--muted-foreground)" }}
    >
      {text}
    </text>
  );
}

/** Height a caption adds, if the scene has one. */
function captionH(s: Scene, en: boolean): number {
  if (s.kind === "split") return 0;
  return captionOf(s, en) ? 20 : 0;
}

function captionOf(s: Scene, en: boolean): string | undefined {
  if (s.kind === "split") return undefined;
  return en ? s.caption_en : s.caption_mn;
}

/** How tall this scene needs to be at width `w`. */
export function sceneHeight(s: Scene, w: number, en: boolean): number {
  const cap = captionH(s, en);
  switch (s.kind) {
    case "stack":
      return s.frames.length * 38 + cap;
    case "rows": {
      let h = 0;
      for (const r of s.rows) {
        h += 34;
        if (r.cells.some((c) => c.sub)) h += 12;
        if (r.pointers?.length) h += 24;
        h += 10;
      }
      return Math.max(0, h - 10) + cap;
    }
    case "grid": {
      const side = gridSide(s.w, w);
      return s.h * side + cap;
    }
    case "graph":
      return GRAPH_H + cap;
    case "flow":
      if (s.horizontal) return 40 + cap;
      return s.steps.length * 34 + Math.max(0, s.steps.length - 1) * 26 + cap;
    case "bars":
      return s.bars.length * 28 + cap;
    case "pairs":
      return s.pairs.length * 30 + cap;
    case "split": {
      const half = (w - 18) / 2;
      return Math.max(
        sceneHeight(s.left, half, en),
        sceneHeight(s.right, half, en),
      );
    }
  }
}

function gridSide(cols: number, w: number): number {
  return Math.max(16, Math.min(42, (w - 20) / cols));
}

/** Draw `scene` into the box at (x, y) of width `w`. */
export function SceneAt({
  scene,
  x,
  y,
  w,
  en,
}: {
  scene: Scene;
  x: number;
  y: number;
  w: number;
  en: boolean;
}) {
  const cap = captionOf(scene, en);
  const body = sceneHeight(scene, w, en) - captionH(scene, en);

  const caption = cap ? (
    <Caption x={x} y={y + body + 11} w={w} text={cap} />
  ) : null;

  switch (scene.kind) {
    case "stack": {
      const n = scene.frames.length;
      const bw = Math.min(200, w - 16);
      const bx = x + (w - bw) / 2;
      return (
        <g>
          {scene.frames.map((f, i) => (
            <Box
              key={i}
              x={bx}
              // First frame is the bottom of the stack.
              y={y + (n - 1 - i) * 38}
              w={bw}
              h={32}
              cell={f}
            />
          ))}
          {caption}
        </g>
      );
    }

    case "rows": {
      const hasName = scene.rows.some((r) => r.name);
      const nameW = hasName ? 44 : 0;
      const maxCells = Math.max(1, ...scene.rows.map((r) => r.cells.length));
      const cw = Math.max(
        20,
        Math.min(52, (w - nameW - 8) / maxCells),
      );
      let cy = y;
      const out: React.ReactNode[] = [];

      scene.rows.forEach((row, ri) => {
        const rowW = row.cells.length * cw;
        const rx = x + nameW + (w - nameW - rowW) / 2;

        if (row.name) {
          out.push(
            <text
              key={`n${ri}`}
              x={rx - 8}
              y={cy + 16}
              textAnchor="end"
              dominantBaseline="central"
              className="font-code"
              fontSize={12}
              style={{ fill: "var(--muted-foreground)" }}
            >
              {row.name}
            </text>,
          );
        }

        row.cells.forEach((c, ci) => {
          out.push(
            <Box
              key={`c${ri}-${ci}`}
              x={rx + ci * cw}
              y={cy}
              w={cw - 3}
              h={32}
              cell={c}
              font={13}
            />,
          );
        });

        let below = 32;
        if (row.cells.some((c) => c.sub)) below += 12;

        (row.pointers ?? []).forEach((p, pi) => {
          const px = rx + p.at * cw + (cw - 3) / 2;
          const s = toneStyle(p.tone ?? "active");
          out.push(
            <g key={`p${ri}-${pi}`}>
              <path
                d={`M ${px} ${cy + below + 10} l -4 6 l 8 0 z`}
                style={{ fill: s.stroke }}
              />
              <text
                x={px}
                y={cy + below + 21}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-code"
                fontSize={11}
                style={{ fill: s.text }}
              >
                {p.label}
              </text>
            </g>,
          );
        });

        cy += below + (row.pointers?.length ? 24 : 0) + 10;
      });

      return (
        <g>
          {out}
          {caption}
        </g>
      );
    }

    case "grid": {
      const side = gridSide(scene.w, w);
      const gw = scene.w * side;
      const gx = x + (w - gw) / 2;
      return (
        <g>
          {scene.cells.slice(0, scene.w * scene.h).map((c, i) => (
            <Box
              key={i}
              x={gx + (i % scene.w) * side}
              y={y + Math.floor(i / scene.w) * side}
              w={side - 2}
              h={side - 2}
              cell={c}
              font={13}
            />
          ))}
          {caption}
        </g>
      );
    }

    case "graph": {
      const R = NODE_R;
      const layout = graphLayout(scene.nodes);
      // graphLayout works in frame-local pixels; shift into place, and centre
      // horizontally in case this graph shares a split with another scene.
      const originX = x + R + 6 + (w - 2 * (R + 6) - layout.w) / 2;
      const originY = y + R + 6;
      const at = (n: { x: number; y: number }) => {
        const p = layout.at(n);
        return { cx: originX + p.cx, cy: originY + p.cy };
      };
      const byId = new Map(scene.nodes.map((n) => [n.id, n]));

      return (
        <g>
          <defs>
            <marker
              id="slide-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: "var(--muted-foreground)" }} />
            </marker>
          </defs>

          {scene.edges.map((e, i) => {
            const a = byId.get(e.a);
            const b = byId.get(e.b);
            if (!a || !b) return null;
            const pa = at(a);
            const pb = at(b);
            // Stop the line at the circle's edge so an arrowhead lands cleanly.
            const dx = pb.cx - pa.cx;
            const dy = pb.cy - pa.cy;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const s = toneStyle(e.tone ?? "idle");
            const stroke = e.tone ? s.stroke : "var(--muted-foreground)";
            return (
              <g key={`e${i}`}>
                <line
                  x1={pa.cx + ux * R}
                  y1={pa.cy + uy * R}
                  x2={pb.cx - ux * R}
                  y2={pb.cy - uy * R}
                  style={{ stroke }}
                  strokeWidth={e.tone && e.tone !== "idle" ? 2.5 : 1.5}
                  markerEnd={e.directed ? "url(#slide-arrow)" : undefined}
                />
                {e.label && (
                  <text
                    x={(pa.cx + pb.cx) / 2 - uy * 11}
                    y={(pa.cy + pb.cy) / 2 + ux * 11}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-code"
                    fontSize={11}
                    style={{ fill: "var(--muted-foreground)" }}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {scene.nodes.map((n) => {
            const p = at(n);
            const s = toneStyle(n.tone);
            return (
              <g key={n.id}>
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={R}
                  style={{ fill: s.fill, stroke: s.stroke }}
                  strokeWidth={1.8}
                  strokeDasharray={s.dash}
                />
                <text
                  x={p.cx}
                  y={p.cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-code"
                  fontSize={fitFont(n.label, 2 * R, 13)}
                  style={{ fill: s.text }}
                >
                  {n.label}
                </text>
                {n.sub && (
                  <text
                    x={p.cx}
                    y={p.cy + R + 9}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-code"
                    fontSize={10}
                    style={{ fill: "var(--muted-foreground)" }}
                  >
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
          {caption}
        </g>
      );
    }

    case "flow": {
      if (scene.horizontal) {
        const n = scene.steps.length;
        const gap = 24;
        const bw = Math.max(
          36,
          Math.min(150, (w - 12 - (n - 1) * gap) / Math.max(1, n)),
        );
        const total = n * bw + (n - 1) * gap;
        const sx = x + (w - total) / 2;
        return (
          <g>
            {scene.steps.map((step, i) => (
              <g key={i}>
                <Box
                  x={sx + i * (bw + gap)}
                  y={y}
                  w={bw}
                  h={34}
                  cell={step}
                  font={13}
                />
                {i < n - 1 && (
                  <line
                    x1={sx + i * (bw + gap) + bw + 4}
                    y1={y + 17}
                    x2={sx + (i + 1) * (bw + gap) - 4}
                    y2={y + 17}
                    style={{ stroke: "var(--muted-foreground)" }}
                    strokeWidth={1.5}
                    markerEnd="url(#slide-arrow-h)"
                  />
                )}
              </g>
            ))}
            <defs>
              <marker
                id="slide-arrow-h"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  style={{ fill: "var(--muted-foreground)" }}
                />
              </marker>
            </defs>
            {caption}
          </g>
        );
      }

      const bw = Math.min(230, w - 16);
      const bx = x + (w - bw) / 2;
      return (
        <g>
          <defs>
            <marker
              id="slide-arrow-v"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: "var(--muted-foreground)" }} />
            </marker>
          </defs>
          {scene.steps.map((step, i) => {
            const by = y + i * 60;
            return (
              <g key={i}>
                <Box x={bx} y={by} w={bw} h={34} cell={step} />
                {i < scene.steps.length - 1 && (
                  <line
                    x1={bx + bw / 2}
                    y1={by + 38}
                    x2={bx + bw / 2}
                    y2={by + 56}
                    style={{ stroke: "var(--muted-foreground)" }}
                    strokeWidth={1.5}
                    markerEnd="url(#slide-arrow-v)"
                  />
                )}
              </g>
            );
          })}
          {caption}
        </g>
      );
    }

    case "bars": {
      const labelW = 66;
      const trackW = Math.max(40, w - labelW - 60);
      return (
        <g>
          {scene.bars.map((b, i) => {
            const by = y + i * 28;
            const s = toneStyle(b.tone ?? "active");
            const len = (Math.min(100, Math.max(0, b.value)) / 100) * trackW;
            return (
              <g key={i}>
                <text
                  x={x + labelW - 8}
                  y={by + 12}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="font-code"
                  fontSize={12}
                  style={{ fill: "var(--muted-foreground)" }}
                >
                  {b.label}
                </text>
                <rect
                  x={x + labelW}
                  y={by + 3}
                  width={trackW}
                  height={18}
                  rx={2}
                  style={{ fill: "var(--muted)", stroke: "var(--rail)" }}
                  strokeWidth={1}
                />
                <rect
                  x={x + labelW}
                  y={by + 3}
                  width={Math.max(2, len)}
                  height={18}
                  rx={2}
                  style={{ fill: s.stroke }}
                />
                {b.sub && (
                  <text
                    x={x + labelW + trackW + 6}
                    y={by + 12}
                    dominantBaseline="central"
                    className="font-code"
                    fontSize={11}
                    style={{ fill: "var(--muted-foreground)" }}
                  >
                    {b.sub}
                  </text>
                )}
              </g>
            );
          })}
          {caption}
        </g>
      );
    }

    case "pairs": {
      const tw = Math.min(320, w - 16);
      const tx = x + (w - tw) / 2;
      const keyW = tw * 0.45;
      return (
        <g>
          {scene.pairs.map((p, i) => {
            const py = y + i * 30;
            const s = toneStyle(p.tone);
            return (
              <g key={i}>
                <rect
                  x={tx}
                  y={py}
                  width={keyW}
                  height={26}
                  rx={3}
                  style={{ fill: s.fill, stroke: s.stroke }}
                  strokeWidth={1.5}
                  strokeDasharray={s.dash}
                />
                <text
                  x={tx + keyW / 2}
                  y={py + 13}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-code"
                  fontSize={fitFont(p.key, keyW, 12)}
                  style={{ fill: s.text }}
                >
                  {p.key}
                </text>
                <line
                  x1={tx + keyW + 2}
                  y1={py + 13}
                  x2={tx + keyW + 14}
                  y2={py + 13}
                  style={{ stroke: "var(--rail)" }}
                  strokeWidth={1.5}
                />
                <rect
                  x={tx + keyW + 16}
                  y={py}
                  width={tw - keyW - 16}
                  height={26}
                  rx={3}
                  style={{ fill: "var(--muted)", stroke: "var(--rail)" }}
                  strokeWidth={1.5}
                />
                <text
                  x={tx + keyW + 16 + (tw - keyW - 16) / 2}
                  y={py + 13}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-code"
                  fontSize={fitFont(p.value, tw - keyW - 16, 12)}
                  style={{ fill: "var(--foreground)" }}
                >
                  {p.value}
                </text>
              </g>
            );
          })}
          {caption}
        </g>
      );
    }

    case "split": {
      const half = (w - 18) / 2;
      return (
        <g>
          <SceneAt scene={scene.left} x={x} y={y} w={half} en={en} />
          <SceneAt
            scene={scene.right}
            x={x + half + 18}
            y={y}
            w={half}
            en={en}
          />
        </g>
      );
    }
  }
}

/** The width a scene is laid out in. Exported so a deck can size itself. */
export const SCENE_W = VIEW_W - 2 * PAD;

/**
 * The tallest scene in a set, so every slide of a deck can be drawn at one
 * height. Letting each slide size itself makes the figure jump as a student
 * steps through it, which pulls the eye away from the thing that changed.
 */
export function tallestScene(scenes: Scene[], en: boolean): number {
  return Math.max(72, ...scenes.map((s) => sceneHeight(s, SCENE_W, en)));
}

/** One slide's drawing. `height` comes from the deck so all slides match. */
export function SlideScene({
  scene,
  en,
  height,
}: {
  scene: Scene;
  en: boolean;
  height?: number;
}) {
  const w = SCENE_W;
  const own = Math.max(72, sceneHeight(scene, w, en));
  const h = height ?? own;
  // Every slide of a deck gets the tallest slide's height so the figure does
  // not jump; a short one is centred in it rather than pinned to the top,
  // where it would read as a mistake rather than a choice.
  const top = PAD + Math.max(0, (h - own) / 2);
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${h + 2 * PAD}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      className="h-auto w-full"
    >
      <SceneAt scene={scene} x={PAD} y={top} w={w} en={en} />
    </svg>
  );
}

// Stack-based interpreter for the robot program. Handles nested repeat,
// repeat_until_target, if_path_ahead, and while_path_ahead.
//
// Returns status after each primitive so the caller can show animations:
//   - "ok"     — executed normally
//   - "blocked" — hit a wall (crash)
//   - "danger"  — stepped on TNT (explosion)
//   - "light"   — lit a target

import type { Direction } from "@/app/(app)/game/robot/levels";

export type RobotInstruction =
  | { type: "forward" }
  | { type: "left" }
  | { type: "right" }
  | { type: "light" }
  | { type: "repeat"; count: number; body: RobotInstruction[] }
  | { type: "repeat_until_target"; body: RobotInstruction[] }
  | { type: "if_path_ahead"; body: RobotInstruction[] }
  | { type: "while_path_ahead"; body: RobotInstruction[] };

export type Primitive = "forward" | "left" | "right" | "light";

export interface InterpreterState {
  x: number;
  y: number;
  dir: Direction;
  lit: Set<string>;
  /** Stars picked up so far (tile keys). */
  collected: Set<string>;
  /** Keys picked up. Any key opens every door on the level. */
  keys: number;
  /** Live positions of patrolling hazards, index-matched to grid.movers. */
  movers: { x: number; y: number; dx: number; dy: number }[];
}

type PrimitiveResult =
  | { kind: "ok" }
  | { kind: "blocked" }
  | { kind: "danger" }
  | { kind: "locked" }
  | { kind: "collect"; key: string }
  | { kind: "key"; key: string }
  | { kind: "portal"; key: string }
  | { kind: "light"; key: string }
  | { kind: "step"; primitive: Primitive }
  | { kind: "done" };

interface Frame {
  node: RobotInstruction[];
  index: number;
  iterationsRemaining?: number;
  whileLoop?: boolean;
  untilLoop?: boolean;
}

export interface GridContext {
  width: number;
  height: number;
  walls: Set<string>;
  dangers: Set<string>; // bomb tiles
  targets: Set<string>; // egg tiles (used by repeat_until_target)
  stars?: Set<string>; // collectibles
  keys?: Set<string>; // key pickups
  doors?: Set<string>; // locked until a key is held
  /** Portal tile keys, paired in order: 0↔1, 2↔3, … */
  portals?: { x: number; y: number }[];
  movers?: { x: number; y: number; axis: "h" | "v" }[];
}

const MAX_STEPS = 500;

export class RobotInterpreter {
  private stack: Frame[];
  state: InterpreterState;
  private grid: GridContext;
  private stepsRun = 0;

  constructor(
    program: RobotInstruction[],
    initial: InterpreterState,
    grid: GridContext,
  ) {
    this.stack = [{ node: program, index: 0 }];
    this.state = {
      x: initial.x,
      y: initial.y,
      dir: initial.dir,
      lit: new Set(initial.lit),
      collected: new Set(initial.collected ?? []),
      keys: initial.keys ?? 0,
      // Movers start heading right (horizontal) or up (vertical) and bounce.
      movers: (grid.movers ?? []).map((m) => ({
        x: m.x,
        y: m.y,
        dx: m.axis === "h" ? 1 : 0,
        dy: m.axis === "v" ? 1 : 0,
      })),
    };
    this.grid = grid;
  }

  isDone(): boolean {
    return this.stack.length === 0 || this.stepsRun >= MAX_STEPS;
  }

  /** Advance one step, return what happened. */
  next(): PrimitiveResult {
    let internalIters = 0;
    while (this.stack.length > 0) {
      // Guard against pathological programs where a loop body never executes
      // a primitive (e.g. an always-false `if` inside a while/until loop),
      // which would otherwise spin forever inside this single call.
      if (++internalIters > 5000) return { kind: "done" };
      if (this.stepsRun >= MAX_STEPS) return { kind: "done" };

      const top = this.stack[this.stack.length - 1];

      if (top.index >= top.node.length) {
        // End of frame
        if (
          top.iterationsRemaining !== undefined &&
          top.iterationsRemaining > 1
        ) {
          top.iterationsRemaining--;
          top.index = 0;
          continue;
        }
        if (top.whileLoop && this._pathAhead()) {
          top.index = 0;
          continue;
        }
        this.stack.pop();
        // If a repeat_until_target frame ended, check whether the robot is
        // standing on a target. If not, run the body again; if yes, the loop
        // is finished. (Before this fix the loop ran the body exactly once and
        // then falsely reported "done", so it never actually repeated.)
        if (top.untilLoop) {
          if (!this._onTarget()) {
            this.stack.push({
              node: top.node,
              index: 0,
              untilLoop: true,
            });
          }
          continue;
        }
        continue;
      }

      const instr = top.node[top.index];
      top.index++;

      if (
        instr.type === "forward" ||
        instr.type === "left" ||
        instr.type === "right" ||
        instr.type === "light"
      ) {
        const prim = instr.type;
        const result = this._applyPrimitive(prim);
        this.stepsRun++;
        if (
          result.kind === "blocked" ||
          result.kind === "danger" ||
          result.kind === "locked"
        ) {
          return result; // stop immediately on crash / explosion / locked door
        }
        return { kind: "step", primitive: prim };
      }

      if (instr.type === "repeat") {
        if (instr.count > 0 && instr.body.length > 0) {
          this.stack.push({
            node: instr.body,
            index: 0,
            iterationsRemaining: instr.count,
          });
        }
        continue;
      }

      if (instr.type === "repeat_until_target") {
        // Only start looping if we are not already standing on a target.
        if (instr.body.length > 0 && !this._onTarget()) {
          this.stack.push({
            node: instr.body,
            index: 0,
            untilLoop: true,
          });
        }
        continue;
      }

      if (instr.type === "if_path_ahead") {
        if (this._pathAhead() && instr.body.length > 0) {
          this.stack.push({ node: instr.body, index: 0 });
        }
        continue;
      }

      if (instr.type === "while_path_ahead") {
        if (this._pathAhead() && instr.body.length > 0) {
          this.stack.push({ node: instr.body, index: 0, whileLoop: true });
        }
        continue;
      }
    }
    return { kind: "done" };
  }

  private _applyPrimitive(p: Primitive): PrimitiveResult {
    if (p === "forward") {
      const [dx, dy] = dirToVector(this.state.dir);
      const nx = this.state.x + dx;
      const ny = this.state.y + dy;
      const key = `${nx},${ny}`;

      // Out of bounds = wall
      if (nx < 0 || ny < 0 || nx >= this.grid.width || ny >= this.grid.height) {
        return { kind: "blocked" };
      }

      // Wall collision
      if (this.grid.walls.has(key)) {
        return { kind: "blocked" };
      }

      // A locked door blocks the way until the robot is carrying a key.
      if (this.grid.doors?.has(key) && this.state.keys <= 0) {
        return { kind: "locked" };
      }

      // Bomb hazard
      if (this.grid.dangers.has(key)) {
        this.state.x = nx;
        this.state.y = ny;
        return { kind: "danger" };
      }

      const fromX = this.state.x;
      const fromY = this.state.y;
      this.state.x = nx;
      this.state.y = ny;

      // Patrolling hazards advance on every move; touching one is fatal.
      // Walking straight into one:
      if (this._moverAt(nx, ny)) return { kind: "danger" };
      const before = this.state.movers.map((m) => ({ x: m.x, y: m.y }));
      this._advanceMovers();
      // A hazard stepped onto the robot:
      if (this._moverAt(nx, ny)) return { kind: "danger" };
      // Or they swapped tiles — without this they'd slide through each other.
      const swapped = this.state.movers.some(
        (m, i) =>
          before[i].x === nx &&
          before[i].y === ny &&
          m.x === fromX &&
          m.y === fromY,
      );
      if (swapped) return { kind: "danger" };

      // Portals teleport to their partner (pairs in layout order).
      const portals = this.grid.portals ?? [];
      const idx = portals.findIndex((p) => p.x === nx && p.y === ny);
      if (idx >= 0) {
        const partner = portals[idx % 2 === 0 ? idx + 1 : idx - 1];
        if (partner) {
          this.state.x = partner.x;
          this.state.y = partner.y;
          return { kind: "portal", key: `${partner.x},${partner.y}` };
        }
      }

      // Pickups — collected by walking over them.
      if (this.grid.keys?.has(key) && !this.state.collected.has(key)) {
        this.state.collected.add(key);
        this.state.keys += 1;
        return { kind: "key", key };
      }
      if (this.grid.stars?.has(key) && !this.state.collected.has(key)) {
        this.state.collected.add(key);
        return { kind: "collect", key };
      }

      return { kind: "ok" };
    }

    // Turning and lighting also take a tick, so hazards keep patrolling and
    // a turn can be used to wait for one to pass.
    if (p === "left") {
      this.state.dir = ((this.state.dir + 3) % 4) as Direction;
      this._advanceMovers();
      return this._moverAt(this.state.x, this.state.y)
        ? { kind: "danger" }
        : { kind: "ok" };
    }

    if (p === "right") {
      this.state.dir = ((this.state.dir + 1) % 4) as Direction;
      this._advanceMovers();
      return this._moverAt(this.state.x, this.state.y)
        ? { kind: "danger" }
        : { kind: "ok" };
    }

    // light
    const key = `${this.state.x},${this.state.y}`;
    this.state.lit.add(key);
    this._advanceMovers();
    if (this._moverAt(this.state.x, this.state.y)) return { kind: "danger" };
    return { kind: "light", key };
  }

  /** Step every patrolling hazard one tile, reversing at walls/edges. */
  private _advanceMovers(): void {
    for (const m of this.state.movers) {
      const nx = m.x + m.dx;
      const ny = m.y + m.dy;
      const blocked =
        nx < 0 ||
        ny < 0 ||
        nx >= this.grid.width ||
        ny >= this.grid.height ||
        this.grid.walls.has(`${nx},${ny}`);
      if (blocked) {
        // Bounce and move the other way on this same tick.
        m.dx = -m.dx;
        m.dy = -m.dy;
        const bx = m.x + m.dx;
        const by = m.y + m.dy;
        const stillBlocked =
          bx < 0 ||
          by < 0 ||
          bx >= this.grid.width ||
          by >= this.grid.height ||
          this.grid.walls.has(`${bx},${by}`);
        if (!stillBlocked) {
          m.x = bx;
          m.y = by;
        }
      } else {
        m.x = nx;
        m.y = ny;
      }
    }
  }

  private _moverAt(x: number, y: number): boolean {
    return this.state.movers.some((m) => m.x === x && m.y === y);
  }

  private _pathAhead(): boolean {
    const [dx, dy] = dirToVector(this.state.dir);
    const nx = this.state.x + dx;
    const ny = this.state.y + dy;
    if (nx < 0 || ny < 0 || nx >= this.grid.width || ny >= this.grid.height)
      return false;
    const key = `${nx},${ny}`;
    if (this.grid.walls.has(key)) return false;
    // A door the robot can't open counts as no path.
    if (this.grid.doors?.has(key) && this.state.keys <= 0) return false;
    return true;
  }

  /** True when the robot is standing on a target tile (egg). */
  private _onTarget(): boolean {
    return this.grid.targets.has(`${this.state.x},${this.state.y}`);
  }
}

export function dirToVector(dir: Direction): [number, number] {
  if (dir === 0) return [0, 1]; // North
  if (dir === 1) return [1, 0]; // East
  if (dir === 2) return [0, -1]; // South
  return [-1, 0]; // West
}

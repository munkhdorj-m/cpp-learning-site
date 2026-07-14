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
}

type PrimitiveResult =
  | { kind: "ok" }
  | { kind: "blocked" }
  | { kind: "danger" }
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
  dangers: Set<string>; // TNT tiles
  targets: Set<string>; // egg tiles (used by repeat_until_target)
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
        if (result.kind === "blocked" || result.kind === "danger") {
          return result; // stop immediately on crash/explosion
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

      // TNT hazard
      if (this.grid.dangers.has(key)) {
        this.state.x = nx;
        this.state.y = ny;
        return { kind: "danger" };
      }

      // Safe move
      this.state.x = nx;
      this.state.y = ny;
      return { kind: "ok" };
    }

    if (p === "left") {
      this.state.dir = ((this.state.dir + 3) % 4) as Direction;
      return { kind: "ok" };
    }

    if (p === "right") {
      this.state.dir = ((this.state.dir + 1) % 4) as Direction;
      return { kind: "ok" };
    }

    // light
    const key = `${this.state.x},${this.state.y}`;
    this.state.lit.add(key);
    return { kind: "light", key };
  }

  private _pathAhead(): boolean {
    const [dx, dy] = dirToVector(this.state.dir);
    const nx = this.state.x + dx;
    const ny = this.state.y + dy;
    if (nx < 0 || ny < 0 || nx >= this.grid.width || ny >= this.grid.height)
      return false;
    if (this.grid.walls.has(`${nx},${ny}`)) return false;
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

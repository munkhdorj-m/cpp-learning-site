// Blockly custom-block definitions + code generation for the Robot Programmer.

import * as Blockly from "blockly";

import type { RobotInstruction } from "./robot-interpreter";

export interface BlockLabels {
  when_run: string;
  forward: string;
  left: string;
  right: string;
  light: string;
  repeat: string;
  repeat_do: string;
  repeat_until: string;
  repeat_until_do: string;
  if_path: string;
  if_path_do: string;
  while_path: string;
  while_path_do: string;
  cat_actions: string;
  cat_control: string;
}

/**
 * Re-registers all blocks every call. Cheap and lets language switches
 * update labels — defineBlocksWithJsonArray overwrites existing entries.
 */
export function registerRobotBlocks(labels: BlockLabels) {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "when_run",
      message0: labels.when_run,
      nextStatement: null,
      colour: "#475569",
      tooltip: "",
      helpUrl: "",
      // No deletion — this is the start block
    },
    {
      type: "move_forward",
      message0: `↑  ${labels.forward}`,
      previousStatement: null,
      nextStatement: null,
      colour: "#8b5cf6",
    },
    {
      type: "turn_left",
      message0: `↺  ${labels.left}`,
      previousStatement: null,
      nextStatement: null,
      colour: "#0ea5e9",
    },
    {
      type: "turn_right",
      message0: `↻  ${labels.right}`,
      previousStatement: null,
      nextStatement: null,
      colour: "#f59e0b",
    },
    {
      type: "light",
      message0: `💡 ${labels.light}`,
      previousStatement: null,
      nextStatement: null,
      colour: "#10b981",
    },
    {
      type: "repeat",
      message0: `${labels.repeat} %1\n${labels.repeat_do} %2`,
      args0: [
        {
          type: "field_number",
          name: "COUNT",
          value: 3,
          min: 1,
          max: 20,
          precision: 1,
        },
        { type: "input_statement", name: "DO" },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#ec4899",
    },
    {
      type: "repeat_until_target",
      message0: `${labels.repeat_until}\n${labels.repeat_until_do} %1`,
      args0: [{ type: "input_statement", name: "DO" }],
      previousStatement: null,
      nextStatement: null,
      colour: "#ec4899",
    },
    {
      type: "if_path_ahead",
      message0: `${labels.if_path}\n${labels.if_path_do} %1`,
      args0: [{ type: "input_statement", name: "DO" }],
      previousStatement: null,
      nextStatement: null,
      colour: "#ef4444",
    },
    {
      type: "while_path_ahead",
      message0: `${labels.while_path}\n${labels.while_path_do} %1`,
      args0: [{ type: "input_statement", name: "DO" }],
      previousStatement: null,
      nextStatement: null,
      colour: "#d946ef",
    },
  ]);
}

/** Toolbox JSON limited to the blocks the level allows. */
export type ToolboxBlock =
  | "move_forward"
  | "turn_left"
  | "turn_right"
  | "light"
  | "repeat"
  | "repeat_until_target"
  | "if_path_ahead"
  | "while_path_ahead";

/**
 * Single-column flyout toolbox (Code.org-style). Shows every allowed block
 * directly without a category sidebar.
 */
export function buildToolbox(allowed: ToolboxBlock[], _labels: BlockLabels) {
  const order: ToolboxBlock[] = [
    "move_forward",
    "turn_left",
    "turn_right",
    "light",
    "repeat",
    "repeat_until_target",
    "if_path_ahead",
    "while_path_ahead",
  ];
  return {
    kind: "flyoutToolbox",
    contents: order
      .filter((b) => allowed.includes(b))
      .map((type) => ({ kind: "block", type })),
  } as const;
}

/** XML that creates a single When-Run hat block at the top of an empty workspace. */
export const STARTER_WORKSPACE_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="when_run" deletable="false" movable="false" x="20" y="20"></block>
</xml>`;

/** Walk the workspace; return the program rooted at "when_run". */
export function workspaceToProgram(
  workspace: Blockly.Workspace,
): RobotInstruction[] {
  const start = workspace.getTopBlocks(true).find((b) => b.type === "when_run");
  if (!start) return [];
  return blocksToInstructions(start.getNextBlock());
}

function blocksToInstructions(block: Blockly.Block | null): RobotInstruction[] {
  const out: RobotInstruction[] = [];
  let cur: Blockly.Block | null = block;
  while (cur) {
    const node = blockToInstruction(cur);
    if (node) out.push(node);
    cur = cur.getNextBlock();
  }
  return out;
}

function blockToInstruction(block: Blockly.Block): RobotInstruction | null {
  switch (block.type) {
    case "move_forward":
      return { type: "forward" };
    case "turn_left":
      return { type: "left" };
    case "turn_right":
      return { type: "right" };
    case "light":
      return { type: "light" };
    case "repeat": {
      const count = Math.max(
        0,
        Math.min(20, Number(block.getFieldValue("COUNT")) || 0),
      );
      const body = blocksToInstructions(block.getInputTargetBlock("DO"));
      return { type: "repeat", count, body };
    }
    case "if_path_ahead": {
      const body = blocksToInstructions(block.getInputTargetBlock("DO"));
      return { type: "if_path_ahead", body };
    }
    case "repeat_until_target": {
      const body = blocksToInstructions(block.getInputTargetBlock("DO"));
      return { type: "repeat_until_target", body };
    }
    case "while_path_ahead": {
      const body = blocksToInstructions(block.getInputTargetBlock("DO"));
      return { type: "while_path_ahead", body };
    }
    default:
      return null;
  }
}

/** Count primitive instructions in a program (for the "short solution" badge). */
export function countPrimitives(program: RobotInstruction[]): number {
  let n = 0;
  for (const node of program) {
    if (
      node.type === "forward" ||
      node.type === "left" ||
      node.type === "right" ||
      node.type === "light"
    ) {
      n++;
    } else if (node.type === "repeat") {
      n += node.count * countPrimitives(node.body);
    } else if (
      node.type === "if_path_ahead" ||
      node.type === "while_path_ahead" ||
      node.type === "repeat_until_target"
    ) {
      n += countPrimitives(node.body);
    }
  }
  return n;
}

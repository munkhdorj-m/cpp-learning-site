"use client";

import * as Blockly from "blockly";
import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

import {
  buildToolbox,
  registerRobotBlocks,
  STARTER_WORKSPACE_XML,
  workspaceToProgram,
  type BlockLabels,
  type ToolboxBlock,
} from "@/lib/robot-blocks";
import type { RobotInstruction } from "@/lib/robot-interpreter";

export interface BlocklyWorkspaceHandle {
  getProgram: () => RobotInstruction[];
  highlightBlock: (id: string | null) => void;
  clear: () => void;
}

interface Props {
  allowed: ToolboxBlock[];
  labels: BlockLabels;
  /** Unique key — when this changes, the workspace is reset. */
  levelKey: string;
  onChange?: (program: RobotInstruction[]) => void;
  /** Called with the current block count whenever it changes. */
  onBlockCount?: (count: number) => void;
  readOnly?: boolean;
  /** Maximum blocks (including the `when_run` hat) allowed in the workspace. */
  maxBlocks?: number;
}

export const BlocklyWorkspace = forwardRef<BlocklyWorkspaceHandle, Props>(
  function BlocklyWorkspace(
    { allowed, labels, levelKey, onChange, onBlockCount, readOnly, maxBlocks },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

    useImperativeHandle(ref, () => ({
      getProgram: () => {
        if (!workspaceRef.current) return [];
        return workspaceToProgram(workspaceRef.current);
      },
      highlightBlock: (id: string | null) => {
        workspaceRef.current?.highlightBlock(id);
      },
      clear: () => {
        if (!workspaceRef.current) return;
        workspaceRef.current.clear();
        const dom = Blockly.utils.xml.textToDom(STARTER_WORKSPACE_XML);
        Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
      },
    }));

    // Re-build workspace whenever level or allowed blocks change
    useEffect(() => {
      if (!containerRef.current) return;
      registerRobotBlocks(labels);

      const toolbox = buildToolbox(allowed, labels);

      const workspace = Blockly.inject(containerRef.current, {
        toolbox,
        trashcan: true,
        readOnly,
        scrollbars: true,
        sounds: false,
        maxBlocks: maxBlocks ?? Infinity,
        grid: {
          spacing: 20,
          length: 3,
          colour: "rgba(139, 92, 246, 0.18)",
          snap: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 1.4,
          minScale: 0.6,
          scaleSpeed: 1.1,
        },
        renderer: "zelos",
        theme: Blockly.Themes.Zelos,
      });

      workspaceRef.current = workspace;

      // Load saved state or starter
      const saved =
        typeof window !== "undefined"
          ? window.localStorage.getItem(`robot-workspace:${levelKey}`)
          : null;
      const xmlText = saved && saved.length > 30 ? saved : STARTER_WORKSPACE_XML;
      try {
        const dom = Blockly.utils.xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(dom, workspace);
      } catch {
        const dom = Blockly.utils.xml.textToDom(STARTER_WORKSPACE_XML);
        Blockly.Xml.domToWorkspace(dom, workspace);
      }

      // Persist on every change + notify parent
      const listener = () => {
        if (workspace.isDragging()) return;
        try {
          const dom = Blockly.Xml.workspaceToDom(workspace);
          const text = Blockly.Xml.domToText(dom);
          window.localStorage.setItem(`robot-workspace:${levelKey}`, text);
        } catch {
          // noop
        }
        onChange?.(workspaceToProgram(workspace));
        onBlockCount?.(workspace.getAllBlocks(false).length);
      };
      workspace.addChangeListener(listener);

      // initial program emit
      onChange?.(workspaceToProgram(workspace));
      onBlockCount?.(workspace.getAllBlocks(false).length);

      // Resize observer so Blockly re-flows when its container resizes
      const ro = new ResizeObserver(() => {
        Blockly.svgResize(workspace);
      });
      ro.observe(containerRef.current);

      return () => {
        ro.disconnect();
        workspace.removeChangeListener(listener);
        workspace.dispose();
        workspaceRef.current = null;
      };
      // Including a serialised view of labels so a language flip rebuilds
      // the workspace with the new block strings. localStorage preserves
      // the student's block layout across the rebuild.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      levelKey,
      allowed.join(","),
      readOnly,
      maxBlocks,
      Object.values(labels).join("|"),
    ]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border bg-white dark:bg-slate-900"
      />
    );
  },
);

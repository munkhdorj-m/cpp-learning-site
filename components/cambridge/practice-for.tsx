"use client";

import { BinaryPractice } from "./binary-practice";
import { LogicPractice } from "./logic-practice";
import { TraceTable } from "./trace-table";
import { FileSizePractice } from "./file-size-practice";
import { StepOrder, type Sequence } from "./step-order";
import { SqlPractice } from "./sql-practice";
import { ParityPractice } from "./parity-practice";

/**
 * Which hands-on practice belongs on which topic.
 *
 * Kept as one map rather than a row of `slug === "…" && <Widget/>` tests in the
 * page, so adding practice to a topic is a one-line change and it is obvious
 * at a glance which topics still have none.
 */

const FETCH_EXECUTE: Sequence = {
  title: "Fetch–execute cycle",
  steps: [
    "The address in the PC is copied into the MAR",
    "The PC is incremented by 1",
    "The instruction at that address is fetched into the MDR",
    "The instruction is copied from the MDR into the CIR",
    "The instruction in the CIR is decoded",
    "The decoded instruction is executed",
  ],
  note: "This repeats for every single instruction a processor runs.",
};

const TRANSLATION: Sequence = {
  title: "Source code → running program",
  steps: [
    "The programmer writes source code in a high-level language",
    "The source code is checked for syntax errors",
    "The translator produces object code",
    "The linker adds in any library code that was used",
    "The loader places the executable into main memory",
    "The processor runs the executable",
  ],
};

const PACKET: Sequence = {
  title: "Packet switching",
  steps: [
    "The data is split into equally sized packets",
    "Each packet is given a header with its destination and sequence number",
    "Each packet is routed independently across the network",
    "Packets arrive at the destination, possibly out of order",
    "The packets are reassembled using their sequence numbers",
    "Any missing packets are requested again",
  ],
};

const LIFECYCLE: Sequence = {
  title: "Program development cycle",
  steps: [
    "Analysis — work out exactly what the program must do",
    "Design — plan the solution with flowcharts or pseudocode",
    "Coding — write the program in a programming language",
    "Testing — run it with normal, boundary and erroneous data",
    "Maintenance — fix faults and adapt it as needs change",
  ],
};

const WIDGETS: Record<string, () => React.ReactNode> = {
  // ── Data representation ────────────────────────────────────────────────
  "number-systems": () => <BinaryPractice />,
  "information-representation": () => <BinaryPractice />,
  "data-representation-a": () => <BinaryPractice />,
  "text-sound-images": () => <FileSizePractice />,
  "storage-compression": () => <FileSizePractice />,
  "data-storage": () => <FileSizePractice />,

  // ── Logic ──────────────────────────────────────────────────────────────
  "boolean-logic": () => <LogicPractice />,
  "hardware-as": () => <LogicPractice />,

  // ── Error checking ─────────────────────────────────────────────────────
  "error-detection": () => <ParityPractice />,

  // ── Sequences ──────────────────────────────────────────────────────────
  "computer-architecture": () => <StepOrder sequences={[FETCH_EXECUTE]} />,
  "processor-fundamentals": () => <StepOrder sequences={[FETCH_EXECUTE]} />,
  "hardware-virtual-machines": () => <StepOrder sequences={[TRANSLATION]} />,
  "languages-translators": () => <StepOrder sequences={[TRANSLATION]} />,
  "data-transmission": () => <StepOrder sequences={[PACKET]} />,
  communication: () => <StepOrder sequences={[PACKET]} />,
  "communication-a": () => <StepOrder sequences={[PACKET]} />,
  "program-development": () => <StepOrder sequences={[LIFECYCLE]} />,
  "software-development": () => <StepOrder sequences={[LIFECYCLE, TRANSLATION]} />,

  // ── Tracing an algorithm ───────────────────────────────────────────────
  pseudocode: () => <TraceTable />,
  "programming-concepts": () => <TraceTable />,
  "algorithm-design": () => <TraceTable />,
  "computational-thinking": () => <TraceTable />,
  decomposition: () => <TraceTable />,
  "programming-as": () => <TraceTable />,
  arrays: () => <TraceTable />,
  "data-types-structures": () => <TraceTable />,

  // ── Databases ──────────────────────────────────────────────────────────
  databases: () => <SqlPractice />,
  "databases-as": () => <SqlPractice />,
};

export function PracticeFor({ slug }: { slug: string }) {
  const widget = WIDGETS[slug];
  return widget ? <>{widget()}</> : null;
}

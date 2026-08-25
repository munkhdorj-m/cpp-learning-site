"use client";

import { BinaryPractice } from "./binary-practice";
import { LogicPractice } from "./logic-practice";
import { TraceTable } from "./trace-table";
import { PseudocodeRunner } from "./pseudocode-runner";
import { FileSizePractice } from "./file-size-practice";
import { StepOrder, type Sequence } from "./step-order";
import { SqlPractice } from "./sql-practice";
import { ParityPractice } from "./parity-practice";
import { CipherPractice } from "./cipher-practice";
import { MatchUp } from "./match-up";
import {
  AI_TERMS,
  CYBER_THREATS,
  DEVICE_KINDS,
  ETHICS,
  EXPERT_SYSTEM,
  NETWORK_HARDWARE,
  OS_TASKS,
  SECURITY_MEASURES,
  SENSORS,
  SOFTWARE_KINDS,
} from "@/lib/cambridge/match-sets";

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

const DNS: Sequence = {
  title: "Finding a website",
  steps: [
    "The user types a URL into the browser",
    "The browser asks a DNS server for the IP address of that domain",
    "If that DNS server does not know it, it asks another DNS server",
    "The IP address is sent back to the browser",
    "The browser sends a request to the web server at that IP address",
    "The web server returns the page and the browser renders it",
  ],
  note: "The domain name is only for humans — the request itself needs the IP address.",
};

const BLOCKCHAIN: Sequence = {
  title: "A blockchain transaction",
  steps: [
    "A transaction is requested and broadcast to the network",
    "The network of computers validates the transaction",
    "The verified transaction is grouped with others into a block",
    "The block is given a hash, along with the hash of the previous block",
    "The block is added to the end of the chain",
    "Every copy of the chain across the network is updated",
  ],
  note: "Each block storing the previous block's hash is what makes tampering obvious.",
};

const INTERRUPT: Sequence = {
  title: "Handling an interrupt",
  steps: [
    "A device sends an interrupt signal to the processor",
    "The processor finishes the instruction it is currently executing",
    "The contents of the registers are pushed onto the stack",
    "The interrupt service routine for that device is run",
    "The saved register contents are popped back off the stack",
    "The interrupted program carries on from where it stopped",
  ],
  note: "Saving the registers first is what lets the original program resume as if nothing happened.",
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

  // ── Error checking and encryption ──────────────────────────────────────
  "error-detection": () => <ParityPractice />,
  "encryption-igcse": () => <CipherPractice />,
  "security-a": () => <CipherPractice />,

  // ── Definitions worth being able to produce, not just recognise ────────
  "input-output-devices": () => <MatchUp sets={[DEVICE_KINDS]} />,
  "software-types": () => <MatchUp sets={[SOFTWARE_KINDS]} />,
  "network-hardware": () => <MatchUp sets={[NETWORK_HARDWARE]} />,
  "cyber-security": () => <MatchUp sets={[CYBER_THREATS, SECURITY_MEASURES]} />,
  "security-privacy": () => <MatchUp sets={[SECURITY_MEASURES, CYBER_THREATS]} />,
  "automated-systems": () => <MatchUp sets={[SENSORS]} />,
  robotics: () => <MatchUp sets={[SENSORS]} />,
  "system-software-as": () => (
    <div className="space-y-3">
      <MatchUp sets={[OS_TASKS]} />
      <StepOrder sequences={[INTERRUPT]} />
    </div>
  ),
  "system-software-a": () => (
    <div className="space-y-3">
      <MatchUp sets={[OS_TASKS]} />
      <StepOrder sequences={[INTERRUPT]} />
    </div>
  ),
  ethics: () => <MatchUp sets={[ETHICS]} />,
  "artificial-intelligence-igcse": () => <MatchUp sets={[AI_TERMS, EXPERT_SYSTEM]} />,
  "artificial-intelligence": () => <MatchUp sets={[EXPERT_SYSTEM, AI_TERMS]} />,

  // ── Sequences ──────────────────────────────────────────────────────────
  "computer-architecture": () => <StepOrder sequences={[FETCH_EXECUTE]} />,
  "processor-fundamentals": () => (
    <StepOrder sequences={[FETCH_EXECUTE, INTERRUPT]} />
  ),
  "hardware-virtual-machines": () => <StepOrder sequences={[TRANSLATION]} />,
  "languages-translators": () => <StepOrder sequences={[TRANSLATION]} />,
  "data-transmission": () => <StepOrder sequences={[PACKET]} />,
  communication: () => <StepOrder sequences={[PACKET, DNS]} />,
  "communication-a": () => <StepOrder sequences={[PACKET, DNS]} />,
  "internet-www": () => <StepOrder sequences={[DNS]} />,
  "digital-currency": () => <StepOrder sequences={[BLOCKCHAIN]} />,
  "program-development": () => <StepOrder sequences={[LIFECYCLE]} />,
  "software-development": () => <StepOrder sequences={[LIFECYCLE, TRANSLATION]} />,

  // ── Tracing an algorithm ───────────────────────────────────────────────
  pseudocode: () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),
  "programming-concepts": () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),
  "algorithm-design": () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),
  "computational-thinking": () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),
  decomposition: () => <TraceTable />,
  "programming-as": () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),
  arrays: () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),
  "data-types-structures": () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),
  "file-handling": () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),
  "further-programming": () => (
    <>
      <PseudocodeRunner />
      <TraceTable />
    </>
  ),

  // ── Databases ──────────────────────────────────────────────────────────
  databases: () => <SqlPractice />,
  "databases-as": () => <SqlPractice />,
};

export function PracticeFor({ slug }: { slug: string }) {
  const widget = WIDGETS[slug];
  return widget ? <>{widget()}</> : null;
}

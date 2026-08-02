// AS Level Computer Science 9618 — sections 1 to 12.
// Papers 1 (Theory Fundamentals) and 2 (Problem-solving and Programming).

import type { Topic } from "./types";

const P1 = "Paper 1 — Theory Fundamentals";
const P2 = "Paper 2 — Problem-solving and Programming";

export const AS_TOPICS: Topic[] = [
  {
    slug: "information-representation",
    level: "as",
    unit: P1,
    ref: "1",
    title: "Information Representation",
    summary:
      "Number bases, negative numbers, characters, images and sound — the AS-level treatment.",
    objectives: [
      "Convert between binary, denary, hexadecimal and binary coded decimal (BCD).",
      "Represent negative integers using two's complement.",
      "Add and subtract binary integers.",
      "Explain the use of ASCII and Unicode character sets.",
      "Describe bitmap and vector graphics and when each is appropriate.",
      "Describe how sound is sampled and stored, and the effect of sample rate and resolution.",
      "Explain lossless and lossy compression for text, image and sound.",
    ],
    terms: [
      {
        term: "Two's complement",
        def: "The standard way of storing negative numbers: invert all bits then add 1.",
      },
      {
        term: "BCD",
        def: "Binary coded decimal — each denary digit stored separately in 4 bits.",
      },
      {
        term: "Vector graphic",
        def: "An image stored as drawing instructions and properties rather than pixels.",
      },
    ],
    notes: [
      {
        heading: "Two's complement, and why it is clever",
        body: "To make a number negative: invert every bit, then add 1. The leftmost bit becomes the sign bit — 1 means negative. The beauty is that subtraction becomes addition, so the processor needs only one circuit.",
        code: ` 5  = 0000 0101
invert  1111 1010
add 1   1111 1011  = -5

8 - 5 is done as 8 + (-5):
   0000 1000
 + 1111 1011
 ------------
 1 0000 0011      carry off the end is discarded
                  answer 0000 0011 = 3`,
      },
      {
        heading: "Range of an 8-bit two's complement number",
        body: "One bit is the sign, so the range is −128 to +127. Note it is not symmetrical — there is one more negative value than positive, because zero takes a positive slot.",
      },
      {
        heading: "BCD, and where it is used",
        body: "Each denary digit is stored in its own 4 bits, so 59 is 0101 1001. It wastes space and is awkward for arithmetic, but converting to a display is trivial — which is why it is used in digital clocks, calculators and money systems where exact decimal values matter.",
      },
      {
        heading: "Bitmap vs vector",
        body: "Bitmap stores every pixel, so it handles photographs but becomes blocky when enlarged and the file grows with resolution. Vector stores shapes as instructions, so it scales to any size with no loss and stays small — but it cannot represent a photograph.",
      },
    ],
    examTips: [
      "State whether a two's complement answer overflowed: if two positives give a negative (or vice versa), it did.",
      "'Why Unicode over ASCII' — ASCII's 128 characters cannot represent most world languages or emoji.",
    ],
  },
  {
    slug: "communication",
    level: "as",
    unit: P1,
    ref: "2",
    title: "Communication",
    summary: "Networks: their shapes, hardware, and how the internet is run.",
    objectives: [
      "Describe LAN, WAN, client-server and peer-to-peer models.",
      "Describe the hardware needed for a network: NIC, switch, router, WAP, cables.",
      "Describe bus, star, mesh and hybrid topologies.",
      "Compare wired and wireless connections.",
      "Explain the purpose of the internet, IP addressing, DNS and URLs.",
      "Explain the role of a router in packet switching.",
    ],
    notes: [
      {
        heading: "Client-server vs peer-to-peer",
        body: "Client-server has a central server that holds files and controls access — easier to back up and secure, but the server is a single point of failure and costs money. Peer-to-peer has every machine acting as both client and server — cheap and resilient, but harder to secure and back up.",
      },
      {
        heading: "Topologies at a glance",
        body: "Bus: one backbone cable — cheap but a break kills the whole network. Star: every device to a central switch — reliable and fast, but needs more cable and depends on the switch. Mesh: many redundant paths — extremely reliable but expensive. Hybrid: a mixture, used by most real networks.",
      },
      {
        heading: "How a domain name becomes a page",
        body: "You type a URL. The browser asks a DNS server for the IP address that matches the domain. If that server does not know, it asks another up the hierarchy. The IP comes back, the browser requests the page from that IP, and the server returns the HTML.",
      },
    ],
  },
  {
    slug: "hardware-as",
    level: "as",
    unit: P1,
    ref: "3",
    title: "Hardware",
    summary:
      "Logic gates and circuits, main memory, and the devices attached to a computer.",
    objectives: [
      "Use the gates NOT, AND, OR, NAND, NOR and XOR, and produce truth tables.",
      "Produce a logic circuit from a problem statement or expression.",
      "Simplify a logic circuit using Boolean algebra and Karnaugh maps.",
      "Describe RAM (SRAM and DRAM) and ROM (PROM, EPROM, EEPROM).",
      "Describe primary, secondary and off-line storage.",
      "Describe monitors, printers, storage devices and their uses.",
    ],
    notes: [
      {
        heading: "Boolean identities worth memorising",
        body: "These let you simplify a circuit quickly, which is what the marks are for.",
        code: `A + 0 = A          A · 1 = A
A + 1 = 1          A · 0 = 0
A + A = A          A · A = A
A + A' = 1         A · A' = 0
(A')' = A

De Morgan:  (A · B)' = A' + B'
            (A + B)' = A' · B'`,
      },
      {
        heading: "Karnaugh maps",
        body: "Write the outputs into a grid arranged so that neighbouring cells differ by only one variable (00, 01, 11, 10 — note the order). Then group the 1s into the largest possible rectangles of 1, 2, 4 or 8. Each group becomes a term, and any variable that changes within the group drops out.",
      },
      {
        heading: "SRAM vs DRAM",
        body: "SRAM uses flip-flops, is fast, needs no refreshing, but is expensive and bulky — so it is used for cache. DRAM uses capacitors that leak, so it must be refreshed thousands of times a second; it is slower but cheap and dense — so it is used for main memory.",
      },
    ],
  },
  {
    slug: "processor-fundamentals",
    level: "as",
    unit: P1,
    ref: "4",
    title: "Processor Fundamentals",
    summary:
      "Inside the CPU: registers, buses, the fetch-execute cycle written formally, and assembly language.",
    objectives: [
      "Describe the von Neumann model and the purpose of each register.",
      "Describe the address, data and control buses.",
      "Describe the fetch–execute cycle using register transfer notation.",
      "Explain the effect of interrupts on the cycle.",
      "Describe assembly language instructions and addressing modes.",
      "Trace a simple assembly language program.",
    ],
    notes: [
      {
        heading: "The fetch–execute cycle in register transfer notation",
        body: "AS asks for this formally. Learn the notation: square brackets mean 'the contents of'.",
        code: `MAR ← [PC]          address of next instruction
PC  ← [PC] + 1      point at the one after
MDR ← [[MAR]]       fetch what is AT that address
CIR ← [MDR]         move it to the instruction register
                    decode, then execute`,
      },
      {
        heading: "Bus widths decide the limits",
        body: "The address bus width sets how much memory can be addressed: n lines gives 2ⁿ locations, so 16 lines addresses 65 536 locations. The data bus width sets how many bits move at once. The address bus is one-way from the CPU; the data and control buses are two-way.",
      },
      {
        heading: "Addressing modes",
        body: "Immediate: the operand IS the value. Direct: the operand is the address holding the value. Indirect: the operand is the address of an address. Indexed: the address plus the contents of an index register — used for stepping through an array.",
        code: `LDM #20     immediate  -> load the number 20
LDD 20      direct     -> load what is stored at address 20
LDI 20      indirect   -> address 20 holds another address
LDX 20      indexed    -> address 20 + index register`,
      },
      {
        heading: "Interrupts",
        body: "At the END of each fetch-execute cycle the processor checks for an interrupt. If one is flagged, the current register contents are pushed onto a stack, the interrupt service routine runs, and then the contents are popped back so work continues exactly where it stopped.",
      },
    ],
  },
  {
    slug: "system-software-as",
    level: "as",
    unit: P1,
    ref: "5",
    title: "System Software",
    summary:
      "The operating system's jobs, utilities, and how programs get translated.",
    objectives: [
      "Describe the main tasks of an operating system.",
      "Explain memory management, file management, process and hardware management.",
      "Describe utility software: disk defragmenter, backup, formatting, virus checker.",
      "Explain program libraries and DLLs.",
      "Compare interpreters, compilers and assemblers.",
      "Explain the stages of compilation.",
    ],
    notes: [
      {
        heading: "Memory management",
        body: "The OS decides which processes are in memory, keeps them from overwriting each other, and moves pages between RAM and disk when RAM is full. Paging splits memory into fixed-size pages; segmentation splits it into variable-size logical sections.",
      },
      {
        heading: "The stages of compilation",
        body: "Four stages, in order — a common exam question.",
        code: `1. Lexical analysis   – strip comments/whitespace,
                        turn code into tokens
2. Syntax analysis    – check the grammar,
                        build a parse tree, report errors
3. Code generation    – produce object code
4. Optimisation       – make it smaller/faster`,
      },
      {
        heading: "Why a DLL",
        body: "A dynamic link library is only loaded when needed and is shared by several programs. That keeps executables smaller and means a fix to the library benefits every program — but a missing or wrong version of the DLL breaks them all.",
      },
    ],
  },
  {
    slug: "security-privacy",
    level: "as",
    unit: P1,
    ref: "6",
    title: "Security, Privacy and Data Integrity",
    summary:
      "Keeping data safe from people who should not see it, and from being corrupted.",
    objectives: [
      "Distinguish data security, data privacy and data integrity.",
      "Describe threats and the measures that protect against them.",
      "Describe validation and verification, and give examples of each.",
      "Explain the purpose of a firewall, authentication and access rights.",
      "Explain backup and disaster recovery.",
    ],
    notes: [
      {
        heading: "Three words that are not the same",
        body: "Security: stopping unauthorised ACCESS. Privacy: controlling who is ALLOWED to see data and what they may do with it. Integrity: keeping data ACCURATE and uncorrupted. A question naming one of these wants that specific answer.",
      },
      {
        heading: "Validation checks you must be able to name",
        body: "Range, format, length, presence, type, check digit, lookup. Give the check AND an example that would fail it.",
      },
      {
        heading: "Verification during data entry and transfer",
        body: "On entry: double entry, or a visual check by a human. On transfer: parity check, checksum, or a hash comparison. Note that verification during entry and during transfer are different situations — read which the question asks for.",
      },
    ],
  },
  {
    slug: "ethics",
    level: "as",
    unit: P1,
    ref: "7",
    title: "Ethics and Ownership",
    summary:
      "The rules and responsibilities that come with writing software and handling other people's data.",
    objectives: [
      "Explain the need for ethics in computing.",
      "Describe the responsibilities in a professional code of conduct.",
      "Explain copyright and the ownership of software and data.",
      "Describe types of software licensing: free, freeware, shareware, open source, commercial.",
      "Discuss the effects of computer use on society and employment.",
    ],
    notes: [
      {
        heading: "Licence types, clearly separated",
        body: "These are frequently confused. Free software: freedom to run, study, change and share. Open source: the source code is published and may be modified, subject to the licence. Freeware: free to use but the source is closed and it may not be modified. Shareware: free to try for a period, then payment is required. Commercial: paid, closed source, restricted by the licence agreement.",
      },
      {
        heading: "A professional code of conduct",
        body: "Act in the public interest, be honest about your competence, keep your skills up to date, respect confidentiality, avoid conflicts of interest, and do not claim work that is not yours.",
      },
    ],
  },
  {
    slug: "databases-as",
    level: "as",
    unit: P1,
    ref: "8",
    title: "Databases",
    summary:
      "Why a DBMS beats loose files, how to design tables properly, and SQL across several tables.",
    objectives: [
      "Explain the limitations of a file-based approach.",
      "Describe the features of a DBMS: data dictionary, DDL, DML, query processor.",
      "Explain primary, candidate, secondary, foreign and composite keys.",
      "Explain referential integrity.",
      "Normalise a design to 1NF, 2NF and 3NF.",
      "Draw an entity-relationship diagram.",
      "Write SQL (DDL and DML) for multiple tables.",
    ],
    notes: [
      {
        heading: "Problems with file-based storage",
        body: "Data duplication, data inconsistency when one copy is updated and another is not, no enforced integrity, difficulty sharing between programs, and every program needing to know the file format. A DBMS solves all of these centrally.",
      },
      {
        heading: "The three normal forms, one line each",
        body: "1NF: no repeating groups — every field holds a single atomic value. 2NF: in 1NF, and every non-key field depends on the WHOLE primary key (this only bites with composite keys). 3NF: in 2NF, and no non-key field depends on another non-key field.",
        code: `Not 1NF:  Student(ID, Name, Subject1, Subject2, Subject3)
1NF:      Student(ID, Name)
          Takes(ID, Subject)

Not 3NF:  Order(OrderID, CustomerID, CustomerName)
          CustomerName depends on CustomerID, not OrderID
3NF:      Order(OrderID, CustomerID)
          Customer(CustomerID, CustomerName)`,
      },
      {
        heading: "DDL vs DML",
        body: "DDL defines the structure. DML works with the data inside it. Questions often specify which is wanted, so read carefully.",
        code: `-- DDL
CREATE TABLE Student (
   StudentID INTEGER PRIMARY KEY,
   Name      VARCHAR(30) NOT NULL,
   ClassID   INTEGER,
   FOREIGN KEY (ClassID) REFERENCES Class(ClassID)
);
ALTER TABLE Student ADD Email VARCHAR(50);

-- DML
INSERT INTO Student VALUES (1, 'Bat', 7);
UPDATE Student SET Name = 'Bataa' WHERE StudentID = 1;
DELETE FROM Student WHERE StudentID = 1;

SELECT S.Name, C.ClassName
FROM   Student S, Class C
WHERE  S.ClassID = C.ClassID
ORDER  BY S.Name;`,
      },
      {
        heading: "Referential integrity",
        body: "A foreign key must either match an existing primary key in the other table, or be empty. It stops you creating an order for a customer who does not exist, or deleting a customer who still has orders.",
      },
    ],
  },
  {
    slug: "algorithm-design",
    level: "as",
    unit: P2,
    ref: "9",
    title: "Algorithm Design and Problem-solving",
    summary:
      "Turning a problem into a plan: decomposition, structure charts, pseudocode and testing.",
    objectives: [
      "Use abstraction, decomposition and stepwise refinement.",
      "Produce structure charts, flowcharts and pseudocode.",
      "Write algorithms using the standard patterns (totalling, counting, max, min).",
      "Perform a linear search, a binary search, a bubble sort and an insertion sort.",
      "Produce and complete trace tables.",
      "Identify and correct logic errors.",
    ],
    notes: [
      {
        heading: "Binary search — and its one condition",
        body: "Binary search only works on SORTED data. Say that whenever you describe it. Each comparison halves the search space, so it is far faster than linear search on large data.",
        code: `Low ← 1
High ← N
Found ← FALSE
WHILE Low <= High AND Found = FALSE DO
   Mid ← (Low + High) DIV 2
   IF A[Mid] = Target THEN
      Found ← TRUE
   ELSE
      IF A[Mid] < Target THEN
         Low ← Mid + 1
      ELSE
         High ← Mid - 1
      ENDIF
   ENDIF
ENDWHILE`,
      },
      {
        heading: "Insertion sort vs bubble sort",
        body: "Bubble sort repeatedly swaps neighbours, so the biggest value bubbles to the end each pass. Insertion sort takes each element and slides it back into its correct place among those already sorted — it is generally faster on nearly-sorted data.",
        code: `FOR i ← 2 TO N
   Key ← A[i]
   j ← i - 1
   WHILE j > 0 AND A[j] > Key DO
      A[j+1] ← A[j]
      j ← j - 1
   ENDWHILE
   A[j+1] ← Key
NEXT i`,
      },
      {
        heading: "Stepwise refinement",
        body: "Start with the whole task in one line, then break each line into smaller steps, and repeat until every step is small enough to code directly. A structure chart shows the same idea as a diagram, with parameters passed between boxes.",
      },
    ],
  },
  {
    slug: "data-types-structures",
    level: "as",
    unit: P2,
    ref: "10",
    title: "Data Types and Structures",
    summary:
      "Choosing the right container: simple types, records, arrays and files.",
    objectives: [
      "Select appropriate data types: integer, real, char, string, Boolean, date.",
      "Define and use records (user-defined types).",
      "Use 1D and 2D arrays, and explain when each is suitable.",
      "Understand serial, sequential and random file organisation.",
      "Read from and write to text and binary files.",
    ],
    notes: [
      {
        heading: "Records group related fields",
        body: "A record lets one variable hold several different types that belong together — far clearer than parallel arrays.",
        code: `TYPE Student
   DECLARE Name  : STRING
   DECLARE Age   : INTEGER
   DECLARE Grade : CHAR
ENDTYPE

DECLARE Class : ARRAY[1:30] OF Student

Class[1].Name ← "Bat"
Class[1].Age  ← 14`,
      },
      {
        heading: "File organisation",
        body: "Serial: records in the order they arrived, no order — used for transaction logs. Sequential: records kept in key order — good for processing everything in order. Random (direct): the position is calculated from the key, so any record can be reached immediately — used when fast individual lookups matter.",
      },
    ],
  },
  {
    slug: "programming-as",
    level: "as",
    unit: P2,
    ref: "11",
    title: "Programming",
    summary:
      "Writing real, structured programs: procedures, functions, parameters and scope.",
    objectives: [
      "Write programs using sequence, selection and iteration.",
      "Write and call procedures and functions with parameters.",
      "Explain the difference between passing by value and by reference.",
      "Explain local and global scope.",
      "Use built-in functions for string handling and arithmetic.",
      "Write maintainable code with meaningful names and comments.",
    ],
    notes: [
      {
        heading: "By value or by reference",
        body: "BYVALUE passes a COPY, so changes inside the procedure do not affect the caller's variable. BYREF passes the original, so changes DO affect it. Use BYREF when the procedure must give something back through a parameter.",
        code: `PROCEDURE Double(BYVALUE n : INTEGER)
   n ← n * 2        // caller's variable unchanged
ENDPROCEDURE

PROCEDURE Double(BYREF n : INTEGER)
   n ← n * 2        // caller's variable IS changed
ENDPROCEDURE`,
      },
      {
        heading: "Procedure or function?",
        body: "A FUNCTION returns a value and is used inside an expression: x ← Square(5). A PROCEDURE performs an action and is CALLed on its own line: CALL PrintHeader(). Choosing the wrong one loses marks even if the logic is right.",
      },
      {
        heading: "String handling functions",
        body: "Know the standard ones and that positions usually start at 1 in pseudocode.",
        code: `LENGTH("Hello")        = 5
SUBSTRING("Hello",1,3) = "Hel"
UCASE("hi")            = "HI"
LCASE("HI")            = "hi"`,
      },
    ],
  },
  {
    slug: "software-development",
    level: "as",
    unit: P2,
    ref: "12",
    title: "Software Development",
    summary:
      "How software is built in practice: life cycles, testing strategies and maintenance.",
    objectives: [
      "Describe the stages of the program development life cycle.",
      "Describe the waterfall, iterative and rapid application development models.",
      "Explain corrective, adaptive and perfective maintenance.",
      "Describe testing strategies: dry run, walkthrough, white box, black box, integration, alpha, beta and acceptance testing.",
      "Use a debugger: breakpoints, stepping and variable watches.",
    ],
    notes: [
      {
        heading: "Testing strategies, separated clearly",
        body: "White box tests the internal logic — you design tests to cover every path. Black box tests only inputs and outputs — you ignore how it works inside. Alpha testing is done in-house; beta testing is done by real users outside the company; acceptance testing is the customer deciding whether to accept the delivered system.",
      },
      {
        heading: "Three kinds of maintenance",
        body: "Corrective: fixing bugs found after release. Adaptive: changing the software because the environment changed — new hardware, new law, new OS. Perfective: improving performance or adding features that users asked for.",
      },
      {
        heading: "Waterfall vs iterative",
        body: "Waterfall goes through the stages once, in order — simple to manage, but a mistake found late is expensive and the customer sees nothing until the end. Iterative builds a working version, gets feedback and repeats — changes are cheaper and the customer is involved throughout, but it is harder to plan and cost.",
      },
    ],
  },
];

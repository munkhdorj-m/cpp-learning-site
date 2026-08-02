// Cambridge International Computer Science study material.
//
// Covers the three levels this school teaches:
//   IGCSE   0478 / 0984   (grades 9-10)
//   AS      9618 papers 1-2 (grade 11)
//   A Level 9618 papers 3-4 (grade 12)
//
// Each topic lists what the syllabus expects a student to be able to do,
// the vocabulary examiners use, and worked notes where something is easy to
// get wrong. It is a study companion, not a replacement for the textbook.

export type LevelId = "igcse" | "as" | "a-level";

export interface Level {
  id: LevelId;
  code: string;
  title: string;
  grade: string;
  blurb: string;
  papers: string[];
}

export interface Topic {
  slug: string;
  level: LevelId;
  unit: string;
  title: string;
  /** Syllabus reference, e.g. "1.1". */
  ref: string;
  /** What you must be able to DO — phrased as the syllabus does. */
  objectives: string[];
  /** Vocabulary that shows up in mark schemes. */
  terms?: { term: string; def: string }[];
  /** Worked explanation for the parts students most often lose marks on. */
  notes?: { heading: string; body: string; code?: string }[];
  /** Exam-technique warnings. */
  examTips?: string[];
}

export const LEVELS: Level[] = [
  {
    id: "igcse",
    code: "0478 / 0984",
    title: "IGCSE",
    grade: "Grades 9–10",
    blurb:
      "Computer systems, plus algorithms, programming and logic. Two written papers — there is no coursework.",
    papers: [
      "Paper 1 — Computer Systems (theory)",
      "Paper 2 — Algorithms, Programming and Logic",
    ],
  },
  {
    id: "as",
    code: "9618 (AS)",
    title: "AS Level",
    grade: "Grade 11",
    blurb:
      "The first half of A Level. Deeper theory plus procedural programming and databases.",
    papers: [
      "Paper 1 — Theory Fundamentals",
      "Paper 2 — Fundamental Problem-solving and Programming Skills",
    ],
  },
  {
    id: "a-level",
    code: "9618 (A Level)",
    title: "A Level",
    grade: "Grade 12",
    blurb:
      "Builds on AS: advanced theory, data structures, object-oriented programming and computational thinking.",
    papers: [
      "Paper 3 — Advanced Theory",
      "Paper 4 — Practical",
    ],
  },
];

export const TOPICS: Topic[] = [
  // ───────────────────────── IGCSE ─────────────────────────
  {
    slug: "data-representation",
    level: "igcse",
    unit: "Computer Systems",
    ref: "1.1",
    title: "Data Representation",
    objectives: [
      "Convert between denary, binary and hexadecimal.",
      "Add two binary numbers and identify overflow.",
      "Explain why computers use binary, and why hex is used by people.",
      "Perform a logical binary shift and describe its effect.",
      "Describe how text, sound and images are represented.",
      "Calculate file sizes and explain lossy vs lossless compression.",
    ],
    terms: [
      { term: "Bit / Byte", def: "A bit is one 0 or 1. A byte is 8 bits." },
      {
        term: "Overflow",
        def: "The result of an addition needs more bits than are available, so it cannot be stored correctly.",
      },
      {
        term: "Sample rate",
        def: "How many times per second an analogue sound is measured.",
      },
      {
        term: "Colour depth",
        def: "The number of bits used for each pixel's colour.",
      },
    ],
    notes: [
      {
        heading: "Denary → binary, the reliable way",
        body: "Write the place values, then work left to right taking each one you can. For 200: 128 fits (72 left), 64 fits (8 left), 32 no, 16 no, 8 fits (0 left).",
        code: `128  64  32  16   8   4   2   1
  1   1   0   0   1   0   0   0    = 200`,
      },
      {
        heading: "Hexadecimal is just 4 bits at a time",
        body: "Split the binary into nibbles of 4 from the right and convert each. This is why hex is used to write memory addresses and colour codes — it is shorter and converts back exactly.",
        code: `1100 1000
   C    8      ->  0xC8  = 200`,
      },
      {
        heading: "Binary shifts",
        body: "A left shift of 1 multiplies by 2; a right shift of 1 divides by 2 (whole number). Bits shifted off the end are lost — say so if the question asks about the effect.",
        code: `0000 1010  = 10
left shift 1
0001 0100  = 20`,
      },
      {
        heading: "File size calculations",
        body: "Image: width × height × colour depth. Sound: sample rate × sample resolution × seconds (× 2 for stereo). Give the answer in the unit the question asks for, and show the division by 8 if converting bits to bytes.",
      },
    ],
    examTips: [
      "State the units. A file size without KB/MB usually loses the mark.",
      "For 'why hexadecimal', the answer is about humans — shorter, easier to read and less error-prone than long binary strings.",
      "Lossy removes data permanently (JPEG, MP3); lossless keeps it all (PNG, ZIP). Say which is suitable for what and why.",
    ],
  },
  {
    slug: "data-transmission",
    level: "igcse",
    unit: "Computer Systems",
    ref: "1.2",
    title: "Data Transmission",
    objectives: [
      "Describe how data is broken into packets and what a packet contains.",
      "Compare serial and parallel, simplex, half-duplex and full-duplex.",
      "Explain USB.",
      "Describe parity checks, checksums, echo check and check digits.",
      "Explain automatic repeat requests (ARQ).",
    ],
    terms: [
      {
        term: "Packet",
        def: "A small unit of data with a header (addresses, packet number), the payload, and a trailer (error check).",
      },
      {
        term: "Parity bit",
        def: "An extra bit set so the number of 1s is odd or even, used to spot single-bit errors.",
      },
      {
        term: "Checksum",
        def: "A value calculated from the data, sent with it and recalculated on arrival to check for corruption.",
      },
    ],
    notes: [
      {
        heading: "Why parity is weak",
        body: "Parity only detects an odd number of flipped bits. If two bits flip, the parity still matches and the error is missed — a very common exam question.",
      },
      {
        heading: "Serial vs parallel",
        body: "Serial sends one bit at a time down one wire — reliable over distance. Parallel sends several bits at once — faster over very short distances, but skew makes it unreliable further away.",
      },
    ],
    examTips: [
      "Packet switching: packets can take different routes and may arrive out of order, so they are reassembled using their packet numbers.",
    ],
  },
  {
    slug: "hardware",
    level: "igcse",
    unit: "Computer Systems",
    ref: "1.3",
    title: "Hardware & the CPU",
    objectives: [
      "Describe the von Neumann architecture and the purpose of the ALU, CU and registers.",
      "Describe the fetch–decode–execute cycle.",
      "Explain the role of the MAR, MDR, PC and accumulator.",
      "Compare RAM and ROM, and explain virtual memory.",
      "Describe input, output, primary, secondary and off-line storage.",
    ],
    terms: [
      { term: "MAR", def: "Memory Address Register — holds the address to read from or write to." },
      { term: "MDR", def: "Memory Data Register — holds the data just fetched, or about to be written." },
      { term: "PC", def: "Program Counter — holds the address of the NEXT instruction." },
      { term: "Accumulator", def: "Register that holds the result of calculations in the ALU." },
    ],
    notes: [
      {
        heading: "Fetch–decode–execute, in order",
        body: "Learn this sequence; questions often ask you to put it in order or name the register used at each step.",
        code: `1. PC holds address of next instruction
2. Address copied from PC to MAR
3. Instruction fetched from that address into MDR
4. PC increments (ready for the next one)
5. Instruction decoded by the control unit
6. Instruction executed (ALU if it is a calculation)`,
      },
      {
        heading: "RAM vs ROM",
        body: "RAM is volatile, read/write, holds programs and data currently in use. ROM is non-volatile, read-only, holds the start-up instructions. Volatile means contents are lost when power is off.",
      },
    ],
    examTips: [
      "If asked how to improve performance: bigger/faster RAM, higher clock speed, more cores, larger cache — and say WHY each helps.",
    ],
  },
  {
    slug: "software",
    level: "igcse",
    unit: "Computer Systems",
    ref: "1.4",
    title: "Software",
    objectives: [
      "Distinguish system software from application software.",
      "Describe the roles of an operating system.",
      "Explain interrupts and how they are handled.",
      "Compare compilers and interpreters.",
    ],
    notes: [
      {
        heading: "Compiler vs interpreter",
        body: "A compiler translates the whole program at once and produces an executable; errors are reported together at the end. An interpreter translates and runs one line at a time and stops at the first error — which is why it suits learning and testing.",
      },
      {
        heading: "Interrupts",
        body: "A signal that makes the processor pause what it is doing. The current state is saved onto a stack, the interrupt service routine runs, then the saved state is restored and work continues.",
      },
    ],
  },
  {
    slug: "internet",
    level: "igcse",
    unit: "Computer Systems",
    ref: "1.5",
    title: "The Internet and Cybersecurity",
    objectives: [
      "Distinguish the internet from the World Wide Web.",
      "Describe URLs, HTTP/HTTPS and the role of a web browser.",
      "Explain cookies (session and persistent).",
      "Describe threats: brute-force, data interception, DDoS, hacking, malware, pishing/phishing, pharming, social engineering.",
      "Describe how each threat is prevented.",
    ],
    notes: [
      {
        heading: "Internet vs World Wide Web",
        body: "The internet is the global network of connected computers — the infrastructure. The WWW is the collection of websites and pages accessed using it. The web runs on the internet; they are not the same thing.",
      },
      {
        heading: "Threat → prevention pairs",
        body: "Exams almost always ask for a matching prevention. Phishing → do not click unknown links, use a spam filter. Brute-force → strong passwords, lock after N attempts, two-factor. DDoS → firewall, traffic filtering. Malware → anti-malware, keep software updated.",
      },
    ],
    examTips: [
      "HTTPS: the S is encryption via SSL/TLS. Say the data is encrypted so it is meaningless if intercepted.",
    ],
  },
  {
    slug: "pseudocode",
    level: "igcse",
    unit: "Algorithms & Programming",
    ref: "2.1",
    title: "Cambridge Pseudocode",
    objectives: [
      "Read and write algorithms in the pseudocode Cambridge uses in exams.",
      "Use sequence, selection, iteration, counts and totals.",
      "Draw and read flowcharts.",
      "Complete a trace table for a given algorithm.",
    ],
    notes: [
      {
        heading: "It is not Python — the exam has its own style",
        body: "You must be able to READ and WRITE this exact style. Note the arrow for assignment, the capitalised keywords, and the explicit end of every block.",
        code: `DECLARE Count : INTEGER
DECLARE Name  : STRING

Count ← 0
OUTPUT "What is your name?"
INPUT Name

IF Count > 10 THEN
   OUTPUT "Too many"
ELSE
   OUTPUT "Fine"
ENDIF

FOR i ← 1 TO 10
   OUTPUT i
NEXT i

WHILE Count < 5 DO
   Count ← Count + 1
ENDWHILE

REPEAT
   Count ← Count - 1
UNTIL Count = 0`,
      },
      {
        heading: "Trace tables",
        body: "Make one column per variable plus one for the output. Write a new row every time ANY variable changes. Work through the algorithm mechanically — do not try to predict the answer, because the marks are for the working.",
        code: `Algorithm:  X ← 5
            WHILE X > 2 DO
               X ← X - 1
               OUTPUT X
            ENDWHILE

  X  | OUTPUT
  5  |
  4  | 4
  3  | 3
  2  | 2`,
      },
      {
        heading: "Totalling and counting",
        body: "A total accumulates values (Total ← Total + Number). A count increases by one each time (Count ← Count + 1). Both must be initialised to 0 BEFORE the loop — forgetting that is the most common lost mark.",
      },
    ],
    examTips: [
      "Assignment is ← , not =. Using = for assignment can cost marks.",
      "Always close the block: ENDIF, ENDWHILE, NEXT, ENDPROCEDURE.",
      "Indent inside loops and conditions — examiners look for readable structure.",
    ],
  },
  {
    slug: "programming-concepts",
    level: "igcse",
    unit: "Algorithms & Programming",
    ref: "2.2",
    title: "Programming Concepts",
    objectives: [
      "Use the data types integer, real, char, string and boolean.",
      "Use sequence, selection and iteration.",
      "Use one- and two-dimensional arrays.",
      "Use procedures and functions, with and without parameters.",
      "Read from and write to a text file.",
      "Apply validation and verification checks.",
    ],
    terms: [
      {
        term: "Validation",
        def: "An automatic check that data is sensible: range, length, type, presence, format, check digit.",
      },
      {
        term: "Verification",
        def: "A check that data was entered accurately: double entry, or a visual check.",
      },
    ],
    notes: [
      {
        heading: "Validation is not verification",
        body: "Validation asks 'could this be right?' — a birth year of 3025 fails a range check. Verification asks 'was it typed correctly?' — typing a password twice. Exams frequently test that you know the difference.",
      },
      {
        heading: "Arrays in Cambridge pseudocode",
        body: "Declared with their bounds and type. A 2-D array is indexed [row, column].",
        code: `DECLARE Scores : ARRAY[1:30] OF INTEGER
DECLARE Grid   : ARRAY[1:5, 1:5] OF CHAR

Scores[1] ← 78
Grid[2, 3] ← 'x'`,
      },
    ],
  },
  {
    slug: "databases",
    level: "igcse",
    unit: "Algorithms & Programming",
    ref: "2.3",
    title: "Databases & SQL",
    objectives: [
      "Describe a single-table database, records, fields and the primary key.",
      "Choose appropriate data types for fields.",
      "Write SQL using SELECT, FROM, WHERE, ORDER BY, SUM and COUNT.",
    ],
    notes: [
      {
        heading: "The SQL you are expected to write",
        body: "IGCSE only requires a single table. Learn the order of the clauses — it is fixed.",
        code: `SELECT Name, Mark
FROM   Results
WHERE  Mark > 50
ORDER  BY Mark DESC;

SELECT COUNT(*) FROM Results WHERE Passed = TRUE;
SELECT SUM(Mark) FROM Results;`,
      },
      {
        heading: "Primary key",
        body: "A field that is unique for every record, so no two records can be confused. It must never be left empty.",
      },
    ],
  },
  {
    slug: "boolean-logic",
    level: "igcse",
    unit: "Algorithms & Programming",
    ref: "2.4",
    title: "Boolean Logic",
    objectives: [
      "Recognise and use the gates NOT, AND, OR, NAND, NOR and XOR.",
      "Build a logic circuit from a problem statement.",
      "Complete a truth table for a circuit.",
      "Write a logic expression from a circuit and vice versa.",
    ],
    notes: [
      {
        heading: "The six gates",
        body: "Learn these outputs by heart — every logic question depends on them.",
        code: `A B | AND  OR  NAND  NOR  XOR
0 0 |  0    0    1     1    0
0 1 |  0    1    1     0    1
1 0 |  0    1    1     0    1
1 1 |  1    1    0     0    0

NOT A:  0 -> 1,  1 -> 0`,
      },
      {
        heading: "Building a truth table for a circuit",
        body: "Add a column for every intermediate output, not just the final one. With 3 inputs there are 8 rows — write them in binary counting order (000, 001, 010 …) so you cannot miss one.",
      },
    ],
    examTips: [
      "XOR means 'one or the other, but not both'. It is the one most often confused with OR.",
      "NAND and NOR are just AND and OR with the output inverted.",
    ],
  },

  // ───────────────────────── AS Level ─────────────────────────
  {
    slug: "information-representation",
    level: "as",
    unit: "Theory Fundamentals",
    ref: "1",
    title: "Information Representation",
    objectives: [
      "Convert between binary, denary, hexadecimal and BCD.",
      "Represent negative numbers using two's complement.",
      "Perform binary addition and subtraction.",
      "Describe character sets (ASCII, Unicode).",
      "Explain bitmap and vector graphics, and sound representation.",
    ],
    notes: [
      {
        heading: "Two's complement",
        body: "To negate a binary number: invert every bit, then add 1. The leftmost bit is the sign bit — 1 means negative. Subtraction is done by adding the negative.",
        code: ` 5  = 0000 0101
invert 1111 1010
add 1  1111 1011  = -5

8 - 5  =  8 + (-5)
0000 1000 + 1111 1011 = 1 0000 0011
                        ^ carry discarded  ->  3`,
      },
      {
        heading: "ASCII vs Unicode",
        body: "ASCII uses 7 bits (128 characters) and cannot represent Mongolian, Chinese or emoji. Unicode uses more bits per character so it covers every writing system — at the cost of larger files.",
      },
    ],
  },
  {
    slug: "processor-fundamentals",
    level: "as",
    unit: "Theory Fundamentals",
    ref: "4",
    title: "Processor Fundamentals",
    objectives: [
      "Describe the von Neumann model and the purpose of each register.",
      "Describe the stages of the fetch–execute cycle using register transfer notation.",
      "Explain the role of buses (address, data, control).",
      "Read and write simple assembly instructions.",
    ],
    notes: [
      {
        heading: "Register transfer notation",
        body: "AS asks for the cycle written formally. Learn this form.",
        code: `MAR ← [PC]
PC  ← [PC] + 1
MDR ← [[MAR]]
CIR ← [MDR]
      decode, then execute`,
      },
      {
        heading: "Bus widths matter",
        body: "The width of the address bus decides how much memory can be addressed (n lines → 2ⁿ locations). The width of the data bus decides how much data moves at once.",
      },
    ],
  },
  {
    slug: "as-algorithms",
    level: "as",
    unit: "Problem-solving",
    ref: "9–11",
    title: "Algorithms & Structured Programming",
    objectives: [
      "Write algorithms using structured English, pseudocode and flowcharts.",
      "Use arrays, records and text files.",
      "Write and call procedures and functions with parameters, understanding scope.",
      "Perform linear and binary search, and bubble and insertion sort.",
      "Use stepwise refinement and produce a program from a structure chart.",
    ],
    notes: [
      {
        heading: "Binary search requires sorted data",
        body: "State this whenever you describe it. Each comparison halves what is left, so it is far faster than a linear search on large data — but on unsorted data it simply does not work.",
        code: `Low ← 1 : High ← N
WHILE Low <= High DO
   Mid ← (Low + High) DIV 2
   IF A[Mid] = Target THEN
      OUTPUT "Found" : EXIT
   ELSE IF A[Mid] < Target THEN
      Low ← Mid + 1
   ELSE
      High ← Mid - 1
   ENDIF
ENDWHILE`,
      },
      {
        heading: "By value vs by reference",
        body: "Passing BYVALUE gives the procedure a copy — changes do not affect the caller. Passing BYREF gives it the original — changes do. Exams ask which to use and why.",
      },
    ],
  },
  {
    slug: "as-databases",
    level: "as",
    unit: "Theory Fundamentals",
    ref: "8",
    title: "Databases & Normalisation",
    objectives: [
      "Explain the limitations of a file-based approach and how a DBMS solves them.",
      "Describe primary, candidate, secondary and foreign keys.",
      "Normalise data to 1NF, 2NF and 3NF.",
      "Write SQL (DDL and DML) for multiple tables.",
    ],
    notes: [
      {
        heading: "Normal forms in one line each",
        body: "1NF: no repeating groups — every field holds a single value. 2NF: in 1NF, and every non-key field depends on the WHOLE primary key. 3NF: in 2NF, and no non-key field depends on another non-key field.",
      },
      {
        heading: "DDL vs DML",
        body: "DDL defines structure (CREATE TABLE, ALTER TABLE). DML works with the data (SELECT, INSERT, UPDATE, DELETE). Questions often specify which is wanted.",
        code: `CREATE TABLE Student (
   StudentID  INTEGER PRIMARY KEY,
   Name       VARCHAR(30),
   ClassID    INTEGER,
   FOREIGN KEY (ClassID) REFERENCES Class(ClassID)
);`,
      },
    ],
  },

  // ───────────────────────── A Level ─────────────────────────
  {
    slug: "data-structures",
    level: "a-level",
    unit: "Computational Thinking",
    ref: "19",
    title: "Abstract Data Types",
    objectives: [
      "Describe and implement stacks, queues, linked lists and binary trees.",
      "Write algorithms to insert into and delete from each structure.",
      "Traverse a binary tree (pre-order, in-order, post-order).",
      "Explain when each structure is appropriate.",
    ],
    notes: [
      {
        heading: "Stack vs queue",
        body: "A stack is last-in-first-out — push and pop at the same end; used for undo and for calling procedures. A queue is first-in-first-out — add at the rear, remove from the front; used for print jobs and buffers.",
      },
      {
        heading: "Tree traversals",
        body: "In-order on a binary search tree gives the values in sorted order — a favourite exam question.",
        code: `        50
       /  \\
     30    70
    /  \\
  20    40

pre-order  (N,L,R): 50 30 20 40 70
in-order   (L,N,R): 20 30 40 50 70   <- sorted
post-order (L,R,N): 20 40 30 70 50`,
      },
      {
        heading: "Linked list",
        body: "Each node holds data and a pointer to the next node. Inserting means changing pointers, not shifting elements — which is why it beats an array for frequent insertion. A null pointer marks the end.",
      },
    ],
  },
  {
    slug: "recursion",
    level: "a-level",
    unit: "Computational Thinking",
    ref: "19",
    title: "Recursion",
    objectives: [
      "Explain what makes an algorithm recursive.",
      "Identify the base case and the general case.",
      "Trace a recursive algorithm.",
      "Explain how the call stack supports recursion.",
    ],
    notes: [
      {
        heading: "Every recursive solution needs two things",
        body: "A base case that stops the recursion, and a general case that calls itself with a smaller problem. Without a base case it recurses until the stack overflows — say exactly that if asked.",
        code: `FUNCTION Factorial(n : INTEGER) RETURNS INTEGER
   IF n = 0 THEN            // base case
      RETURN 1
   ELSE                     // general case
      RETURN n * Factorial(n - 1)
   ENDIF
ENDFUNCTION`,
      },
      {
        heading: "Why the stack matters",
        body: "Each call stores its return address and local variables in a stack frame. They unwind in reverse order once the base case is reached. Too many nested calls exhausts the stack — a stack overflow.",
      },
    ],
  },
  {
    slug: "oop",
    level: "a-level",
    unit: "Further Programming",
    ref: "20",
    title: "Object-Oriented Programming",
    objectives: [
      "Explain classes, objects, attributes, methods and constructors.",
      "Explain encapsulation, inheritance and polymorphism.",
      "Draw and read a class diagram.",
      "Write code using getters and setters.",
    ],
    terms: [
      {
        term: "Encapsulation",
        def: "Attributes are private and reached only through public methods, so an object controls its own data.",
      },
      {
        term: "Inheritance",
        def: "A subclass takes the attributes and methods of its superclass and can add or override them.",
      },
      {
        term: "Polymorphism",
        def: "The same method name behaves differently depending on the class of the object it is called on.",
      },
    ],
    notes: [
      {
        heading: "Why private attributes",
        body: "If any code could change an attribute directly, an object could be put into an invalid state. Getters and setters let the class validate changes first — that validation is the point, and is what earns the mark.",
      },
    ],
  },
  {
    slug: "security-a",
    level: "a-level",
    unit: "Advanced Theory",
    ref: "17",
    title: "Encryption, Security & Integrity",
    objectives: [
      "Compare symmetric and asymmetric encryption.",
      "Explain public and private keys, digital signatures and certificates.",
      "Describe SSL/TLS and how a secure session is established.",
      "Explain measures that protect data integrity.",
    ],
    notes: [
      {
        heading: "Symmetric vs asymmetric",
        body: "Symmetric uses one shared key — fast, but the key must somehow be exchanged safely. Asymmetric uses a public key to encrypt and a private key to decrypt, solving the exchange problem but running more slowly. Real systems use asymmetric to agree a symmetric key, then switch.",
      },
      {
        heading: "Digital signature",
        body: "A hash of the message encrypted with the sender's PRIVATE key. Anyone can decrypt it with the public key, which proves who sent it and that it was not altered.",
      },
    ],
  },
  {
    slug: "ai",
    level: "a-level",
    unit: "Advanced Theory",
    ref: "18",
    title: "Artificial Intelligence",
    objectives: [
      "Describe machine learning, supervised and unsupervised learning.",
      "Explain artificial neural networks in outline.",
      "Describe graphs and the A* and Dijkstra shortest-path algorithms.",
      "Discuss the uses and risks of AI.",
    ],
    notes: [
      {
        heading: "Supervised vs unsupervised",
        body: "Supervised learning trains on labelled examples — you already know the right answers. Unsupervised finds structure in unlabelled data, such as clustering customers by behaviour.",
      },
      {
        heading: "Dijkstra vs A*",
        body: "Both find a shortest path. A* additionally uses a heuristic estimate of the remaining distance, so it explores fewer nodes and usually finds the route faster.",
      },
    ],
  },
];

export function levelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function topicsForLevel(level: LevelId): Topic[] {
  return TOPICS.filter((t) => t.level === level);
}

export function findTopic(level: string, slug: string): Topic | undefined {
  return TOPICS.find((t) => t.level === level && t.slug === slug);
}

/** Units in the order they appear, for grouping a level's topic list. */
export function unitsForLevel(level: LevelId): string[] {
  return [...new Set(topicsForLevel(level).map((t) => t.unit))];
}

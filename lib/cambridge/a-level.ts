// A Level Computer Science 9618 — sections 13 to 20.
// Papers 3 (Advanced Theory) and 4 (Practical).

import type { Topic } from "./types";

const P3 = "Paper 3 — Advanced Theory";
const P4 = "Paper 4 — Practical";

export const A_LEVEL_TOPICS: Topic[] = [
  {
    slug: "data-representation-a",
    level: "a-level",
    unit: P3,
    ref: "13",
    title: "Data Representation",
    summary:
      "Floating-point numbers: how a computer stores fractions, and why it sometimes gets them slightly wrong.",
    objectives: [
      "Represent a real number in binary floating-point form (mantissa and exponent).",
      "Normalise a floating-point number and explain why normalisation is needed.",
      "Convert between denary and normalised floating-point form.",
      "Explain the trade-off between the size of the mantissa and the exponent.",
      "Explain the causes and effects of rounding and truncation errors.",
    ],
    terms: [
      {
        term: "Mantissa",
        def: "The part holding the significant digits of the number.",
      },
      {
        term: "Exponent",
        def: "The power of 2 that the mantissa is multiplied by — it moves the binary point.",
      },
      {
        term: "Normalisation",
        def: "Adjusting the number so the mantissa starts 0.1 (positive) or 1.0 (negative), giving the most precision and one unique representation.",
      },
    ],
    notes: [
      {
        heading: "The idea in one sentence",
        body: "The number is stored as mantissa × 2^exponent, exactly like standard form in maths but in base 2. Both parts are held in two's complement.",
        code: `mantissa  01000000   = +0.5
exponent  00000011   = +3

value = 0.5 × 2³ = 0.5 × 8 = 4`,
      },
      {
        heading: "Why normalise",
        body: "Without a rule, the same value could be stored many different ways, and leading zeros in the mantissa waste bits that could have held real digits. Normalising fixes both: one representation per value, and maximum precision. A normalised positive mantissa always begins 0.1; a negative one always begins 1.0.",
      },
      {
        heading: "Mantissa vs exponent — the trade-off",
        body: "With a fixed total number of bits, giving more to the mantissa means more PRECISION (more accurate values) but a smaller RANGE. Giving more to the exponent means a bigger RANGE (larger and smaller magnitudes) but less precision. Exams ask you to state both sides.",
      },
      {
        heading: "Rounding and truncation errors",
        body: "Some fractions cannot be represented exactly in binary — 0.1 in denary is a recurring binary fraction, just as 1/3 recurs in denary. The stored value is therefore slightly wrong, and repeated calculations make the error grow. This is why money is often stored as integer numbers of the smallest unit rather than as floating point.",
      },
    ],
    examTips: [
      "Show the working: convert, then normalise, then write both parts with the stated bit widths.",
      "If asked why 0.1 cannot be stored exactly, say it is a recurring fraction in binary.",
    ],
  },
  {
    slug: "communication-a",
    level: "a-level",
    unit: P3,
    ref: "14",
    title: "Communication and Internet Technologies",
    summary:
      "How data actually gets across the internet: protocols in layers, and circuit vs packet switching.",
    objectives: [
      "Describe circuit switching and packet switching and compare them.",
      "Explain the purpose of protocols and the benefit of a layered model.",
      "Describe the TCP/IP protocol suite and its layers.",
      "Describe the purpose of HTTP, FTP, SMTP, POP3 and IMAP.",
      "Explain the role of a bit-torrent / peer-to-peer network.",
    ],
    notes: [
      {
        heading: "Circuit vs packet switching",
        body: "Circuit switching reserves a complete path for the whole conversation — guaranteed bandwidth and no reordering, but the line is wasted during silence and setup takes time. Packet switching sends packets independently by any route — efficient and resilient, but packets may arrive out of order or late, so they must be reassembled.",
      },
      {
        heading: "Why protocols are layered",
        body: "Each layer only has to talk to the layer above and below it. That means one layer can be changed — for example swapping Wi-Fi for Ethernet — without rewriting the others. It also makes the whole system easier to understand, to build and to fix.",
        code: `TCP/IP layers (top to bottom)

Application  HTTP, FTP, SMTP — what the user's program speaks
Transport    TCP/UDP — splits into packets, checks arrival
Internet     IP — addressing and routing
Link         the physical network and hardware`,
      },
      {
        heading: "The mail protocols",
        body: "SMTP SENDS mail. POP3 downloads mail and normally deletes it from the server, so it lives on one device. IMAP keeps mail ON the server and synchronises, so the same mailbox looks the same on your phone and laptop.",
      },
    ],
  },
  {
    slug: "hardware-virtual-machines",
    level: "a-level",
    unit: P3,
    ref: "15",
    title: "Hardware and Virtual Machines",
    summary:
      "Processor design choices, parallel processing, and running one computer inside another.",
    objectives: [
      "Describe RISC and CISC processors and compare them.",
      "Explain pipelining and how it improves throughput.",
      "Describe parallel processing: SISD, SIMD, MISD, MIMD.",
      "Explain the purpose and benefits of a virtual machine.",
      "Describe the role of an interpreter and intermediate code.",
    ],
    notes: [
      {
        heading: "RISC vs CISC",
        body: "RISC has few, simple, fixed-length instructions that mostly take one cycle — which makes pipelining easy and power use low, so it dominates phones. CISC has many complex instructions that can take several cycles; programs are shorter but the hardware is complicated and harder to pipeline.",
      },
      {
        heading: "Pipelining",
        body: "Instead of finishing one instruction before starting the next, the stages overlap — while instruction 1 is being executed, instruction 2 is being decoded and instruction 3 fetched. Throughput rises sharply. A branch can force the pipeline to be flushed, which is the cost.",
        code: `        cycle1  cycle2  cycle3  cycle4
instr 1 fetch   decode  execute
instr 2         fetch   decode  execute
instr 3                 fetch   decode`,
      },
      {
        heading: "Flynn's four classifications",
        body: "SISD: one instruction, one data stream — a simple single-core machine. SIMD: one instruction applied to many data items at once — graphics and vector work. MISD: several instructions on one data stream — rare, used where results must be cross-checked. MIMD: independent instructions on independent data — multi-core computers.",
      },
      {
        heading: "Virtual machines",
        body: "Software that behaves like a separate computer. Benefits: run another operating system, test software safely in isolation, run legacy software, and use one physical server for several logical ones. Drawbacks: it runs more slowly than real hardware and uses extra memory.",
      },
    ],
  },
  {
    slug: "system-software-a",
    level: "a-level",
    unit: P3,
    ref: "16",
    title: "System Software",
    summary:
      "How the operating system shares one processor between many programs, and manages memory.",
    objectives: [
      "Explain the purpose of scheduling and describe scheduling algorithms.",
      "Describe the states of a process and the transitions between them.",
      "Explain paging, segmentation and virtual memory.",
      "Explain disk thrashing and its cause.",
      "Describe the role of interrupts in process management.",
    ],
    notes: [
      {
        heading: "Process states",
        body: "A process is RUNNING (using the CPU), READY (able to run, waiting its turn) or BLOCKED (waiting for something such as input). It moves running → ready when its time slice expires, running → blocked when it asks for I/O, and blocked → ready when the I/O finishes.",
      },
      {
        heading: "Scheduling algorithms",
        body: "Round robin: each process gets a fixed time slice in turn — fair, simple, and nothing starves. First come first served: run in arrival order — simple but a long job blocks everyone. Shortest job first: best average waiting time, but long jobs may never run. Shortest remaining time: pre-emptive version of the same idea.",
      },
      {
        heading: "Paging, segmentation and thrashing",
        body: "Paging splits memory into equal fixed-size pages; segmentation splits it into variable-size logical parts such as a whole procedure. Virtual memory moves pages between RAM and disk so more can run than fits. If too little RAM is available, the OS spends most of its time swapping pages in and out rather than doing work — that is disk thrashing, and the machine slows to a crawl.",
      },
    ],
  },
  {
    slug: "security-a",
    level: "a-level",
    unit: P3,
    ref: "17",
    title: "Security",
    summary:
      "Encryption in depth, digital signatures, certificates and how a secure connection is set up.",
    objectives: [
      "Compare symmetric and asymmetric encryption.",
      "Explain public and private keys and how a key exchange works.",
      "Explain digital signatures and digital certificates.",
      "Describe how SSL/TLS establishes a secure session.",
      "Explain the purpose of a hashing algorithm.",
      "Describe malware and the methods used to protect against it.",
    ],
    notes: [
      {
        heading: "Symmetric vs asymmetric, and why real systems use both",
        body: "Symmetric uses one shared key — fast, but the key must be exchanged safely, which is the hard part. Asymmetric solves the exchange but is slow. So real systems use asymmetric encryption once, just to agree a symmetric session key, and then use the fast symmetric method for the actual data.",
      },
      {
        heading: "Digital signature — the direction matters",
        body: "The sender hashes the message and encrypts the hash with their PRIVATE key. The receiver decrypts it with the sender's PUBLIC key and re-hashes the message. If the hashes match, the message is unaltered AND could only have come from the holder of that private key. Getting the keys the wrong way round loses the mark.",
        code: `Sender:    hash(message) --encrypt with PRIVATE--> signature
Receiver:  signature --decrypt with PUBLIC--> hash A
           hash(received message) --> hash B
           A = B  ->  authentic and unaltered`,
      },
      {
        heading: "Digital certificate",
        body: "A certificate issued by a trusted Certificate Authority binds a public key to an identity. Without it, an attacker could simply publish their own public key and claim to be the bank.",
      },
      {
        heading: "What makes a good hash",
        body: "It always gives the same output for the same input, produces a fixed-length result, is fast to compute, and is effectively impossible to reverse. Two different inputs giving the same hash is a collision, and a good algorithm makes that vanishingly unlikely.",
      },
    ],
  },
  {
    slug: "artificial-intelligence",
    level: "a-level",
    unit: P3,
    ref: "18",
    title: "Artificial Intelligence",
    summary:
      "Machine learning, neural networks, and the graph algorithms behind route finding.",
    objectives: [
      "Describe machine learning and distinguish supervised, unsupervised and reinforcement learning.",
      "Describe artificial neural networks and deep learning.",
      "Explain the structure of a graph and how it is stored.",
      "Perform Dijkstra's shortest path algorithm.",
      "Explain the A* algorithm and how a heuristic improves it.",
      "Discuss the benefits and risks of AI.",
    ],
    notes: [
      {
        heading: "The three kinds of learning",
        body: "Supervised: trained on labelled examples where the right answer is known — spam or not spam. Unsupervised: finds structure in unlabelled data, such as grouping customers by behaviour. Reinforcement: learns by trial and error from rewards and penalties — how a program learns to play a game.",
      },
      {
        heading: "Neural networks in plain words",
        body: "Layers of connected nodes: an input layer, one or more hidden layers, and an output layer. Each connection has a weight. Data flows forward, the output is compared with the correct answer, and the weights are adjusted so the error shrinks — repeated over many examples. 'Deep' learning simply means many hidden layers.",
      },
      {
        heading: "Dijkstra's algorithm",
        body: "Set the start distance to 0 and every other to infinity. Repeatedly take the unvisited node with the smallest distance, update each neighbour if going via this node is shorter, and mark it visited. Stop when the destination is visited.",
        code: `Node   A   B   C   D
start  0   ∞   ∞   ∞
via A  0   4   2   ∞
via C  0   3   2   6     (A→C→B = 2+1 = 3, better than 4)
via B  0   3   2   5`,
      },
      {
        heading: "Why A* is faster",
        body: "Dijkstra explores outwards in every direction equally. A* adds a heuristic — an estimate of the distance still to go, such as straight-line distance — so it prefers nodes that head towards the goal and examines far fewer of them. The estimate must never overestimate, or the route found may not be the shortest.",
      },
    ],
  },
  {
    slug: "computational-thinking",
    level: "a-level",
    unit: P4,
    ref: "19",
    title: "Computational Thinking and Data Structures",
    summary:
      "Recursion, and the classic structures: stacks, queues, linked lists and trees.",
    objectives: [
      "Explain recursion, identifying the base case and general case.",
      "Trace a recursive algorithm and explain the role of the call stack.",
      "Describe and implement a stack, queue, linked list and binary tree.",
      "Write algorithms to insert into and delete from each structure.",
      "Traverse a binary tree in pre-order, in-order and post-order.",
      "Compare the efficiency of searching and sorting algorithms using Big O.",
    ],
    notes: [
      {
        heading: "Every recursive solution needs exactly two things",
        body: "A base case that stops it, and a general case that calls itself with a SMALLER problem. If the base case is missing or unreachable, the calls never stop and the call stack fills up — a stack overflow. Say precisely that if asked.",
        code: `FUNCTION Factorial(n : INTEGER) RETURNS INTEGER
   IF n = 0 THEN
      RETURN 1                      // base case
   ELSE
      RETURN n * Factorial(n - 1)   // general case
   ENDIF
ENDFUNCTION

Factorial(3)
 = 3 × Factorial(2)
 = 3 × 2 × Factorial(1)
 = 3 × 2 × 1 × Factorial(0)
 = 3 × 2 × 1 × 1  =  6`,
      },
      {
        heading: "Stack and queue",
        body: "A stack is last in, first out — push and pop at the same end. Used for undo, for reversing, and by the processor to store return addresses. A queue is first in, first out — join at the rear, leave from the front. Used for print jobs, keyboard buffers and scheduling.",
        code: `STACK               QUEUE
push 1,2,3          enqueue 1,2,3
pop -> 3            dequeue -> 1
pop -> 2            dequeue -> 2`,
      },
      {
        heading: "Linked list",
        body: "Each node holds data plus a pointer to the next node. Inserting or deleting means changing pointers rather than shifting every element, which beats an array when the data changes often. The cost is that you cannot jump straight to the nth item — you must follow the chain. A null pointer marks the end.",
      },
      {
        heading: "Binary tree traversals",
        body: "In-order on a binary search tree produces the values in sorted order — that is the most examined fact here.",
        code: `        50
       /  \\
     30    70
    /  \\
  20    40

pre-order  (Node,Left,Right): 50 30 20 40 70
in-order   (Left,Node,Right): 20 30 40 50 70  <- sorted
post-order (Left,Right,Node): 20 40 30 70 50`,
      },
      {
        heading: "Big O — comparing algorithms",
        body: "Big O describes how the work grows as the data grows, ignoring constants.",
        code: `O(1)        constant     – array access by index
O(log n)    logarithmic  – binary search
O(n)        linear       – linear search
O(n log n)  good sorts   – merge sort, quicksort (average)
O(n²)       quadratic    – bubble, insertion, selection sort`,
      },
    ],
    examTips: [
      "For a recursion trace, write each call on its own line and unwind from the base case upward.",
      "Binary search is O(log n) only because the data is sorted — always state the precondition.",
    ],
  },
  {
    slug: "further-programming",
    level: "a-level",
    unit: P4,
    ref: "20",
    title: "Further Programming",
    summary:
      "Object-oriented programming, files, and handling errors without crashing.",
    objectives: [
      "Explain classes, objects, attributes, methods, constructors and instantiation.",
      "Explain encapsulation, inheritance and polymorphism.",
      "Draw and interpret a class diagram.",
      "Write programs using classes with getters and setters.",
      "Use exception handling to deal with runtime errors.",
      "Read from and write to files, including random access.",
      "Explain the features of different programming paradigms.",
    ],
    terms: [
      {
        term: "Class",
        def: "A template describing the attributes and methods that objects of that kind will have.",
      },
      {
        term: "Object",
        def: "One actual instance created from a class, with its own data.",
      },
      {
        term: "Constructor",
        def: "The method that runs when an object is created, setting up its starting values.",
      },
      {
        term: "Encapsulation",
        def: "Keeping attributes private so they can only be reached through the class's own methods.",
      },
      {
        term: "Inheritance",
        def: "A subclass automatically gains the attributes and methods of its superclass.",
      },
      {
        term: "Polymorphism",
        def: "The same method name behaves differently depending on the object's class.",
      },
    ],
    notes: [
      {
        heading: "A class in Cambridge pseudocode",
        body: "Attributes are PRIVATE, methods that the outside world uses are PUBLIC. That is encapsulation in one line of layout.",
        code: `CLASS Student
   PRIVATE Name  : STRING
   PRIVATE Mark  : INTEGER

   PUBLIC PROCEDURE NEW(GivenName : STRING)
      Name ← GivenName
      Mark ← 0
   ENDPROCEDURE

   PUBLIC PROCEDURE SetMark(m : INTEGER)
      IF m >= 0 AND m <= 100 THEN     // validation!
         Mark ← m
      ENDIF
   ENDPROCEDURE

   PUBLIC FUNCTION GetMark() RETURNS INTEGER
      RETURN Mark
   ENDFUNCTION
ENDCLASS

DECLARE S : Student
S ← NEW Student("Bat")
CALL S.SetMark(78)`,
      },
      {
        heading: "Why attributes are private",
        body: "If any code could set Mark directly, someone could store 500 or −20 and the object would be invalid. Forcing changes through SetMark means the class can validate first. That validation is the whole point — and it is the mark.",
      },
      {
        heading: "Inheritance and polymorphism together",
        body: "A subclass INHERITS everything from its superclass and may add to it or override it. Polymorphism means you can hold a collection of superclass references and call the same method on each, and each object runs its own version.",
        code: `CLASS Shape
   PUBLIC FUNCTION Area() RETURNS REAL
      RETURN 0
   ENDFUNCTION
ENDCLASS

CLASS Circle INHERITS Shape
   PRIVATE R : REAL
   PUBLIC FUNCTION Area() RETURNS REAL   // overrides
      RETURN 3.14159 * R * R
   ENDFUNCTION
ENDCLASS`,
      },
      {
        heading: "Exception handling",
        body: "An exception is a runtime error such as dividing by zero, a missing file, or text where a number was expected. Handling it lets the program recover and tell the user, instead of crashing.",
        code: `TRY
   OPENFILE "data.txt" FOR READ
   READFILE "data.txt", Line
EXCEPT
   OUTPUT "The file could not be opened"
ENDTRY`,
      },
      {
        heading: "Programming paradigms",
        body: "Procedural: a sequence of instructions grouped into procedures. Object-oriented: data and the operations on it bundled into objects. Declarative: you state the facts and rules and the language works out how — as in SQL or Prolog. Low-level: instructions matching the processor directly.",
      },
    ],
  },
];

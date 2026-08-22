// Self-check questions for the remaining topics.
// Split from quizzes.ts purely to keep each file a readable length.

import type { QuizQuestion } from "./quizzes";

export const QUIZZES_2: Record<string, QuizQuestion[]> = {
  "igcse/encryption-igcse": [
    {
      q: "What does encryption actually protect against?",
      choices: [
        "Intercepted data being understood",
        "Data being intercepted at all",
        "A computer being hacked",
      ],
      answer: 0,
      why: "Encryption does not stop interception — it makes the intercepted data meaningless without the key. Say that precisely for the mark.",
    },
    {
      q: "In asymmetric encryption, which key does the sender use to encrypt?",
      choices: [
        "The receiver's public key",
        "The receiver's private key",
        "Their own private key",
      ],
      answer: 0,
      why: "The public key encrypts; only the matching private key, which is kept secret, can decrypt.",
    },
    {
      q: "What is the main weakness of symmetric encryption?",
      choices: [
        "The single key has to be shared safely somehow",
        "It is far too slow to use",
        "It cannot encrypt text",
      ],
      answer: 0,
      why: "Symmetric is fast, but if the key is intercepted during sharing the whole system is broken.",
    },
  ],

  "igcse/input-output-devices": [
    {
      q: "A greenhouse system must monitor the growing conditions. Which sensors fit best?",
      choices: [
        "Temperature, moisture and light",
        "Pressure, acoustic and pH",
        "Infra-red, magnetic and gas",
      ],
      answer: 0,
      why: "Match the sensor to the physical quantity the scenario actually cares about.",
    },
    {
      q: "Which printer suits a busy office printing thousands of pages?",
      choices: ["Laser", "Inkjet", "3D printer"],
      answer: 0,
      why: "Laser is fast and cheap per page for high volume. Inkjet is better for photo quality at home.",
    },
    {
      q: "Why does a capacitive touch screen not work through thick gloves?",
      choices: [
        "It senses the small electrical charge of the human body",
        "It needs a heavy press to register",
        "It uses infra-red beams that gloves block",
      ],
      answer: 0,
      why: "Capacitive screens detect the body's charge, so an insulating glove stops them. Resistive screens do work with gloves.",
    },
  ],

  "igcse/network-hardware": [
    {
      q: "Which address is fixed by the manufacturer and does not change?",
      choices: ["The MAC address", "The IP address", "Both change equally"],
      answer: 0,
      why: "The MAC identifies the physical device permanently. The IP identifies it on a network and can change.",
    },
    {
      q: "Why was IPv6 introduced?",
      choices: [
        "IPv4's 32 bits could not supply enough addresses",
        "IPv4 was not secure",
        "IPv6 is easier for people to remember",
      ],
      answer: 0,
      why: "IPv4 gives about 4 billion addresses and the world ran out. IPv6 uses 128 bits.",
    },
    {
      q: "What does a router do?",
      choices: [
        "Connects networks and directs packets towards their destination",
        "Converts analogue signals to digital",
        "Stores web pages so they load faster",
      ],
      answer: 0,
      why: "It reads the destination IP in the packet header and chooses a route.",
    },
  ],

  "igcse/languages-translators": [
    {
      q: "You are learning to program and want errors reported one at a time as you go. Which translator suits you?",
      choices: ["An interpreter", "A compiler", "An assembler"],
      answer: 0,
      why: "An interpreter runs line by line and stops at the first error, which is exactly what you want while learning.",
    },
    {
      q: "What does a compiler produce that an interpreter does not?",
      choices: [
        "An executable file that runs without the translator",
        "A list of syntax errors",
        "Machine code — interpreters never produce any",
      ],
      answer: 0,
      why: "Once compiled, the executable runs on its own. An interpreter is needed every time the program runs.",
    },
    {
      q: "Which is a benefit of a high-level language over assembly?",
      choices: [
        "It is quicker to write and works on different machines",
        "It gives more direct control of the hardware",
        "It always produces faster programs",
      ],
      answer: 0,
      why: "Portability and readability are the high-level benefits. Direct hardware control belongs to low-level languages.",
    },
  ],

  "igcse/internet-www": [
    {
      q: "What is the difference between the internet and the World Wide Web?",
      choices: [
        "The internet is the network; the web is the collection of pages on it",
        "They are two names for the same thing",
        "The web is the hardware and the internet is the software",
      ],
      answer: 0,
      why: "The web runs ON the internet. The internet also carries email and file transfer.",
    },
    {
      q: "What does a DNS server do?",
      choices: [
        "Turns a domain name into an IP address",
        "Stores the web pages themselves",
        "Encrypts the connection",
      ],
      answer: 0,
      why: "You type a name; the browser needs the number. DNS does that translation.",
    },
    {
      q: "Which cookie disappears when the browser is closed?",
      choices: ["A session cookie", "A persistent cookie", "Both do"],
      answer: 0,
      why: "Session cookies live in memory. Persistent cookies are written to disk and survive.",
    },
  ],

  "igcse/digital-currency": [
    {
      q: "What makes a blockchain very hard to tamper with?",
      choices: [
        "Each block holds a hash of the previous one, so changing a block breaks every block after it",
        "Each block is encrypted with a password",
        "Only one computer is allowed to hold the chain",
      ],
      answer: 0,
      why: "The chaining of hashes makes any alteration immediately obvious, and many computers hold copies.",
    },
    {
      q: "What does a block in a blockchain contain?",
      choices: [
        "The transaction data, a timestamp and the previous block's hash",
        "Only the amount of money sent",
        "The owner's bank details",
      ],
      answer: 0,
      why: "The previous block's hash is what links the chain together.",
    },
  ],

  "igcse/automated-systems": [
    {
      q: "In an automated system, what converts a sensor's analogue reading for the microprocessor?",
      choices: ["An ADC", "A DAC", "An actuator"],
      answer: 0,
      why: "Analogue to digital converter on the way in; digital to analogue converter on the way out.",
    },
    {
      q: "What does the microprocessor do with the sensor reading?",
      choices: [
        "Compares it with a stored value and decides whether to act",
        "Displays it and waits for a human to decide",
        "Sends it straight to the actuator",
      ],
      answer: 0,
      why: "The comparison with a preset value is what makes the system automatic — no human in the loop.",
    },
    {
      q: "Which is a genuine disadvantage of an automated system?",
      choices: [
        "It is expensive to set up and fails if a sensor fails",
        "It cannot work at night",
        "It is always slower than a person",
      ],
      answer: 0,
      why: "High initial cost, maintenance and dependence on the sensors are the real drawbacks.",
    },
  ],

  "igcse/robotics": [
    {
      q: "Which of these is a defining characteristic of a robot?",
      choices: [
        "It is programmable and can be reprogrammed for another task",
        "It looks like a human",
        "It can think for itself",
      ],
      answer: 0,
      why: "Mechanical structure, electrical components and programmability. Looking human is irrelevant.",
    },
    {
      q: "Give the strongest argument FOR using robots on a production line.",
      choices: [
        "They work continuously with consistent accuracy",
        "They are cheap to buy",
        "They can make judgement calls",
      ],
      answer: 0,
      why: "Consistency and continuous operation are their strength. They are expensive and cannot judge.",
    },
  ],

  "igcse/artificial-intelligence-igcse": [
    {
      q: "Which characteristic separates AI from an ordinary program?",
      choices: [
        "It can learn and adapt, improving its own performance",
        "It runs faster",
        "It uses a database",
      ],
      answer: 0,
      why: "Collecting data, reasoning, and above all learning and adapting are the AI characteristics.",
    },
    {
      q: "Which part of an expert system applies the rules to the facts?",
      choices: ["The inference engine", "The knowledge base", "The user interface"],
      answer: 0,
      why: "Knowledge base holds facts, rule base holds the rules, and the inference engine reasons with them.",
    },
  ],

  "igcse/program-development": [
    {
      q: "A program runs perfectly but prints the wrong total. What kind of error is this?",
      choices: ["A logic error", "A syntax error", "A runtime error"],
      answer: 0,
      why: "Syntax errors stop it running at all. A logic error runs fine but gives the wrong answer.",
    },
    {
      q: "A field accepts marks from 0 to 100. Which is BOUNDARY test data?",
      choices: ["0 and 100", "50", "'cat'"],
      answer: 0,
      why: "Boundary data sits at the extreme edges of what is acceptable. 'cat' is abnormal; 50 is normal.",
    },
    {
      q: "Which stage comes immediately after analysis?",
      choices: ["Design", "Testing", "Coding"],
      answer: 0,
      why: "Analysis, design, coding, testing. Design is where flowcharts and pseudocode are produced.",
    },
  ],

  "igcse/decomposition": [
    {
      q: "Which flowchart shape is used for a decision?",
      choices: ["A diamond", "A rectangle", "A parallelogram"],
      answer: 0,
      why: "Diamond for a decision with labelled Yes/No branches. Rectangle is a process; parallelogram is input/output.",
    },
    {
      q: "Decomposing a problem means splitting it into which four parts?",
      choices: [
        "Inputs, processes, storage and outputs",
        "Analysis, design, coding and testing",
        "Hardware, software, data and users",
      ],
      answer: 0,
      why: "That breakdown turns a vague problem into something you can start coding.",
    },
  ],

  "igcse/file-handling": [
    {
      q: "Why must you check for EOF when reading a file?",
      choices: [
        "So the program does not try to read past the last line and crash",
        "To make the file smaller",
        "To close the file automatically",
      ],
      answer: 0,
      why: "EOF is the loop condition when you do not know how many lines there are.",
    },
    {
      q: "You want to add a new record without deleting what is already in the file. Which mode?",
      choices: ["APPEND", "WRITE", "READ"],
      answer: 0,
      why: "WRITE starts the file again from empty. APPEND adds to the end.",
    },
    {
      q: "Why store data in a file rather than only in variables?",
      choices: [
        "Variables are lost when the program ends; a file persists",
        "Files are faster to read than variables",
        "Variables cannot hold text",
      ],
      answer: 0,
      why: "Persistence is the whole reason for file handling.",
    },
  ],

  "as/communication": [
    {
      q: "Which is a genuine drawback of a client-server network?",
      choices: [
        "The server is a single point of failure",
        "Files cannot be shared",
        "It cannot be backed up centrally",
      ],
      answer: 0,
      why: "Central control is its strength and its weakness — if the server goes down, everything stops.",
    },
    {
      q: "In a bus topology, what happens if the main cable breaks?",
      choices: [
        "The whole network goes down",
        "Only one computer is affected",
        "Traffic reroutes automatically",
      ],
      answer: 0,
      why: "Everything shares one backbone. A mesh has redundant paths and would reroute.",
    },
    {
      q: "Which topology gives the highest reliability through redundant paths?",
      choices: ["Mesh", "Bus", "Star"],
      answer: 0,
      why: "Mesh has many routes between nodes, so a single failure does not disconnect anything — at high cost.",
    },
  ],

  "as/hardware-as": [
    {
      q: "Apply De Morgan's law: what is (A · B)' equal to?",
      choices: ["A' + B'", "A' · B'", "A + B"],
      answer: 0,
      why: "Break the bar and change the sign: NOT(A AND B) = NOT A OR NOT B.",
    },
    {
      q: "Why is SRAM used for cache rather than DRAM?",
      choices: [
        "It is faster and needs no refreshing",
        "It is cheaper per bit",
        "It stores more in the same space",
      ],
      answer: 0,
      why: "SRAM is fast but expensive and bulky, which is exactly the trade you want for a small cache.",
    },
    {
      q: "In a Karnaugh map, why are the columns ordered 00, 01, 11, 10?",
      choices: [
        "So that neighbouring cells differ by only one variable",
        "To sort them into ascending binary order",
        "It is an arbitrary convention with no reason",
      ],
      answer: 0,
      why: "That ordering is what allows adjacent 1s to be grouped and a variable to cancel out.",
    },
  ],

  "as/system-software-as": [
    {
      q: "Which stage of compilation removes comments and produces tokens?",
      choices: ["Lexical analysis", "Syntax analysis", "Code generation"],
      answer: 0,
      why: "Lexical analysis comes first: strip whitespace and comments, then tokenise.",
    },
    {
      q: "What is the main benefit of a DLL over including the code in every program?",
      choices: [
        "One shared copy, so executables are smaller and a fix helps every program",
        "It runs faster than compiled code",
        "It cannot be affected by viruses",
      ],
      answer: 0,
      why: "Sharing is the point — at the cost of everything breaking if the DLL goes missing.",
    },
    {
      q: "Which is a task of the operating system?",
      choices: [
        "Memory management",
        "Writing the user's documents",
        "Compiling the user's programs into an executable",
      ],
      answer: 0,
      why: "Memory, file, process, security and hardware management are OS jobs.",
    },
  ],

  "as/security-privacy": [
    {
      q: "Keeping data ACCURATE and uncorrupted is which of these?",
      choices: ["Data integrity", "Data security", "Data privacy"],
      answer: 0,
      why: "Security is about access, privacy is about who is allowed to see it, integrity is about accuracy.",
    },
    {
      q: "A user types their email address twice to make sure it is right. That is:",
      choices: ["Verification", "Validation", "Authentication"],
      answer: 0,
      why: "Double entry checks it was ENTERED correctly. A format check on the @ would be validation.",
    },
    {
      q: "Which check would catch a date of birth of 30/02/2010?",
      choices: ["A format or range check", "A presence check", "A length check"],
      answer: 0,
      why: "February never has 30 days, so the value is outside the valid range for that month.",
    },
  ],

  "as/ethics": [
    {
      q: "Software is free to try for 30 days, then you must pay. What licence is that?",
      choices: ["Shareware", "Freeware", "Open source"],
      answer: 0,
      why: "Shareware is try-before-you-buy. Freeware is free forever but closed source.",
    },
    {
      q: "What is the key difference between freeware and open source?",
      choices: [
        "Open source publishes the source code so it can be modified",
        "Freeware costs money after a trial",
        "Open source cannot be used commercially",
      ],
      answer: 0,
      why: "Both may cost nothing; only open source lets you see and change the code.",
    },
    {
      q: "Which is part of a professional code of conduct?",
      choices: [
        "Being honest about the limits of your own competence",
        "Always choosing the cheapest solution",
        "Keeping your source code secret from colleagues",
      ],
      answer: 0,
      why: "Honesty about competence, acting in the public interest and respecting confidentiality are the classic points.",
    },
  ],

  "as/data-types-structures": [
    {
      q: "Why use a record rather than several parallel arrays?",
      choices: [
        "It keeps the fields about one thing together, which is clearer and safer",
        "Records are always faster",
        "Arrays cannot hold strings",
      ],
      answer: 0,
      why: "One variable holds all the fields describing one item, so they cannot fall out of step.",
    },
    {
      q: "Which file organisation lets you jump straight to a record without reading the others?",
      choices: ["Random (direct) access", "Serial", "Sequential"],
      answer: 0,
      why: "The position is calculated from the key, so any record can be reached immediately.",
    },
    {
      q: "A transaction log written in the order events happened is which organisation?",
      choices: ["Serial", "Sequential", "Random"],
      answer: 0,
      why: "Serial means simply in arrival order, with no ordering by key.",
    },
  ],

  "as/software-development": [
    {
      q: "Testing that ignores the internal code and checks only inputs against outputs is:",
      choices: ["Black box testing", "White box testing", "Alpha testing"],
      answer: 0,
      why: "White box designs tests to cover the internal paths; black box treats the program as sealed.",
    },
    {
      q: "The software is changed because a new law requires it. Which maintenance is this?",
      choices: ["Adaptive", "Corrective", "Perfective"],
      answer: 0,
      why: "Adaptive responds to a changed environment. Corrective fixes bugs; perfective improves or adds features.",
    },
    {
      q: "What is the main weakness of the waterfall model?",
      choices: [
        "A mistake found late is expensive, and the customer sees nothing until the end",
        "It cannot be used for large projects",
        "It has no testing stage",
      ],
      answer: 0,
      why: "Each stage happens once in order, so late changes are costly. Iterative models get feedback earlier.",
    },
  ],

  "a-level/communication-a": [
    {
      q: "Which is an advantage of packet switching over circuit switching?",
      choices: [
        "The line is not wasted when nobody is sending",
        "Packets always arrive in order",
        "Bandwidth is guaranteed for the whole call",
      ],
      answer: 0,
      why: "Circuit switching reserves the whole path, wasting it during silence. Packet switching shares it.",
    },
    {
      q: "Why is a layered protocol model useful?",
      choices: [
        "One layer can be changed without rewriting the others",
        "It makes transmission faster",
        "It removes the need for error checking",
      ],
      answer: 0,
      why: "Each layer only talks to the ones above and below, so Wi-Fi can replace Ethernet with nothing else changing.",
    },
    {
      q: "You want the same mailbox to look identical on your phone and laptop. Which protocol?",
      choices: ["IMAP", "POP3", "SMTP"],
      answer: 0,
      why: "IMAP keeps mail on the server and synchronises. POP3 downloads and usually deletes. SMTP only sends.",
    },
  ],

  "a-level/hardware-virtual-machines": [
    {
      q: "Why is RISC easier to pipeline than CISC?",
      choices: [
        "Its instructions are simple, of fixed length and mostly take one cycle",
        "It has far more instructions available",
        "It does not use registers",
      ],
      answer: 0,
      why: "Uniform, short instructions keep the pipeline stages evenly filled.",
    },
    {
      q: "One instruction applied to many data items at once is which classification?",
      choices: ["SIMD", "SISD", "MIMD"],
      answer: 0,
      why: "Single Instruction, Multiple Data — used heavily in graphics and vector processing.",
    },
    {
      q: "What is a genuine drawback of running software in a virtual machine?",
      choices: [
        "It runs more slowly and uses extra memory",
        "It cannot run a different operating system",
        "It is less safe for testing risky software",
      ],
      answer: 0,
      why: "The extra layer costs performance. Isolation for testing is one of its main benefits, not a drawback.",
    },
  ],

  "a-level/system-software-a": [
    {
      q: "A process asks to read from disk. Which state does it move to?",
      choices: ["Blocked", "Ready", "Running"],
      answer: 0,
      why: "It cannot continue until the I/O finishes, so it is blocked. When the data arrives it becomes ready.",
    },
    {
      q: "Which scheduling algorithm guarantees that no process is starved?",
      choices: [
        "Round robin",
        "Shortest job first",
        "Shortest remaining time",
      ],
      answer: 0,
      why: "Round robin gives every process a turn. Shortest-job approaches can leave long jobs waiting forever.",
    },
    {
      q: "What is disk thrashing?",
      choices: [
        "The system spends most of its time swapping pages instead of doing work",
        "The hard disk physically vibrating",
        "Too many files being deleted at once",
      ],
      answer: 0,
      why: "It happens when there is too little RAM, so virtual memory swaps constantly.",
    },
  ],
};

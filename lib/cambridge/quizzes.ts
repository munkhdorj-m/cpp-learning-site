// Self-check questions, keyed by "level/slug".
//
// Written to test understanding rather than recall where possible — the
// explanation matters more than the score, so every question has one.

export interface QuizQuestion {
  q: string;
  choices: string[];
  answer: number;
  why: string;
}

export const QUIZZES: Record<string, QuizQuestion[]> = {
  "igcse/number-systems": [
    {
      q: "What is 1101 in binary as a denary number?",
      choices: ["13", "11", "14"],
      answer: 0,
      why: "8 + 4 + 0 + 1 = 13.",
    },
    {
      q: "Why do people use hexadecimal rather than binary?",
      choices: [
        "It is shorter and easier to read without mistakes",
        "Computers can only understand hexadecimal",
        "It stores more information in the same space",
      ],
      answer: 0,
      why: "The computer still works in binary. Hex is purely for humans — it is far shorter and easier to copy correctly.",
    },
    {
      q: "A number is shifted LEFT by 1 place. What happens to its value?",
      choices: ["It doubles", "It halves", "It stays the same"],
      answer: 0,
      why: "Each left shift multiplies by 2; each right shift divides by 2.",
    },
    {
      q: "Adding two 8-bit numbers gives a 9-bit result. What is this called?",
      choices: ["Overflow", "Truncation", "Rounding"],
      answer: 0,
      why: "Overflow — the answer needs more bits than are available, so it cannot be stored correctly.",
    },
  ],

  "igcse/text-sound-images": [
    {
      q: "An image is 200 × 100 pixels with a colour depth of 8 bits. What is its size in bytes?",
      choices: ["20 000 bytes", "160 000 bytes", "2 000 bytes"],
      answer: 0,
      why: "200 × 100 × 8 = 160 000 bits. Divide by 8 to get 20 000 bytes.",
    },
    {
      q: "What is the effect of INCREASING the sample rate of a sound recording?",
      choices: [
        "Better quality, but a larger file",
        "Better quality and a smaller file",
        "Worse quality and a larger file",
      ],
      answer: 0,
      why: "More samples per second means a closer match to the original wave — but more data to store.",
    },
    {
      q: "Why can Unicode represent Mongolian text when ASCII cannot?",
      choices: [
        "Unicode uses more bits per character, so it has room for far more characters",
        "Unicode compresses the text",
        "ASCII is older and slower",
      ],
      answer: 0,
      why: "ASCII's 7 bits give only 128 characters. Unicode uses more bits, covering every writing system.",
    },
  ],

  "igcse/storage-compression": [
    {
      q: "Which type of compression must be used for a program file?",
      choices: ["Lossless", "Lossy", "Either would work"],
      answer: 0,
      why: "Losing even one bit of a program would corrupt it, so nothing may be thrown away.",
    },
    {
      q: "Run-length encoding turns 'aaaabbb' into '4a3b'. Is any data lost?",
      choices: [
        "No — the original can be rebuilt exactly",
        "Yes — the repeated letters are gone",
        "Only if the file is an image",
      ],
      answer: 0,
      why: "RLE is lossless. '4a3b' contains everything needed to write 'aaaabbb' back out.",
    },
  ],

  "igcse/data-transmission": [
    {
      q: "Why is parallel transmission unsuitable over long distances?",
      choices: [
        "Bits arrive at slightly different times and get mixed up (skew)",
        "Parallel cables cannot be made longer than 1 metre",
        "It can only send in one direction",
      ],
      answer: 0,
      why: "Skew — over distance the bits on different wires drift out of step.",
    },
    {
      q: "A phone call, where both people can talk at once, is an example of:",
      choices: ["Full-duplex", "Half-duplex", "Simplex"],
      answer: 0,
      why: "Full-duplex means data flows both ways at the same time.",
    },
    {
      q: "Why might packets arrive out of order?",
      choices: [
        "Each packet can take a different route through the network",
        "The sender numbers them incorrectly",
        "Packets are always sent backwards",
      ],
      answer: 0,
      why: "Routes are chosen per packet, so some take longer. The packet numbers let the receiver reassemble them.",
    },
  ],

  "igcse/error-detection": [
    {
      q: "Why can a single parity check MISS an error?",
      choices: [
        "If two bits flip, the parity still matches",
        "Parity only works on hexadecimal",
        "Parity cannot be used on bytes",
      ],
      answer: 0,
      why: "Parity only detects an odd number of flipped bits — two errors cancel out.",
    },
    {
      q: "Which check can identify exactly WHICH bit is wrong?",
      choices: ["A parity block check", "A single parity bit", "An echo check"],
      answer: 0,
      why: "Parity across both rows and columns — the wrong bit is where the failing row and column cross.",
    },
  ],

  "igcse/computer-architecture": [
    {
      q: "Which register holds the address of the NEXT instruction?",
      choices: ["Program counter", "Accumulator", "MDR"],
      answer: 0,
      why: "The PC holds the address of the next instruction and increases during each fetch.",
    },
    {
      q: "In the fetch stage, what is copied into the MAR?",
      choices: [
        "The address held in the program counter",
        "The instruction itself",
        "The result of the last calculation",
      ],
      answer: 0,
      why: "The MAR holds an ADDRESS; the MDR holds the DATA fetched from it.",
    },
    {
      q: "Why does a larger cache make a computer faster?",
      choices: [
        "More frequently used data is kept near the CPU, so it waits less for slow RAM",
        "It increases the clock speed",
        "It adds more processor cores",
      ],
      answer: 0,
      why: "Cache is much faster than RAM, so more cache means fewer slow trips to main memory.",
    },
  ],

  "igcse/data-storage": [
    {
      q: "Which statement about RAM is true?",
      choices: [
        "It is volatile and can be both read from and written to",
        "It is non-volatile and read-only",
        "It holds the start-up instructions",
      ],
      answer: 0,
      why: "RAM loses its contents without power. ROM is the non-volatile, read-only one holding start-up instructions.",
    },
    {
      q: "Why is an SSD more robust than a hard disk drive?",
      choices: [
        "It has no moving parts",
        "It is always larger",
        "It never wears out",
      ],
      answer: 0,
      why: "No moving parts means knocks are far less likely to damage it. It does, however, have a limited number of write cycles.",
    },
    {
      q: "What causes disk thrashing?",
      choices: [
        "Too little RAM, so the system spends its time swapping pages to disk",
        "The hard disk spinning too fast",
        "Too many files stored in the cloud",
      ],
      answer: 0,
      why: "When RAM is short, virtual memory swaps constantly and real work stops.",
    },
  ],

  "igcse/cyber-security": [
    {
      q: "What is the difference between phishing and pharming?",
      choices: [
        "Phishing needs you to click a link; pharming redirects you even if you type the correct address",
        "They are two words for the same attack",
        "Pharming only affects farms and agriculture systems",
      ],
      answer: 0,
      why: "Pharming uses malicious code to redirect you, so being careful about links does not protect you.",
    },
    {
      q: "Which malware ENCRYPTS your files and demands payment?",
      choices: ["Ransomware", "Adware", "Spyware"],
      answer: 0,
      why: "Ransomware locks the files and asks for money for the key.",
    },
    {
      q: "What does a firewall actually do?",
      choices: [
        "Monitors traffic entering and leaving, blocking anything against its rules",
        "Removes viruses already on the computer",
        "Encrypts all your files",
      ],
      answer: 0,
      why: "It filters traffic against a set of criteria. Removing existing viruses is anti-malware's job.",
    },
  ],

  "igcse/software-types": [
    {
      q: "Which is the main difference between a compiler and an interpreter?",
      choices: [
        "A compiler translates the whole program at once; an interpreter goes line by line",
        "A compiler is only for Python",
        "An interpreter produces an executable file",
      ],
      answer: 0,
      why: "The interpreter stops at the first error, which is why it suits learning; the compiler reports all errors at the end and produces an executable.",
    },
    {
      q: "What happens FIRST when an interrupt occurs?",
      choices: [
        "The current state is saved onto a stack",
        "The computer restarts",
        "The program is deleted from memory",
      ],
      answer: 0,
      why: "The state must be saved so work can resume exactly where it stopped after the ISR runs.",
    },
  ],

  "igcse/pseudocode": [
    {
      q: "In Cambridge pseudocode, which symbol assigns a value?",
      choices: ["←", "=", "=="],
      answer: 0,
      why: "Assignment uses a left arrow. Using = for assignment can lose marks.",
    },
    {
      q: "Where must a total be set to 0?",
      choices: [
        "Before the loop starts",
        "Inside the loop, at the top",
        "After the loop finishes",
      ],
      answer: 0,
      why: "Inside the loop it would reset every time. This is the most commonly lost mark on Paper 2.",
    },
    {
      q: "Trace: X ← 8, then WHILE X > 4 DO X ← X - 2, OUTPUT X. What is printed?",
      choices: ["6 4", "8 6 4", "6"],
      answer: 0,
      why: "X becomes 6 (printed), then 4 (printed). 4 is not > 4, so the loop stops.",
    },
    {
      q: "Which loop is guaranteed to run at least once?",
      choices: ["REPEAT … UNTIL", "WHILE … ENDWHILE", "FOR … NEXT"],
      answer: 0,
      why: "REPEAT tests the condition at the END, so the body always runs once.",
    },
  ],

  "igcse/programming-concepts": [
    {
      q: "A birth year of 3025 is entered. Which check would reject it?",
      choices: ["A range check", "A presence check", "A format check"],
      answer: 0,
      why: "A range check tests whether a value is between sensible limits.",
    },
    {
      q: "Typing a password twice to make sure it matches is:",
      choices: ["Verification", "Validation", "Encryption"],
      answer: 0,
      why: "Verification checks the data was ENTERED accurately. Validation checks it is sensible.",
    },
    {
      q: "What does 17 MOD 5 give?",
      choices: ["2", "3", "3.4"],
      answer: 0,
      why: "MOD gives the remainder: 17 = 3×5 + 2. DIV would give 3.",
    },
  ],

  "igcse/arrays": [
    {
      q: "An array is DECLARE A : ARRAY[1:10] OF INTEGER. How many values can it hold?",
      choices: ["10", "9", "11"],
      answer: 0,
      why: "The bounds 1 to 10 inclusive give ten elements.",
    },
    {
      q: "Why does swapping two array elements need a third variable?",
      choices: [
        "Otherwise the first value is overwritten and lost",
        "Because arrays cannot be changed",
        "To make the program run faster",
      ],
      answer: 0,
      why: "A ← B destroys A's value before it can be copied into B. Temp holds it safely.",
    },
  ],

  "igcse/databases": [
    {
      q: "What makes a good primary key?",
      choices: [
        "It is unique for every record and is never empty",
        "It is always the person's name",
        "It can be repeated across records",
      ],
      answer: 0,
      why: "Uniqueness is the whole point — it identifies exactly one record.",
    },
    {
      q: "Which data type should store a phone number?",
      choices: ["Text", "Integer", "Real"],
      answer: 0,
      why: "Phone numbers can begin with 0 and you never do arithmetic on them, so they are text.",
    },
    {
      q: "Which SQL returns names of students with a mark above 50, highest first?",
      choices: [
        "SELECT Name FROM Results WHERE Mark > 50 ORDER BY Mark DESC;",
        "SELECT Name FROM Results ORDER BY Mark WHERE Mark > 50;",
        "FROM Results SELECT Name WHERE Mark > 50;",
      ],
      answer: 0,
      why: "The clause order is fixed: SELECT, FROM, WHERE, then ORDER BY.",
    },
  ],

  "igcse/boolean-logic": [
    {
      q: "For which inputs does XOR output 1?",
      choices: [
        "When the inputs are different",
        "When both inputs are 1",
        "When both inputs are 0",
      ],
      answer: 0,
      why: "XOR means one or the other but NOT both — so 0,1 and 1,0 give 1.",
    },
    {
      q: "A NAND gate with both inputs set to 1 outputs:",
      choices: ["0", "1", "It depends on the circuit"],
      answer: 0,
      why: "NAND is AND with the output inverted: 1 AND 1 = 1, inverted gives 0.",
    },
    {
      q: "A circuit has 3 inputs. How many rows does its truth table need?",
      choices: ["8", "6", "3"],
      answer: 0,
      why: "2³ = 8 — every combination of three inputs.",
    },
  ],

  "as/information-representation": [
    {
      q: "In 8-bit two's complement, what is −5?",
      choices: ["11111011", "10000101", "11111010"],
      answer: 0,
      why: "5 is 00000101. Invert to 11111010, then add 1 to get 11111011.",
    },
    {
      q: "What is the range of an 8-bit two's complement number?",
      choices: ["−128 to +127", "−127 to +128", "0 to 255"],
      answer: 0,
      why: "One bit is the sign. The range is not symmetrical because zero takes a positive slot.",
    },
    {
      q: "Which image type stays sharp at any size?",
      choices: ["Vector", "Bitmap", "Both equally"],
      answer: 0,
      why: "A vector stores drawing instructions, so it is redrawn cleanly at any scale. A bitmap becomes blocky.",
    },
  ],

  "as/processor-fundamentals": [
    {
      q: "An address bus has 16 lines. How many memory locations can it address?",
      choices: ["65 536", "16", "256"],
      answer: 0,
      why: "2¹⁶ = 65 536. n lines address 2ⁿ locations.",
    },
    {
      q: "In LDM #20, what does the processor load?",
      choices: [
        "The number 20 itself",
        "Whatever is stored at address 20",
        "The address of address 20",
      ],
      answer: 0,
      why: "The # marks immediate addressing — the operand IS the value.",
    },
  ],

  "as/databases-as": [
    {
      q: "A table is in 1NF but a non-key field depends on another non-key field. Which form does it break?",
      choices: ["3NF", "2NF", "It is already in 3NF"],
      answer: 0,
      why: "3NF forbids a non-key field depending on another non-key field.",
    },
    {
      q: "CREATE TABLE is an example of:",
      choices: ["DDL", "DML", "A query"],
      answer: 0,
      why: "DDL defines structure. DML (SELECT, INSERT, UPDATE, DELETE) works with the data.",
    },
    {
      q: "What does referential integrity prevent?",
      choices: [
        "A foreign key pointing at a record that does not exist",
        "Two users editing at once",
        "Data being encrypted",
      ],
      answer: 0,
      why: "It keeps relationships valid — no orders for customers who were never created.",
    },
  ],

  "as/algorithm-design": [
    {
      q: "What must be true before a binary search will work?",
      choices: [
        "The data must be sorted",
        "The data must be numbers",
        "The array must have an even number of items",
      ],
      answer: 0,
      why: "Binary search discards half the data each step based on order, so unsorted data breaks it.",
    },
    {
      q: "After one full pass of a bubble sort, what is guaranteed?",
      choices: [
        "The largest value is in its final position",
        "The whole array is sorted",
        "The smallest value is first",
      ],
      answer: 0,
      why: "Each pass bubbles the largest remaining value to the end.",
    },
  ],

  "as/programming-as": [
    {
      q: "A procedure changes a parameter passed BYVALUE. What happens to the caller's variable?",
      choices: [
        "Nothing — it only received a copy",
        "It changes too",
        "The program crashes",
      ],
      answer: 0,
      why: "BYVALUE passes a copy. Use BYREF if the change must be seen by the caller.",
    },
    {
      q: "Which should you use when the code must give a value back for use in an expression?",
      choices: ["A function", "A procedure", "Either"],
      answer: 0,
      why: "A FUNCTION returns a value; a PROCEDURE performs an action and is CALLed.",
    },
  ],

  "a-level/computational-thinking": [
    {
      q: "What happens if a recursive function has no reachable base case?",
      choices: [
        "It calls itself forever until the call stack overflows",
        "It returns 0",
        "The compiler removes it",
      ],
      answer: 0,
      why: "Each call adds a stack frame. With no base case the stack fills and overflows.",
    },
    {
      q: "Which traversal of a binary search tree gives the values in sorted order?",
      choices: ["In-order", "Pre-order", "Post-order"],
      answer: 0,
      why: "In-order visits left, then node, then right — which is ascending order in a BST.",
    },
    {
      q: "A stack is:",
      choices: [
        "Last in, first out",
        "First in, first out",
        "Sorted at all times",
      ],
      answer: 0,
      why: "Push and pop happen at the same end. A queue is the first-in-first-out one.",
    },
    {
      q: "What is the Big O complexity of a binary search?",
      choices: ["O(log n)", "O(n)", "O(n²)"],
      answer: 0,
      why: "Each comparison halves what is left, so the work grows logarithmically.",
    },
  ],

  "a-level/further-programming": [
    {
      q: "Why are class attributes usually private?",
      choices: [
        "So changes go through methods that can validate them first",
        "To make the program run faster",
        "Because public attributes are not allowed",
      ],
      answer: 0,
      why: "Encapsulation lets the class protect itself from being put into an invalid state.",
    },
    {
      q: "A subclass provides its own version of a method that its superclass already has. This is:",
      choices: ["Polymorphism", "Encapsulation", "Instantiation"],
      answer: 0,
      why: "The same method name behaves differently depending on the object's class.",
    },
  ],

  "a-level/security-a": [
    {
      q: "In a digital signature, which key does the SENDER use?",
      choices: [
        "Their own private key",
        "Their own public key",
        "The receiver's private key",
      ],
      answer: 0,
      why: "The sender encrypts the hash with their PRIVATE key; anyone can then verify it with the matching public key.",
    },
    {
      q: "Why do real systems use asymmetric encryption to agree a symmetric key?",
      choices: [
        "Asymmetric solves key exchange, symmetric is faster for the data",
        "Symmetric encryption is not secure",
        "Asymmetric cannot encrypt large messages at all",
      ],
      answer: 0,
      why: "You get safe key exchange from one and speed from the other.",
    },
  ],

  "a-level/artificial-intelligence": [
    {
      q: "Training a model on emails already labelled 'spam' or 'not spam' is:",
      choices: ["Supervised learning", "Unsupervised learning", "Reinforcement learning"],
      answer: 0,
      why: "The correct answers are known in advance, which is what makes it supervised.",
    },
    {
      q: "Why does A* usually examine fewer nodes than Dijkstra?",
      choices: [
        "It uses a heuristic estimate of the distance still to go",
        "It ignores edge weights",
        "It only works on small graphs",
      ],
      answer: 0,
      why: "The heuristic steers it towards the goal instead of exploring evenly in all directions.",
    },
  ],

  "a-level/data-representation-a": [
    {
      q: "Why is a floating-point number normalised?",
      choices: [
        "To give one unique representation and the most precision",
        "To make the number smaller",
        "To convert it to denary",
      ],
      answer: 0,
      why: "Leading zeros in the mantissa waste bits, and without a rule the same value could be stored many ways.",
    },
    {
      q: "More bits given to the exponent means:",
      choices: [
        "A greater range but less precision",
        "Greater precision and greater range",
        "No change at all",
      ],
      answer: 0,
      why: "The total bits are fixed, so range and precision trade against each other.",
    },
  ],
};

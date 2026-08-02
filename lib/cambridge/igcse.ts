// IGCSE Computer Science 0478 / 0984 — every unit of the syllabus.
//
// Order and numbering follow the syllabus contents page so a student can read
// alongside the textbook.

import type { Topic } from "./types";

const P1 = "Paper 1 — Computer Systems";
const P2 = "Paper 2 — Algorithms, Programming and Logic";

export const IGCSE_TOPICS: Topic[] = [
  // ── 1.1 Data representation ────────────────────────────────────────────
  {
    slug: "number-systems",
    level: "igcse",
    unit: P1,
    ref: "1.1.1",
    title: "Number Systems",
    summary:
      "Computers only store 0s and 1s. This is how ordinary numbers turn into those, and back.",
    objectives: [
      "Understand that computers use binary because a circuit is either on or off.",
      "Convert positive denary numbers to binary and back (up to 16 bits).",
      "Convert positive denary numbers to hexadecimal and back.",
      "Convert between binary and hexadecimal.",
      "Add two binary numbers and identify when overflow has happened.",
      "Perform a logical binary shift and describe its effect.",
      "Describe where hexadecimal is used and why.",
    ],
    terms: [
      { term: "Bit", def: "A single 0 or 1 — the smallest piece of data." },
      { term: "Nibble", def: "4 bits. Exactly one hexadecimal digit." },
      { term: "Byte", def: "8 bits." },
      {
        term: "Overflow",
        def: "The answer needs more bits than are available, so it cannot be stored correctly.",
      },
    ],
    notes: [
      {
        heading: "Denary → binary: take what fits",
        body: "Write the place values down first, then go left to right. At each one ask: does it fit in what is left? If yes write 1 and subtract it; if no write 0. Here is 200.",
        code: `128  64  32  16   8   4   2   1
  1   1   0   0   1   0   0   0

128 fits  -> 200 - 128 = 72
 64 fits  ->  72 -  64 =  8
 32 no,  16 no
  8 fits  ->   8 -   8 =  0
answer: 11001000`,
      },
      {
        heading: "Binary → denary: add up the 1s",
        body: "Write the place values above the digits and add the ones with a 1 underneath.",
        code: `  1   0   1   1   0   1
 32  16   8   4   2   1
 32 +      8 + 4 +     1  =  45`,
      },
      {
        heading: "Hexadecimal is binary in groups of four",
        body: "Split the binary into nibbles from the RIGHT, then convert each nibble on its own. This is the whole trick — you never need to divide by 16.",
        code: `1100 1000
  |    |
  C    8      ->  C8

A=10  B=11  C=12  D=13  E=14  F=15`,
      },
      {
        heading: "Binary addition, and spotting overflow",
        body: "Add column by column, carrying just like denary. 1+1 = 10 (write 0, carry 1). If a carry falls off the left-hand end and you only have that many bits, that is overflow — the answer is wrong and you must say so.",
        code: `  1 0 1 1   (11)
+ 0 1 1 0   (6)
---------
1 0 0 0 1   (17)

In 4 bits only 0001 could be stored -> OVERFLOW`,
      },
      {
        heading: "Logical shifts",
        body: "Shifting left by 1 multiplies by 2; shifting right by 1 divides by 2 (whole number). Zeros come in at the empty end, and any bits pushed off the end are LOST — always mention the loss if the question asks about the effect.",
        code: `0000 1010  = 10
shift LEFT 1
0001 0100  = 20

0000 1010  = 10
shift RIGHT 1
0000 0101  = 5`,
      },
    ],
    examTips: [
      "Show your working — place values and subtractions earn method marks even if the final number is wrong.",
      "'Why hexadecimal?' is always a question about people, not computers: it is shorter, easier to read and easier to copy without mistakes than long binary.",
      "Hex is used for MAC addresses, IP (v6) addresses, colour codes, memory addresses, error codes and assembly.",
    ],
  },
  {
    slug: "text-sound-images",
    level: "igcse",
    unit: P1,
    ref: "1.1.2",
    title: "Text, Sound and Images",
    summary:
      "Everything on a computer — letters, music, photos — is stored as numbers. This is how.",
    objectives: [
      "Explain how characters are stored using a character set (ASCII, Unicode).",
      "Explain how sound is sampled and stored.",
      "Describe sample rate and sample resolution, and their effect on quality and file size.",
      "Explain how an image is stored as pixels.",
      "Describe resolution and colour depth, and their effect on quality and file size.",
      "Calculate the file size of an image or a sound file.",
    ],
    terms: [
      {
        term: "Character set",
        def: "An agreed list matching every character to a unique binary code.",
      },
      {
        term: "Sample rate",
        def: "How many times per second the sound wave is measured, in Hz.",
      },
      {
        term: "Sample resolution",
        def: "How many bits are used for each sample.",
      },
      { term: "Pixel", def: "The smallest single dot in an image." },
      {
        term: "Colour depth",
        def: "The number of bits used to store the colour of one pixel.",
      },
      {
        term: "Resolution",
        def: "The number of pixels — usually given as width × height.",
      },
    ],
    notes: [
      {
        heading: "ASCII and Unicode",
        body: "ASCII uses 7 bits, so it can represent 128 characters — enough for English but not for Mongolian, Chinese or emoji. Unicode uses more bits per character so it covers every writing system, but the files are larger.",
      },
      {
        heading: "How sound is captured",
        body: "A microphone produces a smooth (analogue) wave. The computer measures its height many times a second and stores each measurement as a binary number. More measurements per second, and more bits per measurement, means a recording closer to the original — and a bigger file.",
      },
      {
        heading: "File size calculations",
        body: "Learn both formulas and always state the unit. Divide bits by 8 for bytes, then by 1024 for KB.",
        code: `IMAGE
  size (bits) = width × height × colour depth

  100 × 100 pixels, 24-bit colour
  = 100 × 100 × 24 = 240 000 bits
  = 30 000 bytes ≈ 29.3 KB

SOUND
  size (bits) = sample rate × resolution × seconds

  44 100 Hz, 16 bit, 30 seconds
  = 44 100 × 16 × 30 = 21 168 000 bits
  = 2 646 000 bytes ≈ 2.52 MB`,
      },
    ],
    examTips: [
      "If asked for the EFFECT of increasing sample rate or colour depth, give BOTH sides: better quality AND larger file size.",
      "Write the formula down before substituting numbers — the formula itself often earns a mark.",
    ],
  },
  {
    slug: "storage-compression",
    level: "igcse",
    unit: P1,
    ref: "1.1.3",
    title: "Data Storage and Compression",
    summary:
      "Measuring how much space data takes, and two ways of making files smaller.",
    objectives: [
      "Use the units bit, nibble, byte, kibibyte, mebibyte, gibibyte, tebibyte, pebibyte and exbibyte.",
      "Calculate the file size of an image or sound file in appropriate units.",
      "Explain the need for data compression.",
      "Describe how lossy and lossless compression work, and when each is used.",
    ],
    terms: [
      {
        term: "Lossless compression",
        def: "Every original bit can be recovered exactly — nothing is thrown away.",
      },
      {
        term: "Lossy compression",
        def: "Some data is permanently removed to make the file much smaller.",
      },
      {
        term: "Run-length encoding (RLE)",
        def: "A lossless method that replaces a run of repeated values with the value and how many times it repeats.",
      },
    ],
    notes: [
      {
        heading: "The units go up in 1024s",
        body: "Cambridge uses the 'bi' units, which are powers of 2. Learn the ladder in order.",
        code: `8 bits            = 1 byte
1024 bytes        = 1 kibibyte  (KiB)
1024 KiB          = 1 mebibyte  (MiB)
1024 MiB          = 1 gibibyte  (GiB)
1024 GiB          = 1 tebibyte  (TiB)
1024 TiB          = 1 pebibyte  (PiB)
1024 PiB          = 1 exbibyte  (EiB)`,
      },
      {
        heading: "Run-length encoding, worked",
        body: "RLE is lossless: you can rebuild the original exactly. It only helps when there are long runs of the same value — on a noisy photo it can even make the file bigger.",
        code: `Original:  w w w w w b b w w w
RLE:       5w 2b 3w

10 items -> 6 items, and no information lost.`,
      },
      {
        heading: "Choosing lossy or lossless",
        body: "Lossy (JPEG, MP3) is fine for photos and music, because the removed detail is hard for a human to notice. Lossless (PNG, ZIP) must be used where every bit matters: text documents, spreadsheets, program files, medical scans.",
      },
    ],
    examTips: [
      "Why compress? Faster to download or stream, uses less storage, uses less bandwidth, quicker to email.",
      "If the question involves a text file or a program, the answer is lossless — losing bits would corrupt it.",
    ],
  },

  // ── 1.2 Data transmission ──────────────────────────────────────────────
  {
    slug: "data-transmission",
    level: "igcse",
    unit: P1,
    ref: "1.2.1",
    title: "Types and Methods of Data Transmission",
    summary:
      "How data is chopped into packets and sent down a wire — one bit at a time or several at once.",
    objectives: [
      "Describe a data packet: packet header, payload and trailer.",
      "Describe packet switching and explain why packets may arrive out of order.",
      "Compare serial and parallel transmission.",
      "Compare simplex, half-duplex and full-duplex.",
      "Describe the Universal Serial Bus (USB) and give its benefits and drawbacks.",
    ],
    terms: [
      {
        term: "Packet header",
        def: "Holds the sender's and receiver's IP address and the packet number.",
      },
      { term: "Payload", def: "The actual data being carried." },
      {
        term: "Trailer",
        def: "Marks the end of the packet and holds an error-checking value.",
      },
      {
        term: "Simplex",
        def: "One direction only, e.g. a computer to a printer.",
      },
      {
        term: "Half-duplex",
        def: "Both directions, but only one at a time, e.g. a walkie-talkie.",
      },
      {
        term: "Full-duplex",
        def: "Both directions at the same time, e.g. a phone call.",
      },
    ],
    notes: [
      {
        heading: "Packet switching, step by step",
        body: "The message is split into packets. Each packet is numbered and sent, and each can take a different route depending on how busy the network is. They may therefore arrive out of order, so the receiver uses the packet numbers to put them back together. Anything missing is requested again.",
      },
      {
        heading: "Serial vs parallel — distance decides",
        body: "Serial sends one bit at a time down a single wire: slower per moment, but reliable over long distances. Parallel sends several bits at once down several wires: faster, but over distance the bits arrive at slightly different times (skew) and get mixed up. That is why parallel is only used over very short distances, like inside the computer.",
      },
      {
        heading: "USB in one paragraph",
        body: "USB is serial transmission. Benefits: the plug only fits one way, it is a universal standard, it is fast, and it can charge the device and install drivers automatically. Drawbacks: the cable is limited to about 5 m, and older versions have a lower transfer rate.",
      },
    ],
    examTips: [
      "'Give two benefits of USB' wants concrete points — do not just say 'it is good'.",
      "Skew is the exam word for parallel bits arriving at different times. Use it.",
    ],
  },
  {
    slug: "error-detection",
    level: "igcse",
    unit: P1,
    ref: "1.2.2",
    title: "Methods of Error Detection",
    summary:
      "Data can be corrupted on the way. These are the checks that spot it.",
    objectives: [
      "Explain why errors can occur during transmission.",
      "Describe a parity check (odd and even), including a parity block check.",
      "Describe a checksum and an echo check.",
      "Describe a check digit.",
      "Describe an automatic repeat query (ARQ).",
    ],
    notes: [
      {
        heading: "Parity check",
        body: "One bit of every byte is reserved as the parity bit. With EVEN parity the total number of 1s must be even; with ODD parity it must be odd. The sender sets the bit, the receiver counts — if the count is wrong, an error happened.",
        code: `Even parity, data 0110100 (three 1s)
parity bit must make it even -> 1
sent as: 1 0110100   (four 1s)

If the receiver counts an odd number of 1s,
the data was corrupted.`,
      },
      {
        heading: "Why parity alone is weak",
        body: "Parity only spots an ODD number of flipped bits. If two bits flip, the count is still even and the error slips through. It also cannot tell you WHICH bit is wrong. A parity block check fixes both by running parity across rows and columns — where the failing row and failing column cross is the wrong bit.",
      },
      {
        heading: "Checksum, echo check, check digit",
        body: "Checksum: a value is calculated from the data, sent with it, recalculated on arrival and compared. Echo check: the receiver sends the data back and the sender compares — simple, but it doubles the traffic and cannot tell which copy got corrupted. Check digit: an extra digit calculated from the others, used on barcodes and ISBNs to catch typing mistakes.",
      },
      {
        heading: "ARQ",
        body: "The receiver checks each packet and sends back a positive acknowledgement if it is fine, or a request to resend if not. If the sender hears nothing before a timeout, it resends anyway. It keeps resending until acknowledged or a limit is reached.",
      },
    ],
    examTips: [
      "For 'why is parity not reliable', the mark is for saying two errors can cancel out.",
      "Check digit catches transcription errors (wrong digit) and transposition errors (two digits swapped).",
    ],
  },
  {
    slug: "encryption-igcse",
    level: "igcse",
    unit: P1,
    ref: "1.2.3",
    title: "Encryption",
    summary:
      "Scrambling data so that stealing it is pointless without the key.",
    objectives: [
      "Explain the purpose of encryption.",
      "Explain how data is encrypted with symmetric and asymmetric encryption.",
      "Use the terms plaintext, ciphertext, key, public key and private key.",
    ],
    terms: [
      { term: "Plaintext", def: "The original readable data." },
      { term: "Ciphertext", def: "The scrambled data after encryption." },
      { term: "Key", def: "The value used to encrypt and/or decrypt." },
    ],
    notes: [
      {
        heading: "What encryption does and does not do",
        body: "Encryption does NOT stop data being intercepted. It makes the intercepted data meaningless without the key. Say that precisely — 'it stops hackers' is not enough for the mark.",
      },
      {
        heading: "Symmetric vs asymmetric",
        body: "Symmetric uses the SAME key to encrypt and decrypt, so it is fast — but that key must somehow be sent to the other person safely, which is the weakness. Asymmetric uses a pair: the PUBLIC key encrypts and can be given to anyone, and only the matching PRIVATE key can decrypt. That solves the key-sharing problem.",
        code: `Symmetric   :  key A encrypts, key A decrypts
Asymmetric  :  public key encrypts
               private key decrypts (kept secret)`,
      },
    ],
  },

  // ── 1.3 Hardware ───────────────────────────────────────────────────────
  {
    slug: "computer-architecture",
    level: "igcse",
    unit: P1,
    ref: "1.3.1",
    title: "Computer Architecture",
    summary:
      "What is inside the processor, and the cycle it repeats billions of times a second.",
    objectives: [
      "Describe the role of the CPU.",
      "Describe the von Neumann model: ALU, control unit, registers and buses.",
      "Describe the purpose of the MAR, MDR, program counter and accumulator.",
      "Describe the fetch–decode–execute cycle.",
      "Explain how clock speed, cache size and number of cores affect performance.",
      "Describe embedded systems and give examples.",
    ],
    terms: [
      {
        term: "ALU",
        def: "Arithmetic Logic Unit — does the calculations and logical comparisons.",
      },
      {
        term: "Control unit",
        def: "Decodes instructions and sends signals telling other parts what to do.",
      },
      { term: "MAR", def: "Holds the ADDRESS being read from or written to." },
      { term: "MDR", def: "Holds the DATA that was read, or is to be written." },
      {
        term: "Program counter (PC)",
        def: "Holds the address of the NEXT instruction.",
      },
      { term: "Accumulator", def: "Holds the result of the ALU's work." },
    ],
    notes: [
      {
        heading: "Fetch–decode–execute, in the right order",
        body: "Learn this as a list. Questions often give you the steps jumbled and ask you to order them, or name which register is used at a given step.",
        code: `FETCH
  1. The address in the PC is copied to the MAR
  2. The instruction at that address is fetched into the MDR
  3. The PC increases by 1, ready for the next instruction

DECODE
  4. The control unit works out what the instruction means

EXECUTE
  5. The instruction is carried out
     (the ALU does it if it is a calculation;
      the result goes to the accumulator)`,
      },
      {
        heading: "The three buses",
        body: "Address bus: carries addresses, and is ONE-WAY (from the CPU). Data bus: carries the actual data, and is TWO-WAY. Control bus: carries control signals such as read/write, and is two-way.",
      },
      {
        heading: "Making a computer faster",
        body: "Higher clock speed = more cycles per second = more instructions. More cores = genuinely different instructions at the same time. Bigger cache = more frequently used data kept close to the CPU, so less waiting for slow RAM. Always explain WHY, not just what.",
      },
      {
        heading: "Embedded systems",
        body: "A computer built into a larger device to do one dedicated job: a washing machine, a microwave, traffic lights, a car engine management system. They are cheap, small, low-power and reliable, but usually hard to upgrade.",
      },
    ],
    examTips: [
      "'Explain how increasing cache improves performance' needs the chain: more data stored near the CPU → fewer fetches from RAM → RAM is slower → so the CPU waits less.",
    ],
  },
  {
    slug: "input-output-devices",
    level: "igcse",
    unit: P1,
    ref: "1.3.2",
    title: "Input and Output Devices",
    summary:
      "The devices that get data in and results out, and where each is the right choice.",
    objectives: [
      "Describe how common input devices work: barcode scanner, QR scanner, digital camera, keyboard, mouse, microphone, touch screen, 2D and 3D scanners.",
      "Describe common output devices: monitors, printers (inkjet, laser, 3D), speakers, actuators.",
      "Describe sensors and the data each collects.",
      "Give suitable uses for each device.",
    ],
    notes: [
      {
        heading: "Sensors you must know",
        body: "Each sensor measures one physical quantity and sends it as data to a system: temperature, moisture, humidity, light, infra-red, pressure, acoustic, gas, pH, magnetic field, proximity, level, motion. Be ready to pick the right one for a scenario — a greenhouse needs temperature, moisture and light; a burglar alarm needs infra-red and pressure.",
      },
      {
        heading: "Touch screen types",
        body: "Resistive: two layers pressed together — cheap, works with gloves, but poor durability and no multi-touch. Capacitive: senses the body's charge — good visibility and multi-touch, but needs bare skin or a special stylus. Infra-red: beams across the screen — works with any object, but is affected by strong light.",
      },
      {
        heading: "Printer choice",
        body: "Inkjet: excellent photo quality, cheap printer, expensive ink, slow for large jobs — good for home. Laser: fast, cheap per page, high volume — good for an office. 3D printer: builds an object in layers from a design file, used for prototypes and medical models.",
      },
    ],
  },
  {
    slug: "data-storage",
    level: "igcse",
    unit: P1,
    ref: "1.3.3",
    title: "Data Storage",
    summary:
      "Where data lives when the power is off, and the three technologies used.",
    objectives: [
      "Explain the difference between primary, secondary and off-line storage.",
      "Describe RAM and ROM and give their uses.",
      "Describe magnetic, optical and solid-state storage and how each physically works.",
      "Explain virtual memory: what it is and why it is needed.",
      "Describe cloud storage, with its benefits and drawbacks.",
    ],
    terms: [
      {
        term: "Volatile",
        def: "Contents are lost when the power is switched off (RAM).",
      },
      {
        term: "Non-volatile",
        def: "Contents are kept without power (ROM, hard disk, SSD).",
      },
    ],
    notes: [
      {
        heading: "RAM vs ROM — the table you must know",
        body: "This comparison appears almost every year.",
        code: `           RAM                     ROM
volatile?  yes                     no
read/write both                    read only
holds      programs & data in use  start-up instructions
size       large                   small
changes?   contents change often   fixed`,
      },
      {
        heading: "The three storage technologies",
        body: "Magnetic (hard disk): a spinning platter magnetised in one of two directions; large and cheap, but has moving parts so it can be damaged by knocks. Optical (CD/DVD/Blu-ray): a laser burns pits and lands into the surface and reads the reflection; cheap and portable, but small capacity and scratches easily. Solid state (SSD, USB stick): no moving parts, uses transistors that trap charge; fast, silent and robust, but more expensive per GB and has a limited number of write cycles.",
      },
      {
        heading: "Virtual memory",
        body: "When RAM is full, the least-used pages are moved out to the hard disk, freeing RAM for what is needed now. It lets you run more programs than would otherwise fit — but the disk is far slower than RAM, so heavy use causes 'disk thrashing' and the computer slows down.",
      },
      {
        heading: "Cloud storage",
        body: "Files are stored on remote servers run by a company. Benefits: access from anywhere, no need to buy hardware, automatic backup, easy sharing. Drawbacks: needs an internet connection, ongoing cost, and you are trusting someone else with your data's security.",
      },
    ],
  },
  {
    slug: "network-hardware",
    level: "igcse",
    unit: P1,
    ref: "1.3.4",
    title: "Network Hardware",
    summary: "The equipment and addresses that let computers find each other.",
    objectives: [
      "Describe the role of a network interface card (NIC), MAC address, IP address and router.",
      "Explain the difference between a MAC address and an IP address.",
      "Explain the difference between IPv4 and IPv6.",
      "Explain static and dynamic IP addressing.",
    ],
    notes: [
      {
        heading: "MAC address vs IP address",
        body: "A MAC address identifies the physical device and is set by the manufacturer — it does not change. An IP address identifies the device on a network and CAN change, for example when you connect somewhere else. Think of the MAC as the serial number and the IP as the postal address.",
        code: `MAC:  00-1A-2B-3C-4D-5E     (hex, 48 bits, fixed)
IPv4: 192.168.1.10          (denary, 32 bits)
IPv6: 2001:0db8:85a3::8a2e  (hex, 128 bits)`,
      },
      {
        heading: "Why IPv6 exists",
        body: "IPv4 has 32 bits, giving about 4 billion addresses — and the world ran out. IPv6 uses 128 bits, which is effectively unlimited, and is written in hexadecimal with colons.",
      },
      {
        heading: "Router",
        body: "A router connects networks together and directs packets towards their destination, using the IP address in the packet header to choose the route.",
      },
    ],
  },

  // ── 1.4 Software ───────────────────────────────────────────────────────
  {
    slug: "software-types",
    level: "igcse",
    unit: P1,
    ref: "1.4.1",
    title: "Types of Software and Interrupts",
    summary:
      "The two families of software, what an operating system actually does, and how a computer handles 'stop what you are doing'.",
    objectives: [
      "Describe system software and application software, with examples of each.",
      "Describe the roles of an operating system.",
      "Explain what an interrupt is, how it is generated and how it is handled.",
    ],
    notes: [
      {
        heading: "System vs application software",
        body: "System software runs the computer itself: the operating system, device drivers, utilities, compilers and linkers. Application software does a job for the user: word processor, browser, spreadsheet, photo editor, game.",
      },
      {
        heading: "What the operating system manages",
        body: "Memory, files, security, hardware and peripherals, processes (multitasking), the user interface, and user accounts. If asked for 'roles of an OS', list several of these with a few words each.",
      },
      {
        heading: "Interrupt handling",
        body: "An interrupt is a signal that makes the processor pause. The current state (register contents) is saved onto a stack, the interrupt service routine (ISR) runs, then the saved state is restored and the original work continues exactly where it left off. Examples: a key is pressed, the printer runs out of paper, a divide-by-zero happens, a timer fires.",
      },
    ],
  },
  {
    slug: "languages-translators",
    level: "igcse",
    unit: P1,
    ref: "1.4.2",
    title: "Languages, Translators and IDEs",
    summary:
      "High-level and low-level languages, the programs that translate between them, and the tools you write code in.",
    objectives: [
      "Describe high-level and low-level languages, with the benefits and drawbacks of each.",
      "Describe assembly language and the need for an assembler.",
      "Compare compilers and interpreters.",
      "Describe the common features of an Integrated Development Environment (IDE).",
    ],
    notes: [
      {
        heading: "High-level vs low-level",
        body: "High-level (Python, C++) is close to English, quick to write, easier to debug and works on different machines — but must be translated and gives less direct control. Low-level (assembly, machine code) is specific to one processor, harder to write, but allows precise control of the hardware and produces efficient code.",
      },
      {
        heading: "Compiler vs interpreter",
        body: "This comparison is examined constantly. Learn it as a table.",
        code: `                 Compiler              Interpreter
translates       whole program at once  one line at a time
produces         an executable file     nothing saved
errors           listed all at the end  stops at the first one
running speed    faster                 slower
needs translator no, once compiled      yes, every time
good for         finished software      learning and testing`,
      },
      {
        heading: "IDE features",
        body: "Code editor with syntax highlighting and auto-complete, line numbering, error diagnostics, a debugger with breakpoints and variable watches, auto line-indent, and a build/run tool. Each of these makes writing and finding mistakes in code faster.",
      },
    ],
  },

  // ── 1.5 The internet and its uses ──────────────────────────────────────
  {
    slug: "internet-www",
    level: "igcse",
    unit: P1,
    ref: "1.5.1",
    title: "The Internet and the World Wide Web",
    summary:
      "The difference between the network and the websites on it, plus what happens when you type an address.",
    objectives: [
      "Explain the difference between the internet and the World Wide Web.",
      "Describe a URL and its parts.",
      "Explain HTTP and HTTPS.",
      "Describe the purpose and function of a web browser.",
      "Explain how a web page is retrieved and displayed.",
      "Explain the use of cookies, both session and persistent.",
    ],
    notes: [
      {
        heading: "Internet ≠ World Wide Web",
        body: "The internet is the worldwide network of connected computers — the infrastructure, including email and file transfer. The World Wide Web is the collection of websites and pages that you access using that infrastructure. The web runs ON the internet.",
      },
      {
        heading: "The parts of a URL",
        body: "Know the three parts by name.",
        code: `https://www.school.edu.mn/notes/binary.html
  |            |                    |
protocol    domain name          file path`,
      },
      {
        heading: "What happens when you visit a page",
        body: "You type the URL. The browser asks a DNS server for the IP address matching the domain name. The DNS server returns the IP. The browser sends a request to that IP. The web server sends back the HTML. The browser renders it into the page you see.",
      },
      {
        heading: "Cookies",
        body: "Small text files stored by the browser. Session cookies are held in memory and disappear when the browser closes — used for a shopping basket. Persistent cookies are saved to disk and survive — used to remember logins, preferences and to target adverts.",
      },
    ],
    examTips: [
      "The S in HTTPS stands for encryption via SSL/TLS. Say the data is encrypted so it is meaningless if intercepted.",
    ],
  },
  {
    slug: "digital-currency",
    level: "igcse",
    unit: P1,
    ref: "1.5.2",
    title: "Digital Currency",
    summary: "Money that exists only electronically, and the ledger behind it.",
    objectives: [
      "Explain what digital currency is and how it is used.",
      "Explain the process of blockchain and how it tracks transactions.",
    ],
    notes: [
      {
        heading: "Blockchain in plain words",
        body: "Every transaction is recorded in a block. Each block contains the data, a timestamp, and a hash of the PREVIOUS block — which chains them together. Because changing one block would change its hash and break every block after it, tampering is obvious. Copies of the chain are held by many computers, so there is no single record to attack.",
      },
    ],
  },
  {
    slug: "cyber-security",
    level: "igcse",
    unit: P1,
    ref: "1.5.3",
    title: "Cyber Security",
    summary:
      "The threats you must be able to name, and the matching protection for each.",
    objectives: [
      "Describe brute-force attack, data interception, DDoS, hacking, malware, phishing, pharming and social engineering.",
      "Describe how each threat can be prevented or reduced.",
      "Describe the types of malware: virus, worm, trojan horse, spyware, adware, ransomware.",
      "Describe access levels, anti-malware, authentication, automatic updates, firewalls, privacy settings and proxy servers.",
    ],
    notes: [
      {
        heading: "Threat → prevention, as a pair",
        body: "Exams almost always want the matching protection, so learn them together.",
        code: `Brute-force      -> strong passwords, lock after N attempts, 2FA
Data interception-> encryption, use WPA/WPA2, avoid public Wi-Fi
DDoS             -> firewall, proxy server, traffic filtering
Hacking          -> firewalls, strong passwords, access levels
Malware          -> anti-malware software, automatic updates
Phishing         -> do not click unknown links, spam filters
Pharming         -> anti-malware, check the URL, check for HTTPS
Social engineer. -> staff training, be suspicious of urgency`,
      },
      {
        heading: "Phishing vs pharming",
        body: "Phishing needs you to click: a fake email or message tempts you to a fake site. Pharming does not: malicious code redirects you to the fake site even when you type the correct address. That difference is the mark.",
      },
      {
        heading: "The malware family",
        body: "Virus attaches to a file and needs to be run. Worm spreads by itself across a network. Trojan pretends to be useful software. Spyware records what you do, including keystrokes. Adware floods you with adverts. Ransomware encrypts your files and demands payment.",
      },
    ],
    examTips: [
      "Two-factor authentication = something you know plus something you have. Say both halves.",
      "A firewall monitors traffic in and out and blocks anything against its rules — that phrasing earns the mark.",
    ],
  },

  // ── 1.6 Automated and emerging technologies ────────────────────────────
  {
    slug: "automated-systems",
    level: "igcse",
    unit: P1,
    ref: "1.6.1",
    title: "Automated Systems",
    summary:
      "Systems that sense the world and act on it, with no human in the loop.",
    objectives: [
      "Describe how sensors, microprocessors and actuators work together.",
      "Describe automated systems in a range of contexts.",
      "Give the advantages and disadvantages of automated systems.",
    ],
    notes: [
      {
        heading: "The loop every automated system follows",
        body: "Write this sequence in any 'explain how the system works' question and adapt the nouns.",
        code: `1. The sensor takes a reading (analogue)
2. The ADC converts it to digital
3. The microprocessor compares it with a stored value
4. If action is needed it sends a signal
5. The DAC converts the signal if required
6. The actuator carries out the action
7. The loop repeats continuously`,
      },
      {
        heading: "Advantages and disadvantages",
        body: "Advantages: faster response than a human, works continuously, more accurate and consistent, safer in dangerous places, lower long-term cost. Disadvantages: expensive to set up, needs maintenance, jobs are lost, and it fails if a sensor fails.",
      },
    ],
  },
  {
    slug: "robotics",
    level: "igcse",
    unit: P1,
    ref: "1.6.2",
    title: "Robotics",
    summary: "Machines with sensors and moving parts that do physical work.",
    objectives: [
      "Describe what robotics is and give examples.",
      "Describe the characteristics of a robot.",
      "Give the advantages and disadvantages of robots.",
    ],
    notes: [
      {
        heading: "Characteristics of a robot",
        body: "It has a mechanical structure or framework, electrical components such as motors and sensors, and it is programmable — it takes instructions and can be reprogrammed for a different task.",
      },
      {
        heading: "Advantages and disadvantages",
        body: "Advantages: works 24/7 without breaks, high accuracy and consistency, can work in dangerous environments, lower running costs. Disadvantages: high initial cost, replaces human workers, cannot make judgement calls, and needs skilled staff to maintain.",
      },
    ],
  },
  {
    slug: "artificial-intelligence-igcse",
    level: "igcse",
    unit: P1,
    ref: "1.6.3",
    title: "Artificial Intelligence",
    summary: "Software that appears to reason, learn or perceive.",
    objectives: [
      "Explain what artificial intelligence is.",
      "Describe the main characteristics of AI.",
      "Describe expert systems and machine learning, and give examples.",
    ],
    notes: [
      {
        heading: "Characteristics of AI",
        body: "It collects data, has a set of rules for using that data, has the ability to reason, and — importantly — the ability to learn and adapt, improving its own performance over time.",
      },
      {
        heading: "Expert systems",
        body: "Four parts: the knowledge base (facts), the rule base (the IF…THEN rules), the inference engine (which applies the rules to the facts) and the user interface. Used for medical diagnosis, mineral prospecting, tax advice and fault-finding.",
      },
    ],
  },

  // ── 2.1 Algorithm design and problem-solving ───────────────────────────
  {
    slug: "program-development",
    level: "igcse",
    unit: P2,
    ref: "2.1.1",
    title: "Program Development Life Cycle",
    summary: "The stages a program goes through from idea to finished product.",
    objectives: [
      "Describe the stages: analysis, design, coding and testing.",
      "Describe abstraction and decomposition.",
      "Explain the purpose of test data and identify suitable test data.",
      "Describe types of error: syntax and logic.",
    ],
    notes: [
      {
        heading: "The four stages",
        body: "Analysis: work out exactly what is needed (abstraction and decomposition happen here). Design: plan the solution using structure diagrams, flowcharts and pseudocode. Coding: write and iteratively test the program. Testing: run it with carefully chosen data to prove it works.",
      },
      {
        heading: "Choosing test data",
        body: "You must be able to give an example of each type. For a rule like 'accept a mark from 0 to 100':",
        code: `Normal    : 45     should be accepted
Boundary  : 0, 100 the extreme values that ARE valid
            -1, 101 just outside, should be rejected
Abnormal  : "cat"  wrong type, should be rejected
Extreme   : 0, 100 largest/smallest acceptable`,
      },
      {
        heading: "Syntax error vs logic error",
        body: "A syntax error breaks the rules of the language, so the program will not run at all — a missing bracket or a misspelled keyword. A logic error runs perfectly but produces the wrong answer — using + where you meant −. Only testing finds logic errors.",
      },
    ],
  },
  {
    slug: "decomposition",
    level: "igcse",
    unit: P2,
    ref: "2.1.2",
    title: "Sub-systems and Decomposition",
    summary:
      "Breaking a big problem into smaller pieces that can each be solved on their own.",
    objectives: [
      "Decompose a problem into inputs, processes, storage and outputs.",
      "Use structure diagrams to show sub-systems.",
      "Understand and use flowcharts and pseudocode.",
    ],
    notes: [
      {
        heading: "Decomposing a problem",
        body: "For any scenario, list four things: what goes IN, what must be DONE with it, what must be STORED, and what comes OUT. Doing this first turns a vague question into a plan you can code.",
        code: `Problem: work out an average exam mark for a class

INPUT   : each student's mark
PROCESS : total the marks, count them, divide
STORAGE : an array of marks
OUTPUT  : the average, to 1 decimal place`,
      },
      {
        heading: "Flowchart symbols",
        body: "Learn the shapes — the wrong shape loses marks. Oval = start/stop. Parallelogram = input/output. Rectangle = process. Diamond = decision, with labelled Yes/No branches. Arrows show the flow.",
      },
    ],
  },
  {
    slug: "pseudocode",
    level: "igcse",
    unit: P2,
    ref: "2.1.3",
    title: "Pseudocode and Trace Tables",
    summary:
      "The exact style of pseudocode Cambridge uses in exams, and how to trace an algorithm by hand.",
    objectives: [
      "Read and write algorithms in Cambridge pseudocode.",
      "Use sequence, selection and iteration.",
      "Use totalling, counting, maximum, minimum and average.",
      "Complete a trace table for a given algorithm.",
      "Identify and correct errors in an algorithm.",
    ],
    notes: [
      {
        heading: "This is not Python — the exam has its own style",
        body: "Assignment uses a left arrow, keywords are capitalised, and every block is explicitly closed. You must be able to both READ and WRITE it.",
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

CASE OF Grade
   'A' : OUTPUT "Excellent"
   'B' : OUTPUT "Good"
   OTHERWISE OUTPUT "See me"
ENDCASE

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
        heading: "The five standard routines",
        body: "Almost every Paper 2 question is built from these. Learn the shape of each.",
        code: `TOTAL     Total ← 0            (before the loop!)
          Total ← Total + Number

COUNT     Count ← 0
          Count ← Count + 1

MAXIMUM   Max ← first value      (NOT 0)
          IF Number > Max THEN Max ← Number

MINIMUM   Min ← first value
          IF Number < Min THEN Min ← Number

AVERAGE   Average ← Total / Count`,
      },
      {
        heading: "Trace tables — work mechanically",
        body: "One column per variable, plus one for OUTPUT. Add a row every time any variable changes. Do not try to guess the answer: the marks are for the working, and guessing is how people go wrong.",
        code: `X ← 10
WHILE X > 6 DO
   X ← X - 2
   OUTPUT X
ENDWHILE

  X  | OUTPUT
 10  |
  8  | 8
  6  | 6      <- loop now stops, 6 is not > 6`,
      },
    ],
    examTips: [
      "Assignment is ← , not =. Using = for assignment can lose the mark.",
      "Always close blocks: ENDIF, ENDWHILE, NEXT, ENDCASE.",
      "Initialise totals and counters to 0 BEFORE the loop — this is the single most common lost mark.",
      "Seed a maximum with the first value, not 0, or negative data breaks it.",
    ],
  },

  // ── 2.2 Programming ────────────────────────────────────────────────────
  {
    slug: "programming-concepts",
    level: "igcse",
    unit: P2,
    ref: "2.2.1",
    title: "Programming Concepts",
    summary:
      "The building blocks every program is made of: data types, the three structures, and named blocks of code.",
    objectives: [
      "Use the data types integer, real, char, string and boolean.",
      "Use variables and constants, and explain the difference.",
      "Use sequence, selection and iteration (count-controlled, pre-condition and post-condition).",
      "Use the operators + − * / and integer division, MOD and DIV.",
      "Use nested statements.",
      "Write and call procedures and functions, with and without parameters.",
      "Use local and global variables appropriately.",
      "Apply validation and verification checks.",
      "Use library routines and maintain readable code.",
    ],
    terms: [
      {
        term: "Variable",
        def: "A named store whose value CAN change while the program runs.",
      },
      {
        term: "Constant",
        def: "A named store whose value is fixed and cannot change.",
      },
      {
        term: "Procedure",
        def: "A named block of code that does a job but returns no value.",
      },
      {
        term: "Function",
        def: "A named block of code that RETURNS a value.",
      },
      {
        term: "Parameter",
        def: "A value passed into a procedure or function when it is called.",
      },
    ],
    notes: [
      {
        heading: "The three loops, and when to use each",
        body: "Count-controlled when you know how many times. Pre-condition (WHILE) when it might not run at all. Post-condition (REPEAT) when it must run at least once.",
        code: `FOR i ← 1 TO 10        known number of times
   ...
NEXT i

WHILE Answer <> "y" DO  may run ZERO times
   ...
ENDWHILE

REPEAT                  always runs AT LEAST once
   ...
UNTIL Answer = "y"`,
      },
      {
        heading: "DIV and MOD",
        body: "DIV gives the whole-number part of a division; MOD gives the remainder. MOD 2 is how you test for even or odd.",
        code: `17 DIV 5 = 3      17 MOD 5 = 2
IF Number MOD 2 = 0 THEN OUTPUT "Even"`,
      },
      {
        heading: "Validation vs verification",
        body: "Validation asks 'could this be sensible?' — range, length, type, presence, format and check digit. Verification asks 'was it entered correctly?' — double entry, or a visual check by a human. They are not the same thing and exams test that you know it.",
      },
      {
        heading: "Local vs global",
        body: "A local variable exists only inside its procedure and cannot be seen outside — safer, because nothing else can change it by accident. A global variable can be used anywhere, which is convenient but makes bugs harder to find.",
      },
    ],
  },
  {
    slug: "arrays",
    level: "igcse",
    unit: P2,
    ref: "2.2.2",
    title: "Arrays",
    summary: "One name holding many values, so a loop can work through them.",
    objectives: [
      "Declare and use one-dimensional and two-dimensional arrays.",
      "Read from and write to an array using an index.",
      "Use a loop to process every element of an array.",
      "Perform a linear search and a bubble sort on an array.",
    ],
    notes: [
      {
        heading: "Declaring arrays in Cambridge pseudocode",
        body: "You state the bounds and the type. A 2-D array is indexed [row, column].",
        code: `DECLARE Scores : ARRAY[1:30] OF INTEGER
DECLARE Grid   : ARRAY[1:5, 1:5] OF CHAR

Scores[1] ← 78
Grid[2, 3] ← 'x'

FOR i ← 1 TO 30
   OUTPUT Scores[i]
NEXT i`,
      },
      {
        heading: "Linear search",
        body: "Check each element in turn until you find the target or run out. Simple, works on unsorted data, but slow on large arrays.",
        code: `Found ← FALSE
FOR i ← 1 TO 30
   IF Scores[i] = Target THEN
      Found ← TRUE
      Position ← i
   ENDIF
NEXT i`,
      },
      {
        heading: "Bubble sort",
        body: "Repeatedly compare neighbouring pairs and swap them if they are the wrong way round. After each pass the largest remaining value has 'bubbled' to the end.",
        code: `FOR Pass ← 1 TO 29
   FOR i ← 1 TO 29
      IF Scores[i] > Scores[i+1] THEN
         Temp ← Scores[i]
         Scores[i] ← Scores[i+1]
         Scores[i+1] ← Temp
      ENDIF
   NEXT i
NEXT Pass`,
      },
    ],
    examTips: [
      "A swap needs a THIRD variable. Writing A ← B then B ← A loses the original value — a classic trap.",
    ],
  },
  {
    slug: "file-handling",
    level: "igcse",
    unit: P2,
    ref: "2.2.3",
    title: "File Handling",
    summary: "Saving data so it still exists after the program closes.",
    objectives: [
      "Explain the need to store data in a file.",
      "Open, read from, write to and close a text file.",
      "Read a whole file to the end.",
    ],
    notes: [
      {
        heading: "The pattern to memorise",
        body: "Open, use, close — always close the file. Note the different modes: READ, WRITE (starts a new file) and APPEND (adds to the end).",
        code: `OPENFILE "Scores.txt" FOR WRITE
WRITEFILE "Scores.txt", "Bat,78"
CLOSEFILE "Scores.txt"

OPENFILE "Scores.txt" FOR READ
WHILE NOT EOF("Scores.txt") DO
   READFILE "Scores.txt", LineOfText
   OUTPUT LineOfText
ENDWHILE
CLOSEFILE "Scores.txt"`,
      },
      {
        heading: "Why EOF matters",
        body: "EOF stands for end of file. Without checking it, the program tries to read past the last line and crashes. Use it as the loop condition whenever you read an unknown number of lines.",
      },
    ],
  },

  // ── 2.3 Databases ──────────────────────────────────────────────────────
  {
    slug: "databases",
    level: "igcse",
    unit: P2,
    ref: "2.3",
    title: "Databases and SQL",
    summary:
      "Storing records in a table, and the language used to ask questions of them.",
    objectives: [
      "Define a single-table database with records and fields.",
      "Explain the purpose of a primary key.",
      "Choose appropriate data types for fields.",
      "Write SQL scripts using SELECT, FROM, WHERE, ORDER BY, SUM and COUNT.",
    ],
    notes: [
      {
        heading: "The vocabulary",
        body: "A TABLE holds the data. A RECORD is one row — all the information about one thing. A FIELD is one column — one piece of information. The PRIMARY KEY is the field that is unique for every record, so no two records can be confused.",
      },
      {
        heading: "The SQL you must be able to write",
        body: "The clause order is fixed: SELECT, then FROM, then WHERE, then ORDER BY. Finish with a semicolon.",
        code: `SELECT Name, Mark
FROM   Results
WHERE  Mark > 50
ORDER  BY Mark DESC;

SELECT COUNT(*) FROM Results WHERE Passed = TRUE;
SELECT SUM(Mark) FROM Results;
SELECT * FROM Results WHERE Name = 'Bat';`,
      },
      {
        heading: "Choosing field data types",
        body: "Text/varchar for names, integer for whole counts, real for measurements, Boolean for yes/no, date/time for dates. A phone number is TEXT, not a number — it can start with 0 and you never do arithmetic on it.",
      },
    ],
    examTips: [
      "Text values inside a WHERE go in single quotes: WHERE Name = 'Bat'.",
      "* means every field. Only use it when the question asks for all fields.",
    ],
  },

  // ── 2.4 Boolean logic ──────────────────────────────────────────────────
  {
    slug: "boolean-logic",
    level: "igcse",
    unit: P2,
    ref: "2.4",
    title: "Boolean Logic",
    summary:
      "The six gates every circuit is built from, and how to work out what a circuit does.",
    objectives: [
      "Recognise and use the logic gates NOT, AND, OR, NAND, NOR and XOR.",
      "Draw a logic circuit from a problem statement or logic expression.",
      "Complete a truth table for a given circuit.",
      "Write a logic expression from a circuit, and a circuit from an expression.",
    ],
    notes: [
      {
        heading: "The six gates, in one table",
        body: "Everything else depends on knowing these outputs without hesitating.",
        code: `A B | AND  OR  NAND  NOR  XOR
0 0 |  0    0    1     1    0
0 1 |  0    1    1     0    1
1 0 |  0    1    1     0    1
1 1 |  1    1    0     0    0

NOT A :  0 -> 1 ,  1 -> 0

NAND = NOT AND        NOR = NOT OR
XOR  = one or the other, but NOT both`,
      },
      {
        heading: "Building a truth table for a circuit",
        body: "Add a column for every intermediate output, not just the final one — the intermediate columns earn marks. With 3 inputs there are 8 rows; write them in binary counting order so you cannot miss one.",
        code: `Inputs in order (3 inputs = 8 rows):
000, 001, 010, 011, 100, 101, 110, 111

A B C | X = A AND B | Y = X OR C
0 0 0 |      0      |      0
0 0 1 |      0      |      1
0 1 0 |      0      |      0
...`,
      },
      {
        heading: "Turning a sentence into logic",
        body: "Look for the joining words. 'and' → AND. 'or' → OR. 'not' / 'unless' → NOT. 'either…or but not both' → XOR. Give each condition a letter first, then build the expression.",
      },
    ],
    examTips: [
      "XOR is the gate most often confused with OR. XOR gives 0 when both inputs are 1.",
      "Draw gates with the correct shape — a rounded OR is not the same as a flat-backed AND.",
    ],
  },
];

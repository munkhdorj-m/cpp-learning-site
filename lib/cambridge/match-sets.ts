// Sorting exercises: put each statement under the thing it describes.
//
// Kept as data, separate from the widget, because this is really a bank of
// exam definitions — the wording is deliberately close to how the mark
// schemes phrase them, so recognising it here is worth marks later.

export interface MatchSet {
  title: string;
  /** Shown above the groups. */
  ask: string;
  groups: { name: string; items: string[] }[];
}

export const DEVICE_KINDS: MatchSet = {
  title: "Input, output or storage",
  ask: "Sort each device by what it does for the computer.",
  groups: [
    {
      name: "Input",
      items: ["Barcode reader", "Microphone", "Sensor", "Scanner"],
    },
    {
      name: "Output",
      items: ["Actuator", "Speaker", "Projector"],
    },
    {
      name: "Storage",
      items: ["Solid state drive", "DVD", "Magnetic hard disk"],
    },
  ],
};

export const SOFTWARE_KINDS: MatchSet = {
  title: "System or application software",
  ask: "System software runs the computer; application software does a job for the user.",
  groups: [
    {
      name: "System software",
      items: ["Device driver", "Compiler", "Linker", "Disk defragmenter"],
    },
    {
      name: "Application software",
      items: ["Spreadsheet", "Web browser", "Photo editor", "Word processor"],
    },
  ],
};

export const NETWORK_HARDWARE: MatchSet = {
  title: "Network hardware",
  ask: "Match each description to the device it describes.",
  groups: [
    {
      name: "Router",
      items: [
        "Joins two different networks together",
        "Uses IP addresses to decide where to forward a packet",
      ],
    },
    {
      name: "Switch",
      items: [
        "Uses MAC addresses to send a frame only to the device it is meant for",
      ],
    },
    {
      name: "Hub",
      items: ["Broadcasts incoming data to every connected device"],
    },
    {
      name: "NIC",
      items: [
        "Gives a device the MAC address it needs to join a network",
      ],
    },
  ],
};

export const CYBER_THREATS: MatchSet = {
  title: "Cyber security threats",
  ask: "Match each description to the threat it describes.",
  groups: [
    {
      name: "Phishing",
      items: [
        "A fake email asks the user to click a link and enter their details",
      ],
    },
    {
      name: "Pharming",
      items: [
        "Malicious code sends the user to a fake site even when they type the correct address",
      ],
    },
    {
      name: "Brute-force attack",
      items: ["Software tries every combination until it finds the password"],
    },
    {
      name: "Denial of service",
      items: [
        "A server is flooded with requests so real users cannot be served",
      ],
    },
    {
      name: "Data interception",
      items: ["A packet sniffer reads data while it travels across a network"],
    },
  ],
};

export const SECURITY_MEASURES: MatchSet = {
  title: "Security measures",
  ask: "Match each measure to what it actually achieves.",
  groups: [
    {
      name: "Firewall",
      items: ["Blocks unauthorised traffic entering or leaving a network"],
    },
    {
      name: "Encryption",
      items: ["Makes intercepted data meaningless without the key"],
    },
    {
      name: "Two-factor authentication",
      items: ["Means a stolen password on its own is not enough to get in"],
    },
    {
      name: "Digital signature",
      items: [
        "Proves who sent a message and that it has not been altered",
      ],
    },
    {
      name: "Access rights",
      items: ["Limits which files each user is allowed to open or change"],
    },
  ],
};

export const OS_TASKS: MatchSet = {
  title: "What the operating system manages",
  ask: "Match each job to the part of the operating system that does it.",
  groups: [
    {
      name: "Memory management",
      items: ["Decides where in RAM each running program is placed"],
    },
    {
      name: "Process management",
      items: ["Decides which process gets the processor next"],
    },
    {
      name: "File management",
      items: [
        "Keeps track of where files are stored and who may open them",
      ],
    },
    {
      name: "Device management",
      items: ["Communicates with printers and disks through their drivers"],
    },
    {
      name: "Security management",
      items: ["Handles user accounts, passwords and access rights"],
    },
  ],
};

export const SENSORS: MatchSet = {
  title: "Choosing a sensor",
  ask: "Which sensor would an automated system use for each job?",
  groups: [
    {
      name: "Temperature sensor",
      items: ["Keeping a greenhouse at 25 °C", "Controlling a central heating system"],
    },
    {
      name: "Light sensor",
      items: ["Switching street lights on at dusk"],
    },
    {
      name: "Infrared sensor",
      items: ["Detecting someone moving inside a locked building"],
    },
    {
      name: "Pressure sensor",
      items: ["Noticing that a car has pulled up at a barrier"],
    },
    {
      name: "pH sensor",
      items: ["Checking that soil is not too acidic"],
    },
  ],
};

export const EXPERT_SYSTEM: MatchSet = {
  title: "Parts of an expert system",
  ask: "Match each description to the part of an expert system.",
  groups: [
    {
      name: "Knowledge base",
      items: ["Stores the facts gathered from human experts"],
    },
    {
      name: "Rule base",
      items: ["Holds the IF … THEN rules that the facts are used with"],
    },
    {
      name: "Inference engine",
      items: [
        "Applies the rules to the facts to work out an answer",
      ],
    },
    {
      name: "Explanation system",
      items: ["Tells the user why it reached that conclusion"],
    },
    {
      name: "User interface",
      items: ["Asks the user questions and displays the results"],
    },
  ],
};

export const ETHICS: MatchSet = {
  title: "Professional conduct",
  ask: "Does each action follow a computing code of conduct, or break it?",
  groups: [
    {
      name: "Follows the code",
      items: [
        "Telling a client honestly that a deadline cannot be met",
        "Keeping your skills up to date with new technology",
        "Crediting the author of code you reused",
      ],
    },
    {
      name: "Breaks the code",
      items: [
        "Copying a colleague's program and presenting it as your own",
        "Reading customer records you have no work reason to open",
        "Accepting a job you are not qualified to do",
      ],
    },
  ],
};

export const AI_TERMS: MatchSet = {
  title: "AI vocabulary",
  ask: "Match each description to the term it defines.",
  groups: [
    {
      name: "Machine learning",
      items: ["A system that improves its own performance as it sees more data"],
    },
    {
      name: "Training data",
      items: ["The examples a model is shown so it can learn patterns"],
    },
    {
      name: "Artificial neural network",
      items: [
        "Layers of connected nodes with weights that are adjusted as it learns",
      ],
    },
    {
      name: "Expert system",
      items: [
        "Uses a fixed set of rules written by humans rather than learning them",
      ],
    },
  ],
};

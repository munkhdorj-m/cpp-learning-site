import { FigureGrid } from "@/components/learn/figure";

/**
 * Photographs of the hardware a topic talks about.
 *
 * Several IGCSE questions simply ask students to name a device or say what it
 * is for, and a description in words is a poor way to learn to recognise
 * something. Captions say what each one is, so the picture teaches the name.
 */
const TOPIC_IMAGES: Record<string, { ids: string[]; captions: Record<string, string> }> = {
  "input-output-devices": {
    ids: ["dev-keyboard", "dev-barcode", "dev-printer", "dev-3d-printer"],
    captions: {
      "dev-keyboard": "Keyboard — an input device",
      "dev-barcode": "Barcode reader — input, using a laser and a sensor",
      "dev-printer": "Inkjet printer — an output device",
      "dev-3d-printer": "3D printer — builds an object layer by layer",
    },
  },
  "data-storage": {
    ids: ["dev-hdd", "dev-ssd", "dev-usb", "dev-optical"],
    captions: {
      "dev-hdd": "Magnetic hard disk — spinning platters and a read/write head",
      "dev-ssd": "Solid state drive — flash memory, no moving parts",
      "dev-usb": "USB flash drive, and the flash memory inside one",
      "dev-optical": "Optical discs — data read by a laser",
    },
  },
  "storage-compression": {
    ids: ["dev-hdd", "dev-ssd"],
    captions: {
      "dev-hdd": "Magnetic storage",
      "dev-ssd": "Solid state storage",
    },
  },
  "computer-architecture": {
    ids: ["dev-cpu", "dev-ram", "dev-motherboard"],
    captions: {
      "dev-cpu": "A processor — where the fetch–execute cycle happens",
      "dev-ram": "A RAM module — volatile main memory",
      "dev-motherboard": "The motherboard everything plugs into",
    },
  },
  "processor-fundamentals": {
    ids: ["dev-cpu"],
    captions: { "dev-cpu": "A processor, seen from its contact side" },
  },
  "hardware-as": {
    ids: ["dev-cpu", "dev-ram"],
    captions: {
      "dev-cpu": "Processor",
      "dev-ram": "RAM module",
    },
  },
  "network-hardware": {
    ids: ["dev-router", "dev-switch", "dev-ethernet"],
    captions: {
      "dev-router": "A router — joins two different networks",
      "dev-switch": "Ports on a switch — a frame goes only where it is addressed",
      "dev-ethernet": "Ethernet cable with RJ45 connectors",
    },
  },
  "data-transmission": {
    ids: ["dev-fibre", "dev-ethernet"],
    captions: {
      "dev-fibre": "Fibre optic — data carried as pulses of light",
      "dev-ethernet": "Copper cable — data carried as electrical signals",
    },
  },
  communication: {
    ids: ["dev-fibre"],
    captions: { "dev-fibre": "Fibre optic cable" },
  },
  "communication-a": {
    ids: ["dev-fibre"],
    captions: { "dev-fibre": "Fibre optic cable" },
  },
  "internet-www": {
    ids: ["dev-server"],
    captions: { "dev-server": "Servers — the machines that hold and serve web pages" },
  },
  robotics: {
    ids: ["dev-robot"],
    captions: { "dev-robot": "An industrial robot arm on a production line" },
  },
  "automated-systems": {
    ids: ["dev-sensor"],
    captions: { "dev-sensor": "A temperature sensor — the input to an automated system" },
  },
  "cyber-security": {
    ids: ["dev-security"],
    captions: { "dev-security": "Keeping data locked away is only part of security" },
  },
  "security-privacy": {
    ids: ["dev-security"],
    captions: { "dev-security": "Protecting data from being read or changed" },
  },
  "security-a": {
    ids: ["dev-security"],
    captions: { "dev-security": "Protecting data from being read or changed" },
  },
  "encryption-igcse": {
    ids: ["dev-security"],
    captions: { "dev-security": "Encryption keeps intercepted data unreadable" },
  },
};

export function TopicImages({ slug }: { slug: string }) {
  const entry = TOPIC_IMAGES[slug];
  if (!entry) return null;
  return <FigureGrid ids={entry.ids} captions={entry.captions} />;
}

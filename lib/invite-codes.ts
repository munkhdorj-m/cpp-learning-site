// Characters chosen to avoid look-alikes (no 0/O, 1/I/L).
const SAFE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomSuffix(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
  }
  return out;
}

export function generateInviteCode(className: string) {
  return `${className.toUpperCase()}-${randomSuffix(6)}`;
}

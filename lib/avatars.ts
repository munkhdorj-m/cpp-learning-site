/**
 * DiceBear avatar URL helper.
 * Uses the "thumbs" style — colorful, kid-friendly illustrated avatars.
 * Free, no API key, deterministic from seed.
 */
export function dicebearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

/** Extract initials as a fallback while the image loads or if it fails. */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

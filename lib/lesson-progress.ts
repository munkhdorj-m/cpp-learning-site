// Which lessons the student has finished. Kept in the browser rather than the
// database: it is a private reading aid, not graded work, so it needs no
// account, no network round-trip and no schema change.

const KEY = "learn-done";

export function readDone(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(list) ? list.map(String) : []);
  } catch {
    return new Set();
  }
}

export function setDone(slug: string, done: boolean): Set<string> {
  const next = readDone();
  if (done) next.add(slug);
  else next.delete(slug);
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    // Private mode / storage full — progress just won't persist.
  }
  return next;
}

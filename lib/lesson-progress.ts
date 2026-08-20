// Which lessons and Cambridge topics a student has finished.
//
// The browser keeps a copy so ticking a lesson is instant and still works with
// no signal, but the database is now the real record — otherwise progress dies
// with the device and the teacher can see none of it.

export type ProgressKind = "lesson" | "cambridge";

const KEYS: Record<ProgressKind, string> = {
  lesson: "learn-done",
  cambridge: "cambridge-done",
};

function read(kind: ProgressKind): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEYS[kind]);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(list) ? list.map(String) : []);
  } catch {
    return new Set();
  }
}

function write(kind: ProgressKind, items: Set<string>): void {
  try {
    window.localStorage.setItem(KEYS[kind], JSON.stringify([...items]));
  } catch {
    // Private mode or full storage — the server copy still gets it.
  }
}

/** The local copy, available immediately on render. */
export function readDone(kind: ProgressKind = "lesson"): Set<string> {
  return read(kind);
}

/** Mark something done or not done. Saves locally first, then tells the server. */
export function setDone(
  slug: string,
  done: boolean,
  kind: ProgressKind = "lesson",
): Set<string> {
  const next = read(kind);
  if (done) next.add(slug);
  else next.delete(slug);
  write(kind, next);

  void fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, slug, done }),
  }).catch(() => {
    // Offline. The local copy is right, and the next pull will push it up.
  });

  return next;
}

/**
 * Reconcile with the server: take everything it knows about, and send up
 * anything only this browser knows.
 *
 * The upload matters more than it looks — every student's existing progress
 * lives only in localStorage until the first time this runs.
 */
export async function pullDone(
  kind: ProgressKind = "lesson",
): Promise<Set<string>> {
  const local = read(kind);
  try {
    const res = await fetch("/api/progress");
    if (!res.ok) return local;
    const data = (await res.json()) as Record<string, string[]>;
    const remote = new Set(data[kind] ?? []);

    for (const slug of local) {
      if (remote.has(slug)) continue;
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, slug, done: true }),
      }).catch(() => {});
      remote.add(slug);
    }

    write(kind, remote);
    return remote;
  } catch {
    return local;
  }
}

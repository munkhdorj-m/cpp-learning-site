/**
 * A small in-memory attempt counter.
 *
 * Written for the change-password endpoint, which asks for the CURRENT
 * password. Without a limit that endpoint is a password oracle: a borrowed
 * session on a shared classroom laptop could be used to guess the owner's
 * password at machine speed, and student passwords are three dictionary words.
 *
 * Honest about what this is NOT:
 *  - It lives in one process's memory. cPanel runs a single Passenger process
 *    today, so it holds; behind two workers each would keep its own count.
 *  - It resets when the app restarts.
 *  - It is keyed by user id, not IP, so it protects an account rather than
 *    rationing a network.
 *
 * That is the right shape for "stop someone grinding one account", and the
 * wrong shape for a general-purpose API quota. Reach for a real store before
 * using it as one.
 */

interface Window {
  count: number;
  /** Epoch ms when this window opened. */
  start: number;
}

const buckets = new Map<string, Window>();

/** Stop the map growing without bound on a long-lived process. */
function sweep(now: number, windowMs: number) {
  if (buckets.size < 500) return;
  for (const [key, w] of buckets) {
    if (now - w.start > windowMs) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Attempts left in this window. */
  remaining: number;
  /** Seconds until the window resets — for a Retry-After header. */
  retryAfter: number;
}

/**
 * Count one attempt against `key`.
 *
 * Every call counts, including successful ones. Counting only failures would
 * let an attacker reset the window at will with one known-good request.
 */
export function hit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  sweep(now, windowMs);

  const existing = buckets.get(key);
  if (!existing || now - existing.start >= windowMs) {
    buckets.set(key, { count: 1, start: now });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.start + windowMs - now) / 1000);
  return {
    ok: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfter,
  };
}

/** Drop a key's window — used after a successful, legitimate change. */
export function reset(key: string) {
  buckets.delete(key);
}

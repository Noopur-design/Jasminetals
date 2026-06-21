import "server-only";

/**
 * Rate limiter (in-memory). Keyed by an arbitrary string (usually
 * `${ip}:${bucket}`). The store lives in the process, so on Vercel each
 * serverless instance limits independently — adequate brute-force / abuse
 * protection for this app's traffic without a separate Redis dependency.
 */

type Hit = { count: number; resetAt: number };

const store = new Map<string, Hit>();
let lastSweep = 0;
// Hard ceiling so a flood of DISTINCT keys (e.g. spoofed/rotated IPs) inside one
// window can't grow the Map without bound and exhaust memory.
const MAX_KEYS = 20_000;

function sweep(now: number) {
  // Time-based opportunistic cleanup of expired entries.
  if (now - lastSweep >= 60_000) {
    lastSweep = now;
    for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
  }
  // If still over the ceiling (a burst of distinct keys within a single window),
  // evict the soonest-to-reset entries until back under the cap.
  if (store.size > MAX_KEYS) {
    const victims = [...store.entries()]
      .sort((a, b) => a[1].resetAt - b[1].resetAt)
      .slice(0, store.size - MAX_KEYS);
    for (const [k] of victims) store.delete(k);
  }
}

export type RateResult = {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets — send as Retry-After when blocked. */
  retryAfter: number;
};

/** In-memory limiter (single instance). */
function memRateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - existing.count, retryAfter: 0 };
}

/**
 * Record a hit for `key` and report whether it's within `limit` per `windowMs`.
 * Async so callers don't need to change if a distributed backend is added later.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateResult> {
  return memRateLimit(key, limit, windowMs);
}

// Common presets.
export const LIMITS = {
  // Auth: brute-force protection — strict.
  auth: { limit: 8, windowMs: 60_000 },
  // Public form submissions (lead capture) — moderate.
  publicWrite: { limit: 5, windowMs: 60_000 },
  // General authenticated mutations.
  write: { limit: 60, windowMs: 60_000 },
} as const;

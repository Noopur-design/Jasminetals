import "server-only";
import Redis from "ioredis";

/**
 * Redis client for production persistence (Vercel Marketplace Upstash / Redis),
 * used because Vercel's serverless filesystem is read-only — the local
 * `.data/*.json` store can't persist there.
 *
 * Vercel's Redis integration injects a single connection string (KV_REDIS_URL /
 * REDIS_URL / KV_URL), so we connect with ioredis over that URL. When none is
 * set (local dev), `kvEnabled` is false and callers fall back to the local
 * filesystem — keeping local dev zero-setup.
 */
const url =
  process.env.KV_REDIS_URL ?? process.env.REDIS_URL ?? process.env.KV_URL ?? "";

export const kvEnabled = Boolean(url);

let client: Redis | null = null;

/** The shared Redis client. Throws if KV isn't configured — guard with `kvEnabled`. */
export function kv(): Redis {
  if (!client) {
    if (!url) throw new Error("KV is not configured (set KV_REDIS_URL).");
    client = new Redis(url, {
      // Fail fast instead of hanging a serverless invocation if Redis is down.
      maxRetriesPerRequest: 3,
      connectTimeout: 10_000,
      enableAutoPipelining: true,
    });
  }
  return client;
}

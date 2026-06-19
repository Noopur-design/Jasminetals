import "server-only";
import { Redis } from "@upstash/redis";

/**
 * Redis client for production persistence (Vercel KV / Upstash Redis), used
 * because Vercel's serverless filesystem is read-only — the local `.data/*.json`
 * store can't persist there.
 *
 * Configured via either the Vercel-KV env vars (KV_REST_API_URL / KV_REST_API_TOKEN)
 * or the native Upstash ones (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
 * When NEITHER is set, `kvEnabled` is false and callers fall back to the local
 * filesystem — so local dev stays zero-setup.
 */
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvEnabled = Boolean(url && token);

let client: Redis | null = null;

/** The shared Redis client. Throws if KV isn't configured — guard with `kvEnabled`. */
export function kv(): Redis {
  if (!client) {
    if (!url || !token) {
      throw new Error("KV is not configured (set KV_REST_API_URL / KV_REST_API_TOKEN).");
    }
    // @upstash/redis auto-serialises objects to JSON on set and parses on get.
    client = new Redis({ url, token });
  }
  return client;
}

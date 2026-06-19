import "server-only";
import { NextResponse } from "next/server";
import { rateLimit, type RateResult } from "@/lib/rate-limit";
import { log } from "@/lib/logger";

// Re-export the pure path/name helpers so existing `@/lib/http` imports keep working.
export { safeExtension, isInsideDir, isSafeName } from "@/lib/paths";

/**
 * Best-effort client IP for rate-limit keys. The LEFT-most X-Forwarded-For entry
 * is fully client-controlled (an attacker can rotate it to mint a fresh key every
 * request and slip past per-IP limits), so we take the hop appended by the proxy
 * closest to the app — counting `TRUSTED_PROXY_HOPS` (default 1) from the right —
 * which a client behind a trusted reverse proxy (Vercel/nginx) cannot forge.
 * With no proxy in front, no header is trustworthy; this stays best-effort (pair
 * with a shared store for real multi-instance protection).
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) {
      const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1);
      return parts[Math.max(0, parts.length - hops)]!;
    }
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ── Consistent JSON error responses (never leak internals) ──────
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export function jsonError(status: number, error: string, headers?: Record<string, string>) {
  return NextResponse.json({ ok: false, error }, { status, headers: { ...NO_STORE, ...headers } });
}

export const badRequest = (error = "Bad request") => jsonError(400, error);
export const unauthorized = (error = "Unauthorized") => jsonError(401, error);
export const forbidden = (error = "Forbidden") => jsonError(403, error);
export const notFound = (error = "Not found") => jsonError(404, error);
export const tooMany = (retryAfter: number) =>
  jsonError(429, "Too many requests. Please slow down.", { "Retry-After": String(retryAfter) });

/** Server error: log the real cause, return an opaque message to the client. */
export function serverError(cause: unknown, context?: string) {
  log.error("unhandled route error", { context, cause: String(cause) });
  return jsonError(500, "Something went wrong.");
}

// ── Rate limiting drop-in for route handlers ────────────────────
/**
 * Enforce a limit for (ip, bucket). Returns a 429 NextResponse when blocked, or
 * null to continue. Usage: `const limited = enforceRateLimit(req, "login", LIMITS.auth); if (limited) return limited;`
 */
export async function enforceRateLimit(
  req: Request,
  bucket: string,
  preset: { limit: number; windowMs: number },
): Promise<NextResponse | null> {
  const result: RateResult = await rateLimit(`${clientIp(req)}:${bucket}`, preset.limit, preset.windowMs);
  if (!result.ok) {
    log.warn("rate limit hit", { bucket, ip: clientIp(req) });
    return tooMany(result.retryAfter);
  }
  return null;
}

// ── Safe JSON body parsing with a size cap ──────────────────────
type ReadResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

export async function readJson<T = unknown>(
  req: Request,
  maxBytes = 256 * 1024,
): Promise<ReadResult<T>> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > maxBytes) return { ok: false, response: jsonError(413, "Payload too large.") };
  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, response: badRequest() };
  }
  if (text.length > maxBytes) return { ok: false, response: jsonError(413, "Payload too large.") };
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, response: badRequest() };
  }
}


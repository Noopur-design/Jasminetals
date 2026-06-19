import "server-only";
import path from "path";

/**
 * Pure path/name safety helpers — no framework deps, so they're cheap to import
 * anywhere on the server (incl. the data store) without pulling in next/server.
 */

/** Sanitise a user-supplied file extension to a short allowlisted token. */
export function safeExtension(filename: string, allowed: readonly string[], fallback = "bin"): string {
  const raw = (filename.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  return allowed.includes(raw) ? raw : fallback;
}

/** True only if `candidate` resolves to a path inside `baseDir` (no `..` escape). */
export function isInsideDir(baseDir: string, candidate: string): boolean {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, candidate);
  return resolved === base || resolved.startsWith(base + path.sep);
}

/** Collection / store names must be a plain slug — never interpolate raw input into a path. */
export function isSafeName(name: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(name);
}

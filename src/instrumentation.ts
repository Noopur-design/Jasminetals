/**
 * Next.js instrumentation — runs once when the server process starts.
 * Used for: fail-fast config validation, a startup log line, and a graceful
 * shutdown hook on production container stops.
 */
export async function register() {
  // Only the Node.js server runtime (not edge) — file/process APIs live here.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { assertConfig } = await import("@/lib/config");
  const { log } = await import("@/lib/logger");

  // Throws in production if a required secret is missing — a misconfigured deploy
  // should refuse to boot rather than serve a half-working auth system.
  const result = assertConfig();
  log.info("server starting", {
    env: process.env.NODE_ENV,
    configOk: result.ok,
    missing: result.missing,
  });

  // Graceful shutdown (Node-only APIs live in a dynamically-imported module so
  // they're never analysed against the Edge runtime).
  const { registerGracefulShutdown } = await import("@/lib/shutdown");
  registerGracefulShutdown();
}

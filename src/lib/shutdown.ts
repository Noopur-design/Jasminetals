import "server-only";
import { log } from "@/lib/logger";

/**
 * Graceful shutdown for the Node server. Kept in its own module so the Node-only
 * process APIs are never statically pulled into the Edge runtime analysis of
 * instrumentation.ts (it's loaded via dynamic import in the node branch only).
 */
export function registerGracefulShutdown() {
  // Production container stops send SIGTERM. We leave SIGINT alone so local
  // Ctrl+C keeps working normally.
  if (process.env.NODE_ENV !== "production") return;
  process.once("SIGTERM", () => {
    log.info("SIGTERM received — draining and shutting down");
    // Atomic writes already guarantee on-disk integrity; give in-flight handlers
    // a brief moment to settle, then exit cleanly.
    setTimeout(() => process.exit(0), 250);
  });
}

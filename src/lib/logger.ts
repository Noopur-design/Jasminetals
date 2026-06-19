import "server-only";

/**
 * Tiny structured logger. JSON lines in production (so a log collector can parse
 * them), readable text in development. Never log secrets or full request bodies.
 * Use instead of bare console.* so output is consistent and greppable.
 */

type Level = "debug" | "info" | "warn" | "error";
type Fields = Record<string, unknown>;

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN: number = ORDER[(process.env.LOG_LEVEL as Level) ?? "info"] ?? ORDER.info;
const isProd = process.env.NODE_ENV === "production";

// Keys that must never be emitted even if a caller passes them.
const REDACT = new Set([
  "password",
  "token",
  "idtoken",
  "secret",
  "authorization",
  "cookie",
  "passwordhash",
  "privatekey",
  "apikey",
]);

function clean(fields?: Fields): Fields | undefined {
  if (!fields) return undefined;
  const out: Fields = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = REDACT.has(k.toLowerCase()) ? "[redacted]" : v;
  }
  return out;
}

function emit(level: Level, msg: string, fields?: Fields) {
  if (ORDER[level] < MIN) return;
  const safe = clean(fields);
  if (isProd) {
    console[level === "debug" ? "log" : level](
      JSON.stringify({ level, msg, ...safe }),
    );
  } else {
    console[level === "debug" ? "log" : level](
      `[${level}] ${msg}`,
      safe && Object.keys(safe).length ? safe : "",
    );
  }
}

export const log = {
  debug: (msg: string, fields?: Fields) => emit("debug", msg, fields),
  info: (msg: string, fields?: Fields) => emit("info", msg, fields),
  warn: (msg: string, fields?: Fields) => emit("warn", msg, fields),
  error: (msg: string, fields?: Fields) => emit("error", msg, fields),
};

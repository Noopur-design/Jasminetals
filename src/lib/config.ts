import "server-only";

/**
 * Centralised, validated configuration. Read env ONCE here instead of scattering
 * `process.env` across the codebase, and fail fast in production when a required
 * secret is missing (a misconfigured deploy should refuse to start, not leak a
 * half-working auth system).
 */

function req(name: string): string {
  return process.env[name] ?? "";
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",

  auth: {
    secret: req("AUTH_SECRET"),
    adminEmails: req("ADMIN_EMAILS")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    adminPassword: req("ADMIN_PASSWORD"),
  },

  firebaseAdmin: {
    clientEmail: req("FIREBASE_ADMIN_CLIENT_EMAIL"),
    privateKey: req("FIREBASE_ADMIN_PRIVATE_KEY"),
    get configured() {
      return Boolean(this.clientEmail && this.privateKey);
    },
  },

  // Upload limits (defence-in-depth for the file store).
  uploads: {
    maxBytes: 10 * 1024 * 1024, // 10 MB
    allowedExtensions: ["pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "xls", "xlsx", "csv", "txt"],
  },
} as const;

// Secrets that MUST be present for the app to operate safely.
const REQUIRED = [["AUTH_SECRET", config.auth.secret]] as const;

let validated = false;

/**
 * Validate configuration. In production a missing required secret throws (the
 * process should not come up). In development it warns so local dev still runs.
 * Idempotent — safe to call from instrumentation on every cold start.
 */
export function assertConfig(): { ok: boolean; missing: string[] } {
  const missing = REQUIRED.filter(([, v]) => !v).map(([k]) => k);
  if (missing.length && config.isProd) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (!validated && missing.length) {
    console.warn(`[config] missing (dev): ${missing.join(", ")} — some features will be disabled`);
  }
  validated = true;
  return { ok: missing.length === 0, missing };
}

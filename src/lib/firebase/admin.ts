import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getStorage } from "firebase-admin/storage";

/**
 * Firebase Admin SDK (server-only). This is the app's PRIMARY backend on Vercel:
 *   • Realtime Database → the JSON-document data store (see src/lib/storage.ts)
 *   • Storage           → uploaded client documents (see the upload/download routes)
 *   • Auth              → setting role/permission custom claims on team members
 *
 * Lazily initialised so the app builds/runs even before the service-account key
 * is configured; in that case it falls back to the local `.data/` store (dev).
 */
let app: App | undefined;

/** True when a service-account key is present → RTDB/Storage are usable. */
export function isAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  );
}

/**
 * Normalise the service-account private key from an env var into a valid PEM.
 * Tolerates the common ways the value gets mangled in dashboards / .env pastes:
 *   • surrounding single or double quotes left in the value
 *   • literal `\n` sequences instead of real newlines
 *   • a base64-encoded PEM (no "BEGIN" marker → decode it)
 */
function normalizePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();
  // Strip a single layer of surrounding quotes if present.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // If it doesn't look like a PEM yet, it may be base64-encoded — decode it.
  if (!key.includes("BEGIN")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf8");
      if (decoded.includes("BEGIN")) key = decoded;
    } catch {
      /* fall through with the raw value */
    }
  }
  // Convert any literal `\n` into real newlines (no-op if already real).
  return key.replace(/\\n/g, "\n").trim();
}

function adminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  if (!clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Add FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY to .env.local (see SETUP-ADMIN.md).",
    );
  }
  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return app;
}

export const adminAuth = () => getAuth(adminApp());
export const adminRtdb = () => getDatabase(adminApp());
export const adminBucket = () => getStorage(adminApp()).bucket();

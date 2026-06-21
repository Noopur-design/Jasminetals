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

function adminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
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

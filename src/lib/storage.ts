import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { isSafeName } from "@/lib/paths";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

/**
 * JSON-document persistence with two interchangeable backends:
 *   • Firestore when the Firebase Admin service-account key is configured →
 *     works on Vercel's read-only serverless filesystem.
 *   • Local `.data/<name>.json` files otherwise → zero-setup local dev.
 *
 * Each logical document — a collection array, or a small object like the studio
 * settings / reset token — is one Firestore document inside the `STORE_COLLECTION`
 * collection, keyed by `name`. The whole value is stored JSON-serialised in a
 * single field so it round-trips losslessly regardless of Firestore's per-field
 * type constraints (nested arrays, undefined, etc.). `readDoc` returns `fallback`
 * when the document doesn't exist yet (the fallback is NOT persisted; writes do).
 *
 * NOTE: read-modify-write is not transactionally atomic across instances. The
 * fs backend serialises writes within a process; the Firestore backend is last-
 * write-wins. Acceptable for this app's traffic.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_COLLECTION = "jt_store";
const JSON_FIELD = "json";

function fileFor(name: string): string {
  // Names are always literals or allowlisted slugs, but never trust them when
  // building a filesystem path / document id.
  if (!isSafeName(name)) throw new Error(`Unsafe storage name: ${name}`);
  return path.join(DATA_DIR, `${name}.json`);
}

// Serialise concurrent writes to the same key within a process (fs backend).
const writeChains = new Map<string, Promise<unknown>>();
function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = writeChains.get(key) ?? Promise.resolve();
  const run = prev.catch(() => {}).then(fn);
  writeChains.set(key, run.catch(() => {}));
  return run;
}

// Atomic file write: temp file + rename, so a crash mid-write can't truncate.
async function atomicWrite(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  try {
    await fs.writeFile(tmp, content, "utf8");
    await fs.rename(tmp, filePath);
  } catch (err) {
    await fs.unlink(tmp).catch(() => {});
    throw err;
  }
}

/** Read a JSON document, or `fallback` if it doesn't exist yet. */
export async function readDoc<T>(name: string, fallback: T): Promise<T> {
  if (!isSafeName(name)) throw new Error(`Unsafe storage name: ${name}`);
  if (isAdminConfigured()) {
    const snap = await adminDb().collection(STORE_COLLECTION).doc(name).get();
    const raw = snap.exists ? (snap.get(JSON_FIELD) as string | undefined) : undefined;
    return raw ? (JSON.parse(raw) as T) : fallback;
  }
  try {
    return JSON.parse(await fs.readFile(fileFor(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Persist a JSON document. */
export async function writeDoc<T>(name: string, data: T): Promise<void> {
  if (!isSafeName(name)) throw new Error(`Unsafe storage name: ${name}`);
  if (isAdminConfigured()) {
    await adminDb()
      .collection(STORE_COLLECTION)
      .doc(name)
      .set({ [JSON_FIELD]: JSON.stringify(data), updatedAt: new Date().toISOString() });
    return;
  }
  const filePath = fileFor(name);
  await withLock(filePath, () => atomicWrite(filePath, JSON.stringify(data, null, 2)));
}

/** Remove a JSON document (used for one-time tokens). */
export async function deleteDoc(name: string): Promise<void> {
  if (!isSafeName(name)) throw new Error(`Unsafe storage name: ${name}`);
  if (isAdminConfigured()) {
    await adminDb().collection(STORE_COLLECTION).doc(name).delete();
    return;
  }
  await fs.unlink(fileFor(name)).catch(() => {});
}

import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { isSafeName } from "@/lib/paths";
import { adminRtdb, isAdminConfigured } from "@/lib/firebase/admin";

/**
 * JSON-document persistence with two interchangeable backends:
 *   • Firebase Realtime Database when the Admin service-account key is configured
 *     → works on Vercel's read-only serverless filesystem.
 *   • Local `.data/<name>.json` files otherwise → zero-setup local dev.
 *
 * Each logical document — a collection array, or a small object like the studio
 * settings / reset token — is one node under `STORE_ROOT/<name>`. The whole value
 * is stored JSON-serialised in a single `json` child so it round-trips losslessly
 * regardless of RTDB's quirks (it drops empty arrays/objects to null, rejects
 * `undefined`, and coerces sparse arrays to objects). `readDoc` returns `fallback`
 * when the node doesn't exist yet (the fallback is NOT persisted; writes do).
 *
 * NOTE: read-modify-write is not transactionally atomic across instances. The
 * fs backend serialises writes within a process; the RTDB backend is last-write-
 * wins. Acceptable for this app's traffic.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_ROOT = "jt_store";
const JSON_FIELD = "json";

function nodeRef(name: string) {
  return adminRtdb().ref(`${STORE_ROOT}/${name}`);
}

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
    const snap = await nodeRef(name).child(JSON_FIELD).get();
    const raw = snap.exists() ? (snap.val() as string | null) : null;
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
    await nodeRef(name).set({
      [JSON_FIELD]: JSON.stringify(data),
      updatedAt: new Date().toISOString(),
    });
    return;
  }
  const filePath = fileFor(name);
  await withLock(filePath, () => atomicWrite(filePath, JSON.stringify(data, null, 2)));
}

/** Remove a JSON document (used for one-time tokens). */
export async function deleteDoc(name: string): Promise<void> {
  if (!isSafeName(name)) throw new Error(`Unsafe storage name: ${name}`);
  if (isAdminConfigured()) {
    await nodeRef(name).remove();
    return;
  }
  await fs.unlink(fileFor(name)).catch(() => {});
}

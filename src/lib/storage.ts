import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { isSafeName } from "@/lib/paths";
import { kv, kvEnabled } from "@/lib/kv";

/**
 * JSON-document persistence with two interchangeable backends:
 *   • KV (Upstash / Vercel KV) when configured → works on Vercel's read-only
 *     serverless filesystem.
 *   • Local `.data/<name>.json` files otherwise → zero-setup local dev.
 *
 * Each logical document — a collection array, or a small object like the studio
 * settings / reset token — is one key. `readDoc` returns `fallback` when the
 * document doesn't exist yet (the fallback is NOT persisted; writes persist).
 *
 * NOTE: read-modify-write is not transactionally atomic across instances. The
 * fs backend serialises writes within a process; the KV backend is last-write-
 * wins. Acceptable for this app's traffic — see [[firebase-admin-not-configured]].
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const KEY_PREFIX = "jt:";

function fileFor(name: string): string {
  // Names are always literals or allowlisted slugs, but never trust them when
  // building a filesystem path / key.
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
  if (kvEnabled) {
    const v = await kv().get<T>(KEY_PREFIX + name);
    return v ?? fallback;
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
  if (kvEnabled) {
    await kv().set(KEY_PREFIX + name, data);
    return;
  }
  const filePath = fileFor(name);
  await withLock(filePath, () => atomicWrite(filePath, JSON.stringify(data, null, 2)));
}

/** Remove a JSON document (used for one-time tokens). */
export async function deleteDoc(name: string): Promise<void> {
  if (!isSafeName(name)) throw new Error(`Unsafe storage name: ${name}`);
  if (kvEnabled) {
    await kv().del(KEY_PREFIX + name);
    return;
  }
  await fs.unlink(fileFor(name)).catch(() => {});
}

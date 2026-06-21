import "server-only";
import { adminRtdb } from "./admin";

/**
 * Realtime Database helpers for the small "mirror" collections that shadow
 * Firebase Auth custom-claim state (team `members`, portal `clients`). The claims
 * on the Auth user are the source of truth; these nodes just make the roster
 * listable. Each row is keyed by the user's Auth uid under `<coll>/<uid>`.
 */
export type MirrorRow = { uid: string } & Record<string, unknown>;

/** List every row in `coll`, newest-updated first. */
export async function listMirror(coll: string): Promise<MirrorRow[]> {
  const snap = await adminRtdb().ref(coll).get();
  const val = (snap.val() as Record<string, Record<string, unknown>> | null) ?? {};
  return Object.entries(val)
    .map(([uid, data]): MirrorRow => ({ uid, ...data }))
    .sort((a, b) => Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0));
}

/** Read a single row, or null if it doesn't exist. */
export async function getMirror(coll: string, uid: string): Promise<Record<string, unknown> | null> {
  const snap = await adminRtdb().ref(`${coll}/${uid}`).get();
  return (snap.val() as Record<string, unknown> | null) ?? null;
}

/** Shallow-merge `data` into `<coll>/<uid>` (creates the node if absent). */
export async function upsertMirror(
  coll: string,
  uid: string,
  data: Record<string, unknown>,
): Promise<void> {
  await adminRtdb().ref(`${coll}/${uid}`).update(data);
}

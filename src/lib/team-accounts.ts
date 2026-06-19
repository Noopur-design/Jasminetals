import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { readDoc, writeDoc } from "@/lib/storage";
import { teamMembers } from "@/lib/internal-data";
import { VIEWER_PERMISSIONS, type Permissions } from "@/lib/permissions";

/**
 * Team member login accounts — a self-contained, admin-managed credential store
 * living in `.data/team-accounts.json` (same zero-setup persistence as the rest
 * of the app). Passwords are salted + scrypt-hashed and NEVER returned to any
 * client. Only the owner-admin can create accounts, assign/reset passwords, or
 * change permissions — team members can never change their own password.
 *
 * This is intentionally independent of Firebase: the Firestore-backed members
 * system requires a service-account key that isn't configured, so team logins
 * would otherwise be impossible.
 */

export type TeamAccountStatus = "active" | "suspended";

export type TeamAccount = {
  id: string; // = seed team member id (e.g. "tm-kabir") so scoped views can key off it
  username: string; // unique login handle (compared case-insensitively)
  name: string;
  email: string;
  roleLabel: string; // job title, display only
  permissions: Permissions;
  status: TeamAccountStatus;
  passwordHash: string | null; // "saltHex:hashHex"; null = no password set yet
  updatedAt: number;
};

// What we expose to the admin UI — never the hash.
export type PublicTeamAccount = Omit<TeamAccount, "passwordHash"> & {
  hasPassword: boolean;
};

// First-run seed: one (passwordless) account per known team member so the admin
// has a roster to assign logins to. status mirrors the seed member.
function seed(): TeamAccount[] {
  return teamMembers.map((m) => ({
    id: m.id,
    username: m.email.split("@")[0]!.toLowerCase(),
    name: m.name,
    email: m.email,
    roleLabel: m.role,
    permissions: VIEWER_PERMISSIONS,
    status: m.status === "suspended" ? "suspended" : "active",
    passwordHash: null,
    updatedAt: 0,
  }));
}

async function readAll(): Promise<TeamAccount[]> {
  return readDoc<TeamAccount[]>("team-accounts", seed());
}

async function writeAll(list: TeamAccount[]): Promise<void> {
  return writeDoc("team-accounts", list);
}

// ── Password hashing (scrypt + per-password random salt) ────────
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  // Fail CLOSED on a malformed/truncated hash. hashPassword always emits a
  // 16-byte salt + 64-byte hash; anything else (e.g. a corrupted or hand-edited
  // .data file, where Buffer.from(badHex) can yield an empty buffer) must reject
  // EVERY password — never let an empty buffer match an empty buffer.
  if (salt.length === 0 || expected.length !== 64) return false;
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
}

export function toPublic(a: TeamAccount): PublicTeamAccount {
  const { passwordHash, ...rest } = a;
  return { ...rest, hasPassword: Boolean(passwordHash) };
}

// ── Reads ───────────────────────────────────────────────────────
export async function listTeamAccounts(): Promise<TeamAccount[]> {
  return readAll();
}

export async function getTeamAccount(id: string): Promise<TeamAccount | null> {
  const all = await readAll();
  return all.find((a) => a.id === id) ?? null;
}

export async function getTeamAccountByUsername(username: string): Promise<TeamAccount | null> {
  const u = username.trim().toLowerCase();
  if (!u) return null;
  const all = await readAll();
  return all.find((a) => a.username.toLowerCase() === u) ?? null;
}

// ── Writes (admin only — callers must gate with requireAdmin) ───
async function usernameTaken(username: string, exceptId: string): Promise<boolean> {
  const u = username.trim().toLowerCase();
  const all = await readAll();
  return all.some((a) => a.id !== exceptId && a.username.toLowerCase() === u);
}

export type UpsertInput = {
  id?: string;
  username: string;
  name: string;
  email: string;
  roleLabel?: string;
  permissions?: Permissions;
  status?: TeamAccountStatus;
};

/** Create a new account or update an existing one (by id). Enforces unique username. */
export async function upsertTeamAccount(
  input: UpsertInput,
): Promise<{ ok: true; account: TeamAccount } | { ok: false; error: string }> {
  const username = input.username.trim();
  if (!username) return { ok: false, error: "Username is required." };

  const all = await readAll();
  const id = input.id ?? `tm-${randomBytes(4).toString("hex")}`;
  if (await usernameTaken(username, id)) {
    return { ok: false, error: "That username is already taken." };
  }

  const existing = all.find((a) => a.id === id);
  const next: TeamAccount = {
    id,
    username,
    name: input.name.trim() || existing?.name || username,
    email: input.email.trim() || existing?.email || "",
    roleLabel: input.roleLabel ?? existing?.roleLabel ?? "Team member",
    permissions: input.permissions ?? existing?.permissions ?? VIEWER_PERMISSIONS,
    status: input.status ?? existing?.status ?? "active",
    passwordHash: existing?.passwordHash ?? null,
    updatedAt: Date.now(),
  };

  const list = existing ? all.map((a) => (a.id === id ? next : a)) : [...all, next];
  await writeAll(list);
  return { ok: true, account: next };
}

export type PatchInput = {
  username?: string;
  name?: string;
  email?: string;
  roleLabel?: string;
  permissions?: Permissions;
  status?: TeamAccountStatus;
};

export async function updateTeamAccount(
  id: string,
  patch: PatchInput,
): Promise<{ ok: true; account: TeamAccount } | { ok: false; error: string }> {
  const all = await readAll();
  const existing = all.find((a) => a.id === id);
  if (!existing) return { ok: false, error: "Account not found." };

  if (patch.username !== undefined) {
    const u = patch.username.trim();
    if (!u) return { ok: false, error: "Username is required." };
    if (await usernameTaken(u, id)) return { ok: false, error: "That username is already taken." };
  }

  const next: TeamAccount = {
    ...existing,
    username: patch.username?.trim() ?? existing.username,
    name: patch.name?.trim() ?? existing.name,
    email: patch.email?.trim() ?? existing.email,
    roleLabel: patch.roleLabel ?? existing.roleLabel,
    permissions: patch.permissions ?? existing.permissions,
    status: patch.status ?? existing.status,
    updatedAt: Date.now(),
  };
  await writeAll(all.map((a) => (a.id === id ? next : a)));
  return { ok: true, account: next };
}

/** Set or reset a member's password. Admin-only by construction (no self-serve). */
export async function setTeamAccountPassword(id: string, password: string): Promise<boolean> {
  const all = await readAll();
  const existing = all.find((a) => a.id === id);
  if (!existing) return false;
  const next: TeamAccount = {
    ...existing,
    passwordHash: hashPassword(password),
    updatedAt: Date.now(),
  };
  await writeAll(all.map((a) => (a.id === id ? next : a)));
  return true;
}

export async function deleteTeamAccount(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((a) => a.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

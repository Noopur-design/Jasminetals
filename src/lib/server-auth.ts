import "server-only";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE, type SessionUser } from "@/lib/auth";
import { can, type Module, type Action } from "@/lib/permissions";

/** Read & verify the current session from the cookie (server only). */
export async function getServerSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** Returns the session only if the caller is the owner-admin. */
export async function requireAdmin(): Promise<SessionUser | null> {
  const s = await getServerSession();
  return s && s.role === "admin" ? s : null;
}

/** Returns the session for any staff member (admin or team). */
export async function requireStaff(): Promise<SessionUser | null> {
  const s = await getServerSession();
  return s && (s.role === "admin" || s.role === "team") ? s : null;
}

/** Returns the session only if the caller may perform `action` on `module`. */
export async function requirePermission(
  module: Module,
  action: Action,
): Promise<SessionUser | null> {
  const s = await getServerSession();
  if (!s) return null;
  return can(s.role, s.permissions, module, action) ? s : null;
}

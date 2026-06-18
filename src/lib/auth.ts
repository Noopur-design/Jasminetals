/* ============================================================
   Session management — our own signed, httpOnly session cookie.

   Flow: Firebase verifies identity (Google / email+password) → the server
   verifies that Firebase token (see firebase/verify-id-token) → we mint THIS
   signed JWT as the app session. Middleware verifies it on every request.
   Roles come from a server-side admin allowlist (ADMIN_EMAILS), so a user can
   never elevate themselves to admin from the client.

   Uses `jose` (HS256) so it works in both the edge runtime (middleware) and
   Node (route handlers).
   ============================================================ */

import { SignJWT, jwtVerify } from "jose";
import type { Permissions } from "@/lib/permissions";

// lead   = signed up but no deal yet → public site only (no portal)
// client = deal done → gets the client portal
// team   = staff sub-user → internal panel (granted permissions)
// admin  = owner → full internal access
export type Role = "lead" | "client" | "team" | "admin";
export type SessionUser = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  permissions?: Permissions;
};

export const SESSION_COOKIE = "jt_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

/** Emails allowed into the internal/team panel (server-only allowlist). */
export function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions ?? {},
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.uid)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    const r = payload.role;
    const role: Role =
      r === "admin" ? "admin" : r === "team" ? "team" : r === "client" ? "client" : "lead";
    return {
      uid: payload.sub,
      email: payload.email as string,
      name: (payload.name as string) ?? "",
      role,
      permissions: (payload.permissions as Permissions) ?? {},
    };
  } catch {
    return null;
  }
}

export function dashboardFor(role: Role): string {
  if (role === "admin" || role === "team") return "/internal";
  if (role === "client") return "/portal";
  return "/"; // lead → no dashboard yet
}

/** Only allow same-origin relative redirect targets. */
export function safeRedirect(next: string | null | undefined, fallback: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}

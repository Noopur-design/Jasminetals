import { NextResponse, NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/verify-id-token";
import {
  createSessionToken,
  isAdminEmail,
  dashboardFor,
  verifySessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type Role,
} from "@/lib/auth";
import { FULL_PERMISSIONS, type Permissions } from "@/lib/permissions";
import {
  getClientAssignment,
  setClientAssignment,
  setClientPortalData,
  seedClientPortalData,
  type ClientAssignment,
} from "@/lib/store";
import { enforceRateLimit, readJson } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";

// POST /api/session  → exchange a Firebase ID token for our session cookie.
export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, "session", LIMITS.auth);
  if (limited) return limited;

  const parsed = await readJson<{ idToken?: string }>(request, 8 * 1024);
  if (!parsed.ok) return parsed.response;
  const { idToken } = parsed.data;
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  // Don't let a Firebase login downgrade an existing admin-login session.
  // Admin-login uses ADMIN_PASSWORD (not Firebase) and grants a privileged session
  // that should persist even when a non-admin Firebase account is still active.
  const existingToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (existingToken) {
    const existing = await verifySessionToken(existingToken);
    if (existing?.role === "admin") {
      return NextResponse.json({ ok: true, role: "admin", redirectTo: "/internal" });
    }
  }

  const identity = await verifyFirebaseIdToken(idToken);
  if (!identity) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  // Role precedence: owner allowlist (admin) → claim (admin/team/client) →
  // everyone else gets a client portal (auto-provisioned).
  let role: Role = "client";
  let permissions: Permissions = {};
  if (isAdminEmail(identity.email) || identity.claimRole === "admin") {
    role = "admin";
    permissions = FULL_PERMISSIONS;
  } else if (identity.claimRole === "team") {
    role = "team";
    permissions = identity.claimPermissions ?? {};
  } else {
    // Any other authenticated user (claim "client" OR a brand-new sign-up) gets a
    // working client portal. If the admin hasn't set up an assignment for them yet,
    // auto-provision a starter one with seeded portal data, so every user always
    // lands on a real dashboard instead of a dashboard-less "lead" home redirect.
    role = "client";
    const existing = await getClientAssignment(identity.email);
    if (!existing) {
      const name = identity.name ?? identity.email.split("@")[0];
      const starter: ClientAssignment = {
        email: identity.email,
        name,
        eventName: `${name}'s Event`,
        eventType: "Event",
        eventDate: new Date(Date.now() + 180 * 86_400_000).toISOString().slice(0, 10),
        venue: "To be confirmed",
        location: "To be confirmed",
        assignedAt: new Date().toISOString(),
        // Not a real booking yet — the portal shows a "book a consultation"
        // prompt until an admin sets up the actual event for this client.
        placeholder: true,
      };
      await setClientAssignment(starter);
      await setClientPortalData(seedClientPortalData(starter));
    }
  }

  const token = await createSessionToken({
    uid: identity.uid,
    email: identity.email,
    name: identity.name ?? identity.email.split("@")[0],
    role,
    permissions,
  });

  const res = NextResponse.json({ ok: true, role, redirectTo: dashboardFor(role) });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  // Non-sensitive UX hint so the client can link to the right dashboard.
  // (Access is still enforced server-side via the signed session above.)
  res.cookies.set("jt_role", role, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

// DELETE /api/session  → sign out (clear ALL session state).
// Critically this also clears the impersonation cookies: an admin who is
// "viewing as" someone and then signs out must NOT leave a stashed admin token
// (jt_admin_return) behind that /exit-impersonation could revive without a password.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete("jt_role");
  res.cookies.delete("jt_admin_return");
  res.cookies.delete("jt_impersonating");
  return res;
}

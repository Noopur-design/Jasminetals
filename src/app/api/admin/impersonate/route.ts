import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionToken,
  verifySessionToken,
  dashboardFor,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import { getTeamAccount } from "@/lib/team-accounts";
import { getClientAssignment } from "@/lib/store";

// Cookie that stashes the real admin session while impersonating, so the admin
// can return. httpOnly — never exposed to the client.
const RETURN_COOKIE = "jt_admin_return";
// Non-httpOnly hint so the internal shell can render a "Return to admin" banner.
const IMPERSONATING_COOKIE = "jt_impersonating";

function cookieOpts() {
  return {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

// POST /api/admin/impersonate → admin "login as" a team member or a client.
// body: { type: "team", id } | { type: "client", email }
export async function POST(request: Request) {
  // Only a real owner-admin may impersonate (a team session fails this, so
  // impersonation can never be nested or escalated).
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const parsed = await readJson<{ type?: "team" | "client"; id?: string; email?: string }>(request, 4 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  // The admin's current token — preserved so they can return.
  const adminToken = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!adminToken) {
    return NextResponse.json({ ok: false, error: "No active admin session." }, { status: 401 });
  }

  let token: string;
  let label: string;
  let redirectTo: string;

  if (body.type === "team") {
    const account = body.id ? await getTeamAccount(body.id) : null;
    if (!account) {
      return NextResponse.json({ ok: false, error: "Team member not found." }, { status: 404 });
    }
    // Mirror team-login: a suspended account has no access, even via impersonation.
    if (account.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "That account is suspended. Reinstate it first." },
        { status: 403 },
      );
    }
    token = await createSessionToken({
      uid: account.id,
      email: account.email,
      name: account.name,
      role: "team",
      permissions: account.permissions,
    });
    label = `${account.name} (team)`;
    redirectTo = dashboardFor("team");
  } else if (body.type === "client") {
    const email = body.email?.trim().toLowerCase();
    const assignment = email ? await getClientAssignment(email) : null;
    if (!assignment) {
      return NextResponse.json({ ok: false, error: "Client not found." }, { status: 404 });
    }
    token = await createSessionToken({
      uid: `client:${assignment.email}`,
      email: assignment.email,
      name: assignment.name,
      role: "client",
    });
    label = `${assignment.name} (client)`;
    redirectTo = dashboardFor("client");
  } else {
    return NextResponse.json({ ok: false, error: "Unknown impersonation type." }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, redirectTo });
  const opts = cookieOpts();
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, ...opts });
  res.cookies.set(RETURN_COOKIE, adminToken, { httpOnly: true, ...opts });
  res.cookies.set("jt_role", body.type === "team" ? "team" : "client", { httpOnly: false, ...opts });
  res.cookies.set(IMPERSONATING_COOKIE, encodeURIComponent(label), { httpOnly: false, ...opts });
  return res;
}

// DELETE /api/admin/impersonate → return to the stashed admin session.
// Works from ANY current role (e.g. while viewing the client portal) because it
// trusts only the signed RETURN_COOKIE, which is restored only if it verifies as admin.
export async function DELETE() {
  const jar = await cookies();
  const returnToken = jar.get(RETURN_COOKIE)?.value;
  const adminSession = await verifySessionToken(returnToken);

  if (!returnToken || !adminSession || adminSession.role !== "admin") {
    // Nothing valid to return to — clear any stale impersonation hints.
    const res = NextResponse.json({ ok: false, error: "Not impersonating.", redirectTo: "/" }, { status: 400 });
    res.cookies.delete(RETURN_COOKIE);
    res.cookies.delete(IMPERSONATING_COOKIE);
    return res;
  }

  const res = NextResponse.json({ ok: true, redirectTo: "/internal" });
  const opts = cookieOpts();
  res.cookies.set(SESSION_COOKIE, returnToken, { httpOnly: true, ...opts });
  res.cookies.set("jt_role", "admin", { httpOnly: false, ...opts });
  res.cookies.delete(RETURN_COOKIE);
  res.cookies.delete(IMPERSONATING_COOKIE);
  return res;
}

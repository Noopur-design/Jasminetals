import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { getTeamAccountByUsername, verifyPassword } from "@/lib/team-accounts";

// A well-formed throwaway hash (16-byte salt : 64-byte hash) so a missing
// username still runs a full scrypt pass — avoids a timing oracle for "does this
// username exist". Must match the byte lengths verifyPassword expects.
const DUMMY_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;

// POST /api/team-login → team member login with admin-assigned username + password.
// Separate from /api/admin-login (owner) and /api/session (Firebase clients).
export async function POST(request: Request) {
  let username: string | undefined;
  let password: string | undefined;
  try {
    ({ username, password } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Enter your username and password." },
      { status: 400 },
    );
  }

  const account = await getTeamAccountByUsername(username);
  const passwordOk = verifyPassword(password, account?.passwordHash ?? DUMMY_HASH);

  // Same generic error for unknown username or wrong password (no enumeration).
  if (!account || !passwordOk) {
    return NextResponse.json(
      { ok: false, error: "Incorrect username or password." },
      { status: 401 },
    );
  }
  // Only reveal "suspended" to someone who proved they own the account.
  if (account.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "This account is suspended. Please contact your admin." },
      { status: 403 },
    );
  }

  const token = await createSessionToken({
    uid: account.id,
    email: account.email,
    name: account.name,
    role: "team",
    permissions: account.permissions,
  });

  const res = NextResponse.json({ ok: true, redirectTo: "/internal" });
  const opts = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, ...opts });
  res.cookies.set("jt_role", "team", { httpOnly: false, ...opts });
  return res;
}

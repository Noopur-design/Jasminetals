import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { verifyClientPassword } from "@/lib/store";
import { enforceRateLimit, readJson } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";

// POST /api/client-login → client portal sign-in with an admin-issued password.
// Separate from Firebase (Google / email). No email verification needed because
// the admin set the password directly, so there's no self-signup hijack risk.
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "client-login", LIMITS.auth);
  if (limited) return limited;

  const parsed = await readJson<{ email?: string; password?: string }>(request, 4 * 1024);
  if (!parsed.ok) return parsed.response;
  const { email, password } = parsed.data;
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Enter your email and password." }, { status: 400 });
  }

  const assignment = await verifyClientPassword(email.trim().toLowerCase(), password);
  if (!assignment) {
    // Same generic error whether the email is unknown or the password is wrong.
    return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
  }

  const token = await createSessionToken({
    uid: `client:${assignment.email}`,
    email: assignment.email,
    name: assignment.name,
    role: "client",
  });

  const res = NextResponse.json({ ok: true, redirectTo: "/portal" });
  const opts = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, ...opts });
  res.cookies.set("jt_role", "client", { httpOnly: false, ...opts });
  return res;
}

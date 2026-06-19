import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { FULL_PERMISSIONS } from "@/lib/permissions";
import { verifyPassword } from "@/lib/team-accounts";
import { enforceRateLimit, readJson } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { readDoc } from "@/lib/storage";

/** Constant-time compare for the plaintext (env / legacy) credential paths. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Verify the submitted password. Precedence: hashed file → legacy plaintext file
 * → env ADMIN_PASSWORD. `configured` is false only when no credential exists
 * anywhere (caller maps that to a 503). The compare is constant-time on every
 * path so the endpoint leaks no timing oracle on the password.
 */
async function checkAdminPassword(input: string): Promise<{ ok: boolean; configured: boolean }> {
  const stored = await readDoc<{ passwordHash?: string; password?: string }>("admin-password", {});
  if (typeof stored.passwordHash === "string" && stored.passwordHash) {
    return { ok: verifyPassword(input, stored.passwordHash), configured: true };
  }
  if (typeof stored.password === "string" && stored.password) {
    // Legacy plaintext value written before hashing was introduced.
    return { ok: safeEqual(input, stored.password), configured: true };
  }
  const env = process.env.ADMIN_PASSWORD;
  if (env && env.length > 0) return { ok: safeEqual(input, env), configured: true };
  return { ok: false, configured: false };
}

// POST /api/admin-login → owner password login (separate from client/Google login).
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin-login", LIMITS.auth);
  if (limited) return limited;

  const parsed = await readJson<{ password?: string }>(request, 4 * 1024);
  if (!parsed.ok) return parsed.response;
  const { password } = parsed.data;

  const { ok, configured } = await checkAdminPassword(password ?? "");
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: "Admin password is not set. Add ADMIN_PASSWORD to .env.local." },
      { status: 503 },
    );
  }
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Incorrect admin password." }, { status: 401 });
  }

  const ownerEmail =
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "owner@jasminetals";
  const token = await createSessionToken({
    uid: "owner",
    email: ownerEmail,
    name: "Studio Admin",
    role: "admin",
    permissions: FULL_PERMISSIONS,
  });

  const res = NextResponse.json({ ok: true, redirectTo: "/internal" });
  const opts = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, ...opts });
  res.cookies.set("jt_role", "admin", { httpOnly: false, ...opts });
  return res;
}

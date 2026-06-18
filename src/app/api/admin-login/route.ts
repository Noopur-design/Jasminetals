import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { FULL_PERMISSIONS } from "@/lib/permissions";

const PASSWORD_FILE = path.join(process.cwd(), ".data", "admin-password.json");

async function getAdminPassword(): Promise<string | undefined> {
  try {
    const raw = await fs.readFile(PASSWORD_FILE, "utf8");
    const { password } = JSON.parse(raw);
    if (typeof password === "string" && password.length > 0) return password;
  } catch {
    // fall through to env
  }
  return process.env.ADMIN_PASSWORD;
}

// POST /api/admin-login → owner password login (separate from client/Google login).
export async function POST(request: Request) {
  let password: string | undefined;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const expected = await getAdminPassword();
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Admin password is not set. Add ADMIN_PASSWORD to .env.local." },
      { status: 503 },
    );
  }
  if (!password || password !== expected) {
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

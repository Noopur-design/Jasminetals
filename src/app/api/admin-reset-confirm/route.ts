import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const TOKEN_FILE = path.join(process.cwd(), ".data", "reset-token.json");
const PASSWORD_FILE = path.join(process.cwd(), ".data", "admin-password.json");

export async function POST(request: Request) {
  let token: string | undefined;
  let newPassword: string | undefined;
  try {
    ({ token, newPassword } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!token || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  let stored: { token: string; expiresAt: number };
  try {
    const raw = await fs.readFile(TOKEN_FILE, "utf8");
    stored = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "No reset token found. Request a new one." }, { status: 400 });
  }

  if (stored.token !== token || Date.now() > stored.expiresAt) {
    return NextResponse.json({ ok: false, error: "Reset link is invalid or has expired." }, { status: 400 });
  }

  // Save new password and delete the token
  await fs.writeFile(PASSWORD_FILE, JSON.stringify({ password: newPassword }), "utf8");
  await fs.unlink(TOKEN_FILE).catch(() => null);

  return NextResponse.json({ ok: true });
}

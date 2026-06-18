import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const TOKEN_FILE = path.join(process.cwd(), ".data", "reset-token.json");

export async function POST(request: Request) {
  let email: string | undefined;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !adminEmails.includes(email.toLowerCase())) {
    // Return success anyway to avoid email enumeration
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

  await fs.mkdir(path.join(process.cwd(), ".data"), { recursive: true });
  await fs.writeFile(TOKEN_FILE, JSON.stringify({ token, expiresAt }), "utf8");

  return NextResponse.json({ ok: true, resetUrl: `/admin/reset?token=${token}` });
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import { enforceRateLimit, readJson } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/team-accounts";
import { readDoc, writeDoc, deleteDoc } from "@/lib/storage";

export async function POST(request: Request) {
  // This endpoint overwrites the admin password on a valid token — rate-limit
  // it like the other auth endpoints to remove any token-guessing surface.
  const limited = await enforceRateLimit(request, "admin-reset-confirm", LIMITS.auth);
  if (limited) return limited;

  const parsed = await readJson<{ token?: string; newPassword?: string }>(request, 4 * 1024);
  if (!parsed.ok) return parsed.response;
  const { token, newPassword } = parsed.data;

  if (!token || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const stored = await readDoc<{ tokenHash?: string; expiresAt?: number }>("reset-token", {});

  // Constant-time compare of the SHA-256 token hash; reject malformed/expired.
  const providedHash = crypto.createHash("sha256").update(token).digest();
  const storedHash = stored.tokenHash ? Buffer.from(stored.tokenHash, "hex") : Buffer.alloc(0);
  const tokenOk =
    storedHash.length === providedHash.length &&
    crypto.timingSafeEqual(storedHash, providedHash);
  if (!tokenOk || typeof stored.expiresAt !== "number" || Date.now() > stored.expiresAt) {
    return NextResponse.json({ ok: false, error: "Reset link is invalid or has expired." }, { status: 400 });
  }

  // Store the new password as a salted scrypt hash (never plaintext at rest),
  // then consume the one-time token.
  await writeDoc("admin-password", { passwordHash: hashPassword(newPassword) });
  await deleteDoc("reset-token");

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import { enforceRateLimit, readJson } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { log } from "@/lib/logger";
import { writeDoc } from "@/lib/storage";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin-reset", LIMITS.auth);
  if (limited) return limited;

  const parsed = await readJson<{ email?: string }>(request, 4 * 1024);
  if (!parsed.ok) return parsed.response;
  const { email } = parsed.data;

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !adminEmails.includes(email.toLowerCase())) {
    // Return success anyway to avoid email enumeration.
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  // Persist only a HASH of the token at rest, so a leaked/backed-up .data file
  // can't be replayed to seize the admin password.
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

  await writeDoc("reset-token", { tokenHash, expiresAt });

  // SECURITY: never return the token in the HTTP response. Doing so would hand an
  // unauthenticated caller a working admin-password-reset link (full account
  // takeover), since the admin email allowlist is small and effectively public.
  // The link must reach the owner OUT OF BAND. No mail provider is wired up yet,
  // so we emit it to the SERVER log only — visible to the operator at the console,
  // never to any HTTP client. Replace with a real transactional email when ready.
  log.warn(
    `Admin password reset requested — deliver this link to the owner out-of-band: /admin/reset?token=${token}`,
  );

  // Enumeration-safe response: identical whether or not the email matched.
  return NextResponse.json({ ok: true });
}

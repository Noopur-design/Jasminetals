import { NextResponse } from "next/server";
import { createLead } from "@/lib/store";
import { enforceRateLimit, badRequest, readJson } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";

// Public, unauthenticated input — the highest-risk surface. Validate, bound, and
// rate-limit it.
const MAX_SHORT = 200;
const MAX_MESSAGE = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cap = (s: unknown, n: number) => String(s ?? "").trim().slice(0, n);

// Public POST — no auth required; anyone can submit the consultation form.
export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "leads", LIMITS.publicWrite);
  if (limited) return limited;

  const parsed = await readJson<Record<string, unknown>>(req, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const name = cap(body.name, MAX_SHORT);
  const email = cap(body.email, MAX_SHORT);
  const phone = cap(body.phone, MAX_SHORT);
  const eventType = cap(body.eventType, MAX_SHORT);

  if (!name || !email || !phone || !eventType) {
    return badRequest("Missing required fields");
  }
  if (!EMAIL_RE.test(email)) {
    return badRequest("Please enter a valid email address.");
  }

  const lead = await createLead({
    name,
    email,
    phone,
    eventType,
    eventDate: cap(body.eventDate, MAX_SHORT) || undefined,
    guestCount: cap(body.guestCount, MAX_SHORT) || undefined,
    budget: cap(body.budget, MAX_SHORT) || undefined,
    message: cap(body.message, MAX_MESSAGE) || undefined,
    submittedAt: new Date().toISOString(),
    status: "new",
  });

  return NextResponse.json({ ok: true, lead }, { status: 201 });
}

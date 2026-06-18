import { NextResponse } from "next/server";
import { createLead } from "@/lib/store";

// Public POST — no auth required; anyone can submit the consultation form.
export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const { name, email, phone, eventType } = body;
  if (!name?.trim() || !email?.trim() || !phone?.trim() || !eventType?.trim()) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const lead = await createLead({
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    eventType: eventType.trim(),
    eventDate: body.eventDate || undefined,
    guestCount: body.guestCount || undefined,
    budget: body.budget || undefined,
    message: body.message?.trim() || undefined,
    submittedAt: new Date().toISOString(),
    status: "new",
  });

  return NextResponse.json({ ok: true, lead }, { status: 201 });
}

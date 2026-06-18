import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server-auth";
import { listEvents, createEvent } from "@/lib/store";
import { scopeEvents } from "@/lib/scope";
import type { EventStatus } from "@/lib/internal-data";

// GET /api/admin/events → list. Admin sees all; a team member is scoped to the
// events assigned to them (enforced here, server-side).
export async function GET() {
  const session = await requirePermission("events", "view");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const events = scopeEvents(await listEvents(), session);
  return NextResponse.json({ ok: true, events });
}

// POST /api/admin/events → create
export async function POST(request: Request) {
  if (!(await requirePermission("events", "create"))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.client || !body.date) {
    return NextResponse.json(
      { ok: false, error: "Client and date are required." },
      { status: 400 },
    );
  }
  const event = await createEvent({
    client: String(body.client),
    type: String(body.type ?? "Wedding"),
    date: String(body.date),
    status: (body.status as EventStatus) ?? "lead",
    assignedTeam: Array.isArray(body.assignedTeam) ? (body.assignedTeam as string[]) : [],
    budget: Number(body.budget) || 0,
    location: String(body.location ?? ""),
    coverSeed: String(body.coverSeed || "udaipur-lake-wedding"),
    guests: Number(body.guests) || 0,
  });
  return NextResponse.json({ ok: true, event });
}

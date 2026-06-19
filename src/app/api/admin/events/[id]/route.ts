import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import { updateEvent, deleteEvent, listEvents } from "@/lib/store";
import { canSeeEvent } from "@/lib/scope";
import type { EventStatus } from "@/lib/internal-data";

// PATCH /api/admin/events/[id] → edit
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requirePermission("events", "edit");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  // A team member can only edit events assigned to them; don't reveal others.
  const target = (await listEvents()).find((e) => e.id === id);
  if (!target || !canSeeEvent(target, session)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const parsed = await readJson<Record<string, unknown>>(request, 32 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  const patch: Record<string, unknown> = {};
  if (body.client !== undefined) patch.client = String(body.client);
  if (body.type !== undefined) patch.type = String(body.type);
  if (body.date !== undefined) patch.date = String(body.date);
  if (body.status !== undefined) patch.status = body.status as EventStatus;
  // Reassigning the team is an owner-admin action only — a team member must not
  // grant themselves (or revoke) event access.
  if (body.assignedTeam !== undefined && session.role === "admin")
    patch.assignedTeam = body.assignedTeam as string[];
  if (body.budget !== undefined) patch.budget = Number(body.budget) || 0;
  if (body.location !== undefined) patch.location = String(body.location);
  if (body.guests !== undefined) patch.guests = Number(body.guests) || 0;
  if (body.coverSeed !== undefined) patch.coverSeed = String(body.coverSeed);

  const event = await updateEvent(id, patch);
  if (!event) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, event });
}

// DELETE /api/admin/events/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requirePermission("events", "delete");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const target = (await listEvents()).find((e) => e.id === id);
  if (!target || !canSeeEvent(target, session)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const ok = await deleteEvent(id);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

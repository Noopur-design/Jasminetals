import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { listLeads, updateLead, deleteLead, type Lead } from "@/lib/store";

// GET /api/admin/leads — list all leads (admin only)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const leads = await listLeads();
  return NextResponse.json({ ok: true, leads });
}

// PATCH /api/admin/leads — update a lead's status or assignedTeam
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  let body: { id: string; status?: Lead["status"]; assignedTeam?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }
  const patch: Partial<Omit<Lead, "id">> = {};
  if (body.status !== undefined) patch.status = body.status;
  if (body.assignedTeam !== undefined) patch.assignedTeam = body.assignedTeam;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
  }
  const updated = await updateLead(body.id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, lead: updated });
}

// DELETE /api/admin/leads — delete a lead by id
export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  let body: { id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  const ok = await deleteLead(body.id);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

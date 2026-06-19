import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
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
  const parsed = await readJson<{ id?: string; status?: Lead["status"]; assignedTeam?: string[] }>(req, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
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
  const parsed = await readJson<{ id?: string }>(req, 4 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  if (!body.id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  const ok = await deleteLead(body.id);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

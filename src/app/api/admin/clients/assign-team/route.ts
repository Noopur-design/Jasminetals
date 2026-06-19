import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import { getClientAssignment, setClientAssignment } from "@/lib/store";

// PATCH /api/admin/clients/assign-team
// Body: { email: string; teamIds: string[] }
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const parsed = await readJson<{ email?: string; teamIds?: string[] }>(req, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const { email, teamIds } = body;
  if (!email || !Array.isArray(teamIds)) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const assignment = await getClientAssignment(email);
  if (!assignment) {
    return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  }

  const updated = await setClientAssignment({ ...assignment, assignedTeam: teamIds });
  return NextResponse.json({ ok: true, assignment: updated });
}

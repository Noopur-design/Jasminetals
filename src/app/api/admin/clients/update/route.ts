import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { getClientAssignment, setClientAssignment } from "@/lib/store";
import type { ClientAssignment } from "@/lib/store";

// PATCH /api/admin/clients/update
// Body: { email, ...fields to update on ClientAssignment }
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let body: Partial<ClientAssignment> & { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const { email, ...patch } = body;
  if (!email) {
    return NextResponse.json({ ok: false, error: "email is required" }, { status: 400 });
  }

  const existing = await getClientAssignment(email);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  }

  const updated = await setClientAssignment({ ...existing, ...patch, email });
  return NextResponse.json({ ok: true, assignment: updated });
}

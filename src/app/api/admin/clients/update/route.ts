import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import { getClientAssignment, setClientAssignment, setClientPassword } from "@/lib/store";
import type { ClientAssignment } from "@/lib/store";

// PATCH /api/admin/clients/update
// Body: { email, ...fields to update on ClientAssignment }
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const parsed = await readJson<Partial<ClientAssignment> & { email?: string; password?: string }>(req, 32 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const { email, password, ...patch } = body;
  if (!email) {
    return NextResponse.json({ ok: false, error: "email is required" }, { status: 400 });
  }

  const existing = await getClientAssignment(email);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
  }

  // Never let a raw hash ride in through the field spread.
  delete (patch as Record<string, unknown>).passwordHash;
  const updated = await setClientAssignment({ ...existing, ...patch, email });

  // Optional: set/replace the client's portal sign-in password (min 6 chars).
  if (typeof password === "string" && password.length >= 6) {
    await setClientPassword(email, password);
  }

  return NextResponse.json({ ok: true, assignment: updated });
}

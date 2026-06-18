import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import {
  getClientAssignment,
  setClientAssignment,
  deleteClientAssignment,
} from "@/lib/store";

type Params = { params: Promise<{ email: string }> };

// PATCH /api/admin/client-assignments/[email] — update fields
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email);

  const existing = await getClientAssignment(decoded);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  let patch: Record<string, unknown>;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const { email: _ignored, ...safe } = patch;
  void _ignored;
  const updated = await setClientAssignment({ ...existing, ...safe });
  return NextResponse.json({ ok: true, assignment: updated });
}

// DELETE /api/admin/client-assignments/[email] — remove portal client
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email);

  const deleted = await deleteClientAssignment(decoded);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

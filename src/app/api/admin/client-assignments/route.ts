import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { listClientAssignments } from "@/lib/store";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const assignments = await listClientAssignments();
  return NextResponse.json({ ok: true, assignments });
}

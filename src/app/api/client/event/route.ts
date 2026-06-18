import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-auth";
import { getClientAssignment } from "@/lib/store";

// GET /api/client/event — returns the logged-in client's event assignment.
export async function GET() {
  const session = await getServerSession();
  if (!session || (session.role !== "client" && session.role !== "admin")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const assignment = await getClientAssignment(session.email);
  if (!assignment) {
    return NextResponse.json({ ok: false, error: "No event found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, event: assignment });
}

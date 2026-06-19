import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import {
  setClientAssignment,
  setClientPortalData,
  seedClientPortalData,
  updateLead,
  type ClientAssignment,
} from "@/lib/store";

// POST /api/admin/promote-lead
// Promotes a contacted lead to a client: stores their event, updates lead status.
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const parsed = await readJson<{
    leadId: string;
    email: string;
    name: string;
    phone?: string;
    eventName: string;
    eventType: string;
    eventDate: string;
    venue: string;
    location: string;
    guestCount?: string;
    budget?: string;
  }>(req, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const { leadId, email, name, eventName, eventType, eventDate, venue, location } = body;
  if (!leadId || !email || !name || !eventName || !eventType || !eventDate || !venue || !location) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const assignment: ClientAssignment = {
    email,
    name,
    phone: body.phone,
    eventName,
    eventType,
    eventDate,
    venue,
    location,
    guestCount: body.guestCount,
    budget: body.budget,
    assignedAt: new Date().toISOString(),
  };

  await setClientAssignment(assignment);
  await setClientPortalData(seedClientPortalData(assignment));
  await updateLead(leadId, { status: "converted" });

  return NextResponse.json({ ok: true, assignment }, { status: 201 });
}

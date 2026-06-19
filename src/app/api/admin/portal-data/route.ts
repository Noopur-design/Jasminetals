import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import {
  getClientPortalData,
  setClientPortalData,
  getClientAssignment,
  seedClientPortalData,
  type ClientPortalData,
  type ClientMilestone,
} from "@/lib/store";

// GET /api/admin/portal-data?email=foo@bar.com
export async function GET(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const email = req.nextUrl.searchParams.get("email");
  if (!email)
    return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });

  let data = await getClientPortalData(email);
  if (!data) {
    const assignment = await getClientAssignment(email);
    if (!assignment)
      return NextResponse.json({ ok: true, data: null });
    data = seedClientPortalData(assignment);
  }
  return NextResponse.json({ ok: true, data });
}

// POST /api/admin/portal-data
// body: { email, budget?: { total: number, lines: ClientBudgetLine[] }, milestones?: ClientMilestone[] }
export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const parsed = await readJson<{
    email?: string;
    budget?: ClientPortalData["budget"];
    milestones?: ClientMilestone[];
  }>(req, 128 * 1024);
  if (!parsed.ok) return parsed.response;
  const { email, budget, milestones } = parsed.data;
  if (!email)
    return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
  // Bound array sizes so a single write can't bloat the portal store (re-read &
  // re-serialised on every portal access).
  if (milestones && milestones.length > 100)
    return NextResponse.json({ ok: false, error: "Too many milestones (max 100)." }, { status: 400 });
  if (budget?.lines && budget.lines.length > 100)
    return NextResponse.json({ ok: false, error: "Too many budget lines (max 100)." }, { status: 400 });

  // Load existing or seed fresh
  let existing = await getClientPortalData(email);
  if (!existing) {
    const assignment = await getClientAssignment(email);
    if (!assignment)
      return NextResponse.json({ ok: false, error: "Client not found" }, { status: 404 });
    existing = seedClientPortalData(assignment);
  }

  const updated: ClientPortalData = {
    ...existing,
    ...(budget !== undefined ? { budget } : {}),
    ...(milestones !== undefined ? { milestones } : {}),
  };

  await setClientPortalData(updated);
  return NextResponse.json({ ok: true, data: updated });
}

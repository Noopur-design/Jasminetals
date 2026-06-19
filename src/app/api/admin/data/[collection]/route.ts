import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import {
  isCollection,
  listCollection,
  createInCollection,
  listEvents,
  listClientAssignments,
} from "@/lib/store";
import { canSeeTaskEventId } from "@/lib/scope";
import type { Module } from "@/lib/permissions";

// Each data collection maps to a permission module of the same name.
function moduleFor(collection: string): Module | null {
  return collection === "clients" || collection === "vendors" || collection === "tasks"
    ? (collection as Module)
    : null;
}

// GET /api/admin/data/[collection]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  const mod = moduleFor(collection);
  if (!mod || !isCollection(collection)) {
    return NextResponse.json({ ok: false, error: "Unknown collection" }, { status: 404 });
  }
  const session = await requirePermission(mod, "view");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const items = await listCollection(collection);
  // Tasks are scoped to a team member's own events (stored + portal); other
  // collections are shared reference data governed by module permissions. Admin
  // sees everything.
  if (collection === "tasks" && session.role !== "admin") {
    const [events, portals] = await Promise.all([listEvents(), listClientAssignments()]);
    const visible = (items as unknown as Array<{ eventId: string }>).filter((t) =>
      canSeeTaskEventId(t.eventId, events, portals, session),
    );
    return NextResponse.json({ ok: true, items: visible });
  }
  return NextResponse.json({ ok: true, items });
}

// POST /api/admin/data/[collection]
export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  const mod = moduleFor(collection);
  if (!mod || !isCollection(collection)) {
    return NextResponse.json({ ok: false, error: "Unknown collection" }, { status: 404 });
  }
  const session = await requirePermission(mod, "create");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const parsed = await readJson<Record<string, unknown>>(req, 64 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  // Scope writes too: a team member may only create a task on an event/portal
  // assigned to them (mirrors the GET filter and the PATCH/DELETE guards). 404 so
  // an out-of-scope eventId is never confirmed to exist.
  if (collection === "tasks" && session.role !== "admin") {
    const [events, portals] = await Promise.all([listEvents(), listClientAssignments()]);
    if (!canSeeTaskEventId(String(body.eventId ?? ""), events, portals, session)) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
  }
  const item = await createInCollection(collection, body);
  return NextResponse.json({ ok: true, item });
}

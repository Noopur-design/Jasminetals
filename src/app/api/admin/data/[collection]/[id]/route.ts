import { NextResponse } from "next/server";
import type { SessionUser } from "@/lib/auth";
import { requirePermission } from "@/lib/server-auth";
import {
  isCollection,
  updateInCollection,
  deleteFromCollection,
  listCollection,
  listEvents,
  listClientAssignments,
} from "@/lib/store";
import { canSeeTaskEventId } from "@/lib/scope";
import type { Module } from "@/lib/permissions";

function moduleFor(collection: string): Module | null {
  return collection === "clients" || collection === "vendors" || collection === "tasks"
    ? (collection as Module)
    : null;
}

// A team member may only mutate tasks on events/portals assigned to them.
// Returns true if the (collection,id) target is out of the member's scope.
async function taskOutOfScope(
  collection: string,
  id: string,
  session: SessionUser,
): Promise<boolean> {
  if (collection !== "tasks" || session.role === "admin") return false;
  const tasks = await listCollection("tasks");
  const task = tasks.find((t) => (t as { id?: string }).id === id) as
    | { eventId?: string }
    | undefined;
  if (!task) return true; // unknown task → treat as not found / out of scope
  const [events, portals] = await Promise.all([listEvents(), listClientAssignments()]);
  return !canSeeTaskEventId(task.eventId ?? "", events, portals, session);
}

// PATCH /api/admin/data/[collection]/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  const mod = moduleFor(collection);
  if (!mod || !isCollection(collection)) {
    return NextResponse.json({ ok: false, error: "Unknown collection" }, { status: 404 });
  }
  const session = await requirePermission(mod, "edit");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (await taskOutOfScope(collection, id, session)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const item = await updateInCollection(collection, id, body);
  if (!item) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

// DELETE /api/admin/data/[collection]/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  const mod = moduleFor(collection);
  if (!mod || !isCollection(collection)) {
    return NextResponse.json({ ok: false, error: "Unknown collection" }, { status: 404 });
  }
  const session = await requirePermission(mod, "delete");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (await taskOutOfScope(collection, id, session)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const ok = await deleteFromCollection(collection, id);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

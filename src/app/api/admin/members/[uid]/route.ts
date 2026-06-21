import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { getMirror, upsertMirror } from "@/lib/firebase/mirror";
import type { Permissions } from "@/lib/permissions";

function guardConfigured() {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Firebase Admin not configured on the server (see SETUP-ADMIN.md)." },
      { status: 503 },
    );
  }
  return null;
}

// PATCH /api/admin/members/[uid] → update permissions and/or status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const notReady = guardConfigured();
  if (notReady) return notReady;

  const { uid } = await params;
  const parsed = await readJson<{ permissions?: Permissions; status?: "active" | "suspended" }>(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const { permissions, status } = parsed.data;

  if (status === "suspended") {
    // Strip the team role entirely → instantly loses all admin access.
    await adminAuth().setCustomUserClaims(uid, { role: null, permissions: null });
  } else {
    const existing = await getMirror("members", uid);
    const perms = permissions ?? (existing?.permissions as Permissions) ?? {};
    await adminAuth().setCustomUserClaims(uid, { role: "team", permissions: perms });
  }
  await adminAuth().revokeRefreshTokens(uid);

  const update: Record<string, unknown> = { updatedAt: Date.now() };
  if (permissions) update.permissions = permissions;
  if (status) update.status = status;
  await upsertMirror("members", uid, update);

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/members/[uid] → revoke team access (demote to client)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const notReady = guardConfigured();
  if (notReady) return notReady;

  const { uid } = await params;
  await adminAuth().setCustomUserClaims(uid, { role: null, permissions: null });
  await adminAuth().revokeRefreshTokens(uid);
  await upsertMirror("members", uid, { role: "client", status: "removed", updatedAt: Date.now() });
  return NextResponse.json({ ok: true });
}

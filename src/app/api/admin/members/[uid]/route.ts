import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
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
  let permissions: Permissions | undefined;
  let status: "active" | "suspended" | undefined;
  try {
    ({ permissions, status } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (status === "suspended") {
    // Strip the team role entirely → instantly loses all admin access.
    await adminAuth().setCustomUserClaims(uid, { role: null, permissions: null });
  } else {
    const existing = (await adminDb().collection("members").doc(uid).get()).data();
    const perms = permissions ?? (existing?.permissions as Permissions) ?? {};
    await adminAuth().setCustomUserClaims(uid, { role: "team", permissions: perms });
  }
  await adminAuth().revokeRefreshTokens(uid);

  const update: Record<string, unknown> = { updatedAt: Date.now() };
  if (permissions) update.permissions = permissions;
  if (status) update.status = status;
  await adminDb().collection("members").doc(uid).set(update, { merge: true });

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
  await adminDb().collection("members").doc(uid).set(
    { role: "client", status: "removed", updatedAt: Date.now() },
    { merge: true },
  );
  return NextResponse.json({ ok: true });
}

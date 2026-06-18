import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import {
  updateTeamAccount,
  setTeamAccountPassword,
  deleteTeamAccount,
  getTeamAccount,
  toPublic,
} from "@/lib/team-accounts";
import type { Permissions } from "@/lib/permissions";

// PATCH /api/admin/team-accounts/[id] → update fields and/or set password (admin only).
// body: { username?, name?, email?, roleLabel?, permissions?, status?, password? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  let body: {
    username?: string;
    name?: string;
    email?: string;
    roleLabel?: string;
    permissions?: Permissions;
    status?: "active" | "suspended";
    password?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  // Password reset (admin-only — team members have no self-serve path).
  if (body.password !== undefined) {
    if (body.password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }
    const ok = await setTeamAccountPassword(id, body.password);
    if (!ok) return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  const hasFieldUpdate =
    body.username !== undefined ||
    body.name !== undefined ||
    body.email !== undefined ||
    body.roleLabel !== undefined ||
    body.permissions !== undefined ||
    body.status !== undefined;

  if (hasFieldUpdate) {
    const result = await updateTeamAccount(id, {
      username: body.username,
      name: body.name,
      email: body.email,
      roleLabel: body.roleLabel,
      permissions: body.permissions,
      status: body.status,
    });
    if (!result.ok) {
      const status = result.error === "Account not found." ? 404 : 409;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    return NextResponse.json({ ok: true, account: toPublic(result.account) });
  }

  const account = await getTeamAccount(id);
  if (!account) return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  return NextResponse.json({ ok: true, account: toPublic(account) });
}

// DELETE /api/admin/team-accounts/[id] → remove an account (admin only).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const ok = await deleteTeamAccount(id);
  if (!ok) return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

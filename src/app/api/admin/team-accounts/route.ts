import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import {
  listTeamAccounts,
  upsertTeamAccount,
  setTeamAccountPassword,
  toPublic,
} from "@/lib/team-accounts";
import type { Permissions } from "@/lib/permissions";

// GET /api/admin/team-accounts → list all team logins (admin only, no hashes).
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const accounts = (await listTeamAccounts()).map(toPublic);
  return NextResponse.json({ ok: true, accounts });
}

// POST /api/admin/team-accounts → create or update an account (admin only).
// body: { id?, username, name, email, roleLabel?, permissions?, status?, password? }
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const parsed = await readJson<{
    id?: string;
    username?: string;
    name?: string;
    email?: string;
    roleLabel?: string;
    permissions?: Permissions;
    status?: "active" | "suspended";
    password?: string;
  }>(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  if (!body.username) {
    return NextResponse.json({ ok: false, error: "Username is required." }, { status: 400 });
  }
  // Same server-side rule as the PATCH reset path, so neither can drift to a weak password.
  if (body.password !== undefined && body.password.length < 6) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const result = await upsertTeamAccount({
    id: body.id,
    username: body.username,
    name: body.name ?? "",
    email: body.email ?? "",
    roleLabel: body.roleLabel,
    permissions: body.permissions,
    status: body.status,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
  }

  // Optional password assignment on create.
  if (body.password) {
    await setTeamAccountPassword(result.account.id, body.password);
  }

  return NextResponse.json({ ok: true, account: toPublic(result.account) });
}

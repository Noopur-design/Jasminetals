import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { listMirror, upsertMirror } from "@/lib/firebase/mirror";
import { VIEWER_PERMISSIONS, type Permissions } from "@/lib/permissions";

function guardConfigured() {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Firebase Admin not configured on the server (see SETUP-ADMIN.md)." },
      { status: 503 },
    );
  }
  return null;
}

// GET /api/admin/members → list all team members (admin only)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const notReady = guardConfigured();
  if (notReady) return notReady;

  return NextResponse.json({ ok: true, members: await listMirror("members") });
}

// POST /api/admin/members → promote an existing user to "team" with permissions
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const notReady = guardConfigured();
  if (notReady) return notReady;

  const parsed = await readJson<{ email?: string; permissions?: Permissions }>(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const { email, permissions } = parsed.data;
  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  }

  let user;
  try {
    user = await adminAuth().getUserByEmail(email.trim().toLowerCase());
  } catch {
    return NextResponse.json(
      { ok: false, error: "No account with that email yet — ask them to sign up first." },
      { status: 404 },
    );
  }

  const perms = permissions ?? VIEWER_PERMISSIONS;
  await adminAuth().setCustomUserClaims(user.uid, { role: "team", permissions: perms });
  await adminAuth().revokeRefreshTokens(user.uid); // force claims to refresh
  await upsertMirror("members", user.uid, {
    email: user.email,
    name: user.displayName ?? "",
    role: "team",
    permissions: perms,
    status: "active",
    updatedAt: Date.now(),
  });

  return NextResponse.json({ ok: true, uid: user.uid });
}

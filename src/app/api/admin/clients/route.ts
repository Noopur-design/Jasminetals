import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { listMirror, upsertMirror } from "@/lib/firebase/mirror";

function guardConfigured() {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Firebase Admin not configured on the server (see SETUP-ADMIN.md)." },
      { status: 503 },
    );
  }
  return null;
}

// GET /api/admin/clients → list activated clients (admin only)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const notReady = guardConfigured();
  if (notReady) return notReady;

  return NextResponse.json({ ok: true, clients: await listMirror("clients") });
}

// POST /api/admin/clients → mark a deal done (activate) or revoke portal access
//   body: { email: string, active?: boolean }  (active defaults to true)
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const notReady = guardConfigured();
  if (notReady) return notReady;

  const parsed = await readJson<{ email?: string; active?: boolean }>(request, 4 * 1024);
  if (!parsed.ok) return parsed.response;
  const email = parsed.data.email;
  const active = typeof parsed.data.active === "boolean" ? parsed.data.active : true;
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

  // active → grant the "client" role (portal unlocks); inactive → back to lead.
  await adminAuth().setCustomUserClaims(user.uid, { role: active ? "client" : null });
  await adminAuth().revokeRefreshTokens(user.uid); // force the new role to apply
  await upsertMirror("clients", user.uid, {
    email: user.email,
    name: user.displayName ?? "",
    status: active ? "active" : "revoked",
    updatedAt: Date.now(),
  });

  return NextResponse.json({ ok: true, uid: user.uid, status: active ? "active" : "revoked" });
}

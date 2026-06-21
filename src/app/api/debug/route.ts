import { NextResponse } from "next/server";

// TEMPORARY diagnostic — exposes no secrets (booleans + public DB url + node
// version + caught error text). Remove after debugging the Vercel deploy.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const out: Record<string, unknown> = {
    node: process.version,
    nextRuntime: process.env.NEXT_RUNTIME ?? null,
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    hasAdminEmail: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
    hasAdminKey: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
    dbUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? null,
  };

  // Reproduce the firebase-admin load + RTDB call, capturing any error.
  try {
    const { adminRtdb, isAdminConfigured } = await import("@/lib/firebase/admin");
    out.isAdminConfigured = isAdminConfigured();
    await adminRtdb().ref("jt_store/__debug__").get();
    out.rtdb = "ok";
  } catch (e) {
    out.rtdbError = e instanceof Error ? (e.stack ?? e.message) : String(e);
  }

  // Reproduce the jose load (session JWT lib), capturing any error.
  try {
    const jose = await import("jose");
    out.jose = typeof jose.SignJWT === "function" ? "ok" : "loaded-no-SignJWT";
  } catch (e) {
    out.joseError = e instanceof Error ? (e.stack ?? e.message) : String(e);
  }

  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}

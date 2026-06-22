import { NextResponse } from "next/server";

// TEMPORARY diagnostic — no secrets (booleans + node version + caught error text).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const out: Record<string, unknown> = {
    node: process.version,
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    hasAdminEmail: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
    hasAdminKey: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
    adminKeyLen: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").length,
    dbUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? null,
  };
  try {
    const { adminRtdb, isAdminConfigured } = await import("@/lib/firebase/admin");
    out.isAdminConfigured = isAdminConfigured();
    await adminRtdb().ref("jt_store/__debug__").get();
    out.rtdb = "ok";
  } catch (e) {
    out.rtdbError = e instanceof Error ? (e.message) : String(e);
  }
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}

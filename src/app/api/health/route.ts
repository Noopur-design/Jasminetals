import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

// Liveness/readiness probe for monitoring. Cheap, unauthenticated, leaks nothing
// sensitive — just whether the process is up and the data store is reachable.
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "fail"> = {};

  try {
    if (isAdminConfigured()) {
      // Production: confirm Firestore is reachable.
      await adminDb().collection("jt_store").doc("__health__").get();
    } else {
      // Local dev: confirm the .data dir is writable.
      const dir = path.join(process.cwd(), ".data");
      await fs.mkdir(dir, { recursive: true });
      await fs.access(dir);
    }
    checks.dataStore = "ok";
  } catch {
    checks.dataStore = "fail";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      // Which persistence backend is active — "filesystem" on Vercel means the
      // Firebase Admin key isn't set (writes will fail on the read-only FS).
      backend: isAdminConfigured() ? "firestore" : "filesystem",
      uptime: Math.round(process.uptime()),
      ts: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

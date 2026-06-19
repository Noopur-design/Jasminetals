import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { kv, kvEnabled } from "@/lib/kv";

// Liveness/readiness probe for monitoring. Cheap, unauthenticated, leaks nothing
// sensitive — just whether the process is up and the data store is reachable.
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "fail"> = {};

  try {
    if (kvEnabled) {
      // Production: confirm the KV store is reachable.
      await kv().ping();
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
      // Which persistence backend is active — "filesystem" on Vercel means KV
      // isn't configured (writes will fail on the read-only serverless FS).
      backend: kvEnabled ? "kv" : "filesystem",
      uptime: Math.round(process.uptime()),
      ts: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

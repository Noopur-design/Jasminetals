import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { readJson } from "@/lib/http";
import { getSettings, saveSettings, type StudioSettings } from "@/lib/store";

// GET /api/admin/settings → load studio settings
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ ok: true, settings: await getSettings() });
}

// PUT /api/admin/settings → save a section (partial settings)
export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const parsed = await readJson<Partial<StudioSettings>>(request, 64 * 1024);
  if (!parsed.ok) return parsed.response;
  const settings = await saveSettings(parsed.data);
  return NextResponse.json({ ok: true, settings });
}

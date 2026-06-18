import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
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
  let body: Partial<StudioSettings>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const settings = await saveSettings(body);
  return NextResponse.json({ ok: true, settings });
}

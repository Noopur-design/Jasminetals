import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { deleteBlogPost } from "@/lib/blog";

// DELETE /api/admin/blog/[id] → remove a post (admin only).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const ok = await deleteBlogPost(id);
  if (!ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

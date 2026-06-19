import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { enforceRateLimit, readJson } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { listBlogPosts, createBlogPost } from "@/lib/blog";

// GET /api/admin/blog → list all posts (admin only).
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const posts = await listBlogPosts();
  return NextResponse.json({ ok: true, posts });
}

// POST /api/admin/blog → create a post (admin only).
// body: { title, content, excerpt?, coverImage?, author?, publishedAt? }
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "blog-write", LIMITS.write);
  if (limited) return limited;
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const parsed = await readJson<Record<string, unknown>>(request, 64 * 1024);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const result = await createBlogPost({
    title: String(body.title ?? ""),
    content: String(body.content ?? ""),
    excerpt: body.excerpt != null ? String(body.excerpt) : undefined,
    coverImage: body.coverImage != null ? String(body.coverImage) : undefined,
    author: body.author != null ? String(body.author) : undefined,
    publishedAt: body.publishedAt != null ? String(body.publishedAt) : undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, post: result.post });
}

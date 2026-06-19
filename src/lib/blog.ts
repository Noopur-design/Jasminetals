import "server-only";
import { randomBytes } from "crypto";
import { readDoc, writeDoc } from "@/lib/storage";
import { imageUrl } from "@/lib/images";

/**
 * Blog posts — a self-contained, admin-managed store living in
 * `.data/blog-posts.json` (same zero-setup persistence as the rest of the app).
 * Intentionally independent of the RBAC "collections" registry: blog isn't a
 * permission module, so it gets its own dedicated module + admin-only API.
 * Public pages read these directly (server components); only the owner-admin can
 * create or delete posts.
 */

export type BlogPost = {
  id: string;
  slug: string; // unique, URL-safe — derived from the title
  title: string;
  excerpt: string; // short teaser for cards/meta (auto-derived if left blank)
  content: string; // plain text; blank lines separate paragraphs when rendered
  coverImage: string; // optional image URL ("" = none)
  author: string;
  publishedAt: string; // ISO date (YYYY-MM-DD)
  createdAt: number; // ms — stable tiebreaker for ordering
};

// First-run seed so the public /blog page isn't empty out of the box.
function seed(): BlogPost[] {
  return [
    {
      id: "bp-seed-process",
      slug: "how-we-plan-an-unforgettable-wedding",
      title: "How we plan an unforgettable wedding, step by step",
      excerpt:
        "From the very first consultation to the last dance — a look inside the Jasminetals planning process.",
      content:
        "Every celebration begins with a conversation. Before a single vendor is booked or a colour palette is chosen, we sit down with you to understand the story you want to tell.\n\nFrom there, our team builds a bespoke plan: venue scouting, design direction, a vendor shortlist matched to your budget, and a running timeline that keeps every moving piece on track.\n\nOn the day itself, you get to be a guest at your own celebration. We handle the logistics, the cues and the quiet problem-solving in the background, so all you have to do is enjoy it.",
      coverImage: imageUrl("udaipur-mandap-florals") ?? "",
      author: "Jasminetals Studio",
      publishedAt: "2026-05-12",
      createdAt: 0,
    },
    {
      id: "bp-seed-trends",
      slug: "five-celebration-trends-were-loving-this-season",
      title: "Five celebration trends we're loving this season",
      excerpt:
        "Intimate guest lists, statement florals and late-night feasts — the details defining this season's events.",
      content:
        "This season is all about intentionality. Couples are trading sprawling guest lists for intimate gatherings where every person in the room matters.\n\nStatement florals are having a moment — think suspended installations and single-stem aisles. Paired with warm, candle-led lighting, they turn a venue into something cinematic.\n\nAnd the food? Late-night street-food counters are the surprise everyone remembers the morning after.",
      coverImage: imageUrl("anniversary-garden-soiree") ?? "",
      author: "Jasminetals Studio",
      publishedAt: "2026-04-28",
      createdAt: 0,
    },
  ];
}

async function readAll(): Promise<BlogPost[]> {
  return readDoc<BlogPost[]>("blog-posts", seed());
}

async function writeAll(list: BlogPost[]): Promise<void> {
  return writeDoc("blog-posts", list);
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "post"
  );
}

function uniqueSlug(base: string, list: BlogPost[]): string {
  const taken = new Set(list.map((p) => p.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// ── Reads ───────────────────────────────────────────────────────
/** Newest first (by publish date, then creation time). */
export async function listBlogPosts(): Promise<BlogPost[]> {
  const all = await readAll();
  return all.sort(
    (a, b) =>
      (b.publishedAt || "").localeCompare(a.publishedAt || "") || b.createdAt - a.createdAt,
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = await readAll();
  return all.find((p) => p.slug === slug) ?? null;
}

// ── Writes (admin only — callers must gate with requireAdmin) ───
export type CreateBlogInput = {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author?: string;
  publishedAt?: string;
};

export async function createBlogPost(
  input: CreateBlogInput,
): Promise<{ ok: true; post: BlogPost } | { ok: false; error: string }> {
  const title = input.title?.trim();
  const content = input.content?.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (!content) return { ok: false, error: "Content is required." };
  // Bound every stored field so a single post can't bloat the JSON store (which
  // is fully read + re-serialised on every blog read/write).
  if (title.length > 200) return { ok: false, error: "Title is too long (max 200 characters)." };
  if (content.length > 50_000) return { ok: false, error: "Content is too long (max 50,000 characters)." };
  if ((input.excerpt ?? "").length > 500) return { ok: false, error: "Excerpt is too long (max 500 characters)." };
  if ((input.coverImage ?? "").length > 2_000) return { ok: false, error: "Cover image URL is too long." };
  if ((input.author ?? "").length > 200) return { ok: false, error: "Author name is too long." };

  const all = await readAll();
  const post: BlogPost = {
    id: `bp-${randomBytes(5).toString("hex")}`,
    slug: uniqueSlug(slugify(title), all),
    title,
    excerpt:
      (input.excerpt ?? "").trim() ||
      content.replace(/\s+/g, " ").slice(0, 160) + (content.length > 160 ? "…" : ""),
    content,
    coverImage: (input.coverImage ?? "").trim(),
    author: (input.author ?? "").trim() || "Jasminetals Studio",
    publishedAt: (input.publishedAt ?? "").trim() || new Date().toISOString().slice(0, 10),
    createdAt: Date.now(),
  };
  await writeAll([post, ...all]);
  return { ok: true, post };
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}

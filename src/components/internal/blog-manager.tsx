"use client";

import * as React from "react";
import { Plus, Trash2, Loader2, X, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/lib/images";

// Curated, on-brand covers (resolve to the CSP-allowed Unsplash CDN). Picking one
// stores its full URL in coverImage — no hunting for links that the CSP would block.
const COVER_CHOICES: { seed: string; label: string }[] = [
  { seed: "udaipur-mandap-florals", label: "Mandap florals" },
  { seed: "udaipur-lake-wedding", label: "Lakeside wedding" },
  { seed: "wedding-aisle-florals", label: "Aisle florals" },
  { seed: "anniversary-garden-soiree", label: "Garden soirée" },
  { seed: "corporate-gala-dinner", label: "Gala dinner" },
  { seed: "destination-beach-ceremony", label: "Beach ceremony" },
  { seed: "birthday-balloon-arch", label: "Celebration" },
  { seed: "candlelit-palace-dinner", label: "Palace dinner" },
];

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  createdAt: number;
};

export function BlogManager() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
      const data = res.ok ? await res.json() : {};
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function remove(p: Post) {
    if (!confirm(`Delete “${p.title}”? This removes it from the public blog.`)) return;
    setBusyId(p.id);
    try {
      await fetch(`/api/admin/blog/${p.id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          <FileText className="size-4 text-gold-dark" /> Posts
          <span className="rounded-full bg-line px-2 text-xs font-semibold text-ink-muted">
            {posts.length}
          </span>
        </h2>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-paper py-12 text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin" /> Loading posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-paper py-12 text-center text-sm text-ink-muted">
          No posts yet. Click “New post” to publish your first one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-paper">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Author</th>
                <th className="px-4 py-2.5 font-medium">Published</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => (
                <tr
                  key={p.id}
                  className={cn("transition-colors hover:bg-ivory/50", busyId === p.id && "opacity-50")}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{p.title}</p>
                    <p className="truncate text-xs text-ink-muted">/blog/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.author}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.publishedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${p.title}`}
                        title="View post"
                        className="inline-flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ivory hover:text-ink"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        aria-label={`Delete ${p.title}`}
                        title="Delete"
                        className="inline-flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ivory hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <PostModal
          onClose={() => setOpen(false)}
          onSaved={async () => {
            setOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function PostModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    title: "",
    author: "",
    publishedAt: "",
    coverImage: "",
    excerpt: "",
    content: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.content.trim()) return setError("Content is required.");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaving(false);
        setError(data.error ?? "Could not save.");
        return;
      }
      onSaved();
    } catch {
      setSaving(false);
      setError("Could not save. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-xl text-ink">New blog post</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Field label="Title" htmlFor="bp-title" required>
            <Input
              id="bp-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="How we plan an unforgettable wedding"
              autoFocus
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Author" htmlFor="bp-author" hint="Defaults to Jasminetals Studio">
              <Input
                id="bp-author"
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="Jasminetals Studio"
              />
            </Field>
            <Field label="Publish date" htmlFor="bp-date" hint="Defaults to today">
              <Input
                id="bp-date"
                type="date"
                value={form.publishedAt}
                onChange={(e) => set("publishedAt", e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Cover image"
            hint="Pick a studio image, or paste an Unsplash/Pexels URL below. Optional."
          >
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => set("coverImage", "")}
                title="No cover"
                className={cn(
                  "flex aspect-[4/3] items-center justify-center rounded-md border-2 bg-gold-tint text-xs text-ink-muted transition-colors",
                  form.coverImage === "" ? "border-gold" : "border-transparent hover:border-line-strong",
                )}
              >
                None
              </button>
              {COVER_CHOICES.map((c) => {
                const url = imageUrl(c.seed, 1280) ?? "";
                const thumb = imageUrl(c.seed, 320) ?? "";
                const selected = form.coverImage === url;
                return (
                  <button
                    type="button"
                    key={c.seed}
                    onClick={() => set("coverImage", url)}
                    title={c.label}
                    aria-pressed={selected}
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-md border-2 transition-colors",
                      selected ? "border-gold" : "border-transparent hover:border-line-strong",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt={c.label} className="size-full object-cover" />
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label="…or custom image URL"
            htmlFor="bp-cover"
            hint="Must be an Unsplash or Pexels link — other hosts are blocked by the site's security policy."
          >
            <Input
              id="bp-cover"
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://images.unsplash.com/…"
            />
          </Field>

          <Field
            label="Excerpt"
            htmlFor="bp-excerpt"
            hint="Optional — short teaser on cards. Auto-generated if left blank."
          >
            <Textarea
              id="bp-excerpt"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              className="min-h-0"
              rows={2}
              placeholder="A one or two line teaser…"
            />
          </Field>

          <Field
            label="Content"
            htmlFor="bp-content"
            required
            hint="Separate paragraphs with a blank line."
          >
            <Textarea
              id="bp-content"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              className="min-h-56"
              placeholder="Write your post…"
            />
          </Field>

          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Publish post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

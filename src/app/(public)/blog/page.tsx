import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Section, Container } from "@/components/ui/layout";
import { listBlogPosts } from "@/lib/blog";

// Posts are stored in .data at runtime — always render fresh, never statically.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Planning notes, real celebrations and a peek behind the scenes of the Jasminetals studio.",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage() {
  const posts = await listBlogPosts();

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="The Jasminetals Blog"
        lead="Planning notes, real celebrations and a peek behind the scenes of the studio."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <Section tone="ivory">
        <Container>
          {posts.length === 0 ? (
            <p className="text-center text-ink-soft">No posts yet — check back soon.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-line bg-paper shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  {post.coverImage ? (
                    // Admin-supplied URL; next/image isn't used so arbitrary hosts work.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt=""
                      className="aspect-[16/10] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[16/10] w-full bg-gold-tint" />
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <span className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                      {formatDate(post.publishedAt)}
                    </span>
                    <h2 className="font-serif text-xl leading-snug text-ink transition-colors group-hover:text-gold-dark">
                      {post.title}
                    </h2>
                    <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">
                      {post.excerpt}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-gold-dark">
                      Read more
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { Section, Container } from "@/components/ui/layout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getBlogPostBySlug } from "@/lib/blog";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <section className="bg-gold-tint pt-30 pb-14 sm:pt-34 sm:pb-16">
        <Container size="narrow">
          <div className="flex flex-col items-center gap-4 text-center">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
            <span className="eyebrow">Journal</span>
            <h1 className="text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]">{post.title}</h1>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <User className="size-4 text-gold" /> {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-gold" /> {formatDate(post.publishedAt)}
              </span>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="ivory">
        <Container size="narrow">
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="mb-10 aspect-[16/9] w-full rounded-xl object-cover"
            />
          )}
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-ink-soft">
            {paragraphs.length ? (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p>{post.content}</p>
            )}
          </div>
          <div className="mt-12 border-t border-line pt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark hover:underline"
            >
              <ArrowLeft className="size-4" /> Back to all posts
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

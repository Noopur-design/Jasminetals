import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, CalendarDays, Users } from "lucide-react";
import { Container, Section } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Lightbox } from "@/components/site/lightbox";
import { portfolio } from "@/lib/data";

export function generateStaticParams() {
  return portfolio.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = portfolio.find((p) => p.slug === slug);
  if (!item) return { title: "Event not found" };
  return {
    title: item.title,
    description: item.brief,
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = portfolio.find((p) => p.slug === slug);
  if (!item) notFound();

  const meta = [
    { icon: MapPin, label: "Location", value: item.location },
    { icon: CalendarDays, label: "Year", value: item.year },
    { icon: Users, label: "Guests", value: item.guests },
  ];

  return (
    <>
      {/* ---------- Cover hero ---------- */}
      <section className="relative flex min-h-[70vh] items-end pt-30">
        <Photo
          seed={item.cover}
          aspect="fill"
          rounded="rounded-none"
          priority
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40" />
        <Container className="relative">
          <div className="max-w-3xl pb-14 text-white">
            <div className="mb-4 [&_*]:text-white/80 [&_a:hover]:text-white">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Portfolio", href: "/portfolio" },
                  { label: item.title },
                ]}
              />
            </div>
            <Badge variant="gold" className="mb-4">
              {item.type}
            </Badge>
            <h1 className="text-balance font-serif text-4xl leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              {item.title}
            </h1>
            <p className="mt-4 text-lg text-white/85">
              {item.location} · {item.year}
            </p>
          </div>
        </Container>
      </section>

      {/* ---------- Meta strip ---------- */}
      <div className="border-b border-line bg-paper">
        <Container>
          <dl className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
            {meta.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                  <m.icon className="size-5" aria-hidden />
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink-muted">
                    {m.label}
                  </dt>
                  <dd className="font-serif text-lg text-ink">{m.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      {/* ---------- Brief & result ---------- */}
      <Section tone="ivory">
        <Container size="narrow">
          <div className="flex flex-col gap-12">
            <Reveal>
              <div className="flex flex-col gap-3">
                <span className="eyebrow">The brief</span>
                <p className="font-serif text-2xl leading-relaxed text-ink sm:text-[1.75rem]">
                  {item.brief}
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="flex flex-col gap-3 border-l-2 border-gold/40 pl-6">
                <span className="eyebrow">The result</span>
                <p className="text-lg leading-relaxed text-ink-soft">{item.result}</p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------- Gallery ---------- */}
      <Section tone="paper">
        <Container>
          <div className="mb-10 flex flex-col gap-3 text-center">
            <span className="eyebrow mx-auto">The gallery</span>
            <h2 className="text-3xl sm:text-4xl">Moments from the day</h2>
            <p className="mx-auto max-w-xl text-ink-soft">
              Tap any image to view it full-size and browse the set.
            </p>
          </div>
          <Reveal>
            <Lightbox images={item.gallery} title={item.title} />
          </Reveal>
        </Container>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section tone="gold">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
              Imagining something like this?
            </h2>
            <p className="max-w-xl text-lg text-ink-soft">
              Every celebration we run starts with a conversation. Let&apos;s have yours.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" size="lg">
                Book a Consultation <ArrowRight className="size-4" />
              </Button>
              <Button href="/portfolio" size="lg" variant="secondary">
                Back to portfolio
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

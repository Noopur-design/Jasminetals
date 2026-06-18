import type { Metadata } from "next";
import { ArrowRight, Star, Quote } from "lucide-react";
import { Container, Section } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/site/page-hero";
import { testimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Kind words from the couples, families and brands who have trusted Jasminetals with the moments that matter most.",
};

export default function TestimonialsPage() {
  const total = testimonials.length;
  const average =
    testimonials.reduce((sum, t) => sum + t.rating, 0) / Math.max(total, 1);
  const rounded = Math.round(average);

  return (
    <>
      <PageHero
        eyebrow="Kind words"
        title="Trusted with the moments that matter"
        lead="We measure our work in the relief on a host's face and the joy on the dance floor. Here's what our clients say once it's all over."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Testimonials" }]}
      />

      {/* ---------- Rating summary ---------- */}
      <div className="border-b border-line bg-paper">
        <Container>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex items-center gap-1.5 text-gold" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={i < rounded ? "size-6 fill-current" : "size-6 text-gold/30"}
                />
              ))}
            </div>
            <p className="font-serif text-3xl text-ink">
              {average.toFixed(1)} out of 5
            </p>
            <p className="text-sm text-ink-soft">
              Averaged across {total} reviews from real Jasminetals clients · 98% of our work
              comes by referral
            </p>
          </div>
        </Container>
      </div>

      {/* ---------- Quote grid ---------- */}
      <Section tone="ivory">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal key={t.author} delay={(i % 2) * 80}>
                <figure className="flex h-full flex-col gap-5 rounded-lg border border-line bg-paper p-8">
                  <div className="flex items-center gap-1 text-gold" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="size-4 fill-current" aria-hidden />
                    ))}
                  </div>
                  <Quote className="size-7 text-gold/30" aria-hidden />
                  <blockquote className="font-serif text-xl leading-relaxed text-ink">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-auto">
                    <p className="font-medium text-ink">{t.author}</p>
                    <p className="text-sm text-ink-soft">{t.detail}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section tone="gold">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
              Become our next happy story
            </h2>
            <p className="max-w-xl text-lg text-ink-soft">
              We&apos;d be honoured to plan your celebration. Let&apos;s start with a
              conversation.
            </p>
            <Button href="/contact" size="lg">
              Book a Consultation <ArrowRight className="size-4" />
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

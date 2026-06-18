import Link from "next/link";
import { ArrowRight, Star, Quote } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { ClientFilms } from "@/components/site/client-films";
import {
  eventTypes,
  portfolio,
  processSteps,
  stats,
  testimonials,
  valueProps,
  venuePartners,
} from "@/lib/data";

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[92vh] items-center">
        <Photo
          seed="udaipur-lake-wedding"
          aspect="fill"
          rounded="rounded-none"
          priority
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/55" />
        <Container className="relative">
          <div className="max-w-2xl py-32 text-white">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide backdrop-blur-sm">
                <Star className="size-3.5 fill-current text-gold" /> Full-service event
                planning · Delhi NCR
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-balance font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
                Celebrations, crafted with care.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
                From intimate gatherings to grand weddings, we design and run
                unforgettable events — so you can simply be present for every moment.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="/contact" size="lg">
                  Book a Consultation <ArrowRight className="size-4" />
                </Button>
                <Button href="/portfolio" size="lg" variant="secondary">
                  View Our Work
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ---------- Stats strip ---------- */}
      <div className="border-b border-line bg-paper">
        <Container>
          <dl className="grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="font-serif text-3xl text-gold-dark sm:text-4xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-ink-soft">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      {/* ---------- Services preview ---------- */}
      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="What we do"
            title="Every kind of celebration"
            lead="Full-service planning, design and coordination — tailored to the occasion and the people at its heart."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eventTypes.map((type, i) => (
              <Reveal key={type.slug} delay={i * 60}>
                <Link href="/services" className="group block">
                  <Card hover className="h-full overflow-hidden">
                    <Photo seed={type.seed} aspect="3/2" rounded="rounded-none" />
                    <div className="flex flex-col gap-2 p-6">
                      <div className="flex items-center gap-2.5">
                        <type.icon className="size-5 text-gold" />
                        <h3 className="text-xl">{type.name}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-soft">
                        {type.tagline}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-gold-dark">
                        Explore
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- Featured portfolio strip ---------- */}
      <Section tone="paper">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Selected work"
              title="A few recent celebrations"
              lead="A glimpse of the events we've had the privilege to design and run."
            />
            <Button href="/portfolio" variant="outline" className="shrink-0">
              Full portfolio <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.slice(0, 6).map((item, i) => (
              <Reveal key={item.slug} delay={(i % 3) * 60}>
                <Link href={`/portfolio/${item.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg">
                    <Photo
                      seed={item.cover}
                      aspect="4/3"
                      className="transition-transform duration-700 ease-[var(--ease-elegant)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <Badge variant="gold" className="mb-2">
                        {item.type}
                      </Badge>
                      <h3 className="text-xl text-white">{item.title}</h3>
                      <p className="text-sm text-white/80">
                        {item.location} · {item.year}
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- Why us ---------- */}
      <Section tone="gold">
        <Container>
          <SectionHeading
            eyebrow="Why Jasminetals"
            title="The calm behind the celebration"
            lead="Beautiful design is the easy part. What sets us apart is everything that happens behind the scenes."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div className="flex h-full flex-col gap-3 rounded-lg border border-line bg-paper p-6">
                  <div className="flex size-11 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                    <v.icon className="size-5" />
                  </div>
                  <h3 className="text-lg">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- Process teaser ---------- */}
      <Section tone="paper">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="From first hello to last dance"
            lead="A clear, collaborative process that keeps you informed and at ease the entire way."
          />
          <ol className="mt-14 grid gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {processSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 60} as="li">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full border border-gold/30 bg-gold-soft font-serif text-sm text-gold-deep">
                      {i + 1}
                    </span>
                    <step.icon className="size-5 text-gold" />
                  </div>
                  <h3 className="text-lg">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
          <div className="mt-12 flex justify-center">
            <Button href="/process" variant="outline">
              See the full process <ArrowRight className="size-4" />
            </Button>
          </div>
        </Container>
      </Section>

      {/* ---------- Testimonials ---------- */}
      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="Kind words"
            title="Trusted with the moments that matter"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {testimonials.slice(0, 2).map((t, i) => (
              <Reveal key={t.author} delay={i * 80}>
                <figure className="flex h-full flex-col gap-5 rounded-lg border border-line bg-paper p-8">
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="size-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="size-7 text-gold/30" />
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
          <div className="mt-10 flex justify-center">
            <Button href="/testimonials" variant="link">
              Read more reviews <ArrowRight className="size-4" />
            </Button>
          </div>
        </Container>
      </Section>

      {/* ---------- Client films ---------- */}
      <Section tone="ink">
        <Container>
          <SectionHeading
            invert
            eyebrow="Client films"
            title="Moments, in motion"
            lead="A few highlight films from celebrations we've had the joy of bringing to life."
          />
          <div className="mt-14">
            <ClientFilms limit={4} />
          </div>
        </Container>
      </Section>

      {/* ---------- Venue partners ---------- */}
      <div className="border-y border-line bg-paper py-12">
        <Container>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Trusted by India&apos;s finest venues
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {venuePartners.map((v) => (
              <span key={v} className="font-serif text-lg text-ink-soft">
                {v}
              </span>
            ))}
          </div>
        </Container>
      </div>

      {/* ---------- Final CTA ---------- */}
      <section className="relative overflow-hidden">
        <Photo
          seed="destination-couple-sunset"
          aspect="fill"
          rounded="rounded-none"
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-black/55" />
        <Container className="relative">
          <div className="flex flex-col items-center gap-6 py-28 text-center text-white">
            <h2 className="max-w-2xl text-4xl leading-tight text-white sm:text-5xl">
              Let&apos;s plan something unforgettable
            </h2>
            <p className="max-w-xl text-lg text-white/85">
              Tell us about your celebration. We&apos;ll bring the vision, the team and
              the calm.
            </p>
            <Button href="/contact" size="lg">
              Book a Consultation <ArrowRight className="size-4" />
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

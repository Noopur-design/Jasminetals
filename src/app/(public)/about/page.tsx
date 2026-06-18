import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/site/page-hero";
import { team, stats, valueProps } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Jasminetals is a design-led event planning studio based in Delhi NCR, founded by Jasmine Nair. Meet the team behind the calm.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="A studio built on care, craft and calm"
        lead="Jasminetals began with a simple belief — that the people at the heart of a celebration should get to enjoy it. Everything we do flows from there."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      {/* ---------- Founder story ---------- */}
      <Section tone="ivory">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Photo seed="team-jasmine" aspect="4/5" label="Jasmine Nair" className="shadow-card" />
            </Reveal>
            <Reveal delay={80}>
              <div className="flex flex-col gap-5">
                <span className="eyebrow">From the founder</span>
                <h2 className="text-3xl leading-[1.1] sm:text-4xl">
                  Fifteen years, five hundred celebrations
                </h2>
                <p className="text-lg leading-relaxed text-ink-soft">
                  I started Jasminetals after years of watching hosts spend their own
                  weddings answering vendor calls. I wanted to build a studio that
                  carried the weight invisibly — so families could simply be present.
                </p>
                <p className="leading-relaxed text-ink-soft">
                  Today we&apos;re a tight team of designers and producers working out of
                  Delhi NCR, planning everything from intimate dinners to multi-day
                  destination weddings. We take on a deliberately small number of events
                  each season, because care doesn&apos;t scale by cutting corners.
                </p>
                <p className="font-serif text-lg text-ink">— Jasmine Nair</p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------- Mission ---------- */}
      <Section tone="paper">
        <Container size="narrow">
          <Reveal>
            <div className="flex flex-col items-center gap-5 text-center">
              <span className="eyebrow">Our mission</span>
              <p className="font-serif text-2xl leading-relaxed text-ink sm:text-3xl">
                To design celebrations that feel unmistakably yours, and to run them so
                seamlessly that the only thing you remember is the joy.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- Values ---------- */}
      <Section tone="gold">
        <Container>
          <SectionHeading
            eyebrow="What we believe"
            title="The values behind every event"
            lead="Four principles that shape how we work, whatever the occasion."
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

      {/* ---------- Team ---------- */}
      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="The people"
            title="The team behind the calm"
            lead="Small by design — every event is touched by the people whose names are on the door."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 60}>
                <figure className="flex flex-col gap-4">
                  <Photo
                    seed={member.seed}
                    aspect="3/4"
                    label={member.name}
                    className="shadow-card"
                  />
                  <figcaption className="flex flex-col gap-1.5">
                    <h3 className="text-lg">{member.name}</h3>
                    <p className="text-sm font-medium text-gold-dark">{member.role}</p>
                    <p className="text-sm leading-relaxed text-ink-soft">{member.bio}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- Stats band ---------- */}
      <Section tone="ink">
        <Container>
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 60}>
                <div className="text-center">
                  <dt className="font-serif text-4xl text-gold sm:text-5xl">{s.value}</dt>
                  <dd className="mt-2 text-sm text-white/70">{s.label}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section tone="paper">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
              We&apos;d love to hear your story
            </h2>
            <p className="max-w-xl text-lg text-ink-soft">
              Tell us about the celebration you&apos;re dreaming up. The first
              conversation is always on us.
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

import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { Container, Section } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/site/page-hero";
import { eventTypes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Full-service planning, design and coordination for weddings, corporate events, social celebrations, destinations and birthdays across Delhi NCR.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Every kind of celebration, beautifully handled"
        lead="From a single perfect evening to a multi-day destination saga, we design, plan and run events of every shape — always with the same care and the same calm."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      {eventTypes.map((type, i) => {
        const flip = i % 2 === 1;
        return (
          <Section key={type.slug} tone={i % 2 === 0 ? "ivory" : "paper"}>
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <Reveal className={flip ? "lg:order-2" : undefined}>
                  <Photo
                    seed={type.seed}
                    aspect="4/3"
                    label={type.name}
                    className="shadow-card"
                  />
                </Reveal>
                <Reveal delay={80} className={flip ? "lg:order-1" : undefined}>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                        <type.icon className="size-5" />
                      </div>
                      <span className="eyebrow">{type.tagline}</span>
                    </div>
                    <h2 className="text-3xl leading-[1.1] sm:text-4xl">{type.name}</h2>
                    <p className="text-lg leading-relaxed text-ink-soft">
                      {type.description}
                    </p>
                    <ul className="mt-2 grid gap-2.5 sm:grid-cols-2">
                      {type.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                          <Check className="mt-0.5 size-4 shrink-0 text-gold-dark" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <Button href="/contact" variant="outline">
                        Plan a {type.name.replace(/s$/, "").toLowerCase()} event
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Reveal>
              </div>
            </Container>
          </Section>
        );
      })}

      {/* ---------- CTA band ---------- */}
      <section className="relative overflow-hidden">
        <Photo
          seed="udaipur-mandap-florals"
          aspect="fill"
          rounded="rounded-none"
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-black/55" />
        <Container className="relative">
          <div className="flex flex-col items-center gap-6 py-24 text-center text-white sm:py-28">
            <h2 className="max-w-2xl text-4xl leading-tight text-white sm:text-5xl">
              Not sure where to begin?
            </h2>
            <p className="max-w-xl text-lg text-white/85">
              Tell us about your occasion and we&apos;ll suggest the right approach — no
              obligation, just an honest conversation.
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

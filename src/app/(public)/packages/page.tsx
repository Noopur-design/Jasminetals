"use client";

import * as React from "react";
import { ArrowRight, Check, Minus, ChevronDown } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/site/page-hero";
import { cn } from "@/lib/utils";
import { packages } from "@/lib/data";

/* Feature comparison matrix — which tiers include each capability. */
const COMPARISON: { feature: string; tiers: [boolean, boolean, boolean] }[] = [
  { feature: "Final-month planning support", tiers: [true, true, true] },
  { feature: "Run-of-show & vendor schedule", tiers: [true, true, true] },
  { feature: "On-day coordination", tiers: [true, true, true] },
  { feature: "Full design & décor concept", tiers: [false, true, true] },
  { feature: "Complete vendor curation", tiers: [false, true, true] },
  { feature: "Budget planning & tracking", tiers: [false, true, true] },
  { feature: "Client portal access", tiers: [false, true, true] },
  { feature: "Multi-day / multi-venue planning", tiers: [false, false, true] },
  { feature: "Destination & travel management", tiers: [false, false, true] },
  { feature: "Guest concierge & hospitality", tiers: [false, false, true] },
  { feature: "Custom builds & installations", tiers: [false, false, true] },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Are these fixed prices?",
    a: "No — they're starting points. Every celebration is different, so we build a tailored quote after understanding your guest count, venues, scope and timeline. The tiers simply show where most clients begin.",
  },
  {
    q: "What does the planning fee include?",
    a: "Our fee covers Jasminetals's design, planning and coordination — the team, the systems and the hours. Vendor costs (venue, catering, décor, etc.) are separate and tracked transparently in your budget.",
  },
  {
    q: "How far in advance should we book?",
    a: "For weddings and large events we recommend six to twelve months. Smaller social celebrations can often come together in eight to ten weeks. We take a limited number of events per season, so earlier is always safer.",
  },
  {
    q: "Do you travel for destination events?",
    a: "Absolutely. Our Bespoke service is built for it — palaces, beaches and hill resorts across India and beyond, with travel, stay and logistics handled end to end.",
  },
  {
    q: "Can we customise a package?",
    a: "Always. The tiers are a starting framework; we mix and match to fit your needs. Tell us what you're imagining and we'll shape a proposal around it.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span className="font-serif text-lg text-ink">{q}</span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-gold-dark transition-transform duration-200 ease-[var(--ease-elegant)]",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-[var(--ease-elegant)]",
          open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="leading-relaxed text-ink-soft">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <>
      <PageHero
        eyebrow="Investment"
        title="Packages shaped around your celebration"
        lead="Soft, inquiry-driven pricing. These are starting points — your final proposal is built around your guests, venues and vision."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Packages" }]}
      />

      {/* ---------- Pricing cards ---------- */}
      <Section tone="ivory">
        <Container>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.name} delay={i * 70}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-lg border bg-paper p-7",
                    pkg.featured
                      ? "border-gold shadow-card ring-1 ring-gold/30 lg:-mt-4 lg:mb-4"
                      : "border-line",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-serif text-2xl text-ink">{pkg.name}</h2>
                    {pkg.featured && <Badge variant="gold">Most loved</Badge>}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-serif text-4xl text-gold-dark">{pkg.price}</span>
                    <span className="text-sm text-ink-muted">{pkg.cadence}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {pkg.description}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                        <Check className="mt-0.5 size-4 shrink-0 text-gold-dark" aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-2">
                    <Button
                      href="/contact"
                      className="w-full"
                      variant={pkg.featured ? "primary" : "secondary"}
                    >
                      {pkg.cta} <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- Comparison matrix ---------- */}
      <Section tone="paper">
        <Container>
          <SectionHeading
            eyebrow="Compare"
            title="What’s included, side by side"
            lead="A clear look at how each tier builds on the one before it."
          />
          <Reveal>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line-strong">
                    <th className="py-4 pr-4 text-sm font-medium text-ink-soft">
                      Feature
                    </th>
                    {packages.map((p) => (
                      <th
                        key={p.name}
                        className={cn(
                          "px-4 py-4 text-center font-serif text-lg",
                          p.featured ? "text-gold-dark" : "text-ink",
                        )}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="border-b border-line">
                      <td className="py-3.5 pr-4 text-sm text-ink">{row.feature}</td>
                      {row.tiers.map((on, ti) => (
                        <td key={ti} className="px-4 py-3.5 text-center">
                          {on ? (
                            <Check
                              className="mx-auto size-5 text-gold-dark"
                              aria-label="Included"
                            />
                          ) : (
                            <Minus
                              className="mx-auto size-5 text-ink-muted/50"
                              aria-label="Not included"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section tone="ivory">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Questions"
            title="Pricing, answered"
            lead="The things clients most often ask before reaching out."
          />
          <div className="mt-12">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section tone="gold">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
              Let&apos;s build your proposal
            </h2>
            <p className="max-w-xl text-lg text-ink-soft">
              Share a few details and we&apos;ll put together a tailored quote for your
              celebration — no obligation.
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

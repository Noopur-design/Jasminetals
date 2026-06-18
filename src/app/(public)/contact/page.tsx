import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Container, Section } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/site/page-hero";
import { ConsultationForm } from "@/components/site/consultation-form";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Tell us about your celebration and book a consultation with Jasminetals. Based in Delhi NCR, planning events across India and beyond.",
};

const INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@jasminetals.com",
    href: "mailto:hello@jasminetals.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98100 12345",
    href: "tel:+919810012345",
  },
  {
    icon: MapPin,
    label: "Studio",
    value: "DLF Cyber Hub, Gurugram, Delhi NCR 122002",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Sat · 10:00 – 19:00 IST",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Let’s talk"
        title="Book a consultation"
        lead="Tell us about your celebration. We'll reach out within one business day to set up a conversation — no obligation, no pressure."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <Section tone="ivory">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {/* Form */}
            <Reveal>
              <ConsultationForm />
            </Reveal>

            {/* Info block */}
            <Reveal delay={80}>
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-2xl">Prefer to reach us directly?</h2>
                  <p className="mt-3 leading-relaxed text-ink-soft">
                    We&apos;re a small team and we answer every enquiry personally. Use
                    whichever way suits you best.
                  </p>
                </div>

                <ul className="flex flex-col gap-5">
                  {INFO.map((item) => (
                    <li key={item.label} className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                        <item.icon className="size-5" aria-hidden />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-muted">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="font-medium text-ink transition-colors hover:text-gold-dark"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-medium text-ink">{item.value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg border border-line bg-gold-tint p-6">
                  <p className="font-serif text-lg text-ink">Our response time</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Every enquiry receives a personal reply within one business day. For
                    events within the next eight weeks, do call us — we&apos;ll fast-track
                    your consultation.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/layout";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of the Jasminetals website and our event planning services.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        lead="The terms that govern your use of our website and our event planning services."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
      />

      <Section tone="ivory">
        <Container size="narrow">
          <article className="flex flex-col gap-8 text-ink-soft">
            <p className="text-sm text-ink-muted">Last updated: 15 June 2026</p>

            <p className="leading-relaxed">
              These terms govern your use of the Jasminetals website and any services
              you engage us to provide. By using our site or working with us, you agree to
              these terms. This is placeholder content for a design demonstration and is
              not legal advice.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Our services</h2>
              <p className="leading-relaxed">
                Jasminetals provides event design, planning and coordination services.
                The specific scope, deliverables and fees for your event are set out in a
                separate written agreement before work begins.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Enquiries &amp; proposals</h2>
              <p className="leading-relaxed">
                Submitting an enquiry through our website does not create a binding
                contract. Pricing shown on the site is indicative; a confirmed proposal is
                issued only after we understand your requirements.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Bookings &amp; payments</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed marker:text-gold">
                <li>A signed agreement and retainer confirm your booking.</li>
                <li>Payment schedules and milestones are defined in your agreement.</li>
                <li>Third-party vendor costs are billed transparently and separately.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Cancellations &amp; changes</h2>
              <p className="leading-relaxed">
                Cancellation and rescheduling terms, including any non-refundable amounts,
                are specified in your agreement. We will always work with you in good faith
                to accommodate reasonable changes.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Intellectual property</h2>
              <p className="leading-relaxed">
                All website content, designs and concepts remain the property of Jasminetals
                Events unless otherwise agreed. You may not reproduce our materials without
                permission.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Limitation of liability</h2>
              <p className="leading-relaxed">
                To the extent permitted by law, our liability for any claim relating to our
                services is limited to the fees paid to us for those services. We are not
                liable for the acts or omissions of third-party vendors.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Contact us</h2>
              <p className="leading-relaxed">
                Questions about these terms? Email us at{" "}
                <a
                  href="mailto:hello@jasminetals.com"
                  className="font-medium text-gold-dark underline-offset-4 hover:underline"
                >
                  hello@jasminetals.com
                </a>
                .
              </p>
            </section>
          </article>
        </Container>
      </Section>
    </>
  );
}

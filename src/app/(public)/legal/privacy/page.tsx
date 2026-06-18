import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/layout";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Jasminetals collects, uses and protects the personal information you share with us.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lead="How we collect, use and protect the information you share with us."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <Section tone="ivory">
        <Container size="narrow">
          <article className="flex flex-col gap-8 text-ink-soft">
            <p className="text-sm text-ink-muted">Last updated: 15 June 2026</p>

            <p className="leading-relaxed">
              Jasminetals (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy.
              This policy explains what personal information we collect when you use our
              website or engage our services, and how we handle it. This is placeholder
              content for a design demonstration and is not legal advice.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Information we collect</h2>
              <p className="leading-relaxed">
                When you submit an enquiry or book a consultation, we collect the details
                you provide — such as your name, email, phone number, event type, date,
                guest count and budget range. We may also collect basic technical data
                (like your browser type and pages visited) to improve our website.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">How we use your information</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed marker:text-gold">
                <li>To respond to your enquiry and arrange a consultation.</li>
                <li>To plan, design and coordinate your event if you engage us.</li>
                <li>To communicate updates, proposals and important details.</li>
                <li>To improve our services and website experience.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Sharing your information</h2>
              <p className="leading-relaxed">
                We share your details with trusted vendors and partners only as needed to
                deliver your event, and only with your knowledge. We never sell your
                personal information to third parties.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Data retention &amp; security</h2>
              <p className="leading-relaxed">
                We keep your information only as long as necessary to provide our services
                and meet legal obligations. We apply reasonable safeguards to protect it
                against unauthorised access, loss or misuse.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Your rights</h2>
              <p className="leading-relaxed">
                You may request access to, correction of, or deletion of your personal
                information at any time by writing to us. We will respond within a
                reasonable period.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl text-ink">Contact us</h2>
              <p className="leading-relaxed">
                Questions about this policy? Email us at{" "}
                <a
                  href="mailto:hello@jasminetals.com"
                  className="font-medium text-gold-dark underline-offset-4 hover:underline"
                >
                  hello@jasminetals.com
                </a>{" "}
                or write to our studio at DLF Cyber Hub, Gurugram, Delhi NCR 122002.
              </p>
            </section>
          </article>
        </Container>
      </Section>
    </>
  );
}

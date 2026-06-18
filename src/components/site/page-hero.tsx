import { Container } from "@/components/ui/layout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

/** Standard inner-page header band; offsets the fixed site header. */
export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="bg-gold-tint pt-30 pb-16 sm:pt-34 sm:pb-20">
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          {breadcrumbs && (
            <div className="mb-1">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="max-w-3xl text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>
          {lead && (
            <p className="max-w-2xl text-lg leading-relaxed text-ink-soft">{lead}</p>
          )}
        </div>
      </Container>
    </section>
  );
}

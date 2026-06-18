import { Container, Section } from "@/components/ui/layout";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { PageHero } from "@/components/site/page-hero";

export default function PortfolioLoading() {
  return (
    <>
      <PageHero
        eyebrow="Selected work"
        title="Celebrations we’ve had the privilege to run"
        lead="A glimpse of the weddings, launches and milestones we’ve designed across India. Filter by occasion to explore."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Portfolio" }]}
      />
      <Section tone="ivory">
        <Container>
          <div className="flex justify-center">
            <Skeleton className="h-11 w-80 rounded-lg" />
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

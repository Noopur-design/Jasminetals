import { Container, Section } from "@/components/ui/layout";
import { PageHeroSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Mirrors the three pricing cards, comparison matrix and FAQ list. */
export default function PackagesLoading() {
  return (
    <>
      <PageHeroSkeleton />

      {/* Pricing cards */}
      <Section tone="ivory">
        <Container>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`flex h-full flex-col rounded-lg border border-line bg-paper p-7 ${
                  i === 1 ? "lg:-mt-4 lg:mb-4" : ""
                }`}
              >
                <Skeleton className="h-7 w-2/5 rounded-lg" />
                <Skeleton className="mt-4 h-10 w-1/2 rounded-lg" />
                <Skeleton className="mt-3 h-3.5 w-full" />
                <Skeleton className="mt-1.5 h-3.5 w-4/5" />
                <div className="mt-6 flex flex-col gap-3">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="mt-8 h-11 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Comparison matrix */}
      <Section tone="paper">
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <Skeleton className="h-3.5 w-24 rounded-full" />
            <Skeleton className="h-9 w-96 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="mt-12 flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-line pb-3">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="size-5 rounded-full" />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section tone="ivory">
        <Container size="narrow">
          <div className="flex flex-col items-center gap-4 text-center">
            <Skeleton className="h-3.5 w-24 rounded-full" />
            <Skeleton className="h-9 w-72 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="mt-12 flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 border-b border-line py-5"
              >
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="size-5 rounded-full" />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

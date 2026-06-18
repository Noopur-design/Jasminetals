import { Container, Section } from "@/components/ui/layout";
import { PageHeroSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Mirrors the rating summary band and the two-column quote grid. */
export default function TestimonialsLoading() {
  return (
    <>
      <PageHeroSkeleton />

      {/* Rating summary */}
      <div className="border-b border-line bg-paper">
        <Container>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="size-6 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-8 w-44 rounded-lg" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
        </Container>
      </div>

      {/* Quote grid */}
      <Section tone="ivory">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-full flex-col gap-5 rounded-lg border border-line bg-paper p-8"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="size-4 rounded-full" />
                  ))}
                </div>
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-3/4" />
                <div className="mt-auto flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3.5 w-40" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

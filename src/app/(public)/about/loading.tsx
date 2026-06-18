import { Container, Section } from "@/components/ui/layout";
import { PageHeroSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Mirrors the founder story, values grid and team grid on the About page. */
export default function AboutLoading() {
  return (
    <>
      <PageHeroSkeleton />

      {/* Founder story */}
      <Section tone="ivory">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Skeleton className="aspect-[4/5] w-full rounded-lg" />
            <div className="flex flex-col gap-5">
              <Skeleton className="h-3.5 w-32 rounded-full" />
              <Skeleton className="h-9 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Values grid */}
      <Section tone="gold">
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <Skeleton className="h-3.5 w-32 rounded-full" />
            <Skeleton className="h-9 w-80 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-full flex-col gap-3 rounded-lg border border-line bg-paper p-6"
              >
                <Skeleton className="size-11 rounded-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Team grid */}
      <Section tone="ivory">
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <Skeleton className="h-3.5 w-28 rounded-full" />
            <Skeleton className="h-9 w-72 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

import { Container, Section } from "@/components/ui/layout";
import { PageHeroSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Mirrors the numbered vertical timeline and the "what to expect" cards. */
export default function ProcessLoading() {
  return (
    <>
      <PageHeroSkeleton />

      {/* Vertical timeline */}
      <Section tone="ivory">
        <Container size="narrow">
          <ol className="relative">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="relative pb-12 pl-20 last:pb-0">
                <span className="absolute left-0 top-0 size-14 rounded-full skeleton" aria-hidden />
                <div className="flex flex-col gap-2.5 pt-1.5">
                  <Skeleton className="h-7 w-1/2 rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* What to expect */}
      <Section tone="paper">
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <Skeleton className="h-3.5 w-32 rounded-full" />
            <Skeleton className="h-9 w-96 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex h-full flex-col gap-3 rounded-lg border border-line bg-ivory p-7"
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
    </>
  );
}

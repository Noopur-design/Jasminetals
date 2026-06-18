import { Container, Section } from "@/components/ui/layout";
import { PageHeroSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Mirrors the alternating image/copy feature rows on the Services page. */
export default function ServicesLoading() {
  return (
    <>
      <PageHeroSkeleton />

      {Array.from({ length: 3 }).map((_, i) => (
        <Section key={i} tone={i % 2 === 0 ? "ivory" : "paper"}>
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Skeleton
                className={`aspect-[4/3] w-full rounded-lg ${i % 2 === 1 ? "lg:order-2" : ""}`}
              />
              <div
                className={`flex flex-col gap-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-11 rounded-full" />
                  <Skeleton className="h-3.5 w-28 rounded-full" />
                </div>
                <Skeleton className="h-9 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="mt-3 h-11 w-52 rounded-lg" />
              </div>
            </div>
          </Container>
        </Section>
      ))}
    </>
  );
}

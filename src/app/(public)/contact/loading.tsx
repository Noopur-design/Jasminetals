import { Container, Section } from "@/components/ui/layout";
import { PageHeroSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Mirrors the consultation form on the left and the contact info column on the right. */
export default function ContactLoading() {
  return (
    <>
      <PageHeroSkeleton />

      <Section tone="ivory">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {/* Form */}
            <div className="flex flex-col gap-6 rounded-lg border border-line bg-paper p-7 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
              <Skeleton className="h-11 w-48 rounded-lg" />
            </div>

            {/* Info column */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-7 w-2/3 rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex flex-col gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="size-11 shrink-0 rounded-full" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-line bg-gold-tint p-6">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="mt-3 h-3.5 w-full" />
                <Skeleton className="mt-1.5 h-3.5 w-5/6" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

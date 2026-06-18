import { Container, Section } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors a portfolio case study: full-bleed cover hero, meta strip,
 * brief/result copy and the editorial gallery wall.
 */
export default function PortfolioDetailLoading() {
  return (
    <>
      {/* Cover hero — full-bleed tinted band with caption block, matching
          the real dark image hero's height and bottom-aligned content */}
      <section
        className="relative flex min-h-[70vh] items-end bg-gold-tint pt-30"
        role="status"
        aria-label="Loading"
      >
        <Container className="relative">
          <div className="max-w-3xl pb-14">
            <Skeleton className="mb-4 h-3.5 w-48 rounded-full" />
            <Skeleton className="mb-4 h-6 w-24 rounded-full" />
            <Skeleton className="h-12 w-full max-w-xl rounded-lg sm:h-16" />
            <Skeleton className="mt-4 h-5 w-40 rounded-lg" />
          </div>
        </Container>
        <span className="sr-only">Loading event…</span>
      </section>

      {/* Meta strip */}
      <div className="border-b border-line bg-paper">
        <Container>
          <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Brief & result */}
      <Section tone="ivory">
        <Container size="narrow">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-3.5 w-24 rounded-full" />
              <Skeleton className="h-7 w-full rounded-lg" />
              <Skeleton className="h-7 w-4/5 rounded-lg" />
            </div>
            <div className="flex flex-col gap-3 border-l-2 border-gold/40 pl-6">
              <Skeleton className="h-3.5 w-24 rounded-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Gallery */}
      <Section tone="paper">
        <Container>
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <Skeleton className="h-3.5 w-24 rounded-full" />
            <Skeleton className="h-9 w-72 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          {/* Editorial gallery grid — lead tile spans two columns */}
          <div className="grid grid-cols-1 gap-3 sm:auto-rows-[11rem] sm:grid-cols-3 sm:gap-4">
            <Skeleton className="aspect-[3/2] w-full rounded-lg sm:col-span-2 sm:row-span-2 sm:aspect-auto" />
            <Skeleton className="aspect-square w-full rounded-lg sm:aspect-auto" />
            <Skeleton className="aspect-[3/4] w-full rounded-lg sm:row-span-2 sm:aspect-auto" />
            <Skeleton className="aspect-square w-full rounded-lg sm:aspect-auto" />
            <Skeleton className="aspect-[3/2] w-full rounded-lg sm:col-span-2 sm:aspect-auto" />
            <Skeleton className="aspect-[3/4] w-full rounded-lg sm:row-span-2 sm:aspect-auto" />
          </div>
        </Container>
      </Section>
    </>
  );
}

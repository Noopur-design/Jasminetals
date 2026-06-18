import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/layout";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

/**
 * Mirrors the real `<PageHero>` band (ivory/gold tint, fixed-header
 * clearance) so every route's `loading.tsx` opens with a header that
 * matches the page it stands in for. `role="status"` announces the
 * loading state to assistive tech.
 */
export function PageHeroSkeleton() {
  return (
    <section
      className="bg-gold-tint pt-30 pb-16 sm:pt-34 sm:pb-20"
      role="status"
      aria-label="Loading"
    >
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <Skeleton className="h-3.5 w-32 rounded-full" />
          <Skeleton className="h-10 w-full max-w-2xl rounded-lg sm:h-12" />
          <Skeleton className="h-10 w-3/4 max-w-xl rounded-lg sm:h-12" />
          <Skeleton className="mt-2 h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-2/3 max-w-md" />
        </div>
      </Container>
      <span className="sr-only">Loading page…</span>
    </section>
  );
}

/** A skeleton shaped like a portfolio/image card. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-paper">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2.5 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

/** A skeleton shaped like a data-table row group. */
export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex gap-4 border-b border-line bg-ivory px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-line px-4 py-4 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

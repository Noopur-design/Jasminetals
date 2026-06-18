"use client";

import * as React from "react";
import { RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { PageHeroSkeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // In a real app this would report to an error service.
    console.error(error);
  }, [error]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-ivory">
      {/* Dimmed skeleton of a page layout — so a failed render still reads
          as an intentional, half-loaded state rather than a blank screen. */}
      <div
        className="pointer-events-none absolute inset-0 select-none opacity-40 blur-[1px]"
        aria-hidden
      >
        <PageHeroSkeleton />
        <Section tone="ivory">
          <Container>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </Container>
        </Section>
      </div>

      {/* Soft ivory veil to keep the message comfortably legible over the
          skeleton (preserves AA contrast). */}
      <div
        className="pointer-events-none absolute inset-0 bg-ivory/70"
        aria-hidden
      />

      {/* Foreground message + actions */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="flex max-w-lg flex-col items-center gap-6 rounded-2xl border border-line bg-paper/90 px-8 py-12 text-center shadow-card backdrop-blur-sm sm:px-12">
          <span className="eyebrow">Something went wrong</span>
          <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
            A little hiccup behind the scenes
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-ink-soft">
            Don&apos;t worry — nothing you did caused this. The page couldn&apos;t
            finish loading. Try again, and if it keeps happening, reach out and
            we&apos;ll sort it out personally.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => reset()}>
              <RotateCcw className="size-4" /> Try again
            </Button>
            <Button href="/" size="lg" variant="secondary">
              <Home className="size-4" /> Back home
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

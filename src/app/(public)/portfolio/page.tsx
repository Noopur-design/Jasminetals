"use client";

import * as React from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Container, Section } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/site/page-hero";
import { cn } from "@/lib/utils";
import { portfolio, eventTypes } from "@/lib/data";

const FILTERS = [
  { value: "all", label: "All", count: portfolio.length },
  ...eventTypes.map((t) => ({
    value: t.slug,
    label: t.name,
    count: portfolio.filter((p) => p.typeSlug === t.slug).length,
  })),
];

/* ------------------------------------------------------------------
   Editorial masonry rhythm. Each tile gets a deliberate shape so the
   wall reads like a magazine spread rather than a uniform grid:
   - a recurring wide "hero" tile that spans two columns
   - alternating portrait / landscape proportions
   The pattern is keyed off the tile's position so it stays stable as
   filters change, and gracefully collapses to a single column on
   mobile (no spans apply below `lg`).
------------------------------------------------------------------ */
type Shape = {
  /** lg column span */
  span: string;
  /** lg row span (taller tiles fill more of the masonry track) */
  row: string;
  /** Photo aspect ratio */
  aspect: string;
};

const SHAPES: Shape[] = [
  { span: "lg:col-span-2", row: "lg:row-span-2", aspect: "3/2" }, // wide hero
  { span: "", row: "lg:row-span-2", aspect: "3/4" }, // tall portrait
  { span: "", row: "lg:row-span-2", aspect: "4/5" }, // portrait
  { span: "", row: "lg:row-span-1", aspect: "4/3" }, // landscape
  { span: "", row: "lg:row-span-2", aspect: "3/4" }, // tall portrait
  { span: "lg:col-span-2", row: "lg:row-span-1", aspect: "3/2" }, // wide landscape
];

function shapeFor(index: number): Shape {
  return SHAPES[index % SHAPES.length];
}

export default function PortfolioPage() {
  const [filter, setFilter] = React.useState("all");
  const items =
    filter === "all"
      ? portfolio
      : portfolio.filter((p) => p.typeSlug === filter);

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
            <Tabs
              tabs={FILTERS}
              value={filter}
              onValueChange={setFilter}
              className="flex-wrap justify-center"
            />
          </div>

          {items.length === 0 ? (
            <div className="mt-14">
              <EmptyState
                icon={ImageOff}
                title="Nothing here yet"
                description="We don't have published work in this category just yet — but we'd love to make some with you."
              />
            </div>
          ) : (
            <div
              className={cn(
                "mt-12 grid gap-4 sm:gap-5",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                // dense masonry packing on large screens; auto rows keep the
                // varied row-spans tight against one another
                "lg:auto-rows-[12rem] lg:grid-flow-dense",
              )}
            >
              {items.map((item, i) => {
                const shape = shapeFor(i);
                return (
                  <Reveal
                    key={item.slug}
                    delay={(i % 3) * 70}
                    className={cn(shape.span, shape.row, "min-h-0")}
                  >
                    <Link
                      href={`/portfolio/${item.slug}`}
                      className="group relative block h-full overflow-hidden rounded-xl shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <Photo
                        seed={item.cover}
                        aspect={shape.aspect}
                        label={item.title}
                        className={cn(
                          // fill the masonry cell on lg; keep intrinsic
                          // aspect on the stacked mobile/tablet layout
                          "h-full w-full transition-transform duration-[900ms] ease-[var(--ease-elegant)] group-hover:scale-[1.06] lg:absolute lg:inset-0",
                        )}
                        rounded="rounded-xl"
                      />

                      {/* Dark editorial gradient — deepens on hover */}
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-85 transition-opacity duration-500 ease-[var(--ease-elegant)] group-hover:opacity-100"
                        aria-hidden
                      />

                      {/* Caption — rises gently on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                        <Badge
                          variant="gold"
                          className="mb-2.5 translate-y-1 opacity-90 transition-all duration-500 ease-[var(--ease-elegant)] group-hover:translate-y-0 group-hover:opacity-100"
                        >
                          {item.type}
                        </Badge>
                        <h3 className="font-serif text-xl leading-snug text-white drop-shadow-sm sm:text-2xl">
                          {item.title}
                        </h3>
                        <p className="mt-1 max-h-0 overflow-hidden text-sm text-white/80 opacity-0 transition-all duration-500 ease-[var(--ease-elegant)] group-hover:max-h-12 group-hover:opacity-100">
                          {item.location} · {item.year} · {item.guests}
                        </p>
                      </div>

                      {/* Thin gold hairline that draws in on hover */}
                      <span
                        className="pointer-events-none absolute inset-x-5 bottom-4 h-px origin-left scale-x-0 bg-gold/70 transition-transform duration-500 ease-[var(--ease-elegant)] group-hover:scale-x-100 sm:inset-x-6"
                        aria-hidden
                      />
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

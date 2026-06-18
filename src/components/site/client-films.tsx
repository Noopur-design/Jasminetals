"use client";

import * as React from "react";
import { Play, X, Quote } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { imageUrl } from "@/lib/images";
import { clientFilms, type ClientFilm } from "@/lib/videos";
import { cn } from "@/lib/utils";

/** A grid of client highlight films that open in a lightweight modal player. */
export function ClientFilms({ limit }: { limit?: number }) {
  const films = limit ? clientFilms.slice(0, limit) : clientFilms;
  const [active, setActive] = React.useState<ClientFilm | null>(null);

  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        {films.map((film, i) => (
          <Reveal key={film.id} delay={(i % 2) * 80}>
            <button
              onClick={() => setActive(film)}
              className="group relative block w-full overflow-hidden rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label={`Play film: ${film.title}`}
            >
              <Photo
                seed={film.posterSeed}
                aspect="16/9"
                className="transition-transform duration-700 ease-[var(--ease-elegant)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
              {/* Play button */}
              <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/40 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:ring-gold">
                <Play className="size-6 translate-x-0.5 fill-current" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="font-serif text-xl">{film.title}</p>
                <p className="text-sm text-white/80">{film.detail}</p>
              </div>
              <span className="absolute right-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">
                Film
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} film`}
        >
          <button
            onClick={() => setActive(null)}
            aria-label="Close film"
            className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/30 transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          <div
            className="w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={active.id}
              src={active.src}
              poster={imageUrl(active.posterSeed, 1280) ?? undefined}
              controls
              autoPlay
              playsInline
              preload="none"
              className="aspect-video w-full bg-black"
            />
            <div className="flex flex-col gap-2 bg-paper p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-lg text-ink">{active.title}</p>
                <p className="text-sm text-ink-soft">{active.detail}</p>
              </div>
              <p
                className={cn(
                  "flex max-w-md items-start gap-2 text-sm italic text-ink-soft",
                )}
              >
                <Quote className="mt-0.5 size-4 shrink-0 text-gold/50" />
                {active.quote}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

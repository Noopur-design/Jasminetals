"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { cn } from "@/lib/utils";

/* Editorial masonry rhythm for the thumbnail wall: a large lead tile,
   then an alternating mix of portrait / landscape / square cells so the
   gallery reads like a designed spread instead of a uniform grid. The
   spans only apply from `sm` up; on mobile everything stacks to a clean
   single column. */
type Cell = { span: string; row: string; aspect: string };
const CELLS: Cell[] = [
  { span: "sm:col-span-2", row: "sm:row-span-2", aspect: "3/2" }, // lead
  { span: "", row: "", aspect: "square" },
  { span: "", row: "sm:row-span-2", aspect: "3/4" },
  { span: "", row: "", aspect: "square" },
  { span: "sm:col-span-2", row: "", aspect: "3/2" },
  { span: "", row: "sm:row-span-2", aspect: "3/4" },
  { span: "", row: "", aspect: "square" },
];

/**
 * Click-to-open gallery lightbox.
 * Keyboard: ← / → navigate, Esc closes. Click backdrop to close.
 */
export function Lightbox({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  const close = React.useCallback(() => setOpen(false), []);
  const next = React.useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const prev = React.useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, next, prev]);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:auto-rows-[11rem] sm:grid-flow-dense sm:grid-cols-3 sm:gap-4">
        {images.map((seed, i) => {
          const cell = CELLS[i % CELLS.length];
          return (
            <button
              key={`${seed}-${i}`}
              type="button"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
              className={cn(
                "group relative block overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                cell.span,
                cell.row,
              )}
              aria-label={`View photo ${i + 1} of ${images.length} from ${title}`}
            >
              <Photo
                seed={seed}
                aspect={cell.aspect}
                rounded="rounded-lg"
                className="h-full w-full transition-transform duration-[900ms] ease-[var(--ease-elegant)] group-hover:scale-[1.07] sm:absolute sm:inset-0"
              />
              {/* Soft hover wash + expand affordance */}
              <span
                className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-[var(--ease-elegant)] group-hover:bg-black/25"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute right-3 top-3 flex size-9 scale-90 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 ease-[var(--ease-elegant)] group-hover:scale-100 group-hover:opacity-100"
                aria-hidden
              >
                <Expand className="size-4" />
              </span>
            </button>
          );
        })}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close gallery"
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
          >
            <ChevronLeft className="size-6" />
          </button>

          <figure
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Photo
              seed={images[index]}
              aspect="3/2"
              rounded="rounded-lg"
              className="shadow-card"
            />
            <figcaption className="mt-3 text-center text-sm text-white/70">
              {title} — {index + 1} / {images.length}
            </figcaption>
          </figure>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}
    </>
  );
}

"use client";

import * as React from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/lib/images";

/* Elegant, warm palettes that evoke event photography without real assets. */
const PALETTES = [
  ["#efe6d6", "#cbb189", "#9c7b4e"], // champagne
  ["#f3e7e4", "#d9b3aa", "#a9756a"], // blush
  ["#e6ece4", "#bcc9b3", "#7e9476"], // sage
  ["#ece6ef", "#c5b7cf", "#8b769b"], // mauve
  ["#f1e9dd", "#d7c19a", "#b08d57"], // gold
  ["#e3e8ec", "#b6c2cb", "#7c8d9a"], // dusk blue
  ["#f0e8e2", "#d3bca8", "#9d7c5f"], // warm taupe
  ["#eae4dc", "#c9bba6", "#8a7657"], // linen
];

function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h);
}

const ASPECTS: Record<string, string> = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  portrait: "aspect-[4/5]",
};

/**
 * Deterministic gradient placeholder standing in for event photography.
 * Blur-up reveal on mount, soft grain overlay, optional label.
 */
export function Photo({
  seed,
  aspect = "4/3",
  className,
  label,
  rounded = "rounded-lg",
  priority = false,
  imgWidth = 1280,
}: {
  seed: string;
  aspect?: keyof typeof ASPECTS | string;
  className?: string;
  label?: string;
  rounded?: string;
  priority?: boolean;
  imgWidth?: number;
}) {
  const [ready, setReady] = React.useState(priority);
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Real photograph (served straight from the CDN); gradient stays as the
  // instant blur-up placeholder behind it.
  const realSrc = imageUrl(seed, imgWidth);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  // If the image was already cached/complete before hydration, `onLoad`
  // never fires — detect that on mount so it still reveals.
  React.useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, [realSrc]);

  const h = hash(seed);
  const [a, b, c] = PALETTES[h % PALETTES.length];
  const angle = h % 80;
  const x = 20 + (h % 50);
  const y = 15 + ((h >> 3) % 50);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-line",
        ASPECTS[aspect] ?? "",
        rounded,
        className,
      )}
      role="img"
      aria-label={label ?? "Event photography"}
    >
      <div
        className="absolute inset-0 transition-[opacity,filter] duration-700 ease-[var(--ease-elegant)]"
        style={{
          opacity: ready ? 1 : 0,
          filter: ready ? "blur(0)" : "blur(14px)",
          transform: ready ? "scale(1)" : "scale(1.04)",
          backgroundImage: `radial-gradient(120% 120% at ${x}% ${y}%, ${a} 0%, ${b} 45%, ${c} 100%), linear-gradient(${angle}deg, ${a}, ${c})`,
          backgroundBlendMode: "soft-light",
        }}
      />
      {/* Real photograph, lazily fetched by the browser, fades in on load */}
      {realSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={realSrc}
          alt={label ?? ""}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            // On failure, hide the img and keep the gradient placeholder.
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-[var(--ease-elegant)]",
            imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]",
          )}
        />
      )}
      {/* Soft vignette + grain for a photographic feel */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_55%,rgba(26,22,16,0.18))]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Real image with blur-up reveal. Use when an actual photo URL is available.
 */
export function BlurImage({
  src,
  alt,
  aspect = "4/3",
  className,
  rounded = "rounded-lg",
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  aspect?: keyof typeof ASPECTS | string;
  className?: string;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-line", ASPECTS[aspect] ?? "", rounded, className)}>
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={cn(
          "object-cover transition-[opacity,filter,transform] duration-700 ease-[var(--ease-elegant)]",
          loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-lg scale-[1.04]",
        )}
      />
    </div>
  );
}

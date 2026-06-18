import Link from "next/link";
import { cn } from "@/lib/utils";

/** Jasminetals wordmark with a small gold monogram. */
export function Logo({
  light = false,
  className,
  href = "/",
}: {
  light?: boolean;
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Jasminetals — home"
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full font-serif text-lg leading-none transition-colors",
          light
            ? "bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm"
            : "bg-gold-soft text-gold-deep ring-1 ring-gold/20",
        )}
      >
        J
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-xl tracking-tight transition-colors",
            light ? "text-white" : "text-ink",
          )}
        >
          Jasminetals
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors",
            light ? "text-white/70" : "text-gold-dark",
          )}
        >
          Events
        </span>
      </span>
    </Link>
  );
}

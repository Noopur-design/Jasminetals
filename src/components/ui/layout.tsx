import * as React from "react";
import { cn } from "@/lib/utils";

/** Centered, max-width content container with responsive horizontal padding. */
export function Container({
  className,
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "narrow" | "wide" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full container-px",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-[88rem]",
        className,
      )}
      {...props}
    />
  );
}

/** Vertical section rhythm wrapper. */
export function Section({
  className,
  tone = "ivory",
  ...props
}: React.HTMLAttributes<HTMLElement> & { tone?: "ivory" | "paper" | "gold" | "ink" }) {
  return (
    <section
      className={cn(
        "py-20 sm:py-24 lg:py-28",
        tone === "ivory" && "bg-ivory",
        tone === "paper" && "bg-paper",
        tone === "gold" && "bg-gold-tint",
        tone === "ink" && "bg-ink text-white",
        className,
      )}
      {...props}
    />
  );
}

/** Eyebrow + title + optional lead, centered or left-aligned. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  className,
  invert = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center mx-auto max-w-2xl",
        align === "left" && "items-start text-left max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <span className={cn("eyebrow", invert && "text-gold")}>{eyebrow}</span>
      )}
      <h2
        className={cn(
          "text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1]",
          invert && "text-white",
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "text-lg leading-relaxed",
            invert ? "text-white/70" : "text-ink-soft",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Lightweight controlled-or-uncontrolled tab strip. */
export function Tabs({
  tabs,
  value,
  onValueChange,
  defaultValue,
  className,
  size = "md",
}: {
  tabs: { value: string; label: React.ReactNode; count?: number }[];
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? tabs[0]?.value);
  const active = value ?? internal;
  const select = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-line bg-paper p-1",
        className,
      )}
    >
      {tabs.map((t) => {
        const on = t.value === active;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={on}
            onClick={() => select(t.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors",
              size === "md" ? "px-3.5 py-1.5 text-sm" : "px-3 py-1 text-xs",
              on
                ? "bg-gold-soft text-gold-deep"
                : "text-ink-soft hover:bg-ivory hover:text-ink",
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-semibold",
                  on ? "bg-gold/20 text-gold-deep" : "bg-line text-ink-muted",
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

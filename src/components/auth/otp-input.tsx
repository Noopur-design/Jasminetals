"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible 6-box (configurable) one-time-code input.
 * - Auto-advances focus on entry, steps back on backspace.
 * - Full paste support (paste a code into any box).
 * - Reports the joined value via onChange.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  ariaLabel = "Verification code",
  invalid = false,
  autoFocus = true,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  const digits = React.useMemo(() => {
    const arr = value.split("").slice(0, length);
    while (arr.length < length) arr.push("");
    return arr;
  }, [value, length]);

  const setAt = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").trim());
  };

  const focus = (index: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, index))];
    el?.focus();
    el?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    if (!char) {
      setAt(index, "");
      return;
    }
    setAt(index, char);
    if (index < length - 1) focus(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setAt(index, "");
      } else if (index > 0) {
        e.preventDefault();
        setAt(index - 1, "");
        focus(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focus(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focus(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focus(pasted.length >= length ? length - 1 : pasted.length);
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label={ariaLabel}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-13 w-full min-w-0 rounded-md border border-line-strong bg-paper text-center font-serif text-xl text-ink shadow-[0_1px_2px_rgba(26,22,16,0.03)] transition-colors",
            "focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25",
            "disabled:cursor-not-allowed disabled:opacity-60",
            invalid && "border-danger ring-danger/20",
          )}
        />
      ))}
    </div>
  );
}

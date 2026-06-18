import { cn } from "@/lib/utils";

type Tone = "gold" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  gold: "bg-gold",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

/**
 * Slim, accessible progress bar. `value`/`max` drive a clamped percentage.
 */
export function ProgressBar({
  value,
  max = 100,
  tone = "gold",
  label,
  className,
  size = "md",
}: {
  value: number;
  max?: number;
  tone?: Tone;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-line",
        size === "sm" ? "h-1.5" : "h-2.5",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-[var(--ease-elegant)]",
          TONES[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

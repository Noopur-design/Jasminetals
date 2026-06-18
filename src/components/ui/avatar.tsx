import { cn, initials } from "@/lib/utils";

const SIZES = { sm: "size-7 text-[11px]", md: "size-9 text-xs", lg: "size-12 text-sm" };

/** Initials avatar with a deterministic warm tint. */
export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  const tints = [
    "bg-gold-soft text-gold-deep",
    "bg-success-soft text-success",
    "bg-info-soft text-info",
    "bg-warning-soft text-warning",
    "bg-[#efe7e4] text-[#a9756a]",
  ];
  const tint = tints[Math.abs(h) % tints.length];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-black/5",
        SIZES[size],
        tint,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 ease-[var(--ease-elegant)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-55 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-on-accent shadow-soft hover:bg-gold-dark active:bg-gold-deep",
        secondary:
          "border border-line-strong bg-paper text-ink hover:bg-ivory hover:border-gold/40",
        ghost: "text-ink hover:bg-black/[0.04]",
        outline:
          "border border-gold/60 text-gold-dark hover:bg-gold-soft",
        destructive:
          "bg-danger text-white shadow-soft hover:brightness-95 active:brightness-90",
        link: "text-gold-dark underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.ComponentProps<typeof Link>, keyof ButtonBaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant, size, className, loading, children, ...rest } = props;
  const classes = cn(buttonVariants({ variant, size }), className);
  const content = (
    <>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  const { disabled, ...btnRest } = rest as ButtonAsButton;
  return (
    <button className={classes} disabled={disabled || loading} {...btnRest}>
      {content}
    </button>
  );
}

export { buttonVariants };

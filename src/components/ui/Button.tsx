import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "dark" | "outline" | "outline-light" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-150 " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gold text-ink hover:bg-gold-hover shadow-sm",
  dark: "bg-ink text-paper hover:bg-ink-soft",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
  "outline-light": "border-2 border-paper/80 text-paper hover:bg-paper hover:text-ink",
  ghost: "text-ink hover:bg-surface",
  danger: "bg-danger text-paper hover:bg-danger/90",
};

// Minimum 44px touch target on md/lg (WCAG 2.2 target size guidance).
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClasses(
  { variant = "primary", size = "md" }: { variant?: ButtonVariant; size?: ButtonSize } = {},
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
};

export function Button({
  variant,
  size,
  loading = false,
  loadingText,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="size-4" />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size }, className)} {...props} />;
}

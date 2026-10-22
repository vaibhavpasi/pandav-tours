import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * TEXT PLACEHOLDER for the brand mark. Replace with the official logo file
 * from the visiting-card artwork (e.g. public/brand/logo.svg rendered via
 * next/image) once it is supplied. Do not redraw the logo by hand.
 */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 flex-col leading-none whitespace-nowrap", className)}
      aria-label="Pandav Tours & Travel — home"
    >
      <span className="font-heading text-xl font-extrabold tracking-wide text-gold sm:text-2xl">
        <span className={tone === "dark" ? "rounded bg-ink px-1.5" : undefined}>PANDAV</span>
      </span>
      <span
        className={cn(
          "mt-1 text-[0.625rem] font-semibold tracking-[0.25em] uppercase sm:text-[0.6875rem]",
          tone === "dark" ? "text-ink" : "text-paper",
        )}
      >
        Tours &amp; Travel
      </span>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/pandav-logo.png";
import { cn } from "@/lib/utils";

/**
 * Brand logo (src/assets/brand/pandav-logo.png, transparent PNG). The
 * wordmark is navy, so on dark backgrounds (`tone="light"`) it sits on a
 * white panel rather than being recoloured.
 */
export function Logo({
  tone = "dark",
  priority = false,
  className,
}: {
  tone?: "dark" | "light";
  /** Preload when the logo is above the fold (the header). */
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Pandav Tours & Travel — home"
      className={cn(
        "inline-flex shrink-0 items-center",
        tone === "light" && "rounded-2xl bg-paper px-4 py-3",
        className,
      )}
    >
      <Image
        src={logo}
        alt="Pandav Tours and Travel"
        preload={priority}
        sizes="(min-width: 1024px) 220px, 190px"
        className={tone === "light" ? "h-14 w-auto" : "h-12 w-auto sm:h-14 lg:h-16"}
      />
    </Link>
  );
}

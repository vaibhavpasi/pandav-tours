import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/pandav-logo.png";
import logoLight from "@/assets/brand/pandav-logo-light.png";
import { cn } from "@/lib/utils";

/**
 * Brand logo. `tone="light"` is for dark backgrounds: the same artwork with
 * the navy wordmark and plane recoloured white (pandav-logo-light.png).
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
    <Link href="/" aria-label="Pandav Tours & Travel — home" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src={tone === "light" ? logoLight : logo}
        alt="Pandav Tours and Travel"
        preload={priority}
        sizes="(min-width: 1024px) 200px, 170px"
        className={tone === "light" ? "h-16 w-auto" : "h-11 w-auto sm:h-12 lg:h-[3.4rem]"}
      />
    </Link>
  );
}

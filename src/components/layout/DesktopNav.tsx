"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Main navigation with the current section marked (aria-current + gold underline). */
export function DesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-0.5 xl:gap-1">
        {links.map((link) => {
          const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative block rounded-full px-2.5 py-2 text-[0.9375rem] font-medium whitespace-nowrap transition-colors xl:px-3",
                  "after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gold after:transition-transform after:duration-300",
                  "hover:text-ink hover:after:scale-x-100",
                  current ? "text-ink after:scale-x-100" : "text-ink-muted",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

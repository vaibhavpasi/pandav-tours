"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { NavLink } from "@/lib/constants";
import { CloseIcon, MenuIcon } from "./Icons";

/** Disclosure-pattern mobile menu: button with aria-expanded + panel. */
/** `bookHref` is the call link (tel:) — bookings are taken by phone. */
export function MobileNav({ links, bookHref }: { links: NavLink[]; bookHref: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-surface"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full animate-fade-in border-b border-line bg-paper shadow-card"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-surface"
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={bookHref} className={buttonClasses({ size: "lg" }, "mt-3 w-full")}>
            Call to Book
          </a>
        </nav>
      </div>
    </div>
  );
}

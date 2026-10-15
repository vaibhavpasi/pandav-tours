import Link from "next/link";
import { ButtonLink, Container } from "@/components/ui";
import { businessContact, PRIMARY_NAV } from "@/lib/constants";
import { formatPhoneForDisplay, telHref } from "@/lib/phone";
import { PhoneIcon } from "./Icons";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { phone } = businessContact();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-3 py-2 text-[0.9375rem] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {phone ? (
            <a
              href={telHref(phone)}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-surface md:inline-flex"
            >
              <PhoneIcon className="size-4" />
              {formatPhoneForDisplay(phone)}
            </a>
          ) : null}
          <ButtonLink href="/book-cab" size="sm" className="hidden sm:inline-flex">
            Book a Cab
          </ButtonLink>
          <MobileNav links={PRIMARY_NAV} />
        </div>
      </Container>
    </header>
  );
}

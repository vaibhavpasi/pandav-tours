import { CallButton } from "@/components/site/CallToBook";
import { Container } from "@/components/ui";
import { businessContact, PRIMARY_NAV } from "@/lib/constants";
import { formatPhoneForDisplay, telHref } from "@/lib/phone";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DesktopNav } from "./DesktopNav";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./Icons";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

/** Slim contact bar above the header (tablet and up). It scrolls away; the header stays. */
function TopBar() {
  const { phone, whatsapp, email } = businessContact();
  return (
    <div className="on-dark hidden bg-ink text-sm text-paper/80 md:block">
      <Container className="flex h-9 items-center justify-between gap-6">
        <p className="truncate">Taxi service in Nashik — outstation, local, airport &amp; Shirdi trips</p>
        <ul className="flex shrink-0 items-center gap-5">
          {phone ? (
            <li>
              <a href={telHref(phone)} className="inline-flex items-center gap-1.5 font-semibold text-paper hover:text-gold">
                <PhoneIcon className="size-3.5 text-gold" />
                {formatPhoneForDisplay(phone)}
              </a>
            </li>
          ) : null}
          {whatsapp ? (
            <li>
              <a
                href={buildWhatsAppUrl(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-gold"
              >
                <WhatsAppIcon className="size-3.5 text-gold" />
                WhatsApp<span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </li>
          ) : null}
          {email ? (
            <li className="hidden xl:block">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-gold">
                <MailIcon className="size-3.5 text-gold" />
                {email}
              </a>
            </li>
          ) : null}
        </ul>
      </Container>
    </div>
  );
}

export function Header() {
  const { phone } = businessContact();

  return (
    <>
      <TopBar />
      <header className="scroll-shadow sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <Container className="flex h-[4.25rem] items-center justify-between gap-4 lg:h-[4.75rem]">
          <Logo priority />
          <DesktopNav links={PRIMARY_NAV} />
          <div className="flex items-center gap-2">
            <CallButton size="sm" className="hidden h-10 px-5 sm:inline-flex">
              Call to Book
            </CallButton>
            <MobileNav links={PRIMARY_NAV} bookHref={phone ? telHref(phone) : "/contact"} />
          </div>
        </Container>
      </header>
    </>
  );
}

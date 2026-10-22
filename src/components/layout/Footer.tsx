import Link from "next/link";
import { Container } from "@/components/ui";
import {
  businessContact,
  FOOTER_COMPANY,
  FOOTER_LEGAL,
  FOOTER_SERVICES,
  TAGLINE,
  type NavLink,
} from "@/lib/constants";
import { formatPhoneForDisplay, telHref } from "@/lib/phone";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./Icons";
import { Logo } from "./Logo";

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-wider text-gold uppercase">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-muted-on-dark transition-colors hover:text-paper">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { name, phone, whatsapp, email } = businessContact();

  return (
    // Bottom padding leaves room for the mobile call/WhatsApp bar.
    <footer className="on-dark bg-ink pb-20 text-paper sm:pb-0">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-muted-on-dark">{TAGLINE}.</p>
          <ul className="mt-6 space-y-3">
            {phone ? (
              <li>
                <a href={telHref(phone)} className="inline-flex items-center gap-2 hover:text-gold">
                  <PhoneIcon className="size-4 text-gold" />
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
                  className="inline-flex items-center gap-2 hover:text-gold"
                >
                  <WhatsAppIcon className="size-4 text-gold" />
                  WhatsApp us<span className="sr-only"> (opens WhatsApp)</span>
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 break-all hover:text-gold">
                  <MailIcon className="size-4 shrink-0 text-gold" />
                  {email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        <LinkColumn title="Services" links={FOOTER_SERVICES} />
        <LinkColumn title="Company" links={FOOTER_COMPANY} />
        <LinkColumn title="Policies" links={FOOTER_LEGAL} />
      </Container>
      <div className="border-t border-ink-soft">
        <Container className="flex flex-col gap-2 py-6 text-sm text-muted-on-dark sm:flex-row sm:items-center sm:justify-between">
          <p>© {name}. All rights reserved.</p>
          <p>
            Nashik, Maharashtra, India ·{" "}
            <Link href="/explore-nashik#photo-credits" className="hover:text-paper">
              Photo credits
            </Link>
          </p>
          <p>
            Digital design by{" "}
            <a
              href="https://4amglobalmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold hover:text-paper"
            >
              4am Global Media
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}

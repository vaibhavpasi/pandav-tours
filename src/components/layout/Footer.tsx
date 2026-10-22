import Link from "next/link";
import { Container } from "@/components/ui";
import { businessContact, FOOTER_COMPANY, FOOTER_LEGAL, FOOTER_SERVICES, type NavLink } from "@/lib/constants";
import { formatPhoneForDisplay, telHref } from "@/lib/phone";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./Icons";
import { Logo } from "./Logo";

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm sm:text-base">
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

function ContactRow({ href, icon, label, value, external }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group flex items-center gap-3"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper/10 text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-xs text-muted-on-dark">{label}</span>
          <span className="block truncate font-semibold group-hover:text-gold">
            {value}
            {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
          </span>
        </span>
      </a>
    </li>
  );
}

export function Footer() {
  const { name, phone, whatsapp, email } = businessContact();

  return (
    // Bottom padding leaves room for the mobile call/WhatsApp bar.
    <footer className="on-dark border-t border-ink-soft bg-ink pb-20 text-paper sm:pb-0">
      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)] lg:gap-16">
        {/* Brand + contact */}
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-muted-on-dark">
            Nashik&apos;s cab and travel partner for outstation trips, local rentals, airport and station transfers, and
            Shirdi tours. Book with one call.
          </p>
          <ul className="mt-7 space-y-4">
            {phone ? (
              <ContactRow
                href={telHref(phone)}
                icon={<PhoneIcon className="size-5" />}
                label="Call to book"
                value={formatPhoneForDisplay(phone)}
              />
            ) : null}
            {whatsapp ? (
              <ContactRow
                href={buildWhatsAppUrl(whatsapp)}
                icon={<WhatsAppIcon className="size-5" />}
                label="WhatsApp"
                value="Chat with us"
                external
              />
            ) : null}
            {email ? (
              <ContactRow href={`mailto:${email}`} icon={<MailIcon className="size-5" />} label="Email" value={email} />
            ) : null}
          </ul>
          {!phone && !whatsapp && !email ? (
            <Link href="/contact" className="mt-6 inline-block font-semibold text-gold hover:text-paper">
              Contact us →
            </Link>
          ) : null}
        </div>

        {/* Links: two columns on phones, three from tablet up */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          <LinkColumn title="Services" links={FOOTER_SERVICES} />
          <LinkColumn title="Company" links={FOOTER_COMPANY} />
          <div className="col-span-2 sm:col-span-1">
            <LinkColumn title="Policies" links={FOOTER_LEGAL} />
          </div>
        </div>
      </Container>

      <div className="border-t border-ink-soft">
        <Container className="flex flex-col gap-3 py-6 text-sm text-muted-on-dark md:flex-row md:items-center md:justify-between">
          <p>
            © {name} · Nashik, Maharashtra ·{" "}
            <Link href="/explore-nashik#photo-credits" className="hover:text-paper">
              Photo credits
            </Link>
          </p>
          <p>
            Designed &amp; Developed by{" "}
            <a
              href="https://4amglobalmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold hover:text-paper"
            >
              4AM Global Media
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}

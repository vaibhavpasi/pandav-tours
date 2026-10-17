import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink, Card, CardBody, Container } from "@/components/ui";
import { businessContact } from "@/lib/constants";
import type { PublicSettings } from "@/lib/data/catalog";
import { formatPhoneForDisplay, telHref } from "@/lib/phone";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { TESTIMONIALS } from "@/content/testimonials";
import { ArrowRightIcon, BedIcon, ClockIcon, PlaneIcon, RoundTripIcon, TempleIcon, TrainIcon } from "./TaxiIcons";

export function Section({
  id,
  title,
  intro,
  tone = "paper",
  children,
  action,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  tone?: "paper" | "surface";
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className={tone === "surface" ? "bg-surface py-16 sm:py-20" : "py-16 sm:py-20"}>
      <Container>
        <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id={`${id}-heading`} className="text-3xl font-bold sm:text-4xl">
              {title}
            </h2>
            {intro ? <p className="mt-3 max-w-2xl text-muted">{intro}</p> : null}
          </div>
          {action}
        </div>
        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}

export const SERVICES = [
  {
    title: "Outstation trips",
    body: "One-way and round-trip cabs from Nashik to Mumbai, Pune, Shirdi and beyond.",
    href: "/outstation-cab",
    icon: RoundTripIcon,
  },
  { title: "Local cab in Nashik", body: "Hourly rentals for errands, temple visits and sightseeing.", href: "/local-cab", icon: ClockIcon },
  { title: "Airport transfers", body: "Pickups and drops planned around your flight.", href: "/airport-transfer", icon: PlaneIcon },
  {
    title: "Railway station transfers",
    body: "Pickups and drops at Nashik Road railway station.",
    href: "/railway-station-transfer",
    icon: TrainIcon,
  },
  {
    title: "Shirdi & tour packages",
    body: "Shirdi darshan, Trimbakeshwar, family tours and getaways.",
    href: "/tour-packages",
    icon: TempleIcon,
  },
  {
    title: "Hotel, flight & train help",
    body: "Booking help for the rest of your journey — just ask.",
    href: "/contact",
    icon: BedIcon,
  },
];

/** Service cards: icon + title + one line. Rows on phones, cards from tablet up. */
export function ServicesGrid() {
  return (
    <ul className="reveal-stagger grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {SERVICES.map(({ title, body, href, icon: Icon }) => (
        <li key={href + title}>
          <Card interactive className="group relative h-full">
            <CardBody className="flex h-full items-center gap-4 p-4 sm:flex-col sm:items-start sm:p-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-gold transition-colors duration-200 group-hover:bg-gold group-hover:text-ink">
                <Icon className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold sm:text-lg">
                  <Link href={href} className="after:absolute after:inset-0">
                    {title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted sm:mt-2 sm:text-base">{body}</p>
              </div>
              <ArrowRightIcon
                className="size-5 shrink-0 text-gold-ink transition-transform duration-200 group-hover:translate-x-1 sm:mt-auto"
              />
            </CardBody>
          </Card>
        </li>
      ))}
    </ul>
  );
}

const REASONS = [
  {
    title: "Itemised fares before you pay",
    body: "Every charge is listed up front. Anything paid at actuals — like tolls on some routes — is shown separately.",
  },
  {
    title: "Secure online payment",
    body: "Payments are processed by Razorpay. Your card details are entered on Razorpay's checkout, never on our servers.",
  },
  {
    title: "Based in Nashik",
    body: "A local team that knows the city, its temples and the routes to Mumbai, Pune and Shirdi.",
  },
  {
    title: "Talk to a person",
    body: "Questions before or after booking? Call or WhatsApp us and quote your booking reference.",
  },
];

export function WhyChooseUs() {
  return (
    <ul className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {REASONS.map((reason, index) => (
        <li key={reason.title} className="rounded-card border border-line bg-paper p-6">
          <p className="font-heading text-3xl font-extrabold text-gold-ink" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-3 text-lg font-semibold">{reason.title}</h3>
          <p className="mt-2 text-sm text-muted">{reason.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <Section id="testimonials" title="What our customers say">
      <ul className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <li key={t.name + t.quote}>
            <figure className="h-full rounded-card border border-line p-6">
              <blockquote className="text-ink-muted">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {t.name}
                {t.trip ? <span className="font-normal text-muted"> · {t.trip}</span> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Contact details: database settings first, then environment fallback. */
export function ContactDetails({ settings }: { settings: PublicSettings }) {
  const env = businessContact();
  const phone = settings.phone ?? env.phone;
  const whatsapp = settings.whatsapp_number ?? env.whatsapp;
  const email = settings.public_email ?? env.email;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-card border border-line bg-paper p-6">
        <h3 className="font-semibold">Call or WhatsApp</h3>
        {phone || whatsapp ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {phone ? (
              <ButtonLink href={telHref(phone)} variant="dark" size="sm">
                Call {formatPhoneForDisplay(phone)}
              </ButtonLink>
            ) : null}
            {whatsapp ? (
              <ButtonLink href={buildWhatsAppUrl(whatsapp)} target="_blank" rel="noopener noreferrer" size="sm">
                WhatsApp<span className="sr-only"> (opens WhatsApp)</span>
              </ButtonLink>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Contact numbers will be published here shortly.</p>
        )}
      </div>
      <div className="rounded-card border border-line bg-paper p-6">
        <h3 className="font-semibold">Email</h3>
        {email ? (
          <a href={`mailto:${email}`} className="mt-2 inline-block break-all text-gold-ink underline">
            {email}
          </a>
        ) : (
          <p className="mt-2 text-sm text-muted">Use the enquiry form and we&apos;ll call you back.</p>
        )}
      </div>
      <div className="rounded-card border border-line bg-paper p-6">
        <h3 className="font-semibold">Service area</h3>
        <p className="mt-2 text-sm text-muted">{settings.service_area ?? "Based in Nashik, Maharashtra."}</p>
        {settings.address ? <address className="mt-2 text-sm not-italic">{settings.address}</address> : null}
      </div>
    </div>
  );
}

export function CallToAction({ title, body }: { title: string; body: string }) {
  return (
    <section className="on-dark bg-ink py-14 text-paper">
      <Container className="reveal flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-xl text-muted-on-dark">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/book-cab" size="lg">
            Book a Cab
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline-light" size="lg">
            Send an enquiry
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

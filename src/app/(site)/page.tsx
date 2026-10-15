import Link from "next/link";
import { ButtonLink, Card, CardBody, Container } from "@/components/ui";

/**
 * Phase 1 homepage: hero + service overview so the shell and design system
 * can be reviewed. The working booking widget, routes, vehicles, packages
 * and FAQs are added in Phase 2.
 */

const SERVICES = [
  {
    title: "Local cab in Nashik",
    body: "Hourly rentals for city errands, temple visits and sightseeing.",
    href: "/local-cab",
  },
  {
    title: "Outstation trips",
    body: "One-way and round-trip travel from Nashik to Mumbai, Pune, Shirdi and beyond.",
    href: "/outstation-cab",
  },
  {
    title: "Airport & railway transfers",
    body: "Pickups and drops for Mumbai and Nashik airports and Nashik Road station.",
    href: "/airport-transfer",
  },
  {
    title: "Tour packages",
    body: "Trimbakeshwar, Shirdi, family tours and honeymoon packages.",
    href: "/tour-packages",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="on-dark relative overflow-hidden bg-ink text-paper">
        {/* Decorative brand gradient until real travel photography is supplied. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(245_189_24/0.22),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgb(245_189_24/0.08),transparent_50%)]"
        />
        <Container className="relative py-20 sm:py-28">
          <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Your trusted cab &amp; travel partner in Nashik
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-extrabold sm:text-5xl lg:text-6xl">
            Explore More. Travel Comfortably.{" "}
            <span className="text-gold">Book Your Cab in Nashik.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-on-dark">
            Book local rides, outstation trips and holiday travel with Pandav Tours &amp; Travel.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/book-cab" size="lg">
              Book a Cab
            </ButtonLink>
            <ButtonLink href="/tour-packages" size="lg" variant="outline-light">
              View tour packages
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section aria-labelledby="services-heading" className="bg-surface py-16 sm:py-20">
        <Container>
          <h2 id="services-heading" className="text-3xl font-bold sm:text-4xl">
            Our services
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Choose the trip that suits you. Fares are confirmed before you pay.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <li key={service.href}>
                <Card interactive className="h-full">
                  <CardBody className="flex h-full flex-col">
                    <div className="mb-4 h-1 w-10 rounded-full bg-gold" aria-hidden="true" />
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                    <p className="mt-2 flex-1 text-muted">{service.body}</p>
                    <Link
                      href={service.href}
                      className="mt-5 font-semibold text-gold-ink underline-offset-4 hover:underline"
                    >
                      Learn more<span className="sr-only"> about {service.title}</span> →
                    </Link>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

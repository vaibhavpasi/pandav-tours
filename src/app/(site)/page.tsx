import type { Metadata } from "next";
import Link from "next/link";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { PackageCard, RouteCard, VehicleCard } from "@/components/site/CatalogCards";
import { FaqList } from "@/components/site/FaqList";
import { ContactDetails, Section, ServicesGrid, Testimonials, WhyChooseUs } from "@/components/site/Sections";
import { ButtonLink, Container } from "@/components/ui";
import { GENERAL_FAQS } from "@/content/faqs";
import { getCatalog, startingPriceForCategory, startingPriceForRoute } from "@/lib/data/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const catalog = await getCatalog();
  const featuredRoutes = (catalog.routes.some((r) => r.is_featured)
    ? catalog.routes.filter((r) => r.is_featured)
    : catalog.routes
  ).slice(0, 6);
  const featuredPackages = (catalog.packages.some((p) => p.is_featured)
    ? catalog.packages.filter((p) => p.is_featured)
    : catalog.packages
  ).slice(0, 3);

  return (
    <>
      {/* 2–3. Hero + booking widget */}
      <section className="on-dark relative overflow-hidden bg-ink text-paper">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(245_189_24/0.22),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgb(245_189_24/0.08),transparent_50%)]"
        />
        <Container className="relative pt-16 pb-12 sm:pt-24 sm:pb-16">
          <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Your trusted cab &amp; travel partner in Nashik
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-extrabold sm:text-5xl lg:text-6xl">
            Explore More. Travel Comfortably. <span className="text-gold">Book Your Cab in Nashik.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-on-dark">
            Book local rides, outstation trips and holiday travel with Pandav Tours &amp; Travel.
          </p>
          <div className="mt-10">
            {catalog.routes.length ? (
              <BookingWidget routes={catalog.routes} maxAdvanceDays={catalog.settings.max_booking_advance_days} />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/book-cab" size="lg">
                  Book a Cab
                </ButtonLink>
                <ButtonLink href="/contact" size="lg" variant="outline-light">
                  Send an enquiry
                </ButtonLink>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 4. Services */}
      <Section id="services" title="Our services" intro="Choose the trip that suits you. Fares are shown in full before you pay." tone="surface">
        <ServicesGrid />
      </Section>

      {/* 5. Vehicle categories */}
      {catalog.categories.length ? (
        <Section
          id="vehicles"
          title="Choose your vehicle"
          intro="Pick the size that fits your group and luggage."
          action={
            <Link href="/cabs" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
              All vehicles →
            </Link>
          }
        >
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.categories.slice(0, 3).map((category) => (
              <li key={category.id}>
                <VehicleCard category={category} startingPaise={startingPriceForCategory(catalog, category.id)} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* 6. Popular routes */}
      {featuredRoutes.length ? (
        <Section
          id="routes"
          title="Popular routes from Nashik"
          tone="surface"
          action={
            <Link href="/outstation-cab" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
              Outstation cabs →
            </Link>
          }
        >
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRoutes.map((route) => (
              <li key={route.id}>
                <RouteCard route={route} startingPaise={startingPriceForRoute(catalog, route.id)} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* 7. Featured packages */}
      {featuredPackages.length ? (
        <Section
          id="packages"
          title="Featured tour packages"
          action={
            <Link href="/tour-packages" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
              All packages →
            </Link>
          }
        >
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((pkg) => (
              <li key={pkg.id}>
                <PackageCard pkg={pkg} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* 8. Why choose us */}
      <Section id="why" title="Why travel with Pandav Tours & Travel" tone="surface">
        <WhyChooseUs />
      </Section>

      {/* 9. Testimonials — rendered only when genuine testimonials exist */}
      <Testimonials />

      {/* 10. FAQs */}
      <Section
        id="faq"
        title="Frequently asked questions"
        action={
          <Link href="/faq" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
            All FAQs →
          </Link>
        }
      >
        <FaqList faqs={GENERAL_FAQS.slice(0, 5)} />
      </Section>

      {/* 11. Contact & service area */}
      <Section id="contact" title="Get in touch" tone="surface">
        <ContactDetails settings={catalog.settings} />
      </Section>
    </>
  );
}

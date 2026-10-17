import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { PackageCard, RouteCard, VehicleCard } from "@/components/site/CatalogCards";
import { DestinationMosaic, PhotoBanner, PhotoMarquee } from "@/components/site/Destinations";
import { CarIcon } from "@/components/site/TaxiIcons";
import { HowItWorks, TrustStrip } from "@/components/site/TaxiSections";
import { FaqList } from "@/components/site/FaqList";
import { ContactDetails, Section, ServicesGrid, Testimonials, WhyChooseUs } from "@/components/site/Sections";
import { ButtonLink, Container } from "@/components/ui";
import { DESTINATIONS, PHOTOS } from "@/content/destinations";
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
      <section className="on-dark relative isolate overflow-hidden bg-ink text-paper">
        <Image
          src={PHOTOS.trimbakeshwarMonsoon.src}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="100vw"
          className="-z-10 animate-hero-zoom object-cover object-[70%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(17_17_17/0.92),rgb(17_17_17/0.7)_50%,rgb(17_17_17/0.35)),linear-gradient(to_top,rgb(17_17_17/0.9),transparent_45%)]"
        />
        <Container className="relative pt-14 pb-10 sm:pt-24 sm:pb-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink/40 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-gold uppercase backdrop-blur sm:text-sm">
            <CarIcon className="size-4" />
            Taxi service in Nashik
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-extrabold sm:text-5xl lg:text-6xl">
            Book a Nashik taxi <span className="text-gold">in minutes.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-paper/85">
            Outstation one-ways and round trips, local rentals, airport and Nashik Road station transfers — see the full
            fare upfront, pay securely, ride comfortably.
          </p>
          <div className="mt-8 md:mb-8">
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
          <p className="mt-6 text-right text-xs text-paper/60">
            Trimbakeshwar in the monsoon ·{" "}
            <Link href="/explore-nashik#photo-credits" className="underline-offset-2 hover:underline">
              Photo credits
            </Link>
          </p>
        </Container>
      </section>

      {/* 4. Trust strip */}
      <TrustStrip />

      {/* 5. Popular routes — the core taxi offer, first after search */}
      {featuredRoutes.length ? (
        <Section
          id="routes"
          title="Popular cab routes from Nashik"
          tone="surface"
          intro="Fixed starting fares on the routes people book most. Tap a route to see every vehicle and the full fare."
          action={
            <Link href="/outstation-cab" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
              All outstation cabs →
            </Link>
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRoutes.map((route) => (
              <li key={route.id}>
                <RouteCard route={route} startingPaise={startingPriceForRoute(catalog, route.id)} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* 6. Services */}
      <Section id="services" title="Cabs for every trip" intro="Choose the trip that suits you. Fares are shown in full before you pay.">
        <ServicesGrid />
      </Section>

      {/* 7. Vehicle categories */}
      {catalog.categories.length ? (
        <Section
          id="vehicles"
          title="Choose your cab"
          tone="surface"
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

      {/* 8. How it works */}
      <Section id="how" title="Book your cab in 3 easy steps">
        <HowItWorks />
      </Section>

      {/* 9. Explore Nashik */}
      <Section
        id="explore"
        title="Explore Nashik"
        tone="surface"
        intro="Temples, ancient caves, vineyards, forts and monsoon waterfalls — all within a comfortable drive. Tell us where you want to go and we'll take you there."
        action={
          <Link href="/explore-nashik" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
            All {DESTINATIONS.length} places to visit →
          </Link>
        }
      >
        <DestinationMosaic destinations={DESTINATIONS.slice(0, 5)} />
      </Section>

      {/* 10. Featured packages */}
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

      {/* 11. Why choose us */}
      <Section id="why" title="Why travel with Pandav Tours & Travel" tone="surface">
        <WhyChooseUs />
      </Section>

      {/* 12. Photo gallery + banner */}
      <section aria-labelledby="gallery-heading" className="overflow-hidden py-16 sm:py-20">
        <Container>
          <p className="text-sm font-semibold tracking-[0.2em] text-gold-ink uppercase">Moments from the road</p>
          <h2 id="gallery-heading" className="mt-2 text-3xl font-bold sm:text-4xl">
            Nashik, through the seasons
          </h2>
        </Container>
        <div className="mt-10">
          <PhotoMarquee />
        </div>
      </section>

      <PhotoBanner
        title="Your next weekend escape starts here"
        body="Harihar's rock-cut steps, Bhandardara's lakes, Kalsubai's sunrise — we'll handle the drive, you enjoy the view."
      />

      {/* 13. Testimonials — rendered only when genuine testimonials exist */}
      <Testimonials />

      {/* 14. FAQs */}
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

      {/* 15. Contact & service area */}
      <Section id="contact" title="Get in touch" tone="surface">
        <ContactDetails settings={catalog.settings} />
      </Section>
    </>
  );
}

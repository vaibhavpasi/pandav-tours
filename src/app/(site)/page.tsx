import type { Metadata } from "next";
import Link from "next/link";
import { PackageCard, RouteCard, VehicleCard } from "@/components/site/CatalogCards";
import { PhotoMarquee } from "@/components/site/Destinations";
import { FaqList } from "@/components/site/FaqList";
import {
  BookingProcess,
  CategoryTiles,
  ExploreShowcase,
  FinalCta,
  HeroFrame,
  PopularTrips,
} from "@/components/site/HomeSections";
import {
  ContactDetails,
  PillLink,
  Section,
  ServicesGrid,
  Testimonials,
  WhyChooseUs,
} from "@/components/site/Sections";
import { TrustStrip } from "@/components/site/TaxiSections";
import { ShirdiTourFeature } from "@/components/site/TourFeature";
import { Container } from "@/components/ui";
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
      {/* 1. Framed hero — call to book */}
      <HeroFrame />

      {/* 2. Trust strip */}
      <TrustStrip />

      {/* 3. Destinations showcase */}
      <Section
        id="explore"
        eyebrow="Explore"
        title="Come and explore the most beautiful places around Nashik."
        action={<PillLink href="/explore-nashik">Explore more</PillLink>}
      >
        <ExploreShowcase />
      </Section>

      {/* 4. Kinds of trip */}
      <Section
        id="categories"
        eyebrow="Destinations"
        title="Find your kind of trip"
        intro="Ancient temples, rock-cut caves, monsoon waterfalls and vineyards — we'll drive you to all of them."
        tone="surface"
      >
        <CategoryTiles />
      </Section>

      {/* 5. Popular trips */}
      <Section
        id="popular"
        eyebrow="Popular"
        title="Discover our most popular trips"
        intro="Easy day trips and weekend getaways from Nashik. Call to book any of them."
        align="center"
      >
        <PopularTrips />
      </Section>

      {/* 6. Popular cab routes (from the catalogue) */}
      {featuredRoutes.length ? (
        <Section
          id="routes"
          eyebrow="Outstation"
          title="Popular cab routes from Nashik"
          tone="surface"
          intro="Starting fares on the routes people book most. Call us and we'll confirm the exact fare for your trip."
          action={<PillLink href="/outstation-cab">All outstation cabs</PillLink>}
        >
          <ul className="reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRoutes.map((route) => (
              <li key={route.id}>
                <RouteCard route={route} startingPaise={startingPriceForRoute(catalog, route.id)} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* 7. Services */}
      <Section
        id="services"
        eyebrow="Services"
        title="Cabs for every trip"
        intro="Choose the trip that suits you, then call — we confirm the full fare before you travel."
      >
        <ServicesGrid />
      </Section>

      {/* 8. Vehicle categories (from the catalogue) */}
      {catalog.categories.length ? (
        <Section
          id="vehicles"
          eyebrow="Fleet"
          title="Choose your cab"
          tone="surface"
          intro="Pick the size that fits your group and luggage."
          action={<PillLink href="/cabs">All vehicles</PillLink>}
        >
          <ul className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.categories.slice(0, 3).map((category) => (
              <li key={category.id}>
                <VehicleCard category={category} startingPaise={startingPriceForCategory(catalog, category.id)} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* 9. Booking process */}
      <section aria-labelledby="process-heading" className="bg-surface py-16 sm:py-24">
        <Container>
          <BookingProcess />
        </Container>
      </section>

      {/* 10. Shirdi tour */}
      <section aria-label="Shirdi darshan tour" className="py-16 sm:py-24">
        <Container>
          <ShirdiTourFeature />
        </Container>
      </section>

      {/* 11. Featured packages (from the catalogue) */}
      {featuredPackages.length ? (
        <Section
          id="packages"
          eyebrow="Tours"
          title="Featured tour packages"
          action={<PillLink href="/tour-packages">All packages</PillLink>}
        >
          <ul className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((pkg) => (
              <li key={pkg.id}>
                <PackageCard pkg={pkg} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* 12. Why choose us */}
      <Section id="why" eyebrow="Why us" title="Why travel with Pandav Tours & Travel" tone="surface">
        <WhyChooseUs />
      </Section>

      {/* 13. Photo gallery */}
      <section aria-labelledby="gallery-heading" className="overflow-hidden py-16 sm:py-24">
        <Container className="reveal">
          <p className="text-xs font-semibold tracking-[0.25em] text-gold-ink uppercase">Moments from the road</p>
          <h2 id="gallery-heading" className="mt-3 text-3xl leading-[1.1] font-medium tracking-tight sm:text-5xl">
            Nashik, through the seasons
          </h2>
        </Container>
        <div className="mt-10 sm:mt-14">
          <PhotoMarquee />
        </div>
      </section>

      {/* 14. Testimonials — rendered only when genuine testimonials exist */}
      <Testimonials />

      {/* 15. FAQs */}
      <Section
        id="faq"
        eyebrow="FAQ"
        title="Frequently asked questions"
        tone="surface"
        action={
          <Link href="/faq" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
            All FAQs →
          </Link>
        }
      >
        <FaqList faqs={GENERAL_FAQS.slice(0, 5)} />
      </Section>

      {/* 16. Contact & service area */}
      <Section id="contact" eyebrow="Contact" title="Get in touch">
        <ContactDetails settings={catalog.settings} />
      </Section>

      {/* 17. Closing call to action */}
      <FinalCta />
    </>
  );
}

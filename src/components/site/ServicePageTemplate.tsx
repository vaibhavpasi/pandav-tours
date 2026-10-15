import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";
import { RouteCard } from "@/components/site/CatalogCards";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { CallToAction, Section } from "@/components/site/Sections";
import { Container, LoadingBlock } from "@/components/ui";
import type { ServicePage } from "@/content/services";
import { getCatalog, routesOfType, startingPriceForRoute } from "@/lib/data/catalog";

/** Shared layout for local / outstation / airport / railway pages. */
export async function ServicePageTemplate({ page }: { page: ServicePage }) {
  const catalog = await getCatalog();
  const routes = routesOfType(catalog, page.tripTypes);

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} />

      <Container className="py-12">
        <ul className="grid gap-5 md:grid-cols-3">
          {page.points.map((point) => (
            <li key={point.title} className="rounded-card border border-line p-6">
              <h2 className="text-lg font-semibold">{point.title}</h2>
              <p className="mt-2 text-sm text-muted">{point.body}</p>
            </li>
          ))}
        </ul>
      </Container>

      {routes.length ? (
        <Section id="routes" title="Available routes" tone="surface" intro="Starting prices exclude taxes and charges paid at actuals.">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <li key={route.id}>
                <RouteCard route={route} startingPaise={startingPriceForRoute(catalog, route.id)} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id="book" title="Book now">
        <div className="max-w-4xl">
          <Suspense fallback={<LoadingBlock label="Loading booking form…" lines={6} />}>
            <BookingForm
              routes={routes}
              tripTypes={page.tripTypes}
              termsVersion={catalog.settings.terms_version}
              maxAdvanceDays={catalog.settings.max_booking_advance_days}
            />
          </Suspense>
        </div>
      </Section>

      {page.faqs.length ? (
        <Section id="faq" title="Questions" tone="surface">
          <FaqList faqs={page.faqs} />
        </Section>
      ) : null}

      <CallToAction
        title="Need something different?"
        body="Tell us where you want to go and we'll help plan the trip."
      />
    </>
  );
}

import { RouteCard } from "@/components/site/CatalogCards";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { CallToAction, Section } from "@/components/site/Sections";
import { Container } from "@/components/ui";
import { CallBookingCard } from "./CallToBook";
import type { ServicePage } from "@/content/services";
import { getCatalog, routesOfType, startingPriceForRoute } from "@/lib/data/catalog";

/** Shared layout for local / outstation / airport / railway pages. */
export async function ServicePageTemplate({ page }: { page: ServicePage }) {
  const catalog = await getCatalog();
  const routes = routesOfType(catalog, page.tripTypes);

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} photo={page.photo} />

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

      <section id="book" aria-label="Book by phone" className="py-12 sm:py-16">
        <Container>
          <CallBookingCard
            tone="dark"
            message={`Hello Pandav Tours & Travel, I would like to book a cab (${page.eyebrow.toLowerCase()}).`}
            className="reveal"
          />
        </Container>
      </section>

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

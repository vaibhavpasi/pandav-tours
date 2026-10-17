import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { PackageCard } from "@/components/site/CatalogCards";
import { PageHero } from "@/components/site/PageHero";
import { DESTINATIONS, PHOTOS } from "@/content/destinations";
import { Section } from "@/components/site/Sections";
import { ShirdiTourFeature } from "@/components/site/TourFeature";
import { Container } from "@/components/ui";
import { getCatalog } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Tour Packages from Nashik",
  description:
    "Tour packages from Nashik including Trimbakeshwar, Shirdi, family tours and honeymoon trips. Book online or enquire.",
  alternates: { canonical: "/tour-packages" },
};

const IDEAS = DESTINATIONS.filter((d) =>
  ["trimbakeshwar", "shani-shingnapur", "saptashrungi", "bhandardara"].includes(d.slug),
);

export default async function TourPackagesPage() {
  const catalog = await getCatalog();

  return (
    <>
      <PageHero
        photo={PHOTOS.trimbakeshwarCourtyard}
        eyebrow="Tour packages"
        title="Tours from Nashik"
        intro="Pilgrimages, family holidays and getaways, planned with transport you can rely on."
      />
      <Container className={catalog.packages.length ? "pt-12 sm:pt-16" : "py-12 sm:py-16"}>
        <ShirdiTourFeature />
      </Container>
      {catalog.packages.length ? (
        <Container className="py-12 sm:py-16">
          <ul className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.packages.map((pkg) => (
              <li key={pkg.id}>
                <PackageCard pkg={pkg} />
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
      <Section
        id="custom"
        title={catalog.packages.length ? "Want a custom tour?" : "Plan your tour with us"}
        intro="Tell us where you'd like to go, your dates and group size, and we'll put together an itinerary."
        tone="surface"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <div className="reveal rounded-card border border-line bg-paper p-5 shadow-card sm:p-6">
            <EnquiryForm defaults={{ enquiryType: "package" }} />
          </div>
          <aside aria-labelledby="ideas-heading" className="reveal lg:sticky lg:top-28">
            <h3 id="ideas-heading" className="text-lg font-bold">
              Ideas for your tour
            </h3>
            <ul className="mt-4 space-y-3">
              {IDEAS.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/explore-nashik#${d.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-line bg-paper p-3 transition-colors hover:border-ink"
                  >
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                      <Image src={d.photo.src} alt="" fill placeholder="blur" sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{d.name}</span>
                      <span className="block truncate text-sm text-muted">
                        {d.tagline} · {d.distance}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-gold-ink transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
    </>
  );
}

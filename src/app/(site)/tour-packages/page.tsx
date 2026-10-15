import type { Metadata } from "next";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { PackageCard } from "@/components/site/CatalogCards";
import { PageHero } from "@/components/site/PageHero";
import { PHOTOS } from "@/content/destinations";
import { Section } from "@/components/site/Sections";
import { Container } from "@/components/ui";
import { getCatalog } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Tour Packages from Nashik",
  description:
    "Tour packages from Nashik including Trimbakeshwar, Shirdi, family tours and honeymoon trips. Book online or enquire.",
  alternates: { canonical: "/tour-packages" },
};

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
      {catalog.packages.length ? (
        <Container className="py-12 sm:py-16">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="max-w-2xl rounded-card border border-line bg-paper p-6">
          <EnquiryForm defaults={{ enquiryType: "package" }} />
        </div>
      </Section>
    </>
  );
}

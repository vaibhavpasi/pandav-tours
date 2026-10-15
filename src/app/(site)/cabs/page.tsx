import type { Metadata } from "next";
import { VehicleCard } from "@/components/site/CatalogCards";
import { PageHero } from "@/components/site/PageHero";
import { CallToAction } from "@/components/site/Sections";
import { Container, EmptyState } from "@/components/ui";
import { getCatalog, startingPriceForCategory } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Our Cabs",
  description: "Vehicle options for local, outstation and transfer trips from Nashik, with seating and luggage capacity.",
  alternates: { canonical: "/cabs" },
};

export default async function CabsPage() {
  const catalog = await getCatalog();

  return (
    <>
      <PageHero
        eyebrow="Our cabs"
        title="Vehicles for every trip"
        intro="Choose by the number of passengers and bags. Exact models vary; the category guarantees the capacity."
      />
      <Container className="py-12 sm:py-16">
        {catalog.categories.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.categories.map((category) => (
              <li key={category.id}>
                <VehicleCard category={category} startingPaise={startingPriceForCategory(catalog, category.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Vehicle details coming soon"
            description="Contact us for the vehicle that suits your group."
          />
        )}
      </Container>
      <CallToAction title="Ready to travel?" body="See fares for your route and book online." />
    </>
  );
}

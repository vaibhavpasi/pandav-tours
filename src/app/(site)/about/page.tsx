import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { CallToAction, Section, WhyChooseUs } from "@/components/site/Sections";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "About Us",
  description: "Pandav Tours & Travel is a Nashik-based cab and travel service for local, outstation and holiday travel.",
  alternates: { canonical: "/about" },
};

/*
 * OWNER: replace the placeholder paragraph below with your own story — when
 * the business started, who runs it, what you're proud of. Only publish facts
 * you can stand behind (no invented years, fleet sizes or customer counts).
 */
export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Your trusted cab & travel partner in Nashik"
        intro="Local rides, outstation trips and holiday travel — booked simply, priced clearly."
      />
      <Container className="max-w-3xl space-y-5 py-12 text-lg text-ink-muted sm:py-16">
        <p>
          Pandav Tours &amp; Travel is a Nashik-based travel service offering local cabs, outstation taxis, airport and
          railway transfers, and tour packages to places such as Trimbakeshwar and Shirdi. We also help travellers
          arrange hotels, flights and trains.
        </p>
        <p>
          Our online booking shows every charge before you pay, so you know exactly what is included and what, if
          anything, is paid during the trip.
        </p>
      </Container>
      <Section id="why" title="What you can expect" tone="surface">
        <WhyChooseUs />
      </Section>
      <CallToAction title="Plan your next trip" body="Book online in minutes, or talk to us about a custom itinerary." />
    </>
  );
}

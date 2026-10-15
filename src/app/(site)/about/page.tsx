import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { PHOTOS } from "@/content/destinations";
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
        photo={PHOTOS.pandavleni}
        eyebrow="About us"
        title="Your trusted cab & travel partner in Nashik"
        intro="Local rides, outstation trips and holiday travel — booked simply, priced clearly."
      />
      <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-5 text-lg text-ink-muted">
          <p>
            Pandav Tours &amp; Travel is a Nashik-based travel service offering local cabs, outstation taxis, airport and
            railway transfers, and tour packages to places such as Trimbakeshwar and Shirdi. We also help travellers
            arrange hotels, flights and trains.
          </p>
          <p>
            Our online booking shows every charge before you pay, so you know exactly what is included and what, if
            anything, is paid during the trip.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-4" aria-label="Places we travel to">
          {[PHOTOS.trimbakeshwarCourtyard, PHOTOS.sulaEstate, PHOTOS.harihar, PHOTOS.kalaram].map((photo, i) => (
            <li
              key={photo.credit.source}
              className={`relative aspect-[4/5] overflow-hidden rounded-card shadow-card ${i % 2 === 1 ? "translate-y-6" : ""}`}
            >
              <Image src={photo.src} alt={photo.alt} fill placeholder="blur" sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </Container>
      <Section id="why" title="What you can expect" tone="surface">
        <WhyChooseUs />
      </Section>
      <CallToAction title="Plan your next trip" body="Book online in minutes, or talk to us about a custom itinerary." />
    </>
  );
}

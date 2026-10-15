import type { Metadata } from "next";
import Image from "next/image";
import { PhotoCredits } from "@/components/site/Destinations";
import { PageHero } from "@/components/site/PageHero";
import { CallToAction, Section } from "@/components/site/Sections";
import { ButtonLink, Container } from "@/components/ui";
import { DESTINATIONS, PHOTOS, type DestinationCategory } from "@/content/destinations";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Places to Visit in Nashik",
  description:
    "A guide to the best places to visit in and around Nashik — Trimbakeshwar, Ramkund, Pandavleni Caves, Sula Vineyards, Harihar Fort, Bhandardara and more — with cabs from Pandav Tours & Travel.",
  alternates: { canonical: "/explore-nashik" },
};

const CATEGORIES: DestinationCategory[] = ["Spiritual", "Heritage", "Nature", "Experiences"];

export default function ExploreNashikPage() {
  return (
    <>
      <PageHero
        eyebrow="Explore Nashik"
        title="Best places to visit in and around Nashik"
        intro="The city of temples on the Godavari is also India's wine capital and a gateway to the Sahyadri hills. Here are our favourite trips — we'll get you there comfortably."
        photo={PHOTOS.godavariGhats}
      >
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Places by type">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <span className="inline-block rounded-full border border-paper/30 bg-ink/40 px-3 py-1 text-sm backdrop-blur">
                {category} · {DESTINATIONS.filter((d) => d.category === category).length}
              </span>
            </li>
          ))}
        </ul>
      </PageHero>

      <Container className="py-14 sm:py-20">
        <p className="max-w-2xl text-sm text-muted">
          Distances are approximate road distances from central Nashik. Timings and access can change with the season
          and local festivals — ask us when you book.
        </p>
        <ol className="mt-12 space-y-16 sm:space-y-24">
          {DESTINATIONS.map((destination, index) => (
            <li
              key={destination.slug}
              id={destination.slug}
              className="grid scroll-mt-24 items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <div className={cn("group relative aspect-[4/3] overflow-hidden rounded-card shadow-card-hover", index % 2 === 1 && "lg:order-2")}>
                <Image
                  src={destination.photo.src}
                  alt={destination.photo.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">
                  {destination.category} · {destination.distance}
                </p>
                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{destination.name}</h2>
                <p className="mt-2 text-lg font-medium text-ink-muted">{destination.tagline}</p>
                <p className="mt-4 text-muted">{destination.body}</p>
                <dl className="mt-6 inline-flex flex-col rounded-card border border-line bg-surface px-4 py-3 text-sm">
                  <dt className="font-semibold">Best time to visit</dt>
                  <dd className="text-muted">{destination.bestTime}</dd>
                </dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href="/book-cab">
                    Book a cab<span className="sr-only"> to {destination.name}</span>
                  </ButtonLink>
                  <ButtonLink href="/contact" variant="outline">
                    Plan a custom trip
                  </ButtonLink>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>

      <CallToAction
        title="Make a day of it"
        body="Combine Trimbakeshwar, Anjaneri and Pandavleni in one trip, or head out for a weekend in the hills. Tell us your plan and we'll quote the full fare up front."
      />

      <Section id="photo-credits" title="Photo credits" intro="Photos from Wikimedia Commons, used under the licences shown. Thank you to the photographers.">
        <PhotoCredits />
      </Section>
    </>
  );
}

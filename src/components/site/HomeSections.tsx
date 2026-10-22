import Image from "next/image";
import Link from "next/link";
import { PHOTOS, type Photo } from "@/content/destinations";
import { cn } from "@/lib/utils";
import { CallButton, PhoneNumber, WhatsAppButton } from "./CallToBook";
import { ArrowRightIcon, PinIcon } from "./TaxiIcons";

/*
 * Homepage sections in an editorial travel style: a framed full-height hero
 * with large light type, tall photo cards that unveil on scroll, a booking
 * process beside a photo, and a closing call-to-action over a landscape.
 */

const HERO_LINES = ["Nashik's taxi,", "one call", "away."];

const HERO_TAGS = [
  { label: "Trimbakeshwar", href: "/explore-nashik#trimbakeshwar" },
  { label: "Shirdi", href: "/tour-packages/shirdi-darshan" },
  { label: "Sula Vineyards", href: "/explore-nashik#sula-vineyards" },
];

/** Framed, full-height hero. Bookings are by phone, so the call is the primary action. */
export function HeroFrame() {
  return (
    <section className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="on-dark relative isolate flex min-h-[min(calc(100svh-5rem),54rem)] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-ink text-paper sm:rounded-[2.25rem]">
        <div aria-hidden="true" className="parallax absolute inset-0 -z-10">
          <Image
            src={PHOTOS.anjaneri.src}
            alt=""
            fill
            preload
            placeholder="blur"
            sizes="100vw"
            className="animate-hero-zoom object-cover"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(17_17_17/0.6),rgb(17_17_17/0.15)_55%,transparent),linear-gradient(to_bottom,rgb(17_17_17/0.45),rgb(17_17_17/0.1)_40%,rgb(17_17_17/0.25)_65%,rgb(17_17_17/0.75))]"
        />

        <div className="px-6 pt-14 sm:px-12 sm:pt-20 lg:px-16">
          <p className="animate-fade-up text-xs font-semibold tracking-[0.3em] text-gold uppercase sm:text-sm">
            Taxi service in Nashik
          </p>
          <h1 className="mt-5 font-heading text-[2.9rem] leading-[0.98] font-light tracking-tight sm:text-7xl lg:text-[6.5rem]">
            {HERO_LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span
                  className={cn("block animate-rise", i === 1 && "text-gold")}
                  style={{ animationDelay: `${150 + i * 120}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p
            className="mt-6 max-w-md animate-fade-up text-base text-paper/85 sm:text-lg"
            style={{ animationDelay: "550ms" }}
          >
            Outstation trips, local rentals, airport and station transfers, and Shirdi tours — call or WhatsApp, and we
            confirm your cab and full fare on the spot.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "680ms" }}>
            <CallButton size="lg" className="bg-paper text-ink hover:bg-gold">
              Call to book
            </CallButton>
            <WhatsAppButton
              size="lg"
              variant="ghost"
              className="border border-paper/40 bg-paper/10 text-paper backdrop-blur-md hover:bg-paper/20"
            />
          </div>
        </div>

        <div
          className="flex animate-fade-up flex-col gap-5 px-6 pt-10 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-12 sm:pb-10 lg:px-16"
          style={{ animationDelay: "820ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {[PHOTOS.trimbakeshwarCourtyard, PHOTOS.shirdiChawadi, PHOTOS.sulaVines].map((photo) => (
                <span key={photo.credit.source} className="relative size-10 overflow-hidden rounded-full ring-2 ring-paper">
                  <Image src={photo.src} alt="" fill sizes="40px" className="object-cover" />
                </span>
              ))}
            </div>
            <p className="text-sm leading-tight">
              <span className="block font-semibold">Book by phone</span>
              <PhoneNumber className="text-sm font-semibold text-paper/80" />
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <ul className="flex flex-wrap gap-2" aria-label="Popular trips">
              {HERO_TAGS.map((tag) => (
                <li key={tag.href}>
                  <Link
                    href={tag.href}
                    className="inline-flex h-9 items-center rounded-full border border-paper/30 bg-paper/10 px-4 text-sm backdrop-blur-md transition-colors hover:bg-paper hover:text-ink"
                  >
                    {tag.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-xs text-paper/60">
              Anjaneri in the monsoon ·{" "}
              <Link href="/explore-nashik#photo-credits" className="underline-offset-2 hover:underline">
                Photo credits
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type Card = { title: string; meta: string; href: string; photo: Photo };

/** Tall portrait photo card that unveils as it scrolls into view. */
function TallCard({ card, className }: { card: Card; className?: string }) {
  return (
    <Link
      href={card.href}
      className={cn("reveal-clip group relative block overflow-hidden rounded-3xl bg-ink text-paper", className)}
    >
      <div className="reveal-zoom absolute inset-0">
        <Image
          src={card.photo.src}
          alt={card.photo.alt}
          fill
          placeholder="blur"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
        <div>
          <p className="text-xl font-medium sm:text-2xl">{card.title}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-paper/80">
            <PinIcon className="size-3.5" />
            {card.meta}
          </p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper/15 backdrop-blur-md transition-colors group-hover:bg-gold group-hover:text-ink">
          <ArrowRightIcon className="size-5 -rotate-45" />
        </span>
      </div>
    </Link>
  );
}

const SHOWCASE: Card[] = [
  { title: "Harihar Fort", meta: "≈ 45 km · trek", href: "/explore-nashik#harihar-fort", photo: PHOTOS.harihar },
  {
    title: "Trimbakeshwar",
    meta: "≈ 30 km · Jyotirlinga",
    href: "/explore-nashik#trimbakeshwar",
    photo: PHOTOS.trimbakeshwarMonsoon,
  },
  { title: "Saptashrungi", meta: "≈ 60 km · temple", href: "/explore-nashik#saptashrungi", photo: PHOTOS.saptashrungi },
];

/** Three tall photo cards. */
export function ExploreShowcase() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {SHOWCASE.map((card, i) => (
        <li key={card.href} className={cn(i === 2 && "sm:col-span-2 lg:col-span-1")}>
          <TallCard card={card} className={cn("aspect-[4/5]", i === 2 && "sm:aspect-[16/9] lg:aspect-[4/5]")} />
        </li>
      ))}
    </ul>
  );
}

const CATEGORIES: { title: string; href: string; photo: Photo }[] = [
  { title: "Temples", href: "/explore-nashik#kalaram-temple", photo: PHOTOS.kalaram },
  { title: "Caves & forts", href: "/explore-nashik#pandavleni-caves", photo: PHOTOS.pandavleni },
  { title: "Waterfalls", href: "/explore-nashik#dugarwadi-waterfall", photo: PHOTOS.dugarwadi },
  { title: "Vineyards", href: "/explore-nashik#sula-vineyards", photo: PHOTOS.sulaVines },
];

/** 2×2 category tiles with a label and a small pill on each photo. */
export function CategoryTiles() {
  return (
    <ul className="reveal-stagger grid grid-cols-2 gap-3 sm:gap-4">
      {CATEGORIES.map((c) => (
        <li key={c.title}>
          <Link href={c.href} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-ink text-paper">
            <Image
              src={c.photo.src}
              alt={c.photo.alt}
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 sm:p-5">
              <span className="text-base font-medium sm:text-xl">{c.title}</span>
              <span className="hidden h-8 items-center rounded-full bg-paper px-3 text-xs font-semibold text-ink transition-colors group-hover:bg-gold sm:inline-flex">
                See places
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const POPULAR: Card[] = [
  { title: "Shirdi darshan", meta: "Same day · ≈ 90 km", href: "/tour-packages/shirdi-darshan", photo: PHOTOS.shirdiChawadi },
  {
    title: "Trimbakeshwar & Anjaneri",
    meta: "Half day · ≈ 30 km",
    href: "/explore-nashik#trimbakeshwar",
    photo: PHOTOS.trimbakeshwarCourtyard,
  },
  { title: "Sula Vineyards", meta: "Evening · ≈ 15 km", href: "/explore-nashik#sula-vineyards", photo: PHOTOS.sulaEstate },
  { title: "Bhandardara", meta: "Weekend · ≈ 75 km", href: "/explore-nashik#bhandardara", photo: PHOTOS.bhandardara },
];

/** Row of four trip cards: photo above, details below. */
export function PopularTrips() {
  return (
    <ul className="reveal-stagger grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-6">
      {POPULAR.map((trip) => (
        <li key={trip.href}>
          <Link href={trip.href} className="group block">
            <span className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-surface">
              <Image
                src={trip.photo.src}
                alt={trip.photo.alt}
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </span>
            <span className="mt-4 flex items-start justify-between gap-2">
              <span>
                <span className="block font-semibold sm:text-lg">{trip.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{trip.meta}</span>
              </span>
              <ArrowRightIcon className="mt-1 size-5 shrink-0 text-gold-ink transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const PROCESS = [
  { title: "Call or WhatsApp us", body: "Tell us where you're going, when, and how many of you are travelling." },
  { title: "Get the right cab", body: "We suggest a vehicle that fits your group and luggage." },
  { title: "Fare confirmed upfront", body: "The full fare — tolls, allowances and taxes — before you travel." },
  { title: "Ride", body: "Your cab picks you up at the agreed time and place." },
];

/** Booking process: a photo beside numbered steps. */
export function BookingProcess() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="reveal-clip relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[4/3] lg:aspect-[4/5]">
        <div className="reveal-zoom absolute inset-0">
          <Image
            src={PHOTOS.godavariGhats.src}
            alt={PHOTOS.godavariGhats.alt}
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-paper/90 p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
          <p className="text-sm text-muted">Call us to book</p>
          <PhoneNumber className="text-xl text-ink sm:text-2xl" />
        </div>
      </div>
      <div>
        <p className="reveal text-xs font-semibold tracking-[0.25em] text-gold-ink uppercase">How it works</p>
        <h2 id="process-heading" className="reveal mt-3 text-3xl leading-[1.1] font-medium tracking-tight sm:text-5xl">
          Booking a cab takes one call
        </h2>
        <ol className="reveal-stagger mt-10 divide-y divide-line border-y border-line">
          {PROCESS.map((step, i) => (
            <li key={step.title} className="flex gap-5 py-5">
              <span className="font-heading text-2xl font-light text-gold-ink tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="reveal mt-8 flex flex-wrap gap-3">
          <CallButton size="lg">Call to book</CallButton>
          <WhatsAppButton size="lg" />
        </div>
      </div>
    </div>
  );
}

/** Closing call-to-action over a landscape that fades in from the page. */
export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="relative isolate overflow-hidden pt-24 pb-28 sm:pt-32 sm:pb-40">
      <div aria-hidden="true" className="parallax absolute inset-0 -z-20">
        <Image src={PHOTOS.kalsubai.src} alt="" fill placeholder="blur" sizes="100vw" className="object-cover" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-paper)_0%,rgb(255_255_255/0.85)_30%,rgb(17_17_17/0.25)_75%,rgb(17_17_17/0.55))]"
      />
      <div className="reveal mx-auto max-w-3xl px-4 text-center">
        <p className="text-xs font-semibold tracking-[0.25em] text-gold-ink uppercase">Ready when you are</p>
        <h2 id="final-cta-heading" className="mt-3 text-4xl leading-[1.05] font-medium tracking-tight sm:text-6xl">
          Explore your favourite places — book your cab now
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-ink-muted">
          Temples, forts, vineyards and Shirdi, all within a comfortable drive. One call and your trip is sorted.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CallButton size="lg" variant="dark">
            Call to book
          </CallButton>
          <WhatsAppButton size="lg" className="bg-paper" />
        </div>
      </div>
    </section>
  );
}

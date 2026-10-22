import Image from "next/image";
import Link from "next/link";
import { PHOTOS, type Photo } from "@/content/destinations";
import { cn } from "@/lib/utils";
import { CallButton, PhoneNumber, WhatsAppButton } from "./CallToBook";
import { ArrowRightIcon, CarIcon, ClockIcon, PinIcon, PlaneIcon, RoundTripIcon, TrainIcon } from "./TaxiIcons";

/*
 * Homepage sections in an editorial travel style: a framed full-height hero
 * with large light type, tall photo cards that unveil on scroll, a booking
 * process beside a photo, and a closing call-to-action over a landscape.
 */

/** Destinations the headline cycles through ("Nashik taxi to …"). */
const HERO_WORDS = ["Shirdi.", "Mumbai.", "Trimbakeshwar.", "Pune.", "the airport."];

/** Popular routes in the hero panel. Distances are approximate road km from Nashik. */
const HERO_ROUTES = [
  { to: "Shirdi", note: "Sai Baba darshan", km: "≈ 90 km", href: "/tour-packages/shirdi-darshan" },
  { to: "Mumbai", note: "City & airport drops", km: "≈ 170 km", href: "/outstation-cab" },
  { to: "Pune", note: "One way or round trip", km: "≈ 210 km", href: "/outstation-cab" },
  { to: "Trimbakeshwar", note: "Jyotirlinga darshan", km: "≈ 30 km", href: "/explore-nashik#trimbakeshwar" },
];

const HERO_SERVICES = [
  { label: "Outstation", href: "/outstation-cab", icon: RoundTripIcon },
  { label: "Local rental", href: "/local-cab", icon: ClockIcon },
  { label: "Airport", href: "/airport-transfer", icon: PlaneIcon },
  { label: "Railway station", href: "/railway-station-transfer", icon: TrainIcon },
];

/** Framed, full-height hero. Bookings are by phone, so the call is the primary action. */
export function HeroFrame() {
  return (
    <section className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="on-dark relative isolate flex min-h-[calc(100svh-5rem)] md:min-h-[min(calc(100svh-7.5rem),52rem)] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-ink text-paper sm:rounded-[2.25rem]">
        <div aria-hidden="true" className="parallax absolute inset-0 -z-10">
          <Image
            src={PHOTOS.harihar.src}
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
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(17_17_17/0.72),rgb(17_17_17/0.3)_55%,rgb(17_17_17/0.15)),linear-gradient(to_bottom,rgb(17_17_17/0.45),rgb(17_17_17/0.05)_40%,rgb(17_17_17/0.2)_65%,rgb(17_17_17/0.8))]"
        />

        <div className="grid gap-10 px-6 pt-12 sm:px-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_23rem] lg:items-end lg:gap-12 lg:px-16 lg:pt-14">
          <div>
            <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-paper/25 bg-paper/10 py-1 pr-3 pl-1 text-xs font-semibold backdrop-blur-md sm:text-sm">
              <span className="grid size-6 place-items-center rounded-full bg-gold text-ink">
                <CarIcon className="size-3.5" />
              </span>
              Taxi service in Nashik · book by phone
            </p>

            <h1 className="mt-6 font-heading text-[2.6rem] leading-[1.02] font-light tracking-tight sm:text-6xl md:text-7xl lg:text-[3.4rem] xl:text-[5.25rem]">
              <span className="sr-only">Nashik taxi to Shirdi, Mumbai, Trimbakeshwar, Pune and the airport</span>
              <span aria-hidden="true" className="block overflow-hidden pb-[0.08em]">
                <span className="block animate-rise" style={{ animationDelay: "150ms" }}>
                  Nashik taxi to
                </span>
              </span>
              <span aria-hidden="true" className="block h-[1.1em] overflow-hidden">
                <span className="block animate-rise" style={{ animationDelay: "280ms" }}>
                  <span className="block animate-word-cycle font-normal text-gold">
                    {[...HERO_WORDS, HERO_WORDS[0]].map((word, i) => (
                      <span key={i} className="block h-[1.1em] whitespace-nowrap">
                        {word}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </h1>

            <p
              className="mt-6 max-w-lg animate-fade-up text-base text-paper/85 sm:text-lg"
              style={{ animationDelay: "500ms" }}
            >
              One call books your cab — outstation, local rentals, airport and station transfers. We confirm the
              vehicle and the full fare on the spot.
            </p>

            <div
              className="mt-8 grid animate-fade-up grid-cols-2 gap-3 sm:flex sm:flex-wrap"
              style={{ animationDelay: "620ms" }}
            >
              <CallButton size="lg" className="bg-gold px-5 text-ink hover:bg-paper sm:px-7">
                Call to book
              </CallButton>
              <WhatsAppButton
                size="lg"
                variant="ghost"
                className="border border-paper/40 bg-paper/10 px-5 text-paper backdrop-blur-md hover:bg-paper/20 sm:px-7"
              />
            </div>
            <p className="mt-4 animate-fade-up text-sm text-paper/75" style={{ animationDelay: "700ms" }}>
              <PhoneNumber className="font-semibold text-paper" fallback="Call or WhatsApp us to book your cab" />
            </p>
          </div>

          {/* Popular routes — glass panel */}
          <div
            className="animate-fade-up rounded-3xl border border-paper/20 bg-ink/35 p-2 backdrop-blur-xl"
            style={{ animationDelay: "760ms" }}
          >
            <div className="flex items-center justify-between px-3 pt-2 pb-3">
              <p className="font-semibold">Where to?</p>
              <p className="text-xs text-paper/65">From Nashik</p>
            </div>
            <ul className="space-y-1">
              {HERO_ROUTES.map((r) => (
                <li key={r.to}>
                  <Link
                    href={r.href}
                    className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-paper/10"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper/10 text-gold">
                      <PinIcon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-semibold">{r.to}</span>
                        <span className="shrink-0 text-xs text-paper/70 tabular-nums">{r.km}</span>
                      </span>
                      <span className="block truncate text-xs text-paper/65">{r.note}</span>
                    </span>
                    <ArrowRightIcon className="size-4 shrink-0 text-paper/50 transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3 text-ink">
              <p className="text-sm leading-tight">
                <span className="block font-semibold">Any other trip?</span>
                <span className="text-xs text-muted">Fare confirmed on the call</span>
              </p>
              <CallButton size="sm" variant="dark">
                Call
              </CallButton>
            </div>
          </div>
        </div>

        <div
          className="flex animate-fade-up flex-col gap-4 px-6 pt-10 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-12 sm:pb-8 sm:pr-24 lg:px-16 lg:pr-28"
          style={{ animationDelay: "880ms" }}
        >
          <ul className="flex flex-wrap gap-2" aria-label="Cab services">
            {HERO_SERVICES.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-paper/25 bg-paper/10 px-4 text-sm backdrop-blur-md transition-colors hover:bg-paper hover:text-ink"
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-6">
            <span aria-hidden="true" className="hidden items-center gap-3 text-xs tracking-[0.2em] whitespace-nowrap text-paper/70 uppercase xl:flex">
              <span className="relative h-10 w-px overflow-hidden bg-paper/25">
                <span className="absolute inset-x-0 top-0 h-1/3 animate-scroll-cue bg-gold" />
              </span>
              Scroll to explore
            </span>
            <p className="text-xs text-paper/60">
              Harihar Fort ·{" "}
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

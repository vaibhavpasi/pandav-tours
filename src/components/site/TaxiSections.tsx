import Link from "next/link";
import { PhoneIcon } from "@/components/layout/Icons";
import { Container } from "@/components/ui";
import { CallButton, PhoneNumber, WhatsAppButton } from "./CallToBook";
import {
  CarIcon,
  ClockIcon,
  HeadsetIcon,
  PlaneIcon,
  ReceiptIcon,
  RoundTripIcon,
  TempleIcon,
  TrainIcon,
} from "./TaxiIcons";

const TRIPS = [
  { href: "/outstation-cab", label: "Outstation", sub: "One way & round trip", icon: RoundTripIcon },
  { href: "/local-cab", label: "Local rental", sub: "By hours & km", icon: ClockIcon },
  { href: "/airport-transfer", label: "Airport", sub: "Pickups & drops", icon: PlaneIcon },
  { href: "/railway-station-transfer", label: "Railway", sub: "Nashik Road station", icon: TrainIcon },
  { href: "/tour-packages/shirdi-darshan", label: "Shirdi tour", sub: "Same-day darshan", icon: TempleIcon },
];

/**
 * Hero booking card. Bookings are taken by phone, so the one prominent action
 * is the call; WhatsApp is the secondary channel, and the trip tiles below
 * lead to details for each kind of trip.
 */
export function HeroBookingCard() {
  return (
    <div className="rounded-[1.75rem] bg-paper p-4 text-ink shadow-[0_24px_60px_-12px_rgb(0_0_0/0.45)] sm:p-6">
      <div className="flex flex-col gap-5 rounded-2xl bg-gold-soft p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-gold">
            <PhoneIcon className="size-7" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gold-ink">Book your cab with one call</p>
            <PhoneNumber className="text-2xl text-ink sm:text-3xl" />
            <p className="text-sm text-muted">We confirm your cab and the full fare on the call.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <CallButton size="lg" className="w-full sm:w-auto">
            Call now
          </CallButton>
          <WhatsAppButton size="lg" className="w-full bg-paper sm:w-auto" />
        </div>
      </div>
      <p className="mt-5 text-sm font-semibold text-muted">What do you need?</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TRIPS.map(({ href, label, sub, icon: Icon }) => (
          <li key={href} className="last:col-span-2 sm:last:col-span-1">
            <Link
              href={href}
              className="group flex h-full min-h-20 items-center gap-3 rounded-2xl border border-line p-3 transition-[border-color,background-color,transform] duration-200 hover:border-ink hover:bg-surface active:scale-[0.98]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold">{label}</span>
                <span className="block text-xs text-muted">{sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Bookings are taken by phone; these points describe that service.
const TRUST_POINTS = [
  { icon: PhoneIcon, title: "One call to book", body: "No forms, no apps, no sign-up" },
  { icon: ReceiptIcon, title: "Fare upfront", body: "Full fare confirmed on the call" },
  { icon: CarIcon, title: "Nashik-based team", body: "We know the city and the routes" },
  { icon: HeadsetIcon, title: "Real people", body: "Talk to us — call or WhatsApp" },
];

/** Row of reassurance points directly under the hero, like the trust bars on big travel sites. */
export function TrustStrip() {
  return (
    <section aria-label="Why book with us" className="border-b border-line bg-paper">
      <Container>
        <ul className="reveal-stagger grid grid-cols-2 gap-x-4 gap-y-6 py-8 md:grid-cols-4 md:py-10">
          {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-soft text-gold-ink">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

const STEPS = [
  {
    icon: PhoneIcon,
    title: "Call or WhatsApp us",
    body: "Tell us where you're going, when, and how many of you are travelling.",
  },
  {
    icon: ReceiptIcon,
    title: "Get your fare confirmed",
    body: "We suggest the right cab and confirm the full fare — including tolls, allowances and taxes — before you travel.",
  },
  {
    icon: CarIcon,
    title: "Ride",
    body: "Your cab picks you up at the agreed time and place. Questions on the way? We're a call away.",
  },
];

/** Three-step explainer of the booking flow. */
export function HowItWorks() {
  return (
    <ol className="reveal-stagger relative grid gap-8 md:grid-cols-3 md:gap-6">
      <span
        aria-hidden="true"
        className="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-gold/60 md:block"
      />
      {STEPS.map(({ icon: Icon, title, body }, index) => (
        <li key={title} className="relative flex flex-col items-center text-center">
          <span className="relative grid size-14 place-items-center rounded-full bg-ink text-gold shadow-card-hover">
            <Icon className="size-6" />
            <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-gold text-xs font-extrabold text-ink">
              {index + 1}
            </span>
          </span>
          <h3 className="mt-5 text-lg font-bold">{title}</h3>
          <p className="mt-2 max-w-xs text-sm text-muted">{body}</p>
        </li>
      ))}
    </ol>
  );
}

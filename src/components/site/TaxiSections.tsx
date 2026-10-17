import Link from "next/link";
import { ButtonLink, Container } from "@/components/ui";
import {
  ArrowRightIcon,
  CarIcon,
  ClockIcon,
  HeadsetIcon,
  PlaneIcon,
  ReceiptIcon,
  RoundTripIcon,
  SearchIcon,
  ShieldIcon,
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
 * Hero card shown when the online catalogue has no routes yet: the same
 * "choose your trip" first step as the search widget, as large tap targets.
 */
export function TripPicker() {
  return (
    <div className="rounded-[1.75rem] bg-paper p-4 text-ink shadow-[0_24px_60px_-12px_rgb(0_0_0/0.45)] sm:p-6">
      <p className="text-lg font-bold">Where are you headed?</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TRIPS.map(({ href, label, sub, icon: Icon }) => (
          <li key={href} className="last:col-span-2 sm:last:col-span-1">
            <Link
              href={href}
              className="group flex h-full min-h-24 flex-col justify-between gap-3 rounded-2xl border border-line p-4 transition-[border-color,background-color,transform] duration-200 hover:border-ink hover:bg-gold-soft active:scale-[0.98]"
            >
              <span className="grid size-10 place-items-center rounded-full bg-ink text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-bold">{label}</span>
                <span className="block text-xs text-muted">{sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Tell us your trip and we&apos;ll confirm the full fare before you pay.</p>
        <ButtonLink href="/book-cab" size="lg" className="w-full shrink-0 sm:w-auto">
          Get a fare
          <ArrowRightIcon className="size-5" />
        </ButtonLink>
      </div>
    </div>
  );
}

// Every point here restates something the site already guarantees elsewhere
// (fare breakdown, Razorpay checkout, Nashik-based team, call/WhatsApp help).
const TRUST_POINTS = [
  { icon: ReceiptIcon, title: "Itemised fares", body: "Every charge shown before you pay" },
  { icon: ShieldIcon, title: "Secure payment", body: "Card details stay on Razorpay" },
  { icon: CarIcon, title: "Nashik-based team", body: "We know the city and the routes" },
  { icon: HeadsetIcon, title: "Real people", body: "Call or WhatsApp with your PT- ref" },
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
    icon: SearchIcon,
    title: "Search your trip",
    body: "Pick one way, round trip, local rental or a transfer, then choose your route, date and time.",
  },
  {
    icon: ReceiptIcon,
    title: "Compare cabs & fares",
    body: "See every vehicle with its full fare — base fare, allowances, taxes and anything paid at actuals.",
  },
  {
    icon: CarIcon,
    title: "Pay & ride",
    body: "Pay securely online and get a PT- booking reference to check your booking status any time.",
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

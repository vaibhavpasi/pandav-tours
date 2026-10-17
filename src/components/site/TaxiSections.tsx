import { Container } from "@/components/ui";
import { CarIcon, HeadsetIcon, ReceiptIcon, SearchIcon, ShieldIcon } from "./TaxiIcons";

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
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 py-8 md:grid-cols-4 md:py-10">
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
    <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
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

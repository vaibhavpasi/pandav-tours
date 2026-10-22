import { PhoneIcon } from "@/components/layout/Icons";
import { Container } from "@/components/ui";
import { CarIcon, HeadsetIcon, ReceiptIcon } from "./TaxiIcons";

// Bookings are taken by phone; these points describe that service.
const TRUST_POINTS = [
  { icon: PhoneIcon, title: "One call to book", body: "No forms, no apps, no sign-up" },
  { icon: ReceiptIcon, title: "Fare upfront", body: "Full fare confirmed on the call" },
  { icon: CarIcon, title: "Nashik-based team", body: "We know the city and the routes" },
  { icon: HeadsetIcon, title: "Real people", body: "Talk to us — call or WhatsApp" },
];

/** Row of reassurance points directly under the hero. */
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

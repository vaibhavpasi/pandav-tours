/**
 * Site-wide display configuration.
 *
 * Contact details come from environment variables for now and move to the
 * admin-editable business_settings table in Phase 4. Nothing here is
 * invented: if a value is not configured, the UI hides that element.
 */
import { publicEnv } from "@/lib/env";

export function businessContact() {
  const env = publicEnv();
  return {
    name: env.NEXT_PUBLIC_APP_NAME ?? "Pandav Tours & Travel",
    phone: env.NEXT_PUBLIC_BUSINESS_PHONE ?? null,
    whatsapp: env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? null,
    email: env.NEXT_PUBLIC_BUSINESS_EMAIL ?? null,
  };
}

export const TAGLINE = "Your Trusted Cab & Travel Partner in Nashik";

export type NavLink = { href: string; label: string };

export const PRIMARY_NAV: NavLink[] = [
  { href: "/local-cab", label: "Local Cab" },
  { href: "/outstation-cab", label: "Outstation" },
  { href: "/airport-transfer", label: "Airport" },
  { href: "/tour-packages", label: "Tour Packages" },
  { href: "/explore-nashik", label: "Explore Nashik" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_SERVICES: NavLink[] = [
  { href: "/local-cab", label: "Local cab in Nashik" },
  { href: "/outstation-cab", label: "Outstation taxi" },
  { href: "/airport-transfer", label: "Airport transfer" },
  { href: "/railway-station-transfer", label: "Railway station transfer" },
  { href: "/tour-packages", label: "Tour packages" },
  { href: "/tour-packages/shirdi-darshan", label: "Shirdi tour from Nashik" },
  { href: "/cabs", label: "Our cabs" },
];

export const FOOTER_COMPANY: NavLink[] = [
  { href: "/about", label: "About us" },
  { href: "/explore-nashik", label: "Places to visit" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQs" },
  { href: "/booking-status", label: "Check booking status" },
];

export const FOOTER_LEGAL: NavLink[] = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms-and-conditions", label: "Terms & conditions" },
  { href: "/cancellation-refund-policy", label: "Cancellation & refund policy" },
];

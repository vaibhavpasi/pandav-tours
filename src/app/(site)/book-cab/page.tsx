import type { Metadata } from "next";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { CallBookingCard } from "@/components/site/CallToBook";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui";
import { PHOTOS } from "@/content/destinations";

export const metadata: Metadata = {
  title: "Book a Cab in Nashik",
  description:
    "Book a cab in Nashik with one call — local rentals, outstation trips, airport and railway transfers, with the full fare confirmed upfront.",
  alternates: { canonical: "/book-cab" },
};

/** Bookings are taken by phone; the form here only requests a call back. */
export default function BookCabPage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.sulaVines}
        eyebrow="Book a cab"
        title="Book your cab with one call"
        intro="Call or WhatsApp us with your trip. We'll suggest the right vehicle and confirm the full fare while you're on the line."
      />
      <Container className="py-10 sm:py-14">
        <CallBookingCard className="reveal mx-auto max-w-4xl" />

        <section aria-labelledby="callback-heading" className="reveal mx-auto mt-12 max-w-4xl">
          <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
            <h2 id="callback-heading" className="text-xl font-semibold">
              Can&apos;t call right now?
            </h2>
            <p className="mt-2 text-muted">Leave your number and trip details and we&apos;ll call you back to book.</p>
            <EnquiryForm className="mt-6" defaults={{ enquiryType: "cab" }} />
          </div>
        </section>
      </Container>
    </>
  );
}

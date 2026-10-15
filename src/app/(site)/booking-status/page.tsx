import type { Metadata } from "next";
import { StatusLookupForm } from "@/components/booking/StatusLookupForm";
import { PageHero } from "@/components/site/PageHero";
import { PHOTOS } from "@/content/destinations";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Check Booking Status",
  robots: { index: false, follow: true },
};

export default function BookingStatusPage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.kalsubai}
        eyebrow="Your booking"
        title="Check booking status"
        intro="Enter your booking reference and the mobile number you booked with."
      />
      <Container className="max-w-3xl py-12 sm:py-16">
        <StatusLookupForm />
      </Container>
    </>
  );
}

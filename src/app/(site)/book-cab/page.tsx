import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/BookingForm";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { PageHero } from "@/components/site/PageHero";
import { Container, LoadingBlock } from "@/components/ui";
import { getCatalog } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Book a Cab Online",
  description:
    "Book a cab in Nashik online — local rentals, outstation trips and transfers with an itemised fare before payment.",
  alternates: { canonical: "/book-cab" },
};

export default async function BookCabPage() {
  const catalog = await getCatalog();

  return (
    <>
      <PageHero
        eyebrow="Online booking"
        title="Book your cab"
        intro="Choose your trip, compare vehicles with the full fare, and confirm in a few steps."
      />
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          {catalog.routes.length ? (
            // useSearchParams (pre-fill from the homepage widget) needs a boundary.
            <Suspense fallback={<LoadingBlock label="Loading booking form…" lines={6} />}>
              <BookingForm
                routes={catalog.routes}
                termsVersion={catalog.settings.terms_version}
                maxAdvanceDays={catalog.settings.max_booking_advance_days}
              />
            </Suspense>
          ) : (
            <div className="rounded-card border border-line bg-surface p-6">
              <h2 className="text-xl font-semibold">Online booking is opening soon</h2>
              <p className="mt-2 text-muted">
                Send us your trip details and we&apos;ll confirm your fare, or call or WhatsApp us using the buttons on
                this page.
              </p>
              <EnquiryForm className="mt-6" defaults={{ enquiryType: "cab" }} />
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

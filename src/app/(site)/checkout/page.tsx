import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FareBreakdown } from "@/components/booking/FareBreakdown";
import { BookingPaymentStatusBadge, BookingStatusBadge, ButtonLink, Container, ErrorState, LoadingBlock } from "@/components/ui";
import { verifyBookingLinkToken } from "@/lib/booking/link-token";
import { getBookingForCheckout } from "@/lib/booking/service";
import type { BookingPaymentStatus, BookingStatus } from "@/lib/booking/states";
import { isSupabaseConfigured } from "@/lib/env";
import { bookingLinkSecret } from "@/lib/env.server";
import { formatDateTimeIST } from "@/lib/utils";
import { TRIP_TYPE_LABELS, type CabTripType } from "@/lib/validators/booking";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage(props: PageProps<"/checkout">) {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<LoadingBlock label="Loading your booking…" lines={8} />}>
          <CheckoutContent {...props} />
        </Suspense>
      </div>
    </Container>
  );
}

function InvalidLink() {
  return (
    <ErrorState
      title="This booking link isn't valid"
      description="The link may have expired or been copied incorrectly. You can look up your booking with its reference and your mobile number."
      action={<ButtonLink href="/booking-status">Check booking status</ButtonLink>}
    />
  );
}

async function CheckoutContent({ searchParams }: PageProps<"/checkout">) {
  const { b } = await searchParams;
  if (typeof b !== "string" || !isSupabaseConfigured()) return <InvalidLink />;

  const bookingId = verifyBookingLinkToken(b, bookingLinkSecret(), new Date());
  if (!bookingId) return <InvalidLink />;

  const booking = await getBookingForCheckout(bookingId);
  if (!booking) return <InvalidLink />;

  const tripName =
    booking.fare_snapshot.trip?.packageTitle ?? booking.fare_snapshot.trip?.routeName ?? booking.destination ?? "Trip";
  const tripTypeLabel =
    booking.trip_type === "package" ? "Tour package" : TRIP_TYPE_LABELS[booking.trip_type as CabTripType];
  const awaitingPayment = booking.booking_status === "pending_payment";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold tracking-widest text-gold-ink uppercase">Booking reference</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold">{booking.booking_reference}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <BookingStatusBadge status={booking.booking_status as BookingStatus} />
          <BookingPaymentStatusBadge status={booking.payment_status as BookingPaymentStatus} />
        </div>
        <p className="mt-3 text-sm text-muted">Save this reference — you&apos;ll need it to check or change your booking.</p>
      </div>

      <section aria-labelledby="trip-heading" className="rounded-card border border-line p-5">
        <h2 id="trip-heading" className="text-lg font-semibold">
          Trip details
        </h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
          <dt className="font-semibold">Trip</dt>
          <dd>
            {tripName} · {tripTypeLabel}
          </dd>
          {booking.fare_snapshot.vehicleCategory ? (
            <>
              <dt className="font-semibold">Vehicle</dt>
              <dd>{booking.fare_snapshot.vehicleCategory.name}</dd>
            </>
          ) : null}
          <dt className="font-semibold">Pickup</dt>
          <dd>
            {formatDateTimeIST(booking.pickup_at)} · {booking.pickup_location}
          </dd>
          {booking.destination ? (
            <>
              <dt className="font-semibold">Drop</dt>
              <dd>{booking.destination}</dd>
            </>
          ) : null}
          {booking.return_at ? (
            <>
              <dt className="font-semibold">Return</dt>
              <dd>{formatDateTimeIST(booking.return_at)}</dd>
            </>
          ) : null}
          <dt className="font-semibold">Passengers</dt>
          <dd>{booking.passenger_count}</dd>
          <dt className="font-semibold">Name</dt>
          <dd>{booking.contact_name}</dd>
        </dl>
      </section>

      <section aria-labelledby="fare-heading" className="rounded-card border border-line p-5">
        <h2 id="fare-heading" className="mb-4 text-lg font-semibold">
          Fare
        </h2>
        <FareBreakdown fare={booking.fare_snapshot} />
      </section>

      {awaitingPayment ? (
        <section className="rounded-card border-2 border-gold bg-gold-soft p-5" aria-labelledby="pay-heading">
          <h2 id="pay-heading" className="text-lg font-semibold">
            Payment
          </h2>
          {booking.payment_expires_at ? (
            <p className="mt-1 text-sm text-ink-muted">
              Please complete payment by {formatDateTimeIST(booking.payment_expires_at)}. Unpaid bookings are released
              automatically and nothing is charged.
            </p>
          ) : null}
          {/* Phase 3: Razorpay order creation + hosted checkout replace this notice. */}
          <p className="mt-3 text-sm font-medium text-ink">
            Online payment is being set up. We have received your booking and will contact you to confirm it.
          </p>
        </section>
      ) : null}

      <p className="text-sm text-muted">
        Questions? <Link href="/contact" className="font-semibold underline">Contact us</Link> and quote{" "}
        {booking.booking_reference}.
      </p>
    </div>
  );
}

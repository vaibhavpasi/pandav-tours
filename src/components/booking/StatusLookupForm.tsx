"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { BookingPaymentStatusBadge, BookingStatusBadge, Button, describedBy, Field, Input } from "@/components/ui";
import type { BookingPaymentStatus, BookingStatus } from "@/lib/booking/states";
import { formatDateTimeIST, formatPaise } from "@/lib/utils";
import { statusLookupSchema, type StatusLookupInput } from "@/lib/validators/booking";
import { postJson } from "./api-client";

type StatusResult = {
  booking_reference: string;
  booking_status: BookingStatus;
  payment_status: BookingPaymentStatus;
  route_name: string | null;
  package_title: string | null;
  vehicle_category: string | null;
  pickup_at: string;
  return_at: string | null;
  total_amount_paise: number;
  payment_expires_at: string | null;
};

export function StatusLookupForm() {
  const id = useId();
  const [result, setResult] = useState<StatusResult | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<StatusLookupInput, unknown, { reference: string; phone: string }>({
    resolver: zodResolver(statusLookupSchema),
    mode: "onTouched",
    defaultValues: { reference: "", phone: "" },
  });
  const errors = formState.errors;

  const onSubmit = handleSubmit(async (values) => {
    setBanner(null);
    setResult(null);
    const response = await postJson<{ booking: StatusResult }>("/api/bookings/status", values);
    if (response.ok) setResult(response.data.booking);
    else setBanner(response.message);
  });

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id={`${id}-ref`}
            label="Booking reference"
            hint="For example PT-ABCD2345"
            required
            error={errors.reference?.message}
          >
            <Input
              id={`${id}-ref`}
              autoCapitalize="characters"
              spellCheck={false}
              invalid={!!errors.reference}
              aria-describedby={describedBy(`${id}-ref`, { hint: true, error: errors.reference })}
              {...register("reference")}
            />
          </Field>
          <Field
            id={`${id}-phone`}
            label="Mobile number used for booking"
            required
            error={errors.phone?.message}
          >
            <Input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              invalid={!!errors.phone}
              aria-describedby={describedBy(`${id}-phone`, { error: errors.phone })}
              {...register("phone")}
            />
          </Field>
        </div>
        <Button type="submit" loading={formState.isSubmitting} loadingText="Checking…">
          Check status
        </Button>
      </form>

      <div aria-live="polite">
        {banner ? (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {banner}
          </div>
        ) : null}
        {result ? (
          <section className="rounded-card border border-line p-5" aria-label="Booking status">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-heading text-xl font-bold">{result.booking_reference}</p>
              <div className="flex gap-2">
                <BookingStatusBadge status={result.booking_status} />
                <BookingPaymentStatusBadge status={result.payment_status} />
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
              <dt className="font-semibold">Trip</dt>
              <dd>{result.package_title ?? result.route_name ?? "—"}</dd>
              {result.vehicle_category ? (
                <>
                  <dt className="font-semibold">Vehicle</dt>
                  <dd>{result.vehicle_category}</dd>
                </>
              ) : null}
              <dt className="font-semibold">Pickup</dt>
              <dd>{formatDateTimeIST(result.pickup_at)}</dd>
              {result.return_at ? (
                <>
                  <dt className="font-semibold">Return</dt>
                  <dd>{formatDateTimeIST(result.return_at)}</dd>
                </>
              ) : null}
              <dt className="font-semibold">Amount</dt>
              <dd>{formatPaise(result.total_amount_paise)}</dd>
            </dl>
            {result.booking_status === "pending_payment" ? (
              <p className="mt-4 rounded-xl bg-warning-soft p-3 text-sm text-warning">
                This booking is waiting for payment. Use the link from your booking confirmation, or contact us
                and quote your reference.
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Checkbox, describedBy, Field, Input, Textarea } from "@/components/ui";
import { calculatePackageFare } from "@/lib/booking/fare";
import { addDaysToIsoDate, istToday } from "@/lib/booking/time";
import type { PublicPackage } from "@/lib/data/catalog";
import { formatPaise } from "@/lib/utils";
import { packageBookingSchema, type PackageBookingInput, type PackageBookingRequest } from "@/lib/validators/booking";
import { postJson } from "./api-client";
import { FareBreakdown } from "./FareBreakdown";

/**
 * Booking form for fixed-price packages. The price shown here is computed
 * with the same engine as the server, from published package data; the
 * server recomputes it and rejects the booking if it differs.
 */
export function PackageBookingForm({
  pkg,
  termsVersion,
  maxAdvanceDays,
}: {
  pkg: Pick<PublicPackage, "id" | "title" | "price_paise" | "price_basis" | "tax_rate_bps">;
  termsVersion: string;
  maxAdvanceDays: number;
}) {
  const id = useId();
  const router = useRouter();
  const [banner, setBanner] = useState<string | null>(null);
  const [bounds, setBounds] = useState<{ min: string; max: string } | null>(null);

  useEffect(() => {
    const today = istToday(new Date());
    setBounds({ min: today, max: addDaysToIsoDate(today, maxAdvanceDays) });
  }, [maxAdvanceDays]);

  const { register, handleSubmit, formState, watch, setError } = useForm<
    PackageBookingInput,
    unknown,
    PackageBookingRequest
  >({
    resolver: zodResolver(packageBookingSchema),
    mode: "onTouched",
    defaultValues: {
      packageId: pkg.id,
      pickupLocation: "",
      pickupDate: "",
      pickupTime: "",
      passengers: 1,
      name: "",
      phone: "",
      email: "",
      specialInstructions: "",
      acceptTerms: false as unknown as true,
      termsVersion,
      quotedTotalPaise: 0,
      website: "",
    },
  });
  const errors = formState.errors;
  const passengers = Number(watch("passengers"));
  const fare =
    pkg.price_paise !== null && Number.isInteger(passengers) && passengers >= 1 && passengers <= 60
      ? calculatePackageFare({ pkg, passengers })
      : null;

  const onSubmit = handleSubmit(async (values) => {
    setBanner(null);
    if (!fare) return;
    const result = await postJson<{ checkoutUrl: string }>("/api/bookings", {
      kind: "package",
      booking: { ...values, quotedTotalPaise: fare.totalPaise },
    });
    if (result.ok) {
      router.push(result.data.checkoutUrl);
      return;
    }
    for (const [name, message] of Object.entries(result.fields ?? {})) {
      setError(name.replace(/^booking\./, "") as keyof PackageBookingInput, { type: "server", message });
    }
    setBanner(result.code === "price_changed" ? `${result.message} Please refresh the page.` : result.message);
  });

  const f = (name: string) => `${id}-${name}`;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {banner ? (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {banner}
        </div>
      ) : null}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={f("website")}>Website</label>
        <input id={f("website")} tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id={f("date")} label="Start date" required error={errors.pickupDate?.message}>
          <Input
            id={f("date")}
            type="date"
            min={bounds?.min}
            max={bounds?.max}
            invalid={!!errors.pickupDate}
            aria-describedby={describedBy(f("date"), { error: errors.pickupDate })}
            {...register("pickupDate")}
          />
        </Field>
        <Field id={f("time")} label="Pickup time" required error={errors.pickupTime?.message}>
          <Input
            id={f("time")}
            type="time"
            step={900}
            invalid={!!errors.pickupTime}
            aria-describedby={describedBy(f("time"), { error: errors.pickupTime })}
            {...register("pickupTime")}
          />
        </Field>
        <Field id={f("pax")} label="Passengers" required error={errors.passengers?.message}>
          <Input
            id={f("pax")}
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            invalid={!!errors.passengers}
            aria-describedby={describedBy(f("pax"), { error: errors.passengers })}
            {...register("passengers", { valueAsNumber: true })}
          />
        </Field>
      </div>
      <Field id={f("pickup")} label="Pickup address" required error={errors.pickupLocation?.message}>
        <Input
          id={f("pickup")}
          autoComplete="street-address"
          invalid={!!errors.pickupLocation}
          aria-describedby={describedBy(f("pickup"), { error: errors.pickupLocation })}
          {...register("pickupLocation")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={f("name")} label="Full name" required error={errors.name?.message}>
          <Input id={f("name")} autoComplete="name" invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field id={f("phone")} label="Mobile number" required error={errors.phone?.message}>
          <Input
            id={f("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            invalid={!!errors.phone}
            {...register("phone")}
          />
        </Field>
      </div>
      <Field id={f("email")} label="Email (optional)" error={errors.email?.message}>
        <Input id={f("email")} type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field id={f("notes")} label="Special instructions (optional)" error={errors.specialInstructions?.message}>
        <Textarea id={f("notes")} rows={3} {...register("specialInstructions")} />
      </Field>

      {fare ? (
        <div className="rounded-card border border-line p-4">
          <FareBreakdown fare={fare} />
        </div>
      ) : null}

      <div>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox className="mt-0.5" invalid={!!errors.acceptTerms} {...register("acceptTerms")} />
          <span>
            I accept the{" "}
            <Link href="/terms-and-conditions" target="_blank" className="font-semibold underline">
              terms &amp; conditions
            </Link>{" "}
            and{" "}
            <Link href="/cancellation-refund-policy" target="_blank" className="font-semibold underline">
              cancellation &amp; refund policy
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms ? (
          <p role="alert" className="mt-1 text-sm font-medium text-danger">
            {errors.acceptTerms.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={!fare} loading={formState.isSubmitting} loadingText="Creating booking…">
        {fare ? `Continue to payment · ${formatPaise(fare.totalPaise)}` : "Continue to payment"}
      </Button>
    </form>
  );
}

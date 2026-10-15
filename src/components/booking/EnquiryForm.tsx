"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, describedBy, Field, Input, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  ENQUIRY_TYPES,
  ENQUIRY_TYPE_LABELS,
  enquirySchema,
  type EnquiryInput,
  type EnquiryRequest,
} from "@/lib/validators/booking";
import { postJson } from "./api-client";

type Defaults = Partial<{
  enquiryType: EnquiryInput["enquiryType"];
  routeId: string;
  vehicleCategoryId: string;
  packageId: string;
  pickupLocation: string;
  destination: string;
  travelDate: string;
  passengers: number;
  message: string;
}>;

/**
 * Enquiry for anything not bookable online: routes/vehicles without an
 * approved fare, packages priced on request, hotel and flight/train help.
 */
export function EnquiryForm({
  defaults = {},
  compact = false,
  className,
}: {
  defaults?: Defaults;
  /** Hide the type selector and trip fields (used inside the booking flow). */
  compact?: boolean;
  className?: string;
}) {
  const id = useId();
  const [done, setDone] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const { register, handleSubmit, formState, setError } = useForm<EnquiryInput, unknown, EnquiryRequest>({
    resolver: zodResolver(enquirySchema),
    mode: "onTouched",
    defaultValues: {
      enquiryType: defaults.enquiryType ?? "general",
      name: "",
      phone: "",
      email: "",
      routeId: defaults.routeId ?? "",
      vehicleCategoryId: defaults.vehicleCategoryId ?? "",
      packageId: defaults.packageId ?? "",
      pickupLocation: defaults.pickupLocation ?? "",
      destination: defaults.destination ?? "",
      travelDate: defaults.travelDate ?? "",
      passengers: defaults.passengers ?? "",
      message: defaults.message ?? "",
      website: "",
    },
  });
  const errors = formState.errors;

  const onSubmit = handleSubmit(async (values) => {
    setBanner(null);
    const result = await postJson<{ ok: true }>("/api/enquiries", values);
    if (result.ok) {
      setDone(true);
      return;
    }
    for (const [name, message] of Object.entries(result.fields ?? {})) {
      setError(name as keyof EnquiryInput, { type: "server", message });
    }
    setBanner(result.message);
  });

  if (done) {
    return (
      <div role="status" className={cn("rounded-card border border-success/30 bg-success-soft p-5", className)}>
        <p className="font-semibold text-success">Thank you — we have received your enquiry.</p>
        <p className="mt-1 text-sm text-ink-muted">
          Our team will contact you on the mobile number you provided.
        </p>
      </div>
    );
  }

  const f = (name: string) => `${id}-${name}`;

  return (
    <form onSubmit={onSubmit} noValidate className={cn("space-y-4", className)}>
      {banner ? (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {banner}
        </div>
      ) : null}

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={f("website")}>Website</label>
        <input id={f("website")} tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {!compact ? (
        <Field id={f("type")} label="I'm asking about" required error={errors.enquiryType?.message}>
          <Select id={f("type")} invalid={!!errors.enquiryType} {...register("enquiryType")}>
            {ENQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {ENQUIRY_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={f("name")} label="Full name" required error={errors.name?.message}>
          <Input
            id={f("name")}
            autoComplete="name"
            invalid={!!errors.name}
            aria-describedby={describedBy(f("name"), { error: errors.name })}
            {...register("name")}
          />
        </Field>
        <Field id={f("phone")} label="Mobile number" required error={errors.phone?.message}>
          <Input
            id={f("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            invalid={!!errors.phone}
            aria-describedby={describedBy(f("phone"), { error: errors.phone })}
            {...register("phone")}
          />
        </Field>
      </div>
      <Field id={f("email")} label="Email (optional)" error={errors.email?.message}>
        <Input
          id={f("email")}
          type="email"
          autoComplete="email"
          invalid={!!errors.email}
          aria-describedby={describedBy(f("email"), { error: errors.email })}
          {...register("email")}
        />
      </Field>

      {!compact ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={f("from")} label="From (optional)" error={errors.pickupLocation?.message}>
              <Input id={f("from")} invalid={!!errors.pickupLocation} {...register("pickupLocation")} />
            </Field>
            <Field id={f("to")} label="To (optional)" error={errors.destination?.message}>
              <Input id={f("to")} invalid={!!errors.destination} {...register("destination")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={f("date")} label="Travel date (optional)" error={errors.travelDate?.message}>
              <Input id={f("date")} type="date" invalid={!!errors.travelDate} {...register("travelDate")} />
            </Field>
            <Field id={f("pax")} label="Passengers (optional)" error={errors.passengers?.message}>
              <Input
                id={f("pax")}
                type="number"
                inputMode="numeric"
                min={1}
                max={60}
                invalid={!!errors.passengers}
                {...register("passengers")}
              />
            </Field>
          </div>
        </>
      ) : null}

      <Field id={f("message")} label="Message (optional)" error={errors.message?.message}>
        <Textarea id={f("message")} rows={3} invalid={!!errors.message} {...register("message")} />
      </Field>

      <Button type="submit" loading={formState.isSubmitting} loadingText="Sending…">
        Send enquiry
      </Button>
      <p className="text-xs text-muted">
        We use these details only to respond to your enquiry. See our{" "}
        <a href="/privacy-policy" className="underline">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}

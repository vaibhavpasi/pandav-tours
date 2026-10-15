"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { Button, Checkbox, describedBy, Field, Input, Select, Textarea } from "@/components/ui";
import type { FareBreakdown as Breakdown } from "@/lib/booking/fare";
import type { PublicRoute } from "@/lib/data/catalog";
import { cn, formatDateTimeIST, formatPaise } from "@/lib/utils";
import {
  CAB_TRIP_TYPES,
  TRIP_TYPE_LABELS,
  cabBookingSchema,
  type CabBookingInput,
  type CabBookingRequest,
  type CabTripType,
} from "@/lib/validators/booking";
import { postJson, stripFieldPrefix } from "./api-client";
import { EnquiryForm } from "./EnquiryForm";
import { FareBreakdown } from "./FareBreakdown";
import { useIstDateBounds } from "./useIstDateBounds";

type QuoteCategory = {
  id: string;
  name: string;
  seating_capacity: number;
  luggage_capacity: number;
  example_models: string | null;
};

type QuoteResponse = {
  route: { id: string; name: string; trip_type: CabTripType; origin: string; destination: string | null };
  pickupAt: string;
  returnAt: string | null;
  termsVersion: string;
  quotes: { category: QuoteCategory; fare: Breakdown | null; fitsPassengers: boolean }[];
};

type BookingResponse = { reference: string; checkoutUrl: string };

export type BookingFormProps = {
  routes: PublicRoute[];
  termsVersion: string;
  maxAdvanceDays: number;
  /** Restrict the form to one trip type (service landing pages). */
  tripTypes?: CabTripType[];
};

const STEP1_FIELDS = [
  "tripType",
  "routeId",
  "pickupDate",
  "pickupTime",
  "returnDate",
  "returnTime",
  "passengers",
] as const satisfies FieldPath<CabBookingInput>[];

type Step = 1 | 2 | 3;

export function BookingForm({ routes, termsVersion, maxAdvanceDays, tripTypes }: BookingFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const formId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const availableTypes = useMemo(() => {
    const allowed = tripTypes ?? CAB_TRIP_TYPES;
    return allowed.filter((type) => routes.some((r) => r.trip_type === type));
  }, [routes, tripTypes]);

  const initialType = (() => {
    const fromUrl = params.get("trip") as CabTripType | null;
    if (fromUrl && availableTypes.includes(fromUrl)) return fromUrl;
    return availableTypes[0] ?? "one_way";
  })();
  const initialRoute = (() => {
    const fromUrl = params.get("route");
    return routes.some((r) => r.id === fromUrl && r.trip_type === initialType) ? fromUrl! : "";
  })();

  const form = useForm<CabBookingInput, unknown, CabBookingRequest>({
    resolver: zodResolver(cabBookingSchema),
    mode: "onTouched",
    defaultValues: {
      tripType: initialType,
      routeId: initialRoute,
      pickupDate: params.get("date") ?? "",
      pickupTime: params.get("time") ?? "",
      returnDate: "",
      returnTime: "",
      passengers: Number(params.get("pax")) || 1,
      vehicleCategoryId: "",
      pickupLocation: "",
      dropLocation: "",
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
  const { register, formState, control, setValue, setError, trigger, getValues, handleSubmit } = form;
  const errors = formState.errors;

  const [step, setStep] = useState<Step>(1);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [enquiryFor, setEnquiryFor] = useState<QuoteCategory | null>(null);
  const dateBounds = useIstDateBounds(maxAdvanceDays);

  const [tripType, routeId, selectedCategoryId, pickupDate] = useWatch({
    control,
    name: ["tripType", "routeId", "vehicleCategoryId", "pickupDate"],
  });
  const routesForType = routes.filter((r) => r.trip_type === tripType);

  // Keep the route consistent with the chosen trip type.
  useEffect(() => {
    if (routeId && !routes.some((r) => r.id === routeId && r.trip_type === tripType)) {
      setValue("routeId", "");
    }
  }, [tripType, routeId, routes, setValue]);

  function goTo(next: Step) {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function applyServerFields(fields: Record<string, string> | undefined) {
    const mapped = stripFieldPrefix(fields, "booking");
    let firstStep: Step | null = null;
    for (const [name, message] of Object.entries(mapped)) {
      setError(name as FieldPath<CabBookingInput>, { type: "server", message });
      const fieldStep: Step = (STEP1_FIELDS as readonly string[]).includes(name)
        ? 1
        : name === "vehicleCategoryId"
          ? 2
          : 3;
      firstStep = firstStep === null ? fieldStep : (Math.min(firstStep, fieldStep) as Step);
    }
    return firstStep;
  }

  async function fetchQuote(): Promise<QuoteResponse | null> {
    const v = getValues();
    setLoadingQuote(true);
    const result = await postJson<QuoteResponse>("/api/fare/quote", {
      tripType: v.tripType,
      routeId: v.routeId,
      pickupDate: v.pickupDate,
      pickupTime: v.pickupTime,
      returnDate: v.returnDate,
      returnTime: v.returnTime,
      passengers: v.passengers,
    });
    setLoadingQuote(false);
    if (!result.ok) {
      const fieldStep = applyServerFields(result.fields);
      setBanner(result.message);
      if (fieldStep) goTo(fieldStep);
      return null;
    }
    return result.data;
  }

  async function onSeeVehicles() {
    setBanner(null);
    if (!(await trigger([...STEP1_FIELDS]))) return;
    const data = await fetchQuote();
    if (!data) return;
    setQuote(data);
    // Drop a previous choice that is no longer valid for this quote.
    const previous = data.quotes.find((q) => q.category.id === getValues("vehicleCategoryId"));
    if (!previous?.fare || !previous.fitsPassengers) {
      setValue("vehicleCategoryId", "");
      setValue("quotedTotalPaise", 0);
    } else {
      setValue("quotedTotalPaise", previous.fare.totalPaise);
    }
    goTo(2);
  }

  function chooseVehicle(option: QuoteResponse["quotes"][number]) {
    if (!option.fare || !option.fitsPassengers) return;
    setValue("vehicleCategoryId", option.category.id, { shouldValidate: true });
    setValue("quotedTotalPaise", option.fare.totalPaise);
  }

  function onContinueToDetails() {
    if (!getValues("vehicleCategoryId")) {
      setError("vehicleCategoryId", { type: "required", message: "Choose a vehicle to continue" });
      return;
    }
    setBanner(null);
    goTo(3);
  }

  async function submitBooking(values: CabBookingRequest) {
    setBanner(null);
    const result = await postJson<BookingResponse>("/api/bookings", { kind: "cab", booking: values });
    if (result.ok) {
      router.push(result.data.checkoutUrl);
      return;
    }

    if (result.code === "price_changed" || result.code === "fare_unavailable") {
      const fresh = await fetchQuote();
      if (fresh) {
        setQuote(fresh);
        setValue("vehicleCategoryId", "");
        setValue("quotedTotalPaise", 0);
        goTo(2);
      }
      setBanner(`${result.message} Nothing has been charged.`);
      return;
    }
    if (result.code === "terms_changed") {
      setBanner(`${result.message} Please refresh this page.`);
      return;
    }
    const fieldStep = applyServerFields(result.fields);
    setBanner(result.message);
    if (fieldStep && fieldStep !== 3) goTo(fieldStep);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    return handleSubmit(submitBooking)(event);
  }

  if (availableTypes.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface p-6">
        <h2 className="text-xl font-semibold">Online booking is not open for this service yet</h2>
        <p className="mt-2 text-muted">
          Send us your trip details and we&apos;ll get back to you with a fare.
        </p>
        <EnquiryForm className="mt-6" defaults={{ enquiryType: "cab" }} />
      </div>
    );
  }

  const selectedQuote = quote?.quotes.find((q) => q.category.id === selectedCategoryId) ?? null;
  const stepTitles: Record<Step, string> = { 1: "Trip details", 2: "Choose your vehicle", 3: "Your details" };

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby={`${formId}-heading`} className="space-y-6">
      <ol className="flex gap-2 text-sm" aria-label="Booking steps">
        {([1, 2, 3] as Step[]).map((n) => (
          <li
            key={n}
            aria-current={step === n ? "step" : undefined}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-full border px-3 py-1.5",
              step === n ? "border-ink bg-ink text-paper" : step > n ? "border-line bg-surface" : "border-line text-muted",
            )}
          >
            <span className="font-bold">{n}</span>
            <span className="truncate">{stepTitles[n]}</span>
          </li>
        ))}
      </ol>

      <h2 id={`${formId}-heading`} ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">
        {stepTitles[step]}
      </h2>

      {banner ? (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {banner}
        </div>
      ) : null}

      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input id={`${formId}-website`} tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {step === 1 ? (
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold">Trip type</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableTypes.map((type) => (
                <label
                  key={type}
                  className="cursor-pointer rounded-full border border-line-strong px-4 py-2 text-sm font-medium has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-3 has-focus-visible:outline-ink"
                >
                  <input type="radio" value={type} className="sr-only" {...register("tripType")} />
                  {TRIP_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </fieldset>

          <Field
            id={`${formId}-route`}
            label={tripType === "local" ? "Package" : "Route"}
            required
            error={errors.routeId?.message}
          >
            <Select
              id={`${formId}-route`}
              invalid={!!errors.routeId}
              aria-describedby={describedBy(`${formId}-route`, { error: errors.routeId })}
              {...register("routeId")}
            >
              <option value="">Select…</option>
              {routesForType.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={`${formId}-date`} label="Pickup date" required error={errors.pickupDate?.message}>
              <Input
                id={`${formId}-date`}
                type="date"
                min={dateBounds?.min}
                max={dateBounds?.max}
                invalid={!!errors.pickupDate}
                aria-describedby={describedBy(`${formId}-date`, { error: errors.pickupDate })}
                {...register("pickupDate")}
              />
            </Field>
            <Field
              id={`${formId}-time`}
              label="Pickup time"
              hint="Nashik time (IST)"
              required
              error={errors.pickupTime?.message}
            >
              <Input
                id={`${formId}-time`}
                type="time"
                step={900}
                invalid={!!errors.pickupTime}
                aria-describedby={describedBy(`${formId}-time`, { hint: true, error: errors.pickupTime })}
                {...register("pickupTime")}
              />
            </Field>
          </div>

          {tripType === "round_trip" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${formId}-rdate`} label="Return date" required error={errors.returnDate?.message}>
                <Input
                  id={`${formId}-rdate`}
                  type="date"
                  min={pickupDate || dateBounds?.min}
                  invalid={!!errors.returnDate}
                  aria-describedby={describedBy(`${formId}-rdate`, { error: errors.returnDate })}
                  {...register("returnDate")}
                />
              </Field>
              <Field id={`${formId}-rtime`} label="Return time" required error={errors.returnTime?.message}>
                <Input
                  id={`${formId}-rtime`}
                  type="time"
                  step={900}
                  invalid={!!errors.returnTime}
                  aria-describedby={describedBy(`${formId}-rtime`, { error: errors.returnTime })}
                  {...register("returnTime")}
                />
              </Field>
            </div>
          ) : null}

          <Field id={`${formId}-pax`} label="Passengers" required error={errors.passengers?.message} className="sm:max-w-48">
            <Input
              id={`${formId}-pax`}
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              invalid={!!errors.passengers}
              aria-describedby={describedBy(`${formId}-pax`, { error: errors.passengers })}
              {...register("passengers", { valueAsNumber: true })}
            />
          </Field>

          <Button type="button" size="lg" className="w-full sm:w-auto" onClick={onSeeVehicles} loading={loadingQuote} loadingText="Getting fares…">
            See vehicles &amp; fares
          </Button>
        </div>
      ) : null}

      {step >= 2 && quote ? (
        <TripSummary quote={quote} passengers={Number(getValues("passengers"))} onChange={() => goTo(1)} />
      ) : null}

      {step === 2 && quote ? (
        <div className="space-y-5">
          <fieldset aria-describedby={errors.vehicleCategoryId ? `${formId}-vehicle-error` : undefined}>
            <legend className="sr-only">Vehicle</legend>
            <ul className="grid gap-3">
              {quote.quotes.map((option) => {
                const bookable = !!option.fare && option.fitsPassengers;
                const selected = selectedCategoryId === option.category.id;
                return (
                  <li key={option.category.id}>
                    <label
                      className={cn(
                        "flex flex-col gap-3 rounded-card border p-4 transition-colors sm:flex-row sm:items-center",
                        bookable ? "cursor-pointer hover:border-ink" : "bg-surface",
                        selected ? "border-2 border-ink" : "border-line",
                      )}
                    >
                      <input
                        type="radio"
                        name="vehicle"
                        className="size-5 accent-ink"
                        disabled={!bookable}
                        checked={selected}
                        onChange={() => chooseVehicle(option)}
                      />
                      <span className="flex-1">
                        <span className="block font-semibold">{option.category.name}</span>
                        <span className="block text-sm text-muted">
                          Up to {option.category.seating_capacity} passengers · {option.category.luggage_capacity} bags
                          {option.category.example_models ? ` · ${option.category.example_models}` : ""}
                        </span>
                        {!option.fitsPassengers ? (
                          <span className="mt-1 block text-sm font-medium text-warning">
                            Too small for {Number(getValues("passengers"))} passengers
                          </span>
                        ) : null}
                      </span>
                      <span className="text-right">
                        {option.fare ? (
                          <>
                            <span className="block text-lg font-bold tabular-nums">
                              {formatPaise(option.fare.totalPaise)}
                            </span>
                            <span className="block text-xs text-muted">incl. taxes</span>
                          </>
                        ) : (
                          <span className="block text-sm text-muted">Fare on request</span>
                        )}
                      </span>
                    </label>
                    {!option.fare && option.fitsPassengers ? (
                      <button
                        type="button"
                        className="mt-2 text-sm font-semibold text-gold-ink underline underline-offset-4"
                        onClick={() => setEnquiryFor(option.category)}
                      >
                        Ask for a {option.category.name} fare
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {errors.vehicleCategoryId ? (
              <p id={`${formId}-vehicle-error`} role="alert" className="mt-2 text-sm font-medium text-danger">
                {errors.vehicleCategoryId.message}
              </p>
            ) : null}
          </fieldset>

          {enquiryFor ? (
            <div className="rounded-card border border-line p-5">
              <h3 className="text-lg font-semibold">Request a {enquiryFor.name} fare</h3>
              <EnquiryForm
                className="mt-4"
                compact
                defaults={{
                  enquiryType: "cab",
                  routeId: quote.route.id,
                  vehicleCategoryId: enquiryFor.id,
                  destination: quote.route.destination ?? undefined,
                  travelDate: getValues("pickupDate"),
                  passengers: Number(getValues("passengers")),
                }}
              />
            </div>
          ) : null}

          {selectedQuote?.fare ? (
            <div className="rounded-card border border-line p-5">
              <h3 className="mb-4 text-lg font-semibold">Fare breakdown — {selectedQuote.category.name}</h3>
              <FareBreakdown fare={selectedQuote.fare} />
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button type="button" variant="ghost" onClick={() => goTo(1)}>
              Back
            </Button>
            <Button type="button" size="lg" onClick={onContinueToDetails} disabled={!selectedQuote?.fare}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 && selectedQuote?.fare ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <Field
              id={`${formId}-pickup`}
              label="Pickup address"
              hint="House/building, street and area"
              required
              error={errors.pickupLocation?.message}
            >
              <Input
                id={`${formId}-pickup`}
                autoComplete="street-address"
                invalid={!!errors.pickupLocation}
                aria-describedby={describedBy(`${formId}-pickup`, { hint: true, error: errors.pickupLocation })}
                {...register("pickupLocation")}
              />
            </Field>
            {tripType !== "local" ? (
              <Field id={`${formId}-drop`} label="Drop address (optional)" error={errors.dropLocation?.message}>
                <Input
                  id={`${formId}-drop`}
                  invalid={!!errors.dropLocation}
                  aria-describedby={describedBy(`${formId}-drop`, { error: errors.dropLocation })}
                  {...register("dropLocation")}
                />
              </Field>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${formId}-name`} label="Full name" required error={errors.name?.message}>
                <Input
                  id={`${formId}-name`}
                  autoComplete="name"
                  invalid={!!errors.name}
                  aria-describedby={describedBy(`${formId}-name`, { error: errors.name })}
                  {...register("name")}
                />
              </Field>
              <Field id={`${formId}-phone`} label="Mobile number" hint="For trip updates" required error={errors.phone?.message}>
                <Input
                  id={`${formId}-phone`}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  invalid={!!errors.phone}
                  aria-describedby={describedBy(`${formId}-phone`, { hint: true, error: errors.phone })}
                  {...register("phone")}
                />
              </Field>
            </div>
            <Field id={`${formId}-email`} label="Email (optional)" hint="For your receipt" error={errors.email?.message}>
              <Input
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                invalid={!!errors.email}
                aria-describedby={describedBy(`${formId}-email`, { hint: true, error: errors.email })}
                {...register("email")}
              />
            </Field>
            <Field
              id={`${formId}-notes`}
              label="Special instructions (optional)"
              error={errors.specialInstructions?.message}
            >
              <Textarea
                id={`${formId}-notes`}
                rows={3}
                invalid={!!errors.specialInstructions}
                aria-describedby={describedBy(`${formId}-notes`, { error: errors.specialInstructions })}
                {...register("specialInstructions")}
              />
            </Field>

            <div>
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  invalid={!!errors.acceptTerms}
                  aria-describedby={errors.acceptTerms ? `${formId}-terms-error` : undefined}
                  className="mt-0.5"
                  {...register("acceptTerms")}
                />
                <span>
                  I have checked the fare breakdown and accept the{" "}
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
                <p id={`${formId}-terms-error`} role="alert" className="mt-1 text-sm font-medium text-danger">
                  {errors.acceptTerms.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button type="button" variant="ghost" onClick={() => goTo(2)} disabled={formState.isSubmitting}>
                Back
              </Button>
              <Button type="submit" size="lg" loading={formState.isSubmitting} loadingText="Creating booking…">
                Continue to payment · {formatPaise(selectedQuote.fare.totalPaise)}
              </Button>
            </div>
            <p className="text-sm text-muted">
              Your booking is held for a limited time while you pay. Nothing is charged until you complete payment.
            </p>
          </div>

          <aside className="h-fit rounded-card border border-line p-5 lg:sticky lg:top-24" aria-label="Fare summary">
            <h3 className="mb-4 font-semibold">{selectedQuote.category.name}</h3>
            <FareBreakdown fare={selectedQuote.fare} />
          </aside>
        </div>
      ) : null}
    </form>
  );
}

function TripSummary({
  quote,
  passengers,
  onChange,
}: {
  quote: QuoteResponse;
  passengers: number;
  onChange: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <dl className="grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="font-semibold">Trip</dt>
        <dd>
          {quote.route.name} · {TRIP_TYPE_LABELS[quote.route.trip_type]}
        </dd>
        <dt className="font-semibold">Pickup</dt>
        <dd>{formatDateTimeIST(quote.pickupAt)}</dd>
        {quote.returnAt ? (
          <>
            <dt className="font-semibold">Return</dt>
            <dd>{formatDateTimeIST(quote.returnAt)}</dd>
          </>
        ) : null}
        <dt className="font-semibold">Passengers</dt>
        <dd>{passengers}</dd>
      </dl>
      <Button type="button" variant="outline" size="sm" onClick={onChange}>
        Change trip
      </Button>
    </div>
  );
}

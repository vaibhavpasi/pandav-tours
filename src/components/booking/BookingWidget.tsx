"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Button, Field, Input, Select } from "@/components/ui";
import { addDaysToIsoDate, istToday } from "@/lib/booking/time";
import type { PublicRoute } from "@/lib/data/catalog";
import { CAB_TRIP_TYPES, TRIP_TYPE_LABELS, type CabTripType } from "@/lib/validators/booking";

/**
 * Compact homepage widget. Collects the trip basics and continues to
 * /book-cab with them pre-filled, where fares are quoted by the server.
 */
export function BookingWidget({ routes, maxAdvanceDays }: { routes: PublicRoute[]; maxAdvanceDays: number }) {
  const router = useRouter();
  const id = useId();
  const types = CAB_TRIP_TYPES.filter((t) => routes.some((r) => r.trip_type === t));
  const [tripType, setTripType] = useState<CabTripType>(types[0] ?? "one_way");
  const [routeId, setRouteId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pax, setPax] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<{ min: string; max: string } | null>(null);

  useEffect(() => {
    const today = istToday(new Date());
    setBounds({ min: today, max: addDaysToIsoDate(today, maxAdvanceDays) });
  }, [maxAdvanceDays]);

  const options = routes.filter((r) => r.trip_type === tripType);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!routeId) {
      setError(tripType === "local" ? "Choose a package" : "Choose a route");
      return;
    }
    const params = new URLSearchParams({ trip: tripType, route: routeId, pax });
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    router.push(`/book-cab?${params.toString()}`);
  }

  if (types.length === 0) return null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Quick booking"
      className="rounded-card bg-paper p-5 text-ink shadow-card-hover sm:p-6"
    >
      <fieldset>
        <legend className="sr-only">Trip type</legend>
        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {types.map((type) => (
            <label
              key={type}
              className="shrink-0 cursor-pointer rounded-full px-3.5 py-2 text-sm font-semibold text-ink-muted has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-3 has-focus-visible:outline-ink"
            >
              <input
                type="radio"
                name="trip"
                value={type}
                checked={tripType === type}
                onChange={() => {
                  setTripType(type);
                  setRouteId("");
                  setError(null);
                }}
                className="sr-only"
              />
              {TRIP_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_6rem_auto] md:items-end">
        <Field id={`${id}-route`} label={tripType === "local" ? "Package" : "Route"} error={error ?? undefined}>
          <Select
            id={`${id}-route`}
            value={routeId}
            invalid={!!error}
            aria-describedby={error ? `${id}-route-error` : undefined}
            onChange={(e) => {
              setRouteId(e.target.value);
              setError(null);
            }}
          >
            <option value="">Select…</option>
            {options.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id={`${id}-date`} label="Date">
          <Input
            id={`${id}-date`}
            type="date"
            min={bounds?.min}
            max={bounds?.max}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field id={`${id}-time`} label="Time">
          <Input id={`${id}-time`} type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <Field id={`${id}-pax`} label="Passengers">
          <Input
            id={`${id}-pax`}
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            value={pax}
            onChange={(e) => setPax(e.target.value)}
          />
        </Field>
        <Button type="submit" size="lg" className="w-full md:w-auto">
          See fares
        </Button>
      </div>
    </form>
  );
}

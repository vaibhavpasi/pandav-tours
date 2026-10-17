"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { CalendarIcon, ClockIcon, PinIcon, SearchIcon, UsersIcon } from "@/components/site/TaxiIcons";
import type { PublicRoute } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";
import { CAB_TRIP_TYPES, type CabTripType } from "@/lib/validators/booking";
import { useIstDateBounds } from "./useIstDateBounds";

/** Short segment labels — the segmented control keeps every segment one or two words. */
const SEGMENT_LABELS: Record<CabTripType, string> = {
  one_way: "One Way",
  round_trip: "Round Trip",
  local: "Local Rental",
  airport_transfer: "Airport",
  railway_transfer: "Railway Station",
};

const MIN_PAX = 1;
const MAX_PAX = 60;

/** One cell of the search bar: small caps label with icon above a large value. */
function Tile({
  htmlFor,
  label,
  icon,
  className,
  children,
}: {
  htmlFor?: string;
  label: string;
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const Heading = htmlFor ? "label" : "span";
  return (
    <div
      className={cn(
        "relative flex min-h-[5.5rem] flex-col justify-center gap-1 px-4 py-3 transition-colors hover:bg-gold-soft/60",
        "has-[:focus-visible]:bg-gold-soft has-[:focus-visible]:outline-3 has-[:focus-visible]:-outline-offset-3 has-[:focus-visible]:outline-ink",
        className,
      )}
    >
      <Heading
        {...(htmlFor ? { htmlFor } : {})}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted uppercase"
      >
        {icon}
        {label}
      </Heading>
      {children}
    </div>
  );
}

/**
 * Homepage search card, modelled on familiar cab-search layouts: trip type
 * segments, then route / date / time / passengers, then one prominent search
 * button. Continues to /book-cab with the basics pre-filled, where fares are
 * quoted by the server.
 */
export function BookingWidget({ routes, maxAdvanceDays }: { routes: PublicRoute[]; maxAdvanceDays: number }) {
  const router = useRouter();
  const id = useId();
  const types = CAB_TRIP_TYPES.filter((t) => routes.some((r) => r.trip_type === t));
  const [tripType, setTripType] = useState<CabTripType>(types[0] ?? "one_way");
  const [routeId, setRouteId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pax, setPax] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const bounds = useIstDateBounds(maxAdvanceDays);

  const options = routes.filter((r) => r.trip_type === tripType);
  const selected = options.find((r) => r.id === routeId);
  const isLocal = tripType === "local";

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!routeId) {
      setError(isLocal ? "Choose a rental package" : "Choose where you're going");
      return;
    }
    const params = new URLSearchParams({ trip: tripType, route: routeId, pax: String(pax) });
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    router.push(`/book-cab?${params.toString()}`);
  }

  if (types.length === 0) return null;

  const valueClass = "w-full bg-transparent text-lg font-bold text-ink outline-none sm:text-xl";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Search cabs"
      className="relative rounded-[1.75rem] bg-paper p-3 text-ink shadow-[0_24px_60px_-12px_rgb(0_0_0/0.45)] sm:p-4 md:pb-12"
    >
      {/* Trip type — segmented control */}
      {/* min-w-0: fieldsets default to min-content width, which would push the scrolling track past the card. */}
      <fieldset className="min-w-0">
        <legend className="sr-only">Trip type</legend>
        <div className="flex gap-1 overflow-x-auto rounded-full bg-surface p-1 [scrollbar-width:none]">
          {types.map((type) => (
            <label
              key={type}
              className={cn(
                "flex h-11 min-w-max flex-1 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-semibold text-muted transition-all duration-200",
                "hover:text-ink has-checked:bg-ink has-checked:text-paper has-checked:shadow-md",
                "has-focus-visible:outline-3 has-focus-visible:outline-offset-1 has-focus-visible:outline-ink",
              )}
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
              {SEGMENT_LABELS[type]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Search bar */}
      <div
        className={cn(
          "mt-3 grid divide-y divide-line overflow-hidden rounded-2xl border md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] md:divide-x md:divide-y-0",
          error ? "border-danger" : "border-line",
        )}
      >
        <Tile
          htmlFor={`${id}-route`}
          label={isLocal ? "Rental package" : "From → To"}
          icon={<PinIcon className="size-3.5" />}
        >
          {/* The visible summary is decorative; the transparent select on top is the real control. */}
          <div aria-hidden="true" className="pointer-events-none flex min-w-0 items-baseline gap-2">
            {selected ? (
              isLocal || !selected.destination ? (
                <span className="truncate text-lg font-bold sm:text-xl">{selected.name}</span>
              ) : (
                <>
                  <span className="truncate text-lg font-bold sm:text-xl">{selected.origin}</span>
                  <span className="text-gold-ink">→</span>
                  <span className="truncate text-lg font-bold sm:text-xl">{selected.destination}</span>
                </>
              )
            ) : (
              <span className="text-lg font-bold text-muted sm:text-xl">
                {isLocal ? "Choose hours & km" : "Where to?"}
              </span>
            )}
          </div>
          <span aria-hidden="true" className="pointer-events-none truncate text-xs text-muted">
            {selected?.distance_km ? `About ${selected.distance_km} km` : `${options.length} option${options.length === 1 ? "" : "s"} available`}
          </span>
          <select
            id={`${id}-route`}
            value={routeId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => {
              setRouteId(e.target.value);
              setError(null);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <option value="">{isLocal ? "Choose a package" : "Choose a route"}</option>
            {options.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Tile>

        <Tile htmlFor={`${id}-date`} label="Pickup date" icon={<CalendarIcon className="size-3.5" />}>
          <input
            id={`${id}-date`}
            type="date"
            min={bounds?.min}
            max={bounds?.max}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(valueClass, "h-8 cursor-pointer", !date && "text-muted")}
          />
        </Tile>

        <Tile htmlFor={`${id}-time`} label="Pickup time" icon={<ClockIcon className="size-3.5" />}>
          <input
            id={`${id}-time`}
            type="time"
            step={900}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={cn(valueClass, "h-8 cursor-pointer", !time && "text-muted")}
          />
        </Tile>

        <Tile label="Passengers" icon={<UsersIcon className="size-3.5" />}>
          <div role="group" aria-label="Passengers" className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Fewer passengers"
              disabled={pax <= MIN_PAX}
              onClick={() => setPax((p) => Math.max(MIN_PAX, p - 1))}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-xl font-bold transition-colors hover:border-ink hover:bg-surface active:scale-95 disabled:opacity-35"
            >
              −
            </button>
            <output aria-live="polite" className="text-xl font-bold tabular-nums">
              {pax}
            </output>
            <button
              type="button"
              aria-label="More passengers"
              disabled={pax >= MAX_PAX}
              onClick={() => setPax((p) => Math.min(MAX_PAX, p + 1))}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-xl font-bold transition-colors hover:border-ink hover:bg-surface active:scale-95 disabled:opacity-35"
            >
              +
            </button>
          </div>
        </Tile>
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 px-1 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {/* One prominent action: full width on phones, a capsule straddling the card edge on wider screens. */}
      <button
        type="submit"
        className={cn(
          "mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gold px-10 text-lg font-extrabold tracking-wide text-ink uppercase shadow-lg transition-[background-color,transform,box-shadow] duration-150",
          "hover:bg-gold-hover hover:shadow-xl active:scale-[0.98]",
          "md:absolute md:bottom-0 md:left-1/2 md:mt-0 md:w-auto md:min-w-72 md:-translate-x-1/2 md:translate-y-1/2 md:active:scale-100",
        )}
      >
        <SearchIcon className="size-5" />
        Search Cabs
      </button>
    </form>
  );
}

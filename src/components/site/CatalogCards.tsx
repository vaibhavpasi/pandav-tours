import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui";
import { photoForPackage } from "@/content/destinations";
import { PhoneIcon } from "@/components/layout/Icons";
import { businessContact } from "@/lib/constants";
import { telHref } from "@/lib/phone";
import { CarIcon } from "./TaxiIcons";
import type { PublicCategory, PublicPackageSummary, PublicRoute } from "@/lib/data/catalog";
import { formatPaise } from "@/lib/utils";
import { TRIP_TYPE_LABELS, type CabTripType } from "@/lib/validators/booking";

function CarPlaceholder() {
  return (
    <div className="flex aspect-[16/9] items-center justify-center rounded-t-card bg-surface text-line-strong" aria-hidden="true">
      <svg viewBox="0 0 64 32" className="w-24" fill="currentColor">
        <path d="M10 22h-4a2 2 0 0 1-2-2v-4l5-1 7-7h22l10 8 10 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a6 6 0 0 0-12 0H22a6 6 0 0 0-12 0Zm6-4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm32 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM20 10l-5 5h13v-5Zm11 0v5h14l-6-5Z" />
      </svg>
    </div>
  );
}

function CardImage({ src, alt }: { src: string | StaticImageData | null; alt: string }) {
  if (!src) return <CarPlaceholder />;
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-t-card bg-surface">
      <Image
        src={src}
        alt={alt}
        fill
        placeholder={typeof src === "string" ? "empty" : "blur"}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>
  );
}

export function VehicleCard({ category, startingPaise }: { category: PublicCategory; startingPaise: number | null }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardImage src={category.image_url} alt={category.name} />
      <CardBody className="flex-1 space-y-2">
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <p className="text-sm text-muted">
          Up to {category.seating_capacity} passengers · {category.luggage_capacity} bags
        </p>
        {category.example_models ? <p className="text-sm text-muted">{category.example_models}</p> : null}
        {category.description ? <p className="text-sm">{category.description}</p> : null}
        {startingPaise !== null ? (
          <p className="pt-1 text-sm">
            Fares from <span className="font-bold">{formatPaise(startingPaise)}</span>{" "}
            <span className="text-muted">+ taxes, by route</span>
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function RouteCard({ route, startingPaise }: { route: PublicRoute; startingPaise: number | null }) {
  // Bookings are taken by phone; without a configured number, fall back to the contact page.
  const { phone } = businessContact();
  const href = phone ? telHref(phone) : "/contact";
  const hasLeg = Boolean(route.destination) && route.trip_type !== "local";
  return (
    <Card interactive className="group relative flex h-full flex-col overflow-hidden">
      <CardBody className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold">
          <span className="rounded-full bg-gold-soft px-2.5 py-1 tracking-wider text-gold-ink uppercase">
            {TRIP_TYPE_LABELS[route.trip_type as CabTripType]}
          </span>
          {route.distance_km ? <span className="text-muted">≈ {route.distance_km} km</span> : null}
        </div>
        {hasLeg ? (
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1">
              <span className="block text-xs text-muted">From</span>
              <span className="block truncate text-lg font-bold">{route.origin}</span>
            </p>
            <span aria-hidden="true" className="flex w-14 shrink-0 items-center gap-1 text-gold-ink sm:w-16">
              <span className="h-px flex-1 border-t-2 border-dotted border-line-strong" />
              <CarIcon className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="h-px flex-1 border-t-2 border-dotted border-line-strong" />
            </span>
            <p className="min-w-0 flex-1 text-right">
              <span className="block text-xs text-muted">To</span>
              <span className="block truncate text-lg font-bold">{route.destination}</span>
            </p>
          </div>
        ) : null}
        <h3 className={hasLeg ? "text-sm text-muted" : "text-lg font-semibold"}>{route.name}</h3>
      </CardBody>
      <div className="relative flex items-center justify-between gap-3 border-t-2 border-dashed border-line px-5 py-4 sm:px-6">
        {/* Ticket notches */}
        <span aria-hidden="true" className="absolute -top-2.5 -left-2.5 size-5 rounded-full bg-surface" />
        <span aria-hidden="true" className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-surface" />
        {startingPaise !== null ? (
          <p className="text-sm">
            <span className="text-muted">From </span>
            <span className="text-xl font-extrabold">{formatPaise(startingPaise)}</span>
            <span className="block text-xs text-muted">+ taxes &amp; applicable charges</span>
          </p>
        ) : (
          <p className="text-sm text-muted">Fare on request</p>
        )}
        <a
          href={href}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-bold text-paper transition-colors after:absolute after:inset-0 group-hover:bg-gold group-hover:text-ink"
        >
          <PhoneIcon className="size-4" />
          Call to book<span className="sr-only"> {route.name}</span>
        </a>
      </div>
    </Card>
  );
}

export function PackageCard({ pkg }: { pkg: PublicPackageSummary }) {
  const duration = `${pkg.duration_days} day${pkg.duration_days === 1 ? "" : "s"}${
    pkg.duration_nights ? ` / ${pkg.duration_nights} night${pkg.duration_nights === 1 ? "" : "s"}` : ""
  }`;
  return (
    <Card interactive className="group relative flex h-full flex-col overflow-hidden">
      <CardImage src={pkg.image_url ?? photoForPackage(`${pkg.slug} ${pkg.title}`).src} alt={pkg.title} />
      <CardBody className="flex flex-1 flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-gold-ink uppercase">{duration}</p>
        <h3 className="text-lg font-semibold">
          <Link href={`/tour-packages/${pkg.slug}`} className="after:absolute after:inset-0">
            {pkg.title}
          </Link>
        </h3>
        {pkg.summary ? <p className="text-sm text-muted">{pkg.summary}</p> : null}
        <p className="mt-auto pt-2 text-sm">
          {pkg.price_paise !== null ? (
            <>
              <span className="text-lg font-bold">{formatPaise(pkg.price_paise)}</span>{" "}
              <span className="text-muted">{pkg.price_basis === "per_person" ? "per person" : "per vehicle"} + taxes</span>
            </>
          ) : (
            <span className="text-muted">Price on request</span>
          )}
        </p>
      </CardBody>
    </Card>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui";
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

function CardImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <CarPlaceholder />;
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-t-card bg-surface">
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
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
  const href = `/book-cab?${new URLSearchParams({ trip: route.trip_type, route: route.id })}`;
  return (
    <Card interactive className="h-full">
      <CardBody className="flex h-full flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-gold-ink uppercase">
          {TRIP_TYPE_LABELS[route.trip_type as CabTripType]}
        </p>
        <h3 className="text-lg font-semibold">{route.name}</h3>
        {route.distance_km ? <p className="text-sm text-muted">About {route.distance_km} km</p> : null}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          {startingPaise !== null ? (
            <p className="text-sm">
              From <span className="text-lg font-bold">{formatPaise(startingPaise)}</span>
              <span className="block text-xs text-muted">+ taxes &amp; applicable charges</span>
            </p>
          ) : (
            <p className="text-sm text-muted">Fare on request</p>
          )}
          <Link href={href} className="shrink-0 font-semibold text-gold-ink underline-offset-4 hover:underline">
            Book<span className="sr-only"> {route.name}</span> →
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export function PackageCard({ pkg }: { pkg: PublicPackageSummary }) {
  const duration = `${pkg.duration_days} day${pkg.duration_days === 1 ? "" : "s"}${
    pkg.duration_nights ? ` / ${pkg.duration_nights} night${pkg.duration_nights === 1 ? "" : "s"}` : ""
  }`;
  return (
    <Card interactive className="relative flex h-full flex-col overflow-hidden">
      <CardImage src={pkg.image_url} alt={pkg.title} />
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

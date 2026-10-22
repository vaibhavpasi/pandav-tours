import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { CallButton } from "./CallToBook";
import { GALLERY, PHOTOS, type Destination, type Photo } from "@/content/destinations";
import { cn } from "@/lib/utils";

/** Photo tile with the destination's name over a dark gradient; links to its guide entry. */
export function DestinationCard({
  destination,
  featured = false,
  className,
}: {
  destination: Destination;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/explore-nashik#${destination.slug}`}
      className={cn(
        "group relative flex min-h-64 overflow-hidden rounded-card bg-ink text-paper shadow-card lg:min-h-0",
        featured && "min-h-80",
        className,
      )}
    >
      <Image
        src={destination.photo.src}
        alt=""
        fill
        placeholder="blur"
        sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent transition-opacity duration-300 group-hover:opacity-90"
      />
      <div className="relative mt-auto w-full p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-gold px-2.5 py-1 text-ink">{destination.category}</span>
          <span className="rounded-full bg-ink/60 px-2.5 py-1 backdrop-blur">{destination.distance}</span>
        </div>
        <h3 className={cn("mt-3 font-bold", featured ? "text-2xl sm:text-3xl" : "text-xl")}>{destination.name}</h3>
        <p className="mt-1 text-sm text-paper/85">{destination.tagline}</p>
        {featured ? <p className="mt-3 hidden max-w-md text-sm text-paper/80 sm:block">{destination.body}</p> : null}
      </div>
    </Link>
  );
}

/** Bento-style grid: the first destination gets the large tile. */
export function DestinationMosaic({ destinations }: { destinations: Destination[] }) {
  const [first, ...rest] = destinations;
  return (
    <ul className="reveal-stagger grid gap-4 sm:grid-cols-2 lg:auto-rows-[15rem] lg:grid-cols-4">
      <li className="flex sm:col-span-2 lg:row-span-2">
        <DestinationCard destination={first} featured className="w-full" />
      </li>
      {rest.map((destination) => (
        <li key={destination.slug} className="flex">
          <DestinationCard destination={destination} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

function GalleryStrip({ photos, hidden = false }: { photos: Photo[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 gap-4 pr-4" aria-hidden={hidden || undefined}>
      {photos.map((photo) => (
        <li key={photo.credit.source} className="relative h-56 w-80 shrink-0 overflow-hidden rounded-card sm:h-64 sm:w-96">
          <Image
            src={photo.src}
            alt={hidden ? "" : photo.alt}
            fill
            placeholder="blur"
            sizes="384px"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

/** Endless, slowly scrolling photo strip. Pauses on hover; static with reduced motion. */
export function PhotoMarquee({ photos = GALLERY }: { photos?: Photo[] }) {
  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        <GalleryStrip photos={photos} />
        <GalleryStrip photos={photos} hidden />
      </div>
    </div>
  );
}

/** Full-width photo band with a call to action. */
export function PhotoBanner({
  photo = PHOTOS.harihar,
  title,
  body,
}: {
  photo?: Photo;
  title: string;
  body: string;
}) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink text-paper">
      <div aria-hidden="true" className="parallax absolute inset-0 -z-10">
        <Image src={photo.src} alt="" fill placeholder="blur" sizes="100vw" className="object-cover" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/20" />
      <div className="reveal mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="mt-4 max-w-lg text-lg text-paper/85">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CallButton size="lg">Call to Book</CallButton>
          <ButtonLink href="/tour-packages" size="lg" variant="outline-light">
            View tour packages
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/** Attribution for every photo, as required by the CC BY / CC BY-SA licences. */
export function PhotoCredits() {
  const photos = Object.values(PHOTOS);
  return (
    <ul className="grid gap-x-8 gap-y-2 text-sm text-muted sm:grid-cols-2">
      {photos.map((photo) => (
        <li key={photo.credit.source}>
          <a href={photo.credit.source} className="underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
            “{photo.credit.title}”
          </a>{" "}
          — {photo.credit.author},{" "}
          <a href={photo.credit.licenseUrl} className="underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
            {photo.credit.license}
          </a>
        </li>
      ))}
    </ul>
  );
}

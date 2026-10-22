import Image from "next/image";
import { GALLERY, PHOTOS, type Photo } from "@/content/destinations";

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

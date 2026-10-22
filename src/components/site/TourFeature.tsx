import Image from "next/image";
import { ButtonLink } from "@/components/ui";
import { SHIRDI_TOUR as tour } from "@/content/tours";
import { ArrowRightIcon, PinIcon } from "./TaxiIcons";

/** Wide photo card promoting the Shirdi darshan tour. */
export function ShirdiTourFeature() {
  const [plan] = tour.plans;
  return (
    <article className="reveal group grid overflow-hidden rounded-[1.75rem] bg-ink text-paper shadow-card-hover md:grid-cols-2">
      <div className="relative min-h-64 overflow-hidden md:min-h-full">
        <Image
          src={plan.photo.src}
          alt={plan.photo.alt}
          fill
          placeholder="blur"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">
          Day trip from Nashik
        </span>
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">Shirdi darshan</p>
        <h3 className="mt-2 text-3xl font-extrabold sm:text-4xl">Nashik to Shirdi, door to door</h3>
        <p className="mt-3 text-paper/80">{tour.intro}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Stops">
          {plan.stops.slice(0, 4).map((stop) => (
            <li key={stop} className="inline-flex items-center gap-1 rounded-full bg-paper/10 px-3 py-1 text-sm">
              <PinIcon className="size-3.5 text-gold" />
              {stop}
            </li>
          ))}
        </ul>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-paper/15 pt-5 text-sm">
          {tour.facts.slice(0, 2).map((fact) => (
            <div key={fact.label}>
              <dt className="text-paper/60">{fact.label}</dt>
              <dd className="font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-7">
          <ButtonLink href={`/tour-packages/${tour.slug}`} size="lg">
            View Shirdi tour
            <ArrowRightIcon className="size-5" />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

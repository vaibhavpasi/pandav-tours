import type { Metadata } from "next";
import Image from "next/image";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { CallButton, WhatsAppButton } from "@/components/site/CallToBook";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Sections";
import { ArrowRightIcon, ClockIcon, PinIcon, TempleIcon } from "@/components/site/TaxiIcons";
import { ButtonLink, Container } from "@/components/ui";
import { PHOTOS } from "@/content/destinations";
import { SHIRDI_TOUR as tour } from "@/content/tours";

export const metadata: Metadata = {
  title: tour.metaTitle,
  description: tour.metaDescription,
  alternates: { canonical: `/tour-packages/${tour.slug}` },
  openGraph: { images: [PHOTOS.shirdiChawadi.src.src] },
};

const WHATSAPP_MESSAGE = "Hello Pandav Tours & Travel, I would like to book the Shirdi darshan tour from Nashik.";

export default function ShirdiTourPage() {
  return (
    <>
      <PageHero eyebrow="Tour from Nashik" title={tour.title} intro={tour.intro} photo={PHOTOS.shirdiChawadi}>
        <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {tour.facts.map((fact) => (
            <div key={fact.label} className="rounded-2xl border border-paper/20 bg-ink/40 px-4 py-3 backdrop-blur">
              <dt className="text-xs font-semibold tracking-wider text-gold uppercase">{fact.label}</dt>
              <dd className="mt-1 text-sm font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CallButton size="lg">Call to book</CallButton>
          <WhatsAppButton size="lg" variant="outline-light" message={WHATSAPP_MESSAGE} />
        </div>
      </PageHero>

      {/* Plans */}
      <Section
        id="plans"
        title="Choose your Shirdi trip"
        intro="Both plans are private — just your group, your driver and your pace."
      >
        <ul className="reveal-stagger grid gap-6 md:grid-cols-2">
          {tour.plans.map((plan) => (
            <li key={plan.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-paper shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={plan.photo.src}
                    alt={plan.photo.alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-paper backdrop-blur">
                    <ClockIcon className="size-3.5" />
                    {plan.duration}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="mt-2 text-muted">{plan.summary}</p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stops">
                    {plan.stops.map((stop) => (
                      <li
                        key={stop}
                        className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-sm font-medium"
                      >
                        <PinIcon className="size-3.5 text-gold-ink" />
                        {stop}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex pt-1">
                    <ButtonLink href="#enquire" variant="dark" className="mt-auto">
                      Enquire about {plan.name}
                      <ArrowRightIcon className="size-4" />
                    </ButtonLink>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      {/* Itinerary timeline */}
      <Section id="itinerary" title="How the day goes" intro="A suggested plan for the same-day trip. Timings are indicative." tone="surface">
        <ol className="relative max-w-3xl">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.1875rem] w-0.5 bg-gradient-to-b from-gold via-gold/60 to-gold/10" />
          {tour.itinerary.map((step, index) => (
            <li key={step.title} className="reveal relative flex gap-5 pb-8 last:pb-0">
              <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-extrabold text-gold ring-4 ring-surface">
                {index + 1}
              </span>
              <div className="pt-1.5">
                <p className="text-xs font-semibold tracking-wider text-gold-ink uppercase">{step.time}</p>
                <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                <p className="mt-1 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Sites */}
      <Section id="sites" title="Places you'll visit">
        <ul className="reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tour.sites.map((site) => (
            <li key={site.name} className="flex gap-4 rounded-card border border-line p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-soft text-gold-ink">
                <TempleIcon className="size-5" />
              </span>
              <div>
                <h3 className="font-bold">{site.name}</h3>
                <p className="mt-1 text-sm text-muted">{site.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Included / not included + tips */}
      <Section id="details" title="Good to know" tone="surface">
        <div className="reveal-stagger grid gap-5 lg:grid-cols-3">
          <div className="rounded-card border border-line bg-paper p-6">
            <h3 className="text-lg font-bold">Included</h3>
            <ul className="mt-4 space-y-3">
              {tour.included.map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-xs font-bold text-success">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-line bg-paper p-6">
            <h3 className="text-lg font-bold">Not included</h3>
            <ul className="mt-4 space-y-3">
              {tour.notIncluded.map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-muted">
                    –
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card bg-ink p-6 text-paper">
            <h3 className="text-lg font-bold text-gold">Travel tips</h3>
            <ul className="mt-4 space-y-3 text-sm text-paper/85">
              {tour.tips.map((tip) => (
                <li key={tip} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Enquiry */}
      <section id="enquire" aria-labelledby="enquire-heading" className="scroll-mt-20 py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
          <div className="reveal lg:sticky lg:top-28">
            <p className="text-sm font-semibold tracking-[0.2em] text-gold-ink uppercase">Plan your trip</p>
            <h2 id="enquire-heading" className="mt-2 text-3xl font-bold sm:text-4xl">
              Get your Shirdi tour fare
            </h2>
            <p className="mt-3 text-muted">
              The quickest way is to call us — we&apos;ll confirm the cab and full fare on the call. Prefer a call back?
              Send your date, group size and plan and we&apos;ll ring you.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <CallButton size="lg">Call to book</CallButton>
              <WhatsAppButton size="lg" message={WHATSAPP_MESSAGE} />
            </div>
            <div className="relative mt-6 hidden aspect-[4/3] overflow-hidden rounded-card lg:block">
              <Image
                src={PHOTOS.shaniShingnapur.src}
                alt={PHOTOS.shaniShingnapur.alt}
                fill
                placeholder="blur"
                sizes="40vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="reveal rounded-card border border-line bg-paper p-5 shadow-card sm:p-6">
            <EnquiryForm
              defaults={{
                enquiryType: "package",
                pickupLocation: "Nashik",
                destination: "Shirdi",
                message: "I'd like to book the Shirdi darshan tour.",
              }}
            />
          </div>
        </Container>
      </section>
    </>
  );
}

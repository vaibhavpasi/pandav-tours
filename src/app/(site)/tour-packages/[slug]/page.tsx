import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { PackageBookingForm } from "@/components/booking/PackageBookingForm";
import { PageHero } from "@/components/site/PageHero";
import { Container, LoadingBlock } from "@/components/ui";
import { getCatalog, getPackageBySlug } from "@/lib/data/catalog";
import { formatPaise } from "@/lib/utils";

type ItineraryDay = { day?: number; title?: string; description?: string };

export async function generateStaticParams() {
  const catalog = await getCatalog();
  const slugs = catalog.packages.map((p) => ({ slug: p.slug }));
  // Cache Components needs at least one param to build the route shell; this
  // placeholder renders the not-found page.
  return slugs.length ? slugs : [{ slug: "no-packages-yet" }];
}

export async function generateMetadata({ params }: PageProps<"/tour-packages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: "Package not found", robots: { index: false } };
  return {
    title: pkg.seo_title ?? pkg.title,
    description: pkg.seo_description ?? pkg.summary ?? undefined,
    alternates: { canonical: `/tour-packages/${pkg.slug}` },
    openGraph: pkg.image_url ? { images: [pkg.image_url] } : undefined,
  };
}

export default function PackagePage(props: PageProps<"/tour-packages/[slug]">) {
  return (
    <Suspense fallback={<Container className="py-16"><LoadingBlock label="Loading package…" lines={8} /></Container>}>
      <PackageDetails {...props} />
    </Suspense>
  );
}

async function PackageDetails({ params }: PageProps<"/tour-packages/[slug]">) {
  const { slug } = await params;
  const [pkg, catalog] = await Promise.all([getPackageBySlug(slug), getCatalog()]);
  if (!pkg) notFound();

  const itinerary = Array.isArray(pkg.itinerary) ? (pkg.itinerary as ItineraryDay[]) : [];
  const duration = `${pkg.duration_days} day${pkg.duration_days === 1 ? "" : "s"}${
    pkg.duration_nights ? ` / ${pkg.duration_nights} night${pkg.duration_nights === 1 ? "" : "s"}` : ""
  }`;

  return (
    <>
      <PageHero eyebrow={duration} title={pkg.title} intro={pkg.summary}>
        <p className="mt-6 text-lg">
          {pkg.price_paise !== null ? (
            <>
              <span className="text-3xl font-extrabold text-gold">{formatPaise(pkg.price_paise)}</span>{" "}
              <span className="text-muted-on-dark">
                {pkg.price_basis === "per_person" ? "per person" : "per vehicle"} + taxes
              </span>
            </>
          ) : (
            <span className="text-muted-on-dark">Price on request</span>
          )}
        </p>
      </PageHero>

      <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-10">
          {pkg.description ? (
            <section>
              <h2 className="text-2xl font-bold">About this tour</h2>
              <p className="mt-3 whitespace-pre-line text-ink-muted">{pkg.description}</p>
            </section>
          ) : null}

          {pkg.highlights.length ? (
            <section>
              <h2 className="text-2xl font-bold">Highlights</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-ink-muted">
                {pkg.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {itinerary.length ? (
            <section>
              <h2 className="text-2xl font-bold">Itinerary</h2>
              <ol className="mt-4 space-y-4">
                {itinerary.map((day, index) => (
                  <li key={index} className="rounded-card border border-line p-4">
                    <p className="font-semibold">
                      Day {day.day ?? index + 1}
                      {day.title ? `: ${day.title}` : ""}
                    </p>
                    {day.description ? <p className="mt-1 text-sm text-muted">{day.description}</p> : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {pkg.inclusions.length || pkg.exclusions.length ? (
            <section className="grid gap-6 sm:grid-cols-2">
              {pkg.inclusions.length ? (
                <div>
                  <h2 className="text-xl font-bold">Included</h2>
                  <ul className="mt-2 list-inside list-disc text-sm text-ink-muted">
                    {pkg.inclusions.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {pkg.exclusions.length ? (
                <div>
                  <h2 className="text-xl font-bold">Not included</h2>
                  <ul className="mt-2 list-inside list-disc text-sm text-ink-muted">
                    {pkg.exclusions.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside className="h-fit rounded-card border border-line p-5 lg:sticky lg:top-24">
          {pkg.price_paise !== null ? (
            <>
              <h2 className="mb-4 text-xl font-bold">Book this tour</h2>
              <PackageBookingForm
                pkg={pkg}
                termsVersion={catalog.settings.terms_version}
                maxAdvanceDays={catalog.settings.max_booking_advance_days}
              />
            </>
          ) : (
            <>
              <h2 className="mb-4 text-xl font-bold">Ask about this tour</h2>
              <EnquiryForm defaults={{ enquiryType: "package", packageId: pkg.id }} />
            </>
          )}
        </aside>
      </Container>
    </>
  );
}

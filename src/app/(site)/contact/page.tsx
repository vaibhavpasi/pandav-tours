import type { Metadata } from "next";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { PageHero } from "@/components/site/PageHero";
import { ContactDetails } from "@/components/site/Sections";
import { Container } from "@/components/ui";
import { getCatalog } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Pandav Tours & Travel in Nashik for cab bookings, tour packages and travel assistance.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const catalog = await getCatalog();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We're here to help"
        intro="Call, WhatsApp or send an enquiry — for cab fares, tours, or hotel, flight and train bookings."
      />
      <Container className="space-y-12 py-12 sm:py-16">
        <ContactDetails settings={catalog.settings} />
        <section aria-labelledby="enquiry-heading" className="max-w-2xl">
          <h2 id="enquiry-heading" className="text-2xl font-bold">
            Send an enquiry
          </h2>
          <p className="mt-2 text-muted">We&apos;ll reply on the mobile number you provide.</p>
          <EnquiryForm className="mt-6" />
        </section>
      </Container>
    </>
  );
}

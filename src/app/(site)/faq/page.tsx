import type { Metadata } from "next";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { PHOTOS } from "@/content/destinations";
import { CallToAction } from "@/components/site/Sections";
import { Container } from "@/components/ui";
import { GENERAL_FAQS } from "@/content/faqs";
import { SERVICE_PAGES } from "@/content/services";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about booking cabs, fares, tolls, payments and cancellations with Pandav Tours & Travel.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const serviceFaqs = Object.values(SERVICE_PAGES).flatMap((page) => page.faqs);

  return (
    <>
      <PageHero photo={PHOTOS.kalsubai} eyebrow="FAQ" title="Frequently asked questions" />
      <Container className="max-w-3xl py-12 sm:py-16">
        <FaqList faqs={[...GENERAL_FAQS, ...serviceFaqs]} />
      </Container>
      <CallToAction title="Still have a question?" body="Call, WhatsApp or send us an enquiry." />
    </>
  );
}

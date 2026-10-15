import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/site/ServicePageTemplate";
import { SERVICE_PAGES } from "@/content/services";

const page = SERVICE_PAGES.local;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: { canonical: `/${page.slug}` },
};

export default function Page() {
  return <ServicePageTemplate page={page} />;
}

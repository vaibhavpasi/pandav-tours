import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center py-20">
      <Container className="flex flex-col items-start gap-6">
        <Logo />
        <p className="text-sm font-semibold tracking-widest text-gold-ink uppercase">Error 404</p>
        <h1 className="text-4xl font-extrabold">We couldn&apos;t find that page</h1>
        <p className="max-w-lg text-muted">
          The page may have moved, or the link may be incorrect. You can still book a cab or contact
          us from the homepage.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/">Go to homepage</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}

"use client";

import { Button, ButtonLink, Container } from "@/components/ui";

/** Safe error boundary: never shows technical details to visitors. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex flex-1 items-center py-20">
      <Container className="flex flex-col items-start gap-5">
        <h1 className="text-3xl font-extrabold">Something went wrong</h1>
        <p className="max-w-lg text-muted">
          Please try again. If it keeps happening, call or WhatsApp us and we&apos;ll help you book.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/contact" variant="outline">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}

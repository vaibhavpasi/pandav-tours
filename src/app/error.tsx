"use client";

import { Button, ButtonLink, Container } from "@/components/ui";

/** Safe error boundary: never shows technical details to visitors. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex flex-1 items-center py-20">
      <Container className="flex flex-col items-start gap-5">
        <h1 className="text-3xl font-extrabold">Something went wrong</h1>
        <p className="max-w-lg text-muted">
          Please try again. If you were making a payment, do not pay again — check your booking
          status first, or contact us and we will help.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/booking-status" variant="outline">
            Check booking status
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}

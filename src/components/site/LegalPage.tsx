import type { ReactNode } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui";

/**
 * Set to false only after the owner (and ideally a lawyer) has reviewed and
 * approved all three policy pages and replaced every "[to be confirmed]".
 */
export const LEGAL_PAGES_ARE_DRAFT = true;

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Policies" title={title} intro={`Last updated: ${updated}`} />
      <Container className="max-w-3xl py-12 sm:py-16">
        {LEGAL_PAGES_ARE_DRAFT ? (
          <div role="note" className="mb-8 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning">
            <strong>Draft.</strong> This policy is awaiting review by Pandav Tours &amp; Travel. Items marked “to be
            confirmed” will be finalised before online payments open.
          </div>
        ) : null}
        <div className="space-y-4 text-ink-muted [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
          {children}
        </div>
      </Container>
    </>
  );
}

export function Tbc({ children }: { children: ReactNode }) {
  return <mark className="rounded bg-gold-soft px-1 text-gold-ink">[to be confirmed: {children}]</mark>;
}

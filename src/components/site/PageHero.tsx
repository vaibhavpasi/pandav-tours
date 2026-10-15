import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="on-dark relative overflow-hidden bg-ink text-paper">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(245_189_24/0.18),transparent_60%)]"
      />
      <Container className="relative py-12 sm:py-16">
        {eyebrow ? <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold sm:text-4xl lg:text-5xl">{title}</h1>
        {intro ? <div className="mt-4 max-w-2xl text-lg text-muted-on-dark">{intro}</div> : null}
        {children}
      </Container>
    </section>
  );
}

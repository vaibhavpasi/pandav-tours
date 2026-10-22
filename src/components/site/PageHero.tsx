import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui";
import type { Photo } from "@/content/destinations";

export function PageHero({
  eyebrow,
  title,
  intro,
  photo,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  /** Optional background photo, darkened so the text stays readable. */
  photo?: Photo;
  children?: ReactNode;
}) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink text-paper">
      {photo ? (
        <>
          <div aria-hidden="true" className="parallax absolute inset-0 -z-10">
            <Image
              src={photo.src}
              alt=""
              fill
              preload
              placeholder="blur"
              sizes="100vw"
              className="animate-hero-zoom object-cover"
            />
          </div>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/75 to-ink/35" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgb(245_189_24/0.18),transparent_60%)]"
        />
      )}
      <Container className={photo ? "py-16 sm:py-24" : "py-12 sm:py-16"}>
        {eyebrow ? <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold sm:text-4xl lg:text-5xl">{title}</h1>
        {intro ? <div className="mt-4 max-w-2xl text-lg text-muted-on-dark">{intro}</div> : null}
        {children}
      </Container>
    </section>
  );
}

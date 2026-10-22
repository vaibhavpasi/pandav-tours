import type { ReactNode } from "react";
import { PhoneIcon, WhatsAppIcon } from "@/components/layout/Icons";
import { buttonClasses, ButtonLink, type ButtonSize, type ButtonVariant } from "@/components/ui";
import { businessContact } from "@/lib/constants";
import { formatPhoneForDisplay, telHref } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/*
 * Bookings are taken by phone. Every "book" action on the site points here:
 * a tel: link to NEXT_PUBLIC_BUSINESS_PHONE, with WhatsApp as the second
 * channel. If no number is configured, actions fall back to the contact page
 * rather than rendering a dead link.
 */

const DEFAULT_MESSAGE = "Hello Pandav Tours & Travel, I would like to book a cab.";

export function CallButton({
  size = "md",
  variant = "primary",
  className,
  children = "Call to book",
}: {
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
}) {
  const { phone } = businessContact();
  if (!phone) {
    return (
      <ButtonLink href="/contact" size={size} variant={variant} className={className}>
        <PhoneIcon className="size-5" />
        {children}
      </ButtonLink>
    );
  }
  return (
    <a href={telHref(phone)} className={buttonClasses({ size, variant }, className)}>
      <PhoneIcon className="size-5" />
      {children}
      <span className="sr-only"> on {formatPhoneForDisplay(phone)}</span>
    </a>
  );
}

export function WhatsAppButton({
  message = DEFAULT_MESSAGE,
  size = "md",
  variant = "outline",
  className,
  children = "WhatsApp",
}: {
  message?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
}) {
  const { whatsapp } = businessContact();
  if (!whatsapp) return null;
  return (
    <a
      href={buildWhatsAppUrl(whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses({ size, variant }, className)}
    >
      <WhatsAppIcon className="size-5" />
      {children}
      <span className="sr-only"> (opens WhatsApp)</span>
    </a>
  );
}

/** The number itself, large — people often dial by reading it. */
export function PhoneNumber({ className }: { className?: string }) {
  const { phone } = businessContact();
  if (!phone) return null;
  return (
    <a href={telHref(phone)} className={cn("font-extrabold tracking-tight tabular-nums hover:underline", className)}>
      {formatPhoneForDisplay(phone)}
    </a>
  );
}

const STEPS = [
  "Tell us your pickup, drop, date and time",
  "We suggest the right cab and confirm the full fare",
  "Your cab arrives — that's it",
];

/** Main booking card: big number, call + WhatsApp, and what happens on the call. */
export function CallBookingCard({
  title = "Book your cab with one call",
  message,
  tone = "light",
  className,
}: {
  title?: string;
  message?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "rounded-[1.75rem] p-6 sm:p-8",
        dark ? "on-dark bg-ink text-paper" : "bg-paper text-ink shadow-[0_24px_60px_-12px_rgb(0_0_0/0.45)]",
        className,
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={cn("text-sm font-semibold tracking-[0.2em] uppercase", dark ? "text-gold" : "text-gold-ink")}>
            Call to book
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{title}</h2>
          <PhoneNumber className={cn("mt-2 inline-block text-3xl sm:text-4xl", dark ? "text-gold" : "text-ink")} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <CallButton size="lg" className="w-full sm:w-auto">
            Call now
          </CallButton>
          <WhatsAppButton
            size="lg"
            message={message}
            variant={dark ? "outline-light" : "outline"}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
      <ol className={cn("mt-6 grid gap-3 border-t pt-6 sm:grid-cols-3", dark ? "border-paper/15" : "border-line")}>
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-start gap-3 text-sm">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold text-xs font-extrabold text-ink">
              {index + 1}
            </span>
            <span className={dark ? "text-paper/85" : "text-muted"}>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

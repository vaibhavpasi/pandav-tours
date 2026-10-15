import { businessContact } from "@/lib/constants";
import { telHref } from "@/lib/phone";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { PhoneIcon, WhatsAppIcon } from "./Icons";

const WHATSAPP_GREETING = "Hello Pandav Tours & Travel, I would like to enquire about a cab booking.";

/**
 * Persistent call + WhatsApp actions. On phones: a bottom bar (thumb-reach);
 * on larger screens: a floating WhatsApp button. Renders nothing for a
 * channel that isn't configured.
 */
export function FloatingActions() {
  const { phone, whatsapp } = businessContact();
  if (!phone && !whatsapp) return null;

  const whatsappUrl = whatsapp ? buildWhatsAppUrl(whatsapp, WHATSAPP_GREETING) : null;

  return (
    <>
      <div className="on-dark fixed inset-x-0 bottom-0 z-50 grid auto-cols-fr grid-flow-col border-t border-ink-soft bg-ink pb-[env(safe-area-inset-bottom)] sm:hidden">
        {phone ? (
          <a
            href={telHref(phone)}
            className="flex h-14 items-center justify-center gap-2 font-semibold text-paper"
          >
            <PhoneIcon className="size-5 text-gold" />
            Call now
          </a>
        ) : null}
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center gap-2 bg-gold font-semibold text-ink"
          >
            <WhatsAppIcon className="size-5" />
            WhatsApp
            <span className="sr-only">(opens WhatsApp)</span>
          </a>
        ) : null}
      </div>

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-6 bottom-6 z-50 hidden size-14 items-center justify-center rounded-full bg-gold text-ink shadow-card-hover transition-transform hover:scale-105 sm:inline-flex"
        >
          <WhatsAppIcon className="size-7" />
          <span className="sr-only">Chat with us on WhatsApp (opens WhatsApp)</span>
        </a>
      ) : null}
    </>
  );
}

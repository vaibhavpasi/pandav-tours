/**
 * WhatsApp click-to-chat links (https://wa.me/<number>?text=<message>).
 * Free, needs no API account. The number always comes from configuration,
 * never hard-coded. Booking confirmation messages are added in Phase 5.
 */

export function buildWhatsAppUrl(numberE164: string, message?: string): string {
  const digits = numberE164.replace(/\D/g, "");
  if (!/^[1-9]\d{7,14}$/.test(digits)) {
    throw new Error("WhatsApp number must be a valid international number");
  }
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

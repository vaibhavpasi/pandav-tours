/**
 * Booking references: "PT-" + 8 characters from a 32-symbol alphabet that
 * omits look-alikes (0/O, 1/I). 32^8 ≈ 1.1 × 10^12 combinations, generated
 * with a CSPRNG, so references are non-sequential and impractical to guess.
 * Status lookup additionally requires the customer's phone number and is
 * rate limited, so a reference alone never reveals a booking.
 */

export const BOOKING_REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const BOOKING_REFERENCE_PREFIX = "PT-";
export const BOOKING_REFERENCE_LENGTH = 8;

const PATTERN = new RegExp(
  `^${BOOKING_REFERENCE_PREFIX}[${BOOKING_REFERENCE_ALPHABET}]{${BOOKING_REFERENCE_LENGTH}}$`,
);

export function generateBookingReference(): string {
  // The alphabet has exactly 32 symbols, so `byte & 31` is uniform (256 is a
  // multiple of 32) and no rejection sampling is needed.
  const bytes = new Uint8Array(BOOKING_REFERENCE_LENGTH);
  globalThis.crypto.getRandomValues(bytes);
  let out = BOOKING_REFERENCE_PREFIX;
  for (const byte of bytes) {
    out += BOOKING_REFERENCE_ALPHABET[byte & 31];
  }
  return out;
}

/** Normalises user input ("pt-abcd 2345" → "PT-ABCD2345") and validates it. */
export function parseBookingReference(input: string): string | null {
  const compact = input.trim().toUpperCase().replace(/[\s-]/g, "");
  const body = compact.startsWith("PT") ? compact.slice(2) : compact;
  const candidate = `${BOOKING_REFERENCE_PREFIX}${body}`;
  return PATTERN.test(candidate) ? candidate : null;
}

export function isValidBookingReference(value: string): boolean {
  return PATTERN.test(value);
}

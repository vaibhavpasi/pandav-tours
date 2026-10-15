/**
 * Signed booking links ("/checkout?b=<token>").
 *
 * Customers have no accounts, so after creating a booking the server hands
 * back a link that proves possession: `<bookingId>.<expiresEpoch>.<hmac>`.
 * Without a valid signature no booking details are shown, and expired links
 * fall back to the reference + phone lookup on /booking-status.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const BOOKING_LINK_TTL_SECONDS = 7 * 24 * 60 * 60;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(`booking-link:v1:${payload}`).digest("base64url");
}

export function createBookingLinkToken(
  bookingId: string,
  secret: string,
  now: Date,
  ttlSeconds = BOOKING_LINK_TTL_SECONDS,
): string {
  if (!UUID_RE.test(bookingId)) throw new Error("Invalid booking id");
  const expires = Math.floor(now.getTime() / 1000) + ttlSeconds;
  const payload = `${bookingId}.${expires}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** Returns the booking id for a valid, unexpired token; otherwise null. */
export function verifyBookingLinkToken(token: string, secret: string, now: Date): string | null {
  if (typeof token !== "string" || token.length > 200) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [bookingId, expiresRaw, signature] = parts;
  if (!UUID_RE.test(bookingId) || !/^\d{1,12}$/.test(expiresRaw)) return null;

  const expected = Buffer.from(sign(`${bookingId}.${expiresRaw}`, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  if (Number(expiresRaw) * 1000 <= now.getTime()) return null;
  return bookingId;
}

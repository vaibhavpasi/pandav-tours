import { z } from "zod";
import { createBookingLinkToken } from "@/lib/booking/link-token";
import { createCabBooking, createPackageBooking } from "@/lib/booking/service";
import { bookingLinkSecret } from "@/lib/env.server";
import { parseBody, publicPost } from "@/lib/security/api";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/security/rate-limit";
import { jsonResponse } from "@/lib/security/request";
import { cabBookingSchema, packageBookingSchema } from "@/lib/validators/booking";

const requestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("cab"), booking: cabBookingSchema }),
  z.object({ kind: z.literal("package"), booking: packageBookingSchema }),
]);

/**
 * Creates a booking in `pending_payment`. The price is recomputed here from
 * the database; the browser never supplies an amount. Returns a signed link
 * to the checkout page.
 */
export const POST = publicPost(async (request) => {
  await enforceRateLimit(request, RATE_LIMITS.booking);
  const input = await parseBody(request, requestSchema);
  const now = new Date();

  const created =
    input.kind === "cab"
      ? await createCabBooking(input.booking, now)
      : await createPackageBooking(input.booking, now);

  const token = createBookingLinkToken(created.bookingId, bookingLinkSecret(), now);
  return jsonResponse(
    {
      reference: created.reference,
      totalPaise: created.totalPaise,
      paymentExpiresAt: created.paymentExpiresAt,
      checkoutUrl: `/checkout?b=${encodeURIComponent(token)}`,
    },
    201,
  );
});

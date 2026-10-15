import { lookupBookingStatus } from "@/lib/booking/service";
import { parseBody, publicPost } from "@/lib/security/api";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/security/rate-limit";
import { ApiError, jsonResponse } from "@/lib/security/request";
import { statusLookupSchema } from "@/lib/validators/booking";

/**
 * Customer status lookup. Needs the reference AND the phone number on the
 * booking; the same "not found" answer is given for any mismatch so the
 * endpoint can't be used to confirm that a reference exists.
 */
export const POST = publicPost(async (request) => {
  await enforceRateLimit(request, RATE_LIMITS.statusLookup);
  const { reference, phone } = await parseBody(request, statusLookupSchema);
  const booking = await lookupBookingStatus(reference, phone);
  if (!booking) {
    throw new ApiError(
      404,
      "not_found",
      "We couldn't find a booking with those details. Check the reference and the mobile number used when booking.",
    );
  }
  return jsonResponse({ booking });
});

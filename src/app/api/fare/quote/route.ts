import { quoteCabTrip } from "@/lib/booking/service";
import { parseBody, publicPost } from "@/lib/security/api";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/security/rate-limit";
import { jsonResponse } from "@/lib/security/request";
import { quoteRequestSchema } from "@/lib/validators/booking";

/** Server-computed fares for every vehicle category on a route. */
export const POST = publicPost(async (request) => {
  await enforceRateLimit(request, RATE_LIMITS.quote);
  const input = await parseBody(request, quoteRequestSchema);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- internal settings are not sent to the browser
  const { settings, ...quote } = await quoteCabTrip(input, new Date());
  return jsonResponse(quote);
});

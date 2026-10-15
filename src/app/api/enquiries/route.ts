import { createEnquiry } from "@/lib/booking/service";
import { parseBody, publicPost } from "@/lib/security/api";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/security/rate-limit";
import { jsonResponse } from "@/lib/security/request";
import { enquirySchema } from "@/lib/validators/booking";

export const POST = publicPost(async (request) => {
  await enforceRateLimit(request, RATE_LIMITS.enquiry);
  const input = await parseBody(request, enquirySchema);
  await createEnquiry(input);
  return jsonResponse({ ok: true }, 201);
});

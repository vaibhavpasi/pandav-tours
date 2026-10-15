/**
 * Per-client rate limiting backed by Postgres (public.consume_rate_limit).
 * The client IP is hashed with a server secret before it is used as a key,
 * so raw IP addresses are never stored.
 */
import "server-only";
import { createHash } from "node:crypto";
import { rateLimitSalt } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError, clientIp } from "./request";

export type RateLimitRule = { bucket: string; limit: number; windowSeconds: number };

export const RATE_LIMITS = {
  quote: { bucket: "quote", limit: 60, windowSeconds: 600 },
  booking: { bucket: "booking", limit: 10, windowSeconds: 3600 },
  enquiry: { bucket: "enquiry", limit: 10, windowSeconds: 3600 },
  statusLookup: { bucket: "status", limit: 20, windowSeconds: 3600 },
} as const satisfies Record<string, RateLimitRule>;

export function rateLimitKey(bucket: string, ip: string, salt: string): string {
  const digest = createHash("sha256").update(`${salt}:${ip}`).digest("base64url").slice(0, 32);
  return `${bucket}:${digest}`;
}

/** Throws a 429 ApiError when the client is over the limit. Fails closed. */
export async function enforceRateLimit(request: Request, rule: RateLimitRule): Promise<void> {
  const key = rateLimitKey(rule.bucket, clientIp(request.headers), rateLimitSalt());
  const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
    p_key: key,
    p_limit: rule.limit,
    p_window_seconds: rule.windowSeconds,
  });
  if (error) {
    console.error("[rate-limit] check failed", error.message);
    throw new ApiError(503, "unavailable", "Service temporarily unavailable. Please try again shortly.");
  }
  if (data !== true) {
    throw new ApiError(429, "rate_limited", "Too many requests. Please wait a few minutes and try again.");
  }
}

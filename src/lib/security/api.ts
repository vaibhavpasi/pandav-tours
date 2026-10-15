import "server-only";
import type { NextResponse } from "next/server";
import type { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { ApiError, assertSameOrigin, errorResponse, fieldErrors, readJsonBody } from "./request";

/**
 * Wraps a public POST handler: same-origin check, "not configured" guard and
 * uniform, non-leaky error responses.
 */
export function publicPost(handler: (request: Request) => Promise<NextResponse>) {
  return async function POST(request: Request): Promise<NextResponse> {
    try {
      assertSameOrigin(request);
      if (!isSupabaseConfigured()) {
        throw new ApiError(
          503,
          "not_configured",
          "Online booking isn't available right now. Please call or WhatsApp us to book.",
        );
      }
      return await handler(request);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Reads and validates a JSON body, turning schema issues into a 422. */
export async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.output<S>> {
  const body = await readJsonBody(request);
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(422, "invalid_input", "Please check the highlighted fields.", fieldErrors(result.error.issues));
  }
  return result.data;
}

/**
 * Helpers for public JSON API routes.
 *
 * CSRF: our endpoints only accept `application/json` bodies (which a plain
 * HTML form cannot send cross-site without a CORS preflight) AND reject
 * requests whose Origin header is not this site.
 */
import "server-only";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";

export const MAX_JSON_BYTES = 16 * 1024;

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string> };
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export function jsonResponse(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export function errorResponse(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof ApiError) {
    return jsonResponse(
      { error: { code: error.code, message: error.message, fields: error.fields } },
      error.status,
    ) as NextResponse<ApiErrorBody>;
  }
  // Never leak internals; log server-side only.
  console.error("[api] unexpected error", error);
  return jsonResponse(
    { error: { code: "internal_error", message: "Something went wrong. Please try again." } },
    500,
  ) as NextResponse<ApiErrorBody>;
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Browsers always send Origin on cross-site POSTs; same-origin fetches
    // may omit it. Fall back to Sec-Fetch-Site where available.
    const site = request.headers.get("sec-fetch-site");
    if (site && site !== "same-origin" && site !== "none") {
      throw new ApiError(403, "forbidden_origin", "Request not allowed.");
    }
    return;
  }
  const allowed = new Set([new URL(request.url).origin, new URL(appUrl()).origin]);
  if (!allowed.has(origin)) {
    throw new ApiError(403, "forbidden_origin", "Request not allowed.");
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Expected a JSON request.");
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_JSON_BYTES) {
    throw new ApiError(413, "payload_too_large", "Request is too large.");
  }
  const raw = await request.text();
  if (raw.length > MAX_JSON_BYTES) {
    throw new ApiError(413, "payload_too_large", "Request is too large.");
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "invalid_json", "Request body is not valid JSON.");
  }
}

/** Client IP as reported by Vercel's edge; "unknown" locally. */
export function clientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

/** Turns a Zod error into a field → message map (first message per field). */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_form";
    out[key] ??= issue.message;
  }
  return out;
}

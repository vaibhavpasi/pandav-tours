/**
 * Proxy (Next.js 16's replacement for middleware). Runs only for admin
 * routes and performs an *optimistic* check: no session → login page.
 *
 * This is NOT the authorisation boundary. Every admin page, Server Action
 * and Route Handler must still verify the user is active staff (Phase 4
 * data-access layer), and RLS enforces it again in the database.
 */
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession, withSessionCookies } from "@/lib/supabase/proxy";

const LOGIN_PATH = "/admin/login";

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // Fail closed if auth isn't configured yet.
  if (!isSupabaseConfigured()) {
    return noStore(
      isApi
        ? NextResponse.json({ error: "Admin is not configured" }, { status: 503 })
        : new NextResponse("Admin is not configured yet. See README.md → Supabase setup.", { status: 503 }),
    );
  }

  const { response, userId } = await updateSession(request);
  const isLoginPage = pathname === LOGIN_PATH;

  if (!userId && !isLoginPage) {
    if (isApi) {
      return noStore(withSessionCookies(response, NextResponse.json({ error: "Unauthorized" }, { status: 401 })));
    }
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return noStore(withSessionCookies(response, NextResponse.redirect(loginUrl)));
  }

  if (userId && isLoginPage) {
    return noStore(withSessionCookies(response, NextResponse.redirect(new URL("/admin", request.url))));
  }

  return noStore(response);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

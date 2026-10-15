/**
 * Per-request Supabase client for Server Components, Server Actions and
 * Route Handlers. Acts as the signed-in admin (if any), so RLS applies.
 *
 * With Cache Components enabled, anything that calls this reads cookies and
 * must render inside a <Suspense> boundary (or a route with `instant = false`).
 */
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabasePublicConfig } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = supabasePublicConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The session is refreshed in
          // src/proxy.ts for every admin request, so this is safe to ignore.
        }
      },
    },
  });
}

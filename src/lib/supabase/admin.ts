/**
 * Privileged Supabase client using the secret (service-role) key. It
 * BYPASSES Row Level Security, so:
 *   - only import it from server code (enforced by `server-only`);
 *   - only use it after validating input and authorising the caller;
 *   - prefer the per-request client in ./server.ts for admin pages, so RLS
 *     still applies to signed-in staff.
 * Database triggers (state machines, immutability, audit log) still apply.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabasePublicConfig } from "@/lib/env";
import { supabaseSecretKey } from "@/lib/env.server";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const { url } = supabasePublicConfig();
  return createClient<Database>(url, supabaseSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

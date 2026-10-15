/**
 * Browser Supabase client (publishable key only). Used by admin Client
 * Components for sign-in; everything it can do is limited by RLS.
 */
import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicConfig } from "@/lib/env";
import type { Database } from "@/types/database";

export function createClient() {
  const { url, publishableKey } = supabasePublicConfig();
  return createBrowserClient<Database>(url, publishableKey);
}

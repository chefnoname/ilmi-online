import "server-only"; // Build fails if a client component ever imports this.
import { createClient } from "@supabase/supabase-js";

/**
 * SERVICE ROLE client — bypasses RLS entirely.
 *
 * ⚠ Use ONLY for: payment-provider webhooks updating subscription_status,
 * and admin scripts. Never for request paths driven by user input without
 * explicit server-side authorisation first.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

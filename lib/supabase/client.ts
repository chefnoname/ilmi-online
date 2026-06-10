"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client — ANON KEY ONLY. RLS is the security boundary; this client
 * can never read another user's rows or paid content without an active
 * subscription, regardless of what the UI does.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

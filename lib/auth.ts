import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Server-side auth helpers. Every protected page/action calls these —
 * middleware redirects are convenience, THESE are the enforcement on the
 * app layer (and RLS is the enforcement on the data layer).
 */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  // RLS: only the user's own row is readable, no .eq('id', ...) needed —
  // but we add it for explicitness and index use.
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as Profile | null;
}

export function hasActiveSubscription(profile: Profile | null) {
  return profile?.subscription_status === "active";
}

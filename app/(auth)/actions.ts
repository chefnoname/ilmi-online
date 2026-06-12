"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth server actions. All validation + authorisation happens HERE on the
 * server; the forms are plain <form action={...}> with no client-side trust.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function err(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err("/signup", "Enter a valid email address.");
  if (password.length < 8) err("/signup", "Password must be at least 8 characters.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${SITE_URL}/auth/callback?next=/dashboard`,
    },
  });
  if (error) err("/signup", error.message);
  redirect("/verify-email");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "/dashboard");
  // Only allow internal redirect targets (open-redirect protection).
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) err("/login", "Invalid email or password.");
  // Analytics: one sign_in_events row per successful sign-in (RLS: the row's
  // user_id must be the just-signed-in caller). Failure is non-fatal.
  if (data?.user) {
    await supabase.from("sign_in_events").insert({ user_id: data.user.id });
  }
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const supabase = await createClient();
  // Always show success — do not reveal whether the email exists.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });
  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) err("/reset-password", "Password must be at least 8 characters.");

  const supabase = await createClient();
  // Requires the recovery session established by /auth/callback.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) err("/reset-password", error.message);
  redirect("/dashboard");
}

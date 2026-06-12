"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * ADMIN-ONLY server actions (students page).
 *
 * Security model:
 *  - requireAdmin() runs FIRST in every action — a non-admin caller is
 *    redirected before any service-role code executes.
 *  - The service-role client is used only AFTER that check, exclusively
 *    server-side. It never reaches the browser.
 *  - Passwords are hashed by Supabase Auth — admins can neither see nor set
 *    them. Reset/magic-link emails are the only password tooling, by design.
 */

const UUID_RE = /^[0-9a-f-]{36}$/i;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type ActionResult = { ok: boolean; message: string };

async function getTargetEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

/** Send Supabase's password-reset email to a student. */
export async function sendPasswordReset(userId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!UUID_RE.test(userId)) return { ok: false, message: "Invalid user id" };

  const email = await getTargetEmail(userId);
  if (!email) return { ok: false, message: "User not found" };

  const admin = createAdminClient();
  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });
  return error
    ? { ok: false, message: `Reset failed: ${error.message}` }
    : { ok: true, message: `Reset email sent to ${email}` };
}

/** Send a magic sign-in link to a student. */
export async function sendMagicLink(userId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!UUID_RE.test(userId)) return { ok: false, message: "Invalid user id" };

  const email = await getTargetEmail(userId);
  if (!email) return { ok: false, message: "User not found" };

  const admin = createAdminClient();
  const { error } = await admin.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback?next=/dashboard` },
  });
  return error
    ? { ok: false, message: `Magic link failed: ${error.message}` }
    : { ok: true, message: `Magic link sent to ${email}` };
}

/**
 * Grant free access ('comped') or revoke access ('inactive').
 *
 * 'comped' is kept SEPARATE from 'active' so revenue analytics exclude it,
 * while the content gates (has_active_subscription / isEntitled) treat it
 * the same as 'active'. Students can never set their own status: the
 * profiles trigger blocks every writer except the service role, so the only
 * writers are the Stripe webhook and these admin actions — each of which
 * logs a subscription_events row.
 */
export async function setStudentAccess(
  userId: string,
  status: "comped" | "inactive",
): Promise<ActionResult> {
  await requireAdmin();
  if (!UUID_RE.test(userId)) return { ok: false, message: "Invalid user id" };
  if (status !== "comped" && status !== "inactive") {
    return { ok: false, message: "Invalid status" };
  }

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .single();
  if (!current) return { ok: false, message: "Profile not found" };
  if (current.subscription_status === status) {
    return { ok: true, message: `Already ${status}` };
  }

  const { error } = await admin
    .from("profiles")
    .update({ subscription_status: status })
    .eq("id", userId);
  if (error) return { ok: false, message: error.message };

  // Analytics trail: every status change is logged (source 'admin').
  await admin.from("subscription_events").insert({
    user_id: userId,
    old_status: current.subscription_status,
    new_status: status,
    source: "admin",
  });

  revalidatePath("/admin/students");
  return { ok: true, message: status === "comped" ? "Free access granted" : "Access revoked" };
}

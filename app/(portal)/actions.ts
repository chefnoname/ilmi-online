"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

/**
 * Portal server actions. Every action re-authenticates on the server and
 * writes through the user-scoped (anon key) client, so RLS enforces that
 * users only ever write their OWN progress/profile rows.
 */

const UUID_RE = /^[0-9a-f-]{36}$/i;

/**
 * Upsert the caller's progress for a lesson. Used by the player (on play /
 * ended) and the "Mark as complete" button. RLS: user_id is forced to the
 * caller and the lesson must be visible to them.
 */
export async function recordProgress(lessonId: string, completed: boolean) {
  if (!UUID_RE.test(lessonId)) return { ok: false as const };
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  revalidatePath("/dashboard");
  return { ok: !error };
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  if (!fullName) redirect("/account?error=Name+cannot+be+empty");

  // RLS restricts the update to the user's own row; the DB trigger blocks
  // any attempt to modify billing columns here.
  await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  revalidatePath("/account");
  redirect("/account?saved=1");
}

/**
 * Post a "benefit" (fā'ida) under a lesson. Author name is snapshotted from
 * the caller's own profile (readable under RLS) so other users' profiles
 * never need to be readable. RLS forces user_id = auth.uid() and verifies
 * the lesson is visible to the caller.
 */
export async function addBenefit(formData: FormData) {
  const lessonId = String(formData.get("lesson_id") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!UUID_RE.test(lessonId) || !body) return { ok: false as const };

  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const authorName = profile?.full_name?.trim() || user.email?.split("@")[0] || "Student";

  const { error } = await supabase.from("benefits").insert({
    lesson_id: lessonId,
    user_id: user.id,
    author_name: authorName,
    body,
  });

  revalidatePath(`/dashboard/lessons/${lessonId}`);
  return { ok: !error };
}

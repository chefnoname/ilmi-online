"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

/**
 * Portal server actions. Every action re-authenticates on the server and
 * writes through the user-scoped (anon key) client, so RLS enforces:
 *  - users can only write their own enrollment/progress rows,
 *  - progress can only reference lessons the user is allowed to see,
 *  - enrolment in paid courses requires an active subscription.
 */

export async function enrollInCourse(formData: FormData) {
  const { supabase, user } = await requireUser();
  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("course_slug") ?? "");

  // RLS "enrollments: insert own, access-checked" rejects paid courses for
  // non-subscribers — we surface that as an upgrade prompt.
  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, course_id: courseId });

  if (error && !error.message.includes("duplicate")) {
    redirect(`/account?upgrade=1`);
  }
  revalidatePath("/dashboard");
  redirect(`/dashboard/courses/${slug}`);
}

export async function markLessonProgress(formData: FormData) {
  const { supabase, user } = await requireUser();
  const lessonId = String(formData.get("lesson_id") ?? "");
  const courseSlug = String(formData.get("course_slug") ?? "");
  const lessonSlug = String(formData.get("lesson_slug") ?? "");
  const completed = formData.get("completed") === "true";

  // Upsert own progress; RLS verifies the lesson is visible to this user.
  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  revalidatePath(`/dashboard/courses/${courseSlug}/${lessonSlug}`);
  revalidatePath("/dashboard");
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

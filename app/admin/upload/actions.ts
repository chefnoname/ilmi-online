"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createDirectUpload } from "@/lib/mux";

/**
 * ADMIN-ONLY content actions.
 *
 * Every action calls requireAdmin() first. Content writes then go through
 * the admin's OWN session (anon-key client) so the database's admin-only
 * RLS policies (0004) enforce them a second time — defence in depth. Only
 * the Mux direct-upload call touches secrets, and that stays server-side.
 */

const UUID_RE = /^[0-9a-f-]{36}$/i;
type Result = { ok: boolean; message?: string };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

function refresh() {
  revalidatePath("/admin/upload");
  revalidatePath("/dashboard"); // students see changes on fresh reload
}

/* ── Topics ─────────────────────────────────────────────────────────────── */

export async function createTopic(formData: FormData): Promise<Result> {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  if (!title) return { ok: false, message: "Title required" };
  const { count } = await supabase.from("topics").select("*", { count: "exact", head: true });
  const { error } = await supabase
    .from("topics")
    .insert({ title, slug: slugify(title), sort_order: (count ?? 0) + 1 });
  refresh();
  return { ok: !error, message: error?.message };
}

export async function renameTopic(id: string, title: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(id) || !title.trim()) return { ok: false, message: "Invalid input" };
  const { error } = await supabase.from("topics").update({ title: title.trim().slice(0, 120) }).eq("id", id);
  refresh();
  return { ok: !error, message: error?.message };
}

/** Swap sort_order with the neighbour above/below (rail order on dashboard). */
export async function moveTopic(id: string, direction: "up" | "down"): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, message: "Invalid id" };
  const { data } = await supabase.from("topics").select("id, sort_order").order("sort_order");
  const list = data ?? [];
  const idx = list.findIndex((t) => t.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return { ok: true };
  await supabase.from("topics").update({ sort_order: list[swapIdx].sort_order }).eq("id", list[idx].id);
  await supabase.from("topics").update({ sort_order: list[idx].sort_order }).eq("id", list[swapIdx].id);
  refresh();
  return { ok: true };
}

/* ── Subjects ───────────────────────────────────────────────────────────── */

export async function createSubject(formData: FormData): Promise<Result> {
  const { supabase } = await requireAdmin();
  const topicId = String(formData.get("topic_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  if (!UUID_RE.test(topicId) || !title) return { ok: false, message: "Invalid input" };
  const { count } = await supabase
    .from("subjects")
    .select("*", { count: "exact", head: true })
    .eq("topic_id", topicId);
  const { error } = await supabase
    .from("subjects")
    .insert({ topic_id: topicId, title, slug: slugify(title), sort_order: (count ?? 0) + 1 });
  refresh();
  return { ok: !error, message: error?.message };
}

export async function renameSubject(id: string, title: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(id) || !title.trim()) return { ok: false, message: "Invalid input" };
  const { error } = await supabase.from("subjects").update({ title: title.trim().slice(0, 120) }).eq("id", id);
  refresh();
  return { ok: !error, message: error?.message };
}

export async function moveSubject(id: string, direction: "up" | "down"): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, message: "Invalid id" };
  const { data: subject } = await supabase.from("subjects").select("topic_id").eq("id", id).single();
  if (!subject) return { ok: false, message: "Not found" };
  const { data } = await supabase
    .from("subjects")
    .select("id, sort_order")
    .eq("topic_id", subject.topic_id)
    .order("sort_order");
  const list = data ?? [];
  const idx = list.findIndex((s) => s.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return { ok: true };
  await supabase.from("subjects").update({ sort_order: list[swapIdx].sort_order }).eq("id", list[idx].id);
  await supabase.from("subjects").update({ sort_order: list[idx].sort_order }).eq("id", list[swapIdx].id);
  refresh();
  return { ok: true };
}

/* ── Lessons ────────────────────────────────────────────────────────────── */

/** Create a lesson BEFORE its video exists (mux_playback_id stays null). */
export async function createLesson(formData: FormData): Promise<Result> {
  const { supabase } = await requireAdmin();
  const subjectId = String(formData.get("subject_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 160);
  if (!UUID_RE.test(subjectId) || !title) return { ok: false, message: "Invalid input" };
  const { data: existing } = await supabase
    .from("lessons")
    .select("lesson_number")
    .eq("subject_id", subjectId)
    .order("lesson_number", { ascending: false })
    .limit(1);
  const nextNumber = (existing?.[0]?.lesson_number ?? 0) + 1;
  const { error } = await supabase.from("lessons").insert({
    subject_id: subjectId,
    title,
    lesson_number: nextNumber,
    sort_order: nextNumber,
  });
  refresh();
  return { ok: !error, message: error?.message };
}

export async function renameLesson(id: string, title: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(id) || !title.trim()) return { ok: false, message: "Invalid input" };
  const { error } = await supabase.from("lessons").update({ title: title.trim().slice(0, 160) }).eq("id", id);
  refresh();
  return { ok: !error, message: error?.message };
}

/**
 * Swap lesson_number (and sort_order) with the neighbour. Three-step swap
 * because (subject_id, lesson_number) is unique.
 */
export async function moveLesson(id: string, direction: "up" | "down"): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, message: "Invalid id" };
  const { data: lesson } = await supabase.from("lessons").select("subject_id").eq("id", id).single();
  if (!lesson) return { ok: false, message: "Not found" };
  const { data } = await supabase
    .from("lessons")
    .select("id, lesson_number")
    .eq("subject_id", lesson.subject_id)
    .order("lesson_number");
  const list = data ?? [];
  const idx = list.findIndex((l) => l.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return { ok: true };
  const a = list[idx];
  const b = list[swapIdx];
  await supabase.from("lessons").update({ lesson_number: -1, sort_order: -1 }).eq("id", a.id);
  await supabase.from("lessons").update({ lesson_number: a.lesson_number, sort_order: a.lesson_number }).eq("id", b.id);
  await supabase.from("lessons").update({ lesson_number: b.lesson_number, sort_order: b.lesson_number }).eq("id", a.id);
  refresh();
  return { ok: true };
}

/**
 * Soft archive — hides the lesson from students (rails, playlists, direct
 * access, token route) but keeps it restorable here. The Mux asset is NOT
 * deleted (Mux deletion is irreversible and handled manually in Mux).
 */
export async function setLessonArchived(id: string, archived: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, message: "Invalid id" };
  const { error } = await supabase.from("lessons").update({ is_archived: archived }).eq("id", id);
  refresh();
  return { ok: !error, message: error?.message };
}

/* ── Mux direct upload ──────────────────────────────────────────────────── */

/**
 * Step 1 of the upload lifecycle: mint a Mux DIRECT UPLOAD URL (browser
 * uploads straight to Mux, never through our server). The admin's policy
 * toggle decides everything in one place:
 *   'public'  → Mux asset public,  lesson is_free = true
 *   'signed'  → Mux asset signed,  lesson is_free = false
 * The lesson is marked awaiting_upload; the client flips it to processing
 * after the PUT completes; the video.asset.ready webhook flips it to ready.
 */
export async function requestUploadUrl(
  lessonId: string,
  access: "public" | "signed",
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(lessonId)) return { ok: false, message: "Invalid lesson id" };
  if (access !== "public" && access !== "signed") return { ok: false, message: "Invalid policy" };

  try {
    const { uploadId, url } = await createDirectUpload(lessonId, access);
    const { error } = await supabase
      .from("lessons")
      .update({
        mux_upload_id: uploadId,
        mux_status: "awaiting_upload",
        mux_playback_policy: access,
        is_free: access === "public",
      })
      .eq("id", lessonId);
    if (error) return { ok: false, message: error.message };
    refresh();
    return { ok: true, url };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Mux upload request failed" };
  }
}

/** Step 2: browser finished the PUT to Mux — mark as processing. */
export async function markUploadComplete(lessonId: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(lessonId)) return { ok: false, message: "Invalid lesson id" };
  const { error } = await supabase
    .from("lessons")
    .update({ mux_status: "processing" })
    .eq("id", lessonId)
    .eq("mux_status", "awaiting_upload");
  refresh();
  return { ok: !error, message: error?.message };
}

/* ── App settings (Box Promo) ───────────────────────────────────────────── */

export async function setBoxPromoSubject(subjectId: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(subjectId)) return { ok: false, message: "Invalid subject" };
  const { error } = await supabase
    .from("app_settings")
    .update({ featured_subject_id: subjectId, updated_at: new Date().toISOString() })
    .eq("id", true);
  refresh();
  return { ok: !error, message: error?.message };
}

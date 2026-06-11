import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEntitled, signPlaybackTokens } from "@/lib/mux";
import type { Lesson, Profile } from "@/lib/types";

/**
 * POST /api/mux/playback-token  { lessonId }
 *
 * THE access gate for paid video. Mints short-lived signed Mux tokens only
 * after verifying, server-side:
 *   (a) the caller is authenticated, and
 *   (b) the lesson is free, OR the caller's profile has an entitled
 *       subscription_status ('active' / 'trialing').
 *
 * The Mux signing key never leaves the server; a non-subscriber receives
 * 403 for paid lessons no matter what the UI shows. Tokens expire in 1h.
 */
export async function POST(request: Request) {
  // 1. AuthN — request runs as the signed-in user (anon key + cookies).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Validate input.
  let lessonId: unknown;
  try {
    ({ lessonId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof lessonId !== "string" || !/^[0-9a-f-]{36}$/i.test(lessonId)) {
    return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });
  }

  // 3. Load the lesson under RLS (authenticated read).
  const { data: lessonData } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lessonData) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  const lesson = lessonData as Lesson;

  if (!lesson.mux_playback_id) {
    return NextResponse.json({ error: "Video not yet available" }, { status: 409 });
  }

  // 4. AuthZ — entitlement check (RLS lets users read only their own profile).
  if (!lesson.is_free) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();
    if (!isEntitled(profile as Pick<Profile, "subscription_status"> | null)) {
      return NextResponse.json(
        { error: "An active subscription is required for this lesson" },
        { status: 403 },
      );
    }
  }

  // 5. Mint short-lived signed tokens (video + thumbnail + storyboard).
  const tokens = await signPlaybackTokens(lesson.mux_playback_id);
  return NextResponse.json({ playbackId: lesson.mux_playback_id, tokens });
}

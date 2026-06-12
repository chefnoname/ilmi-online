import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonMain } from "@/components/portal/lesson-main";
import { LessonPlaylist } from "@/components/portal/lesson-playlist";
import { requireUser, getProfile, hasActiveSubscription } from "@/lib/auth";
import type { Benefit, Lesson, Progress, Subject } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Lesson page: two-column layout — dark player surface + meta + prev/next +
 * benefits in the main column, same-subject playlist on the right (stacks
 * below on mobile).
 *
 * Access is enforced server-side: a non-entitled user on a paid lesson gets
 * the upgrade screen (no player, no token fetch); the Mux signed-token route
 * remains the un-bypassable gate regardless of what renders here.
 */
export default async function LessonPage({ params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const { supabase } = await requireUser();
  const profile = await getProfile();
  const entitled = hasActiveSubscription(profile);

  const { data: lessonData } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!lessonData) notFound();
  const lesson = lessonData as Lesson;
  // Archived lessons are hidden from students (admin console can restore).
  if (lesson.is_archived) notFound();

  const [
    { data: subjectData },
    { data: siblingData },
    { data: progressData },
    { data: benefitData },
  ] = await Promise.all([
    supabase.from("subjects").select("*").eq("id", lesson.subject_id).single(),
    // Playlist + prev/next source: all lessons in this subject by lesson_number
    supabase
      .from("lessons")
      .select("*")
      .eq("subject_id", lesson.subject_id)
      .eq("is_archived", false) // archived lessons never appear in playlists
      .order("lesson_number"),
    supabase.from("progress").select("*"), // own rows only (RLS)
    supabase
      .from("benefits")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  const subject = subjectData as Subject | null;
  if (!subject) notFound();
  const siblings = (siblingData ?? []) as Lesson[];
  const progress = (progressData ?? []) as Progress[];
  const benefits = (benefitData ?? []) as Benefit[];

  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? siblings[idx - 1] : null; // disabled on first lesson
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null; // disabled on last
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));

  const allowed = lesson.is_free || entitled;

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      {/* Two columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {allowed ? (
            <LessonMain
              lesson={{
                id: lesson.id,
                title: lesson.title,
                lesson_number: lesson.lesson_number,
                mux_playback_id: lesson.mux_playback_id,
                mux_playback_policy: lesson.mux_playback_policy,
              }}
              subjectTitle={subject.title}
              prev={prev ? { id: prev.id, title: prev.title } : null}
              next={next ? { id: next.id, title: next.title } : null}
              completed={completedIds.has(lesson.id)}
              benefits={benefits}
            />
          ) : (
            /* Paid lesson, no subscription: upgrade screen on the dark surface */
            <div className="flex flex-col items-center gap-5 rounded-lg bg-[#2a2a2a] p-10 text-center shadow-lg">
              <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-brand-yellow/20">
                <Lock className="h-8 w-8 text-brand-yellow" />
              </span>
              <h1 className="display-sub text-2xl text-white">Subscribe to watch this lesson</h1>
              <p className="max-w-md text-sm text-white/70">
                <span className="font-bold text-white">{lesson.title}</span> ({subject.title},
                Lesson {lesson.lesson_number}) is part of the paid curriculum. One subscription
                unlocks every lesson on Ilmi.
              </p>
              <div className="flex gap-3">
                <form action="/api/stripe/checkout" method="POST">
                  <Button type="submit" variant="cta" size="lg">
                    Subscribe Now
                  </Button>
                </form>
                <Button asChild variant="ghostOnDark" size="lg">
                  <Link href="/account">Billing &amp; Account</Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: playlist of this subject's lessons */}
        <LessonPlaylist
          subject={subject}
          lessons={siblings}
          currentLessonId={lesson.id}
          entitled={entitled}
          completedIds={completedIds}
        />
      </div>
    </div>
  );
}

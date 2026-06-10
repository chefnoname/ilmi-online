import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markLessonProgress } from "@/app/(portal)/actions";
import { requireUser, getProfile, hasActiveSubscription } from "@/lib/auth";
import type { Course, Lesson, LessonProgress } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Lesson player — the paid asset. Access control happens in the DATABASE:
 * the lesson query runs as the signed-in user, so RLS returns the row (and
 * video_url) only if the lesson is a preview, the course is free tier, or
 * the user has an active subscription. If RLS filters it out we show the
 * upgrade screen. No client-side gating involved.
 */
export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonSlug: string };
}) {
  const { supabase } = await requireUser();

  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", params.slug)
    .single();
  if (!courseData) notFound();
  const course = courseData as Course;

  const { data: lessonData } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .eq("slug", params.lessonSlug)
    .maybeSingle();

  // Row invisible under RLS → either it doesn't exist or it's paid content
  // this user can't access. Don't distinguish; offer the upgrade path.
  if (!lessonData) {
    const profile = await getProfile();
    if (course.tier === "paid" && !hasActiveSubscription(profile)) {
      return (
        <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-brand-yellow/20">
            <Lock className="h-8 w-8 text-brand-forest" />
          </span>
          <h1 className="display-sub text-2xl text-brand-carbon">Subscribe to watch this lesson</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            <span className="font-bold">{course.title}</span> is part of the Premium library. One
            subscription unlocks every course and lesson on Ilmi Online.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="cta" size="lg">
              <Link href="/account">Subscribe Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/dashboard/courses/${course.slug}`}>Back to Course</Link>
            </Button>
          </div>
        </div>
      );
    }
    notFound();
  }
  const lesson = lessonData as Lesson;

  // Siblings for prev/next (RLS-filtered for this user) + own progress.
  const [{ data: siblingsData }, { data: progressData }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, slug, title, position")
      .eq("course_id", course.id)
      .order("position"),
    supabase.from("lesson_progress").select("*").eq("lesson_id", lesson.id).maybeSingle(),
  ]);
  const siblings = siblingsData ?? [];
  const idx = siblings.findIndex((s) => s.id === lesson.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const progressRow = progressData as LessonProgress | null;

  return (
    <div className="container max-w-4xl space-y-6 py-10">
      <Link
        href={`/dashboard/courses/${course.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-forest hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> {course.title}
      </Link>

      {/* Player — video_url only reached this page because RLS allowed it */}
      <div className="overflow-hidden rounded-lg bg-brand-carbon shadow-lg">
        <video
          key={lesson.id}
          controls
          className="aspect-video w-full"
          src={lesson.video_url}
          poster=""
        >
          Your browser does not support embedded video.
        </video>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="display-sub text-2xl text-brand-carbon">{lesson.title}</h1>
            {lesson.is_preview && <Badge variant="yellow">Preview</Badge>}
          </div>
          <p className="prose-body max-w-2xl text-sm text-muted-foreground">{lesson.description}</p>
        </div>

        <form action={markLessonProgress}>
          <input type="hidden" name="lesson_id" value={lesson.id} />
          <input type="hidden" name="course_slug" value={course.slug} />
          <input type="hidden" name="lesson_slug" value={lesson.slug} />
          <input type="hidden" name="completed" value={progressRow?.completed ? "false" : "true"} />
          <Button type="submit" variant={progressRow?.completed ? "outline" : "primary"}>
            <CheckCircle2 className="h-4 w-4" />
            {progressRow?.completed ? "Completed — undo" : "Mark as Complete"}
          </Button>
        </form>
      </div>

      <div className="flex items-center justify-between border-t pt-6">
        {prev ? (
          <Button asChild variant="ghost">
            <Link href={`/dashboard/courses/${course.slug}/${prev.slug}`}>
              <ArrowLeft className="h-4 w-4" /> {prev.title}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="secondary">
            <Link href={`/dashboard/courses/${course.slug}/${next.slug}`}>
              {next.title} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Lock, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { enrollInCourse } from "@/app/(portal)/actions";
import { requireUser, getProfile, hasActiveSubscription } from "@/lib/auth";
import { cn, formatMinutes } from "@/lib/utils";
import type { Course, Lesson, LessonProgress } from "@/lib/types";

export const dynamic = "force-dynamic";

const GRADIENTS: Record<string, string> = {
  warm: "bg-brand-warm",
  cool: "bg-brand-cool",
  deep: "bg-brand-deep",
};

/**
 * Course overview inside the portal. RLS controls which lesson rows are
 * returned: a free-tier user on a paid course sees preview lessons only —
 * the rest are rendered as locked placeholders WITHOUT any protected data
 * (we only know how many exist from the course's public lesson count? No —
 * we deliberately do not leak titles; locked rows are generic).
 */
export default async function PortalCoursePage({ params }: { params: { slug: string } }) {
  const { supabase, user } = await requireUser();
  const profile = await getProfile();
  const subscribed = hasActiveSubscription(profile);

  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", params.slug)
    .single();
  if (!courseData) notFound();
  const course = courseData as Course;

  const [{ data: lessonData }, { data: enrollment }, { data: progressData }] = await Promise.all([
    supabase.from("lessons").select("*").eq("course_id", course.id).order("position"),
    supabase.from("enrollments").select("id").eq("course_id", course.id).maybeSingle(),
    supabase.from("lesson_progress").select("*"),
  ]);
  const lessons = (lessonData ?? []) as Lesson[];
  const progress = (progressData ?? []) as LessonProgress[];
  const locked = course.tier === "paid" && !subscribed;

  return (
    <div className="container space-y-8 py-10">
      <section className={cn("relative overflow-hidden rounded-lg p-8 text-white sm:p-10", GRADIENTS[course.gradient] ?? "bg-brand-warm")}>
        <KuficPattern className="text-white" opacity={0.08} />
        <div className="relative space-y-3">
          <Badge variant={course.tier === "free" ? "yellow" : "onDark"}>
            {course.tier === "free" ? "Free Course" : "Premium Course"}
          </Badge>
          <h1 className="display text-3xl sm:text-4xl">{course.title}</h1>
          <p className="max-w-xl text-white/95">{course.tagline}</p>
          <p className="text-sm font-semibold text-white/85">
            {course.scholar_name} — {course.scholar_title}
          </p>
          {!enrollment && !locked && (
            <form action={enrollInCourse}>
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="course_slug" value={course.slug} />
              <Button type="submit" variant="cta" className="mt-2">
                Enrol in This Course
              </Button>
            </form>
          )}
        </div>
      </section>

      {locked && (
        <section className="flex flex-col items-center gap-4 rounded-lg border-2 border-brand-yellow/60 bg-white p-8 text-center shadow-sm">
          <Lock className="h-8 w-8 text-brand-forest" />
          <h2 className="display-sub text-lg text-brand-carbon">This is a Premium course</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Preview lessons below are free. Subscribe to unlock the full curriculum — and every
            other course in the library.
          </p>
          <Button asChild variant="cta">
            <Link href="/account">Subscribe to Unlock</Link>
          </Button>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="display-sub text-lg text-brand-carbon">Lessons</h2>
        <ol className="space-y-3">
          {lessons.map((lesson) => {
            const p = progress.find((x) => x.lesson_id === lesson.id);
            return (
              <li key={lesson.id}>
                <Link
                  href={`/dashboard/courses/${course.slug}/${lesson.slug}`}
                  className="flex items-center gap-4 rounded-md border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brand-green/15 text-sm font-bold text-brand-forest">
                    {lesson.position}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{lesson.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{lesson.description}</p>
                  </div>
                  {lesson.is_preview && <Badge variant="yellow">Preview</Badge>}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatMinutes(lesson.duration_minutes)}
                  </span>
                  {p?.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-brand-green" />
                  ) : (
                    <PlayCircle className="h-5 w-5 text-brand-green/50" />
                  )}
                </Link>
              </li>
            );
          })}
          {locked && (
            <li className="flex items-center gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-brand-forest" />
              Remaining lessons are hidden until your subscription is active.
            </li>
          )}
        </ol>
      </section>
    </div>
  );
}

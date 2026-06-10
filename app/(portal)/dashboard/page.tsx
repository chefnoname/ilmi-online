import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CourseCard } from "@/components/site/course-card";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { requireUser, getProfile, hasActiveSubscription } from "@/lib/auth";
import type { Course, Enrollment, Lesson, LessonProgress } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const profile = await getProfile();
  const subscribed = hasActiveSubscription(profile);

  // All queries below run under RLS as this user — only their own
  // enrollments/progress and only lessons they may access are returned.
  const [{ data: enrollData }, { data: progressData }, { data: courseData }] = await Promise.all([
    supabase.from("enrollments").select("*").order("enrolled_at", { ascending: false }),
    supabase.from("lesson_progress").select("*").order("updated_at", { ascending: false }),
    supabase.from("courses").select("*").order("position"),
  ]);
  const enrollments = (enrollData ?? []) as Enrollment[];
  const progress = (progressData ?? []) as LessonProgress[];
  const courses = (courseData ?? []) as Course[];

  const enrolledCourses = courses.filter((c) => enrollments.some((e) => e.course_id === c.id));
  const otherCourses = courses.filter((c) => !enrollments.some((e) => e.course_id === c.id));

  // Continue watching: latest progress row that isn't completed.
  const continueRow = progress.find((p) => !p.completed) ?? progress[0];
  let continueLesson: (Lesson & { courseSlug: string; courseTitle: string }) | null = null;
  if (continueRow) {
    const { data: l } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", continueRow.lesson_id)
      .single();
    if (l) {
      const course = courses.find((c) => c.id === (l as Lesson).course_id);
      if (course)
        continueLesson = { ...(l as Lesson), courseSlug: course.slug, courseTitle: course.title };
    }
  }

  // Per-course completion (counts only lessons visible to this user).
  const courseCompletion = new Map<string, { done: number; total: number }>();
  if (enrolledCourses.length) {
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("id, course_id")
      .in("course_id", enrolledCourses.map((c) => c.id));
    for (const c of enrolledCourses) {
      const lessonIds = (lessonsData ?? []).filter((l) => l.course_id === c.id).map((l) => l.id);
      const done = progress.filter((p) => lessonIds.includes(p.lesson_id) && p.completed).length;
      courseCompletion.set(c.id, { done, total: lessonIds.length });
    }
  }

  const firstName =
    profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Student";

  return (
    <div className="container space-y-12 py-10">
      {/* Greeting */}
      <section className="relative overflow-hidden rounded-lg bg-brand-warm p-8 text-white sm:p-10">
        <KuficPattern className="text-white" opacity={0.08} />
        <div className="relative space-y-3">
          <p className="arabic text-xl text-white/90">السلام عليكم</p>
          <h1 className="display text-3xl sm:text-4xl">Welcome back, {firstName}</h1>
          <div className="flex items-center gap-3 pt-1">
            <Badge variant={subscribed ? "yellow" : "onDark"}>
              {subscribed ? "Premium Student" : "Free Account"}
            </Badge>
            {!subscribed && (
              <Link href="/account" className="text-sm font-semibold underline underline-offset-4">
                Upgrade for full access
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Continue watching */}
      {continueLesson && (
        <section className="space-y-4">
          <h2 className="display-sub text-lg text-brand-carbon">Continue watching</h2>
          <Link
            href={`/dashboard/courses/${continueLesson.courseSlug}/${continueLesson.slug}`}
            className="flex items-center gap-5 rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-pill bg-brand-green text-white">
              <PlayCircle className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-forest">
                {continueLesson.courseTitle}
              </p>
              <p className="truncate text-lg font-bold">{continueLesson.title}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-brand-green" />
          </Link>
        </section>
      )}

      {/* Enrolled courses with progress */}
      <section className="space-y-4">
        <h2 className="display-sub text-lg text-brand-carbon">My courses</h2>
        {enrolledCourses.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-white p-10 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t enrolled in a course yet — pick one below to begin.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((c) => {
              const comp = courseCompletion.get(c.id) ?? { done: 0, total: 0 };
              const pct = comp.total ? Math.round((comp.done / comp.total) * 100) : 0;
              return (
                <div key={c.id} className="space-y-0 overflow-hidden rounded-lg border bg-white shadow-sm">
                  <CourseCard course={c} href={`/dashboard/courses/${c.slug}`} />
                  <div className="space-y-2 border-t p-5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{pct}% complete</span>
                      <span className="text-muted-foreground">
                        {comp.done}/{comp.total} lessons
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Explore */}
      {otherCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="display-sub text-lg text-brand-carbon">Explore the library</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/courses">View all</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherCourses.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} href={`/dashboard/courses/${c.slug}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

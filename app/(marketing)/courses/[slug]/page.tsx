import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, GraduationCap, Lock, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { createClient } from "@/lib/supabase/server";
import { formatMinutes, cn } from "@/lib/utils";
import type { Course, Lesson } from "@/lib/types";

export const dynamic = "force-dynamic";

const GRADIENTS: Record<string, string> = {
  warm: "bg-brand-warm",
  cool: "bg-brand-cool",
  deep: "bg-brand-deep",
};

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", params.slug)
    .single();
  if (!courseData) notFound();
  const course = courseData as Course;

  // RLS decides which lessons this viewer can see: anon visitors get preview
  // lessons only; the syllabus outline below uses what's returned. The video
  // itself is only in rows RLS allowed.
  const { data: lessonData } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("position");
  const visibleLessons = (lessonData ?? []) as Lesson[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <section className={cn("relative overflow-hidden", GRADIENTS[course.gradient] ?? "bg-brand-warm")}>
        <KuficPattern className="text-white" opacity={0.09} />
        <div className="container relative flex flex-col items-start gap-5 py-16">
          <Badge variant={course.tier === "free" ? "yellow" : "onDark"}>
            {course.tier === "free" ? "Free Course" : "Premium Course"}
          </Badge>
          <h1 className="display max-w-3xl text-4xl text-white sm:text-5xl">{course.title}</h1>
          <p className="max-w-xl text-lg text-white/95">{course.tagline}</p>
          <p className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <GraduationCap className="h-5 w-5" />
            {course.scholar_name} — {course.scholar_title}
          </p>
          <Button asChild variant="cta" size="lg">
            <Link href={user ? `/dashboard/courses/${course.slug}` : "/signup"}>
              {user ? "Open in Student Portal" : "Get Started — Free"}
            </Link>
          </Button>
        </div>
      </section>

      <section className="container grid gap-12 py-16 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <h2 className="display-sub text-xl text-brand-carbon">About this course</h2>
          <p className="prose-body max-w-2xl leading-relaxed text-brand-carbon/85">{course.description}</p>

          <h2 className="display-sub pt-4 text-xl text-brand-carbon">Syllabus</h2>
          <ol className="space-y-3">
            {visibleLessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-center gap-4 rounded-md border bg-white p-4 shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brand-green/15 text-sm font-bold text-brand-forest">
                  {lesson.position}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{lesson.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{lesson.description}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatMinutes(lesson.duration_minutes)}
                </span>
                {lesson.is_preview ? (
                  <Badge variant="yellow">Preview</Badge>
                ) : (
                  <PlayCircle className="h-5 w-5 text-brand-green" />
                )}
              </li>
            ))}
            {course.tier === "paid" && (
              <li className="flex items-center gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-brand-forest" />
                Full syllabus unlocks with a subscription — previews above are free for everyone.
              </li>
            )}
          </ol>
        </div>

        <aside className="h-fit space-y-4 rounded-lg border bg-muted p-7">
          <h3 className="display-sub text-base text-brand-carbon">
            {course.tier === "free" ? "Included with a free account" : "Included with Premium"}
          </h3>
          <ul className="space-y-2 text-sm text-brand-carbon/85">
            <li>• Full lesson library for this course</li>
            <li>• Progress tracking + continue watching</li>
            <li>• New lessons as they are released</li>
          </ul>
          <Button asChild variant="cta" className="w-full">
            <Link href={user ? "/account" : "/signup"}>
              {course.tier === "free" ? "Start Learning Free" : "Subscribe to Unlock"}
            </Link>
          </Button>
          <p className="arabic text-center text-brand-forest">رَبِّ زِدْنِي عِلْمًا</p>
        </aside>
      </section>
    </>
  );
}

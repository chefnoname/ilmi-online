import { CourseCard } from "@/components/site/course-card";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Courses" };

export default async function CoursesPage() {
  const supabase = createClient();
  // RLS: only published course metadata is visible to anon/auth users.
  const { data } = await supabase.from("courses").select("*").order("position");
  const courses = (data ?? []) as Course[];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-cool">
        <KuficPattern className="text-white" opacity={0.08} />
        <div className="container relative py-16">
          <h1 className="display text-4xl text-white">The library</h1>
          <p className="mt-3 max-w-xl text-white/90">
            Every course follows a structured curriculum, taught by a qualified scholar. Preview the
            first lesson of any course for free.
          </p>
        </div>
      </section>
      <section className="container py-16">
        {courses.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Courses are being prepared — check back soon, in shā’ Allāh.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

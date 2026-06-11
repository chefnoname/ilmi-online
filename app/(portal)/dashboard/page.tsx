import { BoxPromo } from "@/components/portal/box-promo";
import { LessonCard } from "@/components/portal/lesson-card";
import { Badge } from "@/components/ui/badge";
import { requireUser, getProfile, hasActiveSubscription } from "@/lib/auth";
import { FEATURED_SUBJECT_SLUG } from "@/lib/config";
import type { Lesson, Progress, Subject } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

/**
 * Student dashboard: Box Promo (featured subject) on top, then one
 * horizontally-scrollable rail per subject in sort_order. All queries run
 * under RLS as the signed-in user.
 */
export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const profile = await getProfile();
  const entitled = hasActiveSubscription(profile);

  const [{ data: subjectData }, { data: lessonData }, { data: progressData }] = await Promise.all([
    supabase.from("subjects").select("*").order("sort_order"),
    supabase.from("lessons").select("*").order("sort_order"),
    supabase.from("progress").select("*"),
  ]);
  const subjects = (subjectData ?? []) as Subject[];
  const lessons = (lessonData ?? []) as Lesson[];
  const progress = (progressData ?? []) as Progress[];

  const featured = subjects.find((s) => s.slug === FEATURED_SUBJECT_SLUG) ?? subjects[0];
  const featuredLessons = featured
    ? lessons.filter((l) => l.subject_id === featured.id)
    : [];

  const firstName = profile?.full_name?.split(" ")[0] || "Student";

  return (
    <div className="container space-y-10 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="arabic text-lg text-brand-forest">السلام عليكم</p>
          <h1 className="display text-2xl text-brand-carbon sm:text-3xl">
            Welcome back, {firstName}
          </h1>
        </div>
        <Badge variant={entitled ? "green" : "outline"}>
          {profile?.subscription_status === "trialing"
            ? "Trial Active"
            : entitled
              ? "Subscription Active"
              : "Free Account"}
        </Badge>
      </div>

      {/* ── Box Promo: featured subject quick-link ── */}
      {featured && (
        <BoxPromo
          subject={featured}
          firstLesson={featuredLessons[0] ?? null}
          lessonCount={featuredLessons.length}
        />
      )}

      {/* ── One rail per subject, in sort_order ── */}
      {subjects.map((subject) => {
        const subjectLessons = lessons.filter((l) => l.subject_id === subject.id);
        if (subjectLessons.length === 0) return null;
        return (
          <section key={subject.id} id={`subject-${subject.slug}`} className="space-y-4">
            <h2 className="display-sub text-xl text-brand-carbon">{subject.title}</h2>
            <div className="-mx-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-8 pb-3 [scrollbar-width:thin]">
              {subjectLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  subject={subject}
                  entitled={entitled}
                  completed={progress.some((p) => p.lesson_id === lesson.id && p.completed)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {subjects.length === 0 && (
        <p className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
          No subjects published yet — run the seed script (supabase/seed.sql).
        </p>
      )}
    </div>
  );
}

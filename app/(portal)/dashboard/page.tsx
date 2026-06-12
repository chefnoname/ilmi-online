import { BoxPromo } from "@/components/portal/box-promo";
import { SubjectCard } from "@/components/portal/subject-card";
import { Badge } from "@/components/ui/badge";
import { requireUser, getProfile, hasActiveSubscription } from "@/lib/auth";
import { FEATURED_SUBJECT_SLUG } from "@/lib/config";
import type { AppSettings, Lesson, Subject, Topic } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

/**
 * Student dashboard — three-level hierarchy:
 *   Topic (rail) → Subject (card on the rail) → Lesson (Mux video)
 *
 * One horizontal rail per TOPIC in sort_order; each rail's cards are
 * SUBJECTS; clicking a subject goes straight into its first lesson. The Box
 * Promo features a configurable subject (lib/config.ts). All queries run
 * under RLS as the signed-in user.
 */
export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const profile = await getProfile();
  const entitled = hasActiveSubscription(profile);

  const [{ data: topicData }, { data: subjectData }, { data: lessonData }, { data: settingsData }] =
    await Promise.all([
      supabase.from("topics").select("*").order("sort_order"),
      supabase.from("subjects").select("*").order("sort_order"),
      // Archived lessons are hidden from students everywhere.
      supabase
        .from("lessons")
        .select("id, subject_id, lesson_number")
        .eq("is_archived", false)
        .order("lesson_number"),
      // Admin-controlled settings (Box Promo target) — read fresh on load.
      supabase.from("app_settings").select("*").eq("id", true).maybeSingle(),
    ]);
  const topics = (topicData ?? []) as Topic[];
  const subjects = (subjectData ?? []) as Subject[];
  const lessons = (lessonData ?? []) as Pick<Lesson, "id" | "subject_id" | "lesson_number">[];

  /** First lesson (lowest lesson_number) + count per subject. */
  function lessonInfo(subjectId: string) {
    const list = lessons.filter((l) => l.subject_id === subjectId);
    return { firstLessonId: list[0]?.id ?? null, count: list.length };
  }

  const settings = (settingsData ?? null) as AppSettings | null;
  // Box Promo target: admin setting first, env-slug fallback, then first subject.
  const featured =
    subjects.find((s) => s.id === settings?.featured_subject_id) ??
    subjects.find((s) => s.slug === FEATURED_SUBJECT_SLUG) ??
    subjects[0];
  const featuredInfo = featured ? lessonInfo(featured.id) : null;

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

      {/* ── Box Promo: featured SUBJECT quick-link (→ its first lesson) ── */}
      {featured && featuredInfo && (
        <BoxPromo
          subject={featured}
          firstLessonId={featuredInfo.firstLessonId}
          lessonCount={featuredInfo.count}
        />
      )}

      {/* ── One rail per TOPIC; cards are SUBJECTS ── */}
      {topics.map((topic) => {
        const topicSubjects = subjects.filter((s) => s.topic_id === topic.id);
        if (topicSubjects.length === 0) return null;
        return (
          <section key={topic.id} id={`topic-${topic.slug}`} className="space-y-4">
            <h2 className="display-sub text-xl text-brand-carbon">{topic.title}</h2>
            <div className="-mx-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-8 pb-3 [scrollbar-width:thin]">
              {topicSubjects.map((subject) => {
                const info = lessonInfo(subject.id);
                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    firstLessonId={info.firstLessonId}
                    lessonCount={info.count}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {topics.length === 0 && (
        <p className="rounded-lg border border-dashed bg-white p-10 text-center text-muted-foreground">
          No topics published yet — run migration 0004 and supabase/seed.sql.
        </p>
      )}
    </div>
  );
}

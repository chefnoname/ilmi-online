import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KuficPattern } from "@/components/site/kufic-pattern";
import type { Lesson, Subject } from "@/lib/types";

/**
 * "Box Promo" — the dashboard's featured hero card. A quick-link into one
 * subject (configurable via NEXT_PUBLIC_FEATURED_SUBJECT_SLUG, defaults to
 * Aqeedah — see lib/config.ts). On-brand: warm green→yellow gradient, faint
 * Kufic texture, uppercase extended heading, yellow pill CTA.
 */
export function BoxPromo({
  subject,
  firstLesson,
  lessonCount,
}: {
  subject: Subject;
  firstLesson: Lesson | null;
  lessonCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-lg bg-brand-warm p-8 text-white shadow-lg sm:p-12">
      <KuficPattern className="text-white" opacity={0.09} />
      <div className="relative flex flex-col items-start gap-4">
        <span className="rounded-pill bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
          Featured subject · {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
        </span>
        <h2 className="display text-3xl drop-shadow-sm sm:text-5xl">
          Study {subject.title}
        </h2>
        <p className="max-w-lg text-white/95">
          Build your foundations the right way — structured lessons, taught in order, from the
          first principles up.
        </p>
        <Button asChild variant="cta" size="lg" className="mt-2">
          <Link
            href={firstLesson ? `/dashboard/lessons/${firstLesson.id}` : `/dashboard#subject-${subject.slug}`}
          >
            <PlayCircle className="h-5 w-5" />
            Start with {subject.title}
          </Link>
        </Button>
      </div>
    </section>
  );
}

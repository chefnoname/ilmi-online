import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { cn } from "@/lib/utils";
import type { Subject } from "@/lib/types";

/**
 * Rail card for a SUBJECT (a series — no video of its own). Clicking goes
 * STRAIGHT into the subject's first lesson (lowest lesson_number).
 */
export function SubjectCard({
  subject,
  firstLessonId,
  lessonCount,
}: {
  subject: Subject;
  firstLessonId: string | null;
  lessonCount: number;
}) {
  // No lessons yet → render an inert card rather than a dead link.
  const href = firstLessonId ? `/dashboard/lessons/${firstLessonId}` : "#";

  return (
    <Link
      href={href}
      aria-disabled={!firstLessonId}
      className={cn(
        "group relative aspect-video w-60 shrink-0 snap-start overflow-hidden rounded-xl shadow-sm transition-all sm:w-72",
        firstLessonId ? "hover:-translate-y-1 hover:shadow-lg" : "pointer-events-none opacity-60",
      )}
    >
      {/* Thumbnail (brand gradient fallback until thumbnail_url is set) */}
      {subject.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={subject.thumbnail_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className={cn("absolute inset-0", subject.sort_order % 2 ? "bg-brand-deep" : "bg-brand-cool")}>
          <KuficPattern className="text-white" opacity={0.1} />
        </div>
      )}
      {/* Legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <span className="rounded-pill bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
          {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
        </span>
        <PlayCircle className="h-5 w-5 text-white/0 drop-shadow transition-colors group-hover:text-white" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="display-sub text-lg text-white drop-shadow-sm">{subject.title}</p>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { cn } from "@/lib/utils";
import type { Lesson, Subject } from "@/lib/types";

/**
 * Rail lesson card: thumbnail with the subject/title and lesson number
 * overlaid. Locked badge is purely cosmetic — real gating happens in the
 * lesson page (server) and the Mux token route.
 */
export function LessonCard({
  lesson,
  subject,
  entitled,
  completed,
}: {
  lesson: Lesson;
  subject: Subject;
  entitled: boolean;
  completed: boolean;
}) {
  const locked = !lesson.is_free && !entitled;

  return (
    <Link
      href={`/dashboard/lessons/${lesson.id}`}
      className="group relative aspect-video w-60 shrink-0 snap-start overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:w-72"
    >
      {/* Thumbnail (brand gradient fallback until thumbnail_url is set) */}
      {lesson.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lesson.thumbnail_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className={cn("absolute inset-0", lesson.lesson_number % 2 ? "bg-brand-deep" : "bg-brand-cool")}>
          <KuficPattern className="text-white" opacity={0.1} />
        </div>
      )}
      {/* Legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

      {/* Top row: lesson number + state */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <span className="rounded-pill bg-brand-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-carbon shadow-sm">
          Lesson {lesson.lesson_number}
        </span>
        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-brand-green drop-shadow" />
        ) : locked ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-pill bg-black/40 backdrop-blur">
            <Lock className="h-3.5 w-3.5 text-white" />
          </span>
        ) : (
          <PlayCircle className="h-5 w-5 text-white/0 drop-shadow transition-colors group-hover:text-white" />
        )}
      </div>

      {/* Bottom: subject + lesson title overlaid on the thumbnail */}
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow">
          {subject.title}
        </p>
        <p className="display-sub mt-0.5 text-base text-white drop-shadow-sm">{lesson.title}</p>
      </div>
    </Link>
  );
}

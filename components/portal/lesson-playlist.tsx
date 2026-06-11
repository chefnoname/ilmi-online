import Link from "next/link";
import { CheckCircle2, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lesson, Subject } from "@/lib/types";

/**
 * Right-column playlist: every lesson in the current subject, ordered by
 * lesson_number. The active lesson is highlighted; clicking a row navigates
 * to that lesson. Lock badges are cosmetic — server + token route gate.
 */
export function LessonPlaylist({
  subject,
  lessons,
  currentLessonId,
  entitled,
  completedIds,
}: {
  subject: Subject;
  lessons: Lesson[];
  currentLessonId: string;
  entitled: boolean;
  completedIds: Set<string>;
}) {
  return (
    <aside className="rounded-lg border bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h2 className="display-sub text-sm text-brand-carbon">{subject.title}</h2>
        <p className="text-xs text-muted-foreground">
          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
        </p>
      </div>
      <ol>
        {lessons.map((lesson) => {
          const active = lesson.id === currentLessonId;
          const locked = !lesson.is_free && !entitled;
          return (
            <li key={lesson.id}>
              <Link
                href={`/dashboard/lessons/${lesson.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 border-l-4 px-3 py-2.5 transition-colors",
                  active
                    ? "border-brand-green bg-brand-green/10"
                    : "border-transparent hover:bg-muted",
                )}
              >
                {/* Small thumbnail (gradient fallback until thumbnail_url set) */}
                <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-md">
                  {lesson.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={lesson.thumbnail_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center text-xs font-bold text-white",
                        lesson.lesson_number % 2 ? "bg-brand-deep" : "bg-brand-cool",
                      )}
                    >
                      {lesson.lesson_number}
                    </div>
                  )}
                  {active && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                      <Play className="h-4 w-4 text-white" fill="currentColor" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-semibold", active && "text-brand-forest")}>
                    {lesson.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lesson {lesson.lesson_number}
                    {active && " · Now playing"}
                  </p>
                </div>

                {completedIds.has(lesson.id) ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />
                ) : locked ? (
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

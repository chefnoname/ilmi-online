import Link from "next/link";
import { GraduationCap, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

const GRADIENTS: Record<string, string> = {
  warm: "bg-brand-warm",
  cool: "bg-brand-cool",
  deep: "bg-brand-deep",
};

export function CourseCard({ course, href }: { course: Course; href?: string }) {
  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={cn("relative flex h-44 flex-col justify-between p-5 text-white", GRADIENTS[course.gradient] ?? "bg-brand-warm")}>
        <KuficPattern className="text-white" opacity={0.1} />
        <div className="relative flex items-start justify-between">
          <Badge variant={course.tier === "free" ? "yellow" : "onDark"}>
            {course.tier === "free" ? "Free" : "Subscription"}
          </Badge>
          <PlayCircle className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <h3 className="display relative text-2xl drop-shadow-sm">{course.title}</h3>
      </div>
      <div className="space-y-2 p-5">
        <p className="text-sm font-semibold text-brand-forest">{course.tagline}</p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <GraduationCap className="h-4 w-4 text-brand-green" />
          {course.scholar_name} · {course.scholar_title}
        </p>
      </div>
    </Link>
  );
}

import { cn } from "@/lib/utils";

/**
 * Subtle geometric Kufic-style line pattern — square, maze-like Arabic
 * letterforms — used as a faint background texture on heroes and section
 * dividers. Low opacity by design; never noisy.
 */
export function KuficPattern({ className, opacity = 0.07 }: { className?: string; opacity?: number }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
    >
      <defs>
        <pattern id="kufic" width="120" height="120" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="3" shapeRendering="crispEdges">
            {/* Square Kufic maze strokes */}
            <path d="M10 10 h40 v15 h-25 v25 h25 v15 h-40 z" />
            <path d="M70 10 h40 v40 h-15 v-25 h-25 z" />
            <path d="M70 70 v40 h40 v-15 h-25 v-25 z" />
            <path d="M10 85 h25 v25 h15 v-40 h-40 z" />
            <rect x="55" y="55" width="10" height="10" fill="currentColor" stroke="none" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kufic)" />
    </svg>
  );
}

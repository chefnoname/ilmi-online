"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { ArrowLeft, ArrowRight, CheckCircle2, Clapperboard, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addBenefit, recordProgress } from "@/app/(portal)/actions";
import { cn, formatSeconds, parseTimestamp, relativeTime, TIMESTAMP_RE } from "@/lib/utils";
import type { Benefit } from "@/lib/types";

interface TokenResponse {
  playbackId: string;
  tokens: { playback: string; thumbnail: string; storyboard: string };
}

interface LessonNav {
  id: string;
  title: string;
}

/**
 * Main column of the lesson page (client): Mux player on a dark surface,
 * lesson meta, prev/next within the subject, and the "benefits" section.
 * One component so the timestamp button and timestamp links share the
 * player ref. Token minting is unchanged — the server route stays the gate.
 */
export function LessonMain({
  lesson,
  subjectTitle,
  prev,
  next,
  completed,
  benefits,
}: {
  lesson: {
    id: string;
    title: string;
    lesson_number: number;
    mux_playback_id: string | null;
    mux_playback_policy: "public" | "signed";
  };
  subjectTitle: string;
  prev: LessonNav | null;
  next: LessonNav | null;
  completed: boolean;
  benefits: Benefit[];
}) {
  const playerRef = useRef<MuxPlayerElement>(null);
  const playerBoxRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const isPublic = lesson.mux_playback_policy === "public";

  // ── Signed playback tokens (server is the gate). Public-policy assets
  // stream straight from the playback ID — no token fetch at all. ──
  useEffect(() => {
    if (!lesson.mux_playback_id || isPublic) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/mux/playback-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.id }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(json.error ?? "Could not load video");
        else setData(json as TokenResponse);
      } catch {
        if (!cancelled) setError("Could not load video");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson.id, lesson.mux_playback_id, isPublic]);

  /** Used by the Add-timestamp button. */
  function currentPlayheadSeconds() {
    return playerRef.current?.currentTime ?? 0;
  }

  /** Used by clickable timestamps in posted benefits. */
  function seekTo(seconds: number) {
    const p = playerRef.current;
    if (!p) return;
    p.currentTime = seconds;
    void p.play()?.catch(() => {});
    playerBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="space-y-6">
      {/* ── Dark watch surface (carbon family — easy on the eyes) ── */}
      <div ref={playerBoxRef} className="overflow-hidden rounded-lg bg-[#2a2a2a] shadow-lg">
        {error ? (
          <div className="flex aspect-video w-full items-center justify-center p-8 text-center text-sm text-white/80">
            {error}
          </div>
        ) : lesson.mux_playback_id && (isPublic || data) ? (
          <MuxPlayer
            ref={playerRef}
            playbackId={lesson.mux_playback_id}
            // 'signed' assets require the short-lived JWTs; 'public' must not send any
            tokens={isPublic ? undefined : data!.tokens}
            metadata={{ video_title: lesson.title }}
            streamType="on-demand"
            accentColor="#52B955"
            className="aspect-video w-full"
            onPlay={() => {
              if (!startedRef.current) {
                startedRef.current = true;
                void recordProgress(lesson.id, false); // update last_watched_at
              }
            }}
            onEnded={() => {
              void recordProgress(lesson.id, true);
            }}
          />
        ) : lesson.mux_playback_id ? (
          <div className="aspect-video w-full animate-pulse bg-brand-carbon" />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 text-white/70">
            <Clapperboard className="h-10 w-10" />
            <p className="text-sm font-semibold">Video coming soon — playback ID not set yet.</p>
          </div>
        )}

        {/* Meta + prev/next live on the dark surface with the player */}
        <div className="space-y-4 border-t border-white/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-green">
                {subjectTitle} · Lesson {lesson.lesson_number}
              </p>
              <h1 className="display-sub mt-1 text-xl text-white sm:text-2xl">{lesson.title}</h1>
            </div>
            <MarkCompleteButton lessonId={lesson.id} completed={completed} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <NavButton lesson={prev} direction="prev" />
            <NavButton lesson={next} direction="next" />
          </div>
        </div>
      </div>

      {/* ── Benefits (comments) ── */}
      <BenefitsSection
        lessonId={lesson.id}
        benefits={benefits}
        getPlayhead={currentPlayheadSeconds}
        onSeek={seekTo}
      />
    </div>
  );
}

/* ── Prev / Next (disabled at the edges of the subject) ── */
function NavButton({ lesson, direction }: { lesson: LessonNav | null; direction: "prev" | "next" }) {
  const label = direction === "prev" ? "Previous" : "Next";
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  if (!lesson) {
    return (
      <Button variant="ghostOnDark" disabled className="opacity-40">
        {direction === "prev" && <Icon className="h-4 w-4" />}
        {label}
        {direction === "next" && <Icon className="h-4 w-4" />}
      </Button>
    );
  }
  return (
    <Button asChild variant="ghostOnDark">
      <Link href={`/dashboard/lessons/${lesson.id}`} title={lesson.title}>
        {direction === "prev" && <Icon className="h-4 w-4" />}
        {label}
        {direction === "next" && <Icon className="h-4 w-4" />}
      </Link>
    </Button>
  );
}

function MarkCompleteButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant={completed ? "ghostOnDark" : "primary"}
      disabled={pending}
      onClick={() => startTransition(() => void recordProgress(lessonId, !completed))}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      {completed ? "Completed — undo" : "Mark as Complete"}
    </Button>
  );
}

/* ── Benefits: composer + flat list with clickable timestamps ── */
function BenefitsSection({
  lessonId,
  benefits,
  getPlayhead,
  onSeek,
}: {
  lessonId: string;
  benefits: Benefit[];
  getPlayhead: () => number;
  onSeek: (seconds: number) => void;
}) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Inserts the player's CURRENT playhead time at the cursor, as plain
   * editable text — the student can scrub first, or hand-edit the token
   * afterwards. Never auto-anchored.
   */
  function insertTimestamp() {
    const token = formatSeconds(getPlayhead());
    const el = textareaRef.current;
    if (!el) {
      setBody((b) => (b ? `${b} ${token} ` : `${token} `));
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? start;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const pad = before && !/\s$/.test(before) ? " " : "";
    const inserted = `${pad}${token} `;
    const nextValue = `${before}${inserted}${after}`;
    setBody(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + inserted.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function submit() {
    const trimmed = body.trim();
    if (!trimmed || pending) return;
    const fd = new FormData();
    fd.set("lesson_id", lessonId);
    fd.set("body", trimmed);
    startTransition(async () => {
      const res = await addBenefit(fd);
      if (res.ok) setBody(""); // list refreshes via revalidatePath
    });
  }

  return (
    <section className="space-y-5">
      <h2 className="display-sub text-lg text-brand-carbon">Benefits from this lesson</h2>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-3 rounded-lg border bg-white p-4 shadow-sm"
      >
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share a benefit you took from this lesson…"
          rows={3}
          maxLength={2000}
          className="w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm" onClick={insertTimestamp}>
            <Clock className="h-4 w-4" />
            Add timestamp
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={pending || !body.trim()}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Post Benefit
          </Button>
        </div>
      </form>

      {/* Flat list, newest first */}
      {benefits.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-white p-6 text-center text-sm text-muted-foreground">
          No benefits shared yet — be the first.
        </p>
      ) : (
        <ul className="space-y-3">
          {benefits.map((b) => (
            <li key={b.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="text-sm font-bold text-brand-carbon">{b.author_name}</span>
                <span className="text-xs text-muted-foreground">{relativeTime(b.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-brand-carbon/90">
                <BenefitBody body={b.body} onSeek={onSeek} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Renders body text with MM:SS / H:MM:SS tokens as clickable seek links. */
function BenefitBody({ body, onSeek }: { body: string; onSeek: (s: number) => void }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of Array.from(body.matchAll(TIMESTAMP_RE))) {
    const token = match[0];
    const index = match.index ?? 0;
    const seconds = parseTimestamp(token);
    if (index > last) nodes.push(body.slice(last, index));
    if (seconds !== null) {
      nodes.push(
        <button
          key={`${index}-${token}`}
          type="button"
          onClick={() => onSeek(seconds)}
          className={cn(
            "inline rounded px-1 font-semibold text-brand-forest underline decoration-brand-green/50 underline-offset-2",
            "hover:bg-brand-green/10 hover:decoration-brand-green",
          )}
        >
          {token}
        </button>,
      );
    } else {
      nodes.push(token);
    }
    last = index + token.length;
  }
  if (last < body.length) nodes.push(body.slice(last));
  return <>{nodes}</>;
}

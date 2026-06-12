"use client";

import { useRef, useState, useTransition } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Loader2,
  Plus,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createLesson,
  createSubject,
  createTopic,
  markUploadComplete,
  moveLesson,
  moveSubject,
  moveTopic,
  requestUploadUrl,
  setBoxPromoSubject,
  setLessonArchived,
} from "./actions";
import type { AppSettings, Lesson, Subject, Topic } from "@/lib/types";
import type { MuxAssetSummary } from "./page";

/**
 * Admin content tree (functional shell). All mutations are admin server
 * actions; reordering is up/down sort-order swaps; uploads PUT the file
 * directly to Mux from the browser.
 */
export function ContentManager({
  topics,
  subjects,
  lessons,
  settings,
  orphanAssets,
  missingLessons,
  muxError,
}: {
  topics: Topic[];
  subjects: Subject[];
  lessons: Lesson[];
  settings: AppSettings | null;
  orphanAssets: MuxAssetSummary[];
  missingLessons: { id: string; title: string }[];
  muxError: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn());

  return (
    <div className="space-y-8">
      {/* ── Box Promo control ── */}
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="display-sub text-base text-brand-carbon">Box Promo</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          The featured subject on the student dashboard (students see changes on reload).
          Rail order = topic order below.
        </p>
        <select
          className="h-10 rounded-md border border-input bg-white px-3 text-sm font-medium"
          value={settings?.featured_subject_id ?? ""}
          onChange={(e) => e.target.value && run(() => setBoxPromoSubject(e.target.value))}
          disabled={pending}
        >
          <option value="">— choose subject —</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {topics.find((t) => t.id === s.topic_id)?.title} / {s.title}
            </option>
          ))}
        </select>
      </section>

      {/* ── Mux mismatch report ── */}
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="display-sub text-base text-brand-carbon">Mux assets check</h2>
        {muxError ? (
          <p className="mt-2 text-sm font-semibold text-destructive">
            Live Mux listing unavailable: {muxError}
          </p>
        ) : (
          <div className="mt-2 space-y-2 text-sm">
            {orphanAssets.length === 0 && missingLessons.length === 0 && (
              <p className="font-semibold text-brand-forest">
                ✓ No mismatches — every Mux asset is linked to a lesson and vice-versa.
              </p>
            )}
            {orphanAssets.length > 0 && (
              <div>
                <p className="font-semibold text-brand-carbon">
                  Orphan Mux assets (in Mux, not linked to any lesson):
                </p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {orphanAssets.map((a) => (
                    <li key={a.id}>
                      <code className="text-xs">{a.id}</code> — {a.status}
                      {a.createdAt && ` · ${new Date(Number(a.createdAt) * 1000 || a.createdAt).toLocaleDateString()}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {missingLessons.length > 0 && (
              <div>
                <p className="font-semibold text-destructive">
                  Lessons whose Mux ID no longer exists in Mux:
                </p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {missingLessons.map((l) => (
                    <li key={l.id}>{l.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Content tree ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="display-sub text-base text-brand-carbon">Topics</h2>
          <AddForm placeholder="New topic title" onAdd={(fd) => run(() => createTopic(fd))} />
        </div>

        {topics.map((topic, ti) => (
          <div key={topic.id} className="rounded-lg border bg-white shadow-sm">
            {/* Topic header */}
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
              <span className="display-sub flex-1 text-sm text-brand-carbon">{topic.title}</span>
              <ReorderButtons
                disabledUp={ti === 0}
                disabledDown={ti === topics.length - 1}
                onMove={(dir) => run(() => moveTopic(topic.id, dir))}
              />
              <AddForm
                placeholder="New subject title"
                hiddenFields={{ topic_id: topic.id }}
                onAdd={(fd) => run(() => createSubject(fd))}
              />
            </div>

            {/* Subjects */}
            <div className="divide-y">
              {subjects
                .filter((s) => s.topic_id === topic.id)
                .map((subject, si, arr) => {
                  const subjectLessons = lessons.filter((l) => l.subject_id === subject.id);
                  return (
                    <div key={subject.id} className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 text-sm font-bold">{subject.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {subjectLessons.filter((l) => !l.is_archived).length} live
                          {subjectLessons.some((l) => l.is_archived) &&
                            ` · ${subjectLessons.filter((l) => l.is_archived).length} archived`}
                        </span>
                        <ReorderButtons
                          disabledUp={si === 0}
                          disabledDown={si === arr.length - 1}
                          onMove={(dir) => run(() => moveSubject(subject.id, dir))}
                        />
                        <AddForm
                          placeholder="New lesson title"
                          hiddenFields={{ subject_id: subject.id }}
                          onAdd={(fd) => run(() => createLesson(fd))}
                        />
                      </div>

                      {/* Lessons */}
                      <ul className="mt-2 space-y-1.5">
                        {subjectLessons.map((lesson, li, larr) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            first={li === 0}
                            last={li === larr.length - 1}
                            run={run}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </section>
      {pending && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </p>
      )}
    </div>
  );
}

/* ── Lesson row: status, reorder, archive, upload ── */
function LessonRow({
  lesson,
  first,
  last,
  run,
}: {
  lesson: Lesson;
  first: boolean;
  last: boolean;
  run: (fn: () => Promise<unknown>) => void;
}) {
  const [uploadState, setUploadState] = useState<"idle" | "requesting" | "uploading" | "done" | "error">("idle");
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [policy, setPolicy] = useState<"signed" | "public">("signed");
  const fileRef = useRef<HTMLInputElement>(null);

  /** Direct upload: server mints the URL, browser PUTs the file to Mux. */
  async function handleFile(file: File) {
    setUploadState("requesting");
    setUploadMsg(null);
    const res = await requestUploadUrl(lesson.id, policy);
    if (!res.ok || !res.url) {
      setUploadState("error");
      setUploadMsg(res.message ?? "Could not get upload URL");
      return;
    }
    setUploadState("uploading");
    try {
      const put = await fetch(res.url, { method: "PUT", body: file });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      await markUploadComplete(lesson.id);
      setUploadState("done");
      setUploadMsg("Uploaded — Mux is processing. Refresh to see it turn ready.");
    } catch (e) {
      setUploadState("error");
      setUploadMsg(e instanceof Error ? e.message : "Upload failed");
    }
  }

  const statusBadge =
    lesson.mux_status === "ready" ? (
      <Badge variant="green">ready · {lesson.mux_playback_policy}</Badge>
    ) : lesson.mux_status === "processing" || uploadState === "done" ? (
      <Badge variant="yellow">processing</Badge>
    ) : lesson.mux_status === "awaiting_upload" ? (
      <Badge variant="outline">awaiting upload</Badge>
    ) : lesson.mux_status === "errored" ? (
      <Badge variant="carbon">errored</Badge>
    ) : lesson.mux_playback_id ? (
      <Badge variant="green">linked · {lesson.mux_playback_policy}</Badge>
    ) : (
      <Badge variant="outline">no video</Badge>
    );

  return (
    <li
      className={`rounded-md border px-3 py-2 ${lesson.is_archived ? "border-dashed bg-muted/40 opacity-70" : "bg-white"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground">#{lesson.lesson_number}</span>
        <span className="flex-1 text-sm font-medium">
          {lesson.title}
          {lesson.is_archived && (
            <span className="ml-2 text-xs font-semibold text-muted-foreground">(archived — hidden from students)</span>
          )}
        </span>
        {statusBadge}
        <ReorderButtons
          disabledUp={first}
          disabledDown={last}
          onMove={(dir) => run(() => moveLesson(lesson.id, dir))}
        />
        <Button
          size="sm"
          variant="ghost"
          title={
            lesson.is_archived
              ? "Restore for students"
              : "Hide from students (Mux asset is NOT deleted — delete manually in Mux if ever needed)"
          }
          onClick={() => run(() => setLessonArchived(lesson.id, !lesson.is_archived))}
        >
          {lesson.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        </Button>
      </div>

      {/* Upload controls */}
      {!lesson.is_archived && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t pt-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold">
            <select
              className="h-8 rounded-md border border-input bg-white px-2 text-xs"
              value={policy}
              onChange={(e) => setPolicy(e.target.value as "signed" | "public")}
              disabled={uploadState === "uploading" || uploadState === "requesting"}
            >
              <option value="signed">Paid / Signed</option>
              <option value="public">Free / Public</option>
            </select>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={uploadState === "uploading" || uploadState === "requesting"}
            onClick={() => fileRef.current?.click()}
          >
            {uploadState === "uploading" || uploadState === "requesting" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UploadCloud className="h-3.5 w-3.5" />
            )}
            {lesson.mux_playback_id ? "Replace video" : "Upload video"}
          </Button>
          {uploadState === "done" && <CheckCircle2 className="h-4 w-4 text-brand-green" />}
          {uploadMsg && (
            <span className={`text-xs font-semibold ${uploadState === "error" ? "text-destructive" : "text-brand-forest"}`}>
              {uploadMsg}
            </span>
          )}
        </div>
      )}
    </li>
  );
}

/* ── Shared bits ── */
function ReorderButtons({
  disabledUp,
  disabledDown,
  onMove,
}: {
  disabledUp: boolean;
  disabledDown: boolean;
  onMove: (dir: "up" | "down") => void;
}) {
  return (
    <span className="flex gap-0.5">
      <Button size="icon" variant="ghost" className="h-7 w-7" disabled={disabledUp} onClick={() => onMove("up")}>
        <ArrowUp className="h-3.5 w-3.5" />
      </Button>
      <Button size="icon" variant="ghost" className="h-7 w-7" disabled={disabledDown} onClick={() => onMove("down")}>
        <ArrowDown className="h-3.5 w-3.5" />
      </Button>
    </span>
  );
}

function AddForm({
  placeholder,
  hiddenFields = {},
  onAdd,
}: {
  placeholder: string;
  hiddenFields?: Record<string, string>;
  onAdd: (fd: FormData) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        const fd = new FormData();
        fd.set("title", value.trim());
        for (const [k, v] of Object.entries(hiddenFields)) fd.set(k, v);
        onAdd(fd);
        setValue("");
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-44 text-xs"
      />
      <Button type="submit" size="icon" variant="outline" className="h-8 w-8" disabled={!value.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}

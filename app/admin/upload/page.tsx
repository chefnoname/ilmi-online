import { requireAdmin } from "@/lib/auth";
import { listMuxAssets } from "@/lib/mux";
import { ContentManager } from "./content-manager";
import type { AppSettings, Lesson, Subject, Topic } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Upload" };

export interface MuxAssetSummary {
  id: string;
  status: string;
  playbackIds: string[];
  createdAt: string;
}

/**
 * /admin/upload — content hierarchy CRUD, Mux direct uploads, asset
 * mismatch report, archive, and Box Promo control. Content reads use the
 * admin's session (RLS); the live Mux listing uses server-held credentials.
 */
export default async function AdminUploadPage() {
  const { supabase } = await requireAdmin();

  const [{ data: topicsData }, { data: subjectsData }, { data: lessonsData }, { data: settingsData }] =
    await Promise.all([
      supabase.from("topics").select("*").order("sort_order"),
      supabase.from("subjects").select("*").order("sort_order"),
      supabase.from("lessons").select("*").order("lesson_number"), // includes archived (admin view)
      supabase.from("app_settings").select("*").eq("id", true).maybeSingle(),
    ]);
  const topics = (topicsData ?? []) as Topic[];
  const subjects = (subjectsData ?? []) as Subject[];
  const lessons = (lessonsData ?? []) as Lesson[];
  const settings = (settingsData ?? null) as AppSettings | null;

  // ── Live Mux listing → mismatch report (best-effort) ──
  let muxAssets: MuxAssetSummary[] | null = null;
  let muxError: string | null = null;
  try {
    const assets = await listMuxAssets();
    muxAssets = assets.map((a) => ({
      id: a.id,
      status: a.status ?? "unknown",
      playbackIds: (a.playback_ids ?? []).map((p) => p.id),
      createdAt: a.created_at ?? "",
    }));
  } catch (e) {
    muxError = e instanceof Error ? e.message : "Mux listing failed";
  }

  const linkedAssetIds = new Set(lessons.map((l) => l.mux_asset_id).filter(Boolean));
  const linkedPlaybackIds = new Set(lessons.map((l) => l.mux_playback_id).filter(Boolean));
  const orphanAssets =
    muxAssets?.filter(
      (a) => !linkedAssetIds.has(a.id) && !a.playbackIds.some((p) => linkedPlaybackIds.has(p)),
    ) ?? [];
  const knownPlaybackIds = new Set(muxAssets?.flatMap((a) => a.playbackIds) ?? []);
  const knownAssetIds = new Set(muxAssets?.map((a) => a.id) ?? []);
  const missingLessons = muxAssets
    ? lessons.filter(
        (l) =>
          (l.mux_playback_id && !knownPlaybackIds.has(l.mux_playback_id)) ||
          (l.mux_asset_id && !knownAssetIds.has(l.mux_asset_id)),
      )
    : [];

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="display text-2xl text-brand-carbon">Content &amp; Upload</h1>
        <p className="text-sm text-muted-foreground">
          Topics → Subjects → Lessons. Uploads go straight from your browser to Mux; videos
          turn “ready” via the Mux webhook (refresh to see it). Archiving hides a lesson from
          students without touching the Mux asset.
        </p>
      </div>

      <ContentManager
        topics={topics}
        subjects={subjects}
        lessons={lessons}
        settings={settings}
        orphanAssets={orphanAssets}
        missingLessons={missingLessons.map((l) => ({ id: l.id, title: l.title }))}
        muxError={muxError}
      />
    </div>
  );
}

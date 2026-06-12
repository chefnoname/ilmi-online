import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyMuxSignature } from "@/lib/mux";

/**
 * POST /api/mux/webhook — completes the async upload lifecycle:
 *   upload (browser → Mux) → processing → READY (this webhook)
 *
 * Security: the 'mux-signature' header is verified against
 * MUX_WEBHOOK_SECRET (HMAC-SHA256, constant-time compare, 5-min replay
 * window) BEFORE the payload is trusted. Writes use the service role; the
 * lesson is matched via the passthrough we set at direct-upload time.
 *
 * Events handled:
 *  - video.asset.ready   → set mux_asset_id + mux_playback_id (+ thumbnail
 *                          for public assets), mux_status = 'ready'
 *  - video.asset.errored → mux_status = 'errored'
 */
export async function POST(request: Request) {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });

  const rawBody = await request.text();
  if (!verifyMuxSignature(rawBody, request.headers.get("mux-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type ?? "";
  if (type !== "video.asset.ready" && type !== "video.asset.errored") {
    // Acknowledge everything else so Mux stops retrying.
    return NextResponse.json({ received: true });
  }

  const asset = (event.data ?? {}) as {
    id?: string;
    passthrough?: string;
    playback_ids?: { id: string; policy: string }[];
  };
  const lessonId = asset.passthrough;
  if (!lessonId || !/^[0-9a-f-]{36}$/i.test(lessonId)) {
    return NextResponse.json({ received: true, note: "no lesson passthrough" });
  }

  const admin = createAdminClient();

  if (type === "video.asset.errored") {
    await admin.from("lessons").update({ mux_status: "errored" }).eq("id", lessonId);
    return NextResponse.json({ received: true });
  }

  const playback = asset.playback_ids?.[0];
  const isPublic = playback?.policy === "public";
  await admin
    .from("lessons")
    .update({
      mux_asset_id: asset.id ?? null,
      mux_playback_id: playback?.id ?? null,
      mux_playback_policy: isPublic ? "public" : "signed",
      // Mux thumbnails for SIGNED assets need a signed token, so only store
      // a direct thumbnail URL for public assets; signed lessons keep the
      // branded gradient fallback (or a manually hosted image).
      ...(isPublic && playback
        ? { thumbnail_url: `https://image.mux.com/${playback.id}/thumbnail.jpg?time=5` }
        : {}),
      mux_status: "ready",
    })
    .eq("id", lessonId);

  return NextResponse.json({ received: true });
}

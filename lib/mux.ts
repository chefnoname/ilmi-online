import "server-only"; // Signing keys must never reach the client bundle.
import Mux from "@mux/mux-node";
import type { Profile } from "@/lib/types";

/**
 * Mux signed-playback helpers.
 *
 * All lesson videos use Mux's SIGNED playback policy: a playback ID alone is
 * useless — Mux refuses to stream without a short-lived JWT signed with our
 * signing key. The ONLY place tokens are minted is the server route
 * /api/mux/playback-token, after authentication + subscription checks.
 */

let _mux: Mux | null = null;

/** Lazy singleton so the app boots (and errors clearly) without Mux env. */
function getMux(): Mux {
  const privateKey =
    process.env.MUX_SIGNING_KEY_PRIVATE ?? process.env.MUX_SIGNING_PRIVATE_KEY;
  if (!process.env.MUX_SIGNING_KEY_ID || !privateKey) {
    throw new Error(
      "Mux signing is not configured: set MUX_SIGNING_KEY_ID and MUX_SIGNING_KEY_PRIVATE (see SETUP.md)",
    );
  }
  if (!_mux) {
    _mux = new Mux({
      // Management API credentials are only needed for scripting asset
      // creation; JWT signing works without them, so default to placeholders.
      tokenId: process.env.MUX_TOKEN_ID || "unused",
      tokenSecret: process.env.MUX_TOKEN_SECRET || "unused",
      jwtSigningKey: process.env.MUX_SIGNING_KEY_ID,
      jwtPrivateKey: privateKey, // base64 PEM from Mux dashboard
    });
  }
  return _mux;
}

const TOKEN_TTL = "1h"; // short-lived; the player refetches when it expires

export interface PlaybackTokens {
  playback: string;
  thumbnail: string;
  storyboard: string;
}

export async function signPlaybackTokens(playbackId: string): Promise<PlaybackTokens> {
  const mux = getMux();
  const [playback, thumbnail, storyboard] = await Promise.all([
    mux.jwt.signPlaybackId(playbackId, { type: "video", expiration: TOKEN_TTL }),
    mux.jwt.signPlaybackId(playbackId, { type: "thumbnail", expiration: TOKEN_TTL }),
    mux.jwt.signPlaybackId(playbackId, { type: "storyboard", expiration: TOKEN_TTL }),
  ]);
  return { playback, thumbnail, storyboard };
}

/**
 * Single source of truth for video entitlement.
 * 'trialing' counts as entitled (a Stripe trial is a paid-intent
 * subscription); remove it here to lock trials out of paid lessons.
 */
export function isEntitled(profile: Pick<Profile, "subscription_status"> | null) {
  return (
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing" ||
    profile?.subscription_status === "comped" // admin-granted free access
  );
}

/* ════════ Admin / management helpers (require MUX_TOKEN_ID/SECRET) ════════ */

function getManagementMux(): Mux {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("Mux management API not configured: set MUX_TOKEN_ID and MUX_TOKEN_SECRET");
  }
  return getMux();
}

/**
 * Create a DIRECT UPLOAD: the browser uploads the file straight to Mux (never
 * proxied through our server). passthrough carries the lesson id so the
 * video.asset.ready webhook can link the asset back to the lesson.
 */
export async function createDirectUpload(lessonId: string, policy: "public" | "signed") {
  const mux = getManagementMux();
  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_SITE_URL ?? "*",
    new_asset_settings: {
      playback_policy: [policy],
      passthrough: lessonId,
    },
  });
  return { uploadId: upload.id, url: upload.url };
}

/** List assets in the Mux account (admin mismatch report). */
export async function listMuxAssets() {
  const mux = getManagementMux();
  const page = await mux.video.assets.list({ limit: 100 });
  return page.data;
}

/**
 * Verify a Mux webhook signature ('mux-signature: t=...,v1=...') before
 * trusting the payload. HMAC-SHA256 over `${t}.${rawBody}` with the webhook
 * signing secret, compared in constant time.
 */
export function verifyMuxSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.trim().split("=") as [string, string]),
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  // Reject stale timestamps (5 min tolerance) to limit replay.
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

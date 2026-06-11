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
    profile?.subscription_status === "active" || profile?.subscription_status === "trialing"
  );
}

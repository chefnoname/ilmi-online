/** Database row types (hand-written; replace with `supabase gen types` later). */

export type SubscriptionStatus = "active" | "inactive" | "trialing" | "comped";
export type UserRole = "student" | "admin";
export type MuxPlaybackPolicy = "public" | "signed";
export type MuxStatus = "none" | "awaiting_upload" | "processing" | "ready" | "errored";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: SubscriptionStatus;
  role: UserRole;
  billing_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Subject {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  subject_id: string;
  title: string;
  lesson_number: number;
  mux_playback_id: string | null;
  mux_playback_policy: MuxPlaybackPolicy;
  thumbnail_url: string | null;
  is_free: boolean;
  is_archived: boolean;
  mux_asset_id: string | null;
  mux_upload_id: string | null;
  mux_status: MuxStatus;
  sort_order: number;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_watched_at: string;
}

export interface Benefit {
  id: string;
  lesson_id: string;
  user_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface SignInEvent {
  id: string;
  user_id: string;
  created_at: string;
}

export interface SubscriptionEvent {
  id: string;
  user_id: string;
  old_status: string | null;
  new_status: string;
  source: "stripe" | "admin";
  created_at: string;
}

export interface AppSettings {
  id: boolean;
  featured_subject_id: string | null;
  updated_at: string;
}

/** Row shape for the admin students table (auth + profiles join). */
export interface AdminStudentRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  subscription_status: SubscriptionStatus;
  role: UserRole;
}

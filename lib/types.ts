/** Database row types (hand-written; replace with `supabase gen types` later). */

export type SubscriptionStatus = "active" | "inactive" | "trialing";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: SubscriptionStatus;
  billing_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  subject_id: string;
  title: string;
  lesson_number: number;
  mux_playback_id: string | null;
  thumbnail_url: string | null;
  is_free: boolean;
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

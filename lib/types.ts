/** Database row types (hand-written; replace with `supabase gen types` later). */

export type SubscriptionStatus = "free" | "active" | "past_due" | "canceled";
export type CourseTier = "free" | "paid";
export type CourseGradient = "warm" | "cool" | "deep";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: SubscriptionStatus;
  billing_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  scholar_name: string;
  scholar_title: string;
  tier: CourseTier;
  gradient: CourseGradient;
  is_published: boolean;
  position: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  position: number;
  is_preview: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_position_seconds: number;
  updated_at: string;
}

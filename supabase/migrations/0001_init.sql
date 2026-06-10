-- ════════════════════════════════════════════════════════════════════════
-- Ilmi Online — schema + Row Level Security
--
-- RLS is the security boundary of this app. Every table has RLS ENABLED and
-- explicit policies. The anon key is safe to ship to browsers ONLY because
-- of these policies. See SECURITY.md for the test matrix.
-- ════════════════════════════════════════════════════════════════════════

-- ── Enums ──────────────────────────────────────────────────────────────────
create type public.subscription_status as enum ('free', 'active', 'past_due', 'canceled');
create type public.course_tier as enum ('free', 'paid');

-- ── profiles ───────────────────────────────────────────────────────────────
-- One row per auth user, created by trigger. subscription_status is the
-- payment-provider-agnostic gate: Stripe webhooks will later set it via the
-- service role. Users can NEVER set it themselves (see trigger below).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  subscription_status public.subscription_status not null default 'free',
  -- Opaque handle for the payment provider (Stripe customer id later).
  billing_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── courses ────────────────────────────────────────────────────────────────
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  scholar_name text not null,
  scholar_title text not null default '',
  tier public.course_tier not null default 'paid',
  -- 'warm' | 'cool' | 'deep' — picks the brand gradient for the course card.
  gradient text not null default 'warm',
  is_published boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ── lessons ────────────────────────────────────────────────────────────────
-- video_url is the protected asset. is_preview lessons are public teasers.
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  video_url text not null default '',
  duration_minutes int not null default 0,
  position int not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);

-- ── enrollments ────────────────────────────────────────────────────────────
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ── lesson_progress ────────────────────────────────────────────────────────
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  last_position_seconds int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index lessons_course_idx on public.lessons (course_id, position);
create index enrollments_user_idx on public.enrollments (user_id);
create index progress_user_idx on public.lesson_progress (user_id, updated_at desc);

-- ════════════════════════════════════════════════════════════════════════
-- Helper functions
-- ════════════════════════════════════════════════════════════════════════

-- SECURITY DEFINER so the check works inside other tables' policies without
-- recursive RLS evaluation on profiles. STABLE: one lookup per statement.
create or replace function public.has_active_subscription()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and subscription_status = 'active'
  );
$$;

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Defence in depth: even though the UPDATE policy allows users to edit their
-- own profile row, this trigger blocks any attempt to change billing fields
-- unless the request runs as service_role (i.e. our server-side webhook code).
create or replace function public.protect_billing_columns()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if (new.subscription_status is distinct from old.subscription_status
      or new.billing_customer_id is distinct from old.billing_customer_id)
     and coalesce(auth.jwt() ->> 'role', current_user) <> 'service_role'
     and current_user <> 'postgres'
  then
    raise exception 'billing fields can only be changed by the server';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger protect_billing_columns
  before update on public.profiles
  for each row execute function public.protect_billing_columns();

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security — ENABLED ON EVERY TABLE, no exceptions.
-- ════════════════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

-- ── profiles ───────────────────────────────────────────────────────────────
-- POLICY: a user can read ONLY their own profile. User A selecting User B's
-- row returns zero rows (test: SECURITY.md §Testing).
create policy "profiles: read own"
  on public.profiles for select
  using (id = auth.uid());

-- POLICY: a user can update ONLY their own profile; billing columns are
-- additionally locked by the protect_billing_columns trigger.
create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- No INSERT policy (rows are created by the on_auth_user_created trigger,
-- which is SECURITY DEFINER) and no DELETE policy (cascade from auth.users).

-- ── courses ────────────────────────────────────────────────────────────────
-- POLICY: course *metadata* (title, scholar, tagline) is the public catalog —
-- anyone, including anonymous visitors, can browse published courses.
-- The protected asset is lesson video content, gated below.
create policy "courses: public can browse published"
  on public.courses for select
  using (is_published = true);

-- No insert/update/delete policies: catalog is managed via service role /
-- Supabase Studio only.

-- ── lessons ────────────────────────────────────────────────────────────────
-- POLICY: three ways to read a lesson row (and its video_url):
--   1. it's a preview lesson           → anyone (marketing teasers)
--   2. its course is the free tier     → any AUTHENTICATED user
--   3. otherwise (paid course)         → only users with subscription_status
--                                        = 'active' (via SECURITY DEFINER fn)
-- Unpublished courses' lessons are never readable.
create policy "lessons: preview public, free for members, paid for subscribers"
  on public.lessons for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id
        and c.is_published = true
        and (
          lessons.is_preview = true
          or (c.tier = 'free' and auth.uid() is not null)
          or (c.tier = 'paid' and public.has_active_subscription())
        )
    )
  );

-- ── enrollments ────────────────────────────────────────────────────────────
-- POLICY: users see only their own enrollments.
create policy "enrollments: read own"
  on public.enrollments for select
  using (user_id = auth.uid());

-- POLICY: users can enrol themselves, and only in courses they may access
-- (free tier, or any tier with an active subscription). user_id is forced to
-- auth.uid() so nobody can enrol another user.
create policy "enrollments: insert own, access-checked"
  on public.enrollments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.courses c
      where c.id = course_id
        and c.is_published = true
        and (c.tier = 'free' or public.has_active_subscription())
    )
  );

create policy "enrollments: delete own"
  on public.enrollments for delete
  using (user_id = auth.uid());

-- ── lesson_progress ────────────────────────────────────────────────────────
-- POLICY: users read/write only their own progress. The inner EXISTS runs
-- under the lessons RLS policy, so progress can only reference lessons the
-- user is currently allowed to see — no progress writes against paid content
-- without an active subscription.
create policy "progress: read own"
  on public.lesson_progress for select
  using (user_id = auth.uid());

create policy "progress: insert own, lesson must be visible"
  on public.lesson_progress for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.lessons l where l.id = lesson_id)
  );

create policy "progress: update own"
  on public.lesson_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "progress: delete own"
  on public.lesson_progress for delete
  using (user_id = auth.uid());

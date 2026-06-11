-- ════════════════════════════════════════════════════════════════════════
-- 0002 — Portal data model: subjects / lessons / progress + Stripe statuses
--
-- Replaces the placeholder course/enrollment model from 0001 with the real
-- production model. RLS ENABLED ON EVERY TABLE. See SECURITY.md for the
-- policy reference and test checklist.
-- ════════════════════════════════════════════════════════════════════════

-- ── Drop the old placeholder model ──────────────────────────────────────
drop table if exists public.lesson_progress cascade;
drop table if exists public.enrollments cascade;
drop table if exists public.lessons cascade;
drop table if exists public.courses cascade;
drop type if exists public.course_tier;

-- ── subscription_status: 'active' | 'inactive' | 'trialing' ─────────────
-- (Stripe webhook is the source of truth for this column.)
alter type public.subscription_status rename to subscription_status_old;
create type public.subscription_status as enum ('active', 'inactive', 'trialing');

alter table public.profiles alter column subscription_status drop default;
alter table public.profiles
  alter column subscription_status type public.subscription_status
  using (case when subscription_status::text = 'active' then 'active' else 'inactive' end)::public.subscription_status;
alter table public.profiles alter column subscription_status set default 'inactive';
drop type public.subscription_status_old;

-- Stripe linkage (written ONLY by the webhook via service role; the
-- protect_billing_columns trigger from 0001 covers billing_customer_id, and
-- we extend it to the new column below).
alter table public.profiles add column if not exists stripe_subscription_id text;

create or replace function public.protect_billing_columns()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if (new.subscription_status is distinct from old.subscription_status
      or new.billing_customer_id is distinct from old.billing_customer_id
      or new.stripe_subscription_id is distinct from old.stripe_subscription_id)
     and coalesce(auth.jwt() ->> 'role', current_user) <> 'service_role'
     and current_user <> 'postgres'
  then
    raise exception 'billing fields can only be changed by the server';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- ── Entitlement helper ───────────────────────────────────────────────────
-- 'trialing' counts as entitled (a Stripe trial is a valid subscription).
-- To make trials non-entitled, remove 'trialing' here — single source.
create or replace function public.has_active_subscription()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and subscription_status in ('active', 'trialing')
  );
$$;

-- ── subjects ─────────────────────────────────────────────────────────────
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── lessons ──────────────────────────────────────────────────────────────
-- mux_playback_id is for a SIGNED Mux playback policy: the ID alone is
-- useless without a short-lived signed token minted by the server route
-- (/api/mux/playback-token), which performs the subscription check.
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  title text not null,
  lesson_number int not null,
  mux_playback_id text,
  thumbnail_url text,
  is_free boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (subject_id, lesson_number)
);

-- ── progress ─────────────────────────────────────────────────────────────
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index lessons_subject_idx on public.lessons (subject_id, sort_order);
create index progress_user_idx on public.progress (user_id, last_watched_at desc);

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table public.subjects enable row level security;
alter table public.lessons enable row level security;
alter table public.progress enable row level security;

-- POLICY: subjects readable by any authenticated user (catalog metadata).
-- No anon read: the portal is the only consumer. No write policies —
-- content is managed via Studio / service role.
create policy "subjects: authenticated read"
  on public.subjects for select
  using (auth.uid() is not null);

-- POLICY: lessons readable by any authenticated user. This is metadata +
-- the signed-policy playback ID; the REAL access gate for paid video is the
-- server token route, which re-checks is_free / subscription before signing.
create policy "lessons: authenticated read"
  on public.lessons for select
  using (auth.uid() is not null);

-- POLICY: progress — users read and write ONLY their own rows. User A
-- selecting User B's progress returns zero rows.
create policy "progress: read own"
  on public.progress for select
  using (user_id = auth.uid());

create policy "progress: insert own"
  on public.progress for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.lessons l where l.id = lesson_id)
  );

create policy "progress: update own"
  on public.progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "progress: delete own"
  on public.progress for delete
  using (user_id = auth.uid());

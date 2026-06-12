-- ════════════════════════════════════════════════════════════════════════
-- 0005 — Admin console groundwork
--
--  * subscription_status gains 'comped' (admin-granted free access, kept
--    separate from 'active' so revenue analytics exclude it)
--  * sign_in_events / subscription_events for own-data analytics
--  * app_settings (single row): Box Promo target etc.
--  * lessons: is_archived (soft hide) + Mux upload lifecycle columns
--
-- Every table RLS-enabled; policies documented inline and in SECURITY.md.
-- ════════════════════════════════════════════════════════════════════════

-- ── 'comped' status ───────────────────────────────────────────────────────
-- (PG 12+: allowed in a transaction as long as the new value isn't used in
-- the same transaction — nothing below inserts 'comped'.)
alter type public.subscription_status add value if not exists 'comped';

-- Entitlement: comped students get the same content access as active ones.
-- NOTE: the column is cast to TEXT for the comparison. Comparing against the
-- enum literal 'comped' here would fail with "unsafe use of new value" —
-- new enum values can't be referenced as enum values until the ALTER TYPE
-- above is committed, but text comparison is safe in the same transaction.
create or replace function public.has_active_subscription()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and subscription_status::text in ('active', 'trialing', 'comped')
  );
$$;

-- ── lessons: archive + Mux upload lifecycle ──────────────────────────────
alter table public.lessons
  add column if not exists is_archived boolean not null default false,
  add column if not exists mux_asset_id text,
  add column if not exists mux_upload_id text,
  add column if not exists mux_status text not null default 'none'
    check (mux_status in ('none', 'awaiting_upload', 'processing', 'ready', 'errored'));

-- ── sign_in_events ────────────────────────────────────────────────────────
create table public.sign_in_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index sign_in_events_created_idx on public.sign_in_events (created_at desc);

alter table public.sign_in_events enable row level security;

-- POLICY: the auth flow inserts one row per successful sign-in AS the user
-- who just signed in — user_id is forced to the caller.
create policy "sign_in_events: insert own"
  on public.sign_in_events for insert
  with check (user_id = auth.uid());

-- POLICY: only admins can read (analytics). No update/delete for anyone.
create policy "sign_in_events: admin read"
  on public.sign_in_events for select
  using (public.is_admin());

-- ── subscription_events ───────────────────────────────────────────────────
-- One row per subscription_status change. Written ONLY by server code using
-- the service role (Stripe webhook → source 'stripe'; admin grant/revoke →
-- source 'admin'), so there are NO insert policies at all.
create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  old_status text,
  new_status text not null,
  source text not null check (source in ('stripe', 'admin')),
  created_at timestamptz not null default now()
);
create index subscription_events_created_idx on public.subscription_events (created_at desc);

alter table public.subscription_events enable row level security;

-- POLICY: admin read-only; all writes come from service role (bypasses RLS).
create policy "subscription_events: admin read"
  on public.subscription_events for select
  using (public.is_admin());

-- ── app_settings (single row) ─────────────────────────────────────────────
-- Box Promo target + room for future rail configuration. Rail order itself
-- reuses topics.sort_order.
create table public.app_settings (
  id boolean primary key default true check (id), -- enforces a single row
  featured_subject_id uuid references public.subjects (id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id) values (true);

alter table public.app_settings enable row level security;

-- POLICY: every signed-in student reads settings (dashboard needs the Box
-- Promo target); only admins may change them.
create policy "app_settings: authenticated read"
  on public.app_settings for select
  using (auth.uid() is not null);

create policy "app_settings: admin update"
  on public.app_settings for update
  using (public.is_admin())
  with check (public.is_admin());
-- No insert/delete policies: the single row is created above and never
-- removed (service role only, if ever).

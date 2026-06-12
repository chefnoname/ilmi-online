-- ════════════════════════════════════════════════════════════════════════
-- 0004 — Three-level hierarchy + admin-role groundwork
--
--   Topic (rail) → Subject (series card, no video) → Lesson (one Mux video)
--
-- WIPES existing subjects/lessons test data (and dependent progress/benefit
-- rows) and rebuilds. Adds profiles.role ('student' | 'admin'): content
-- tables become read-only for students, writable only by admins. No admin
-- UI yet — permission groundwork only. All tables RLS-enabled.
-- ════════════════════════════════════════════════════════════════════════

-- ── Wipe the two-level content model ─────────────────────────────────────
-- CASCADE drops the FK constraints on progress/benefits (not the tables);
-- their now-orphaned rows are test data and are wiped below.
drop table if exists public.lessons cascade;
drop table if exists public.subjects cascade;
delete from public.progress;
delete from public.benefits;

-- ── profiles.role ─────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists role text not null default 'student'
  check (role in ('student', 'admin'));

-- SECURITY: users must not be able to grant themselves admin through the
-- "update own profile" policy. role joins the trigger-protected columns —
-- only service_role (or Studio/postgres, where you'll set your own role
-- manually) may change it.
create or replace function public.protect_billing_columns()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if (new.subscription_status is distinct from old.subscription_status
      or new.billing_customer_id is distinct from old.billing_customer_id
      or new.stripe_subscription_id is distinct from old.stripe_subscription_id
      or new.role is distinct from old.role)
     and coalesce(auth.jwt() ->> 'role', current_user) <> 'service_role'
     and current_user <> 'postgres'
  then
    raise exception 'billing/role fields can only be changed by the server';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- SECURITY DEFINER so content-table policies can check the caller's role
-- without recursive RLS evaluation on profiles.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── topics ────────────────────────────────────────────────────────────────
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── subjects (series container — has NO video of its own) ────────────────
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  title text not null,
  slug text not null unique,
  thumbnail_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── lessons (one Mux video each) ──────────────────────────────────────────
-- mux_playback_policy mirrors the asset's policy in Mux:
--   'signed' (default) → playback requires a server-minted JWT (the token
--                        route is the access gate)
--   'public'           → the playback ID streams without a token
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  title text not null,
  lesson_number int not null,
  mux_playback_id text,
  mux_playback_policy text not null default 'signed'
    check (mux_playback_policy in ('public', 'signed')),
  thumbnail_url text,
  is_free boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (subject_id, lesson_number)
);

create index subjects_topic_idx on public.subjects (topic_id, sort_order);
create index lessons_subject_idx on public.lessons (subject_id, lesson_number);

-- Re-point the dependent tables at the new lessons table.
alter table public.progress
  add constraint progress_lesson_id_fkey
  foreign key (lesson_id) references public.lessons (id) on delete cascade;
alter table public.benefits
  add constraint benefits_lesson_id_fkey
  foreign key (lesson_id) references public.lessons (id) on delete cascade;

-- ════════════════════════════════════════════════════════════════════════
-- RLS — content readable by any authenticated user; writable by admins only
-- ════════════════════════════════════════════════════════════════════════
alter table public.topics enable row level security;
alter table public.subjects enable row level security;
alter table public.lessons enable row level security;

-- POLICY: catalog metadata readable by signed-in users (students + admins).
-- Paid VIDEO access is still gated by the Mux signed-token route.
create policy "topics: authenticated read"
  on public.topics for select
  using (auth.uid() is not null);

create policy "subjects: authenticated read"
  on public.subjects for select
  using (auth.uid() is not null);

create policy "lessons: authenticated read"
  on public.lessons for select
  using (auth.uid() is not null);

-- POLICY: content writes are admin-only (groundwork for the future admin
-- console). Students get zero write access; with check guards both halves
-- of UPDATE. One trio per table:
create policy "topics: admin insert" on public.topics for insert with check (public.is_admin());
create policy "topics: admin update" on public.topics for update using (public.is_admin()) with check (public.is_admin());
create policy "topics: admin delete" on public.topics for delete using (public.is_admin());

create policy "subjects: admin insert" on public.subjects for insert with check (public.is_admin());
create policy "subjects: admin update" on public.subjects for update using (public.is_admin()) with check (public.is_admin());
create policy "subjects: admin delete" on public.subjects for delete using (public.is_admin());

create policy "lessons: admin insert" on public.lessons for insert with check (public.is_admin());
create policy "lessons: admin update" on public.lessons for update using (public.is_admin()) with check (public.is_admin());
create policy "lessons: admin delete" on public.lessons for delete using (public.is_admin());

-- progress (0002) and benefits (0003) policies are unchanged: users manage
-- only their own rows.

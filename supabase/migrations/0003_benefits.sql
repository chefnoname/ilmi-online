-- ════════════════════════════════════════════════════════════════════════
-- 0003 — "Benefits" (per-lesson comments / fawā'id)
--
-- Flat list, no threading. author_name is denormalised at insert time so we
-- never need to relax the profiles RLS (profiles stay readable only by their
-- owner). RLS enabled, policies documented in SECURITY.md.
-- ════════════════════════════════════════════════════════════════════════

create table public.benefits (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Snapshot of the author's display name (see app/(portal)/actions.ts).
  author_name text not null default 'Student',
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index benefits_lesson_idx on public.benefits (lesson_id, created_at desc);

alter table public.benefits enable row level security;

-- POLICY: any signed-in student can read a lesson's benefits (the lesson
-- itself is metadata-readable to all authenticated users; video access is
-- gated separately by the Mux token route).
create policy "benefits: authenticated read"
  on public.benefits for select
  using (auth.uid() is not null);

-- POLICY: students post as themselves only; the lesson must exist and be
-- visible under the lessons RLS policy.
create policy "benefits: insert own"
  on public.benefits for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.lessons l where l.id = lesson_id)
  );

-- POLICY: students may delete their own benefit. No update policy (no
-- editing in the shell).
create policy "benefits: delete own"
  on public.benefits for delete
  using (user_id = auth.uid());

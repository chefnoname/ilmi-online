-- Seed: real curriculum content. mux_playback_id / thumbnail_url left NULL —
-- populate them after uploading to Mux (see SETUP.md).
-- Test users are created separately: `npm run seed:users` (scripts/seed-users.mjs).
-- Usul Thalatha is seeded as is_free = true so the free-user flow is
-- testable end-to-end; flip it if that's not intended.

insert into public.subjects (title, slug, sort_order) values
  ('Aqeedah', 'aqeedah', 1),
  ('Fiqh', 'fiqh', 2);

insert into public.lessons (subject_id, title, lesson_number, is_free, sort_order)
select s.id, l.title, l.lesson_number, l.is_free, l.lesson_number
from public.subjects s
join (values
  ('aqeedah', 'Usul Thalatha', 1, true),
  ('aqeedah', 'Fadl Islam', 2, false),
  ('aqeedah', 'Qawaaid Arbaa', 3, false),
  ('fiqh', 'Saafinah an Najaa', 1, false)
) as l(subject_slug, title, lesson_number, is_free)
  on s.slug = l.subject_slug;

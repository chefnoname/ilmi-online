-- Seed: three-level hierarchy (run AFTER 0004).
-- Topic (rail) → Subject (series card) → Lesson (one Mux video).
--
-- mux_playback_id / thumbnail_url are left NULL — populate after uploading
-- to Mux. mux_playback_policy defaults to 'signed', is_free to false; flip
-- the specific free/public lesson yourself after seeding, e.g.:
--   update lessons set is_free = true, mux_playback_policy = 'public'
--   where title = 'Usul Thalatha - Lesson 1';
-- Test users: `npm run seed:users` (scripts/seed-users.mjs).

insert into public.topics (title, slug, sort_order) values
  ('Aqeedah', 'aqeedah', 1),
  ('Fiqh', 'fiqh', 2);

insert into public.subjects (topic_id, title, slug, sort_order)
select t.id, s.title, s.slug, s.sort_order
from public.topics t
join (values
  ('aqeedah', 'Usul Thalatha', 'usul-thalatha', 1),
  ('aqeedah', 'Fadl Islam', 'fadl-islam', 2),
  ('aqeedah', 'Qawaaid al Arbaa', 'qawaaid-al-arbaa', 3),
  ('fiqh', 'Saafinah an Najaa', 'saafinah-an-najaa', 1)
) as s(topic_slug, title, slug, sort_order)
  on t.slug = s.topic_slug;

-- Lessons: "<Subject> - Lesson N", lesson_number 1..N per subject.
insert into public.lessons (subject_id, title, lesson_number, sort_order)
select s.id, s.title || ' - Lesson ' || n, n, n
from public.subjects s
cross join lateral generate_series(
  1,
  case s.slug
    when 'usul-thalatha' then 5
    when 'fadl-islam' then 5
    when 'qawaaid-al-arbaa' then 2
    when 'saafinah-an-najaa' then 1  -- placeholder count; more added later
  end
) as n;

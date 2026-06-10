-- Seed catalog data (run with service role / supabase db reset).
-- Test users are created separately: `npm run seed:users` (scripts/seed-users.mjs).

insert into public.courses (slug, title, tagline, description, scholar_name, scholar_title, tier, gradient, is_published, position) values
('foundations-of-fiqh', 'Foundations of Fiqh', 'Worship with certainty, not guesswork.',
 'A structured walk through purification, prayer, fasting and zakah according to classical methodology — built for students starting their journey of sacred knowledge.',
 'Shaykh Yusuf Adam', 'Senior Instructor, Dar al-Ilm', 'paid', 'warm', true, 1),
('seerah-the-prophetic-biography', 'Seerah: The Prophetic Biography', 'Know the man you follow.',
 'From the Year of the Elephant to the Farewell Pilgrimage — a chronological, source-driven study of the life of the Messenger ﷺ with lessons for modern life.',
 'Ustadha Maryam Hassan', 'Lecturer in Islamic History', 'paid', 'cool', true, 2),
('arabic-from-zero', 'Arabic From Zero', 'Read the Qur''an the way it was revealed.',
 'Letters, vocabulary and grammar from an absolute beginner''s level, designed to take you to reading Qur''anic passages with understanding.',
 'Ustadh Bilal Farouk', 'Arabic Language Instructor', 'paid', 'deep', true, 3),
('intro-to-islam', 'Introduction to Islam', 'Start here. Completely free.',
 'The five pillars, the six articles of faith and the purpose of life — a free foundational course open to every registered student.',
 'Shaykh Yusuf Adam', 'Senior Instructor, Dar al-Ilm', 'free', 'warm', true, 0);

-- Lessons (first lesson of each paid course is a public preview)
insert into public.lessons (course_id, slug, title, description, video_url, duration_minutes, position, is_preview)
select c.id, l.slug, l.title, l.description, l.video_url, l.duration_minutes, l.position, l.is_preview
from public.courses c
join (values
  ('foundations-of-fiqh', 'why-fiqh-matters', 'Why Fiqh Matters', 'What fiqh is, what it is not, and why every worshipper needs it.', 'https://videos.example.com/fiqh/01.m3u8', 18, 1, true),
  ('foundations-of-fiqh', 'purification-tahara', 'Purification (Tahara)', 'Wudu, ghusl and the rulings of water.', 'https://videos.example.com/fiqh/02.m3u8', 42, 2, false),
  ('foundations-of-fiqh', 'the-prayer-salah', 'The Prayer (Salah)', 'Conditions, pillars and obligatory acts of salah.', 'https://videos.example.com/fiqh/03.m3u8', 55, 3, false),
  ('foundations-of-fiqh', 'fasting-sawm', 'Fasting (Sawm)', 'Rulings of Ramadan, what breaks the fast, making up days.', 'https://videos.example.com/fiqh/04.m3u8', 38, 4, false),
  ('seerah-the-prophetic-biography', 'arabia-before-the-message', 'Arabia Before the Message', 'The world the Prophet ﷺ was born into.', 'https://videos.example.com/seerah/01.m3u8', 25, 1, true),
  ('seerah-the-prophetic-biography', 'the-first-revelation', 'The First Revelation', 'Cave of Hira and the beginning of prophethood.', 'https://videos.example.com/seerah/02.m3u8', 33, 2, false),
  ('seerah-the-prophetic-biography', 'the-hijrah', 'The Hijrah', 'The migration to Madinah and building of the first community.', 'https://videos.example.com/seerah/03.m3u8', 47, 3, false),
  ('arabic-from-zero', 'the-arabic-alphabet', 'The Arabic Alphabet', 'All 28 letters, their shapes and sounds.', 'https://videos.example.com/arabic/01.m3u8', 30, 1, true),
  ('arabic-from-zero', 'connecting-letters', 'Connecting Letters', 'How letters join and change shape.', 'https://videos.example.com/arabic/02.m3u8', 28, 2, false),
  ('arabic-from-zero', 'your-first-100-words', 'Your First 100 Words', 'High-frequency Qur''anic vocabulary.', 'https://videos.example.com/arabic/03.m3u8', 35, 3, false),
  ('intro-to-islam', 'what-is-islam', 'What is Islam?', 'The meaning of submission and the shahadah.', 'https://videos.example.com/intro/01.m3u8', 20, 1, true),
  ('intro-to-islam', 'the-five-pillars', 'The Five Pillars', 'Prayer, charity, fasting and pilgrimage at a glance.', 'https://videos.example.com/intro/02.m3u8', 26, 2, false),
  ('intro-to-islam', 'the-six-articles-of-faith', 'The Six Articles of Faith', 'What every Muslim believes.', 'https://videos.example.com/intro/03.m3u8', 24, 3, false)
) as l(course_slug, slug, title, description, video_url, duration_minutes, position, is_preview)
  on c.slug = l.course_slug;

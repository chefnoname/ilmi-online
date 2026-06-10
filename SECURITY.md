# Security — Ilmi Online

This is a paid platform; the database is the security boundary, not the UI.
Three layers, in order of authority:

1. **Postgres RLS** — every table has Row Level Security enabled with explicit policies. Even a bug in app code cannot leak another user's data or paid content.
2. **Server-side checks** — middleware redirects + `requireUser()` in every portal page/server action. All mutations are server actions or route handlers that re-authenticate; nothing trusts the client.
3. **UI gating** — purely cosmetic (locked badges, upgrade prompts).

## Keys

| Key | Where | Why it's safe |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Subject to RLS; can only do what policies allow |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (`lib/supabase/admin.ts`, `scripts/`) | Guarded by `import "server-only"` — the build **fails** if any client component imports it. Used only by the billing checkout route (dev stub) and future Stripe webhook. |

Never add `NEXT_PUBLIC_` to the service key. Never call `createAdminClient()` in a request path without authenticating the user first (see `app/api/billing/checkout/route.ts` — it updates only `auth.uid()`'s own row).

## RLS policy reference (supabase/migrations/0001_init.sql)

### profiles
- `profiles: read own` — `SELECT` where `id = auth.uid()`. User A querying User B's profile gets **zero rows**, not an error.
- `profiles: update own` — `UPDATE` own row only. Billing columns (`subscription_status`, `billing_customer_id`) are additionally locked by the `protect_billing_columns` trigger, which raises unless the request runs as `service_role`. A user cannot self-upgrade by PATCHing their profile.
- No INSERT (trigger `on_auth_user_created` creates rows) and no DELETE policies.

### courses
- `courses: public can browse published` — `SELECT` where `is_published`. Course *metadata* is the public catalog; the protected asset is lesson video. No write policies (manage via Studio/service role).

### lessons (the paid content)
- One `SELECT` policy with three branches, all requiring the parent course `is_published`:
  1. `is_preview = true` → anyone (marketing teasers),
  2. course `tier = 'free'` → any authenticated user,
  3. course `tier = 'paid'` → only `has_active_subscription()` (SECURITY DEFINER fn checking `profiles.subscription_status = 'active'`).
- A free user querying a paid lesson gets zero rows — `video_url` never leaves Postgres.

### enrollments
- `read own` / `delete own` — `user_id = auth.uid()`.
- `insert own, access-checked` — forces `user_id = auth.uid()` AND course must be free tier or user must have an active subscription. Nobody can enrol another user or self-enrol into paid content.

### lesson_progress
- `read/update/delete own` — `user_id = auth.uid()`.
- `insert` requires the referenced lesson to be **visible under the lessons RLS policy** (the inner `EXISTS` runs as the user), so progress can't be written against content the user can't access.

## How subscription gating works (Stripe-ready stub)

Access = `profiles.subscription_status = 'active'`. Nothing else. To wire Stripe:
implement `PaymentProvider` (`lib/payments/index.ts`), add a webhook route that
verifies the Stripe signature and uses `createAdminClient()` to set
`subscription_status` on subscription events. No UI or RLS changes needed.
`DEV_FAKE_CHECKOUT=true` (dev only, refuses to run in production builds) lets
you flip your own status for local testing.

## Testing that User A cannot read User B's data

Seed: `supabase db reset` (applies migration + seed.sql), then `npm run seed:users` creates
`student-free@test.ilmi.online` and `student-paid@test.ilmi.online` (password `IlmiTest!2026`).

In the SQL editor (or psql), impersonate users with their UUIDs:

```sql
-- act as the FREE user
select set_config('request.jwt.claims',
  json_build_object('sub', '<FREE_USER_UUID>', 'role', 'authenticated')::text, true);
set local role authenticated;

-- 1. profiles isolation: must return ONLY the free user's row (1 row)
select id, subscription_status from profiles;

-- 2. cannot read the paid user's profile: 0 rows
select * from profiles where id = '<PAID_USER_UUID>';

-- 3. paid lessons hidden: only previews + free-course lessons returned
select title, is_preview from lessons;

-- 4. cannot self-upgrade: must raise 'billing fields can only be changed by the server'
update profiles set subscription_status = 'active' where id = '<FREE_USER_UUID>';

-- 5. cannot enrol in a paid course: 0 rows inserted / RLS violation
insert into enrollments (user_id, course_id)
values ('<FREE_USER_UUID>', (select id from courses where slug = 'foundations-of-fiqh'));

-- 6. cannot write progress against a paid lesson: RLS violation
insert into lesson_progress (user_id, lesson_id)
values ('<FREE_USER_UUID>', (select id from lessons where slug = 'the-prayer-salah'));
```

Repeat as the PAID user: step 3 must now return all lessons, steps 5–6 succeed,
steps 2 and 4 must still fail. Also verify in two browsers: log in as each user,
confirm dashboards show only their own enrollments/progress, and that the free
user hitting `/dashboard/courses/foundations-of-fiqh/the-prayer-salah` sees the
subscribe screen, not video.

## Go-live checklist

- [ ] `supabase db reset` applied cleanly; **every** table shows `rowsecurity = true` (`select tablename, rowsecurity from pg_tables where schemaname='public';`)
- [ ] Full RLS test matrix above passes for both seed users
- [ ] `DEV_FAKE_CHECKOUT` removed from production env
- [ ] `SUPABASE_SERVICE_ROLE_KEY` present only in server env (hosting secrets), absent from any `NEXT_PUBLIC_*`
- [ ] Email confirmation **enabled** in Supabase Auth settings; site URL + redirect URLs configured for `/auth/callback`
- [ ] Password min length ≥ 8 in Supabase Auth settings (matches server validation)
- [ ] Anonymous visit to `/dashboard` and `/account` redirects to `/login` (middleware) — test with curl, not just a browser
- [ ] Logged-out fetch of a paid lesson row via the REST API with the anon key returns `[]`
- [ ] Stripe webhook (when added) verifies signatures before touching the DB
- [ ] Rate limiting / bot protection enabled on auth endpoints (Supabase dashboard)
- [ ] Test users removed or passwords rotated

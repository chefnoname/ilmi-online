# Security — Ilmi Online

This is a paid platform; the server and database are the security boundary,
never the UI. Three layers, in order of authority:

1. **Postgres RLS** — every table has Row Level Security enabled with explicit policies.
2. **Server-side gates** — middleware + `requireUser()` on every portal page; the Mux signed-token route is the access gate for paid video; the Stripe webhook is the only writer of subscription state.
3. **UI gating** — purely cosmetic (lock badges, upgrade screens).

## Keys

| Key | Where | Why it's safe |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Subject to RLS |
| `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Server only (`lib/supabase/admin.ts`) | `import "server-only"` — build fails if a client component imports it. Used only by the Stripe webhook/checkout (own-row writes) and seed scripts. |
| `MUX_SIGNING_KEY_ID` / `MUX_SIGNING_KEY_PRIVATE` | Server only (`lib/mux.ts`) | `server-only` guarded; tokens minted exclusively in `/api/mux/playback-token` after auth + entitlement checks |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Server only (`lib/stripe.ts`) | `server-only` guarded; webhook verifies signatures before any DB write |

## RLS policy reference

### profiles (0001 + 0002)
- `profiles: read own` — `SELECT` where `id = auth.uid()`. User A querying User B's profile returns **zero rows**.
- `profiles: update own` — own row only, AND the `protect_billing_columns` trigger raises an exception if `subscription_status`, `billing_customer_id`, or `stripe_subscription_id` change outside the service role. **Users cannot self-upgrade.**
- No INSERT (auth trigger creates rows) / no DELETE policies.

### topics / subjects / lessons (0004 — three-level hierarchy)
- `topics|subjects|lessons: authenticated read` — catalog metadata for any signed-in user. No anon read.
- `topics|subjects|lessons: admin insert/update/delete` — writes require `is_admin()`, a SECURITY DEFINER function checking `profiles.role = 'admin'` for `auth.uid()`. Students (`role = 'student'`) are **read-only** on all content tables. Groundwork for the future admin console; no admin UI exists yet.
- `profiles.role` is locked by the same trigger as billing columns (`protect_billing_columns`): a user updating their own profile **cannot** set `role = 'admin'` — only the service role or Studio (postgres) can. Set your own role to admin manually in Studio for testing.

### lessons — playback policy (0004)
- `mux_playback_policy = 'signed'` (default): the playback ID alone cannot stream — the real gate is `/api/mux/playback-token`, which checks `is_free` OR `subscription_status in ('active','trialing')` before signing 1-hour tokens.
- `mux_playback_policy = 'public'`: the asset streams without a token (use only for intentionally public previews/free content — anyone with the playback ID can watch). The player skips the token route for these; the route also answers public lessons without minting tokens.

### benefits (0003)
- `benefits: authenticated read` — any signed-in student can read a lesson's benefits (comments).
- `benefits: insert own` — `user_id` forced to the caller; the lesson must be visible under the lessons policy. `author_name` is snapshotted at insert so **profiles never need to be readable by other users**.
- `benefits: delete own` — own rows only. No update policy (no editing).
- Body length is constrained in the database (1–2000 chars).

### progress (0002)
- `read/update/delete own` — `user_id = auth.uid()`; User A cannot read or write User B's progress.
- `insert own` — `user_id` forced to the caller; the referenced lesson must exist and be visible under the lessons policy.

## Admin console (/admin)

Gating — three layers, all server-side:
1. **Middleware**: any `/admin` request by a non-admin (or anonymous) user is redirected before any admin code runs (own-profile `role` lookup under RLS).
2. **`requireAdmin()`**: runs in the admin layout, every admin page, and EVERY admin server action — the authoritative check.
3. **Database**: content writes additionally go through the admin's own session, so the 0004 admin-only RLS policies enforce them a third time. Service-role is used only where RLS must be bypassed (auth listing, other users' profiles, event logs).

Admin server routes/actions (all begin with `requireAdmin()` / signature verification; service-role never reaches the browser):

| Operation | Where | Elevated power |
|---|---|---|
| List students (auth + profiles) | `app/admin/students/page.tsx` | service role |
| Send password reset / magic link | `app/admin/students/actions.ts` | service role (email only — passwords are hashed and can never be read or set) |
| Grant 'comped' / revoke access | `app/admin/students/actions.ts` | service role + `subscription_events` log (source 'admin') |
| Analytics reads | `app/admin/analytics/page.tsx` | service role (read-only) |
| Content CRUD / reorder / archive | `app/admin/upload/actions.ts` | admin session + RLS (no service role) |
| Mux direct-upload URL | `app/admin/upload/actions.ts` → `lib/mux.ts` | Mux management keys (server-only) |
| Mux asset listing (mismatch report) | `app/admin/upload/page.tsx` | Mux management keys |
| Mux webhook (`video.asset.ready/errored`) | `app/api/mux/webhook/route.ts` | HMAC signature verified (MUX_WEBHOOK_SECRET, constant-time, 5-min replay window) before any write; service role after |

'comped' status: admin-granted free access. Content gates (`has_active_subscription()` SQL, `isEntitled()`, `hasActiveSubscription()`) treat `active | trialing | comped` as entitled; analytics count ONLY 'active' as paying.

### New RLS policies (0005)
- `sign_in_events: insert own` — the auth flow logs each successful sign-in as the signed-in user; `admin read` — only admins read; nobody updates/deletes.
- `subscription_events: admin read` — read-only for admins; NO insert policies: only service-role code (Stripe webhook → source 'stripe', admin actions → source 'admin') writes.
- `app_settings: authenticated read` — students read the Box Promo target on dashboard load; `admin update` — only admins change it; single row enforced by the schema.
- `lessons.is_archived` — archived lessons are excluded from the student dashboard, playlists, lesson page (404) and the Mux token route (404); they remain visible/restorable in the admin console. Mux assets are never auto-deleted.

## Subscription state (Stripe is the source of truth)

`profiles.subscription_status ∈ {active, inactive, trialing}` is written ONLY by
`/api/stripe/webhook` (service role) after signature verification. Checkout and
portal routes authenticate the user server-side and only ever touch the
caller's own row. `'trialing'` counts as entitled — change `isEntitled()`
(lib/mux.ts), `hasActiveSubscription()` (lib/auth.ts) and
`has_active_subscription()` (SQL) together if you want trials locked out.

## Test checklist

Setup: apply migrations + seed, `npm run seed:users`
(`student-free@…` = inactive, `student-paid@…` = active; password `IlmiTest!2026`).

### A. User A cannot read User B's data (SQL editor)

```sql
select set_config('request.jwt.claims',
  json_build_object('sub', '<FREE_USER_UUID>', 'role', 'authenticated')::text, true);
set local role authenticated;

-- 1. profiles: exactly 1 row (own)
select id, subscription_status from profiles;
-- 2. other user's profile: 0 rows
select * from profiles where id = '<PAID_USER_UUID>';
-- 3. other user's progress: 0 rows
select * from progress where user_id = '<PAID_USER_UUID>';
-- 4. cannot write progress for someone else: RLS violation
insert into progress (user_id, lesson_id)
values ('<PAID_USER_UUID>', (select id from lessons limit 1));
-- 5. cannot self-upgrade: trigger exception
update profiles set subscription_status = 'active' where id = '<FREE_USER_UUID>';
-- 6. cannot post a benefit as someone else: RLS violation
insert into benefits (user_id, lesson_id, body)
values ('<PAID_USER_UUID>', (select id from lessons limit 1), 'spoof');
-- 7. content tables are write-locked for students: all must fail (RLS)
insert into topics (title, slug, sort_order) values ('Hack', 'hack', 99);
update lessons set title = 'defaced' where lesson_number = 1;
delete from subjects;
-- 8. cannot self-promote to admin: trigger exception
update profiles set role = 'admin' where id = '<FREE_USER_UUID>';
```

After manually setting your own profile's `role = 'admin'` in Studio, repeat
step 7 as your admin user — inserts/updates/deletes must then succeed.

### B. Non-subscriber cannot get a Mux token for a paid lesson

1. Log in as `student-free@test.ilmi.online` in a browser; copy the cookies.
2. `curl -X POST https://localhost:3000/api/mux/playback-token -H 'Content-Type: application/json' -H 'Cookie: <copied>' -d '{"lessonId":"<PAID_LESSON_UUID>"}'` → **must be 403**.
3. Same request with a FREE lesson id (`Usul Thalatha`) → 200 with tokens.
4. Same request with no cookies → 401.
5. Log in as `student-paid@…` → paid lesson returns 200.
6. UI check: free user opening `/dashboard/lessons/<paid id>` sees the subscribe screen, never the player.

### C. Webhook integrity

- [ ] POST to `/api/stripe/webhook` without a valid `stripe-signature` returns 400 and writes nothing
- [ ] `stripe trigger customer.subscription.updated` (CLI) updates the right profile
- [ ] Cancelling in the billing portal flips status to `inactive` after the webhook fires

## Go-live checklist

- [ ] Migrations applied; `select tablename, rowsecurity from pg_tables where schemaname='public';` shows `true` for **every** table
- [ ] Full test matrix above passes (A, B, C)
- [ ] All Mux assets use the **signed** playback policy (no `public` playback IDs on lessons)
- [ ] `DEV_FAKE_CHECKOUT` removed from production env; `STRIPE_*` set
- [ ] Secret keys (`SUPABASE_SECRET_KEY`, `MUX_*`, `STRIPE_*`) only in server env — never `NEXT_PUBLIC_*`
- [ ] Email confirmation enabled in Supabase Auth; redirect URLs include `/auth/callback`
- [ ] Anonymous `/dashboard` and `/account` requests redirect to `/login` (curl, not just browser)
- [ ] Landing page (`app/page.tsx` + `components/landing/`) imports no Supabase code
- [ ] Test users removed or passwords rotated
- [ ] As a STUDENT: every `/admin` URL redirects to /dashboard (curl with student cookies, not just UI)
- [ ] As a student: calling an admin server action directly returns a redirect, not data
- [ ] Mux webhook with a bad/missing `mux-signature` returns 400 and writes nothing
- [ ] Archived lesson: student gets 404 on the page AND on the token route

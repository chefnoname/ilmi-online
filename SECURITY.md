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

### subjects (0002)
- `subjects: authenticated read` — catalog metadata for signed-in students. No anon read, no write policies (managed via Studio/service role).

### lessons (0002)
- `lessons: authenticated read` — any signed-in user can read lesson metadata **including `mux_playback_id`**. That is intentional and safe: all assets use Mux's *signed* playback policy, so a playback ID without a server-minted JWT cannot stream anything. The real gate is `/api/mux/playback-token`, which checks `is_free` OR `subscription_status in ('active','trialing')` before signing 1-hour tokens.

### benefits (0003)
- `benefits: authenticated read` — any signed-in student can read a lesson's benefits (comments).
- `benefits: insert own` — `user_id` forced to the caller; the lesson must be visible under the lessons policy. `author_name` is snapshotted at insert so **profiles never need to be readable by other users**.
- `benefits: delete own` — own rows only. No update policy (no editing).
- Body length is constrained in the database (1–2000 chars).

### progress (0002)
- `read/update/delete own` — `user_id = auth.uid()`; User A cannot read or write User B's progress.
- `insert own` — `user_id` forced to the caller; the referenced lesson must exist and be visible under the lessons policy.

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
```

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

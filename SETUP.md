# SETUP — Ilmi Online

## 1. Database

In the Supabase SQL Editor (or `supabase db reset` with the CLI), run in order:

1. `supabase/migrations/0001_init.sql` — skip if already applied
2. `supabase/migrations/0002_portal_model.sql` — drops the old course model, creates `subjects` / `lessons` / `progress`, switches `subscription_status` to `active | inactive | trialing`
3. `supabase/migrations/0003_benefits.sql` — per-lesson "benefits" comments
4. `supabase/seed.sql` — seeds Aqeedah (Usul Thalatha, Fadl Islam, Qawaaid Arbaa) and Fiqh (Saafinah an Najaa)
5. `npm run seed:users` — creates the two RLS test users (needs the secret key in `.env.local`)

## 2. Mux (secure video)

1. Upload each lesson's video as a Mux asset with playback policy **signed** (not public). For existing assets, add a signed playback ID.
2. Create a **Signing Key**: Mux dashboard → Settings → Signing Keys → Create. Put the key id in `MUX_SIGNING_KEY_ID` and the base64 private key in `MUX_SIGNING_KEY_PRIVATE`.
3. Populate playback IDs (SQL Editor):

```sql
update lessons set mux_playback_id = '<SIGNED_PLAYBACK_ID>' where title = 'Usul Thalatha';
-- repeat per lesson; optionally set thumbnail_url to a hosted image,
-- or leave NULL to use the branded gradient placeholder.
```

How playback stays secure: the player never receives a raw stream URL. It POSTs to `/api/mux/playback-token`, which verifies the session, checks `is_free` OR `subscription_status in ('active','trialing')`, and only then signs 1-hour JWTs with the server-held key. Without that token, Mux refuses to stream — even with a known playback ID.

## 3. Stripe (subscription)

1. Create a Product with a recurring Price (e.g. monthly). Put the price id in `STRIPE_PRICE_ID` and your secret key in `STRIPE_SECRET_KEY`.
2. Webhook: Stripe dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://YOUR-DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Put the signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (the CLI prints a `whsec_...` to use locally). Test card `4242 4242 4242 4242`.
4. Enable the **Billing Portal** (Settings → Billing → Customer portal) so "Manage Billing" works.

Flow: Subscribe button → `/api/stripe/checkout` (server creates/reuses the customer, starts Checkout) → Stripe → webhook sets `profiles.subscription_status` (`active` / `trialing` / `inactive`). The webhook is the **only** writer of billing columns — a DB trigger rejects all other writers, including the user.

No Stripe keys yet? Leave `STRIPE_SECRET_KEY` unset and keep `DEV_FAKE_CHECKOUT=true`: in dev, Subscribe activates instantly so you can build/test the portal.

## 4. Run

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Test accounts (after `seed:users`, password `IlmiTest!2026`):
`student-paid@test.ilmi.online` (active) · `student-free@test.ilmi.online` (inactive).

Before going live, run the security checklist in **SECURITY.md** — including the proof that a non-subscriber cannot obtain a Mux token for a paid lesson.

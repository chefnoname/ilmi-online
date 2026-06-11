# Ilmi Online

Islamic education subscription platform — Next.js 14 (App Router) + TypeScript +
Tailwind + shadcn/ui + Supabase (Auth, Postgres, RLS) + Mux (signed video) + Stripe.

**Start here → `SETUP.md`** (database, Mux playback IDs, Stripe wiring).
**Before deploying → `SECURITY.md`** (RLS reference + test checklist).

## Structure

```
app/
  page.tsx              # public landing (ported 1:1 from the live Lovable build)
  (auth)/               # /login /signup /forgot-password /reset-password /verify-email
  (portal)/             # authed: /dashboard (Box Promo + subject rails),
                        #   /dashboard/lessons/[id] (Mux player), /account (billing)
  api/mux/playback-token/   # THE gate for paid video — mints signed Mux JWTs
  api/stripe/           # checkout, webhook (source of truth), billing portal
  auth/callback/        # email verification / recovery code exchange
components/
  landing/              # ported Lovable components (+ their ui primitives)
  portal/               # box-promo, lesson-card, lesson-player
  ui/                   # brand-themed shadcn primitives (portal/auth)
  site/                 # kufic-pattern, wordmark
lib/
  supabase/             # client (anon) / server (anon+cookies) / admin (secret, server-only)
  auth.ts mux.ts stripe.ts config.ts
supabase/
  migrations/           # 0001 base + 0002 portal model (subjects/lessons/progress)
  seed.sql              # Aqeedah + Fiqh curriculum
middleware.ts            # session refresh + server-side route protection
```

## Data model

`subjects` → `lessons` (lesson_number, mux_playback_id, thumbnail_url, is_free) ·
`profiles.subscription_status` (`active | inactive | trialing`, written only by the
Stripe webhook) · `progress` (per-user, RLS-isolated).

## Brand

Tailwind tokens in `tailwind.config.ts`: brand colours (#52B955 / #388567 /
#F6BB25 / #333333 / #72CBD2 / #34A576), `bg-brand-warm|cool|deep` gradients,
`.display` headings (Nimbus Sans Extended, Archivo Expanded fallback), Kufic
pattern texture, pill yellow CTAs. The landing page additionally ships the
Lovable design-system classes (`gradient-brand`, `gradient-text`,
`monogram-overlay`, `section-padding`) scoped to coexist with the portal.

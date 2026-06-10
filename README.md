# Ilmi Online

Islamic education subscription platform — Next.js 14 (App Router) + TypeScript +
Tailwind + shadcn/ui + Supabase (Auth, Postgres, RLS).

## Quick start

```bash
npm install
cp .env.example .env.local        # fill in your Supabase project values

# Database (Supabase CLI, linked project or local stack):
supabase db reset                  # applies supabase/migrations + supabase/seed.sql
npm run seed:users                 # creates the two RLS test users (needs service key)

npm run dev
```

Log in as `student-paid@test.ilmi.online` / `IlmiTest!2026` to see the full
Premium experience, or `student-free@test.ilmi.online` to see gating. With
`DEV_FAKE_CHECKOUT=true`, the Subscribe button on `/account` activates the
subscription instantly (dev stub — see `lib/payments/`).

## Structure

```
app/
  (marketing)/        # public: landing, /courses, /courses/[slug], /about, /faq
  (auth)/             # /login /signup /forgot-password /reset-password /verify-email + actions
  (portal)/           # authed: /dashboard, course + lesson player, /account + actions
  auth/callback/      # email verification / recovery code exchange
  api/billing/        # checkout stub (Stripe goes here later)
components/
  ui/                 # shadcn-style primitives themed to the brand
  site/               # navbar, footer, hero pieces, Kufic pattern, course card
lib/
  supabase/           # client (anon), server (anon+cookies), admin (service, server-only)
  auth.ts             # requireUser / getProfile / hasActiveSubscription
  payments/           # PaymentProvider interface + stub
  fonts.ts            # Archivo (expanded), Inter, Noto Kufi Arabic
supabase/
  migrations/         # schema + RLS (read SECURITY.md alongside)
  seed.sql            # catalog seed
middleware.ts          # session refresh + server-side route protection
```

## Brand system

Implemented as Tailwind tokens (`tailwind.config.ts`):

- Colours: `brand.green` #52B955 · `brand.forest` #388567 · `brand.yellow` #F6BB25
  (CTAs/highlights only) · `brand.carbon` #333333 · `brand.aqua` #72CBD2 · `brand.teal` #34A576
- Gradients: `bg-brand-warm` (green→yellow), `bg-brand-cool` (teal→aqua), `bg-brand-deep`
- Type: `.display` / `.display-sub` → Archivo (variable wdth, rendered expanded,
  800/900, uppercase, tight leading); body is Inter Medium (`font-sans`); Arabic uses
  `.arabic` (Noto Kufi Arabic, RTL-isolated)
- Texture: `<KuficPattern />` — faint square-Kufic SVG used on heroes/dividers
- Buttons: pill radius; `variant="cta"` is the yellow CTA — keep it scarce

## Security

Read **SECURITY.md** before deploying — it documents every RLS policy, the
User-A-vs-User-B test matrix, and the go-live checklist.
# ilmi-online

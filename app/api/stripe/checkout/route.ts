import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import type { Profile } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * POST /api/stripe/checkout — start a subscription checkout.
 *
 * Auth happens server-side; the Stripe customer is created/reused and bound
 * to the Supabase user id via metadata so the webhook can find the profile.
 * Note: this route never sets subscription_status — only the webhook does.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Dev-only fallback when Stripe isn't configured yet (refuses in prod).
  if (!process.env.STRIPE_SECRET_KEY) {
    if (process.env.DEV_FAKE_CHECKOUT === "true" && process.env.NODE_ENV !== "production") {
      const admin = createAdminClient();
      await admin.from("profiles").update({ subscription_status: "active" }).eq("id", user.id);
      return NextResponse.redirect(new URL("/account?activated=dev", request.url), 303);
    }
    return NextResponse.json({ error: "Stripe is not configured (STRIPE_SECRET_KEY)" }, { status: 501 });
  }
  if (!process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID is not set" }, { status: 501 });
  }

  const stripe = getStripe();

  // Reuse the Stripe customer if we have one; otherwise create + persist it.
  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = profileData as Profile | null;
  let customerId = profile?.billing_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    // Service role: billing columns are trigger-locked against user writes.
    const admin = createAdminClient();
    await admin.from("profiles").update({ billing_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${SITE_URL}/account?checkout=success`,
    cancel_url: `${SITE_URL}/account?checkout=cancelled`,
    client_reference_id: user.id,
    subscription_data: { metadata: { supabase_user_id: user.id } },
    allow_promotion_codes: true,
  });

  return NextResponse.redirect(session.url!, 303);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * POST /api/stripe/portal — Stripe Billing Portal for the signed-in student
 * (update card, view invoices, cancel). Auth + customer lookup server-side.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("billing_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.billing_customer_id) {
    return NextResponse.redirect(new URL("/account?error=No+billing+account+yet", request.url), 303);
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.billing_customer_id,
    return_url: `${SITE_URL}/account`,
  });
  return NextResponse.redirect(session.url, 303);
}

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, mapStripeStatus } from "@/lib/stripe";

/**
 * POST /api/stripe/webhook — THE source of truth for subscription_status.
 *
 * Security model:
 *  - The signature is verified against STRIPE_WEBHOOK_SECRET before anything
 *    else; unverified payloads are rejected with 400.
 *  - This is the only request path that writes billing columns, using the
 *    service role (the DB trigger blocks every other writer).
 *
 * Events handled:
 *  - checkout.session.completed            → activate (status from the sub)
 *  - customer.subscription.created/updated → map Stripe status → ours
 *  - customer.subscription.deleted         → 'inactive'
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    // Raw body required for signature verification.
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `Signature verification failed` }, { status: 400 });
  }

  const admin = createAdminClient();

  /** Resolve the profile id for a subscription, then persist its status. */
  async function applySubscription(sub: Stripe.Subscription) {
    const status = mapStripeStatus(sub.status);
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const userId = (sub.metadata?.supabase_user_id as string | undefined) ?? null;

    const update = {
      subscription_status: status,
      billing_customer_id: customerId,
      stripe_subscription_id: sub.id,
    };

    // Resolve the profile (explicit user binding first, then customer id)
    // so the change can be logged with its previous status.
    const lookup = admin.from("profiles").select("id, subscription_status");
    const { data: existing } = userId
      ? await lookup.eq("id", userId).maybeSingle()
      : await lookup.eq("billing_customer_id", customerId).maybeSingle();
    if (!existing) return 0;

    const { error } = await admin.from("profiles").update(update).eq("id", existing.id);
    if (error) throw new Error(error.message);

    // Analytics trail: log every status change (source 'stripe').
    if (existing.subscription_status !== status) {
      await admin.from("subscription_events").insert({
        user_id: existing.id,
        old_status: existing.subscription_status,
        new_status: status,
        source: "stripe",
      });
    }
    return 1;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id,
          );
          // Bind the user explicitly if metadata is missing.
          if (!sub.metadata?.supabase_user_id && session.client_reference_id) {
            sub.metadata = { ...sub.metadata, supabase_user_id: session.client_reference_id };
          }
          await applySubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // 500 → Stripe retries with backoff.
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

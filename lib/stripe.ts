import "server-only"; // Secret key never reaches the client bundle.
import Stripe from "stripe";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

/** Map a Stripe subscription status onto our profiles enum. */
export function mapStripeStatus(status: Stripe.Subscription.Status): "active" | "trialing" | "inactive" {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  // past_due / canceled / unpaid / incomplete / incomplete_expired / paused
  return "inactive";
}

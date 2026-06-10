import "server-only";

/**
 * Payment provider abstraction. The app NEVER talks to a payment provider
 * directly — it reads `profiles.subscription_status`, which only the server
 * (service role) may write.
 *
 * To wire in Stripe later:
 *  1. Implement StripePaymentProvider against this interface.
 *  2. Add /api/billing/webhook: verify STRIPE_WEBHOOK_SECRET, then use the
 *     admin client (lib/supabase/admin.ts) to set subscription_status on
 *     `customer.subscription.updated|deleted` events.
 *  3. Swap the export at the bottom. No UI or RLS changes needed.
 */
export interface PaymentProvider {
  /** Returns a URL to send the user to for checkout. */
  createCheckoutSession(opts: { userId: string; email: string }): Promise<{ url: string }>;
  /** Returns a URL for managing an existing subscription. */
  createBillingPortalSession(opts: { userId: string; billingCustomerId: string | null }): Promise<{ url: string }>;
}

/** Stub used until Stripe is wired in. */
export class StubPaymentProvider implements PaymentProvider {
  async createCheckoutSession({ userId }: { userId: string; email: string }) {
    // In dev, the checkout route activates the subscription directly
    // (guarded by DEV_FAKE_CHECKOUT). In prod this must be a real provider.
    return { url: `/account?checkout=stub&u=${userId}` };
  }
  async createBillingPortalSession() {
    return { url: "/account?portal=stub" };
  }
}

export const payments: PaymentProvider = new StubPaymentProvider();

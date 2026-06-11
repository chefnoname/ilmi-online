import { BadgeCheck, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/(portal)/actions";
import { requireUser, getProfile, hasActiveSubscription } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

const STATUS_LABELS: Record<string, { label: string; tone: "green" | "yellow" | "outline" }> = {
  active: { label: "Subscription Active", tone: "green" },
  trialing: { label: "Trial Active", tone: "yellow" },
  inactive: { label: "No Subscription", tone: "outline" },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { saved?: string; activated?: string; checkout?: string; error?: string };
}) {
  const { user } = await requireUser();
  const profile = await getProfile();
  const entitled = hasActiveSubscription(profile);
  const status = STATUS_LABELS[profile?.subscription_status ?? "inactive"] ?? STATUS_LABELS.inactive;

  return (
    <div className="container max-w-2xl space-y-8 py-10">
      <h1 className="display text-3xl text-brand-carbon">Account</h1>

      {searchParams.saved && (
        <p className="rounded-md bg-brand-green/10 px-4 py-3 text-sm font-semibold text-brand-forest">
          Profile saved.
        </p>
      )}
      {searchParams.checkout === "success" && (
        <p className="rounded-md bg-brand-green/10 px-4 py-3 text-sm font-semibold text-brand-forest">
          Payment received — your access activates as soon as Stripe confirms it (usually
          seconds). Refresh if you don&apos;t see it yet. May it be of benefit!
        </p>
      )}
      {searchParams.checkout === "cancelled" && (
        <p className="rounded-md bg-brand-yellow/15 px-4 py-3 text-sm font-semibold text-[#8a6400]">
          Checkout cancelled — no payment was taken.
        </p>
      )}
      {searchParams.activated === "dev" && (
        <p className="rounded-md bg-brand-green/10 px-4 py-3 text-sm font-semibold text-brand-forest">
          Dev mode: subscription activated via DEV_FAKE_CHECKOUT.
        </p>
      )}
      {searchParams.error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {searchParams.error}
        </p>
      )}

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your name as shown across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email ?? ""} disabled />
            </div>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription / billing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription</CardTitle>
            <Badge variant={status.tone}>{status.label}</Badge>
          </div>
          <CardDescription>
            {entitled
              ? "You have full access to every lesson. Billing is handled securely by Stripe."
              : "Subscribe to unlock every lesson in the library. Free lessons stay free."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {entitled ? (
            <div className="flex items-center gap-3 rounded-md bg-brand-green/10 p-4">
              <BadgeCheck className="h-6 w-6 shrink-0 text-brand-forest" />
              <p className="text-sm">
                Use the billing portal to update your card, view invoices, or cancel. Your status
                here always reflects Stripe — the webhook keeps it in sync.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 text-sm text-brand-carbon/85">
              <li>• Every subject, every lesson, new releases included</li>
              <li>• Progress tracking across devices</li>
              <li>• Cancel anytime — access until period end</li>
            </ul>
          )}
          {/* POSTs to server routes: auth + Stripe calls happen server-side. */}
          {entitled ? (
            <form action="/api/stripe/portal" method="POST">
              <Button type="submit" variant="outline" size="lg">
                <CreditCard className="h-4 w-4" />
                Manage Billing
              </Button>
            </form>
          ) : (
            <form action="/api/stripe/checkout" method="POST">
              <Button type="submit" variant="cta" size="lg">
                <CreditCard className="h-4 w-4" />
                Subscribe
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

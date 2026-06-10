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
  active: { label: "Premium — Active", tone: "green" },
  free: { label: "Free Plan", tone: "outline" },
  past_due: { label: "Payment Past Due", tone: "yellow" },
  canceled: { label: "Canceled", tone: "outline" },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { saved?: string; activated?: string; upgrade?: string; error?: string };
}) {
  const { user } = await requireUser();
  const profile = await getProfile();
  const subscribed = hasActiveSubscription(profile);
  const status = STATUS_LABELS[profile?.subscription_status ?? "free"] ?? STATUS_LABELS.free;

  return (
    <div className="container max-w-2xl space-y-8 py-10">
      <h1 className="display text-3xl text-brand-carbon">Account</h1>

      {searchParams.saved && (
        <p className="rounded-md bg-brand-green/10 px-4 py-3 text-sm font-semibold text-brand-forest">
          Profile saved.
        </p>
      )}
      {searchParams.activated && (
        <p className="rounded-md bg-brand-green/10 px-4 py-3 text-sm font-semibold text-brand-forest">
          Subscription activated — the full library is now unlocked. May it be of benefit!
        </p>
      )}
      {searchParams.upgrade && (
        <p className="rounded-md bg-brand-yellow/15 px-4 py-3 text-sm font-semibold text-[#8a6400]">
          That course requires an active subscription — subscribe below to unlock it.
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
              <p className="text-xs text-muted-foreground">
                Email changes are handled through a verification flow — contact support.
              </p>
            </div>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription</CardTitle>
            <Badge variant={status.tone}>{status.label}</Badge>
          </div>
          <CardDescription>
            {subscribed
              ? "You have full access to every course and lesson in the library."
              : "Upgrade to unlock the full course library — £12/month, cancel anytime."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscribed ? (
            <div className="flex items-center gap-3 rounded-md bg-brand-green/10 p-4">
              <BadgeCheck className="h-6 w-6 shrink-0 text-brand-forest" />
              <p className="text-sm">
                Billing is managed by our payment provider. Use the billing portal to update your
                card, view invoices or cancel.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 text-sm text-brand-carbon/85">
              <li>• Every course, every lesson, new releases monthly</li>
              <li>• Progress tracking and continue-watching</li>
              <li>• Cancel anytime — keep access until period end</li>
            </ul>
          )}
          {/* POST to the server route: auth + status change happen server-side.
              With DEV_FAKE_CHECKOUT=true this activates instantly (stub);
              in production it redirects to the payment provider. */}
          <form action="/api/billing/checkout" method="POST">
            <Button type="submit" variant={subscribed ? "outline" : "cta"} size="lg">
              <CreditCard className="h-4 w-4" />
              {subscribed ? "Manage Billing" : "Subscribe — £12/month"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

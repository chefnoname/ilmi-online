import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, SignInEvent, SubscriptionEvent } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Analytics" };

const PERIOD_DAYS = 30;

/**
 * /admin/analytics — read-only, computed from OUR OWN data.
 *
 * NOTE (v2): churn here is an own-data approximation derived from
 * subscription_events. A future upgrade should source churn/MRR directly
 * from Stripe (invoices + subscription lifecycle) for billing-grade numbers.
 */
export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const periodStart = new Date(Date.now() - PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: profilesData }, { data: subEventsData }, { data: signInsData }] =
    await Promise.all([
      admin.from("profiles").select("subscription_status, role"),
      admin
        .from("subscription_events")
        .select("*")
        .gte("created_at", periodStart)
        .order("created_at"),
      admin.from("sign_in_events").select("*").gte("created_at", periodStart),
    ]);

  const profiles = (profilesData ?? []) as Pick<Profile, "subscription_status" | "role">[];
  const subEvents = (subEventsData ?? []) as SubscriptionEvent[];
  const signIns = (signInsData ?? []) as SignInEvent[];

  // ── Headline counts ──
  // Paying = 'active' ONLY: comped (admin-granted) and trialing are excluded
  // so revenue analytics stay honest.
  const paying = profiles.filter((p) => p.subscription_status === "active").length;
  const comped = profiles.filter((p) => p.subscription_status === "comped").length;
  const trialing = profiles.filter((p) => p.subscription_status === "trialing").length;
  const total = profiles.length;

  // ── Approximate churn (own-data) ──
  // churned = distinct users who moved active → inactive in the period;
  // active-at-start ≈ currently active − activations in period + churned.
  const churnedUsers = new Set(
    subEvents
      .filter((e) => e.old_status === "active" && e.new_status === "inactive")
      .map((e) => e.user_id),
  );
  const activatedInPeriod = new Set(
    subEvents.filter((e) => e.new_status === "active").map((e) => e.user_id),
  );
  const activeAtStart = Math.max(paying - activatedInPeriod.size + churnedUsers.size, 0);
  const churnRate = activeAtStart > 0 ? churnedUsers.size / activeAtStart : 0;

  // ── Sign-ins per day ──
  const byDay = new Map<string, number>();
  for (let d = PERIOD_DAYS - 1; d >= 0; d--) {
    const day = new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    byDay.set(day, 0);
  }
  for (const e of signIns) {
    const day = e.created_at.slice(0, 10);
    if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const days = Array.from(byDay.entries());
  const maxSignIns = Math.max(1, ...days.map(([, n]) => n));

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="display text-2xl text-brand-carbon">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Last {PERIOD_DAYS} days · computed from our own data (Stripe-sourced churn is a v2
          upgrade).
        </p>
      </div>

      {/* Headline counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Paying students" value={paying} note="status = active (excludes comped & trialing)" />
        <StatCard label="Comped students" value={comped} note="admin-granted free access" />
        <StatCard label="Trialing" value={trialing} note="Stripe trials" />
        <StatCard label="Total accounts" value={total} note="all roles & statuses" />
      </div>

      {/* Churn */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="display-sub text-base text-brand-carbon">
          Churn — approximate (own-data)
        </h2>
        <p className="mt-3 text-4xl font-bold text-brand-carbon">
          {(churnRate * 100).toFixed(1)}%
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {churnedUsers.size} student{churnedUsers.size === 1 ? "" : "s"} moved active →
          inactive in the period, against ≈{activeAtStart} active at the start of the period.
          Derived from subscription_events; events only exist from the moment this logging
          shipped, so early numbers will under-report.
        </p>
      </div>

      {/* Sign-ins per day */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="display-sub text-base text-brand-carbon">Sign-ins per day</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {signIns.length} sign-ins in the last {PERIOD_DAYS} days
        </p>
        <div className="flex h-40 items-end gap-[2px]">
          {days.map(([day, n]) => (
            <div key={day} className="group relative flex-1">
              <div
                className="w-full rounded-t-sm bg-brand-green transition-colors group-hover:bg-brand-forest"
                style={{ height: `${Math.max((n / maxSignIns) * 152, n > 0 ? 6 : 2)}px` }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-brand-carbon px-1.5 py-0.5 text-[10px] font-semibold text-white group-hover:block">
                {day.slice(5)}: {n}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{days[0]?.[0]}</span>
          <span>{days[days.length - 1]?.[0]}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-brand-carbon">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

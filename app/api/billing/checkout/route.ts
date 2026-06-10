import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/billing/checkout
 *
 * Production: creates a provider checkout session and redirects.
 * Dev (DEV_FAKE_CHECKOUT=true): flips the caller's subscription_status to
 * 'active' via the service role — the ONLY code path besides webhooks that
 * may touch billing columns. The user is authenticated server-side first;
 * the status is only ever changed for auth.uid()'s own row.
 */
export async function POST(request: Request) {
  // 1. AuthN on the server — never trust the client.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Dev-only fake activation.
  if (process.env.DEV_FAKE_CHECKOUT === "true" && process.env.NODE_ENV !== "production") {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ subscription_status: "active" })
      .eq("id", user.id); // only the caller's own row
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.redirect(new URL("/account?activated=1", request.url), 303);
  }

  // 3. Real provider goes here (see lib/payments/index.ts).
  return NextResponse.json(
    { error: "Payment provider not configured. See lib/payments/index.ts." },
    { status: 501 },
  );
}

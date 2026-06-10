/**
 * Creates two test users for verifying auth + RLS isolation (SECURITY.md):
 *   student-free@test.ilmi.online  (subscription_status = 'free')
 *   student-paid@test.ilmi.online  (subscription_status = 'active')
 * Password for both: IlmiTest!2026
 *
 * SERVER-SIDE ONLY — uses the service role key. Never ship this to a client.
 * Run: npm run seed:users
 */
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// Service role client: bypasses RLS. Auth session persistence disabled.
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: "student-free@test.ilmi.online", name: "Amina Free", status: "free" },
  { email: "student-paid@test.ilmi.online", name: "Bilal Paid", status: "active" },
];

for (const u of USERS) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: "IlmiTest!2026",
    email_confirm: true,
    user_metadata: { full_name: u.name },
  });
  if (error) {
    console.error(`✗ ${u.email}: ${error.message}`);
    continue;
  }
  // The on_auth_user_created trigger made the profile; set billing status.
  const { error: pErr } = await admin
    .from("profiles")
    .update({ subscription_status: u.status })
    .eq("id", data.user.id);
  if (pErr) console.error(`✗ profile ${u.email}: ${pErr.message}`);
  else console.log(`✓ ${u.email} (${u.status})`);
}

console.log("\nDone. Use these accounts for the RLS test matrix in SECURITY.md.");

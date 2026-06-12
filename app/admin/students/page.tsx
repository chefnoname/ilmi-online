import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StudentsTable } from "./students-table";
import type { AdminStudentRow, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Students" };

/**
 * /admin/students — every account, from auth (email, sign-up, last sign-in)
 * joined with profiles (name, status, role). Service-role read happens ONLY
 * here on the server, after requireAdmin().
 */
export default async function AdminStudentsPage() {
  await requireAdmin();

  const admin = createAdminClient();
  const [{ data: usersData, error: usersError }, { data: profilesData }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from("profiles").select("*"),
  ]);
  const profiles = new Map(((profilesData ?? []) as Profile[]).map((p) => [p.id, p]));

  const rows: AdminStudentRow[] = (usersData?.users ?? [])
    .map((u) => {
      const p = profiles.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "—",
        full_name: p?.full_name ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        subscription_status: p?.subscription_status ?? "inactive",
        role: p?.role ?? "student",
      };
    })
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="display text-2xl text-brand-carbon">Students</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} accounts. Passwords are hashed — they can never be viewed or set;
          use the reset / magic-link emails instead.
        </p>
        {usersError && (
          <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            Could not list auth users: {usersError.message}
          </p>
        )}
      </div>
      <StudentsTable rows={rows} />
    </div>
  );
}

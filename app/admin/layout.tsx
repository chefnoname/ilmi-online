import Link from "next/link";
import { BarChart3, UploadCloud, Users } from "lucide-react";
import { Wordmark } from "@/components/site/wordmark";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Admin console shell. requireAdmin() runs SERVER-SIDE for every admin page
 * (middleware already redirected non-admins; this is the authoritative
 * check — no admin data or UI is rendered for non-admins).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-muted/60">
      <header className="sticky top-0 z-50 bg-brand-carbon">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Wordmark href="/admin/students" />
            <span className="rounded-pill bg-brand-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-carbon">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <Link href="/admin/students" className="flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
              <Users className="h-4 w-4" /> <span className="hidden sm:inline">Students</span>
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
              <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Analytics</span>
            </Link>
            <Link href="/admin/upload" className="flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
              <UploadCloud className="h-4 w-4" /> <span className="hidden sm:inline">Upload</span>
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-white/60 hover:text-white">
              ← Student app
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

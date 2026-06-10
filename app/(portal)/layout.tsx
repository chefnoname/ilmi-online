import Link from "next/link";
import { LayoutDashboard, Library, Settings } from "lucide-react";
import { Wordmark } from "@/components/site/wordmark";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/actions";
import { requireUser } from "@/lib/auth";

/**
 * Student portal shell. requireUser() runs on the SERVER for every portal
 * page — middleware already redirected anonymous visitors, this is the
 * second, authoritative check.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-muted/60">
      <header className="sticky top-0 z-50 bg-brand-carbon">
        <nav className="container flex h-16 items-center justify-between">
          <Wordmark href="/dashboard" />
          <div className="flex items-center gap-2 sm:gap-5">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
              <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link href="/courses" className="flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
              <Library className="h-4 w-4" /> <span className="hidden sm:inline">Library</span>
            </Link>
            <Link href="/account" className="flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
              <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Account</span>
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="ghostOnDark" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

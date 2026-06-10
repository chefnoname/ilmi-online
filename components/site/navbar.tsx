import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/site/wordmark";
import { createClient } from "@/lib/supabase/server";

const LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

/** Carbon top nav: wordmark left, links right, yellow pill CTA. */
export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 bg-brand-carbon">
      <nav className="container flex h-16 items-center justify-between">
        <Wordmark />
        <div className="flex items-center gap-1 sm:gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={user ? "/dashboard" : "/login"}
              className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              Student Portal
            </Link>
          </div>
          <Button asChild variant="cta" size="sm" className="ml-3">
            <Link href={user ? "/dashboard" : "/signup"}>{user ? "My Dashboard" : "Get Started"}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

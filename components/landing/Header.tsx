"use client";

import Link from "next/link";
import { Button } from "@/components/landing/ui/button";
const logo = "/landing/ilmi-logo-color.png";

const Header = () => {
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#instructor", label: "Instructor" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-auto max-w-4xl">
      <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-full px-3 sm:px-5 shadow-lg shadow-black/5">
        <div className="flex items-center justify-center h-10 sm:h-11 gap-2 sm:gap-4">
          <a href="#" className="flex-shrink-0 flex items-center">
            <img src={logo} alt="ilmi" className="h-6 sm:h-8 md:h-9 w-auto" />
          </a>

          <nav className="flex items-center gap-2 sm:gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              Login
            </Link>
            <Button size="sm" className="gradient-brand text-primary-foreground font-semibold rounded-full text-xs sm:text-sm px-3 sm:px-4" asChild>
              <Link href="/signup">
                Start Learning
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

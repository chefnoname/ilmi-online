import Link from "next/link";
import { Wordmark } from "@/components/site/wordmark";
import { KuficPattern } from "@/components/site/kufic-pattern";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-carbon text-white">
      <KuficPattern className="text-white" opacity={0.04} />
      <div className="container relative grid gap-10 py-14 sm:grid-cols-3">
        <div className="space-y-4">
          <Wordmark />
          <p className="max-w-xs text-sm font-normal text-white/60">
            Structured Islamic education, taught by qualified scholars, available wherever you are.
          </p>
          <p className="arabic text-lg text-brand-yellow/90">اُطْلُبِ الْعِلْمَ مِنَ الْمَهْدِ إِلَى اللَّحْدِ</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="display-sub text-xs text-white/50">Learn</p>
          <ul className="space-y-2 text-white/80">
            <li><Link className="hover:text-white" href="/courses">All Courses</Link></li>
            <li><Link className="hover:text-white" href="/#pricing">Pricing</Link></li>
            <li><Link className="hover:text-white" href="/signup">Become a Student</Link></li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <p className="display-sub text-xs text-white/50">Ilmi Online</p>
          <ul className="space-y-2 text-white/80">
            <li><Link className="hover:text-white" href="/about">About</Link></li>
            <li><Link className="hover:text-white" href="/faq">FAQ</Link></li>
            <li><Link className="hover:text-white" href="/login">Student Portal</Link></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container flex h-14 items-center justify-between text-xs text-white/50">
          <span>© {new Date().getFullYear()} Ilmi Online. All rights reserved.</span>
          <span className="arabic">بسم الله الرحمن الرحيم</span>
        </div>
      </div>
    </footer>
  );
}

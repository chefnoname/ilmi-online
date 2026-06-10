import Link from "next/link";
import { KuficPattern } from "@/components/site/kufic-pattern";

/** Auth screens: warm brand gradient backdrop, faint Kufic texture, white card. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-brand-warm px-4 py-12">
      <KuficPattern className="text-white" opacity={0.08} />
      <Link href="/" className="display relative mb-8 text-2xl text-white">
        ILMI <span className="text-brand-carbon">ONLINE</span>
      </Link>
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">{children}</div>
      <p className="arabic relative mt-8 text-lg text-white/90">رَبِّ زِدْنِي عِلْمًا</p>
    </main>
  );
}

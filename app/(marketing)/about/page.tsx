import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KuficPattern } from "@/components/site/kufic-pattern";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-warm">
        <KuficPattern className="text-white" opacity={0.08} />
        <div className="container relative py-16">
          <h1 className="display max-w-2xl text-4xl text-white">
            Knowledge is an obligation, not a luxury
          </h1>
          <p className="arabic mt-4 text-2xl text-white/95">طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ</p>
          <p className="mt-2 text-sm text-white/80">
            “Seeking knowledge is an obligation upon every Muslim.” — Sunan Ibn Mājah
          </p>
        </div>
      </section>

      <section className="container max-w-3xl space-y-8 py-16">
        <div className="prose-body space-y-5 leading-relaxed text-brand-carbon/90">
          <h2 className="display-sub text-xl text-brand-carbon">Why Ilmi exists</h2>
          <p>
            Most of us learn our religion from fragments — a clip here, a lecture there, threads of
            advice with no thread connecting them. Ilmi Online was built on a simple conviction:
            sacred knowledge deserves the same structure, quality and care as any serious education.
          </p>
          <p>
            Every course on the platform follows a curriculum designed by its teacher, moving from
            foundations to depth in deliberate steps. Our instructors hold traditional credentials
            and teach with classical methodology, while the platform itself — progress tracking,
            on-demand video, learning across devices — meets you where modern life actually happens.
          </p>
          <h2 className="display-sub pt-2 text-xl text-brand-carbon">What we believe</h2>
          <p>
            Knowledge before action; structure before speed; teachers before algorithms. We keep a
            free tier open to everyone because the basics of the deen should never sit behind a
            paywall — and we charge a fair subscription for advanced study so we can pay scholars
            properly for their time.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="cta">
            <Link href="/signup">Start Learning</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/courses">Browse the Library</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

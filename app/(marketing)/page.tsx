import Link from "next/link";
import { BookOpen, Check, Compass, Quote, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CourseCard } from "@/components/site/course-card";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { createClient } from "@/lib/supabase/server";
import { FAQS, TESTIMONIALS, TIERS } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const supabase = createClient();
  // RLS: anon can read published course metadata only.
  const { data } = await supabase
    .from("courses")
    .select("*")
    .order("position")
    .limit(3)
    .neq("tier", "free");
  const featured = (data ?? []) as Course[];

  return (
    <>
      {/* ── Hero: warm green→yellow gradient, Kufic texture, yellow CTA ── */}
      <section className="relative overflow-hidden bg-brand-warm">
        <KuficPattern className="text-white" opacity={0.09} />
        <div className="container relative flex flex-col items-start gap-6 py-24 sm:py-32">
          <Badge variant="onDark" className="backdrop-blur">
            <span className="arabic mr-2 normal-case tracking-normal">اطلب العلم</span> Seek Knowledge
          </Badge>
          <h1 className="display max-w-3xl text-4xl text-white drop-shadow-sm sm:text-6xl">
            Get serious about the Deen
          </h1>
          <p className="max-w-xl text-lg text-white/95">
            Structured courses in fiqh, seerah and Arabic — taught by qualified scholars, one
            lesson at a time, wherever you are.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="cta" size="lg">
              <Link href="/signup">Get Started — Free</Link>
            </Button>
            <Button asChild variant="ghostOnDark" size="lg">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Value proposition ── */}
      <section className="container grid gap-8 py-20 sm:grid-cols-3">
        {[
          {
            icon: BookOpen,
            title: "Structured, Not Scattered",
            body: "No more random lectures. Curricula that build from foundations to depth, lesson by lesson.",
          },
          {
            icon: Users,
            title: "Qualified Scholars",
            body: "Learn from teachers with traditional training and ijazah — credentials listed on every course.",
          },
          {
            icon: Compass,
            title: "Learn at Your Pace",
            body: "On-demand video, progress tracking and continue-watching across all your devices.",
          },
        ].map((v) => (
          <div key={v.title} className="space-y-3 rounded-lg border bg-white p-7 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-brand-green/15">
              <v.icon className="h-6 w-6 text-brand-forest" />
            </div>
            <h3 className="display-sub text-base text-brand-carbon">{v.title}</h3>
            <p className="prose-body text-sm text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </section>

      {/* ── Featured courses on Forest Green ── */}
      <section className="relative overflow-hidden bg-brand-forest py-20">
        <KuficPattern className="text-white" opacity={0.05} />
        <div className="container relative space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="display text-3xl text-white">Featured courses</h2>
              <p className="mt-2 text-white/80">Taught by scholars. Built for students.</p>
            </div>
            <Button asChild variant="ghostOnDark">
              <Link href="/courses">View all courses</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="container space-y-10 py-20">
        <h2 className="display text-center text-3xl text-brand-carbon">Students, not spectators</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="space-y-4 rounded-lg border bg-white p-7 shadow-sm">
              <Quote className="h-6 w-6 text-brand-yellow" />
              <blockquote className="prose-body text-sm text-brand-carbon/90">{t.quote}</blockquote>
              <figcaption className="text-sm">
                <span className="font-bold">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Pricing on cool gradient ── */}
      <section id="pricing" className="relative overflow-hidden bg-brand-cool py-20">
        <KuficPattern className="text-white" opacity={0.07} />
        <div className="container relative space-y-10">
          <div className="text-center">
            <h2 className="display text-3xl text-white">Simple pricing</h2>
            <p className="mt-2 text-white/90">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "flex flex-col gap-5 rounded-lg bg-white p-8 shadow-lg",
                  tier.highlight && "ring-4 ring-brand-yellow",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="display-sub text-lg text-brand-carbon">{tier.name}</h3>
                  {tier.highlight && <Badge variant="yellow">Most Popular</Badge>}
                </div>
                <p>
                  <span className="display text-4xl text-brand-carbon">{tier.price}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{tier.period}</span>
                </p>
                <ul className="flex-1 space-y-3 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={tier.highlight ? "cta" : "outline"} className="w-full">
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="container max-w-3xl space-y-8 py-20">
        <h2 className="display text-center text-3xl text-brand-carbon">Questions, answered</h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}

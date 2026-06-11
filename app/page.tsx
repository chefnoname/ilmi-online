import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import TransformationTimeline from "@/components/landing/TransformationTimeline";
import Features from "@/components/landing/Features";
import Instructor from "@/components/landing/Instructor";
import Testimonials from "@/components/landing/Testimonials";
import ComparisonGrid from "@/components/landing/ComparisonGrid";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import NewFooter from "@/components/landing/NewFooter";

/**
 * Public landing page — ported from the live Lovable build (single source of
 * truth for the marketing site). Static marketing only: it must NOT import
 * the Supabase client. CTAs link to /signup and /login.
 */
export default function LandingPage() {
  return (
    <div className="landing min-h-screen bg-background monogram-overlay">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <TransformationTimeline />
        <Features />
        <Instructor />
        <Testimonials />
        <ComparisonGrid />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <NewFooter />
    </div>
  );
}

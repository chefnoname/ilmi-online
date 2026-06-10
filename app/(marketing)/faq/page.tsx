import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { KuficPattern } from "@/components/site/kufic-pattern";
import { FAQS } from "@/lib/content";

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-cool">
        <KuficPattern className="text-white" opacity={0.08} />
        <div className="container relative py-16">
          <h1 className="display text-4xl text-white">Frequently asked questions</h1>
        </div>
      </section>
      <section className="container max-w-3xl py-16">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-12 rounded-lg bg-muted p-8 text-center">
          <h2 className="display-sub text-lg text-brand-carbon">Still have a question?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a free account and message us from your dashboard — we reply within a day.
          </p>
          <Button asChild variant="cta" className="mt-5">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

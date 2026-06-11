"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/landing/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { question: "I'm a complete beginner. Will I understand the classes?", answer: "Yes.\n\nilmi is built for clarity. We don't assume prior study, and we don't rush ahead. You begin at your level and progress step by step.\n\nMany of our students started with no formal background at all." },
  { question: "What if I fall behind?", answer: "You won't be left behind.\n\nEvery lesson is recorded and organised. You can pause, revisit and catch up at your own pace. Progress is structured, not pressured.\n\nConsistency matters more than perfection." },
  { question: "How much time per week do I realistically need?", answer: "Most students dedicate 1–2 hours per week.\n\nOne live lesson. Optional Q&A. Review when you can.\n\nilmi is designed for adults with real responsibilities." },
  { question: "What are Ustaadh Yasin's qualifications?", answer: "Ustaadh Yasin holds an MA from King Abdulaziz University, has received multiple ijāzāt, and has studied in Makkah, Madinah and Egypt under recognised scholars.\n\nYou are learning from grounded scholarship, not online opinion." },
  { question: "Can I try before I commit?", answer: "Yes.\n\nJoin with a 14-day money-back guarantee. Attend classes. Explore fully.\n\nIf it's not right for you, request a refund. No friction." },
  { question: "What makes ilmi different from other platforms?", answer: "Most platforms offer scattered lectures.\n\nilmi offers a structured path, weekly live teaching and direct access to a qualified scholar.\n\nIt's guided study, not passive content." },
  { question: "Is this suitable for someone with work or family commitments?", answer: "Yes.\n\nLessons are concise and structured. Recordings allow flexibility. Many students are professionals and parents.\n\nilmi is built for real life, not ideal schedules." },
];

const FAQ = () => {
  return (
    <section id="faq" className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">FAQ</span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Frequently Asked{" "}<span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about ilmi.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <AccordionItem value={`item-${index}`} className="bg-card/75 backdrop-blur-xl border border-border/50 rounded-xl px-6 transition-all duration-300 data-[state=open]:border-primary/30 data-[state=open]:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.15)] hover:border-border/80">
                  <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 whitespace-pre-line">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

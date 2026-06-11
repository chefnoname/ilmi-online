"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="section-padding monogram-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center bg-card border border-border rounded-2xl p-6 sm:p-8 md:p-12" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }}>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Take Your Deen{" "}<span className="gradient-text">Seriously</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-2xl mx-auto">You can continue searching, watching and wondering.</p>
            <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4 max-w-2xl mx-auto">Or you can follow a structured path with real guidance.</p>
            <p className="text-sm sm:text-base font-medium text-foreground/80 mb-8 sm:mb-10 max-w-2xl mx-auto">Join over 150 students building a clear and confident understanding of their deen.</p>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="gradient-brand text-primary-foreground font-semibold text-base sm:text-xl px-8 sm:px-12 py-6 sm:py-8 shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto" asChild>
                <a href="#pricing">
                  Start Your Membership
                  <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </Button>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

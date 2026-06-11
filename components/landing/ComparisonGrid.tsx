"use client";

import { CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
const logoColor = "/landing/ilmi-logo-color.png";

const comparisons = [
  { feature: "Teacher", others: "Unverified teachers or background", ilmi: "MA from King Abdulaziz University, multiple ijazat", ilmiBetter: true },
  { feature: "Learning Style", others: "Random topics with no clear progression", ilmi: "Structured, progressive learning path tailored to your level", ilmiBetter: true },
  { feature: "Interaction", others: "Pre-recorded content with limited access to guidance", ilmi: "Self-paced study supported by weekly live teaching and Q&A", ilmiBetter: true },
  { feature: "Community", others: "Large, impersonal forums", ilmi: "Small cohorts with mentors and community leads to study, discuss, and stay consistent", ilmiBetter: true },
  { feature: "Unique Feature", others: "Nothing", ilmi: "Weekly live Q&A with a qualified scholar + 1 year free subscription of Daleel AI", ilmiBetter: true },
];

const ComparisonGrid = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="font-heading text-2xl font-bold text-foreground text-center mb-8">
            What Makes Us Different
          </h3>
          
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-sm font-semibold text-foreground"></div>
              <div className="text-center text-sm font-semibold text-muted-foreground py-3">Other Platforms</div>
              <div className="flex justify-center items-center py-3">
                <img src={logoColor} alt="ilmi" className="h-6 w-auto" />
              </div>
            </div>

            <div className="space-y-3">
              {comparisons.map((row, index) => (
                <motion.div
                  key={row.feature}
                  className="grid grid-cols-3 gap-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center py-4 px-4 bg-muted/30 rounded-l-xl">
                    <span className="text-sm font-medium text-foreground">{row.feature}</span>
                  </div>
                  <div className="flex items-center py-4 px-4 bg-muted/30 border-x border-border/50">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-destructive/70 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{row.others}</span>
                    </div>
                  </div>
                  <div className="relative flex items-center py-4 px-4 bg-primary/5 rounded-r-xl border-2 border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-300 overflow-hidden">
                    {/* Base gloss */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2 pointer-events-none" />
                    {/* Enhanced gloss on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground font-medium">{row.ilmi}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {comparisons.map((row, index) => (
              <motion.div
                key={row.feature}
                className="bg-card border border-border rounded-xl p-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <h4 className="text-sm font-bold text-foreground mb-3">{row.feature}</h4>
                <div className="flex items-start gap-2 mb-2 bg-destructive/5 rounded-lg p-2.5">
                  <X className="w-4 h-4 text-destructive/70 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground">{row.others}</span>
                </div>
                <div className="relative flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-2.5 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2 pointer-events-none" />
                  <CheckCircle className="relative w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="relative text-xs text-foreground font-medium">{row.ilmi}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonGrid;

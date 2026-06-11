"use client";

import { Zap, BookOpen, Lightbulb, MessageCircle, Brain, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const timeline = [
  { time: "TODAY", action: "Join & get instant access", icon: Zap },
  { time: "WEEK 1", action: "Attend first live class", icon: BookOpen },
  { time: "MONTH 1", action: "Your confidence becomes noticeable", icon: Lightbulb },
  { time: "MONTH 3", action: "Answering family's questions", icon: MessageCircle },
  { time: "MONTH 6", action: "Your foundation feels steady", icon: Brain },
  { time: "YEAR 1", action: "Clarity becomes normal", icon: Trophy },
];

const TransformationTimeline = () => {
  return (
    <section className="section-padding monogram-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Your Transformation</span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-12">What Progress Actually Looks Like</h3>
            
            <div className="relative">
              <div className="hidden md:block absolute top-8 left-[8%] right-[8%] h-px">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                {timeline.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.time}
                      className="relative group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                    >
                      <div className="flex flex-col items-center">
                        <motion.div
                          className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center mb-3 relative z-10 cursor-pointer transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
                          whileHover={{ scale: 1.1, y: -4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                        </motion.div>
                        <motion.div
                          className="px-3 py-1 bg-background/60 backdrop-blur-sm border border-border/50 text-foreground text-xs font-bold rounded-full mb-2 transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary"
                        >
                          {step.time}
                        </motion.div>
                        <span className="text-xs text-muted-foreground text-center leading-tight max-w-[100px] transition-colors duration-300 group-hover:text-foreground">{step.action}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TransformationTimeline;

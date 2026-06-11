"use client";

import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { motion } from "framer-motion";
import { AspectRatio } from "@/components/landing/ui/aspect-ratio";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-28 sm:pt-24 overflow-hidden">
      <div className="absolute inset-0 gradient-brand opacity-[0.03]" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          <motion.h1 
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Structured Path to{" "}
            <span className="gradient-text">Islamic Knowledge</span>
          </motion.h1>

          <motion.p 
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your deen was never meant to be complicated. Authentic Islam made simple, clear, and life-changing.
          </motion.p>

          <motion.div
            className="max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl p-[2px] gradient-brand">
              <div className="relative rounded-2xl overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 to-foreground flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <button className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full gradient-brand flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 group">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" fill="currentColor" />
                    <div className="absolute inset-0 rounded-full gradient-brand opacity-50 animate-ping" />
                  </button>
                </div>
              </AspectRatio>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="gradient-brand text-primary-foreground font-semibold text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all" asChild>
                <a href="#pricing">
                  Begin Your Journey Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-2xl md:text-4xl text-foreground mb-6 leading-[2.5] pb-2" dir="rtl" style={{ fontFamily: "'Amiri Quran', serif" }}>
              وَمَا جَعَلَ عَلَيۡكُمۡ فِي ٱلدِّينِ مِنۡ حَرَجٍ
            </p>
            <p className="text-sm text-muted-foreground italic">
              "He has not placed upon you in the religion any difficulty" — Surah Al-Hajj, 22:78
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

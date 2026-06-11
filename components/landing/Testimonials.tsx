"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ── Animated Counter ── */
const CountUp = ({ target, suffix = "%" }: { target: number; suffix?: string }) => {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(0, target, {
            duration: 1.6,
            ease: "easeOut",
            onUpdate: (v) => {
              setDisplay(target % 1 !== 0 ? v.toFixed(1) : Math.round(v).toString());
            },
          });
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

/* ── Stats Data ── */
const stats = [
  { value: 100, suffix: "%", label: "Would recommend Ilmi to friends and family" },
  { value: 94.7, suffix: "%", label: "Find the teaching easy to follow and understand" },
  { value: 90, suffix: "%+", label: "Say the live sessions are engaging and beneficial" },
];

/* ── Quotes Data ── */
const quotes = [
  { quote: "I only used to pray in Ramadan. Now I pray five times daily with understanding.", name: "Ahmed R.", city: "London" },
  { quote: "Clear, authentic rulings on women's fiqh - no beating around the bush.", name: "Aisha M.", city: "Birmingham" },
  { quote: "The only platform that teaches progressively. Not random topics, actual structured knowledge.", name: "Ibrahim S.", city: "Manchester" },
  { quote: "The weekly Q&A alone is worth it. Real answers to real questions.", name: "Fatima K.", city: "Leeds" },
  { quote: "What took hours of YouTube watching, Ustaadh Yasin explains in ten minutes.", name: "Yusuf A.", city: "Glasgow" },
  { quote: "Busy mum of three. Short lessons and recordings make this actually doable.", name: "Hafsa L.", city: "Cardiff" },
];

/* ── Component ── */
const Testimonials = () => {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Student Feedback
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real Students.{" "}
            <span className="gradient-text">Measurable Impact.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Based on recent feedback from current Ilmi students.
          </p>
        </motion.div>

        {/* ── Quantified Trust ── */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 text-center shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              {/* Gloss overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none rounded-2xl" />
              <p className="relative font-heading text-4xl sm:text-5xl font-bold mb-2 gradient-text">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="relative text-sm text-muted-foreground leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/60 text-center mb-16">
          Data based on recent student survey responses.
        </p>

        {/* ── Curated Quotes Grid ── */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        >
          {quotes.map((q) => (
            <motion.div
              key={q.name}
              className="bg-card/75 backdrop-blur-md border border-border rounded-2xl p-6"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            >
              <p className="text-foreground leading-relaxed mb-5">"{q.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {q.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Anchor Quote ── */}
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="relative overflow-hidden bg-primary backdrop-blur-xl border border-primary/40 rounded-2xl px-8 py-7 text-center text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
            <p className="relative text-base md:text-lg font-semibold mb-3 leading-relaxed">
              "It was the first time that I've felt the sweetness of learning Ilm."
            </p>
            <p className="relative text-sm font-medium opacity-90">— Current Ilmi Student</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

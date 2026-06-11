"use client";

import { Sparkles, TrendingUp, Video } from "lucide-react";
import { motion } from "framer-motion";

const principles = [
  {
    icon: Sparkles,
    title: "Simplicity",
    description: "Authentic Islam, taught in a way that makes sense.\n\nGrounded in the Qur'an and Sunnah, explained clearly so you can understand it, practise it, and feel confident in what you're doing.",
  },
  {
    icon: TrendingUp,
    title: "Progressive Learning",
    description: "Islam wasn't meant to be learned in fragments.\n\nWe start where you are, then build step by step. Each lesson strengthens the one before it, so nothing important is assumed or left unclear.",
  },
  {
    icon: Video,
    title: "Live + Accessible",
    description: "Learning is not meant to be one-sided.\n\nEvery week, you have live classes and the opportunity to ask your questions. Not just content to consume, but guidance to benefit from, within a community that's learning alongside you.",
  },
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Solution = () => {
  return (
    <section id="features" className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            The ilmi Approach
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Where Islamic Knowledge Becomes{" "}
            <span className="gradient-text">Clear</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            This isn't just another collection of courses. It's a structured path that takes you from uncertainty to confidence, taught by someone who understands both the tradition and the times we live in.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {principles.map((principle) => (
            <motion.div key={principle.title} className="relative group" variants={itemVariants}>
              <div className="absolute inset-0 gradient-brand rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl gradient-brand flex items-center justify-center mb-6">
                  <principle.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-4">{principle.title}</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{principle.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Solution;

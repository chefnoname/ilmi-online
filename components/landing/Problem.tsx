"use client";

import { AlertCircle, Clock, HelpCircle, Heart } from "lucide-react";

const problems = [
  {
    icon: HelpCircle,
    title: "The Confusion",
    description: "I'm not always sure what's correct.",
  },
  {
    icon: Clock,
    title: "The Frustration",
    description: "I don't know who or where to turn to for clarity.",
  },
  {
    icon: AlertCircle,
    title: "The Consequence",
    description: "Mistakes in your belief and worship.",
  },
  {
    icon: Heart,
    title: "The Truth",
    description: "Islam was meant to be learned with guidance.",
  },
];

const Problem = () => {
  return (
    <section className="section-padding bg-muted/50 monogram-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Tired of Feeling{" "}
            <span className="gradient-text">Lost</span> in Your Own Religion?
          </h2>
          <p className="text-lg text-muted-foreground">
            You're not alone. Thousands of Muslims struggle with the same challenges every day.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className="group bg-background rounded-xl p-6 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg relative z-10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-brand flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-1">
                {problem.title}
              </h3>
              <p className="text-sm text-muted-foreground font-normal">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;

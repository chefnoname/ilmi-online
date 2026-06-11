"use client";

import { Check, Star, Shield, Pause, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/landing/ui/button";
import { motion } from "framer-motion";

const plans = [
{ name: "Monthly Access", price: "39.99", period: "month", description: "Full access, cancel anytime", features: ["Weekly live classes", "Weekly Q&A with Ustaadh Yasin", "Full recordings library", "Structured curriculum", "Private student community"], cta: "Start Monthly Membership", popular: false },
{ name: "Annual Plan", price: "300", period: "year", originalPrice: "480", description: "", features: ["Everything in Monthly", "Locked-in price for life", "Priority Q&A submission", "Priority student community access", "1 free guest pass to invite someone for 1 month"], cta: "Secure Annual Membership", popular: true, badge: "MOST POPULAR · BEST VALUE" }];



const guarantees = [
{ icon: Shield, title: "14-Day Money-Back Guarantee", description: "Join risk-free. Not satisfied? Full refund, no questions asked." },
{ icon: Pause, title: "Pause Anytime", description: "Life gets busy. Pause your membership for up to 3 months." },
{ icon: Lock, title: "Rate Protection Promise", description: "Annual members keep their rate even if ilmi pricing increases in the future." }];


const Pricing = () => {
  return (
    <section id="pricing" className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Join ilmi Today</span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="gradient-text">Commitment</span>
          </h2>
          <p className="text-lg text-muted-foreground">The Complete Ilmi Membership</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) =>
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className={`group relative rounded-2xl border ${plan.popular ? "border-primary shadow-xl md:scale-105" : "border-border"} p-5 sm:p-6 md:p-8 bg-card/75 backdrop-blur-xl`}>
            
              {/* Gloss container */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                {/* Gloss base layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent" />
                {/* Enhanced gloss on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Light sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: "opacity 0.3s, transform 0.8s ease-in-out" }} />
              </div>

              {plan.badge &&
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 gradient-brand text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1 whitespace-nowrap z-10">
                  <Star className="w-3 h-3" />{plan.badge}
                </div>
            }
              <div className="relative z-[1] flex items-center justify-between md:block md:text-center mb-4 md:mb-6">
                <div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-1 md:mb-2">{plan.name}</h3>
                </div>
                <div className="text-right md:text-center md:mt-3">
                  <div className="flex items-baseline justify-end md:justify-center gap-1 flex-wrap">
                    {plan.originalPrice && <span className="text-sm text-muted-foreground line-through">£{plan.originalPrice}</span>}
                    <span className="text-2xl sm:text-4xl font-bold gradient-text">£{plan.price}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">/{plan.period}</span>
                    {plan.originalPrice && <span className="text-xs sm:text-sm text-muted-foreground">(£25/month)</span>}
                  </div>
                  {plan.originalPrice && <p className="text-xs font-semibold text-primary mt-0.5">Save £130 compared to paying monthly</p>}
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>
              </div>
              <ul className="relative z-[1] grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3 mb-5 md:mb-8">
                {plan.features.map((feature, i) =>
              <li key={i} className="flex items-start gap-2 md:gap-3">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                  </li>
              )}
              </ul>
              <Button className={`relative z-[1] w-full ${plan.popular ? "gradient-brand text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/90"} font-semibold`} asChild>
                <Link href="/signup">
                  {plan.cta} →
                </Link>
              </Button>
            </motion.div>
          )}
        </div>

        <div className="text-center mt-8 mb-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            🤝 <strong>Want to sponsor a student?</strong> Gift a scholarship and help someone study who cannot afford it.{" "}
            <a href="#" className="text-primary hover:underline">Sponsor now</a>
          </p>
          <p className="text-sm text-muted-foreground">
            🤲 <strong>Can't afford it?</strong> We offer need-based scholarships.{" "}
            <a href="#" className="text-primary hover:underline">Apply anonymously</a>
          </p>
        </div>

        <div className="bg-muted/50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="font-heading text-xl font-bold text-foreground text-center mb-8">Triple Guarantee</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {guarantees.map((guarantee) =>
            <div key={guarantee.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <guarantee.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-2">{guarantee.title}</h4>
                <p className="text-xs text-muted-foreground">{guarantee.description}</p>
              </div>
            )}
        </div>
      </div>
      </div>
    </section>);

};

export default Pricing;
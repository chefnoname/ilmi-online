"use client";

import { Video, MessageCircle, PlayCircle, FileText, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Video, title: "Live Weekly Lessons", description: "Weekly live lessons that follow a clear curriculum, so your learning builds properly, not randomly.", quote: "", author: "" },
  { icon: MessageCircle, title: "Weekly Q&A Sessions", description: "Bring your questions and leave with clarity. Get answers you can trust, then apply them with confidence.", quote: "", author: "" },
  { icon: PlayCircle, title: "Complete Recordings Library", description: "Every session is recorded, so you never fall behind. Rewatch, revise, and learn at your pace.", quote: "", author: "" },
  { icon: FileText, title: "Comprehensive Notes", description: "Clear notes to help you revise key points, remember what matters, and stay consistent between lessons.", quote: "", author: "" },
  { icon: Users, title: "Private Community", description: "Learn alongside people taking the same journey. Stay accountable, progress together, and keep momentum.", quote: "", author: "" },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const Features = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center max-w-3xl mx-auto mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">What You Get</span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Your Complete Islamic{" "}<span className="gradient-text">Education System</span>
          </h2>
          
        </motion.div>

        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
          {features.map((feature, index) => (
            <motion.div key={feature.title} className={`group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg lg:col-span-2 ${index === 3 ? 'lg:col-start-2' : ''}`} variants={itemVariants} whileHover={{ y: -5 }}>
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p className="text-center text-muted-foreground text-lg mt-12 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
          One membership. Live guidance, structured learning, and a growing library to support you.
        </motion.p>
      </div>
    </section>
  );
};

export default Features;

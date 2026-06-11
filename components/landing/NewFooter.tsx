"use client";

import { Instagram, Youtube, MessageCircle } from "lucide-react";
const logo = "/landing/ilmi-logo-color.png";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/ilmi.online/", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/@ilmi.online1", label: "YouTube" },
];

const NewFooter = () => {
  return (
    <footer className="bg-dark text-dark-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center text-center gap-4">
          <img src={logo} alt="ilmi" className="h-10 w-auto" />
          <p className="text-xs text-dark-foreground/70 max-w-sm">
            Learn the Simplicity of Your Deen. Authentic Islamic education made accessible for modern Muslims.
          </p>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-dark-foreground/10 flex items-center justify-center hover:bg-dark-foreground/20 transition-colors" aria-label={social.label}>
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-dark-foreground/10 mt-6 pt-6 flex items-center justify-center text-center">
          <a href="https://whatsapp.com/channel/0029Vb7X3MMD38CXUTOq4G1m" target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-2 text-sm text-dark-foreground/70 hover:text-dark-foreground transition-colors">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span>Get reminders from Ustādh Yasin in our <span className="text-primary font-medium">WhatsApp channel →</span></span>
          </a>
        </div>

        <div className="border-t border-dark-foreground/10 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-dark-foreground/70">
          <p>© 2025 ilmi. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-dark-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-dark-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-dark-foreground transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;

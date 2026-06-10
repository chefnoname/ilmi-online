/** Static marketing content (FAQ, testimonials, tiers). */

export const FAQS = [
  {
    q: "Who teaches the courses?",
    a: "Every course is taught by a qualified scholar or instructor with traditional training and verifiable credentials. Each course page lists the teacher's background.",
  },
  {
    q: "What do I get for free?",
    a: "A free account gives you our complete Introduction to Islam course plus the first preview lesson of every paid course — no credit card required.",
  },
  {
    q: "What does the subscription include?",
    a: "One subscription unlocks the entire library: all courses, all lessons, new releases every month, and progress tracking across devices.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Subscriptions are month-to-month with no lock-in. You keep access until the end of your billing period.",
  },
  {
    q: "Is the content suitable for beginners?",
    a: "Absolutely. Courses are levelled — start with the foundations track and progress at your own pace. Arabic From Zero assumes no prior knowledge at all.",
  },
  {
    q: "Do I need to study at fixed times?",
    a: "No. All lessons are recorded and available on demand. Your dashboard remembers exactly where you left off.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "I finally understand the fiqh of my daily prayer instead of just imitating. The structure is what makes it — every lesson builds on the last.",
    name: "Khadija A.",
    role: "Student since 2025",
  },
  {
    quote:
      "Arabic From Zero took me from not knowing the alphabet to reading short surahs with understanding in four months.",
    name: "Omar S.",
    role: "Arabic track student",
  },
  {
    quote:
      "As a revert, the free intro course was exactly the on-ramp I needed. I subscribed within a week.",
    name: "Daniel M.",
    role: "Student since 2026",
  },
];

export const TIERS = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    cta: "Create Free Account",
    href: "/signup",
    highlight: false,
    features: [
      "Introduction to Islam — full course",
      "Preview lesson of every course",
      "Progress tracking",
      "Community updates",
    ],
  },
  {
    name: "Premium",
    price: "£12",
    period: "per month",
    cta: "Subscribe",
    href: "/signup?plan=premium",
    highlight: true,
    features: [
      "Everything in Free",
      "Full course library — every lesson",
      "New courses every month",
      "Continue-watching across devices",
      "Cancel anytime",
    ],
  },
];

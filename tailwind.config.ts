import type { Config } from "tailwindcss";

/**
 * Ilmi Online brand system as Tailwind theme tokens.
 *
 * Colour balance: 60/30/5/5 — Core Green dominates, Forest supports,
 * Signal Yellow is reserved for CTAs/highlights, Carbon for nav/text.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        brand: {
          green: "#52B955", // Primary / Core Green
          forest: "#388567", // Secondary / Forest Green
          yellow: "#F6BB25", // Accent / Signal Yellow — CTAs only
          carbon: "#333333", // Near-black — nav, body text, footer
          aqua: "#72CBD2", // Accent 3 — gradient tone
          teal: "#34A576", // Accent 4 — gradient tone
        },
        // Landing design-system tokens (ported from Lovable build)
        teal: { DEFAULT: "hsl(var(--teal))", foreground: "hsl(var(--teal-foreground))" },
        dark: { DEFAULT: "hsl(var(--dark))", foreground: "hsl(var(--dark-foreground))" },
        emerald: { DEFAULT: "hsl(var(--emerald))", foreground: "hsl(var(--emerald-foreground))" },
        // shadcn/ui semantic tokens (mapped to brand in globals.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
      },
      fontFamily: {
        // Headings: Nimbus Sans Extended Black (self-hosted), falling back
        // to Archivo Expanded (next/font variable --font-heading)
        heading: ['"Nimbus Sans Extended"', "var(--font-heading)", "Impact", "Arial Black", "system-ui", "sans-serif"],
        // Body/UI: Inter
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        // Arabic: clean Kufic-leaning Arabic face, with system fallbacks
        arabic: ["var(--font-arabic)", "Geeza Pro", "Traditional Arabic", "serif"],
      },
      backgroundImage: {
        // Signature warm gradient: green → yellow (motion + growth)
        "brand-warm": "linear-gradient(115deg, #52B955 0%, #8FC447 55%, #F6BB25 100%)",
        // Cool variant for alternate sections: teal-green → aqua
        "brand-cool": "linear-gradient(115deg, #34A576 0%, #4FB9A6 55%, #72CBD2 100%)",
        // Deep variant for footers/dark panels
        "brand-deep": "linear-gradient(150deg, #388567 0%, #2C6B53 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        // Pill buttons per brand spec
        pill: "9999px",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

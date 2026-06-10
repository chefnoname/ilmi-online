import { Archivo, Inter, Noto_Kufi_Arabic } from "next/font/google";

/**
 * Headings — Archivo variable font with the width (wdth) axis enabled so we
 * can render it Expanded (closest free match to Nimbus Sans Extended Black).
 * Weight 800/900 only; `.display` in globals.css applies font-stretch: 125%.
 */
export const fontHeading = Archivo({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-heading",
  display: "swap",
});

/** Body / UI — Inter, Medium by default (set on <body>). */
export const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Arabic — clean Kufic-leaning face for du'a / اطلب العلم phrases. */
export const fontArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic",
  display: "swap",
});

import type { Metadata } from "next";
import { fontArabic, fontBody, fontHeading } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ilmi online", template: "%s · Ilmi Online" },
  description:
    "Structured Islamic education taught by qualified scholars. Fiqh, seerah, Arabic and more — one subscription, learn anywhere.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontHeading.variable} ${fontBody.variable} ${fontArabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}

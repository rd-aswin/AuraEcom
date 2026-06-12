import type { Metadata } from "next";
import { DM_Serif_Display, Outfit } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura - Premium Organic E-Store",
  description: "Experience natural wellness with Aura's curated collection of organic skincare, teas, and lifestyle essentials. Handcrafted for premium quality.",
  keywords: "organic, skincare, wellness, natural, teas, eco-friendly, premium store",
  authors: [{ name: "Aura Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

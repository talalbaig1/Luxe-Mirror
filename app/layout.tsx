import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/components/shared/AppProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luxe Mirror — AI Personal Stylist",
  description:
    "Your AI-powered personal stylist and skincare advisor. Get personalized facial analysis, wardrobe recommendations, and grooming tips.",
  keywords: ["personal stylist", "skincare", "facial analysis", "AI beauty", "wardrobe"],
  openGraph: {
    title: "Luxe Mirror — AI Personal Stylist",
    description: "Your AI-powered personal stylist and skincare advisor.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

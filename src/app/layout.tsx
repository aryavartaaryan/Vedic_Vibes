import type { Metadata } from "next";
import { Noto_Serif_Devanagari, Mukta, Playfair_Display, Rozha_One, Hind } from "next/font/google";
import Footer from "@/components/Footer";
// import SevakChatbot from "@/components/SevakChatbot";
import "./globals.css";

const notoSerif = Noto_Serif_Devanagari({
  weight: ["400", "700"],
  subsets: ["devanagari", "latin"],
  variable: "--font-header",
  display: "swap",
});

const mukta = Mukta({
  weight: ["300", "400", "600"],
  subsets: ["devanagari", "latin"],
  variable: "--font-body",
  display: "swap",
});

const playfair = Playfair_Display({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const rozhaOne = Rozha_One({
  weight: ["400"],
  subsets: ["devanagari", "latin"],
  variable: "--font-rozha",
  display: "swap",
});

const hind = Hind({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["devanagari", "latin"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pranav Samadhaan | Ancient Wisdom for Modern Living",
  description: "Experience the convergence of Ancient Vedic Science and Advanced AI. Personalized guidance for healing, rejuvenation, and spiritual awakening.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSerif.variable} ${mukta.variable} ${playfair.variable} ${rozhaOne.variable} ${hind.variable}`}>
        {children}
        <Footer />
        {/* <SevakChatbot /> */}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Serif_Devanagari, Mukta, Playfair_Display } from "next/font/google";
import Footer from "@/components/Footer";
import SevakChatbot from "@/components/SevakChatbot";
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

export const metadata: Metadata = {
  title: "VedicVibes | Authentic Indian Vegetarian Recipes",
  description: "Discover authentic Indian vegetarian recipes with a modern twist and Vedic wisdom. Personalized recommendations from every region of India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSerif.variable} ${mukta.variable} ${playfair.variable}`}>
        {children}
        <Footer />
        {/* <SevakChatbot /> */}
      </body>
    </html>
  );
}

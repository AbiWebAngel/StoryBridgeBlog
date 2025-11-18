import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./globals.css";
import {Cinzel, Inter, Jacques_Francois} from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cinzel",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inter",
});

const jacquesFrancois = Jacques_Francois({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jacques-francois",
});

export const metadata: Metadata = {
  title: "Storybridge Blog",
  description: "A blog about storytelling and writing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   <html lang="en" className={`${cinzel.variable} ${inter.variable} ${jacquesFrancois.variable}`}>
      <body>
        <header>
          <Navbar />
        </header>
        <main className="flex-grow mt-6 mb-6 pt-2">{children}</main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StickerFlix | Premium Vinyl Stickers for Every Surface",
  description: "The ultimate destination for premium stickers. Express yourself with our unique collection of high-quality vinyl stickers for laptops, gear, and more.",
  keywords: ["stickers", "vinyl stickers", "laptop stickers", "custom stickers", "premium stickers", "StickerFlix"],
  openGraph: {
    title: "StickerFlix | Premium Vinyl Stickers",
    description: "Express yourself with our unique collection of high-quality vinyl stickers.",
    url: "https://stickerflix.com",
    siteName: "StickerFlix",
    images: [
      {
        url: "https://picsum.photos/seed/stickerflix/1200/630",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}

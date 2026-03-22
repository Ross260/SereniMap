import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

/* Police de corps : Inter - lisible et moderne */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/* Police de titres : Poppins - douce et arrondie, rassurante */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SereniMap - Naviguer en toute serenite",
  description:
    "Application de cartographie pour aider les personnes atteintes de phobie sociale a se deplacer sereinement en evitant les zones de forte affluence.",
};

export const viewport: Viewport = {
  themeColor: "#3b7dd8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

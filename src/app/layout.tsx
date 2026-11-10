import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Pixelify_Sans } from "next/font/google";
import VisitTracker from "@/components/VisitTracker";
import "./globals.css";

// next/font downloads these at build time and serves them from your own app.
const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});
const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
});

export const metadata: Metadata = {
  title: "Aditya Daniel — Full-Stack Developer",
  description:
    "Pixel-powered portfolio of Aditya Daniel, Full-Stack Developer (React, Next.js, Node, TypeScript). Play the mini-game and chat with the AI sidekick.",
};

export const viewport: Viewport = {
  themeColor: "#5ab8ff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${pixelify.variable} scanlines antialiased`}>
        {children}
        <VisitTracker />
      </body>
    </html>
  );
}

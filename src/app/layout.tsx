import type { Metadata } from "next";
import { Geist, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ShiftProof — Property Management & Tenant Portal",
  description:
    "ShiftProof simplifies PG and rental property management for owners while giving tenants a seamless experience to find, join, and pay — all from one app.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${notoDevanagari.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}

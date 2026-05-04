import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftProof — Rent collected. Paper handled. Sunday back.",
  description:
    "ShiftProof runs your PG on autopilot. Rent reminders, payment tracking, tenant onboarding, maintenance — one dashboard, built for Indian landlords.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
      style={
        {
          "--font-dm-sans": "\"Segoe UI\", \"Avenir Next\", \"Helvetica Neue\", Arial, sans-serif",
          "--font-dm-serif": "\"Iowan Old Style\", \"Palatino Linotype\", Georgia, serif",
          "--font-devanagari": "\"Nirmala UI\", \"Kohinoor Devanagari\", sans-serif",
        } as CSSProperties
      }
    >
      <body className="min-h-full flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

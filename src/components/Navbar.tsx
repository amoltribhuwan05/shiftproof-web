"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ];


  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-violet-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* Icon mark — inline SVG scales perfectly at any DPI */}
          <svg width="36" height="36" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nb-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#2e1065"/>
              </linearGradient>
              <linearGradient id="nb-door" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c"/>
                <stop offset="100%" stopColor="#c2410c"/>
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="114" fill="url(#nb-bg)"/>
            <rect x="118" y="252" width="276" height="180" rx="8" fill="white"/>
            <polygon points="256,92 96,260 416,260" fill="white"/>
            <path d="M 208,432 L 208,318 A 48,48 0 0,1 304,318 L 304,432 Z" fill="url(#nb-door)"/>
            <rect x="138" y="274" width="60" height="52" rx="10" fill="#ddd6fe" opacity="0.6"/>
            <rect x="314" y="274" width="60" height="52" rx="10" fill="#ddd6fe" opacity="0.6"/>
            <circle cx="374" cy="392" r="36" fill="#f97316"/>
            <path d="M 356,392 L 369,406 L 394,376" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          {/* Wordmark */}
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-violet-950">Shift</span><span className="text-violet-600">Proof</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-violet-700 transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Find a PG — desktop */}
        <Link
          href="/find-pg"
          className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Find a PG
        </Link>

        {/* Desktop CTA */}
        <a
          href="/#download"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            <path d="M8 12l4 4 4-4M12 8v8" />
          </svg>
          Download App
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-violet-50"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-violet-100 bg-white px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-700 hover:text-violet-700"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/find-pg"
            className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-semibold text-violet-700"
            onClick={() => setMobileOpen(false)}
          >
            Find a PG
          </Link>
          <a
            href="/#download"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            Download App
          </a>
        </div>
      )}
    </header>
  );
}

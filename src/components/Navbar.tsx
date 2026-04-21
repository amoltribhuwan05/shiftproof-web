"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/#features",     label: "Features"    },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#pricing",      label: "Pricing"     },
    { href: "/find-pg",       label: "Find a PG"   },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-[color:var(--background)]/90 backdrop-blur-md border-b border-[color:var(--line)]"
          : "bg-[color:var(--background)]/70 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <svg width="30" height="30" viewBox="0 0 512 512" fill="none" aria-hidden>
            <rect width="512" height="512" rx="114" fill="#1A1A18"/>
            <rect x="118" y="252" width="276" height="180" rx="8" fill="#F7F6F2"/>
            <polygon points="256,92 96,260 416,260" fill="#F7F6F2"/>
            <path d="M 208,432 L 208,318 A 48,48 0 0,1 304,318 L 304,432 Z" fill="#2D6A4F"/>
          </svg>
          <span className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
            ShiftProof
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions — one CTA, one sign-in */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup?plan=growth"
            className="inline-flex items-center rounded-full bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Start free
          </Link>
        </div>

        {/* Mobile hamburger — 44px target */}
        <button
          className="lg:hidden h-11 w-11 flex items-center justify-center rounded-xl text-[color:var(--foreground)] hover:bg-[color:var(--line)]/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[color:var(--line)] bg-[color:var(--background)] px-5 py-5 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="py-3 text-base font-medium text-[color:var(--foreground)]"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="h-px bg-[color:var(--line)] my-2" />
          <Link
            href="/login"
            className="py-3 text-base text-[color:var(--muted)]"
            onClick={() => setMobileOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/signup?plan=growth"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-5 py-3.5 text-base font-semibold text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Start free
          </Link>
        </div>
      )}
    </header>
  );
}

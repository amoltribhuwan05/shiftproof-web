import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  const productLinks = [
    { label: "Features",     href: "/#features"     },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing",      href: "/#pricing"      },
    { label: "FAQ",          href: "/#faq"          },
    { label: "Find a PG",    href: "/find-pg"       },
  ];

  const companyLinks = [
    { label: "About",   href: "/about"   },
    { label: "Contact", href: "/contact" },
    { label: "Help",    href: "/help"    },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms",   href: "/terms"   },
    { label: "Refund",  href: "/refund"  },
  ];

  return (
    <footer id="download" className="bg-[#1A1A18] text-white">
      {/* CTA banner */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl leading-tight !text-white">
            Your PGs, managed.
            <br />
            <span className="text-[color:var(--accent-200)]">Starting tonight.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/60">
            14 days free. Free forever for tenants.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup?plan=growth"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-7 py-3.5 text-sm font-semibold text-white transition-colors"
            >
              Try it free for 14 days
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="32" height="32" viewBox="0 0 512 512" fill="none" aria-hidden>
                <rect width="512" height="512" rx="114" fill="#F7F6F2"/>
                <polygon points="256,92 96,260 416,260" fill="#1A1A18"/>
                <rect x="118" y="252" width="276" height="180" rx="8" fill="#1A1A18"/>
                <path d="M 208,432 L 208,318 A 48,48 0 0,1 304,318 L 304,432 Z" fill="#2D6A4F"/>
              </svg>
              <span className="text-lg font-semibold tracking-tight text-white">
                ShiftProof
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              PG and rental management for Indian landlords.
              <br />
              Free forever for tenants.
            </p>
          </div>

          <FooterCol title="Product" links={productLinks} />
          <FooterCol title="Company" links={companyLinks} />
        </div>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-8">
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} ShiftProof. All rights reserved.
          </p>
          <p className="text-xs text-white/60">
            Made in India.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

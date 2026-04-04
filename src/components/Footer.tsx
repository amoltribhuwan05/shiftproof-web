export default function Footer() {
  const productLinks = [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
    { label: "Find a PG", href: "/find-pg" },
  ];

  const companyLinks = [
    { label: "About Us", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ];

  const supportLinks = [
    { label: "Help Center", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Refund Policy", href: "#" },
  ];

  return (
    <footer id="download" className="bg-slate-900 text-white">
      {/* Download CTA banner */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-violet-900 to-indigo-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Ready to simplify your property management?
          </h2>
          <p className="mt-4 text-violet-200 text-base sm:text-lg">
            Download ShiftProof today — free for tenants, 14-day trial for owners.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <a
              href="#"
              className="flex items-center gap-3 rounded-2xl bg-white px-6 py-3.5 hover:bg-slate-100 transition-colors"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#1e1b4b">
                <path d="M3.18 23.76a2.02 2.02 0 001.94-.22l11.04-6.38-2.74-2.74-10.24 9.34zm16.37-9.4L17 12.93l2.55-2.55L22 11.8a1.36 1.36 0 010 2.42l-2.45 1.14zM2.01 1.14A1.36 1.36 0 00.75 2.36v19.28a1.36 1.36 0 001.26 1.22L13.8 12 2.01 1.14zM5.12.46L16.16 6.84l-2.74 2.74L5.12.46z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-medium text-slate-500 leading-none">Get it on</span>
                <span className="text-sm font-bold text-slate-900 leading-tight">Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand — full width on mobile, half on sm, quarter on lg */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="38" height="38" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ft-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7c3aed"/>
                    <stop offset="100%" stopColor="#2e1065"/>
                  </linearGradient>
                  <linearGradient id="ft-door" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c"/>
                    <stop offset="100%" stopColor="#c2410c"/>
                  </linearGradient>
                </defs>
                <rect width="512" height="512" rx="114" fill="url(#ft-bg)"/>
                <rect x="118" y="252" width="276" height="180" rx="8" fill="white"/>
                <polygon points="256,92 96,260 416,260" fill="white"/>
                <path d="M 208,432 L 208,318 A 48,48 0 0,1 304,318 L 304,432 Z" fill="url(#ft-door)"/>
                <rect x="138" y="274" width="60" height="52" rx="10" fill="#ddd6fe" opacity="0.6"/>
                <rect x="314" y="274" width="60" height="52" rx="10" fill="#ddd6fe" opacity="0.6"/>
                <circle cx="374" cy="392" r="36" fill="#f97316"/>
                <path d="M 356,392 L 369,406 L 394,376" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Shift<span className="text-violet-400">Proof</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The all-in-one PG and rental management app for property owners and tenants across India.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              {[
                {
                  label: "Twitter",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-violet-600 hover:text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-8">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} ShiftProof. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}

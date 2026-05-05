import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const EXPO   = "cubic-bezier(0.16, 1, 0.3, 1)";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col items-center">

        {/* ── Meme strip ──────────────────────────────────────────────────────── */}
        <div
          className="w-full py-6 px-4"
          style={{
            background: "linear-gradient(135deg, #0E2118 0%, #1B4432 50%, #0E2118 100%)",
            animation: `nf-fade-down 0.7s ${EXPO} 0ms both`,
          }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Label */}
            <p
              className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#52B788] mb-4"
              style={{ animation: `nf-fade-up 0.4s ${EXPO} 0.15s both` }}
            >
              Every PG seeker knows this feeling
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {/* Panel A */}
              <div
                className="flex-1 bg-white/10 rounded-2xl p-4 flex flex-col gap-2"
                style={{ animation: `nf-fade-up 0.5s ${EXPO} 0.25s both` }}
              >
                <span className="text-3xl">📞</span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#74C69D]">11 PM — Maa calling</p>
                <p className="text-white font-semibold text-sm leading-relaxed">
                  &ldquo;Beta, khana kha liya? Neend aa rahi hai? Sheher mein sab theek toh hai na?&rdquo;
                </p>
                <p className="text-[#A2C7AD] text-xs mt-1 italic">
                  The one call that makes everything feel okay.
                </p>
              </div>

              {/* Divider */}
              <div
                className="flex items-center justify-center"
                style={{ animation: `nf-fade-up 0.4s ${EXPO} 0.38s both` }}
              >
                <div className="sm:hidden h-px w-16 bg-[#2D6A4F]" />
                <p className="hidden sm:block text-[#2D6A4F] font-black text-xl px-2">vs</p>
              </div>

              {/* Panel B */}
              <div
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2"
                style={{ animation: `nf-fade-up 0.5s ${EXPO} 0.45s both` }}
              >
                <span className="text-3xl">💻</span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#74C69D]">You, alone in PG room</p>
                <p className="text-white font-semibold text-sm leading-relaxed">
                  &ldquo;Haan Maa sab theek hai&rdquo; — and then quietly gets a 404 trying to find your way.
                </p>
                <p className="text-[#A2C7AD] text-xs mt-1 italic">
                  Some things, you search for alone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-14 w-full">
          <div className="max-w-xl w-full flex flex-col items-center text-center gap-8">

            {/* Illustration — outer: scale-in once · inner: float forever */}
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ animation: `nf-glow-breathe 4s ease-in-out 1.4s infinite` }}
              >
                <div className="w-64 h-40 rounded-full blur-3xl" style={{ background: "#A2C7AD", opacity: 0.35 }} />
              </div>

              {/* Scale-in wrapper */}
              <div style={{ animation: `nf-scale-in 0.9s ${EXPO} 0.15s both` }}>
                {/* Float wrapper — separate div so transforms don't conflict */}
                <div style={{ animation: `nf-float 6s ease-in-out 1.4s infinite` }}>
                  <svg
                    viewBox="0 0 320 210"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-72 sm:w-80 h-auto"
                    aria-hidden="true"
                  >
                    {/* Moon + stars */}
                    <circle cx="272" cy="28" r="18" fill="#fef3c7" />
                    <circle cx="282" cy="22" r="13" fill="#1e293b" />
                    <circle cx="240" cy="18" r="1.5" fill="#D0E3D6" />
                    <circle cx="258" cy="36" r="1"   fill="#D0E3D6" />
                    <circle cx="295" cy="44" r="1.5" fill="#D0E3D6" />
                    <circle cx="308" cy="20" r="1"   fill="#D0E3D6" />

                    {/* PG Building */}
                    <rect x="10" y="70" width="148" height="128" rx="4" fill="#0E2118" />
                    <path d="M4 74 L84 26 L164 74" fill="#162E20" stroke="#245A41" strokeWidth="1.5" strokeLinejoin="round" />

                    {/* Dark windows (everyone asleep) */}
                    <rect x="22" y="90"  width="30" height="22" rx="2" fill="#051209" stroke="#245A41" strokeWidth="1" />
                    <rect x="62" y="90"  width="30" height="22" rx="2" fill="#051209" stroke="#245A41" strokeWidth="1" />
                    <rect x="102" y="90" width="30" height="22" rx="2" fill="#051209" stroke="#245A41" strokeWidth="1" />
                    <rect x="22" y="128" width="30" height="22" rx="2" fill="#051209" stroke="#245A41" strokeWidth="1" />
                    <rect x="102" y="128" width="30" height="22" rx="2" fill="#051209" stroke="#245A41" strokeWidth="1" />

                    {/* One lit window — the lone searcher (flickers) */}
                    <rect className="nf-window-lit" x="62" y="128" width="30" height="22" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                    <line x1="77" y1="128" x2="77" y2="150" stroke="#ca8a04" strokeWidth="0.8" opacity="0.5" />
                    <line x1="62" y1="139" x2="92" y2="139" stroke="#ca8a04" strokeWidth="0.8" opacity="0.5" />

                    {/* Tiny figure at lit window */}
                    <circle cx="77" cy="136" r="4" fill="#fde68a" />
                    <line x1="77" y1="140" x2="77" y2="147" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />

                    {/* VACANT sign on door */}
                    <rect x="30" y="163" width="98" height="18" rx="3" fill="#2D6A4F" />
                    <text x="79" y="176" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">VACANT</text>

                    {/* Ajar door */}
                    <rect x="66" y="158" width="36" height="40" rx="2" fill="#1B4432" stroke="#2D6A4F" strokeWidth="1.5" />
                    <path d="M66 158 Q57 161 57 176 Q57 193 66 198" stroke="#2D6A4F" strokeWidth="1.5" fill="#0E2118" />

                    {/* Ground */}
                    <line x1="0" y1="198" x2="320" y2="198" stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Running figure with luggage */}
                    <ellipse cx="218" cy="166" rx="11" ry="15" fill="#2D6A4F" />
                    <circle  cx="218" cy="147" r="10"  fill="#fde68a" />
                    <path    d="M209 143 Q218 135 227 143" fill="#1e293b" />
                    {/* Sweat drop */}
                    <ellipse cx="230" cy="145" rx="2" ry="3" fill="#bae6fd" opacity="0.85" />
                    {/* Tiptoe legs */}
                    <line x1="213" y1="180" x2="207" y2="198" stroke="#1B4432" strokeWidth="3" strokeLinecap="round" />
                    <line x1="223" y1="180" x2="229" y2="198" stroke="#1B4432" strokeWidth="3" strokeLinecap="round" />
                    <ellipse cx="207" cy="198" rx="5" ry="2.5" fill="#0E2118" />
                    <ellipse cx="229" cy="198" rx="5" ry="2.5" fill="#0E2118" />
                    {/* Arm holding suitcase */}
                    <line x1="227" y1="159" x2="241" y2="171" stroke="#245A41" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Suitcase */}
                    <rect x="239" y="169" width="24" height="18" rx="3" fill="#40916C" stroke="#2D6A4F" strokeWidth="1.5" />
                    <rect x="245" y="165" width="12" height="5"  rx="2" fill="#2D6A4F" />
                    <line x1="239" y1="178" x2="263" y2="178" stroke="#2D6A4F" strokeWidth="1" />
                    {/* Boxes */}
                    <rect x="268" y="170" width="26" height="22" rx="2" fill="#D0E3D6" stroke="#2D6A4F" strokeWidth="1.5" />
                    <rect x="271" y="155" width="22" height="17" rx="2" fill="#A2C7AD" stroke="#2D6A4F" strokeWidth="1.5" />
                    <text x="281" y="167" textAnchor="middle" fill="#1B4432" fontSize="5" fontWeight="bold" fontFamily="sans-serif">PAGE</text>
                    <text x="281" y="184" textAnchor="middle" fill="#1B4432" fontSize="5" fontWeight="bold" fontFamily="sans-serif">STUFF</text>

                    {/* Motion lines — each draws in separately */}
                    <line className="nf-dash-1" x1="188" y1="160" x2="200" y2="160" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" />
                    <line className="nf-dash-2" x1="186" y1="167" x2="200" y2="167" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" />
                    <line className="nf-dash-3" x1="189" y1="174" x2="200" y2="174" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 404 — blur-to-sharp reveal */}
            <div
              className="text-[96px] font-black leading-none tracking-tighter -my-2"
              style={{
                background: "linear-gradient(135deg, #0E2118 0%, #2D6A4F 50%, #52B788 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: `nf-number-reveal 1s ${SPRING} 0.65s both`,
              }}
            >
              404
            </div>

            {/* Heading + subtext */}
            <div
              className="space-y-3"
              style={{ animation: `nf-fade-up 0.6s ${EXPO} 1.0s both` }}
            >
              <h1 className="text-2xl font-bold text-slate-900">
                Kuch cheezein bas mil nahi paatiin
              </h1>
              <p className="text-slate-500 leading-relaxed max-w-sm mx-auto text-sm">
                Like a ₹5,000/month PG with WiFi, geyser, and meals in Mumbai —
                this page exists only in dreams. But we&apos;ll help you find
                what you actually came for.
              </p>
            </div>

            {/* Card */}
            <div
              className="bg-white border border-slate-200 rounded-2xl px-5 py-4 text-left w-full max-w-sm shadow-sm"
              style={{ animation: `nf-card-pop 0.6s ${EXPO} 1.2s both` }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Why the page left
              </p>
              <div className="space-y-2">
                {[
                  { icon: "📦", text: "Packed up without notice" },
                  { icon: "📍", text: "Left no forwarding address" },
                  { icon: "💸", text: "Took the security deposit too" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <span className="text-base">{icon}</span>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
              style={{ animation: `nf-fade-up 0.5s ${EXPO} 1.45s both` }}
            >
              <Link
                href="/"
                className="rounded-xl px-8 py-3 text-sm font-bold text-white transition-colors text-center bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)]"
              >
                Ghar wapas ja
              </Link>
              <Link
                href="/find-pg"
                className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors text-center"
              >
                Find a PG instead
              </Link>
            </div>

            <p
              className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed"
              style={{ animation: `nf-fade-up 0.4s ${EXPO} 1.65s both` }}
            >
              You&apos;re not alone in this city.{" "}
              <Link href="/#contact" className="text-[color:var(--accent-500)] hover:underline font-medium">
                We&apos;re here if you need us.
              </Link>
            </p>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

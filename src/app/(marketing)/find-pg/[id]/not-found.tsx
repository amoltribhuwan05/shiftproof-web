import Link from "next/link";

const EXPO   = "cubic-bezier(0.16, 1, 0.3, 1)";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function PropertyNotFound() {
  return (
    <main className="flex-1 flex flex-col items-center bg-slate-50 overflow-x-hidden">

      {/* ── Meme strip ──────────────────────────────────────────────────────── */}
      <div
        className="w-full py-6 px-4"
        style={{
          background: "linear-gradient(135deg, #0E2118 0%, #1B4432 50%, #0E2118 100%)",
          animation: `nf-fade-down 0.7s ${EXPO} 0ms both`,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <p
            className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#52B788] mb-4"
            style={{ animation: `nf-fade-up 0.4s ${EXPO} 0.15s both` }}
          >
            The PG search struggle is real
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Panel A */}
            <div
              className="flex-1 bg-white/10 rounded-2xl p-4 flex flex-col gap-2"
              style={{ animation: `nf-fade-up 0.5s ${EXPO} 0.25s both` }}
            >
              <span className="text-3xl">🏠</span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#74C69D]">You, to your parents</p>
              <p className="text-white font-semibold text-sm leading-relaxed">
                &ldquo;Mummy dekho! ₹7k/month, meals included, 10 min from office — yeh toh perfect hai!&rdquo;
              </p>
              <p className="text-[#A2C7AD] text-xs mt-1 italic">
                You screenshot it. You forward it. You dream a little.
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
              <span className="text-3xl">📵</span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#74C69D]">Owner, 11 mins later</p>
              <p className="text-white font-semibold text-sm leading-relaxed">
                &ldquo;Beta woh toh abhi abhi book ho gaya. Aur koi listing chahiye toh bata dena.&rdquo;
              </p>
              <p className="text-[#A2C7AD] text-xs mt-1 italic">
                He never calls back.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 w-full">
        <div className="max-w-xl w-full flex flex-col items-center text-center gap-8">

          {/* Illustration — two-wrapper fix: scale-in + float on separate divs */}
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ animation: `nf-glow-breathe 4s ease-in-out 1.4s infinite` }}
            >
              <div className="w-64 h-40 rounded-full blur-3xl" style={{ background: "#A2C7AD", opacity: 0.35 }} />
            </div>

            {/* Scale-in wrapper */}
            <div style={{ animation: `nf-scale-in 0.9s ${EXPO} 0.15s both` }}>
              {/* Float wrapper */}
              <div style={{ animation: `nf-float 6s ease-in-out 1.4s infinite` }}>
                <svg
                  viewBox="0 0 300 210"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-72 sm:w-80 h-auto"
                  aria-hidden="true"
                >
                  {/* Building — fully lit, lively */}
                  <rect x="30" y="50" width="162" height="148" rx="4" fill="#162E20" />
                  <path d="M22 54 L111 8 L200 54" fill="#0E2118" stroke="#245A41" strokeWidth="1.5" strokeLinejoin="round" />

                  {/* All windows warm — fully occupied */}
                  <rect className="nf-window-warm" x="44"  y="70" width="30" height="24" rx="2" fill="#fef08a" opacity="0.7" stroke="#ca8a04" strokeWidth="1" />
                  <rect x="86"  y="70" width="30" height="24" rx="2" fill="#fef08a" opacity="0.6" stroke="#ca8a04" strokeWidth="1" />
                  <rect x="128" y="70" width="30" height="24" rx="2" fill="#fef08a" opacity="0.55" stroke="#ca8a04" strokeWidth="1" />
                  <rect x="44"  y="110" width="30" height="24" rx="2" fill="#fef08a" opacity="0.5"  stroke="#ca8a04" strokeWidth="1" />
                  <rect x="128" y="110" width="30" height="24" rx="2" fill="#fef08a" opacity="0.6"  stroke="#ca8a04" strokeWidth="1" />

                  {/* FULLY BOOKED banner wipes in */}
                  <g className="nf-banner">
                    <rect x="18" y="90" width="186" height="20" rx="3" fill="#2D6A4F" transform="rotate(-3 18 90)" />
                    <text x="112" y="104" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1.5" transform="rotate(-3 112 104)">FULLY BOOKED</text>
                  </g>

                  {/* Locked door */}
                  <rect x="82" y="140" width="42" height="58" rx="3" fill="#0E2118" stroke="#2D6A4F" strokeWidth="2" />
                  <rect x="96" y="160" width="16" height="14" rx="3" fill="#2D6A4F" />
                  <path d="M99 160 Q99 151 104 151 Q109 151 109 160" stroke="#2D6A4F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <circle cx="104" cy="166" r="2.5" fill="#0E2118" />

                  {/* Ground */}
                  <line x1="0" y1="198" x2="300" y2="198" stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Happy tenant peeking from middle window (top row) */}
                  <circle cx="101" cy="78" r="8.5" fill="#fde68a" />
                  <path d="M93 75 Q101 67 109 75" fill="#1e293b" />
                  {/* Big smile */}
                  <path d="M97 81 Q101 86 105 81" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <circle cx="98" cy="77" r="1.3" fill="#1e293b" />
                  <circle cx="104" cy="77" r="1.3" fill="#1e293b" />
                  {/* Waving hand */}
                  <g className="nf-wave">
                    <line x1="110" y1="79" x2="120" y2="72" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="120" cy="72" r="3" fill="#fde68a" />
                  </g>

                  {/* Sad waitlist queue — bounce in staggered */}
                  <g className="nf-p1">
                    <circle cx="224" cy="163" r="7.5" fill="#A2C7AD" />
                    {/* Sad face */}
                    <path d="M220 166 Q224 162 228 166" stroke="#245A41" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    <circle cx="222" cy="161" r="1.2" fill="#245A41" />
                    <circle cx="226" cy="161" r="1.2" fill="#245A41" />
                    <line x1="224" y1="171" x2="224" y2="185" stroke="#A2C7AD" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="224" y1="185" x2="219" y2="198" stroke="#A2C7AD" strokeWidth="2"   strokeLinecap="round" />
                    <line x1="224" y1="185" x2="229" y2="198" stroke="#A2C7AD" strokeWidth="2"   strokeLinecap="round" />
                    <line x1="217" y1="176" x2="231" y2="176" stroke="#A2C7AD" strokeWidth="2"   strokeLinecap="round" />
                    {/* Phone in hand */}
                    <rect x="231" y="174" width="5" height="8" rx="1" fill="#52B788" opacity="0.7" />
                  </g>

                  <g className="nf-p2">
                    <circle cx="248" cy="166" r="6" fill="#D0E3D6" />
                    <path d="M244 169 Q248 165 252 169" stroke="#2D6A4F" strokeWidth="1" fill="none" strokeLinecap="round" />
                    <line x1="248" y1="172" x2="248" y2="184" stroke="#D0E3D6" strokeWidth="2"   strokeLinecap="round" />
                    <line x1="248" y1="184" x2="244" y2="198" stroke="#D0E3D6" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="248" y1="184" x2="252" y2="198" stroke="#D0E3D6" strokeWidth="1.5" strokeLinecap="round" />
                  </g>

                  <g className="nf-p3">
                    <circle cx="267" cy="169" r="4.5" fill="#E8F1EC" />
                    <line x1="267" y1="174" x2="267" y2="185" stroke="#E8F1EC" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="267" y1="185" x2="264" y2="198" stroke="#E8F1EC" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="267" y1="185" x2="270" y2="198" stroke="#E8F1EC" strokeWidth="1.5" strokeLinecap="round" />
                  </g>

                  {/* Waitlist sign */}
                  <rect x="202" y="142" width="86" height="18" rx="3" fill="#1B4432" stroke="#2D6A4F" strokeWidth="1" />
                  <text x="245" y="154" textAnchor="middle" fill="#74C69D" fontSize="7" fontWeight="bold" fontFamily="sans-serif">WAITLIST: 47 people</text>
                </svg>
              </div>
            </div>
          </div>

          {/* "Taken" — dramatic reveal */}
          <div
            className="text-[80px] font-black leading-none tracking-tighter -my-2"
            style={{
              background: "linear-gradient(135deg, #0E2118 0%, #2D6A4F 50%, #52B788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: `nf-number-reveal 1s ${SPRING} 0.65s both`,
            }}
          >
            Taken
          </div>

          {/* Copy */}
          <div
            className="space-y-3"
            style={{ animation: `nf-fade-up 0.6s ${EXPO} 1.0s both` }}
          >
            <h1 className="text-2xl font-bold text-slate-900">
              Yeh PG ab kisi aur ka ghar hai
            </h1>
            <p className="text-slate-500 leading-relaxed max-w-sm mx-auto text-sm">
              That feeling when someone signed the agreement on YOUR dream room —
              we feel you. Good PGs don&apos;t wait. But the right one is still out there.
            </p>
          </div>

          {/* Stats card */}
          <div
            className="bg-white border border-slate-200 rounded-2xl px-5 py-4 text-left w-full max-w-sm shadow-sm"
            style={{ animation: `nf-card-pop 0.6s ${EXPO} 1.2s both` }}
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">The hard truth</p>
            <div className="space-y-2.5">
              {[
                { label: "Listing to booking time", value: "11 minutes" },
                { label: "People ahead of you",     value: "47" },
                { label: "Owner replied to them",   value: "instantly" },
                { label: "Owner replied to you",    value: "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold ${value === "—" ? "text-red-400" : "text-slate-800"}`}>{value}</span>
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
              href="/find-pg"
              className="rounded-xl px-8 py-3 text-sm font-bold text-white transition-colors text-center bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)]"
            >
              Browse All PGs
            </Link>
            <Link
              href="/find-pg"
              className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              Try Another City
            </Link>
          </div>

          <p
            className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed"
            style={{ animation: `nf-fade-up 0.4s ${EXPO} 1.65s both` }}
          >
            Don&apos;t give up — your perfect PG is one scroll away.{" "}
            <Link href="/#contact" className="text-[color:var(--accent-500)] hover:underline font-medium">
              Join the waitlist
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

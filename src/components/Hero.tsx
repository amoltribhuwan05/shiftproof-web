import { Smartphone, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-6 sm:gap-8">

            {/* Social proof pill — trust signal first */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-violet-200 ring-1 ring-white/20">
                <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                Now live on Android
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5 text-sm font-semibold text-amber-300 ring-1 ring-amber-400/30">
                ★★★★★
                <span className="text-amber-200 font-normal">4.8 · 15,000+ reviews</span>
              </span>
            </div>

            {/* Headline — specific pain, specific benefit */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Stop chasing rent
              <br />
              on{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-orange-400">WhatsApp.</span>
                <span className="absolute bottom-1 left-0 right-0 h-2 bg-orange-500/20 rounded-full -z-0" />
              </span>
            </h1>

            <p className="max-w-lg text-base sm:text-lg text-violet-200 leading-relaxed">
              ShiftProof automates rent collection, tracks vacancies, and handles
              tenant issues — across all your PGs, in one app.{" "}
              <span className="font-semibold text-white">Free for tenants. Forever.</span>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all hover:scale-105"
              >
                <Smartphone size={18} strokeWidth={1.75} />
                Start Managing Free
              </a>
              <a
                href="/find-pg"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-all hover:scale-105"
              >
                Find a PG near me
                <ArrowRight size={16} strokeWidth={1.75} />
              </a>
            </div>

            {/* Google Play + trust micro-copy */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="#download"
                className="flex items-center gap-3 rounded-xl bg-black/40 border border-white/20 px-4 py-2.5 hover:bg-black/60 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M3.18 23.76a2.02 2.02 0 001.94-.22l11.04-6.38-2.74-2.74-10.24 9.34zm16.37-9.4L17 12.93l2.55-2.55L22 11.8a1.36 1.36 0 010 2.42l-2.45 1.14zM2.01 1.14A1.36 1.36 0 00.75 2.36v19.28a1.36 1.36 0 001.26 1.22L13.8 12 2.01 1.14zM5.12.46L16.16 6.84l-2.74 2.74L5.12.46z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-white/70 leading-none">Get it on</span>
                  <span className="text-sm font-bold text-white leading-tight">Google Play</span>
                </div>
              </a>
              <p className="text-xs text-violet-300">
                No credit card · 14-day free trial · Cancel anytime
              </p>
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="flex justify-center mt-6 lg:mt-0">
            <div
              className="relative px-14 sm:px-16 py-8"
              style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
            >
              <div
                className="relative"
                style={{
                  transform: "rotateY(-18deg) rotateX(6deg)",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.6s ease",
                }}
              >
                <div className="absolute inset-4 rounded-[3rem] bg-violet-400/40 blur-2xl" />

                <div className="phone-3d-shadow relative flex flex-col w-52 h-[450px] sm:w-60 sm:h-[520px] md:w-64 md:h-[554px] rounded-[2.8rem] border-[5px] border-white/20 bg-slate-900 overflow-hidden">
                  <div className="flex-shrink-0 flex justify-center items-center pt-3 pb-2 bg-slate-900">
                    <div className="h-5 w-24 rounded-full bg-black flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                      <div className="h-2 w-2 rounded-full bg-slate-600" />
                    </div>
                  </div>

                  <div className="mx-2 mb-2 flex-1 flex flex-col rounded-2xl bg-slate-800 overflow-hidden">
                    <div className="flex-shrink-0 bg-violet-700 px-4 py-3">
                      <div className="text-xs font-semibold text-white/90">ShiftProof</div>
                      <div className="mt-1 text-[10px] text-violet-200">Good morning, Rahul 👋</div>
                    </div>

                    <div className="flex-1 overflow-hidden p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-violet-900/60 p-2.5">
                          <div className="text-[9px] text-violet-300">Properties</div>
                          <div className="text-lg font-bold text-white">3</div>
                        </div>
                        <div className="rounded-xl bg-orange-900/60 p-2.5">
                          <div className="text-[9px] text-orange-300">Tenants</div>
                          <div className="text-lg font-bold text-white">12</div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-green-900/60 p-2.5 flex justify-between items-center">
                        <div>
                          <div className="text-[9px] text-green-300">Collected This Month</div>
                          <div className="text-sm font-bold text-white">₹1,02,000</div>
                        </div>
                        <div className="text-[9px] font-bold text-green-400 bg-green-900/60 px-1.5 py-0.5 rounded-full">↑ 9%</div>
                      </div>

                      <div className="text-[9px] font-semibold text-slate-400 px-0.5 pt-1">RECENT ACTIVITY</div>
                      {[
                        { name: "Amit K.", amount: "₹8,500", status: "Paid", color: "green" },
                        { name: "Priya S.", amount: "₹9,000", status: "Paid", color: "green" },
                        { name: "Raj M.",   amount: "₹7,500", status: "Due",  color: "orange" },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center justify-between rounded-lg bg-slate-700/50 px-2.5 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center text-[8px] font-bold text-white">
                              {p.name[0]}
                            </div>
                            <span className="text-[9px] text-slate-200">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-semibold text-white">{p.amount}</span>
                            <span className={`text-[8px] rounded-full px-1.5 py-0.5 font-medium ${p.color === "green" ? "bg-green-900/60 text-green-400" : "bg-orange-900/60 text-orange-400"}`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex-shrink-0 flex justify-around border-t border-slate-700 py-2.5 px-2">
                      {["Home", "Tenants", "Payments", "More"].map((tab, i) => (
                        <div key={tab} className="flex flex-col items-center gap-0.5">
                          <div className={`h-1 w-1 rounded-full ${i === 0 ? "bg-violet-400" : "bg-transparent"}`} />
                          <span className={`text-[8px] ${i === 0 ? "text-violet-400 font-semibold" : "text-slate-500"}`}>{tab}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="hidden sm:flex absolute -right-6 top-14 items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-slate-500">Rent Collected</div>
                    <div className="text-xs font-bold text-slate-800">₹8,500 · Amit K.</div>
                  </div>
                </div>

                <div className="hidden sm:flex absolute -left-10 bottom-20 items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl max-w-[160px]">
                  <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-slate-500">Zero WhatsApp calls</div>
                    <div className="text-[10px] font-bold text-violet-700">this month 🎉</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-14 md:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-white/10">
          {[
            { value: "15,000+", label: "Happy Tenants",       sub: "across India" },
            { value: "2,500+",  label: "Properties Listed",   sub: "and growing daily" },
            { value: "₹5Cr+",   label: "Rent Collected",      sub: "zero bounced payments" },
            { value: "4.8★",    label: "Google Play Rating",  sub: "15,000+ reviews" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 px-4 sm:px-6 py-4 sm:py-5 text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-white">{s.value}</div>
              <div className="mt-0.5 text-xs sm:text-sm font-semibold text-violet-200">{s.label}</div>
              <div className="mt-0.5 text-[11px] text-violet-400 hidden sm:block">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

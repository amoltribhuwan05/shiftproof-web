import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* single soft glow — all other decorative effects removed */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full bg-[color:var(--accent-200)] blur-[120px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

          {/* Copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/60 px-3.5 py-1.5 text-xs font-medium text-[color:var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--foreground)]" />
              Built for Indian landlords
            </span>

            <h1 className="text-[2.75rem] sm:text-6xl md:text-7xl leading-[1.02] tracking-tight text-[color:var(--foreground)]">
              Rent collected.
              <br />
              Paper handled.
              <br />
              <span className="text-[color:var(--accent-500)]">Sunday back.</span>
            </h1>

            <p className="max-w-lg text-base sm:text-lg text-[color:var(--muted)] leading-relaxed">
              One dashboard. Rent collected, beds tracked, tenants happy. Your phone stops buzzing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/signup?plan=growth"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-7 py-4 text-base font-semibold text-white transition-colors"
              >
                Try it free for 14 days
                <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--line)] bg-white/60 hover:bg-white px-6 py-4 text-base font-medium text-[color:var(--foreground)] transition-colors"
              >
                See how it works
              </Link>
            </div>

            <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-[color:var(--muted)]">
              {[
                "No credit card",
                "Cancel anytime",
                "Data export on cancel",
              ].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check size={14} strokeWidth={2.5} className="text-[color:var(--accent-500)]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Phone mock — Android punch-hole, no iPhone notch */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="phone-shadow relative flex flex-col w-[17rem] h-[580px] sm:w-72 sm:h-[600px] rounded-[2.5rem] border border-[color:var(--line)] bg-[#1A1A18] overflow-hidden">

                {/* status bar */}
                <div className="relative flex-shrink-0 pt-3 pb-2 px-5 flex items-center justify-between text-[10px] font-medium text-white/80">
                  <span>10:30</span>
                  {/* Android punch-hole camera */}
                  <span className="absolute left-1/2 top-3 -translate-x-1/2 h-2 w-2 rounded-full bg-black ring-1 ring-white/10" />
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-1 rounded-sm bg-white/60" />
                    <span className="h-2 w-1 rounded-sm bg-white/60" />
                    <span className="h-2 w-1 rounded-sm bg-white/60" />
                    <span className="h-2 w-2.5 rounded-sm bg-white/60 ml-1" />
                  </span>
                </div>

                {/* app body */}
                <div className="mx-3 mb-3 flex-1 flex flex-col rounded-2xl bg-[#F7F6F2] overflow-hidden">
                  <div className="flex-shrink-0 px-4 py-3.5 border-b border-[#E7E4DC]">
                    <div className="text-[10px] text-[#6B6B66]">Good morning</div>
                    <div className="text-sm font-semibold text-[#1A1A18]">Rahul Sharma</div>
                  </div>

                  <div className="flex-1 overflow-hidden p-3 space-y-2.5">
                    {/* headline metric */}
                    <div className="rounded-xl bg-white border border-[#E7E4DC] p-3.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#6B6B66]">Collected in April</div>
                      <div className="mt-1 text-2xl font-semibold text-[#1A1A18]">₹2,12,500</div>
                      <div className="mt-1 text-[10px] text-[#2D6A4F] font-medium">25 of 25 tenants paid</div>
                    </div>

                    {/* tenant rows */}
                    <div className="text-[9px] font-medium text-[#6B6B66] px-1 pt-1 uppercase tracking-wider">
                      Today
                    </div>
                    {[
                      { name: "Amit K.",  amount: "₹8,500",  paid: true },
                      { name: "Priya S.", amount: "₹10,000", paid: true },
                      { name: "Raj M.",   amount: "₹7,500",  paid: false },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between rounded-xl bg-white border border-[#E7E4DC] px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-6 w-6 rounded-full bg-[#E8F1EC] flex items-center justify-center text-[9px] font-semibold text-[#2D6A4F]">
                            {p.name[0]}
                          </div>
                          <span className="text-[11px] text-[#1A1A18] font-medium">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#1A1A18]">{p.amount}</span>
                          <span className={`text-[9px] rounded-full px-1.5 py-0.5 font-medium ${p.paid ? "bg-[#E8F1EC] text-[#2D6A4F]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
                            {p.paid ? "Paid" : "Reminded"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* tab bar */}
                  <div className="flex-shrink-0 flex justify-around border-t border-[#E7E4DC] py-2.5 bg-white">
                    {["Home", "Tenants", "Payments", "More"].map((tab, i) => (
                      <div key={tab} className="flex flex-col items-center gap-1">
                        <div className={`h-1 w-4 rounded-full ${i === 0 ? "bg-[#2D6A4F]" : "bg-transparent"}`} />
                        <span className={`text-[9px] ${i === 0 ? "text-[#2D6A4F] font-semibold" : "text-[#6B6B66]"}`}>{tab}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

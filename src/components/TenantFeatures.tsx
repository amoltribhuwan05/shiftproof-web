import { Search, CreditCard, CalendarDays, Wrench, Bell } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find a PG in your budget.",
    desc: "Filters that actually work. Real prices. Verified listings.",
  },
  {
    icon: CreditCard,
    title: "Pay rent in one tap.",
    desc: "UPI, card, net banking. Confirmed instantly.",
  },
  {
    icon: CalendarDays,
    title: "Never miss a due date.",
    desc: "Automatic reminders. Full payment history.",
  },
  {
    icon: Wrench,
    title: "Report issues that get fixed.",
    desc: "Photo, description, done. Track status in-app.",
  },
  {
    icon: Bell,
    title: "Owner announcements.",
    desc: "Water cuts, rule changes — in one place, not 4 WhatsApp groups.",
  },
];

export default function TenantFeatures() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-[#1A1A18] text-white">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Phone mock */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative flex flex-col w-64 h-[560px] rounded-[2.5rem] border border-white/10 bg-[#0f0f0e] overflow-hidden shadow-2xl">
              <div className="relative flex-shrink-0 pt-3 pb-2 px-5 flex items-center justify-between text-[10px] font-medium text-white/70">
                <span>10:30</span>
                <span className="absolute left-1/2 top-3 -translate-x-1/2 h-2 w-2 rounded-full bg-black ring-1 ring-white/10" />
                <span className="flex items-center gap-1">
                  <span className="h-2 w-1 rounded-sm bg-white/50" />
                  <span className="h-2 w-1 rounded-sm bg-white/50" />
                  <span className="h-2 w-2.5 rounded-sm bg-white/50 ml-1" />
                </span>
              </div>

              <div className="mx-3 mb-3 flex-1 flex flex-col rounded-2xl bg-[#F7F6F2] overflow-hidden">
                <div className="flex-shrink-0 px-4 py-3.5 border-b border-[#E7E4DC]">
                  <div className="text-[10px] text-[#6B6B66]">Green Valley PG · Room 204</div>
                  <div className="text-sm font-semibold text-[#1A1A18]">Rahul Sharma</div>
                </div>

                <div className="flex-1 p-3 space-y-2.5">
                  {/* Rent due card */}
                  <div className="rounded-xl bg-white border border-[#E7E4DC] p-4">
                    <div className="text-[10px] uppercase tracking-wider text-[#6B6B66]">Rent due 5 May</div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-semibold text-[#1A1A18]">₹8,500</span>
                      <button className="rounded-lg bg-[#2D6A4F] px-3 py-1.5 text-[10px] font-semibold text-white">
                        Pay now
                      </button>
                    </div>
                  </div>

                  <div className="text-[9px] font-medium text-[#6B6B66] px-1 pt-1 uppercase tracking-wider">
                    Announcements
                  </div>
                  {[
                    { msg: "Water outage tomorrow 9 AM–1 PM", time: "2h ago" },
                    { msg: "April rent receipts are ready", time: "1d ago" },
                  ].map((a) => (
                    <div key={a.msg} className="rounded-xl bg-white border border-[#E7E4DC] px-3 py-2.5">
                      <div className="text-[11px] text-[#1A1A18] leading-snug">{a.msg}</div>
                      <div className="text-[9px] text-[#6B6B66] mt-1">{a.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <p className="text-xs tracking-wide uppercase text-white/50 mb-5">For tenants</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-white mb-6">
              Your rent, your records,
              <br />
              <span className="text-[color:var(--accent-200)]">in your pocket.</span>
            </h2>
            <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-10 max-w-lg">
              Tenants never pay us. Not a rupee, not ever.
            </p>

            <ul className="space-y-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <li key={f.title} className="flex items-start gap-4">
                    {i % 2 === 0 ? (
                      <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--accent-200)]">
                        <Icon size={18} strokeWidth={2} />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-10 flex justify-start pt-0.5 text-[color:var(--accent-200)]/60">
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-white mb-0.5">{f.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

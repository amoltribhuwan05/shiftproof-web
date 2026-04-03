const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Find PG & Rentals",
    desc: "Browse verified listings with filters for location, price, amenities, and availability.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Pay Rent In-App",
    desc: "Pay rent directly via UPI, cards, or net banking. Instant confirmation every time.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Track Due Dates",
    desc: "Never miss a payment. Get reminders for upcoming rent and view full payment history.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 010 1.4l-8 8a1 1 0 01-.4.2l-3 1a1 1 0 01-1.2-1.2l1-3a1 1 0 01.2-.4l8-8a1 1 0 011.4 0z" />
        <path d="M15.5 2.1L21.9 8.5" />
      </svg>
    ),
    title: "Submit Maintenance Requests",
    desc: "Report issues directly from the app. Track status and get notified when resolved.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    title: "Owner Announcements",
    desc: "Stay in the loop with notices, rule updates, and messages from your property owner.",
  },
];

export default function TenantFeatures() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 to-indigo-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — simulated tenant app screen */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 rounded-[2.5rem] bg-orange-500/20 blur-2xl scale-110" />
              <div className="relative flex flex-col w-56 h-[486px] sm:w-64 sm:h-[554px] rounded-[2.8rem] border-[5px] border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
                {/* Dynamic island notch */}
                <div className="flex-shrink-0 flex justify-center items-center pt-3 pb-2 bg-slate-900">
                  <div className="h-5 w-24 rounded-full bg-black flex items-center justify-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <div className="h-2 w-2 rounded-full bg-slate-600" />
                  </div>
                </div>

                <div className="mx-2 mb-2 flex-1 flex flex-col rounded-2xl bg-slate-800 overflow-hidden">
                  {/* Header */}
                  <div className="flex-shrink-0 bg-orange-600 px-4 py-3">
                    <div className="text-xs font-semibold text-white/90">My Rental</div>
                    <div className="mt-0.5 text-[10px] text-orange-200">Green Valley PG, Room 204</div>
                  </div>

                  <div className="flex-1 overflow-hidden p-3 space-y-2">
                    {/* Rent due card */}
                    <div className="rounded-xl bg-orange-900/50 border border-orange-700/30 p-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[9px] text-orange-300">Rent Due</div>
                          <div className="text-base font-bold text-white">₹8,500</div>
                        </div>
                        <button className="rounded-lg bg-orange-500 px-2.5 py-1 text-[9px] font-bold text-white">
                          Pay Now
                        </button>
                      </div>
                      <div className="mt-1.5 h-1 w-full rounded-full bg-orange-900/80">
                        <div className="h-1 w-2/3 rounded-full bg-orange-400" />
                      </div>
                      <div className="mt-1 text-[8px] text-orange-300">Due in 5 days</div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: "Pay Rent", color: "bg-violet-900/60" },
                        { label: "Complaint", color: "bg-slate-700" },
                        { label: "History", color: "bg-slate-700" },
                      ].map((a) => (
                        <div key={a.label} className={`${a.color} rounded-xl p-2 text-center`}>
                          <span className="text-[8px] text-slate-300 font-medium">{a.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Announcements */}
                    <div className="text-[9px] font-semibold text-slate-400 px-0.5 pt-1">ANNOUNCEMENTS</div>
                    {[
                      { msg: "Water outage on 5th, 9AM–1PM", time: "2h ago" },
                      { msg: "Rent for May is now open", time: "1d ago" },
                    ].map((a) => (
                      <div key={a.msg} className="rounded-lg bg-slate-700/50 px-2.5 py-2">
                        <div className="text-[9px] text-slate-200">{a.msg}</div>
                        <div className="text-[8px] text-slate-500 mt-0.5">{a.time}</div>
                      </div>
                    ))}

                    {/* Payment history */}
                    <div className="text-[9px] font-semibold text-slate-400 px-0.5 pt-1">HISTORY</div>
                    {[
                      { month: "Apr 2025", amount: "₹8,500", status: "Paid" },
                      { month: "Mar 2025", amount: "₹8,500", status: "Paid" },
                    ].map((h) => (
                      <div key={h.month} className="flex justify-between items-center rounded-lg bg-slate-700/50 px-2.5 py-2">
                        <span className="text-[9px] text-slate-300">{h.month}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-semibold text-white">{h.amount}</span>
                          <span className="text-[8px] rounded-full bg-green-900/60 px-1.5 py-0.5 text-green-400 font-medium">{h.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tab bar — pinned to bottom */}
                  <div className="flex-shrink-0 flex justify-around border-t border-slate-700 py-2.5">
                    {["Home", "Pay", "Requests", "Profile"].map((tab, i) => (
                      <div key={tab} className="flex flex-col items-center gap-0.5">
                        <div className={`h-1 w-1 rounded-full ${i === 0 ? "bg-orange-400" : "bg-transparent"}`} />
                        <span className={`text-[8px] ${i === 0 ? "text-orange-400 font-semibold" : "text-slate-500"}`}>{tab}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — features list */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <span className="inline-block rounded-full bg-orange-500/20 px-4 py-1.5 text-sm font-semibold text-orange-400 mb-6">
              For Tenants
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              Your perfect PG, managed from your pocket
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-8 sm:mb-10">
              Find, join, and manage your rental life effortlessly — no paperwork, no confusion.
            </p>

            <div className="space-y-6">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{f.title}</h3>
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

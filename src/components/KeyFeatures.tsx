const usps = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Role-Based Access",
    desc: "Owners and tenants each get a tailored experience — no overlap, no confusion.",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-Time Payment Tracking",
    desc: "Every payment reflects instantly — no waiting for end-of-month reconciliation.",
    gradient: "from-orange-500 to-pink-500",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 010 1.4l-8 8a1 1 0 01-.4.2l-3 1a1 1 0 01-1.2-1.2l1-3a1 1 0 01.2-.4l8-8a1 1 0 011.4 0z" />
        <path d="M15.5 2.1L21.9 8.5" />
      </svg>
    ),
    title: "Maintenance Request System",
    desc: "Tenants raise issues, owners resolve them — all tracked with status updates.",
    gradient: "from-green-500 to-teal-600",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "Multi-Property Support",
    desc: "Manage unlimited properties and tenants without switching accounts.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" />
      </svg>
    ),
    title: "Mobile-First Design",
    desc: "Built for Android — smooth, fast, and works even on older devices.",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "In-App Communication",
    desc: "Owners broadcast announcements; tenants respond. Clear, documented, and auditable.",
    gradient: "from-rose-500 to-red-600",
  },
];

import Tilt3D from "./Tilt3D";

export default function KeyFeatures() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <span className="inline-block rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 mb-4">
            Why ShiftProof?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Designed for the way PGs actually work
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500">
            Six core capabilities that make ShiftProof the only app your property needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {usps.map((u) => (
            <Tilt3D key={u.title} intensity={9} lift={14}>
              <div className="relative overflow-hidden h-full rounded-2xl border border-slate-100 bg-slate-50 p-8 shadow-sm hover:shadow-xl transition-shadow group">
                {/* Gradient top strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${u.gradient} opacity-80`} />
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${u.gradient} text-white shadow-md`}>
                  {u.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{u.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{u.desc}</p>
              </div>
            </Tilt3D>
          ))}
        </div>
      </div>
    </section>
  );
}

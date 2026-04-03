const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Multi-Property Management",
    desc: "Add and manage multiple PGs or rental properties from one unified dashboard.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Tenant Onboarding",
    desc: "Invite and onboard tenants digitally with document uploads and profile setup.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: "Rent Collection & Tracking",
    desc: "Collect rent online and get real-time visibility into paid, pending, and overdue amounts.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Occupancy at a Glance",
    desc: "See which beds and rooms are occupied, vacant, or reserved across all properties.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Payout History & Reports",
    desc: "Export detailed payout reports for any date range. Stay tax-ready, always.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="22" height="18" rx="2" ry="2" />
        <line x1="1" y1="9" x2="23" y2="9" />
        <line x1="1" y1="15" x2="23" y2="15" />
        <line x1="8" y1="9" x2="8" y2="21" />
        <line x1="16" y1="9" x2="16" y2="21" />
      </svg>
    ),
    title: "Room & Bed Configuration",
    desc: "Set up rooms, beds, amenities, and pricing for every unit in your property.",
  },
];

import Tilt3D from "./Tilt3D";

export default function OwnerFeatures() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16 fade-up">
          <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700 mb-4">
            For Property Owners
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Everything you need to run your PG like a pro
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500">
            From listing your property to collecting rent and generating reports — ShiftProof handles it all.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <Tilt3D key={f.title} intensity={8} lift={10}>
              <div className="group h-full rounded-2xl border border-slate-100 bg-slate-50 p-7 hover:bg-violet-50 hover:border-violet-200 transition-colors duration-200 shadow-sm hover:shadow-violet-100">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </Tilt3D>
          ))}
        </div>
      </div>
    </section>
  );
}

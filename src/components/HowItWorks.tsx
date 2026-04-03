const steps = [
  {
    number: "01",
    emoji: "🏠",
    title: "Owner Lists Property",
    desc: "Sign up as a property owner, add your PG or rental, configure rooms, beds, pricing, and publish your listing in minutes.",
    color: "violet",
  },
  {
    number: "02",
    emoji: "🔍",
    title: "Tenant Finds & Joins",
    desc: "Tenants browse verified listings, apply to their preferred PG, complete onboarding, and get access to their tenant portal.",
    color: "orange",
  },
  {
    number: "03",
    emoji: "✅",
    title: "Manage Everything In-App",
    desc: "Collect rent, track payments, handle maintenance requests, and communicate — both parties manage it all from ShiftProof.",
    color: "indigo",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16 fade-up">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700 mb-4">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Up and running in three steps
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500">
            ShiftProof is designed to be fast to set up and even faster to use every day.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connecting line (desktop) — uses percentage positioning instead of 1/6 fraction */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px border-t-2 border-dashed border-slate-300" />

          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Step badge — floats with staggered 3D animation */}
              <div
                className={`relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 shadow-xl mb-6 float-3d ${
                  step.color === "violet"
                    ? "border-violet-200 bg-violet-600"
                    : step.color === "orange"
                    ? "border-orange-200 bg-orange-500"
                    : "border-indigo-200 bg-indigo-600"
                }`}
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <span className="text-3xl mb-1">{step.emoji}</span>
                <span className="text-xs font-bold text-white/70 tracking-widest">{step.number}</span>
              </div>

              {/* Connector arrow (mobile) */}
              {i < steps.length - 1 && (
                <div className="md:hidden mb-4 text-slate-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#download"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow hover:bg-violet-700 transition-colors"
          >
            Get started for free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

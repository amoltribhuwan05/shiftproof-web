const plans = [
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    desc: "Perfect for first-time PG owners getting started.",
    features: [
      "1 property",
      "Up to 10 tenants",
      "Rent collection & tracking",
      "Maintenance requests",
      "In-app announcements",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "₹1,199",
    period: "/month",
    desc: "For growing property owners managing multiple PGs.",
    features: [
      "Up to 5 properties",
      "Up to 50 tenants",
      "Everything in Starter",
      "Payout history & exports",
      "Room & bed configuration",
      "Occupancy dashboard",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Business",
    price: "₹2,999",
    period: "/month",
    desc: "For large portfolios and professional property managers.",
    features: [
      "Unlimited properties",
      "Unlimited tenants",
      "Everything in Pro",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "Advanced analytics",
    ],
    cta: "Contact Sales",
    highlighted: false,
    badge: null,
  },
];

import Tilt3D from "./Tilt3D";

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16 fade-up">
          <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700 mb-4">
            Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500">
            Start free for 14 days. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {plans.map((plan) => (
            <Tilt3D key={plan.name} intensity={7} lift={16}>
            <div
              className={`relative rounded-3xl p-6 sm:p-8 ${
                plan.highlighted
                  ? "bg-violet-600 text-white shadow-2xl shadow-violet-500/30 md:scale-105"
                  : "bg-white border border-slate-200 text-slate-900"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white shadow">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-bold ${plan.highlighted ? "text-violet-100" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-violet-200" : "text-slate-400"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? "text-violet-200" : "text-slate-500"}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={plan.highlighted ? "#c4b5fd" : "#7c3aed"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className={`text-sm ${plan.highlighted ? "text-violet-100" : "text-slate-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#download"
                className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition-all hover:scale-105 ${
                  plan.highlighted
                    ? "bg-white text-violet-700 hover:bg-violet-50"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
              >
                {plan.cta}
              </a>
            </div>
            </Tilt3D>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-400">
          Tenants always use ShiftProof for free — owners pay only for the plan that fits their portfolio.
        </p>
      </div>
    </section>
  );
}

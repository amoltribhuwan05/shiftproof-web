"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const PLANS = [
  {
    key: "solo",
    name: "Solo",
    price: 10,
    annualPrice: 8,
    desc: "1 property. Your first PG, basically on us.",
    features: [
      "1 property",
      "Up to 5 tenants",
      "Automated rent reminders",
      "Maintenance requests",
      "Email support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    key: "growth",
    name: "Growth",
    price: 499,
    annualPrice: 399,
    desc: "The one most owners pick. Up to 5 properties.",
    features: [
      "Up to 5 properties",
      "Up to 50 tenants",
      "Everything in Solo",
      "Tax-ready CSV export",
      "Occupancy dashboard",
      "Priority support",
    ],
    cta: "Start free",
    highlighted: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 1999,
    annualPrice: 1599,
    desc: "Unlimited. For portfolios and property managers.",
    features: [
      "Unlimited properties",
      "Unlimited tenants",
      "Everything in Growth",
      "API access",
      "Custom branding",
      "Dedicated account manager",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white border-y border-[color:var(--line)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        <div className="mx-auto max-w-2xl text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--muted)] mb-6">
            Pricing for owners
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-[color:var(--foreground)]">
            ₹499 a month.
            <br />
            Or ₹399 billed yearly.
            <br />
            <span className="text-[color:var(--accent-500)]">No per-tenant fees.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[color:var(--muted)]">
            14 days free. No card. If you don&rsquo;t love it, walk away.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-[color:var(--line)] p-1 bg-[color:var(--background)]">
            <button
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                !annual
                  ? "bg-[color:var(--foreground)] text-white"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                annual
                  ? "bg-[color:var(--foreground)] text-white"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              Annual
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                annual ? "bg-[color:var(--accent-200)] text-[color:var(--accent-700)]" : "bg-[color:var(--accent-100)] text-[color:var(--accent-600)]"
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
          {PLANS.map((plan) => {
            const displayPrice = annual ? plan.annualPrice : plan.price;
            const isSales = plan.cta === "Talk to sales";
            const href = isSales ? "mailto:sales@shiftproof.app" : `/signup?plan=${plan.key}`;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-3xl p-8 ${
                  plan.highlighted
                    ? "bg-[color:var(--foreground)] text-white"
                    : "bg-[color:var(--background)] border border-[color:var(--line)] text-[color:var(--foreground)]"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute top-5 right-5 rounded-full bg-[color:var(--accent-100)] text-[color:var(--accent-700)] text-[10px] font-semibold px-2.5 py-1">
                    Most owners pick this
                  </span>
                )}

                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${plan.highlighted ? "text-white/60" : "text-[color:var(--muted)]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 leading-relaxed ${plan.highlighted ? "text-white/70" : "text-[color:var(--muted)]"}`}>
                  {plan.desc}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-5xl font-semibold tracking-tight ${plan.highlighted ? "text-white" : "text-[color:var(--foreground)]"}`}>
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? "text-white/60" : "text-[color:var(--muted)]"}`}>
                      /month
                    </span>
                  </div>
                  {annual && plan.key !== "solo" && (
                    <p className={`mt-1.5 text-xs ${plan.highlighted ? "text-white/60" : "text-[color:var(--muted)]"}`}>
                      Billed yearly · ₹{(displayPrice * 12).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                <ul className="mb-8 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlighted ? "text-white/85" : "text-[color:var(--foreground)]"}`}>
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-[color:var(--accent-200)]" : "text-[color:var(--muted)]"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={href}
                  className={`inline-flex items-center justify-center gap-2 w-full rounded-full py-3.5 text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white"
                      : "bg-[color:var(--foreground)] hover:bg-black text-white"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Free-for-tenants line */}
        <p className="mt-10 text-center text-sm text-[color:var(--muted)]">
          Tenants never pay us. Not a rupee, not ever.
        </p>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Tilt3D from "./Tilt3D";
import { Check, ArrowRight } from "lucide-react";

const MONTHLY = [
  {
    name: "Starter",
    price: 499,
    annualPrice: 399,
    desc: "Perfect for first-time PG owners getting started.",
    features: [
      "1 property",
      "Up to 10 tenants",
      "Rent collection & tracking",
      "Maintenance requests",
      "In-app announcements",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: 1199,
    annualPrice: 958,
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
    price: 2999,
    annualPrice: 2399,
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

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Free-for-tenants banner — surfaces the #1 acquisition hook */}
        <div className="mx-auto max-w-2xl mb-8">
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5">
            <span className="text-emerald-600 text-lg">🎉</span>
            <p className="text-sm font-semibold text-emerald-800">
              Tenants use ShiftProof <span className="underline underline-offset-2">completely free</span> — forever.
              No subscription, no hidden fees.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12 fade-up">
          <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700 mb-4">
            Pricing for Owners
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500">
            Start free for 14 days. No credit card required. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white rounded-full border border-slate-200 p-1 shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${!annual ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-all ${annual ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
            >
              Annual
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${annual ? "bg-orange-400 text-white" : "bg-orange-100 text-orange-600"}`}>
                Save 20%
              </span>
            </button>
          </div>
          {annual && (
            <p className="mt-3 text-sm text-emerald-600 font-medium">
              🎉 You save 2 months free on annual billing
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {MONTHLY.map((plan) => {
            const displayPrice = annual ? plan.annualPrice : plan.price;
            const period = annual ? "/mo, billed yearly" : "/month";
            return (
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
                      {annual && (
                        <span className={`text-base line-through mr-1 ${plan.highlighted ? "text-violet-300" : "text-slate-300"}`}>
                          ₹{plan.price}
                        </span>
                      )}
                      <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                        ₹{displayPrice}
                      </span>
                      <span className={`text-sm ${plan.highlighted ? "text-violet-200" : "text-slate-400"}`}>
                        {period}
                      </span>
                    </div>
                    {annual && (
                      <p className={`mt-1 text-xs font-semibold ${plan.highlighted ? "text-violet-200" : "text-emerald-600"}`}>
                        ₹{displayPrice * 12}/yr · saves ₹{(plan.price - plan.annualPrice) * 12}
                      </p>
                    )}
                    <p className={`mt-2 text-sm ${plan.highlighted ? "text-violet-200" : "text-slate-500"}`}>
                      {plan.desc}
                    </p>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <Check
                          size={16} strokeWidth={2}
                          className={plan.highlighted ? "text-violet-300 shrink-0" : "text-violet-600 shrink-0"}
                        />
                        <span className={`text-sm ${plan.highlighted ? "text-violet-100" : "text-slate-600"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.cta === "Contact Sales" ? "mailto:sales@shiftproof.app" : "/#pricing"}
                    className={`flex items-center justify-center gap-2 w-full rounded-full py-3 text-center text-sm font-semibold transition-all hover:scale-105 ${
                      plan.highlighted
                        ? "bg-white text-violet-700 hover:bg-violet-50"
                        : "bg-violet-600 text-white hover:bg-violet-700"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={14} strokeWidth={2} />
                  </a>
                </div>
              </Tilt3D>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          {["✓ 14-day free trial", "✓ No credit card required", "✓ Cancel anytime", "✓ Data export on cancellation"].map(t => (
            <span key={t} className="font-medium">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

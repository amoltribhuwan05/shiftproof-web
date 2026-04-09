"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is ShiftProof free for tenants?",
    a: "Yes! Tenants can download ShiftProof and use all tenant-facing features — finding PGs, paying rent, tracking history, and submitting maintenance requests — completely free of charge. Only property owners pay for a subscription.",
  },
  {
    q: "How many properties can I manage on the free trial?",
    a: "During the 14-day free trial you get access to full Pro plan features — including up to 5 properties and 50 tenants. No credit card is required to start.",
  },
  {
    q: "What payment methods are supported for rent?",
    a: "Tenants can pay rent via UPI (GPay, PhonePe, Paytm), debit/credit cards, and net banking. Payments are processed securely and confirmed instantly within the app.",
  },
  {
    q: "Can I manage both PGs and individual flat rentals?",
    a: "Absolutely. ShiftProof supports both shared PG rooms (with bed-level tracking) and full flat/apartment rentals. You configure each property type independently.",
  },
  {
    q: "How secure is my rent and tenant data?",
    a: "All data is encrypted in transit (TLS 1.3) and at rest. Rent payments are processed via RBI-compliant payment gateways — we never store card or UPI credentials. Your tenant data is yours: you can export or delete it at any time.",
  },
  {
    q: "How are maintenance requests handled?",
    a: "Tenants submit requests with a description and optional photo from within the app. Owners receive a notification, can update the status (In Progress / Resolved), and tenants are notified at each stage.",
  },
  {
    q: "Can I export rent reports for accounting?",
    a: "Yes. Pro and Business plan owners can export payout reports as CSV or PDF for any custom date range. This is perfect for sharing with your CA at tax time.",
  },
  {
    q: "What happens if a tenant doesn't pay on time?",
    a: "ShiftProof automatically marks overdue payments and sends reminders to tenants via push notification and in-app alerts. Owners also see overdue amounts prominently in their dashboard.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700 mb-4">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            Common questions, answered
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-base font-semibold text-slate-900 pr-4">
                  {item.q}
                </span>
                <span className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${open === i ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-400"}`}>
                  <ChevronDown
                    size={16} strokeWidth={2}
                    className={`transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">
            Still have questions?{" "}
            <a href="mailto:support@shiftproof.app" className="font-semibold text-violet-600 hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

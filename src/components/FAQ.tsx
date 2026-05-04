"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is ShiftProof really free for tenants?",
    a: "Yes. Tenants never pay us — not a rupee, not ever. Only property owners subscribe.",
  },
  {
    q: "What does the free trial include?",
    a: "14 days of full Growth plan access — up to 5 properties and 50 tenants. No card required.",
  },
  {
    q: "How do tenants pay rent?",
    a: "UPI (GPay, PhonePe, Paytm), debit or credit card, or net banking. Every payment is confirmed instantly in the app.",
  },
  {
    q: "Can I manage flats and PGs together?",
    a: "Yes. ShiftProof handles shared PG rooms (with bed-level tracking) and full flat rentals. Configure each property independently.",
  },
  {
    q: "Is my data safe?",
    a: "All data is encrypted in transit (TLS 1.3) and at rest. Payments run through RBI-compliant gateways — we never store your card or UPI details. Export or delete your data anytime.",
  },
  {
    q: "What happens if a tenant pays late?",
    a: "ShiftProof marks the payment overdue and sends reminders automatically — push notification first, then in-app. You see overdue amounts front-and-centre on your dashboard.",
  },
  {
    q: "Can I export reports for my CA?",
    a: "Yes. Growth and Enterprise owners export payout reports as CSV or PDF for any date range. Clean, tax-ready, 10 seconds.",
  },
  {
    q: "What if I cancel?",
    a: "You keep access until the end of your billing cycle, then your account goes read-only. You can export everything anytime. No lock-in.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(2);

  return (
    <section id="faq" className="py-14 sm:py-20 border-t border-[color:var(--line)]">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">

        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-[color:var(--foreground)]">
            Questions,
            <br />
            <span className="text-[color:var(--accent-500)]">straight answers.</span>
          </h2>
        </div>

        <div className="rounded-3xl bg-white border border-[color:var(--line)] overflow-hidden divide-y divide-[color:var(--line)]">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  className="flex w-full items-center gap-4 px-6 py-5 text-left min-h-[72px]"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="flex-1 text-base font-medium text-[color:var(--foreground)]">
                    {item.q}
                  </span>
                  <span
                    className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center transition-colors ${
                      isOpen
                        ? "bg-[color:var(--foreground)] text-white rotate-180"
                        : "bg-[color:var(--background)] text-[color:var(--muted)]"
                    }`}
                    aria-hidden
                  >
                    <ChevronDown size={18} strokeWidth={2} />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6">
                    <p className="text-base text-[color:var(--muted)] leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-[color:var(--muted)]">
          Still have questions?{" "}
          <a
            href="mailto:support@shiftproof.in"
            className="text-[color:var(--foreground)] underline underline-offset-2 hover:text-[color:var(--accent-500)] transition-colors"
          >
            Email us
          </a>
        </p>
      </div>
    </section>
  );
}

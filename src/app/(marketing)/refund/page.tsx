import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — ShiftProof",
  description: "ShiftProof's refund and cancellation policy for owner subscriptions.",
};

const LAST_UPDATED = "April 1, 2026";

const refundMatrix = [
  { scenario: "Cancel within 24 hours of first subscription payment", eligibility: "Full refund", type: "full" },
  { scenario: "Cancel within 7 days of renewal (annual plan)", eligibility: "Pro-rated refund for unused months", type: "partial" },
  { scenario: "Cancel after 7 days of renewal (annual plan)", eligibility: "No refund; access continues till end of period", type: "none" },
  { scenario: "Cancel a monthly plan at any time", eligibility: "No refund; access continues till end of billing month", type: "none" },
  { scenario: "Accidental double-charge by payment processor", eligibility: "Full refund of duplicate amount within 5 business days", type: "full" },
  { scenario: "Service unavailable for 48+ consecutive hours", eligibility: "Pro-rated credit for downtime, or refund if requested", type: "partial" },
  { scenario: "Account suspended for Terms violation", eligibility: "No refund", type: "none" },
  { scenario: "Tenant account (free tier)", eligibility: "Not applicable — tenants pay nothing", type: "na" },
];

const typeConfig = {
  full:    { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Full Refund" },
  partial: { icon: AlertCircle,  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   label: "Partial / Credit" },
  none:    { icon: XCircle,      color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200",    label: "No Refund" },
  na:      { icon: CheckCircle2, color: "text-slate-400",   bg: "bg-[color:var(--background)]",   border: "border-slate-200",   label: "N/A" },
};

export default function RefundPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-accent-700 pt-28 pb-14 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl text-white mb-4">Refund &amp; Cancellation Policy</h1>
          <p className="text-accent-200/80 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">

        {/* Quick summary callout */}
        <div className="mb-10 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <p className="text-sm font-bold text-emerald-900 mb-1">Key Points</p>
          <ul className="text-sm text-emerald-800 space-y-1.5 mt-2">
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" /> Tenants always use ShiftProof free — no charges, no refunds needed</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" /> Full refund within 24 hours of first subscription payment</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" /> Annual plan: pro-rated refund if cancelled within 7 days of renewal</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" /> Monthly plan: no refund — access continues to end of billing period</li>
          </ul>
        </div>

        {/* Section 1 */}
        <div id="scope" className="scroll-mt-24 mb-12">
          <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--background)]">1. Scope</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This policy applies only to Owner subscription payments made to ShiftProof Technologies Pvt. Ltd. Tenant accounts are free and therefore not subject to any refund provisions. Rent payments collected from tenants by owners through the platform are not refundable by ShiftProof — any rent disputes must be resolved directly between the Owner and Tenant.
          </p>
        </div>

        {/* Section 2 — matrix */}
        <div id="matrix" className="scroll-mt-24 mb-12">
          <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-6 pb-2 border-b border-[color:var(--background)]">2. Refund Eligibility Matrix</h2>
          <div className="space-y-3">
            {refundMatrix.map((row) => {
              const cfg = typeConfig[row.type as keyof typeof typeConfig];
              const Icon = cfg.icon;
              return (
                <div key={row.scenario} className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                  <Icon size={18} className={`${cfg.color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{row.scenario}</p>
                    <p className={`text-sm mt-0.5 ${cfg.color} font-medium`}>{row.eligibility}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3 */}
        <div id="process" className="scroll-mt-24 mb-12">
          <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--background)]">3. How to Request a Refund</h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Email us", body: "Send your refund request to billing@shiftproof.app with the subject line \"Refund Request — [your registered email]\"." },
              { step: "02", title: "Include details", body: "Attach your payment receipt, transaction ID, and reason for the refund request." },
              { step: "03", title: "We'll review", body: "We will acknowledge your request within 2 business days and make a decision within 7 business days." },
              { step: "04", title: "Credit processed", body: "Approved refunds are returned to the original payment method within 5–10 business days, depending on your bank or payment provider." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 p-4 rounded-xl bg-[color:var(--background)] border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center text-xs text-accent-600 shrink-0">{s.step}</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{s.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 */}
        <div id="non-refundable" className="scroll-mt-24 mb-12">
          <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--background)]">4. Non-Refundable Items</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {[
              "Setup fees or onboarding assistance charges (if any)",
              "SMS notification top-up credits (consumed credits are non-refundable)",
              "Custom integrations or professional services",
              "Subscription fees for months already consumed",
              "Payments made outside the ShiftProof platform directly between Owner and Tenant",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 5 */}
        <div id="consumer-rights" className="scroll-mt-24 mb-12">
          <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--background)]">5. Consumer Rights</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Nothing in this policy limits your statutory rights under the Consumer Protection Act, 2019. If you believe we have acted unfairly, you may lodge a complaint with the National Consumer Helpline (1800-11-4000) or approach the appropriate Consumer Disputes Redressal Forum in your jurisdiction.
          </p>
        </div>

        {/* Section 6 */}
        <div id="contact-billing" className="scroll-mt-24 mb-12">
          <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--background)]">6. Contact for Billing Queries</h2>
          <div className="p-5 rounded-2xl bg-[color:var(--background)] border border-slate-200 space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-800">Email:</span> billing@shiftproof.app</p>
            <p><span className="font-semibold text-slate-800">Phone:</span> +91 80 4567 8900 (Mon–Fri, 10 AM – 6 PM IST)</p>
            <p><span className="font-semibold text-slate-800">Response time:</span> Within 2 business days</p>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/privacy" className="font-semibold text-accent-500 hover:underline">Privacy Policy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/terms" className="font-semibold text-accent-500 hover:underline">Terms of Service</Link>
            <span className="text-slate-300">·</span>
            <Link href="/contact" className="font-semibold text-accent-500 hover:underline">Contact Us</Link>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">← Back to ShiftProof</Link>
        </div>
      </div>
    </div>
  );
}

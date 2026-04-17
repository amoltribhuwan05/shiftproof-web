import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Mail, Phone, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center — ShiftProof",
  description: "Find answers to common questions about ShiftProof for owners and tenants.",
};

type Article = { q: string; a: string };
type Category = {
  id: string;
  title: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  articles: Article[];
};

const categories: Category[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    color: "text-accent-600",
    bg: "bg-accent-50",
    border: "border-accent-200",
    articles: [
      {
        q: "How do I create an owner account?",
        a: "Download the ShiftProof Android app from Google Play and tap 'Sign up as Owner'. You will be guided through email verification, business details, and adding your first property. No credit card is needed for the 14-day free trial.",
      },
      {
        q: "Is ShiftProof free for tenants?",
        a: "Yes. Tenants always use ShiftProof completely free — no subscription, no hidden charges. Your owner must be a ShiftProof subscriber for you to join their property.",
      },
      {
        q: "How do I add a property to my account?",
        a: "After signing in, go to Dashboard → Properties → Add Property. Fill in the address, number of rooms, and upload photos. You can publish a listing on Find-a-PG immediately or keep it private.",
      },
      {
        q: "How do tenants join my property on ShiftProof?",
        a: "Go to your property, open the tenant you want to invite, and tap 'Send Invite'. They will receive a WhatsApp/SMS link that lets them register or log in and link to your property — no manual data entry needed.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Billing",
    icon: "💳",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    articles: [
      {
        q: "How are rent payments processed?",
        a: "ShiftProof uses Razorpay to process UPI and card payments. When a tenant pays, the amount is transferred to the owner's linked bank account after Razorpay's standard settlement period (typically T+1 for UPI).",
      },
      {
        q: "What payment methods do tenants support?",
        a: "Tenants can pay via any UPI app (GPay, PhonePe, Paytm, BHIM, etc.), debit card, net banking, or credit card. UPI is fastest and has zero additional fees.",
      },
      {
        q: "How do I change or cancel my subscription?",
        a: "Go to Settings → Subscription → Manage Plan. You can upgrade, downgrade, or cancel at any time. Cancellation takes effect at the end of your current billing period. Review our Refund Policy for details on pro-rated refunds.",
      },
      {
        q: "Can I get a receipt or GST invoice?",
        a: "Yes. Go to Settings → Billing → Invoices. GST invoices are auto-generated for all subscription payments. You can download them as PDF for your records.",
      },
    ],
  },
  {
    id: "rent-management",
    title: "Rent Management",
    icon: "🏠",
    color: "text-accent-600",
    bg: "bg-accent-50",
    border: "border-accent-200",
    articles: [
      {
        q: "How do I set a rent due date?",
        a: "When adding or editing a tenant, choose their 'Rent Due Day' (1st through 28th of the month). ShiftProof sends automatic reminders to the tenant 5 days and 1 day before the due date.",
      },
      {
        q: "What happens if a tenant misses the rent due date?",
        a: "ShiftProof marks the payment as overdue and sends a reminder to the tenant. You can also see overdue payments highlighted in your dashboard. Late fee rules (if set) are automatically applied.",
      },
      {
        q: "Can I record cash payments on ShiftProof?",
        a: "Yes. Go to the tenant's rent ledger and tap 'Record Offline Payment'. Select Cash or Bank Transfer, enter the amount and date. This keeps your ledger accurate even for payments made outside the app.",
      },
      {
        q: "How do I generate a rent receipt?",
        a: "Every payment — online or manually recorded — automatically generates a rent receipt. Go to Tenant → Payments → View Receipt to download it as PDF. Receipts include your company name, tenant name, property address, amount, and GST if applicable.",
      },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    icon: "🔧",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    articles: [
      {
        q: "How do tenants raise a maintenance request?",
        a: "Tenants tap the 'Maintenance' tab, describe the issue, and optionally attach photos. The request is immediately visible in your owner dashboard with the room number and category (plumbing, electrical, etc.).",
      },
      {
        q: "Can I assign requests to a technician?",
        a: "Yes. Open a maintenance request and tap 'Assign'. You can enter a technician's name and phone number. Both you and the tenant will see the assignment status in the timeline.",
      },
      {
        q: "How do I close a maintenance request?",
        a: "Once the issue is resolved, open the request and tap 'Mark Resolved'. The tenant receives a notification and can confirm or re-open if the issue persists. All state changes are timestamped.",
      },
    ],
  },
  {
    id: "agreements",
    title: "Agreements & Documents",
    icon: "📄",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    articles: [
      {
        q: "Can I create a rent agreement on ShiftProof?",
        a: "Yes. ShiftProof provides a customisable rent agreement template compliant with Indian tenancy law. Go to Tenant → Documents → Create Agreement. Fill in the details and both parties can sign digitally via OTP-based e-signature.",
      },
      {
        q: "Are digital signatures legally valid in India?",
        a: "OTP-based e-signatures are valid under the Information Technology Act, 2000 for most tenancy agreements. For stamp duty purposes, you may need to print and stamp the agreement in your state. We display state-specific guidance inside the app.",
      },
      {
        q: "Where are my documents stored?",
        a: "Documents are stored encrypted on AWS Mumbai region servers. You can download them anytime. We retain documents for 2 years after account deletion as per our Privacy Policy.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Security",
    icon: "🔐",
    color: "text-slate-700",
    bg: "bg-[color:var(--background)]",
    border: "border-slate-200",
    articles: [
      {
        q: "How do I reset my password?",
        a: "On the login screen, tap 'Forgot password?'. Enter your registered email or mobile number and follow the OTP verification steps. You can then set a new password.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account → Delete Account. Your data will be deleted within 30 days, subject to retention requirements for financial records under Indian law (7 years for payment records).",
      },
      {
        q: "Is my data safe?",
        a: "All data is transmitted over TLS 1.3. Sensitive documents are encrypted at rest using AES-256. Passwords are hashed with bcrypt. We never store card numbers or full UPI credentials. See our Privacy Policy for full details.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent-700 via-accent-700 to-accent-700 pt-28 pb-16 px-4">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%"><defs><pattern id="hc-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#hc-dots)"/></svg>
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-accent-200 mb-5">
            Help Center
          </span>
          <h1 className="text-3xl sm:text-4xl text-white mb-4">How can we help?</h1>
          <p className="text-accent-200/80 text-sm mb-8">
            Browse answers below, or contact us directly if you need more help.
          </p>
          {/* Static search placeholder — no JS filtering needed for basic help page */}
          <div className="relative max-w-md mx-auto">
            <input
              type="search"
              placeholder="Search help articles…"
              className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-accent-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-200" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">

        {/* Category nav pills */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-accent-200 hover:text-accent-500 transition-colors"
            >
              <span>{cat.icon}</span> {cat.title}
            </a>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-14 mb-16">
          {categories.map((cat) => (
            <div key={cat.id} id={cat.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-2xl ${cat.bg} border ${cat.border} flex items-center justify-center text-lg`}>
                  {cat.icon}
                </div>
                <h2 className={`text-lg font-bold ${cat.color}`}>{cat.title}</h2>
              </div>
              <div className="divide-y divide-[color:var(--background)] border border-slate-200 rounded-2xl overflow-hidden">
                {cat.articles.map((article, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-[color:var(--background)] transition-colors list-none">
                      <span className="text-sm font-semibold text-slate-800">{article.q}</span>
                      <ChevronRight size={14} className="text-slate-400 shrink-0 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-5 pb-5 pt-1">
                      <p className="text-sm text-slate-600 leading-relaxed">{article.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div className="rounded-3xl bg-gradient-to-br from-[color:var(--background)] to-[color:var(--background)] border border-slate-200 p-8 mb-4">
          <div className="text-center mb-8">
            <h2 className="text-xl text-[color:var(--foreground)] mb-2">Still need help?</h2>
            <p className="text-sm text-slate-500">Our support team is online Monday – Friday, 10 AM – 6 PM IST.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <a href="mailto:support@shiftproof.app" className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border border-slate-200 hover:border-accent-200 hover:shadow-sm transition-all text-center">
              <Mail size={20} className="text-accent-500" />
              <p className="text-sm font-bold text-slate-800">Email</p>
              <p className="text-xs text-slate-400">support@shiftproof.app</p>
            </a>
            <a href="tel:+918045678900" className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border border-slate-200 hover:border-accent-200 hover:shadow-sm transition-all text-center">
              <Phone size={20} className="text-emerald-600" />
              <p className="text-sm font-bold text-slate-800">Phone</p>
              <p className="text-xs text-slate-400">+91 80 4567 8900</p>
            </a>
            <Link href="/contact" className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border border-slate-200 hover:border-accent-200 hover:shadow-sm transition-all text-center">
              <MessageSquare size={20} className="text-accent-500" />
              <p className="text-sm font-bold text-slate-800">Contact Form</p>
              <p className="text-xs text-slate-400">We reply in 2 business days</p>
            </Link>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/privacy" className="font-semibold text-accent-500 hover:underline">Privacy Policy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/terms" className="font-semibold text-accent-500 hover:underline">Terms of Service</Link>
            <span className="text-slate-300">·</span>
            <Link href="/refund" className="font-semibold text-accent-500 hover:underline">Refund Policy</Link>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">← Back to ShiftProof</Link>
        </div>
      </div>
    </div>
  );
}

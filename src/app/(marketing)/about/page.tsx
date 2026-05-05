import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Heart, Users, Building2, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — ShiftProof",
  description: "Learn about ShiftProof, our mission to modernise PG management in India, and the team behind it.",
};

const values = [
  {
    icon: Shield,
    title: "Trust First",
    description: "Every feature is designed to create verifiable proof — rent paid, maintenance done, lease agreed. No disputes, just records.",
    color: "text-accent-500",
    bg: "bg-accent-50",
    border: "border-accent-100",
  },
  {
    icon: Zap,
    title: "Tenant-First Pricing",
    description: "Tenants always use ShiftProof free. We believe the burden of modern tools should never fall on someone already paying rent.",
    color: "text-accent-500",
    bg: "bg-accent-50",
    border: "border-accent-100",
  },
  {
    icon: Heart,
    title: "Made for Bharat",
    description: "Built by an Indian team, for Indian housing realities — UPI-first, multi-language, local compliance baked in.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Users,
    title: "Community",
    description: "We actively listen to owners and tenants across tier-1 and tier-2 cities. Real feedback shapes every release.",
    color: "text-accent-500",
    bg: "bg-accent-50",
    border: "border-accent-100",
  },
];

const milestones = [
  { year: "2023", event: "Founded in Bengaluru by two engineers tired of rent receipt WhatsApp groups." },
  { year: "Q1 2024", event: "Incorporated as ShiftProof Technologies Pvt. Ltd. (CIN: U72900KA2024PTC180000)." },
  { year: "Q2 2024", event: "Launched closed beta with 40 PG owners across Bengaluru and Hyderabad." },
  { year: "Q3 2024", event: "Integrated Razorpay for in-app UPI rent collection. Processed ₹1 Cr in first month." },
  { year: "Q4 2024", event: "Expanded to Pune, Chennai, and Delhi NCR. Crossed 500 owner subscribers." },
  { year: "2025", event: "Launched Find-a-PG listing marketplace. Passed ₹5 Cr ARR milestone." },
  { year: "2026", event: "Onboarded 2,000+ owners and 18,000+ tenants. Expanding to 10 more cities." },
];

const team = [
  {
    name: "Arjun Sharma",
    role: "Co-founder & CEO",
    bio: "Ex-Razorpay, IIT Bombay. Spent 4 years building payment infrastructure before betting on PG management.",
    avatar: "AS",
  },
  {
    name: "Priya Nair",
    role: "Co-founder & CTO",
    bio: "Ex-Freshworks, NIT Trichy. Brings deep SaaS architecture experience and a mission to modernise Indian real estate.",
    avatar: "PN",
  },
  {
    name: "Rahul Kumar",
    role: "Head of Product",
    bio: "Ex-MakeMyTrip, MDI Gurgaon. Led consumer product at scale; now building tools that actually serve both sides of the rental market.",
    avatar: "RK",
  },
  {
    name: "Sneha Rao",
    role: "Head of Growth",
    bio: "Ex-NoBroker. Understands what makes PG owners adopt new software — and what kills adoption before day three.",
    avatar: "SR",
  },
];

const stats = [
  { value: "2,000+", label: "Active owners", icon: Building2 },
  { value: "18,000+", label: "Tenants served", icon: Users },
  { value: "₹5 Cr+", label: "ARR (2025)", icon: TrendingUp },
  { value: "12", label: "Cities live", icon: Shield },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-accent-700 pt-28 pb-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-white mb-6">
            We are fixing how <span className="text-accent-300">India rents</span>
          </h1>
          <p className="text-accent-200/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            ShiftProof was born from a simple frustration: rent receipt screenshots on WhatsApp, security deposits paid in cash, maintenance requests lost in group chats. We built the infrastructure that was always missing.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="p-6 rounded-2xl bg-[color:var(--background)] border border-slate-200 text-center">
                <Icon size={20} className="mx-auto text-accent-500 mb-3" />
                <p className="text-2xl text-[color:var(--foreground)]">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Mission */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-accent-500 mb-3 block">Our Mission</span>
              <h2 className="text-2xl sm:text-3xl text-[color:var(--foreground)] mb-6 leading-snug">
                Make every rental relationship provably fair
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                India has over 40 million paying-guest accommodations. Yet most are still managed through handwritten receipts, cash payments, and verbal agreements — leaving both owners and tenants exposed to disputes.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                ShiftProof creates a verified paper trail for every transaction, agreement, and communication — so neither side ever needs to wonder "did they pay?" or "did I confirm that?"
              </p>
              <Link
                href="/find-pg"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-500 hover:text-accent-600"
              >
                Browse PG listings <ArrowRight size={14} />
              </Link>
            </div>
            <div className="rounded-3xl bg-accent-50 border border-accent-100 p-8">
              <blockquote className="text-sm text-slate-700 leading-relaxed italic mb-6">
                "I used to spend the 5th of every month chasing 20 tenants for rent confirmations. ShiftProof made that a non-problem. Everything is recorded, every payment auto-confirmed."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-sm font-bold">VK</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Vikram Khanna</p>
                  <p className="text-xs text-slate-500">Owner, 3 PGs in Bengaluru</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wide text-accent-500 mb-3 block">What We Stand For</span>
            <h2 className="text-2xl sm:text-3xl text-[color:var(--foreground)]">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className={`p-6 rounded-2xl border ${v.border} ${v.bg}`}>
                  {i % 2 === 0 ? (
                    <div className={`w-10 h-10 rounded-xl ${v.bg} border ${v.border} flex items-center justify-center mb-4`}>
                      <Icon size={20} className={v.color} />
                    </div>
                  ) : (
                    <div className={`mb-4 ${v.color}`}>
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                  )}
                  <h3 className="text-base font-bold text-[color:var(--foreground)] mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wide text-accent-500 mb-3 block">Journey</span>
            <h2 className="text-2xl sm:text-3xl text-[color:var(--foreground)]">From idea to infrastructure</h2>
          </div>
          <div className="relative pl-6 border-l-2 border-accent-100 space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[29px] w-5 h-5 rounded-full bg-white border-2 border-accent-200 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent-500" />
                </div>
                <p className="text-xs font-bold text-accent-500 mb-1">{m.year}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{m.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wide text-accent-500 mb-3 block">The Team</span>
            <h2 className="text-2xl sm:text-3xl text-[color:var(--foreground)]">People behind ShiftProof</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {team.map((t) => (
              <div key={t.name} className="flex gap-4 p-5 rounded-2xl border border-slate-200 hover:border-accent-200 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 flex items-center justify-center text-sm font-semibold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-[color:var(--foreground)]">{t.name}</p>
                  <p className="text-xs text-accent-500 font-medium mb-2">{t.role}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-accent-700 p-10 text-center">
          <h2 className="text-2xl sm:text-3xl text-white mb-4">14 days free. No card required.</h2>
          <p className="text-accent-200/80 text-sm mb-8 max-w-md mx-auto">
            Whether you manage 1 PG or 10, ShiftProof runs the operations so you don&rsquo;t have to.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 hover:bg-accent-600 px-7 py-3 text-sm font-bold text-white transition-colors">
              Try it free <ArrowRight size={14} />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-7 py-3 text-sm font-semibold text-white transition-colors">
              Contact us
            </Link>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/contact" className="font-semibold text-accent-500 hover:underline">Contact</Link>
            <span className="text-slate-300">·</span>
            <Link href="/privacy" className="font-semibold text-accent-500 hover:underline">Privacy Policy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/terms" className="font-semibold text-accent-500 hover:underline">Terms</Link>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">← Back to ShiftProof</Link>
        </div>
      </div>
    </div>
  );
}

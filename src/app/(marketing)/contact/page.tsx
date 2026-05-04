"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageSquare, Building2, HelpCircle, ArrowRight } from "lucide-react";

const contactChannels = [
  {
    icon: Mail,
    title: "General Enquiries",
    value: "support@shiftproof.in",
    sub: "We reply within 2 business days",
    href: "mailto:support@shiftproof.in",
    color: "text-accent-500",
    bg: "bg-accent-50",
    border: "border-accent-100",
  },
  {
    icon: Building2,
    title: "Billing & Subscriptions",
    value: "billing@shiftproof.in",
    sub: "For refunds, invoice, plan changes",
    href: "mailto:billing@shiftproof.in",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: MessageSquare,
    title: "Legal & Compliance",
    value: "legal@shiftproof.in",
    sub: "Privacy, data requests, ToS queries",
    href: "mailto:legal@shiftproof.in",
    color: "text-accent-500",
    bg: "bg-accent-50",
    border: "border-accent-100",
  },
  {
    icon: HelpCircle,
    title: "Press & Partnerships",
    value: "hello@shiftproof.in",
    sub: "Media kit, co-marketing, integrations",
    href: "mailto:hello@shiftproof.in",
    color: "text-accent-500",
    bg: "bg-accent-50",
    border: "border-accent-100",
  },
];

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<FormState>("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    // Simulate network delay — replace with actual API call
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-[#1A1A18] pt-28 pb-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl sm:text-4xl text-white mb-4">Get in touch</h1>
          <p className="text-slate-300/80 text-sm">
            Whether you have a question about features, pricing, or just need a hand getting started — we are here.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Left — contact info */}
          <div>
            <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-6">Reach us directly</h2>

            <div className="space-y-4 mb-10">
              {contactChannels.map((c, ci) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.title}
                    href={c.href}
                    className={`flex items-start gap-4 p-4 rounded-2xl border ${c.border} ${c.bg} hover:shadow-sm transition-shadow group`}
                  >
                    {ci % 2 === 0 ? (
                      <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                        <Icon size={16} className={c.color} />
                      </div>
                    ) : (
                      <div className={`shrink-0 pt-0.5 ${c.color}`}>
                        <Icon size={18} strokeWidth={1.5} />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.title}</p>
                      <p className={`text-sm font-bold ${c.color} group-hover:underline`}>{c.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Office */}
            <div className="p-5 rounded-2xl bg-[color:var(--background)] border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Office</h3>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <span>#42, 3rd Floor, Koramangala 4th Block,<br />Bengaluru, Karnataka — 560034</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <a href="tel:+918045678900" className="hover:text-accent-500">+91 80 4567 8900</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Clock size={14} className="text-slate-400 shrink-0" />
                <span>Mon – Fri, 10 AM – 6 PM IST</span>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-6">Send us a message</h2>

            {status === "success" ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-base font-bold text-emerald-900 mb-2">Message received!</p>
                <p className="text-sm text-emerald-700">We will get back to you at <span className="font-semibold">{form.email}</span> within 2 business days.</p>
                <button
                  onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">Full name <span className="text-rose-500">*</span></label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Ravi Kumar"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[color:var(--foreground)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email address <span className="text-rose-500">*</span></label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="ravi@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[color:var(--foreground)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-slate-700 mb-1.5">I am a…</label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Select one</option>
                    <option value="owner">PG / Property owner</option>
                    <option value="tenant">Tenant looking for PG</option>
                    <option value="press">Press / Media</option>
                    <option value="partner">Partnership enquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-slate-700 mb-1.5">Message <span className="text-rose-500">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help…"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[color:var(--foreground)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-60 px-6 py-3 text-sm font-bold text-white transition-colors shadow-sm"
                >
                  {status === "submitting" ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="30" strokeLinecap="round"/></svg>
                      Sending…
                    </>
                  ) : (
                    <>Send message <ArrowRight size={14} /></>
                  )}
                </button>
                <p className="text-xs text-slate-400 text-center">
                  By submitting this form you agree to our{" "}
                  <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/help" className="font-semibold text-accent-500 hover:underline">Help Center</Link>
            <span className="text-slate-300">·</span>
            <Link href="/privacy" className="font-semibold text-accent-500 hover:underline">Privacy Policy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/terms" className="font-semibold text-accent-500 hover:underline">Terms of Service</Link>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">← Back to ShiftProof</Link>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — ShiftProof",
  description: "Terms and conditions governing your use of ShiftProof.",
};

const LAST_UPDATED = "April 1, 2026";
const EFFECTIVE_DATE = "April 1, 2026";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By downloading, installing, or using the ShiftProof application or website ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.

These Terms constitute a legally binding agreement between you and ShiftProof Technologies Pvt. Ltd. (CIN: U72900KA2024PTC180000), a company incorporated under the Companies Act, 2013, with its registered office at #42, 3rd Floor, Koramangala 4th Block, Bengaluru, Karnataka — 560034.`,
  },
  {
    id: "definitions",
    title: "2. Definitions",
    content: `• "Owner" means a property owner or manager who subscribes to ShiftProof to manage PG accommodations or rental properties
• "Tenant" means a person who uses ShiftProof to find, join, or manage a rental accommodation
• "Listing" means a property advertisement published by an Owner on the ShiftProof platform
• "Subscription" means an Owner's paid access to ShiftProof's management features
• "Platform" means the ShiftProof Android app and the website shiftproof.app
• "Content" means any text, images, data, or other material uploaded to or generated on the Platform`,
  },
  {
    id: "accounts",
    title: "3. Accounts & Registration",
    content: `3.1 You must provide accurate, complete, and current information when creating an account.

3.2 You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account.

3.3 You must immediately notify us at support@shiftproof.app if you suspect unauthorized use of your account.

3.4 You may not create more than one personal account. Owners may have one account linked to multiple properties.

3.5 We reserve the right to suspend or terminate accounts that violate these Terms, provide false information, or engage in fraudulent activity.

3.6 Accounts are non-transferable.`,
  },
  {
    id: "owner-obligations",
    title: "4. Owner Obligations",
    content: `As an Owner, you agree to:
• Provide accurate and truthful property information, photos, and pricing
• Not publish listings for properties you do not own or have authority to manage
• Comply with all applicable local laws regarding PG accommodation, including state-specific PG regulations, fire safety standards, and municipal requirements
• Collect rent and manage tenants in compliance with the Rent Control Act applicable in your state
• Not discriminate against tenants on grounds of religion, caste, gender, or other protected characteristics
• Maintain the property in a habitable condition and respond to maintenance requests within a reasonable time
• Not use ShiftProof to harass, intimidate, or illegally evict tenants
• Accurately represent amenities, facilities, and house rules in listings`,
  },
  {
    id: "tenant-obligations",
    title: "5. Tenant Obligations",
    content: `As a Tenant, you agree to:
• Provide accurate personal and identity information during onboarding
• Pay rent by the due date as agreed with your Owner
• Not sublet or share your accommodation without the Owner's written consent
• Respect house rules published by the Owner
• Submit maintenance requests for genuine issues only
• Not damage property or common areas
• Comply with applicable tenancy laws in your state`,
  },
  {
    id: "payments",
    title: "6. Payments & Billing",
    content: `6.1 Owner Subscriptions: Subscription fees are charged monthly or annually as selected. Fees are in Indian Rupees (INR) inclusive of GST at the applicable rate.

6.2 Free Trial: New Owners receive a 14-day free trial with full Pro plan access. No credit card is required. After the trial, you must subscribe to continue using paid features.

6.3 Auto-renewal: Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.

6.4 Rent Payments by Tenants: ShiftProof facilitates rent collection between Owners and Tenants. We act as a payment aggregator and are not liable for disputes between parties regarding the amount or timing of payments.

6.5 Payment Processing: Payments are processed by our payment partner (Razorpay). By making a payment, you also agree to Razorpay's terms of service.

6.6 Taxes: You are responsible for any taxes applicable to your use of the Service, including GST on subscription fees.`,
  },
  {
    id: "prohibited",
    title: "7. Prohibited Activities",
    content: `You must not:
• Post false, misleading, or fraudulent listings
• Use the Platform to facilitate money laundering or any illegal financial activity
• Attempt to access another user's account without authorization
• Reverse-engineer, decompile, or disassemble any part of the Service
• Scrape, crawl, or extract data from the Platform without written permission
• Use the Platform to send unsolicited commercial messages (spam)
• Upload malware, viruses, or harmful code
• Impersonate another person or entity
• Use the Platform for any purpose that violates Indian law, including the IT Act, PMLA, RERA, or state tenancy laws`,
  },
  {
    id: "ip",
    title: "8. Intellectual Property",
    content: `8.1 The ShiftProof name, logo, app, website, and all associated content are the exclusive intellectual property of ShiftProof Technologies Pvt. Ltd. protected under Indian copyright, trademark, and IT laws.

8.2 You retain ownership of content you upload (listings, photos, documents). By uploading content, you grant ShiftProof a non-exclusive, royalty-free, worldwide licence to use, display, and process that content solely to provide the Service.

8.3 You must not use our trademarks or branding without written permission.`,
  },
  {
    id: "disclaimers",
    title: "9. Disclaimers",
    content: `9.1 ShiftProof is a technology platform that connects Owners and Tenants. We are not a real estate agent, property manager, or party to any tenancy agreement.

9.2 We do not guarantee the accuracy of listings, the conduct of Owners or Tenants, or the outcome of any tenancy arrangement.

9.3 The Service is provided "as is" without warranties of any kind, express or implied, to the fullest extent permitted by applicable law.

9.4 We do not guarantee uninterrupted or error-free service. We will attempt to provide at least 99.5% uptime for paid plans but do not guarantee this.`,
  },
  {
    id: "liability",
    title: "10. Limitation of Liability",
    content: `To the fullest extent permitted by Indian law:

10.1 ShiftProof's total liability to you for any claim arising from the Service shall not exceed the subscription fees you paid in the three months preceding the claim (or ₹1,000 for tenants, who pay nothing).

10.2 We are not liable for:
• Disputes between Owners and Tenants regarding tenancy agreements, rent, or property condition
• Loss of data due to circumstances outside our control
• Indirect, consequential, special, or punitive damages
• Any loss arising from reliance on user-generated content (listings, profiles)

10.3 Nothing in these Terms excludes liability for death or personal injury caused by our negligence, or for fraud.`,
  },
  {
    id: "termination",
    title: "11. Termination",
    content: `11.1 You may terminate your account at any time by going to Settings → Account → Delete Account, or by emailing support@shiftproof.app.

11.2 We may suspend or terminate your access immediately if you violate these Terms, if required by law, or if you engage in conduct harmful to other users or the Platform.

11.3 On termination, your right to access the Service ends. We will retain your data subject to our Privacy Policy and legal obligations.

11.4 Termination does not entitle you to a refund of unused subscription fees except as set out in our Refund Policy.`,
  },
  {
    id: "governing-law",
    title: "12. Governing Law & Dispute Resolution",
    content: `12.1 These Terms are governed by and construed in accordance with the laws of India.

12.2 Any dispute arising from these Terms shall first be subject to mandatory 30-day good-faith negotiation between the parties.

12.3 If negotiation fails, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator appointed by mutual agreement. The seat of arbitration shall be Bengaluru, Karnataka.

12.4 Courts in Bengaluru, Karnataka shall have exclusive jurisdiction for any matter not subject to arbitration.

12.5 The Consumer Protection Act, 2019 rights of consumers are not affected by this clause.`,
  },
  {
    id: "changes",
    title: "13. Changes to These Terms",
    content: `We may update these Terms from time to time. We will notify you of material changes via in-app notification and email at least 14 days before the new terms take effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.`,
  },
  {
    id: "contact",
    title: "14. Contact",
    content: `ShiftProof Technologies Pvt. Ltd.
#42, 3rd Floor, Koramangala 4th Block, Bengaluru, Karnataka — 560034
Email: legal@shiftproof.app
Phone: +91 80 4567 8900
CIN: U72900KA2024PTC180000
GST: 29AAGCS1234A1Z5`,
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-950 via-[color:var(--foreground)] to-accent-700 pt-28 pb-14 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-slate-200 mb-5">
            Legal
          </span>
          <h1 className="text-3xl sm:text-4xl text-white mb-4">Terms of Service</h1>
          <p className="text-slate-300/80 text-sm">
            Last updated: {LAST_UPDATED} · Effective: {EFFECTIVE_DATE}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">

        {/* Quick nav */}
        <div className="mb-12 p-5 rounded-2xl bg-[color:var(--background)] border border-slate-200">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-[color:var(--background)] transition-colors"
              >
                {s.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>

        {/* Summary callout */}
        <div className="mb-10 p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <p className="text-sm font-bold text-amber-900 mb-1">Plain-English Summary</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            ShiftProof is a platform connecting PG owners and tenants. Owners pay a subscription; tenants use it free. We facilitate payments but are not a party to tenancy agreements. Disputes between owners and tenants are between them. Governing law is India; disputes go to Bengaluru arbitration.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--background)]">
                {s.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/privacy" className="font-semibold text-accent-500 hover:underline">Privacy Policy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/refund" className="font-semibold text-accent-500 hover:underline">Refund Policy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/contact" className="font-semibold text-accent-500 hover:underline">Contact Us</Link>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to ShiftProof
          </Link>
        </div>
      </div>
    </div>
  );
}

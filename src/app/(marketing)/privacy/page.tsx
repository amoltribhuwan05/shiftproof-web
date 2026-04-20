import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — ShiftProof",
  description: "How ShiftProof collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "April 1, 2026";

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    content: `ShiftProof ("we", "us", "our") operates the ShiftProof Android application and this website (shiftproof.app). We are committed to protecting your personal data in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and applicable Indian data protection regulations.

This Privacy Policy explains what data we collect, why we collect it, how we use it, and the choices you have. By using ShiftProof, you agree to the practices described below.`,
  },
  {
    id: "who",
    title: "2. Who This Policy Applies To",
    content: `This policy applies to all users of the ShiftProof platform including:
• Property Owners ("Owners") who subscribe to manage their PGs and rental properties
• Tenants who use ShiftProof free of charge to find, join, and manage their rental life
• Visitors to this website (shiftproof.app) who have not created an account

If you are under 18 years of age, you may not use ShiftProof without the consent of a parent or guardian.`,
  },
  {
    id: "data-collected",
    title: "3. Data We Collect",
    subsections: [
      {
        title: "3.1 Data You Provide Directly",
        content: `• Account registration: full name, email address, mobile number, password (stored hashed)
• Identity verification: government-issued ID (Aadhaar, PAN, passport — stored encrypted)
• Property details: address, property photos, room configuration, pricing
• Tenant onboarding: lease dates, room number, rent amount, deposit details
• Payment details: UPI IDs, transaction IDs (we never store card numbers or full UPI credentials)
• Maintenance requests: issue descriptions and optional photos
• Support communications: emails and in-app messages you send to us`,
      },
      {
        title: "3.2 Data Collected Automatically",
        content: `• Device information: device model, OS version, app version
• Usage data: screens visited, features used, session duration
• Location data: approximate city (for PG search relevance) — only with your permission
• IP address and network type
• Crash logs and performance analytics`,
      },
      {
        title: "3.3 Data From Third Parties",
        content: `• Payment processors (Razorpay / PayU): transaction status and reference IDs
• Google Sign-In (if used): name, email, profile photo
• IP geolocation services: city-level location for PG search pre-fill`,
      },
    ],
  },
  {
    id: "how-we-use",
    title: "4. How We Use Your Data",
    content: `We use your personal data only for the following purposes:
• To provide, maintain, and improve the ShiftProof service
• To process rent payments and send payment confirmations
• To send reminders for upcoming rent due dates and overdue payments
• To notify owners and tenants about maintenance requests and updates
• To verify property and tenant identity for trust and safety
• To generate reports and analytics for property owners
• To respond to support requests and resolve disputes
• To comply with legal obligations under Indian law
• To detect and prevent fraud, abuse, or security incidents

We do not sell, rent, or share your personal data with third parties for marketing purposes.`,
  },
  {
    id: "legal-basis",
    title: "5. Legal Basis for Processing",
    content: `We process your data on the following legal grounds:
• Contractual necessity: to fulfil our service agreement with you
• Legitimate interest: to prevent fraud, improve our services, and maintain security
• Legal obligation: to comply with the IT Act, income tax, and other Indian regulations
• Consent: for optional features like location access and marketing emails (you may withdraw consent at any time)`,
  },
  {
    id: "sharing",
    title: "6. Data Sharing",
    content: `We share your data only in these limited circumstances:

• Between Owners and Tenants: When a tenant joins a property, the owner can see the tenant's name, contact details, and payment status. Tenants can see the owner's name and contact number.
• Payment processors: We share transaction details with Razorpay or PayU to process payments. These partners are bound by their own privacy policies and PCI-DSS standards.
• Service providers: We use cloud infrastructure (AWS Mumbai region) and analytics services under strict data processing agreements.
• Legal requirements: We will disclose data if required by court order, government authority, or applicable Indian law.
• Business transfer: In the event of a merger or acquisition, data may transfer to the successor entity subject to equivalent protections.`,
  },
  {
    id: "retention",
    title: "7. Data Retention",
    content: `• Account data: Retained for the duration of your account and 2 years after deletion, to comply with tax and financial regulations
• Payment records: Retained for 7 years to comply with the Companies Act and income tax requirements
• Maintenance request logs: 1 year after resolution
• Support communications: 2 years after case closure
• Anonymised analytics data: Up to 3 years

You may request deletion of your account and associated data at any time. We will process such requests within 30 days, subject to legal retention requirements.`,
  },
  {
    id: "security",
    title: "8. Security",
    content: `We implement industry-standard security measures:
• All data transmitted over TLS 1.3 encryption
• Passwords hashed using bcrypt
• Sensitive documents (IDs) encrypted at rest using AES-256
• Payment credentials never stored on our servers
• Regular security audits and penetration testing
• Role-based access controls for our team
• Two-factor authentication for admin access

Despite these measures, no system is 100% secure. In the event of a data breach affecting your rights, we will notify affected users within 72 hours as required by law.`,
  },
  {
    id: "your-rights",
    title: "9. Your Rights",
    content: `You have the following rights regarding your personal data:
• Access: Request a copy of all personal data we hold about you
• Correction: Correct inaccurate or incomplete data
• Deletion: Request deletion of your data (subject to retention obligations)
• Portability: Export your data in a machine-readable format
• Withdrawal of consent: Withdraw consent for optional processing at any time
• Grievance redressal: Lodge a complaint with our Grievance Officer

To exercise any of these rights, email us at privacy@shiftproof.app. We will respond within 30 days.`,
  },
  {
    id: "cookies",
    title: "10. Cookies & Tracking",
    content: `Our website uses:
• Essential cookies: Required for login sessions and security (cannot be disabled)
• Analytics cookies: Anonymous usage statistics via privacy-friendly analytics (can be opted out)
• No third-party advertising cookies

The ShiftProof Android app does not use browser cookies but may use device identifiers for analytics.`,
  },
  {
    id: "children",
    title: "11. Children's Privacy",
    content: `ShiftProof is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has provided us with personal data, contact privacy@shiftproof.app and we will delete it promptly.`,
  },
  {
    id: "grievance",
    title: "12. Grievance Officer",
    content: `In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are:

Name: Rahul Kumar
Designation: Grievance Officer, ShiftProof Technologies Pvt. Ltd.
Email: grievance@shiftproof.app
Address: #42, 3rd Floor, Koramangala 4th Block, Bengaluru, Karnataka — 560034
Response time: Within 30 days of receiving a complaint`,
  },
  {
    id: "changes",
    title: "13. Changes to This Policy",
    content: `We may update this policy from time to time. We will notify you of material changes via in-app notification and/or email at least 14 days before the changes take effect. Continued use of ShiftProof after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    id: "contact-us",
    title: "14. Contact Us",
    content: `For privacy-related questions or to exercise your rights:
Email: privacy@shiftproof.app
Postal address: ShiftProof Technologies Pvt. Ltd., #42, 3rd Floor, Koramangala 4th Block, Bengaluru, Karnataka — 560034`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-accent-700 pt-28 pb-14 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl text-white mb-4">Privacy Policy</h1>
          <p className="text-accent-200/80 text-sm">
            Last updated: {LAST_UPDATED} · Effective immediately
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">

        {/* Quick nav */}
        <div className="mb-12 p-5 rounded-2xl bg-accent-50 border border-accent-100">
          <p className="text-xs font-bold text-accent-600 uppercase tracking-wide mb-3">Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-medium text-accent-500 bg-white border border-accent-200 px-3 py-1.5 rounded-full hover:bg-accent-100 transition-colors"
              >
                {s.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>

        {/* Intro callout */}
        <div className="mb-10 p-5 rounded-2xl bg-[color:var(--background)] border border-slate-200">
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-[color:var(--foreground)]">Summary:</span> ShiftProof collects only the data needed to provide its services. We do not sell your data. Tenants are free forever. Owners' data is used only to run their property management. You can request deletion of your account at any time.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-4 pb-2 border-b border-[color:var(--background)]">
                {s.title}
              </h2>
              {"subsections" in s && s.subsections ? (
                <div className="space-y-6">
                  {s.subsections.map((sub) => (
                    <div key={sub.title}>
                      <h3 className="text-sm font-bold text-slate-700 mb-2">{sub.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{sub.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {"content" in s ? s.content : ""}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/terms" className="font-semibold text-accent-500 hover:underline">Terms of Service</Link>
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

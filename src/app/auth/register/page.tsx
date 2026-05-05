import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { parseSession, SESSION_COOKIE } from "@/lib/users";
import Navbar from "@/components/Navbar";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create account — ShiftProof",
};

const TESTIMONIALS = [
  {
    quote: "Pehle WhatsApp pe manually remind karna padta tha. Ab sab automatic hai aur tenants bhi khush hain.",
    author: "Priya Sharma",
    context: "2 PGs · Pune",
  },
  {
    quote: "Ek dashboard mein sab kuch — rent, maintenance, tenants. Waqt ki kitni bachat hui hai.",
    author: "Ravi Kumar",
    context: "3 PGs · Bangalore",
  },
];

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (session) {
    redirect(session.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard");
  }

  const t = TESTIMONIALS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)]">
      <Navbar />

      <div className="flex-1 grid lg:grid-cols-2">

        {/* ── Left: brand panel ───────────────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-between p-14 xl:p-20"
          style={{ background: "linear-gradient(150deg, #0E2118 0%, #1B4432 55%, #2D6A4F 100%)" }}
        >
          <div className="flex flex-col gap-12 max-w-md">

            {/* Headline */}
            <div>
              <p className="text-[#52B788] text-xs font-semibold uppercase tracking-[0.18em] mb-5">
                Free for 14 days — no card required
              </p>
              <h2 className="text-[2.75rem] xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
                Set up in<br />
                <span className="text-[#74C69D]">5 minutes.</span>
              </h2>
              <p className="mt-4 text-[#A2C7AD] text-[15px] leading-relaxed max-w-sm">
                Automate rent reminders, track payments, manage tenants — one dashboard built for Indian PG owners.
              </p>
            </div>

            {/* Testimonial */}
            <figure className="border-l-2 border-[#52B788]/50 pl-5">
              <blockquote className="text-[#D0E3D6] text-[15px] leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#74C69D] text-xs font-bold">
                  {t.author[0]}
                </div>
                <div>
                  <p className="text-[#74C69D] text-xs font-semibold">{t.author}</p>
                  <p className="text-[#52B788] text-[11px]">{t.context}</p>
                </div>
              </figcaption>
            </figure>
          </div>

          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-4 pt-10 border-t border-white/10">
            {[
              { value: "2,000+", label: "Property owners" },
              { value: "18,000+", label: "Tenants managed" },
              { value: "12", label: "Cities active" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-white text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-[#52B788] text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: form panel ───────────────────────────────────────── */}
        <div className="flex items-start justify-center px-6 py-12 lg:py-16 overflow-y-auto">
          <div className="w-full max-w-sm">

            <RegisterForm />

            <div className="mt-10 pt-6 border-t border-[color:var(--line)] text-center">
              <p className="text-sm text-[color:var(--muted)]">
                Already have an account?{" "}
                <Link href="/login" className="text-[color:var(--accent-600)] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
              <p className="mt-1.5 text-xs text-[color:var(--muted)]">
                Free for tenants.{" "}
                <Link href="/#download" className="text-[color:var(--accent-600)] hover:underline">
                  Get the Android app →
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { parseSession, SESSION_COOKIE } from "@/lib/users";
import Navbar from "@/components/Navbar";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — ShiftProof",
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (session) {
    redirect(session.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)]">
      <Navbar />

      <div className="flex-1 grid lg:grid-cols-2">

        {/* ── Left brand panel ─────────────────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-between p-14 xl:p-20"
          style={{ background: "linear-gradient(150deg, #0E2118 0%, #1B4432 55%, #2D6A4F 100%)" }}
        >
          <div className="flex flex-col gap-10 max-w-md">
            <div>
              <p className="text-[#52B788] text-xs font-semibold uppercase tracking-[0.18em] mb-5">
                Welcome back
              </p>
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
                Your PGs,<br />
                <span className="text-[#74C69D]">running themselves.</span>
              </h2>
              <p className="mt-4 text-[#A2C7AD] text-base leading-relaxed">
                Join 2,000+ property owners who&apos;ve taken back their Sundays.
              </p>
            </div>

            <ul className="flex flex-col gap-3.5">
              {[
                "Rent collected on time — every month",
                "Tenants and rooms managed digitally",
                "Maintenance requests tracked end-to-end",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#D0E3D6]">
                  <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                    <Check size={11} strokeWidth={3} className="text-[#74C69D]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <blockquote className="border-l-2 border-[#52B788]/40 pl-5">
              <p className="text-[#A2C7AD] text-sm leading-relaxed italic">
                &ldquo;Isse pehle 3 properties manage karna bahut mushkil tha. Ab ek dashboard mein sab kuch hai.&rdquo;
              </p>
              <footer className="mt-2 text-[#52B788] text-xs font-medium">
                Ravi Kumar — 3 PGs, Bangalore
              </footer>
            </blockquote>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-8 pt-10 border-t border-white/10">
            {[
              { value: "2,000+", label: "Owners" },
              { value: "18,000+", label: "Tenants" },
              { value: "12", label: "Cities" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white text-xl font-bold">{s.value}</p>
                <p className="text-[#52B788] text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ─────────────────────────────────────────── */}
        <div className="flex items-center justify-center px-6 py-12 lg:py-16">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[color:var(--foreground)]">Sign in</h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>

            <p className="mt-8 text-center text-sm text-[color:var(--muted)]">
              Don&rsquo;t have an account?{" "}
              <Link href="/auth/register" className="text-[color:var(--accent-600)] font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

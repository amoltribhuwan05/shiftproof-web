import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import OnboardingForm from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Complete Setup — ShiftProof",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Logo + back link */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            Home
          </Link>
          <Link href="/" className="text-2xl font-semibold text-[color:var(--foreground)]">
            Shift<span className="text-[color:var(--accent-500)]">Proof</span>
          </Link>
          <div className="w-12" />
        </div>

        <div className="rounded-2xl border border-[color:var(--line)] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[color:var(--foreground)] mb-1">
            Complete your profile
          </h1>
          <p className="text-sm text-[color:var(--muted)] mb-6">
            Just a few more details to get you started.
          </p>
          <Suspense fallback={null}>
            <OnboardingForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

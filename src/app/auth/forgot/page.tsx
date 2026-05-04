import type { Metadata } from "next";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = {
  title: "Reset password — ShiftProof",
};

export default function ForgotPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold text-[color:var(--foreground)]">
            Shift<span className="text-[color:var(--accent-500)]">Proof</span>
          </span>
        </div>

        <div className="rounded-2xl border border-[color:var(--line)] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[color:var(--foreground)] mb-1">
            Reset your password
          </h1>
          <p className="text-sm text-[color:var(--muted)] mb-6">
            Enter your email and we&rsquo;ll send you a secure reset link.
          </p>
          <ForgotForm />
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--muted)]">
          Remembered it?{" "}
          <a href="/login" className="text-[color:var(--accent-600)] font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

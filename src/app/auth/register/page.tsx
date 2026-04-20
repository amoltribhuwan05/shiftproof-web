import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseSession, SESSION_COOKIE } from "@/lib/users";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create account — ShiftProof",
};

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (session) {
    redirect(session.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard");
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold text-[color:var(--foreground)]">
            Shift<span className="text-[color:var(--accent-500)]">Proof</span>
          </span>
        </div>

        <div className="rounded-2xl border border-[color:var(--line)] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[color:var(--foreground)] mb-1">
            Create your account
          </h1>
          <p className="text-sm text-[color:var(--muted)] mb-6">
            Free for tenants. 14-day free trial for owners.
          </p>
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--muted)]">
          Already have an account?{" "}
          <a href="/login" className="text-[color:var(--accent-600)] font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

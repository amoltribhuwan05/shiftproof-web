import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — ShiftProof",
};

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseSession, SESSION_COOKIE } from "@/lib/users";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = parseSession(raw);

  if (session) {
    const dest = session.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard";
    redirect(dest);
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold text-[color:var(--foreground)]">
            Shift<span className="text-[color:var(--accent-500)]">Proof</span>
          </span>
        </div>

        <div className="rounded-2xl border border-[color:var(--line)] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[color:var(--foreground)] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[color:var(--muted)] mb-6">
            Sign in to your dashboard
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--muted)]">
          Don&rsquo;t have an account?{" "}
          <a href="/signup" className="text-[color:var(--accent-600)] font-medium hover:underline">
            Start free
          </a>
        </p>
      </div>
    </div>
  );
}

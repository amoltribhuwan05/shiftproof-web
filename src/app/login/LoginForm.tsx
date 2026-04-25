"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const didReset = params.get("reset") === "1";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      const next = params.get("next");
      if (next) {
        router.push(next);
      } else {
        router.push(data.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {didReset && (
        <p className="text-xs text-[color:var(--success-700)] bg-[color:var(--success-50)] rounded-lg px-3 py-2" role="status">
          Password reset successfully. Sign in with your new password.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--trust-700)] focus:ring-4 focus:ring-[color:var(--trust-50)] placeholder:text-[color:var(--muted)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="password">
            Password
          </label>
          <Link href="/auth/forgot" className="text-xs text-[color:var(--accent-600)] hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--trust-700)] focus:ring-4 focus:ring-[color:var(--trust-50)] placeholder:text-[color:var(--muted)]"
        />
      </div>

      {error && (
        <p className="text-xs text-[color:var(--error-700)] bg-[color:var(--error-50)] rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-colors"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      {/* Quick-fill demo credentials */}
      <div className="mt-2 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-3">
          Demo accounts
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Owner 1",  email: "ravi@shiftproof.app",  pw: "Owner@123"  },
            { label: "Owner 2",  email: "priya@shiftproof.app", pw: "Owner@456"  },
            { label: "Tenant 1", email: "rahul@shiftproof.app", pw: "Tenant@123" },
            { label: "Tenant 2", email: "priya@shiftproof.app", pw: "Tenant@456" },
          ].map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => { setEmail(u.email); setPassword(u.pw); setError(null); }}
              className="text-left rounded-lg border border-[color:var(--line)] px-3 py-2 hover:border-[color:var(--accent-500)] hover:bg-[color:var(--accent-50)] transition-colors"
            >
              <p className="text-xs font-medium text-[color:var(--foreground)]">{u.label}</p>
              <p className="text-[10px] text-[color:var(--muted)] truncate">{u.email}</p>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

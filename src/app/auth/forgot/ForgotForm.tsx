"use client";

import { useState, FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const INPUT_CLS =
  "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--accent-500)] focus:ring-4 focus:ring-[color:var(--accent-50)] placeholder:text-[color:var(--muted)]";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        setError("No account found with that email address");
      } else {
        setError("Something went wrong — please try again");
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-[color:var(--success-700)]/30 bg-[color:var(--success-50)] px-4 py-4">
          <p className="text-sm font-semibold text-[color:var(--success-700)] mb-1">Check your inbox</p>
          <p className="text-xs text-[color:var(--success-700)] opacity-80">
            We sent a password reset link to <span className="font-medium">{email}</span>. Follow the link to set a new password.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSent(false); setEmail(""); }}
          className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
        >
          ← Send to a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="email">
          Registered email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLS}
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
        className="inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-colors"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const PHONE_RE = /^[6-9]\d{9}$/;

export default function SignupForm({
  plan,
  planLabel,
}: {
  plan: string;
  planLabel: string;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = phone.replace(/\D/g, "");
    if (!PHONE_RE.test(trimmed)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError(null);
    setSubmitting(true);
    router.push(
      `/signup/thanks?phone=${encodeURIComponent(trimmed)}&plan=${encodeURIComponent(plan)}`,
    );
  }

  return (
    <form className="mt-8 flex flex-col gap-3" onSubmit={onSubmit} noValidate>
      <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="phone">
        Mobile number
      </label>
      <div
        className={`flex items-stretch rounded-xl border bg-white overflow-hidden transition-colors focus-within:ring-4 focus-within:ring-[color:var(--trust-50)] ${
          error
            ? "border-[color:var(--error)]"
            : "border-[color:var(--line)] focus-within:border-[color:var(--trust-700)]"
        }`}
      >
        <span className="flex items-center px-4 text-sm text-[color:var(--muted)] border-r border-[color:var(--line)]">
          +91
        </span>
        <input
          id="phone"
          name="phone"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          required
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
            if (error) setError(null);
          }}
          className="flex-1 px-4 py-4 text-base outline-none bg-transparent"
        />
      </div>

      {error && (
        <p className="text-xs text-[color:var(--error-700)]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-70 disabled:cursor-not-allowed px-6 py-4 text-base font-semibold text-white transition-colors"
      >
        {submitting ? "Sending…" : "Send me the link"}
      </button>

      <p className="mt-1 text-xs text-[color:var(--muted)]">
        Selected plan:{" "}
        <span className="font-semibold text-[color:var(--foreground)]">{planLabel}</span>.
        You can change this later.
      </p>
    </form>
  );
}

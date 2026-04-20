"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Role = "owner" | "tenant";
const PHONE_RE = /^[6-9]\d{9}$/;

const INPUT_CLS =
  "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--accent-500)] focus:ring-4 focus:ring-[color:var(--accent-50)] placeholder:text-[color:var(--muted)]";

export default function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (!PHONE_RE.test(cleanPhone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: cleanPhone, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push(data.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Role selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[color:var(--background)] rounded-xl border border-[color:var(--line)]">
        {(["owner", "tenant"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-colors capitalize ${
              role === r
                ? "bg-white text-[color:var(--accent-600)] shadow-sm border border-[color:var(--line)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
            }`}
          >
            {r === "owner" ? "PG Owner" : "Tenant"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Ravi Kumar"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={INPUT_CLS}
        />
      </div>

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
          className={INPUT_CLS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="phone">
          Mobile number
        </label>
        <div className={`flex items-stretch rounded-xl border overflow-hidden transition-colors focus-within:ring-4 focus-within:ring-[color:var(--accent-50)] border-[color:var(--line)] focus-within:border-[color:var(--accent-500)]`}>
          <span className="flex items-center px-4 text-sm text-[color:var(--muted)] border-r border-[color:var(--line)] bg-[color:var(--background)]">
            +91
          </span>
          <input
            id="phone"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            required
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="flex-1 px-4 py-3 text-sm outline-none bg-[color:var(--background)] text-[color:var(--foreground)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        className="mt-1 inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-colors"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

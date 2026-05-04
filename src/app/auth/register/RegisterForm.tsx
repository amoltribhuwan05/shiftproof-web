"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  validatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const PHONE_RE = /^[6-9]\d{9}$/;
const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const INPUT_CLS =
  "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--accent-500)] focus:ring-4 focus:ring-[color:var(--accent-50)] placeholder:text-[color:var(--muted)]";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (!PHONE_RE.test(cleanPhone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!STRONG_PASSWORD_RE.test(password)) {
      setError("Use at least 8 characters with uppercase, lowercase, number, and special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setLoading(true);
    try {
      if (auth) {
        const passwordStatus = await validatePassword(auth, password);
        if (!passwordStatus.isValid) {
          setError("Password does not meet the Firebase project policy.");
          return;
        }
      }

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: cleanPhone,
          password,
          deferSession: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed — please try again");
        return;
      }
      await sendEmailVerification(userCred.user);
      await signOut(auth);
      setSuccessEmail(email.trim());
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (
        code === "auth/weak-password" ||
        code === "auth/password-does-not-meet-requirements"
      ) {
        setError("Password must satisfy the required security rules.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts — please try again later");
      } else {
        setError("Registration failed — please try again");
      }
    } finally {
      setLoading(false);
    }
  }

  if (successEmail) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-[color:var(--success-700)]/30 bg-[color:var(--success-50)] px-4 py-4">
          <p className="mb-1 text-sm font-semibold text-[color:var(--success-700)]">
            Verify your email
          </p>
          <p className="text-xs text-[color:var(--success-700)] opacity-80">
            We sent a verification link to <span className="font-medium">{successEmail}</span>. Open that email before signing in.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/login?verify=1&email=${encodeURIComponent(successEmail)}`)}
          className="inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent-600)]"
        >
          Go to sign in
        </button>

        <p className="text-center text-xs text-[color:var(--muted)]">
          Didn&rsquo;t receive it? Check spam or try registering again with the same email to resend the link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Enter your full name"
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
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLS}
        />
        <span className="text-[11px] text-[color:var(--muted)]">
          We&rsquo;ll send a verification link to this email before your account can sign in.
        </span>
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
            placeholder="9876543210"
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
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT_CLS}
        />
        <span className="text-[11px] text-[color:var(--muted)]">
          Use 8+ characters with uppercase, lowercase, number, and special character.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={INPUT_CLS}
        />
        {confirmPassword && (
          <span
            className={`text-[11px] ${
              password === confirmPassword
                ? "text-[color:var(--success-700)]"
                : "text-[color:var(--error-700)]"
            }`}
          >
            {password === confirmPassword ? "Passwords match." : "Passwords do not match."}
          </span>
        )}
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

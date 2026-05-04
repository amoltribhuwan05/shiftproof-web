"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type ActionState = "loading" | "verify-success" | "reset-ready" | "reset-success" | "error";

const CARD_CLS =
  "rounded-2xl border border-[color:var(--line)] bg-white p-8 shadow-sm";
const INPUT_CLS =
  "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--accent-500)] focus:ring-4 focus:ring-[color:var(--accent-50)] placeholder:text-[color:var(--muted)]";

function getErrorMessage(error: unknown) {
  const code = (error as { code?: string } | null)?.code;

  if (
    code === "auth/expired-action-code" ||
    code === "auth/invalid-action-code"
  ) {
    return "This link is invalid or has expired. Please request a new one.";
  }

  if (code === "auth/weak-password") {
    return "Password must be at least 6 characters.";
  }

  return "We could not complete this request. Please try again.";
}

export default function ActionHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<ActionState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!auth) {
        if (!cancelled) {
          setError("Firebase is not configured.");
          setState("error");
        }
        return;
      }

      if (!mode || !oobCode) {
        if (!cancelled) {
          setError("This action link is incomplete.");
          setState("error");
        }
        return;
      }

      if (mode === "verifyEmail") {
        try {
          await applyActionCode(auth, oobCode);
          if (!cancelled) {
            setState("verify-success");
          }
        } catch (err) {
          if (!cancelled) {
            setError(getErrorMessage(err));
            setState("error");
          }
        }
        return;
      }

      if (mode === "resetPassword") {
        try {
          const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
          if (!cancelled) {
            setEmail(verifiedEmail);
            setState("reset-ready");
          }
        } catch (err) {
          if (!cancelled) {
            setError(getErrorMessage(err));
            setState("error");
          }
        }
        return;
      }

      if (!cancelled) {
        setError("This action type is not supported.");
        setState("error");
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [mode, oobCode]);

  async function onResetSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!auth || !oobCode) {
      setError("This reset link is invalid.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await confirmPasswordReset(auth, oobCode, password);
      setState("reset-success");
    } catch (err) {
      setError(getErrorMessage(err));
      setState("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold text-[color:var(--foreground)]">
            Shift<span className="text-[color:var(--accent-500)]">Proof</span>
          </span>
        </div>

        <div className={CARD_CLS}>
          {state === "loading" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-[color:var(--foreground)]">
                Processing your request
              </h1>
              <p className="text-sm text-[color:var(--muted)]">
                Please wait while we verify this secure action link.
              </p>
            </>
          )}

          {state === "verify-success" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-[color:var(--foreground)]">
                Email verified
              </h1>
              <p className="mb-6 text-sm text-[color:var(--muted)]">
                Your email has been verified successfully. You can now sign in to ShiftProof.
              </p>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[color:var(--accent-500)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent-600)]"
              >
                Go to sign in
              </Link>
            </>
          )}

          {state === "reset-ready" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-[color:var(--foreground)]">
                Choose a new password
              </h1>
              <p className="mb-6 text-sm text-[color:var(--muted)]">
                Reset password for <span className="font-medium text-[color:var(--foreground)]">{email}</span>.
              </p>

              <form onSubmit={onResetSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="password">
                    New password
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-[color:var(--error-50)] px-3 py-2 text-xs text-[color:var(--error-700)]" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent-600)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Updating password…" : "Update password"}
                </button>
              </form>
            </>
          )}

          {state === "reset-success" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-[color:var(--foreground)]">
                Password updated
              </h1>
              <p className="mb-6 text-sm text-[color:var(--muted)]">
                Your password has been changed successfully. Sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login?reset=1")}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[color:var(--accent-500)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent-600)]"
              >
                Continue to sign in
              </button>
            </>
          )}

          {state === "error" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-[color:var(--foreground)]">
                Link unavailable
              </h1>
              <p className="mb-6 text-sm text-[color:var(--muted)]">
                {error ?? "This action link could not be completed."}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/forgot"
                  className="inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent-600)]"
                >
                  Request a new reset link
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-[color:var(--line)] px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--background)]"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

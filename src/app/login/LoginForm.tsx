"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  sendEmailVerification,
  signInWithPhoneNumber, 
  signOut,
  ConfirmationResult 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { DEMO_EMAILS } from "@/lib/users";
import PhoneInput from "@/components/PhoneInput";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

type LinkHint = {
  provider: "phone" | "google" | "email";
  title: string;
  body: string;
  emailPrefill?: string;
};

type SessionError = {
  status: number;
  message: string;
};

function isSessionError(value: unknown): value is SessionError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "message" in value &&
    typeof (value as { status: unknown }).status === "number" &&
    typeof (value as { message: unknown }).message === "string"
  );
}

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [phoneStep, setPhoneStep] = useState<"input" | "verify">("input");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [linkHint, setLinkHint] = useState<LinkHint | null>(null);
  const [loading, setLoading] = useState(false);
  const didReset = params.get("reset") === "1";
  const didRequestVerification = params.get("verify") === "1";
  const verificationEmail = params.get("email");
  const identityConflict = params.get("error") === "identity_conflict";

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  async function handleSession(idToken: string) {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (auth && [401, 403, 409].includes(res.status)) {
        await signOut(auth);
      }
      throw { status: res.status, message: data.error ?? "Authentication failed" } satisfies SessionError;
    }
    
    if (data.profileCompleted === false) {
      router.push("/auth/onboarding");
      return;
    }

    const next = params.get("next");
    router.push(next ?? (data.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard"));
  }

  async function onEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLinkHint(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter an email and password.");
      return;
    }

    try {
      setLoading(true);
      if (!DEMO_EMAILS.has(email.toLowerCase()) && auth) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        if (!userCred.user.emailVerified) {
          await sendEmailVerification(userCred.user);
          await signOut(auth);
          setError("Please verify your email before signing in. We sent you a fresh verification link.");
          return;
        }
        const idToken = await userCred.user.getIdToken();
        await handleSession(idToken);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Invalid email or password"); return; }
        const next = params.get("next");
        router.push(next ?? (data.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard"));
      }
    } catch (err: any) {
      if (isSessionError(err)) {
        setError(err.message);
        return;
      }
      const code = err.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Invalid email or password");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts — please try again later");
      } else {
        setError(err.message || "Sign in failed — please try again");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setError(null);
    setStatus(null);
    setLinkHint(null);
    if (!auth) {
      setError("Firebase is not configured");
      return;
    }
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const idToken = await userCred.user.getIdToken();
      await handleSession(idToken);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (isSessionError(err)) {
        setError(err.message);
        setLinkHint({
          provider: "google",
          title: "Existing account found",
          body:
            "This Google sign-in matches an existing ShiftProof account. Sign in with your original method first, then we can link Google from your account settings or onboarding flow.",
        });
      } else if (err.code === "auth/account-exists-with-different-credential") {
        const detectedEmail =
          typeof err.customData?.email === "string" ? err.customData.email : "";
        setError("This email already belongs to an existing ShiftProof account.");
        setLinkHint({
          provider: "google",
          title: "Sign in first, then link Google",
          body:
            "Use your existing email or phone sign-in first. Once we add full linking support, this Google account can be attached safely without creating a duplicate account.",
          emailPrefill: detectedEmail || undefined,
        });
        if (detectedEmail) {
          setEmail(detectedEmail);
          setAuthMode("email");
        }
      } else if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google Sign-In failed");
      }
    } finally {
      setLoading(false);
    }
  }

  function setupRecaptcha() {
    if (!window.recaptchaVerifier && auth) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }

  async function onSendOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLinkHint(null);
    if (!auth) {
      setError("Firebase is not configured");
      return;
    }
    if (!phone.startsWith("+")) {
      setError("Please include country code (e.g. +91)");
      return;
    }
    
    try {
      setLoading(true);
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier!;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setPhoneStep("verify");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLinkHint(null);
    if (!confirmationResult) return;
    
    try {
      setLoading(true);
      const userCred = await confirmationResult.confirm(otp);
      const idToken = await userCred.user.getIdToken();
      await handleSession(idToken);
    } catch (err: any) {
      if (isSessionError(err) && err.status === 409) {
        setError(err.message);
        setLinkHint({
          provider: "phone",
          title: "Phone number belongs to an existing account",
          body:
            "This number already appears on an email-first ShiftProof account. Sign in with email today, and we’ll finish the secure phone-linking flow on the server side next.",
        });
        setAuthMode("email");
        setPhoneStep("input");
        setOtp("");
        return;
      }
      if (isSessionError(err)) {
        setError(err.message);
        return;
      }
      setError(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {didRequestVerification && verificationEmail && (
        <p className="text-xs text-[color:var(--success-700)] bg-[color:var(--success-50)] rounded-lg px-3 py-2" role="status">
          Verification email sent to {verificationEmail}. Open that link, then sign in here.
        </p>
      )}

      {didReset && (
        <p className="text-xs text-[color:var(--success-700)] bg-[color:var(--success-50)] rounded-lg px-3 py-2" role="status">
          Password reset successfully. Sign in with your new password.
        </p>
      )}

      {identityConflict && (
        <p className="text-xs text-[color:var(--error-700)] bg-[color:var(--error-50)] rounded-lg px-3 py-2" role="alert">
          This account has conflicting sign-in methods. Please sign in with the original method you used to create your account.
        </p>
      )}

      {status && (
        <p className="text-xs text-[color:var(--success-700)] bg-[color:var(--success-50)] rounded-lg px-3 py-2" role="status">
          {status}
        </p>
      )}

      {linkHint && (
        <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-4">
          <p className="mb-1 text-sm font-semibold text-[color:var(--foreground)]">
            {linkHint.title}
          </p>
          <p className="text-xs text-[color:var(--muted)]">
            {linkHint.body}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode("email");
                setPhoneStep("input");
                setError(null);
                setStatus("Continue with your email sign in to access the account safely.");
                if (linkHint.emailPrefill) {
                  setEmail(linkHint.emailPrefill);
                }
              }}
              className="inline-flex items-center justify-center rounded-lg bg-[color:var(--accent-500)] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent-600)]"
            >
              Continue with email
            </button>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-lg border border-[color:var(--line)] px-3 py-2 text-xs font-semibold text-[color:var(--foreground)] transition-colors hover:bg-white"
            >
              Create a new account
            </Link>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-[color:var(--error-700)] bg-[color:var(--error-50)] rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex rounded-xl bg-[color:var(--line)] p-1">
        <button
          type="button"
          onClick={() => { setAuthMode("email"); setError(null); setStatus(null); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${authMode === "email" ? "bg-white text-[color:var(--foreground)] shadow-sm" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode("phone"); setError(null); setStatus(null); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${authMode === "phone" ? "bg-white text-[color:var(--foreground)] shadow-sm" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
        >
          Phone
        </button>
      </div>

      {authMode === "email" ? (
        <form onSubmit={onEmailSubmit} className="flex flex-col gap-4" noValidate>
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

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : phoneStep === "input" ? (
        <form onSubmit={onSendOtp} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="phone">
              Phone Number
            </label>
            <PhoneInput
              id="phone"
              required
              placeholder="98765 43210"
              value={phone}
              onChange={setPhone}
              className="bg-[color:var(--background)]"
            />
            <span className="text-[11px] text-[color:var(--muted)]">
              We&rsquo;ll verify the number after OTP. If it already belongs to an email account, use email sign in instead.
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-colors"
          >
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="otp">
              6-digit OTP Code
            </label>
            <input
              id="otp"
              type="text"
              required
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--trust-700)] focus:ring-4 focus:ring-[color:var(--trust-50)] placeholder:text-[color:var(--muted)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-colors"
          >
            {loading ? "Verifying…" : "Verify Code"}
          </button>
          <button
            type="button"
            onClick={() => { setPhoneStep("input"); setOtp(""); setError(null); }}
            className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
          >
            Use a different phone number
          </button>
        </form>
      )}

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-[color:var(--line)]"></div>
        <span className="flex-shrink-0 px-4 text-xs text-[color:var(--muted)]">or</span>
        <div className="flex-grow border-t border-[color:var(--line)]"></div>
      </div>

      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-xl border border-[color:var(--line)] bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)] transition-colors hover:bg-gray-50 disabled:opacity-60 shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div id="recaptcha-container"></div>

      {/* Quick-fill demo credentials (only show in email mode) */}
      {authMode === "email" && (
        <div className="mt-2 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-3">
            Demo accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Owner 1",  email: "ravi@shiftproof.in",  pw: "Owner@123"  },
              { label: "Owner 2",  email: "priya@shiftproof.in", pw: "Owner@456"  },
              { label: "Tenant 1", email: "rahul@shiftproof.in", pw: "Tenant@123" },
              { label: "Tenant 2", email: "priya@shiftproof.in", pw: "Tenant@456" },
            ].map((u) => (
              <button
                key={u.label}
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
      )}
    </div>
  );
}

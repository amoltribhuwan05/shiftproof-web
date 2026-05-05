"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  validatePassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import PhoneInput from "@/components/PhoneInput";
import {
  ArrowLeft, Check, X, AlertCircle,
  User, UserRound, Users, UserPlus, Building2,
  Mail, Phone, Home,
} from "lucide-react";

/* ── constants ──────────────────────────────────────────────────────── */

const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_STEPS = 5;

/* ── option data ────────────────────────────────────────────────────── */

type Gender   = "MALE" | "FEMALE" | "CO_LIVING";
type RoomType = "SINGLE" | "SHARED" | "ANY";

const GENDER_OPTIONS: { value: Gender; icon: React.ElementType; label: string; sub: string }[] = [
  { value: "MALE",      icon: User,      label: "Male",   sub: "Boys-only"  },
  { value: "FEMALE",    icon: UserRound, label: "Female", sub: "Girls-only" },
  { value: "CO_LIVING", icon: Users,     label: "Mixed",  sub: "Co-ed"      },
];

const ROOM_OPTIONS: { value: RoomType; icon: React.ElementType; label: string; sub: string }[] = [
  { value: "SINGLE", icon: UserPlus,  label: "Single",  sub: "Just you"    },
  { value: "SHARED", icon: Users,     label: "Shared",  sub: "2–3 people"  },
  { value: "ANY",    icon: Building2, label: "Any",     sub: "Show all"    },
];

const GENDER_LABEL: Record<Gender,   string> = { MALE: "Male PGs", FEMALE: "Female PGs",  CO_LIVING: "Any / Mixed" };
const ROOM_LABEL:   Record<RoomType, string> = { SINGLE: "Single room", SHARED: "Shared room", ANY: "Any type" };

/* ── form types ─────────────────────────────────────────────────────── */

type Step = 1 | 2 | 3 | 4 | 5;

interface FormState {
  name: string; email: string; phone: string;
  gender: Gender | ""; roomType: RoomType | "";
  password: string; confirmPassword: string;
}

/* ── shared input class ─────────────────────────────────────────────── */

const INPUT =
  "w-full border border-[color:var(--line)] bg-white rounded-xl px-4 py-3.5 text-[15px] text-[color:var(--foreground)] outline-none transition-all duration-150 focus:border-[color:var(--accent-500)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-[color:var(--muted)]";

/* ── sub-components ─────────────────────────────────────────────────── */

function StepHeader({ step, onBack }: { step: Step; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex-shrink-0 h-7 w-7 -ml-0.5 rounded-lg flex items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--line)] transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={2} />
        </button>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}
      <div className="flex-1 h-1 rounded-full bg-[color:var(--line)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[color:var(--accent-500)] transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
      <span className="flex-shrink-0 text-[11px] tabular-nums font-medium text-[color:var(--muted)]">
        {step}/{TOTAL_STEPS}
      </span>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-[color:var(--error-700)] mt-1.5" role="alert">
      <AlertCircle size={12} strokeWidth={2} className="flex-shrink-0" />
      {msg}
    </p>
  );
}

function SummaryPill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-lg bg-[color:var(--accent-50)] border border-[color:var(--accent-100)] text-[color:var(--accent-700)] text-xs font-medium max-w-[180px]">
      <Icon size={11} strokeWidth={2} className="flex-shrink-0 text-[color:var(--accent-500)]" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function PrimaryButton({ loading, label = "Continue" }: { loading?: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 text-[15px] font-semibold text-white tracking-tight shadow-[0_2px_8px_rgba(45,106,79,0.2)] hover:shadow-[0_4px_16px_rgba(45,106,79,0.28)] transition-all duration-200"
    >
      {loading ? "One moment…" : label}
    </button>
  );
}

function ChipGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; icon: React.ElementType; label: string; sub: string }[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(opt => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.sub}
            onClick={() => onChange(active ? ("" as T) : opt.value)}
            className={`flex flex-col items-center gap-2 rounded-xl border py-4 px-2 transition-all duration-150 active:scale-[0.96] ${
              active
                ? "bg-[color:var(--accent-500)] border-[color:var(--accent-500)] text-white shadow-[0_2px_8px_rgba(45,106,79,0.2)]"
                : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent-200)] hover:text-[color:var(--foreground)]"
            }`}
          >
            <Icon size={18} strokeWidth={1.75} />
            <span className="text-xs font-semibold leading-none">{opt.label}</span>
            <span className={`text-[10px] leading-tight text-center ${active ? "text-white/70" : "text-[color:var(--muted)]"}`}>
              {opt.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────── */

export default function RegisterForm() {
  const router = useRouter();
  const toast  = useToast();

  const [step,         setStep]         = useState<Step>(1);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "",
    gender: "", roomType: "",
    password: "", confirmPassword: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [step]);

  function patch(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function goBack() {
    setError(null);
    setStep(s => (s - 1) as Step);
  }

  /* ── step handlers ──────────────────────────────────────────────── */

  function handleName(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = form.name.trim();
    if (!trimmed) { setError("Naam toh batao! Hum kya bulayein aapko?"); return; }
    if (trimmed.length < 2) { setError("Thoda lamba naam chahiye — kam se kam 2 characters."); return; }
    setError(null);
    setForm(f => ({ ...f, name: trimmed }));
    setStep(2);
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email) { setError("Email address dalna zaroori hai."); return; }
    if (!EMAIL_RE.test(email)) { setError("Yeh valid email nahi lagta. Ek baar check karo."); return; }

    setLoading(true);
    setError(null);
    try {
      if (auth) {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          toast.error("Email already registered", "Is email se account pehle se bana hua hai. Alag email use karo ya sign in karo.");
          setLoading(false);
          return;
        }
      }
      setForm(f => ({ ...f, email }));
      setStep(3);
    } catch {
      setForm(f => ({ ...f, email }));
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  function handlePhone(e: React.FormEvent) {
    e.preventDefault();
    const clean = form.phone.replace(/[^\d+]/g, "");
    if (form.phone && clean.replace(/^\+\d{1,4}/, "").length < 7) {
      setError("Mobile number thoda ajeeb lag raha hai. Poora number enter karo.");
      return;
    }
    setError(null);
    setStep(4);
  }

  function handlePreferences(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep(5);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    const { password, confirmPassword } = form;

    if (!password) { setError("Password bhi toh chahiye!"); return; }
    if (!STRONG_PW.test(password)) {
      setError("Uppercase, lowercase, number, aur special character — sab hona chahiye (min 8 chars).");
      return;
    }
    if (password !== confirmPassword) {
      setError("Dono passwords match nahi kar rahe. Ek baar check karo.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (auth) {
        const status = await validatePassword(auth, password);
        if (!status.isValid) {
          setError("Password Firebase policy meet nahi karta. Thoda aur strong banao.");
          return;
        }
      }

      const userCred = await createUserWithEmailAndPassword(auth, form.email, password);
      await updateProfile(userCred.user, { displayName: form.name });

      const cleanPhone = form.phone.replace(/[^\d+]/g, "");
      const hasPhone   = cleanPhone.replace(/^\+\d{1,4}/, "").length >= 7;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:  form.name,
          email: form.email,
          ...(hasPhone      ? { phone:    cleanPhone    } : {}),
          ...(form.gender   ? { gender:   form.gender   } : {}),
          ...(form.roomType ? { roomType: form.roomType } : {}),
          password,
          deferSession: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        await userCred.user.delete().catch(() => {});
        if (data.error?.includes("email")) {
          toast.error("Email already registered", "Is email se account pehle se bana hua hai. Peeche jaao aur email badlo.");
          setStep(2);
        } else {
          setError(data.error ?? "Registration fail ho gayi. Dobara try karo.");
        }
        return;
      }

      await sendEmailVerification(userCred.user);
      await signOut(auth);
      setSuccessEmail(form.email);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        toast.error("Email already registered", "Is email se account pehle se bana hua hai. Peeche jaao aur email badlo.");
        setStep(2);
      } else if (code === "auth/weak-password" || code === "auth/password-does-not-meet-requirements") {
        setError("Password aur strong banana padega.");
      } else if (code === "auth/network-request-failed") {
        setError("Network problem lag rahi hai. Internet check karo aur dobara try karo.");
      } else {
        setError("Kuch galat ho gaya. Thodi der baad try karo.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ── success screen ─────────────────────────────────────────────── */

  if (successEmail) {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-4">
        <div className="h-14 w-14 rounded-2xl bg-[color:var(--success-50)] flex items-center justify-center">
          <Check size={26} strokeWidth={2.5} className="text-[color:var(--success-700)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--foreground)] tracking-tight">
            Email check karo, {form.name.split(" ")[0]}! 📬
          </h2>
          <p className="mt-2.5 text-sm text-[color:var(--muted)] leading-relaxed max-w-xs mx-auto">
            Verification link bheja hai{" "}
            <span className="font-medium text-[color:var(--foreground)]">{successEmail}</span>{" "}
            pe. Woh link open karo pehle, tab sign in hoga.
          </p>
          <p className="mt-2 text-[11px] text-[color:var(--muted)]">
            Nahi mila? Spam folder zaroor dekho.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/login?verify=1&email=${encodeURIComponent(successEmail)}`)}
          className="w-full flex items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-6 py-4 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(45,106,79,0.2)] transition-all"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  /* ── step renders ───────────────────────────────────────────────── */

  const firstName = form.name.split(" ")[0];

  return (
    <div>

      {/* ── Step 1: Name ─────────────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleName} className="flex flex-col gap-6" noValidate>
          <StepHeader step={1} />

          <div>
            <h2 className="text-[1.75rem] font-bold text-[color:var(--foreground)] tracking-tight leading-tight">
              Pehle milte hain! 👋
            </h2>
            <p className="mt-2 text-[15px] text-[color:var(--muted)] leading-relaxed">
              Apna poora naam batao — professionally use karenge.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wide" htmlFor="name">
              Full name
            </label>
            <input
              ref={inputRef}
              id="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={e => patch("name", e.target.value)}
              className={INPUT}
            />
            {error && <FieldError msg={error} />}
          </div>

          <PrimaryButton label="Let's go →" />
        </form>
      )}

      {/* ── Step 2: Email ────────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleEmail} className="flex flex-col gap-6" noValidate>
          <StepHeader step={2} onBack={goBack} />

          <div>
            <h2 className="text-[1.75rem] font-bold text-[color:var(--foreground)] tracking-tight leading-tight">
              {firstName}, email address? 📧
            </h2>
            <p className="mt-2 text-[15px] text-[color:var(--muted)] leading-relaxed">
              Verification link bhejenge. Spam bilkul nahi — pakka promise.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wide" htmlFor="email">
              Email address
            </label>
            <input
              ref={inputRef}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tum@example.com"
              value={form.email}
              onChange={e => patch("email", e.target.value)}
              className={INPUT}
            />
            <p className="text-[11px] text-[color:var(--muted)]">
              This will also be your login ID — enter the right one.
            </p>
            {error && <FieldError msg={error} />}
          </div>

          <PrimaryButton loading={loading} />
        </form>
      )}

      {/* ── Step 3: Phone ────────────────────────────────────────── */}
      {step === 3 && (
        <form onSubmit={handlePhone} className="flex flex-col gap-6" noValidate>
          <StepHeader step={3} onBack={goBack} />

          <div>
            <h2 className="text-[1.75rem] font-bold text-[color:var(--foreground)] tracking-tight leading-tight">
              Mobile number? 📱
            </h2>
            <p className="mt-2 text-[15px] text-[color:var(--muted)] leading-relaxed">
              OTP login aur rent reminders ke liye helpful. Baad mein bhi add ho sakta hai.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wide" htmlFor="phone">
              Phone number
              <span className="ml-1.5 normal-case font-normal text-[color:var(--muted)]">(optional)</span>
            </label>
            <PhoneInput
              id="phone"
              placeholder="98765 43210"
              value={form.phone}
              onChange={v => patch("phone", v)}
              className="bg-white"
            />
            {error && <FieldError msg={error} />}
          </div>

          <div className="flex flex-col gap-2">
            <PrimaryButton label="Add number →" />
            <button
              type="button"
              onClick={() => { setError(null); setForm(f => ({ ...f, phone: "" })); setStep(4); }}
              className="py-2.5 text-[13px] text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors text-center"
            >
              Skip for now
            </button>
          </div>
        </form>
      )}

      {/* ── Step 4: Preferences ──────────────────────────────────── */}
      {step === 4 && (
        <form onSubmit={handlePreferences} className="flex flex-col gap-6" noValidate>
          <StepHeader step={4} onBack={goBack} />

          <div>
            <h2 className="text-[1.75rem] font-bold text-[color:var(--foreground)] tracking-tight leading-tight">
              Apni preferences batao 🎯
            </h2>
            <p className="mt-2 text-[15px] text-[color:var(--muted)] leading-relaxed">
              Iske hisaab se best PGs suggest karenge. Dono optional hain.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wide">
                PG type
              </p>
              <ChipGrid
                options={GENDER_OPTIONS}
                value={form.gender}
                onChange={v => setForm(f => ({ ...f, gender: v }))}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wide">
                Room type
              </p>
              <ChipGrid
                options={ROOM_OPTIONS}
                value={form.roomType}
                onChange={v => setForm(f => ({ ...f, roomType: v }))}
              />
            </div>
          </div>

          {error && <FieldError msg={error} />}

          <div className="flex flex-col gap-2">
            <PrimaryButton label="Save preferences →" />
            <button
              type="button"
              onClick={() => { setError(null); setForm(f => ({ ...f, gender: "", roomType: "" })); setStep(5); }}
              className="py-2.5 text-[13px] text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors text-center"
            >
              Skip — I'll set this later
            </button>
          </div>
        </form>
      )}

      {/* ── Step 5: Password ─────────────────────────────────────── */}
      {step === 5 && (
        <form onSubmit={handlePassword} className="flex flex-col gap-6" noValidate>
          <StepHeader step={5} onBack={goBack} />

          <div>
            <h2 className="text-[1.75rem] font-bold text-[color:var(--foreground)] tracking-tight leading-tight">
              Almost done! 🔒
            </h2>
            <p className="mt-2 text-[15px] text-[color:var(--muted)] leading-relaxed">
              Ek strong password banao — uppercase, lowercase, number, aur special character.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wide" htmlFor="password">
                Password
              </label>
              <input
                ref={inputRef}
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => patch("password", e.target.value)}
                className={INPUT}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-wide" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={e => patch("confirmPassword", e.target.value)}
                className={INPUT}
              />
              {form.confirmPassword && (
                <span className={`flex items-center gap-1.5 text-[11px] mt-0.5 ${
                  form.password === form.confirmPassword
                    ? "text-[color:var(--success-700)]"
                    : "text-[color:var(--error-700)]"
                }`}>
                  {form.password === form.confirmPassword
                    ? <Check size={11} strokeWidth={3} />
                    : <X     size={11} strokeWidth={3} />}
                  {form.password === form.confirmPassword ? "Passwords match" : "Passwords don't match"}
                </span>
              )}
            </div>
          </div>

          {/* Compact confirmation summary */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[color:var(--line)]">
            <p className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">Your details</p>
            <div className="flex flex-wrap gap-1.5">
              <SummaryPill icon={UserRound} label={form.name} />
              <SummaryPill icon={Mail}      label={form.email} />
              {form.phone && <SummaryPill icon={Phone} label={form.phone} />}
              {form.gender   && <SummaryPill icon={Users}     label={GENDER_LABEL[form.gender   as Gender]}   />}
              {form.roomType && <SummaryPill icon={Home}      label={ROOM_LABEL[form.roomType   as RoomType]} />}
            </div>
          </div>

          {error && <FieldError msg={error} />}

          <PrimaryButton
            loading={loading}
            label={loading ? "Creating your account…" : "Create account"}
          />
        </form>
      )}

    </div>
  );
}

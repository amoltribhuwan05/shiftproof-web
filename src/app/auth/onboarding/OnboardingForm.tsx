"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import PhoneInput from "@/components/PhoneInput";

const INPUT_CLS =
  "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--accent-500)] focus:ring-4 focus:ring-[color:var(--accent-50)] placeholder:text-[color:var(--muted)]";

export default function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!gender) {
      setError("Please select your gender preference.");
      return;
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "");
    // Require at least 7 local digits if the user started entering a number
    const hasLocalDigits = cleanPhone.replace(/^\+\d{1,4}/, "").length >= 7;
    const phoneToSend = hasLocalDigits ? cleanPhone : undefined;

    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name.trim(),
          gender,
          phoneNumber: phoneToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to complete onboarding");
        return;
      }

      router.push(data.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="text-xs text-[color:var(--error-700)] bg-[color:var(--error-50)] rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="name">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          required
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={INPUT_CLS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="gender">
          Gender
        </label>
        <select
          id="gender"
          required
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className={INPUT_CLS}
        >
          <option value="" disabled>Select gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="CO_LIVING">Co-living</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[color:var(--muted)]" htmlFor="phone">
          Phone Number (Optional)
        </label>
        <PhoneInput
          id="phone"
          placeholder="98765 43210"
          value={phone}
          onChange={setPhone}
          className="bg-[color:var(--background)]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-colors"
      >
        {loading ? "Saving Profile..." : "Complete Setup"}
      </button>
    </form>
  );
}

"use client";

import { useState, useEffect, ChangeEvent } from "react";

const COUNTRY_CODES = [
  { code: "IN", dial: "+91" },
  { code: "US", dial: "+1"  },
  { code: "GB", dial: "+44" },
  { code: "AU", dial: "+61" },
  { code: "AE", dial: "+971"},
  { code: "SG", dial: "+65" },
];

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function PhoneInput({
  id, value, onChange, required, className = "", placeholder, disabled = false,
}: PhoneInputProps) {
  const [country, setCountry] = useState("+91");
  const [localNumber, setLocalNumber] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Parse an incoming controlled value once on first non-empty value
  useEffect(() => {
    if (!initialized && value) {
      const match = COUNTRY_CODES.find(c => value.startsWith(c.dial));
      if (match) {
        setCountry(match.dial);
        setLocalNumber(value.slice(match.dial.length).trimStart());
      } else {
        setLocalNumber(value);
      }
      setInitialized(true);
    } else if (!initialized && !value) {
      setInitialized(true);
    }
  }, [value, initialized]);

  // Detect country from Cloudflare geo on mount — only sets the dial prefix in UI,
  // never calls onChange (user hasn't typed anything yet)
  useEffect(() => {
    fetch("/api/geo")
      .then(r => r.json())
      .then(data => {
        if (data.country) {
          const match = COUNTRY_CODES.find(c => c.code === data.country);
          if (match) setCountry(match.dial);
        }
      })
      .catch(() => {});
  }, []);

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const dial = e.target.value;
    setCountry(dial);
    if (localNumber) onChange(`${dial} ${localNumber}`.trim());
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s-]/g, "");
    setLocalNumber(num);
    onChange(num ? `${country} ${num}`.trim() : "");
  };

  return (
    <div
      className={`flex items-stretch border border-[color:var(--line)] rounded-xl overflow-hidden
        focus-within:border-[color:var(--trust-700)] focus-within:ring-4 focus-within:ring-[color:var(--trust-50)]
        transition-colors ${disabled ? "opacity-60" : ""} ${className}`}
    >
      <select
        value={country}
        onChange={handleCountryChange}
        disabled={disabled}
        className="bg-transparent border-none pl-3 pr-1 py-3 text-sm text-[color:var(--foreground)] outline-none cursor-pointer focus:ring-0 font-medium disabled:cursor-not-allowed"
      >
        {COUNTRY_CODES.map(c => (
          <option key={c.code} value={c.dial}>
            {c.code} {c.dial}
          </option>
        ))}
      </select>
      <div className="w-px bg-[color:var(--line)] my-2" />
      <input
        id={id}
        type="tel"
        required={required}
        placeholder={placeholder ?? "98765 43210"}
        value={localNumber}
        onChange={handleNumberChange}
        disabled={disabled}
        className="flex-1 bg-transparent border-none px-3 py-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted)] focus:ring-0 w-full disabled:cursor-not-allowed"
      />
    </div>
  );
}

// Formatting utilities — currency, dates, initials.
// All functions are pure and side-effect free.

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format an integer rupee amount → "₹8,500" */
export function fmtINR(amount: number): string {
  return INR.format(amount);
}

/** Format an integer rupee amount compactly → "₹2.3L", "₹45K" */
export function fmtINRCompact(amount: number): string {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000)   return `₹${(amount / 1_000).toFixed(0)}K`;
  return `₹${amount}`;
}

/**
 * Format an ISO date string (YYYY-MM-DD or ISO 8601 timestamp).
 * mode "short" → "Apr 2"  |  "medium" → "Apr 2, 2025"  |  "rel" → "2h ago"
 */
export function fmtDate(
  iso: string,
  mode: "short" | "medium" | "long" | "rel" = "medium",
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;

  if (mode === "rel") {
    const diff = Date.now() - date.getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 1)   return "just now";
    if (hours < 1)   return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    if (days  < 7)   return `${days}d ago`;
  }

  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    short:  { month: "short", day: "numeric" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long:   { day: "numeric", month: "long",  year: "numeric" },
  };

  return date.toLocaleDateString("en-IN", opts[mode] ?? opts.medium);
}

/** Extract initials from a full name — "Rahul Sharma" → "RS" */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

/** Days remaining until an ISO date string (negative = past) */
export function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.round(ms / 86_400_000);
}

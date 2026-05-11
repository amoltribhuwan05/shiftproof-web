"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PhoneInput from "@/components/PhoneInput";
import {
  Home, CreditCard, Wrench, Bell, ChevronLeft, Menu, AlertCircle,
  CheckCircle2, Clock, IndianRupee, Calendar,
  Plus, Download, Send, FileText, Users, MapPin, Phone, ChevronDown,
  Shield, User, Lock, Smartphone, ToggleLeft, ToggleRight, Mail, MessageSquare,
  Edit3, Eye, EyeOff, Trash2, Settings, LogOut, RefreshCw, ArrowRight, Link2,
} from "lucide-react";
import { api, ApiError, type AppUser, type CurrentStay, type Property as ApiProperty, type Payment as ApiPayment, type Notification as ApiNotification, type MaintenanceRequest as ApiMaintenanceRequest } from "@/lib/api";
import { signOut, GoogleAuthProvider, linkWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ─── Error boundary ───────────────────────────────────────────────────────────

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={22} className="text-red-500" />
            </div>
            <h2 className="text-slate-900 font-semibold text-lg mb-2">Something went wrong</h2>
            <p className="text-slate-500 text-sm mb-6">An unexpected error occurred. Try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-sm font-medium rounded-xl transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Razorpay ─────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay?: new (opts: RzpOpts) => { open(): void };
  }
}
type RzpOpts = {
  key: string; amount: number; currency: string;
  name: string; description: string; order_id: string; receipt: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
};

async function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return;
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load payment SDK"));
    document.head.appendChild(s);
  });
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavId = "overview" | "myroom" | "payments" | "maintenance" | "notices" | "account";

type PaymentDisplay = {
  id?: string;
  month: string;
  year: number;
  amount: number;
  status: "paid" | "due" | "overdue";
  date: string;
  receipt: string | null;
};

type TicketDisplay = {
  id: string;
  title: string;
  category: string;
  date: string;
  status: string;
  priority: string;
  response?: string;
};

// ─── Display type ─────────────────────────────────────────────────────────────

type TenantDisplay = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  avatarUrl: string;
  city: string;
  area: string;
  gender: string;
  pg: string;
  room: string;
  type: string;
  floor: string;
  rent: number;
  deposit: number;
  checkIn: string;
  leaseStart: string;
  leaseEnd: string;
  leaseDaysLeft: number;
  address: string;
  pgContact: string;
  pgManager: string;
};

function buildTenantDisplay(user: AppUser | null, stay: CurrentStay | null): TenantDisplay {
  const name = user?.name ?? "—";
  const leaseEnd = stay?.leaseEnd ?? "";
  const leaseDaysLeft = leaseEnd
    ? Math.max(0, Math.round((new Date(leaseEnd).getTime() - Date.now()) / 86_400_000))
    : 0;
  return {
    id: user?.id ?? "",
    name,
    email: user?.email ?? "",
    phone: user?.phoneNumber ?? "",
    initials: name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase(),
    avatarUrl: user?.avatarUrl ?? "",
    city: user?.city ?? "",
    area: user?.area ?? "",
    gender: user?.gender ?? "",
    pg: stay?.propertyName ?? "—",
    room: stay?.roomNumber ?? "—",
    type: "Single",
    floor: "1",
    rent: stay?.rentAmount ?? 0,
    deposit: 0,
    checkIn: stay?.leaseStart ?? "—",
    leaseStart: stay?.leaseStart ?? "—",
    leaseEnd,
    leaseDaysLeft,
    address: stay?.address ?? "—",
    pgContact: stay?.ownerPhone ?? "—",
    pgManager: stay?.ownerName ?? "—",
  };
}

// ─── Nav config ────────────────────────────────────────────────────────────────

const NAV_IDS: NavId[] = ["overview", "myroom", "payments", "maintenance", "notices"];
const NAV_LABELS: Record<NavId, string> = {
  overview:    "Overview",
  myroom:      "My Room",
  payments:    "Payments",
  maintenance: "Maintenance",
  notices:     "Notices",
  account:     "Account",
};
const NAV_ICONS: Record<NavId, React.ReactElement> = {
  overview:    <Home       size={15} strokeWidth={1.75} />,
  myroom:      <Shield     size={15} strokeWidth={1.75} />,
  payments:    <CreditCard size={15} strokeWidth={1.75} />,
  maintenance: <Wrench     size={15} strokeWidth={1.75} />,
  notices:     <Bell       size={15} strokeWidth={1.75} />,
  account:     <User       size={15} strokeWidth={1.75} />,
};

// ─── Small components ──────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid:        "bg-success-50 text-success-700 ring-1 ring-[color:var(--success)]/30",
    due:         "bg-warning-50 text-warning-700 ring-1 ring-[color:var(--warning)]/30",
    overdue:     "bg-error-50 text-error-700 ring-1 ring-[color:var(--error)]/30",
    in_progress: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    resolved:    "bg-success-50 text-success-700 ring-1 ring-[color:var(--success)]/30",
    open:        "bg-warning-50 text-warning-700 ring-1 ring-[color:var(--warning)]/30",
  };
  const labels: Record<string, string> = {
    paid: "Paid", due: "Due", overdue: "Overdue",
    in_progress: "In Progress", resolved: "Resolved", open: "Open",
  };
  const dots: Record<string, string> = {
    paid: "bg-success", due: "bg-warning", overdue: "bg-error",
    in_progress: "bg-blue-500", resolved: "bg-success", open: "bg-warning",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[status] ?? "bg-[color:var(--background)] text-slate-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? "bg-slate-400"}`} />
      {labels[status] ?? status}
    </span>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const s: Record<string, string> = {
    high:   "bg-error-50 text-error-700 ring-1 ring-[color:var(--error)]/30",
    medium: "bg-warning-50 text-warning-700 ring-1 ring-[color:var(--warning)]/30",
    low:    "bg-[color:var(--background)] text-slate-500 ring-1 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${s[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  const palettes = [
    "bg-accent-100 text-accent-600", "bg-[color:var(--background)] text-slate-600",
    "bg-success-50 text-success-700", "bg-warning-50 text-warning-700",
    "bg-error-50 text-error-700", "bg-accent-100 text-accent-600",
  ];
  const p   = palettes[initials.charCodeAt(0) % palettes.length];
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-bold shrink-0 ${dim} ${p}`}>
      {initials}
    </span>
  );
}

function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub: string;
  icon: React.ReactElement; accent: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>{icon}</span>
      </div>
      <p className="text-xl font-semibold text-[color:var(--foreground)]">{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Section: Overview ─────────────────────────────────────────────────────────

function OverviewSection({ onNav, tenant, payments, tickets, notices, onPayNow, hasStay }: {
  onNav: (id: NavId) => void;
  tenant: TenantDisplay;
  payments: PaymentDisplay[];
  tickets: TicketDisplay[];
  notices: ApiNotification[];
  onPayNow?: (id: string) => void;
  hasStay: boolean;
}) {
  const unread         = notices.filter(n => !n.isRead).length;
  const openTickets    = tickets.filter(m => m.status !== "resolved").length;
  const currentPayment = payments.at(-1)!;
  const rentLabel      = currentPayment ? `${currentPayment.month} ${currentPayment.year} Rent` : "Rent";
  const dueDateSub     = currentPayment ? `Due by ${currentPayment.month} 5, ${currentPayment.year}` : "Due soon";

  const activityItems = (() => {
    const items: { emoji: string; bg: string; text: string; time: string; ts: number }[] = [];
    const lastPaid = [...payments].reverse().find(p => p.status === "paid");
    if (lastPaid) {
      const d = new Date(lastPaid.date);
      items.push({
        emoji: "✓", bg: "bg-success-50",
        text: `${lastPaid.month} ${lastPaid.year} rent paid — ₹${lastPaid.amount.toLocaleString("en-IN")}`,
        time: !isNaN(d.getTime()) ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : lastPaid.date,
        ts: d.getTime() || 0,
      });
    }
    const sortedTickets = [...tickets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const t of sortedTickets.slice(0, 2)) {
      const d = new Date(t.date);
      const resolved = t.status === "resolved";
      items.push({
        emoji: resolved ? "✓" : "🔧",
        bg: resolved ? "bg-success-50" : "bg-blue-50",
        text: resolved ? `${t.title} resolved` : `${t.title} — request created`,
        time: !isNaN(d.getTime()) ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : t.date,
        ts: d.getTime() || 0,
      });
    }
    const latestNotice = [...notices].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (latestNotice) {
      const d = new Date(latestNotice.timestamp);
      items.push({
        emoji: "📢", bg: "bg-warning-50",
        text: `Notice: ${latestNotice.title}`,
        time: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        ts: d.getTime() || 0,
      });
    }
    return items.sort((a, b) => b.ts - a.ts).slice(0, 4);
  })();

  const toast = useToast();
  const [joinCode, setJoinCode] = React.useState("");
  const [joining, setJoining] = React.useState(false);
  const [joined, setJoined] = React.useState(false);

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      await api.tenants.join(joinCode.trim());
      setJoined(true);
      toast.success("Joined successfully! Refresh to see your stay details.");
    } catch {
      toast.error("Invalid or expired invite code. Ask your owner to resend.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* No-stay: join card */}
      {!hasStay && !joined && (
        <div className="rounded-2xl border border-[color:var(--accent-200)] bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[color:var(--accent-500)] to-[color:var(--accent-700)] px-6 pt-6 pb-10">
            <p className="text-white font-bold text-base mb-1">Join your PG</p>
            <p className="text-white/75 text-xs">Enter the invite code shared by your property owner to link your stay.</p>
          </div>
          <div className="px-6 -mt-5">
            <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-md p-5">
              {joined ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-success-600" />
                  </div>
                  <p className="font-semibold text-[color:var(--foreground)]">You&apos;re in!</p>
                  <p className="text-xs text-[color:var(--muted)]">Refresh the page to see your stay details.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Invite Code</label>
                    <input
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && handleJoin()}
                      placeholder="e.g. SP-A3F9X2"
                      maxLength={20}
                      className="w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-2.5 text-sm font-mono text-[color:var(--foreground)] outline-none focus:border-success-600 focus:ring-2 focus:ring-success-50 placeholder:text-[color:var(--muted)] tracking-wider transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={joining || !joinCode.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 text-white text-sm font-bold py-2.5 transition-colors"
                  >
                    {joining ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                    {joining ? "Joining…" : "Join Property"}
                  </button>
                  <p className="text-[10px] text-center text-[color:var(--muted)]">
                    Don&apos;t have a code? Ask your property owner to send an invite.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="px-6 py-4" />
        </div>
      )}
      {!hasStay && joined && (
        <div className="rounded-2xl border border-success-200 bg-success-50 p-5 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-success-700 shrink-0" />
          <div>
            <p className="text-sm font-bold text-success-900">Joined successfully!</p>
            <p className="text-xs text-success-700 mt-0.5">Refresh the page to see your room and lease details.</p>
          </div>
        </div>
      )}

      {/* Greeting banner */}
      <div className="bg-accent-500 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold opacity-75 mb-1">Good morning</p>
        <p className="text-lg font-semibold">{tenant.name}</p>
        {tenant.pg && <p className="text-xs opacity-75 mt-0.5">{tenant.pg} · Room {tenant.room} · {tenant.type}</p>}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={rentLabel}
          value={currentPayment?.status === "paid" ? "Paid" : currentPayment ? `₹${currentPayment.amount.toLocaleString("en-IN")}` : "—"}
          sub={currentPayment?.status === "paid" ? `Paid on ${currentPayment.date}` : dueDateSub}
          icon={<IndianRupee size={14} strokeWidth={2} className={currentPayment?.status === "paid" ? "text-success-700" : "text-warning-700"} />}
          accent={currentPayment?.status === "paid" ? "bg-success-50" : "bg-warning-50"}
        />
        <KpiCard
          label="Lease Expires"
          value={`${tenant.leaseDaysLeft}d`}
          sub={`Ends ${tenant.leaseEnd}`}
          icon={<Calendar size={14} strokeWidth={2} className="text-accent-500" />}
          accent="bg-accent-50"
        />
        <KpiCard
          label="Open Tickets"
          value={String(openTickets)}
          sub={openTickets === 0 ? "All resolved" : `${openTickets} in progress`}
          icon={<Wrench size={14} strokeWidth={2} className={openTickets > 0 ? "text-warning-700" : "text-slate-400"} />}
          accent={openTickets > 0 ? "bg-warning-50" : "bg-[color:var(--background)]"}
        />
        <KpiCard
          label="Notices"
          value={String(unread)}
          sub={unread > 0 ? `${unread} unread` : "All caught up"}
          icon={<Bell size={14} strokeWidth={2} className={unread > 0 ? "text-error-700" : "text-slate-400"} />}
          accent={unread > 0 ? "bg-error-50" : "bg-[color:var(--background)]"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment snapshot */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-700">Payment Overview</p>
            <button onClick={() => onNav("payments")} className="text-[11px] text-accent-500 hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {payments.slice(-4).map(p => (
              <div key={p.month} className="flex items-center justify-between py-1.5 border-b border-[color:var(--background)] last:border-0">
                <div className="flex items-center gap-2">
                  {p.status === "paid"
                    ? <CheckCircle2 size={14} className="text-success-700 shrink-0" />
                    : <Clock        size={14} className="text-warning-700 shrink-0"   />
                  }
                  <span className="text-xs text-slate-700">{p.month} {p.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[color:var(--foreground)]">₹{p.amount.toLocaleString("en-IN")}</span>
                  <StatusPill status={p.status} />
                </div>
              </div>
            ))}
          </div>
          {currentPayment?.status === "due" && (
            <button
              onClick={() => currentPayment.id && onPayNow?.(currentPayment.id)}
              className="mt-4 w-full py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold transition-colors"
            >
              Pay ₹{currentPayment.amount.toLocaleString("en-IN")} Now
            </button>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-700 mb-4">Recent Activity</p>
          <div className="space-y-3">
            {activityItems.map((item, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <span className={`w-7 h-7 ${item.bg} rounded-full flex items-center justify-center shrink-0 text-sm`}>{item.emoji}</span>
                <div>
                  <p className="text-slate-700">{item.text}</p>
                  <p className="text-slate-400 text-[11px]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unread notices strip */}
      {unread > 0 && (
        <div className="bg-warning-50 border border-[color:var(--warning)]/30 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-warning-700 shrink-0" />
              <p className="text-xs font-semibold text-warning-700">
                You have {unread} unread notice{unread > 1 ? "s" : ""}
              </p>
            </div>
            <button onClick={() => onNav("notices")} className="text-[11px] font-semibold text-warning-700 hover:underline">
              View →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: My Room ──────────────────────────────────────────────────────────

function MyRoomSection({ tenant, amenities, roomImageUrl }: { tenant: TenantDisplay; amenities: string[]; roomImageUrl?: string }) {
  const leaseTotal = React.useMemo(() => {
    if (tenant.leaseStart && tenant.leaseEnd) {
      const ms = new Date(tenant.leaseEnd).getTime() - new Date(tenant.leaseStart).getTime();
      return Math.max(1, Math.round(ms / 86_400_000));
    }
    return 365;
  }, [tenant.leaseStart, tenant.leaseEnd]);

  return (
    <div className="space-y-5">
      {/* Room hero */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className={`h-36 relative ${roomImageUrl ? "" : "bg-gradient-to-br from-[color:var(--accent-700)] to-[color:var(--accent-500)]"}`}>
          {roomImageUrl && (
            <img
              src={roomImageUrl}
              alt="Room"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--foreground)]/70 to-transparent flex items-end p-4">
            <div>
              <p className="text-white text-lg font-semibold">Room {tenant.room}</p>
              <p className="text-white/75 text-xs">{tenant.type} · Floor {tenant.floor}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "PG Name",       value: tenant.pg                                   },
              { label: "Monthly Rent",  value: `₹${tenant.rent.toLocaleString("en-IN")}`   },
              { label: "Deposit Paid",  value: `₹${tenant.deposit.toLocaleString("en-IN")}` },
              { label: "Check-in Date", value: tenant.checkIn                               },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">{label}</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lease info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FileText size={13} /> Lease Agreement
          </p>
          <div className="space-y-3">
            {[
              { label: "Start Date",      value: tenant.leaseStart,                  color: ""              },
              { label: "End Date",        value: tenant.leaseEnd,                    color: ""              },
              { label: "Days Remaining",  value: `${tenant.leaseDaysLeft} days`,     color: "text-accent-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between">
                <span className="text-[11px] text-slate-400">{label}</span>
                <span className={`text-xs font-semibold ${color || "text-slate-800"}`}>{value}</span>
              </div>
            ))}
            <div className="h-1.5 bg-[color:var(--background)] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-accent-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((tenant.leaseDaysLeft / leaseTotal) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">{tenant.leaseDaysLeft} / {leaseTotal} days left</p>
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-[color:var(--background)] transition-colors">
            <Download size={12} /> Download Lease PDF
          </button>
        </div>

        {/* Contact + roommates */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-2">
            <MapPin size={13} /> Property &amp; Contact
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <span className="text-xs text-slate-700">{tenant.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700">{tenant.pgContact}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users size={14} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700">Manager: {tenant.pgManager}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[color:var(--background)]">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Floor {tenant.floor} Neighbors
            </p>
            <p className="text-[11px] text-slate-400">Neighbor info not available.</p>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-700 mb-3">Amenities Included</p>
          <div className="flex flex-wrap gap-2">
            {amenities.map(a => (
              <span key={a} className="text-[11px] font-medium bg-accent-50 text-accent-600 border border-accent-100 px-2.5 py-1 rounded-lg">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Payments ─────────────────────────────────────────────────────────

function PaymentsSection({ payments, onPayNow }: { payments: PaymentDisplay[]; onPayNow?: (id: string) => void; }) {
  const toast = useToast();
  async function downloadReceipt(paymentId: string) {
    try {
      const blob = await api.payments.receipt(paymentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download receipt — please try again.");
    }
  }
  const currentMonth = payments.at(-1)!;
  const monthLabel = currentMonth ? `${currentMonth.month} ${currentMonth.year}` : "";

  return (
    <div className="space-y-5">
      {/* Current month banner */}
      <div className={`rounded-2xl p-5 border ${currentMonth?.status === "paid" ? "bg-success-50 border-[color:var(--success)]/30" : "bg-warning-50 border-[color:var(--warning)]/30"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold mb-1 ${currentMonth?.status === "paid" ? "text-success-700" : "text-warning-700"}`}>
              {currentMonth?.status === "paid" ? `${monthLabel} rent paid` : `${monthLabel} rent due`}
            </p>
            <p className="text-2xl font-semibold text-[color:var(--foreground)]">₹{currentMonth?.amount.toLocaleString("en-IN")}</p>
            <p className={`text-[11px] mt-0.5 ${currentMonth?.status === "paid" ? "text-success-700" : "text-warning-700"}`}>
              {currentMonth?.status === "paid" ? `Paid on ${currentMonth.date}` : `Due by ${currentMonth?.month} 5, ${currentMonth?.year}`}
            </p>
          </div>
          {currentMonth?.status !== "paid" ? (
            <button
              onClick={() => currentMonth?.id && onPayNow?.(currentMonth.id)}
              className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Pay Now
            </button>
          ) : (
            <button className="flex items-center gap-1.5 px-4 py-2 border border-[color:var(--success)]/30 text-success-700 text-xs font-semibold rounded-xl hover:bg-success-50 transition-colors">
              <Download size={12} /> Receipt
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">{payments.filter(p => p.status === "paid").length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Months Paid</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-lg font-semibold text-success-700">₹{Math.round(payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0) / 1000)}k</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total Paid</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-lg font-semibold text-accent-600">0</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Late Payments</p>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[color:var(--background)]">
          <p className="text-xs font-bold text-slate-700">Payment History</p>
        </div>
        <div className="divide-y divide-[color:var(--background)]">
          {[...payments].reverse().map(p => (
            <div key={`${p.month}-${p.year}`} className="flex items-center gap-3 px-5 py-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${p.status === "paid" ? "bg-success-50" : "bg-warning-50"}`}>
                {p.status === "paid"
                  ? <CheckCircle2 size={14} className="text-success-700" />
                  : <Clock        size={14} className="text-warning-700" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{p.month} {p.year}</p>
                <p className="text-[11px] text-slate-400">{p.date}</p>
              </div>
              <span className="text-xs font-bold text-[color:var(--foreground)] shrink-0">
                ₹{p.amount.toLocaleString("en-IN")}
              </span>
              <StatusPill status={p.status} />
              {(p.status === "paid" && p.id) && (
                <button
                  onClick={() => downloadReceipt(p.id!)}
                  className="text-[11px] text-accent-500 hover:underline shrink-0 flex items-center gap-1"
                >
                  <Download size={10} /> PDF
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Maintenance ──────────────────────────────────────────────────────

function MaintenanceSection({ tickets, onSubmit }: { tickets: TicketDisplay[]; onSubmit?: (title: string, priority: string, desc: string) => Promise<void> }) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState("Electrical");
  const [priority, setPriority] = useState("medium");
  const [desc,     setDesc]     = useState("");

  const open   = tickets.filter(m => m.status !== "resolved");
  const closed = tickets.filter(m => m.status === "resolved");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          {open.length} open · {closed.length} resolved
        </p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <Plus size={13} /> New Request
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <div className="bg-white border border-accent-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-slate-800">Submit Maintenance Request</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Issue Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-100 transition"
                placeholder="Describe the issue briefly"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-500 transition bg-white"
              >
                {["Electrical","Plumbing","Furniture","Structural","Appliances","Other"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Priority</label>
              <div className="flex gap-2">
                {["low","medium","high"].map(p => (
                  <label
                    key={p}
                    className={`flex-1 text-center py-1.5 text-[11px] font-semibold border rounded-lg cursor-pointer transition capitalize ${priority === p ? "border-accent-500 bg-accent-50 text-accent-600" : "border-slate-200 text-slate-500 hover:border-accent-200"}`}
                  >
                    <input type="radio" className="sr-only" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Additional Details</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-500 resize-none transition"
                placeholder="Any extra context (optional)"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={submitting || !title.trim()}
              onClick={async () => {
                if (!title.trim()) return;
                setSubmitting(true);
                try {
                  if (onSubmit) await onSubmit(title.trim(), priority, desc.trim());
                  else toast.success("Request submitted", "We'll notify your owner shortly");
                  setShowForm(false);
                  setTitle("");
                  setDesc("");
                } catch {
                  toast.error("Failed to submit — please try again.");
                } finally {
                  setSubmitting(false);
                }
              }}
              className="flex items-center gap-1.5 px-5 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              <Send size={11} /> {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </div>
      )}

      {/* Open tickets */}
      {open.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[color:var(--background)]">
            <p className="text-xs font-bold text-slate-700">Open Requests</p>
          </div>
          <div className="divide-y divide-[color:var(--background)]">
            {open.map(m => (
              <div key={m.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-slate-800">{m.title}</p>
                    <StatusPill status={m.status} />
                    <PriorityPill priority={m.priority} />
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{m.date}</span>
                </div>
                <p className="text-[11px] text-slate-500">{m.category} · {m.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved tickets */}
      {closed.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[color:var(--background)]">
            <p className="text-xs font-bold text-slate-700">Resolved</p>
          </div>
          <div className="divide-y divide-[color:var(--background)]">
            {closed.map(m => (
              <div key={m.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-slate-400 line-through">{m.title}</p>
                    <StatusPill status={m.status} />
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{m.date}</span>
                </div>
                <p className="text-[11px] text-slate-400">{m.category} · {m.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Notices ──────────────────────────────────────────────────────────

function NoticesSection({ initialNotices }: { initialNotices: ApiNotification[] }) {
  const [notices, setNotices] = useState(initialNotices);

  const markRead = (id: string) => {
    setNotices((ns: ApiNotification[]) => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
    api.notifications.markRead(id).catch(() => {});
  };

  const typeStyle: Record<string, string> = {
    info:     "bg-blue-50 text-blue-700 border-blue-200",
    reminder: "bg-warning-50 text-warning-700 border-[color:var(--warning)]/30",
    policy:   "bg-accent-50 text-accent-600 border-accent-200",
  };
  const typeLabel: Record<string, string> = {
    info: "Info", reminder: "Reminder", policy: "Policy",
  };

  const unread = notices.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{unread} unread · {notices.length} total</p>
      {notices.map(n => (
        <div
          key={n.id}
          className={`bg-white border border-slate-200 rounded-2xl p-5 transition-opacity ${n.isRead ? "opacity-60" : ""}`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />}
              <p className={`text-xs font-bold ${n.isRead ? "text-slate-500" : "text-[color:var(--foreground)]"}`}>{n.title}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeStyle[n.type] ?? "bg-[color:var(--background)] text-slate-500 border-slate-200"}`}>
                {typeLabel[n.type] ?? n.type}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">{new Date(n.timestamp).toLocaleDateString("en-IN")}</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">{n.description}</p>
          {!n.isRead && (
            <button
              onClick={() => markRead(n.id)}
              className="text-[11px] text-accent-500 hover:underline font-semibold"
            >
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function AccountSection({ tenant, providers = [], roleLabel = "Tenant" }: { tenant: TenantDisplay; providers?: string[]; roleLabel?: string }) {
  const toast = useToast();
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
  async function handleLinkProvider(provider: string) {
    if (!auth?.currentUser) { toast.error("Not signed in"); return; }
    setLinkingProvider(provider);
    try {
      const preflight = await api.auth.linkingStart(provider);
      if (!preflight.allowed) {
        toast.error(preflight.recommendedNextStep === "sign_in_existing"
          ? "That account already exists — sign in with it instead"
          : "Cannot link this provider right now");
        return;
      }
      if (provider === "google") {
        const cred = await linkWithPopup(auth.currentUser, new GoogleAuthProvider());
        const idToken = await cred.user.getIdToken(true);
        await api.auth.linkingComplete(idToken);
        toast.success("Google linked to your account");
      } else {
        toast.success("To link phone: sign out and sign in with your phone number, then link accounts");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("popup-closed")) toast.error("Popup closed — try again");
      else if (msg.includes("already-in-use")) toast.error("This account is already linked to another user");
      else toast.error("Linking failed — try again");
    } finally {
      setLinkingProvider(null);
    }
  }
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: tenant.name, email: tenant.email, phone: tenant.phone,
    city: tenant.city, area: tenant.area, gender: tenant.gender,
  });

  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState<import("@/lib/api").NotificationPreferences>({ email: true, push: true, sms: false });

  const idDocs: { label: string; status: "verified" | "pending" | "missing"; number: string }[] = [];

  React.useEffect(() => {
    api.auth.getNotifPrefs().then(setNotifPrefs).catch(() => {});
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.auth.updateProfile({
        name: profileForm.name || undefined,
        phoneNumber: profileForm.phone || undefined,
        city: profileForm.city || undefined,
        area: profileForm.area || undefined,
        gender: profileForm.gender || undefined,
      });
      setEditingProfile(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePwd() {
    if (!pwdForm.old) { setPwdError("Enter your current password."); return; }
    if (pwdForm.next.length < 6) { setPwdError("Min. 6 characters required."); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdError("Passwords don't match."); return; }
    setPwdError(null);
    setSavingPwd(true);
    try {
      await api.auth.changePassword(pwdForm.next);
      setPwdForm({ old: "", next: "", confirm: "" });
      toast.success("Password updated");
    } catch {
      setPwdError("Failed to update password. Please try again.");
    } finally {
      setSavingPwd(false);
    }
  }

  async function toggleNotifChannel(ch: keyof import("@/lib/api").NotificationPreferences) {
    const updated = { ...notifPrefs, [ch]: !notifPrefs[ch] };
    setNotifPrefs(updated);
    try {
      await api.auth.updateNotifPrefs(updated);
    } catch {
      setNotifPrefs(notifPrefs);
    }
  }

  const INPUT = "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:border-success-600 focus:ring-2 focus:ring-success-50 placeholder:text-[color:var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const CARD  = "bg-white rounded-2xl border border-[color:var(--background)] shadow-sm p-5";
  const SEC   = "text-sm font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2";

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-8">

      {/* Profile */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-4">
          <h2 className={SEC}><User size={14} className="text-success-600" /> Profile</h2>
          {!editingProfile ? (
            <button onClick={() => setEditingProfile(true)}
              className="flex items-center gap-1 text-xs font-semibold text-success-700 hover:underline">
              <Edit3 size={11} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditingProfile(false); setProfileForm({ name: tenant.name, email: tenant.email, phone: tenant.phone, city: tenant.city, area: tenant.area, gender: tenant.gender }); }}
                disabled={savingProfile} className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-50">Cancel</button>
              <button onClick={saveProfile} disabled={savingProfile}
                className="text-xs font-semibold bg-success-700 text-white px-3 py-1 rounded-lg hover:bg-success-800 transition-colors disabled:opacity-60">
                {savingProfile ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-success-50 border border-[color:var(--success)]/20 flex items-center justify-center text-lg font-bold text-success-700 shrink-0 overflow-hidden">
            {tenant.avatarUrl && !avatarImgError
              ? <img src={tenant.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setAvatarImgError(true)} />
              : tenant.initials}
          </div>
          <div>
            <p className="text-sm font-bold text-[color:var(--foreground)]">{profileForm.name}</p>
            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-50 text-success-700 uppercase tracking-wide">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "Full Name", key: "name",  type: "text" },
            { label: "Email",     key: "email", type: "email" },
            { label: "Mobile",    key: "phone", type: "tel" },
            { label: "City",      key: "city",  type: "text" },
            { label: "Area",      key: "area",  type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
              {type === "tel" ? (
                <PhoneInput
                  disabled={!editingProfile}
                  value={profileForm[key as keyof typeof profileForm]}
                  onChange={val => setProfileForm(f => ({ ...f, [key]: val }))}
                  className="bg-[color:var(--background)]"
                />
              ) : (
                <input
                  type={type}
                  disabled={!editingProfile}
                  value={profileForm[key as keyof typeof profileForm]}
                  onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                  className={INPUT}
                />
              )}
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Gender</label>
            <select
              disabled={!editingProfile}
              value={profileForm.gender}
              onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))}
              className={INPUT}
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="CO_LIVING">Co-living / Any</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current tenancy (read-only summary) */}
      <div className={CARD}>
        <h2 className={SEC}><Home size={14} className="text-success-600" /> Current Tenancy</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "PG",       value: tenant.pg },
            { label: "Room",     value: `${tenant.room} · ${tenant.type}` },
            { label: "Check-in", value: tenant.checkIn },
            { label: "Lease end",value: tenant.leaseEnd },
            { label: "Rent",     value: `₹${tenant.rent.toLocaleString()}/mo` },
            { label: "Deposit",  value: `₹${tenant.deposit.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
              <p className="font-semibold text-[color:var(--foreground)]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ID Documents */}
      <div className={CARD}>
        <h2 className={SEC}><FileText size={14} className="text-success-600" /> Identity Documents</h2>
        <div className="space-y-2">
          {idDocs.map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[color:var(--background)] bg-[color:var(--background)]">
              <div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{doc.label}</p>
                <p className="text-[11px] text-slate-400">{doc.number}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                doc.status === "verified"
                  ? "bg-success-50 text-success-700"
                  : "bg-warning-50 text-warning-700"
              }`}>
                {doc.status === "verified" ? "Verified" : "Pending"}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full text-xs font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-success-400 hover:text-success-700 py-2.5 rounded-xl transition-colors">
          + Upload Document
        </button>
      </div>

      {/* Notifications */}
      <div className={CARD}>
        <h2 className={SEC}><Bell size={14} className="text-success-600" /> Notifications</h2>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Channels</p>
        <div className="flex gap-2 mb-3">
          {(["email", "push", "sms"] as const).map(ch => {
            const Icon = ch === "email" ? Mail : ch === "push" ? Bell : MessageSquare;
            return (
              <button key={ch}
                onClick={() => toggleNotifChannel(ch)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  notifPrefs[ch]
                    ? "bg-success-700 text-white border-success-700"
                    : "border-slate-200 text-slate-400 hover:border-success-400"
                }`}
              >
                <Icon size={11} />
                {ch.charAt(0).toUpperCase() + ch.slice(1)}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400">Changes are saved automatically.</p>
      </div>

      {/* Security */}
      <div className={CARD}>
        <h2 className={SEC}><Lock size={14} className="text-success-600" /> Change Password</h2>
        <div className="space-y-3">
          {[
            { label: "Current password", key: "old",     show: showOldPwd, toggle: () => setShowOldPwd(v => !v) },
            { label: "New password",     key: "next",    show: showNewPwd, toggle: () => setShowNewPwd(v => !v) },
            { label: "Confirm password", key: "confirm", show: showNewPwd, toggle: () => {} },
          ].map(({ label, key, show, toggle }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••"
                  value={pwdForm[key as keyof typeof pwdForm]}
                  onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                  className={INPUT + " pr-10"}
                />
                {key !== "confirm" && (
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {show ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {pwdError && (
          <p className="mt-2 text-xs text-error-700 bg-error-50 rounded-lg px-3 py-2">{pwdError}</p>
        )}
        <button onClick={savePwd} disabled={savingPwd}
          className="mt-4 text-xs font-semibold bg-[color:var(--foreground)] hover:opacity-80 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-opacity">
          {savingPwd ? "Updating…" : "Update Password"}
        </button>
      </div>

      {/* Linked accounts */}
      <div className={CARD}>
        <h2 className={SEC}><Link2 size={14} className="text-[color:var(--accent-500)]" /> Linked Accounts</h2>
        <p className="text-xs text-slate-500 mb-4">Link sign-in methods so you can log in with any of them.</p>
        <div className="space-y-3">
          {([
            { provider: "google", label: "Google", icon: (
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )},
            { provider: "phone", label: "Phone (OTP)", icon: <Smartphone size={15} className="text-[color:var(--accent-500)] shrink-0" /> },
          ] as { provider: string; label: string; icon: React.ReactNode }[]).map(({ provider, label, icon }) => {
            const linked = providers.includes(provider);
            return (
              <div key={provider} className="flex items-center justify-between p-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)]">
                <div className="flex items-center gap-3">
                  {icon}
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{label}</p>
                    <p className="text-xs text-slate-500">{linked ? "Connected" : "Not linked"}</p>
                  </div>
                </div>
                {linked ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={12} /> Linked
                  </span>
                ) : (
                  <button onClick={() => handleLinkProvider(provider)} disabled={linkingProvider === provider}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--accent-600)] border border-[color:var(--accent-200)] hover:bg-[color:var(--accent-50)] px-3 py-1.5 rounded-full transition-colors disabled:opacity-60">
                    {linkingProvider === provider ? <RefreshCw size={11} className="animate-spin" /> : <Link2 size={11} />}
                    Link
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger */}
      <div className={`${CARD} border-error/20`}>
        <h2 className={`${SEC} text-error-700`}><Trash2 size={14} className="text-error" /> Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">
          Requesting deletion will remove your account and data within 30 days. Contact your owner first to settle any pending dues.
        </p>
        <button className="text-xs font-semibold border border-error/30 text-error-700 hover:bg-error-50 px-4 py-2.5 rounded-xl transition-colors">
          Request Account Deletion
        </button>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

const VALID_TENANT_TABS = new Set<NavId>(["overview","myroom","payments","maintenance","notices","account"]);

function TenantDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [activeNav, setActiveNav] = useState<NavId>(() => {
    const t = searchParams.get("tab") as NavId | null;
    return t && VALID_TENANT_TABS.has(t) ? t : "overview";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [stay, setStay] = useState<CurrentStay | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [contexts, setContexts] = useState<import("@/lib/api").RoleContext[]>([]);
  const [contextOpen, setContextOpen] = useState(false);
  const [apiPayments, setApiPayments] = useState<ApiPayment[] | null>(null);
  const [apiNotifications, setApiNotifications] = useState<ApiNotification[] | null>(null);
  const [apiMaintenance, setApiMaintenance] = useState<ApiMaintenanceRequest[] | null>(null);
  const [apiProperty, setApiProperty] = useState<ApiProperty | null>(null);
  const [paying, setPaying] = useState(false);

  function navTo(tab: NavId) {
    setActiveNav(tab);
    router.replace(`/tenant-dashboard?tab=${tab}`, { scroll: false });
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [me, currentStay] = await Promise.all([
          api.auth.me(),
          api.auth.currentStay(),
        ]);
        setUser(me);
        setStay(currentStay);
        api.auth.contexts().then(setContexts).catch(() => {});

        const propertyId = currentStay?.propertyId ?? null;
        const parallelCalls: Promise<unknown>[] = [
          api.payments.list({ limit: 24 }),
          api.notifications.list(1, 20),
          ...(propertyId ? [
            api.maintenance.list(propertyId, { limit: 50 }),
            api.properties.get(propertyId),
          ] : []),
        ];
        const [paymentsRes, notifRes, maintenanceRes, propertyRes] = await Promise.allSettled(parallelCalls) as [
          PromiseSettledResult<{ data: ApiPayment[] }>,
          PromiseSettledResult<{ data: ApiNotification[] }>,
          PromiseSettledResult<{ data: ApiMaintenanceRequest[] }> | undefined,
          PromiseSettledResult<ApiProperty> | undefined,
        ];
        if (paymentsRes.status    === "fulfilled") setApiPayments(paymentsRes.value.data);
        if (notifRes.status       === "fulfilled") setApiNotifications(notifRes.value.data);
        if (maintenanceRes?.status === "fulfilled") setApiMaintenance((maintenanceRes.value as { data: ApiMaintenanceRequest[] }).data);
        if (propertyRes?.status    === "fulfilled") setApiProperty(propertyRes.value as ApiProperty);
      } catch (err) {
        const status = err instanceof ApiError ? err.status : (err as { status?: number }).status;
        const message = err instanceof Error ? err.message : "Unable to load your dashboard.";
        if (typeof status === "number") {
          if (status === 409 || (err as Error).message?.toLowerCase().includes("conflict")) {
            if (auth) await signOut(auth);
            await fetch("/api/auth/logout", { method: "POST" });
            router.replace("/login?error=identity_conflict");
            return;
          }

          if (status === 401 || status === 403) {
            if (auth) await signOut(auth);
            await fetch("/api/auth/logout", { method: "POST" });
            router.replace("/login?next=/tenant-dashboard");
            return;
          }

          setAuthError(message);
          return;
        }
        setAuthError(message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Reset avatar error whenever the URL changes (e.g. user updates their profile picture)
  useEffect(() => { setAvatarError(false); }, [user?.avatarUrl]);

  async function payNow(paymentId: string) {
    if (paying) return;
    setPaying(true);
    try {
      const checkout = await api.payments.checkout(paymentId);
      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error("Payment SDK unavailable");
      new window.Razorpay({
        key:         checkout.keyId,
        amount:      checkout.amountSubunits,
        currency:    checkout.currency,
        name:        "ShiftProof",
        description: checkout.description,
        order_id:    checkout.orderId,
        receipt:     checkout.receipt,
        prefill:     { name: user?.name, email: user?.email },
        theme:       { color: "#2D6A4F" },
        modal:       { ondismiss: () => setPaying(false) },
        handler: async (r) => {
          try {
            await api.payments.pay(paymentId, {
              provider:           "razorpay",
              gatewayOrderId:     r.razorpay_order_id,
              gatewayPaymentId:   r.razorpay_payment_id,
              gatewaySignature:   r.razorpay_signature,
            });
            toast.success("Payment successful!");
            // Refresh payment list
            const fresh = await api.payments.list({ limit: 24 });
            setApiPayments(fresh.data);
          } catch {
            toast.error("Payment recorded but verification failed — contact support.");
          } finally {
            setPaying(false);
          }
        },
      }).open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed — please try again.");
      setPaying(false);
    }
  }

  const TENANT = buildTenantDisplay(user, stay);

  const PAYMENT_HISTORY: PaymentDisplay[] = (apiPayments ?? []).map(p => {
    const d = new Date(p.date);
    return {
      id:     p.id,
      month:  d.toLocaleString("en-IN", { month: "short" }),
      year:   d.getFullYear(),
      amount: p.amount,
      status: (p.status === "paid" ? "paid" : p.status === "overdue" ? "overdue" : "due") as "paid" | "due" | "overdue",
      date:   p.date,
      receipt: null,
    };
  });

  const MAINTENANCE_REQUESTS: TicketDisplay[] = (apiMaintenance ?? []).map(m => ({
    id:       m.id,
    title:    m.title,
    category: "",
    date:     m.createdAt
      ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "",
    status:   m.status === "open" ? "pending" : m.status,
    priority: m.priority,
    response: "",
  }));

  const effectiveNotices  = apiNotifications ?? [];
  const openTickets       = MAINTENANCE_REQUESTS.filter(m => m.status !== "resolved").length;
  const unreadNotices     = effectiveNotices.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[color:var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (authError || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[color:var(--background)] px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-error-50 text-error-700">
            <AlertCircle size={20} />
          </div>
          <h1 className="text-base font-bold text-[color:var(--foreground)]">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {authError ?? "We could not verify your tenant session."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-success-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-success-800"
            >
              Retry
            </button>
            <button
              onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); if (auth) await signOut(auth); router.push("/login"); }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
            >
              Sign in again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const badges: Partial<Record<NavId, number>> = {
    maintenance: openTickets   > 0 ? openTickets   : 0,
    notices:     unreadNotices > 0 ? unreadNotices : 0,
  };

  const sectionTitles: Record<NavId, string> = {
    overview:    "Home",
    myroom:      "My Room",
    payments:    "Payments",
    maintenance: "Maintenance",
    notices:     "Notices",
    account:     "Account",
  };

  return (
    <div className="flex h-screen bg-[color:var(--background)] overflow-hidden text-[color:var(--foreground)] text-[13px]">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-52 bg-white border-r border-[color:var(--background)] shadow-sm transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[color:var(--background)] shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center shrink-0">
            <Home size={13} strokeWidth={2} color="white" />
          </div>
          <span className="font-semibold text-sm text-[color:var(--foreground)] tracking-tight">ShiftProof</span>
          <span className="ml-auto text-[10px] bg-success-50 text-success-700 border border-[color:var(--success)]/30 px-1.5 py-0.5 rounded-md font-bold shrink-0">
            {user?.roles?.includes("OWNER") ? "Owner" : "Tenant"}
          </span>
        </div>

        {/* Nav label */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Menu</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_IDS.map(id => (
            <button
              key={id}
              onClick={() => { navTo(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeNav === id
                  ? "bg-success-700 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-[color:var(--background)]"
              }`}
            >
              <span className={activeNav === id ? "text-white/80" : "text-slate-400"}>{NAV_ICONS[id]}</span>
              {NAV_LABELS[id]}
              {(badges[id] ?? 0) > 0 && (
                <span className={`ml-auto text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${activeNav === id ? "bg-white/20 text-white" : "bg-error text-white"}`}>
                  {badges[id]}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Back link */}
        <div className="px-3 pt-3 pb-2 border-t border-[color:var(--background)]">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-700 hover:bg-[color:var(--background)] transition-colors"
          >
            <ChevronLeft size={13} strokeWidth={2} />
            Back to site
          </Link>
        </div>

        {/* Profile footer */}
        <div className="px-3 py-3 border-t border-[color:var(--background)] shrink-0 space-y-0.5">
          <button
            onClick={() => { navTo("account"); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left ${
              activeNav === "account"
                ? "bg-success-700 text-white"
                : "hover:bg-[color:var(--background)] text-slate-600"
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden ${
              activeNav === "account" ? "bg-white/20 text-white" : "bg-success-50 text-success-700"
            }`}>
              {TENANT.avatarUrl && !avatarError
                ? <img src={TENANT.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setAvatarError(true)} />
                : TENANT.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{TENANT.name}</p>
              <p className={`text-[10px] truncate ${activeNav === "account" ? "text-white/60" : "text-slate-400"}`}>
                Room {TENANT.room} · {TENANT.pg}
              </p>
            </div>
            <Settings size={12} className={activeNav === "account" ? "text-white/50" : "text-slate-300"} />
          </button>
          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); if (auth) await signOut(auth); router.push("/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-error-700 hover:bg-error-50 transition-colors"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-[color:var(--background)] shrink-0">
          <button className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-[color:var(--background)] transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} strokeWidth={1.75} />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[color:var(--foreground)] truncate">{sectionTitles[activeNav]}</p>
            <p className="text-[11px] text-slate-400 hidden sm:block">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Role context switcher */}
            {contexts.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setContextOpen(v => !v)}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[color:var(--line)] hover:bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors"
                >
                  <Users size={12} />
                  <ChevronDown size={11} />
                </button>
                {contextOpen && (
                  <div className="absolute right-0 top-10 z-50 w-56 bg-white rounded-2xl border border-[color:var(--line)] shadow-xl overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] px-4 pt-3 pb-2">Switch Role</p>
                    {contexts.map(ctx => (
                      <button
                        key={`${ctx.propertyId}-${ctx.role}`}
                        onClick={async () => {
                          await api.auth.setPreferredContext(ctx.propertyId).catch(() => {});
                          setContextOpen(false);
                          if (ctx.role !== "tenant") router.push("/owner-dashboard");
                        }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[color:var(--background)] text-left transition-colors"
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold ${ctx.role === "tenant" ? "bg-[color:var(--accent-100)] text-[color:var(--accent-700)]" : "bg-slate-100 text-slate-600"}`}>
                          {ctx.role === "tenant" ? "T" : "O"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[color:var(--foreground)] truncate">{ctx.propertyName}</p>
                          <p className="text-xs text-[color:var(--muted)] capitalize">{ctx.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              className="relative w-8 h-8 rounded-xl hover:bg-[color:var(--background)] flex items-center justify-center text-slate-400 transition-colors border border-[color:var(--background)]"
              onClick={() => navTo("notices")}
            >
              <Bell size={14} strokeWidth={1.75} />
              {unreadNotices > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeNav === "overview"    && <OverviewSection onNav={navTo} tenant={TENANT} payments={PAYMENT_HISTORY} tickets={MAINTENANCE_REQUESTS} notices={effectiveNotices} onPayNow={payNow} hasStay={!!stay} />}
          {activeNav === "myroom"      && <MyRoomSection tenant={TENANT} amenities={apiProperty?.amenities ?? []} roomImageUrl={apiProperty?.imageUrl} />}
          {activeNav === "payments"    && <PaymentsSection payments={PAYMENT_HISTORY} onPayNow={payNow} />}
          {activeNav === "maintenance" && <MaintenanceSection tickets={MAINTENANCE_REQUESTS} onSubmit={async (title, priority, desc) => {
            const pid = stay?.propertyId ?? "p1";
            const ticket = await api.maintenance.create(pid, {
              propertyId: pid,
              title,
              description: desc || undefined,
              priority: priority as ApiMaintenanceRequest["priority"],
            });
            setApiMaintenance(prev => prev ? [ticket, ...prev] : [ticket]);
            toast.success("Request submitted", "We'll notify your owner shortly");
          }} />}
          {activeNav === "notices"     && <NoticesSection initialNotices={effectiveNotices} />}
          {activeNav === "account"     && <AccountSection tenant={TENANT} providers={user?.providers ?? []} roleLabel={user?.roles?.includes("OWNER") ? "Owner" : "Tenant"} />}
        </main>
      </div>
    </div>
  );
}

export default function TenantDashboardClientWithBoundary() {
  return (
    <DashboardErrorBoundary>
      <TenantDashboardClient />
    </DashboardErrorBoundary>
  );
}

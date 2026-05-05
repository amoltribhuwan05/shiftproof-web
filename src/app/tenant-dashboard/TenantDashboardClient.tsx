"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PhoneInput from "@/components/PhoneInput";
import {
  Home, CreditCard, Wrench, Bell, ChevronLeft, Menu,
  CheckCircle2, Clock, IndianRupee, Calendar,
  Plus, Download, Send, FileText, Users, MapPin, Phone,
  Shield, User, Lock, Smartphone, ToggleLeft, ToggleRight,
  Edit3, Eye, EyeOff, Trash2, Settings, LogOut,
} from "lucide-react";
import {
  CURRENT_TENANT, TENANTS_EXT, MAINTENANCE, MAINTENANCE_EXT,
  NOTICES, PROPERTY_AMENITIES, PROPERTY_HOUSE_RULES, CURRENT_TENANT_ROOMMATES, TENANT_DOCS,
} from "@/lib/mockData";
import { api, ApiError, type AppUser, type CurrentStay } from "@/lib/api";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavId = "overview" | "myroom" | "payments" | "maintenance" | "notices" | "account";

// ─── Constants (fallbacks) ──────────────────────────────────────────────────
const FALLBACK_TENANT_ID = "u1";

// ─── Display data (derived from shared mock data) ──────────────────────────────

const TENANT = CURRENT_TENANT;

const NOTICES_DATA = NOTICES;

const AMENITIES   = PROPERTY_AMENITIES["p1"];
const HOUSE_RULES = PROPERTY_HOUSE_RULES["p1"];
const ROOMMATES   = CURRENT_TENANT_ROOMMATES;

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

function OverviewSection({ onNav, tenant, payments, tickets }: {
  onNav: (id: NavId) => void;
  tenant: any;
  payments: any[];
  tickets: any[];
}) {
  const unread         = NOTICES_DATA.filter(n => !n.isRead).length;
  const openTickets    = tickets.filter(m => m.status !== "resolved").length;
  const currentPayment = payments.at(-1)!;

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="bg-accent-500 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold opacity-75 mb-1">Good morning</p>
        <p className="text-lg font-semibold">{tenant.name}</p>
        <p className="text-xs opacity-75 mt-0.5">{tenant.pg} · Room {tenant.room} · {tenant.type}</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="April Rent"
          value={currentPayment.status === "paid" ? "Paid" : "₹8,500"}
          sub={currentPayment.status === "paid" ? `Paid on ${currentPayment.date}` : "Due by Apr 5, 2025"}
          icon={<IndianRupee size={14} strokeWidth={2} className={currentPayment.status === "paid" ? "text-success-700" : "text-warning-700"} />}
          accent={currentPayment.status === "paid" ? "bg-success-50" : "bg-warning-50"}
        />
        <KpiCard
          label="Lease Expires"
          value={`${TENANT.leaseDaysLeft}d`}
          sub={`Ends ${TENANT.leaseEnd}`}
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
          {currentPayment.status === "due" && (
            <button className="mt-4 w-full py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold transition-colors">
              Pay ₹8,500 Now
            </button>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-700 mb-4">Recent Activity</p>
          <div className="space-y-3">
            {[
              { emoji: "✓",  bg: "bg-success-50", text: "March rent paid — ₹8,500",          time: "Mar 5, 2025"  },
              { emoji: "🔧", bg: "bg-blue-50",     text: "AC maintenance request created",    time: "Apr 3, 2025"  },
              { emoji: "📢", bg: "bg-warning-50",    text: "New notice: WiFi upgrade scheduled", time: "Apr 3, 2025"  },
              { emoji: "✓",  bg: "bg-success-50", text: "Plumbing issue resolved",            time: "Mar 30, 2025" },
            ].map((item, i) => (
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

function MyRoomSection({ tenant }: { tenant: typeof CURRENT_TENANT }) {
  return (
    <div className="space-y-5">
      {/* Room hero */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="h-36 relative">
          <img
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
            alt="Room"
            className="w-full h-full object-cover"
          />
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
                style={{ width: `${Math.min(100, Math.round((tenant.leaseDaysLeft / 215) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">{tenant.leaseDaysLeft} / 215 days left</p>
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
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Floor {TENANT.floor} Neighbors
            </p>
            <div className="space-y-2">
              {ROOMMATES.map(r => (
                <div key={r.name} className="flex items-center gap-2.5">
                  <Avatar initials={r.initials} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{r.name}</p>
                    <p className="text-[11px] text-slate-400">Room {r.room} · Since {r.since}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Amenities + rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-700 mb-3">Amenities Included</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <span key={a} className="text-[11px] font-medium bg-accent-50 text-accent-600 border border-accent-100 px-2.5 py-1 rounded-lg">
                {a}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-700 mb-3">House Rules</p>
          <ul className="space-y-2">
            {HOUSE_RULES.map(r => (
              <li key={r} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-accent-500 mt-0.5 shrink-0">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Payments ─────────────────────────────────────────────────────────

function PaymentsSection({ payments }: { payments: any[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const stats = [
    { label: "Pending", value: payments.filter(p => p.status !== "paid").length, icon: Clock, color: "text-warning-600" },
    { label: "Total Paid", value: `₹${payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`, icon: CheckCircle2, color: "text-success-600" },
  ];

  const currentMonth = payments.at(-1)!;

  return (
    <div className="space-y-5">
      {/* Current month banner */}
      <div className={`rounded-2xl p-5 border ${currentMonth.status === "paid" ? "bg-success-50 border-[color:var(--success)]/30" : "bg-warning-50 border-[color:var(--warning)]/30"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold mb-1 ${currentMonth.status === "paid" ? "text-success-700" : "text-warning-700"}`}>
              {currentMonth.status === "paid" ? "April rent paid" : "April rent due"}
            </p>
            <p className="text-2xl font-semibold text-[color:var(--foreground)]">₹{currentMonth.amount.toLocaleString("en-IN")}</p>
            <p className={`text-[11px] mt-0.5 ${currentMonth.status === "paid" ? "text-success-700" : "text-warning-700"}`}>
              {currentMonth.status === "paid" ? `Paid on ${currentMonth.date}` : "Due by Apr 5, 2025"}
            </p>
          </div>
          {currentMonth.status !== "paid" ? (
            <button className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-colors">
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
              {p.receipt && (
                <button className="text-[11px] text-accent-500 hover:underline shrink-0 flex items-center gap-1">
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

function MaintenanceSection({ tickets }: { tickets: any[] }) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
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
              onClick={() => { setShowForm(false); setTitle(""); setDesc(""); toast.success("Request submitted", "We'll notify your owner shortly"); }}
              className="flex items-center gap-1.5 px-5 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <Send size={11} /> Submit Request
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

function NoticesSection() {
  const [notices, setNotices] = useState(NOTICES_DATA);

  const markRead = (id: string) =>
    setNotices(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

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

function AccountSection({ tenant }: { tenant: typeof CURRENT_TENANT }) {
  const toast = useToast();
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: tenant.name, email: tenant.email, phone: tenant.phone,
  });

  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState<string | null>(null);

  const [notifs, setNotifs] = useState({
    rentReminders: true, maintenanceUpdates: true, notices: true,
    whatsapp: true, sms: false,
  });

  const [idDocs, setIdDocs] = useState(
    TENANT_DOCS["u1"]
      .filter(d => ["Aadhar Card", "PAN Card", "Passport"].includes(d.type))
      .map(d => ({
        label:  d.type,
        status: d.status as "verified" | "pending" | "missing",
        number: d.type === "Aadhar Card" ? "XXXX-XXXX-4821" : "—",
      }))
  );

  function saveProfile() {
    setEditingProfile(false);
    toast.success("Profile updated");
  }

  function savePwd() {
    if (!pwdForm.old) { setPwdError("Enter your current password."); return; }
    if (pwdForm.next.length < 6) { setPwdError("Min. 6 characters required."); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdError("Passwords don't match."); return; }
    setPwdError(null);
    setPwdForm({ old: "", next: "", confirm: "" });
    toast.success("Password updated");
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
              <button onClick={() => setEditingProfile(false)} className="text-xs text-slate-400 hover:text-slate-700">Cancel</button>
              <button onClick={saveProfile}
                className="text-xs font-semibold bg-success-700 text-white px-3 py-1 rounded-lg hover:bg-success-800 transition-colors">Save</button>
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
              Tenant
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "Full Name", key: "name",  type: "text" },
            { label: "Email",     key: "email", type: "email" },
            { label: "Mobile",    key: "phone", type: "tel" },
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
        <div className="space-y-0.5">
          {([
            { key: "rentReminders",    label: "Rent due reminders",   sub: "Reminded 5 days before due date" },
            { key: "maintenanceUpdates",label: "Maintenance updates", sub: "When your ticket status changes" },
            { key: "notices",          label: "Owner notices",        sub: "Announcements from your PG" },
          ] as const).map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-[color:var(--background)] last:border-0">
              <div>
                <p className="text-sm font-medium text-[color:var(--foreground)]">{label}</p>
                <p className="text-[11px] text-slate-400">{sub}</p>
              </div>
              <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))} className="shrink-0 ml-4">
                {notifs[key]
                  ? <ToggleRight size={24} className="text-success-600" />
                  : <ToggleLeft  size={24} className="text-slate-300" />}
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-3 mb-2">Via</p>
        <div className="flex gap-2">
          {(["whatsapp", "sms"] as const).map(ch => (
            <button key={ch}
              onClick={() => setNotifs(n => ({ ...n, [ch]: !n[ch] }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                notifs[ch]
                  ? "bg-success-700 text-white border-success-700"
                  : "border-slate-200 text-slate-400 hover:border-success-400"
              }`}
            >
              <Smartphone size={11} />
              {ch === "whatsapp" ? "WhatsApp" : "SMS"}
            </button>
          ))}
        </div>
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
        <button onClick={savePwd}
          className="mt-4 text-xs font-semibold bg-[color:var(--foreground)] hover:opacity-80 text-white px-5 py-2.5 rounded-xl transition-opacity">
          Update Password
        </button>
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

export default function TenantDashboardClient() {
  const router = useRouter();
  const [activeNav,   setActiveNav]   = useState<NavId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [stay, setStay] = useState<CurrentStay | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [me, currentStay] = await Promise.all([
          api.auth.me(),
          api.auth.currentStay(),
        ]);
        setUser(me);
        setStay(currentStay);
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (typeof status === "number") {
          if (status === 409 || (err as Error).message?.toLowerCase().includes("conflict")) {
            await signOut(auth);
            await fetch("/api/auth/logout", { method: "POST" });
            router.replace("/login?error=identity_conflict");
            return;
          }
          // Any other API error — backend doesn't have this user yet, use mock data.
          return;
        }
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Reset avatar error whenever the URL changes (e.g. user updates their profile picture)
  useEffect(() => { setAvatarError(false); }, [user?.avatarUrl]);

  // Derived tenant info (merges mock data with real user if available)
  const TENANT = {
    ...CURRENT_TENANT,
    name: user?.name || CURRENT_TENANT.name,
    email: user?.email || CURRENT_TENANT.email,
    initials: (user?.name || CURRENT_TENANT.name).split(" ").map(n => n[0]).join("").slice(0, 2),
    avatarUrl: user?.avatarUrl || "",
    pg: stay?.propertyName || CURRENT_TENANT.pg,
    room: stay?.roomNumber || CURRENT_TENANT.room,
    rent: stay?.rentAmount || CURRENT_TENANT.rent,
  };

  const targetUserId = user?.id || FALLBACK_TENANT_ID;
  const tenantExt = TENANTS_EXT[targetUserId] || TENANTS_EXT[FALLBACK_TENANT_ID];

  const PAYMENT_HISTORY = [...tenantExt.rentHistory].reverse().map(r => ({
    month:   r.month.split(" ")[0],
    year:    parseInt(r.month.split(" ")[1]),
    amount:  r.amount,
    status:  (r.status === "pending" ? "due" : r.status) as "paid" | "due" | "overdue",
    date:    r.paidOn ?? `Due ${r.month.split(" ")[0]} 5`,
    receipt: r.ref ?? null,
  }));

  const MAINTENANCE_REQUESTS = MAINTENANCE
    .filter(m => m.tenantId === targetUserId)
    .map(m => ({
      id:       m.id,
      title:    m.title,
      category: m.category,
      date:     m.date,
      status:   m.status,
      priority: m.priority || "medium",
    }));

  const openTickets   = MAINTENANCE_REQUESTS.filter(m => m.status !== "resolved").length;
  const unreadNotices = NOTICES_DATA.filter(n => !n.isRead).length;

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
            Tenant
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
              onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
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
            onClick={() => { setActiveNav("account"); setSidebarOpen(false); }}
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
            <p className="text-[11px] text-slate-400 hidden sm:block">Tue, 15 Apr 2025</p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              className="relative w-8 h-8 rounded-xl hover:bg-[color:var(--background)] flex items-center justify-center text-slate-400 transition-colors border border-[color:var(--background)]"
              onClick={() => setActiveNav("notices")}
            >
              <Bell size={14} strokeWidth={1.75} />
              {unreadNotices > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
              )}
            </button>
            <div className="w-8 h-8 rounded-xl bg-accent-100 flex items-center justify-center text-xs font-bold text-success-700 border border-[color:var(--success)]/30 overflow-hidden">
              {TENANT.avatarUrl && !avatarError
                ? <img src={TENANT.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setAvatarError(true)} />
                : TENANT.initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeNav === "overview"    && <OverviewSection onNav={setActiveNav} tenant={TENANT} payments={PAYMENT_HISTORY} tickets={MAINTENANCE_REQUESTS} />}
          {activeNav === "myroom"      && <MyRoomSection tenant={TENANT} />}
          {activeNav === "payments"    && <PaymentsSection payments={PAYMENT_HISTORY} />}
          {activeNav === "maintenance" && <MaintenanceSection tickets={MAINTENANCE_REQUESTS} />}
          {activeNav === "notices"     && <NoticesSection />}
          {activeNav === "account"     && <AccountSection tenant={TENANT} />}
        </main>
      </div>
    </div>
  );
}

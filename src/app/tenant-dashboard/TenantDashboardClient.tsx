"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home, CreditCard, Wrench, Bell, ChevronLeft, Menu,
  CheckCircle2, Clock, IndianRupee, Calendar,
  Plus, Download, Send, FileText, Users, MapPin, Phone,
  Shield,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavId = "overview" | "myroom" | "payments" | "maintenance" | "notices";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const TENANT = {
  name: "Rahul Sharma",
  initials: "RS",
  room: "101",
  floor: 1,
  type: "Single AC",
  pg: "Sunshine PG",
  address: "Koramangala, Bangalore",
  pgContact: "+91 98765 43210",
  pgManager: "Vikram Shetty",
  rent: 8500,
  deposit: 17000,
  leaseStart: "Jun 1, 2025",
  leaseEnd: "Dec 31, 2025",
  leaseDaysLeft: 261,
  checkIn: "Jun 1, 2025",
};

const PAYMENT_HISTORY = [
  { month: "November", year: 2024, amount: 8500, status: "paid",    date: "Nov 3, 2024",  receipt: "RCP-2411" },
  { month: "December", year: 2024, amount: 8500, status: "paid",    date: "Dec 4, 2024",  receipt: "RCP-2412" },
  { month: "January",  year: 2025, amount: 8500, status: "paid",    date: "Jan 2, 2025",  receipt: "RCP-2501" },
  { month: "February", year: 2025, amount: 8500, status: "paid",    date: "Feb 3, 2025",  receipt: "RCP-2502" },
  { month: "March",    year: 2025, amount: 8500, status: "paid",    date: "Mar 5, 2025",  receipt: "RCP-2503" },
  { month: "April",    year: 2025, amount: 8500, status: "due",     date: "Due Apr 5",    receipt: null       },
];

const MAINTENANCE_REQUESTS = [
  { id: "m1", title: "AC not cooling properly", category: "Electrical", date: "Apr 3, 2025",  status: "in_progress", priority: "high",   response: "Technician scheduled for Apr 6"  },
  { id: "m2", title: "Bathroom tap dripping",   category: "Plumbing",   date: "Mar 28, 2025", status: "resolved",    priority: "medium", response: "Fixed on Mar 30"                 },
  { id: "m3", title: "Room light flickering",   category: "Electrical", date: "Mar 10, 2025", status: "resolved",    priority: "low",    response: "Fixed on Mar 12"                 },
];

const NOTICES_DATA = [
  { id: "n1", title: "WiFi upgrade scheduled",  body: "The internet service will be upgraded on Apr 10 from 10am–2pm. Expect brief downtime.",    date: "Apr 3, 2025",  type: "info",     read: false },
  { id: "n2", title: "April rent reminder",      body: "Please pay your April rent by Apr 5 to avoid a late fee. UPI: shiftproof@upi",             date: "Apr 1, 2025",  type: "reminder", read: false },
  { id: "n3", title: "Guest policy reminder",    body: "Visitors are allowed only till 9 PM. Please ensure compliance. Thank you.",                 date: "Mar 25, 2025", type: "policy",   read: true  },
  { id: "n4", title: "Common area cleaning",     body: "Common areas will be deep-cleaned on Apr 8 (Sunday) from 8–11am.",                         date: "Mar 22, 2025", type: "info",     read: true  },
];

const AMENITIES   = ["WiFi", "AC", "Laundry", "Parking", "CCTV", "Water 24×7", "Security Guard"];
const HOUSE_RULES = ["No smoking on premises", "Visitors allowed till 9 PM", "No loud music after 10 PM", "Monthly rent due by 5th"];
const ROOMMATES   = [
  { name: "Deepak Singh", initials: "DS", room: "102", since: "Jan 2025" },
  { name: "Preet Kaur",   initials: "PK", room: "103", since: "Mar 2025" },
];

// ─── Nav config ────────────────────────────────────────────────────────────────

const NAV_IDS: NavId[] = ["overview", "myroom", "payments", "maintenance", "notices"];
const NAV_LABELS: Record<NavId, string> = {
  overview:    "Overview",
  myroom:      "My Room",
  payments:    "Payments",
  maintenance: "Maintenance",
  notices:     "Notices",
};
const NAV_ICONS: Record<NavId, React.ReactElement> = {
  overview:    <Home       size={15} strokeWidth={1.75} />,
  myroom:      <Shield     size={15} strokeWidth={1.75} />,
  payments:    <CreditCard size={15} strokeWidth={1.75} />,
  maintenance: <Wrench     size={15} strokeWidth={1.75} />,
  notices:     <Bell       size={15} strokeWidth={1.75} />,
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

function OverviewSection({ onNav }: { onNav: (id: NavId) => void }) {
  const unread         = NOTICES_DATA.filter(n => !n.read).length;
  const openTickets    = MAINTENANCE_REQUESTS.filter(m => m.status !== "resolved").length;
  const currentPayment = PAYMENT_HISTORY.at(-1)!;

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="bg-gradient-to-r from-accent-500 to-accent-500 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold opacity-75 mb-1">Good morning 👋</p>
        <p className="text-lg font-semibold">{TENANT.name}</p>
        <p className="text-xs opacity-75 mt-0.5">{TENANT.pg} · Room {TENANT.room} · {TENANT.type}</p>
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
            {PAYMENT_HISTORY.slice(-4).map(p => (
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

function MyRoomSection() {
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
              <p className="text-white text-lg font-semibold">Room {TENANT.room}</p>
              <p className="text-white/75 text-xs">{TENANT.type} · Floor {TENANT.floor}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "PG Name",       value: TENANT.pg                                   },
              { label: "Monthly Rent",  value: `₹${TENANT.rent.toLocaleString("en-IN")}`   },
              { label: "Deposit Paid",  value: `₹${TENANT.deposit.toLocaleString("en-IN")}` },
              { label: "Check-in Date", value: TENANT.checkIn                               },
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
              { label: "Start Date",      value: TENANT.leaseStart,                  color: ""              },
              { label: "End Date",        value: TENANT.leaseEnd,                    color: ""              },
              { label: "Days Remaining",  value: `${TENANT.leaseDaysLeft} days`,     color: "text-accent-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between">
                <span className="text-[11px] text-slate-400">{label}</span>
                <span className={`text-xs font-semibold ${color || "text-slate-800"}`}>{value}</span>
              </div>
            ))}
            <div className="h-1.5 bg-[color:var(--background)] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-accent-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((TENANT.leaseDaysLeft / 215) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">{TENANT.leaseDaysLeft} / 215 days left</p>
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
              <span className="text-xs text-slate-700">{TENANT.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700">{TENANT.pgContact}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users size={14} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700">Manager: {TENANT.pgManager}</span>
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

function PaymentsSection() {
  const currentMonth = PAYMENT_HISTORY.at(-1)!;
  const totalPaid    = PAYMENT_HISTORY.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const paidCount    = PAYMENT_HISTORY.filter(p => p.status === "paid").length;

  return (
    <div className="space-y-5">
      {/* Current month banner */}
      <div className={`rounded-2xl p-5 border ${currentMonth.status === "paid" ? "bg-success-50 border-[color:var(--success)]/30" : "bg-warning-50 border-[color:var(--warning)]/30"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold mb-1 ${currentMonth.status === "paid" ? "text-success-700" : "text-warning-700"}`}>
              {currentMonth.status === "paid" ? "✓ April rent paid" : "⚠ April rent due"}
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
          <p className="text-lg font-semibold text-[color:var(--foreground)]">{paidCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Months Paid</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-lg font-semibold text-success-700">₹{Math.round(totalPaid / 1000)}k</p>
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
          {[...PAYMENT_HISTORY].reverse().map(p => (
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

function MaintenanceSection() {
  const [showForm, setShowForm] = useState(false);
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState("Electrical");
  const [priority, setPriority] = useState("medium");
  const [desc,     setDesc]     = useState("");

  const open   = MAINTENANCE_REQUESTS.filter(m => m.status !== "resolved");
  const closed = MAINTENANCE_REQUESTS.filter(m => m.status === "resolved");

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
              onClick={() => { setShowForm(false); setTitle(""); setDesc(""); }}
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

  const unread = notices.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{unread} unread · {notices.length} total</p>
      {notices.map(n => (
        <div
          key={n.id}
          className={`bg-white border border-slate-200 rounded-2xl p-5 transition-opacity ${n.read ? "opacity-60" : ""}`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {!n.read && <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />}
              <p className={`text-xs font-bold ${n.read ? "text-slate-500" : "text-[color:var(--foreground)]"}`}>{n.title}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeStyle[n.type] ?? "bg-[color:var(--background)] text-slate-500 border-slate-200"}`}>
                {typeLabel[n.type] ?? n.type}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">{n.date}</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">{n.body}</p>
          {!n.read && (
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

// ─── Main export ───────────────────────────────────────────────────────────────

export default function TenantDashboardClient() {
  const [activeNav,   setActiveNav]   = useState<NavId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openTickets   = MAINTENANCE_REQUESTS.filter(m => m.status !== "resolved").length;
  const unreadNotices = NOTICES_DATA.filter(n => !n.read).length;

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
  };

  return (
    <div className="flex h-screen bg-[color:var(--background)] overflow-hidden text-[color:var(--foreground)] text-[13px]">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-52 bg-white border-r border-[color:var(--background)] shadow-sm transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[color:var(--background)] shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
            <Home size={13} strokeWidth={2} color="white" />
          </div>
          <span className="font-semibold text-sm text-[color:var(--foreground)] tracking-tight">ShiftProof</span>
          <span className="ml-auto text-[10px] bg-success-50 text-success-700 border border-[color:var(--success)]/30 px-1.5 py-0.5 rounded-md font-bold shrink-0">
            Tenant
          </span>
        </div>

        {/* Nav label */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Menu</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_IDS.map(id => (
            <button
              key={id}
              onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeNav === id
                  ? "bg-success text-white shadow-sm "
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
        <div className="px-4 py-4 border-t border-[color:var(--background)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xs font-bold text-success-700 shrink-0">
              {TENANT.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{TENANT.name}</p>
              <p className="text-[11px] text-slate-400">Room {TENANT.room} · {TENANT.pg}</p>
            </div>
          </div>
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xs font-bold text-success-700 border border-[color:var(--success)]/30">
              {TENANT.initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeNav === "overview"    && <OverviewSection onNav={setActiveNav} />}
          {activeNav === "myroom"      && <MyRoomSection />}
          {activeNav === "payments"    && <PaymentsSection />}
          {activeNav === "maintenance" && <MaintenanceSection />}
          {activeNav === "notices"     && <NoticesSection />}
        </main>
      </div>
    </div>
  );
}

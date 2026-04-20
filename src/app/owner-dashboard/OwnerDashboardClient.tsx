"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Building2, Users, CreditCard, Wrench, BarChart3,
  Bell, Search, Settings, Plus, LogOut, Menu, X,
  TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle2,
  ChevronRight, Download, IndianRupee, BedDouble, Home,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const OWNER = { name: "Ravi Kumar", initials: "RK", properties: 3, beds: 28 };

const KPI = [
  { label: "Monthly Revenue", value: "₹2,34,500", sub: "↑ 8.2% vs last month", up: true, icon: IndianRupee, color: "accent" },
  { label: "Occupancy Rate",  value: "83.5%",     sub: "24 of 28 beds filled", up: true, icon: BedDouble,     color: "trust" },
  { label: "Rent Collected",  value: "₹1,89,000", sub: "80% of total due",     up: true, icon: CheckCircle2,  color: "success" },
  { label: "Pending Amount",  value: "₹45,500",   sub: "From 5 tenants",       up: false, icon: Clock,        color: "warning" },
];

const ALERTS = [
  { type: "error",   icon: AlertCircle,  title: "3 overdue rent payments",    action: "Review" },
  { type: "warning", icon: Clock,        title: "2 leases expiring in 30 days", action: "View" },
  { type: "trust",   icon: Wrench,       title: "5 active maintenance requests", action: "Manage" },
];

const CHART_MONTHS = [
  { label: "Nov", val: 62 }, { label: "Dec", val: 48 }, { label: "Jan", val: 71 },
  { label: "Feb", val: 55 }, { label: "Mar", val: 88 }, { label: "Apr", val: 75 },
];

const AT_A_GLANCE = [
  { label: "Occupied Beds",    value: "24", sub: "Across 3 properties", icon: BedDouble,    color: "text-[color:var(--accent-400)]" },
  { label: "Vacant Beds",      value: "4",  sub: "Ready for move-in",   icon: Home,         color: "text-slate-400" },
  { label: "Overdue Accounts", value: "5",  sub: "Requires attention",  icon: AlertCircle,  color: "text-[color:var(--error)]" },
];

const TRANSACTIONS = [
  { id: "t1", initials: "RS", name: "Rahul Sharma",  property: "Sunshine PG · 3A",     amount: "₹8,500",  date: "Apr 2",  status: "paid" },
  { id: "t2", initials: "PV", name: "Priya Verma",   property: "Green Haven · 1B",      amount: "₹10,000", date: "Apr 2",  status: "paid" },
  { id: "t3", initials: "AP", name: "Amit Patel",    property: "Royal Residency · 2A",  amount: "₹9,500",  date: "Apr 3",  status: "paid" },
  { id: "t4", initials: "NG", name: "Neha Gupta",    property: "Sunshine PG · 5C",      amount: "₹8,500",  date: "Apr 5",  status: "pending" },
  { id: "t5", initials: "KR", name: "Kiran Rao",     property: "Green Haven · 2A",      amount: "₹10,000", date: "Apr 5",  status: "pending" },
  { id: "t6", initials: "SM", name: "Sonia Mehta",   property: "Royal Residency · 4B",  amount: "₹9,500",  date: "Mar 28", status: "overdue" },
];

const TENANTS = [
  { id: "u1", initials: "RS", name: "Rahul Sharma", property: "Sunshine PG",     room: "3A", lease: "Dec 2025", risk: "none",     paid: true },
  { id: "u2", initials: "PV", name: "Priya Verma",  property: "Green Haven",     room: "1B", lease: "May 2026", risk: "none",     paid: true },
  { id: "u3", initials: "AP", name: "Amit Patel",   property: "Royal Residency", room: "2A", lease: "Apr 2026", risk: "expiring", paid: true },
  { id: "u4", initials: "NG", name: "Neha Gupta",   property: "Sunshine PG",     room: "5C", lease: "Nov 2025", risk: "none",     paid: false },
  { id: "u5", initials: "KR", name: "Kiran Rao",    property: "Green Haven",     room: "2A", lease: "Oct 2025", risk: "late",     paid: false },
  { id: "u6", initials: "SM", name: "Sonia Mehta",  property: "Royal Residency", room: "4B", lease: "Sep 2025", risk: "late",     paid: false },
];

const PROPERTIES = [
  { id: "p1", name: "Sunshine PG",     address: "Koramangala, Bangalore", beds: 12, occupied: 10, rent: 8500,  pending: 1 },
  { id: "p2", name: "Green Haven",     address: "Indiranagar, Bangalore",  beds: 8,  occupied: 7,  rent: 10000, pending: 1 },
  { id: "p3", name: "Royal Residency", address: "HSR Layout, Bangalore",   beds: 10, occupied: 8,  rent: 9500,  pending: 1 },
];

const MAINTENANCE = [
  { id: "m1", title: "AC not cooling", property: "Sunshine PG · 101",     category: "Electrical", date: "Apr 3", status: "in_progress", priority: "high" },
  { id: "m2", title: "Water leakage",  property: "Green Haven · 2A",       category: "Plumbing",   date: "Apr 1", status: "pending",     priority: "medium" },
  { id: "m3", title: "Light flickering", property: "Royal Residency · B2", category: "Electrical", date: "Mar 28", status: "resolved",   priority: "low" },
  { id: "m4", title: "Door lock stuck", property: "Sunshine PG · 302",    category: "Carpentry",  date: "Mar 25", status: "resolved",    priority: "low" },
  { id: "m5", title: "WiFi not working", property: "Green Haven · 3B",    category: "Tech",       date: "Apr 5",  status: "pending",     priority: "high" },
];

// ─── Helper components ─────────────────────────────────────────────────────────

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const palettes = [
    "bg-[color:var(--accent-100)] text-[color:var(--accent-700)]",
    "bg-[color:var(--trust-50)] text-[color:var(--trust-700)]",
    "bg-[color:var(--success-50)] text-[color:var(--success-700)]",
    "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]",
  ];
  const p = palettes[initials.charCodeAt(0) % palettes.length];
  const dim = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-bold shrink-0 ${dim} ${p}`}>
      {initials}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid:        "bg-[color:var(--success-50)] text-[color:var(--success-700)]",
    pending:     "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]",
    overdue:     "bg-[color:var(--error-50)] text-[color:var(--error-700)]",
    in_progress: "bg-[color:var(--trust-50)] text-[color:var(--trust-700)]",
    resolved:    "bg-[color:var(--success-50)] text-[color:var(--success-700)]",
    high:        "bg-[color:var(--error-50)] text-[color:var(--error-700)]",
    medium:      "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]",
    low:         "bg-[color:var(--background)] text-[color:var(--muted)]",
    expiring:    "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]",
    late:        "bg-[color:var(--error-50)] text-[color:var(--error-700)]",
    none:        "",
  };
  const label: Record<string, string> = {
    paid: "Paid", pending: "Pending", overdue: "Overdue",
    in_progress: "In Progress", resolved: "Resolved",
    high: "High", medium: "Medium", low: "Low",
    expiring: "Expiring", late: "Late Risk", none: "",
  };
  if (status === "none") return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${map[status] ?? ""}`}>
      {label[status] ?? status}
    </span>
  );
}

const NAV_ITEMS = [
  { id: "overview",    label: "Overview",    icon: LayoutDashboard },
  { id: "properties",  label: "Properties",  icon: Building2 },
  { id: "tenants",     label: "Tenants",     icon: Users },
  { id: "payments",    label: "Payments",    icon: CreditCard },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "reports",     label: "Reports",     icon: BarChart3 },
];

// ─── Tab sections ─────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-[color:var(--line)] p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                k.color === "accent"  ? "bg-[color:var(--accent-100)] text-[color:var(--accent-600)]" :
                k.color === "trust"   ? "bg-[color:var(--trust-50)] text-[color:var(--trust-700)]" :
                k.color === "success" ? "bg-[color:var(--success-50)] text-[color:var(--success-700)]" :
                                        "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]"
              }`}>
                <k.icon size={18} strokeWidth={1.75} />
              </div>
              {k.up !== undefined && (
                <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  k.up ? "bg-[color:var(--success-50)] text-[color:var(--success-700)]" : "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]"
                }`}>
                  {k.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {k.sub.split(" ")[0]}
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-[color:var(--foreground)]">{k.value}</p>
            <p className="text-xs text-[color:var(--muted)] mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ALERTS.map((a) => (
          <div key={a.title} className={`flex items-center gap-3 rounded-xl p-4 border-l-4 ${
            a.type === "error"   ? "bg-[color:var(--error-50)] border-[color:var(--error)]" :
            a.type === "warning" ? "bg-[color:var(--warning-50)] border-[color:var(--warning)]" :
                                   "bg-[color:var(--trust-50)] border-[color:var(--trust)]"
          }`}>
            <a.icon size={18} className={
              a.type === "error" ? "text-[color:var(--error-700)] shrink-0" :
              a.type === "warning" ? "text-[color:var(--warning-700)] shrink-0" :
              "text-[color:var(--trust-700)] shrink-0"
            } />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[color:var(--foreground)] leading-tight">{a.title}</p>
            </div>
            <button className="text-[10px] font-bold text-[color:var(--muted)] hover:text-[color:var(--foreground)] shrink-0">{a.action}</button>
          </div>
        ))}
      </div>

      {/* Chart + At a Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[color:var(--line)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[color:var(--foreground)]">Revenue Performance</h3>
              <p className="text-xs text-[color:var(--muted)]">Last 6 months</p>
            </div>
            <select className="text-xs border border-[color:var(--line)] rounded-lg px-3 py-1.5 text-[color:var(--muted)] bg-[color:var(--background)] outline-none">
              <option>6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {CHART_MONTHS.map((m, i) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-t-lg transition-colors ${
                    i === CHART_MONTHS.length - 1
                      ? "bg-[color:var(--accent-500)]"
                      : "bg-[color:var(--accent-100)] hover:bg-[color:var(--accent-200)]"
                  }`}
                  style={{ height: `${m.val}%` }}
                />
                <span className="text-[10px] font-medium text-[color:var(--muted)]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* At a Glance */}
        <div className="bg-[color:var(--foreground)] rounded-2xl p-6 text-white shadow-sm">
          <h3 className="text-sm font-bold text-white mb-5">At a Glance</h3>
          <div className="space-y-4">
            {AT_A_GLANCE.map((g) => (
              <div key={g.label} className="flex items-center gap-3 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <g.icon size={16} className={g.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80">{g.label}</p>
                  <p className="text-[10px] text-white/50">{g.sub}</p>
                </div>
                <span className="text-xl font-bold text-white">{g.value}</span>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors">
            View Full Report
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--line)]">
          <h3 className="text-sm font-bold text-[color:var(--foreground)]">Recent Transactions</h3>
          <button className="text-xs text-[color:var(--accent-600)] font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[color:var(--background)]">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Tenant</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] hidden sm:table-cell">Property · Room</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] text-right">Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] hidden md:table-cell">Date</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-[color:var(--background)] transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={tx.initials} size="sm" />
                      <span className="text-xs font-semibold text-[color:var(--foreground)]">{tx.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[color:var(--muted)] hidden sm:table-cell">{tx.property}</td>
                  <td className="px-4 py-3.5 text-xs font-bold text-[color:var(--foreground)] text-right">{tx.amount}</td>
                  <td className="px-4 py-3.5 text-xs text-[color:var(--muted)] hidden md:table-cell">{tx.date}</td>
                  <td className="px-6 py-3.5"><StatusChip status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PropertiesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {PROPERTIES.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl border border-[color:var(--line)] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[color:var(--accent-100)] flex items-center justify-center text-[color:var(--accent-600)]">
              <Building2 size={18} strokeWidth={1.75} />
            </div>
            <StatusChip status={p.pending > 0 ? "pending" : "paid"} />
          </div>
          <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-1">{p.name}</h3>
          <p className="text-xs text-[color:var(--muted)] mb-4">{p.address}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[color:var(--background)] rounded-xl py-2">
              <p className="text-base font-bold text-[color:var(--foreground)]">{p.beds}</p>
              <p className="text-[10px] text-[color:var(--muted)]">Total</p>
            </div>
            <div className="bg-[color:var(--accent-50)] rounded-xl py-2">
              <p className="text-base font-bold text-[color:var(--accent-700)]">{p.occupied}</p>
              <p className="text-[10px] text-[color:var(--accent-600)]">Occupied</p>
            </div>
            <div className="bg-[color:var(--background)] rounded-xl py-2">
              <p className="text-base font-bold text-[color:var(--foreground)]">{p.beds - p.occupied}</p>
              <p className="text-[10px] text-[color:var(--muted)]">Vacant</p>
            </div>
          </div>
          <p className="text-xs text-[color:var(--muted)] mt-4 pt-4 border-t border-[color:var(--line)]">
            Rent: <span className="font-semibold text-[color:var(--foreground)]">₹{p.rent.toLocaleString("en-IN")}/bed</span>
          </p>
        </div>
      ))}
      <button className="rounded-2xl border-2 border-dashed border-[color:var(--line)] p-6 flex flex-col items-center justify-center gap-2 text-[color:var(--muted)] hover:border-[color:var(--accent-500)] hover:text-[color:var(--accent-600)] transition-colors min-h-[220px]">
        <Plus size={24} strokeWidth={1.5} />
        <span className="text-sm font-medium">Add Property</span>
      </button>
    </div>
  );
}

function TenantsTab() {
  return (
    <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--line)]">
        <h3 className="text-sm font-bold text-[color:var(--foreground)]">All Tenants</h3>
        <button className="flex items-center gap-1.5 text-xs bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-3 py-2 rounded-lg font-semibold transition-colors">
          <Plus size={13} /> Add Tenant
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[color:var(--background)]">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Tenant</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] hidden sm:table-cell">Property · Room</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] hidden md:table-cell">Lease End</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Payment</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {TENANTS.map((t) => (
              <tr key={t.id} className="hover:bg-[color:var(--background)] transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={t.initials} size="sm" />
                    <span className="text-xs font-semibold text-[color:var(--foreground)]">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-[color:var(--muted)] hidden sm:table-cell">{t.property} · {t.room}</td>
                <td className="px-4 py-3.5 text-xs text-[color:var(--muted)] hidden md:table-cell">{t.lease}</td>
                <td className="px-4 py-3.5"><StatusChip status={t.paid ? "paid" : "pending"} /></td>
                <td className="px-6 py-3.5"><StatusChip status={t.risk} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: "₹1,89,000", color: "success" },
          { label: "Pending",         value: "₹28,500",   color: "warning" },
          { label: "Overdue",         value: "₹17,000",   color: "error" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[color:var(--line)] p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${
              s.color === "success" ? "text-[color:var(--success-700)]" :
              s.color === "warning" ? "text-[color:var(--warning-700)]" :
              "text-[color:var(--error-700)]"
            }`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--line)]">
          <h3 className="text-sm font-bold text-[color:var(--foreground)]">All Transactions</h3>
          <button className="flex items-center gap-1 text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] font-medium">
            <Download size={13} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[color:var(--background)]">
                {["Tenant", "Property · Room", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-[color:var(--background)] transition-colors">
                  <td className="px-6 py-3.5"><div className="flex items-center gap-2.5"><Avatar initials={tx.initials} size="sm" /><span className="text-xs font-semibold">{tx.name}</span></div></td>
                  <td className="px-6 py-3.5 text-xs text-[color:var(--muted)]">{tx.property}</td>
                  <td className="px-6 py-3.5 text-xs font-bold">{tx.amount}</td>
                  <td className="px-6 py-3.5 text-xs text-[color:var(--muted)]">{tx.date}</td>
                  <td className="px-6 py-3.5"><StatusChip status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MaintenanceTab() {
  return (
    <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--line)]">
        <h3 className="text-sm font-bold text-[color:var(--foreground)]">Maintenance Requests</h3>
        <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <span className="w-2 h-2 rounded-full bg-[color:var(--error)]" /> 2 pending
        </div>
      </div>
      <div className="divide-y divide-[color:var(--line)]">
        {MAINTENANCE.map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[color:var(--background)] transition-colors">
            <div className={`w-2 h-10 rounded-full shrink-0 ${
              m.status === "resolved" ? "bg-[color:var(--success)]" :
              m.status === "in_progress" ? "bg-[color:var(--trust)]" :
              "bg-[color:var(--warning)]"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[color:var(--foreground)]">{m.title}</p>
              <p className="text-[11px] text-[color:var(--muted)]">{m.property}</p>
            </div>
            <span className="text-[10px] font-medium text-[color:var(--muted)] bg-[color:var(--background)] px-2 py-0.5 rounded-full hidden sm:block">{m.category}</span>
            <span className="text-[10px] text-[color:var(--muted)] hidden md:block">{m.date}</span>
            <StatusChip status={m.status} />
            <StatusChip status={m.priority} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="bg-white rounded-2xl border border-[color:var(--line)] p-8 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[300px] text-center">
      <div className="w-14 h-14 rounded-2xl bg-[color:var(--accent-100)] flex items-center justify-center text-[color:var(--accent-600)]">
        <BarChart3 size={26} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-1">Reports & Analytics</h3>
        <p className="text-xs text-[color:var(--muted)]">Export income statements, occupancy trends, and tax-ready CSVs.</p>
      </div>
      <button className="mt-2 flex items-center gap-2 bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
        <Download size={13} /> Generate Monthly Report
      </button>
    </div>
  );
}

const SECTION_TITLES: Record<string, string> = {
  overview: "Good morning, Ravi", properties: "Properties",
  tenants: "Tenants", payments: "Payments",
  maintenance: "Maintenance", reports: "Reports",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function OwnerDashboardClient() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[color:var(--background)]">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[240px] bg-[color:var(--foreground)] flex flex-col py-6 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        {/* Logo */}
        <div className="px-6 mb-8 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[color:var(--accent-500)] flex items-center justify-center shrink-0">
            <Building2 size={14} strokeWidth={2} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">ShiftProof</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeNav === item.id
                  ? "bg-[color:var(--accent-500)]/20 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={17} strokeWidth={activeNav === item.id ? 2 : 1.75}
                className={activeNav === item.id ? "text-[color:var(--accent-400)]" : ""} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div className="px-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[color:var(--accent-500)]/20 flex items-center justify-center text-xs font-bold text-[color:var(--accent-400)] shrink-0">
              {OWNER.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{OWNER.name}</p>
              <p className="text-[10px] text-white/40 truncate">{OWNER.properties} properties · {OWNER.beds} beds</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-[240px]">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-5 h-14 bg-white border-b border-[color:var(--line)] shrink-0">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-[color:var(--background)] text-[color:var(--muted)] transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[color:var(--foreground)] truncate">{SECTION_TITLES[activeNav]}</p>
            <p className="text-[11px] text-[color:var(--muted)] hidden sm:block">Tue, 15 Apr 2025</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-8 h-8 rounded-xl hover:bg-[color:var(--background)] flex items-center justify-center text-[color:var(--muted)] transition-colors">
              <Search size={15} strokeWidth={1.75} />
            </button>
            <button className="relative w-8 h-8 rounded-xl hover:bg-[color:var(--background)] flex items-center justify-center text-[color:var(--muted)] transition-colors">
              <Bell size={15} strokeWidth={1.75} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--error)]" />
            </button>
            <button className="w-8 h-8 rounded-xl hover:bg-[color:var(--background)] flex items-center justify-center text-[color:var(--muted)] transition-colors">
              <Settings size={15} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeNav === "overview"    && <OverviewTab />}
          {activeNav === "properties"  && <PropertiesTab />}
          {activeNav === "tenants"     && <TenantsTab />}
          {activeNav === "payments"    && <PaymentsTab />}
          {activeNav === "maintenance" && <MaintenanceTab />}
          {activeNav === "reports"     && <ReportsTab />}
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => setActiveNav("properties")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white rounded-full shadow-xl flex items-center justify-center transition-colors z-50 lg:flex hidden"
        title="Add Property"
      >
        <Plus size={22} strokeWidth={2} />
      </button>
    </div>
  );
}

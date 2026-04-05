"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { type Locale, createT, fmtINR, fmtK } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateRange = "7d" | "30d" | "90d";
type TxFilter  = "all" | "paid" | "pending" | "overdue";
type ActFilter = "all" | "payments" | "maintenance" | "tenants";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PROPERTIES = [
  { id: "p1", name: "Sunshine PG",     address: "Koramangala, Bangalore", totalBeds: 12, occupied: 10, prevOccupied: 9,  rent: 8500,  maintCost: 4200 },
  { id: "p2", name: "Green Haven",     address: "Indiranagar, Bangalore",  totalBeds: 8,  occupied: 7,  prevOccupied: 6,  rent: 10000, maintCost: 2100 },
  { id: "p3", name: "Royal Residency", address: "HSR Layout, Bangalore",   totalBeds: 10, occupied: 8,  prevOccupied: 9,  rent: 9500,  maintCost: 3800 },
];

const MONTHLY_REVENUE = [
  { month: "Oct", amount: 148000, prev: 141000 },
  { month: "Nov", amount: 162000, prev: 148000 },
  { month: "Dec", amount: 155000, prev: 162000 },
  { month: "Jan", amount: 171000, prev: 155000 },
  { month: "Feb", amount: 168000, prev: 171000 },
  { month: "Mar", amount: 184000, prev: 168000 },
];

const TRANSACTIONS = [
  { id: "t1", tenant: "Rahul Sharma",  initials: "RS", property: "Sunshine PG",     room: "3A", amount: 8500,  date: "Apr 2",  status: "paid",    daysOverdue: 0 },
  { id: "t2", tenant: "Priya Verma",   initials: "PV", property: "Green Haven",     room: "1B", amount: 10000, date: "Apr 2",  status: "paid",    daysOverdue: 0 },
  { id: "t3", tenant: "Amit Patel",    initials: "AP", property: "Royal Residency", room: "2A", amount: 9500,  date: "Apr 3",  status: "paid",    daysOverdue: 0 },
  { id: "t4", tenant: "Neha Gupta",    initials: "NG", property: "Sunshine PG",     room: "5C", amount: 8500,  date: "Apr 5",  status: "pending", daysOverdue: 0 },
  { id: "t5", tenant: "Kiran Rao",     initials: "KR", property: "Green Haven",     room: "2A", amount: 10000, date: "Apr 5",  status: "pending", daysOverdue: 0 },
  { id: "t6", tenant: "Sonia Mehta",   initials: "SM", property: "Royal Residency", room: "4B", amount: 9500,  date: "Mar 28", status: "overdue", daysOverdue: 8 },
];

const TENANTS = [
  { id: "u1", name: "Rahul Sharma",  initials: "RS", property: "Sunshine PG",     room: "3A", leaseEnd: "Dec 2025", paid: true,  risk: "none",     payHistory: [true, true, true] },
  { id: "u2", name: "Priya Verma",   initials: "PV", property: "Green Haven",     room: "1B", leaseEnd: "May 2026", paid: true,  risk: "none",     payHistory: [true, true, true] },
  { id: "u3", name: "Amit Patel",    initials: "AP", property: "Royal Residency", room: "2A", leaseEnd: "Apr 2026", paid: true,  risk: "expiring", payHistory: [true, true, true] },
  { id: "u4", name: "Neha Gupta",    initials: "NG", property: "Sunshine PG",     room: "5C", leaseEnd: "Nov 2025", paid: false, risk: "none",     payHistory: [false, true, false] },
  { id: "u5", name: "Kiran Rao",     initials: "KR", property: "Green Haven",     room: "2A", leaseEnd: "Oct 2025", paid: false, risk: "late",     payHistory: [false, false, true] },
  { id: "u6", name: "Sonia Mehta",   initials: "SM", property: "Royal Residency", room: "4B", leaseEnd: "Sep 2025", paid: false, risk: "late",     payHistory: [false, false, false] },
];

const MAINTENANCE = [
  { id: "m1", title: "Bathroom tap leaking",      property: "Sunshine PG",     room: "2B",     priority: "high",   category: "Plumbing",   age: "2 days", status: "open",     cost: 800  },
  { id: "m2", title: "WiFi not working",           property: "Green Haven",     room: "Common", priority: "medium", category: "Electrical", age: "1 day",  status: "open",     cost: 0    },
  { id: "m3", title: "Broken chair",               property: "Royal Residency", room: "3A",     priority: "low",    category: "Furniture",  age: "4 days", status: "open",     cost: 400  },
  { id: "m4", title: "AC not cooling properly",    property: "Sunshine PG",     room: "4C",     priority: "high",   category: "Electrical", age: "5 hrs",  status: "open",     cost: 2200 },
  { id: "m5", title: "Geyser repaired",            property: "Green Haven",     room: "3B",     priority: "high",   category: "Plumbing",   age: "3 days", status: "resolved", cost: 1500 },
  { id: "m6", title: "Broken window latch fixed",  property: "Royal Residency", room: "1A",     priority: "medium", category: "Structural", age: "5 days", status: "resolved", cost: 350  },
];

const ACTIVITY_ALL: { icon: string; textKey: string; vars: Record<string, string>; timeKey: string; type: string }[] = [
  { icon: "₹",  textKey: "act.paid",      vars: { name: "Rahul Sharma",  amount: "8,500",  month: "April" }, timeKey: "time.2h",        type: "payments"    },
  { icon: "🔧", textKey: "act.maint_req", vars: { property: "Sunshine PG",  issue: "AC"                   }, timeKey: "time.5h",        type: "maintenance" },
  { icon: "👤", textKey: "act.onboarded", vars: { name: "Arjun Singh",   property: "Green Haven"           }, timeKey: "time.yesterday", type: "tenants"     },
  { icon: "₹",  textKey: "act.paid",      vars: { name: "Priya Verma",   amount: "10,000", month: "April" }, timeKey: "time.yesterday", type: "payments"    },
  { icon: "⚠",  textKey: "act.overdue",   vars: { name: "Sonia Mehta",   days: "8"                         }, timeKey: "time.2d",        type: "payments"    },
  { icon: "🔧", textKey: "act.repaired",  vars: { item: "Geyser", property: "Green Haven", room: "3B"      }, timeKey: "time.3d",        type: "maintenance" },
  { icon: "₹",  textKey: "act.paid",      vars: { name: "Amit Patel",    amount: "9,500",  month: "April" }, timeKey: "time.3d",        type: "payments"    },
  { icon: "👤", textKey: "act.lease_due", vars: { name: "Neha Gupta",    days: "60"                        }, timeKey: "time.4d",        type: "tenants"     },
];

const ALERTS = [
  { id: "a1", group: "financial",   priority: "critical", titleKey: "alert.a1.title", descKey: "alert.a1.desc", actionKey: "alert.action.reminder" },
  { id: "a2", group: "financial",   priority: "warning",  titleKey: "alert.a2.title", descKey: "alert.a2.desc", actionKey: "alert.action.view"     },
  { id: "a3", group: "maintenance", priority: "critical", titleKey: "alert.a3.title", descKey: "alert.a3.desc", actionKey: "alert.action.assign"   },
  { id: "a4", group: "maintenance", priority: "warning",  titleKey: "alert.a4.title", descKey: "alert.a4.desc", actionKey: "alert.action.review"   },
  { id: "a5", group: "lease",       priority: "warning",  titleKey: "alert.a5.title", descKey: "alert.a5.desc", actionKey: "alert.action.renew"    },
  { id: "a6", group: "lease",       priority: "info",     titleKey: "alert.a6.title", descKey: "alert.a6.desc", actionKey: "alert.action.plan"     },
];

// ─── Computed constants ───────────────────────────────────────────────────────

const TOTAL_BEDS     = PROPERTIES.reduce((s, p) => s + p.totalBeds, 0);
const TOTAL_OCC      = PROPERTIES.reduce((s, p) => s + p.occupied, 0);
const PREV_OCC       = PROPERTIES.reduce((s, p) => s + p.prevOccupied, 0);
const OCC_PCT        = Math.round((TOTAL_OCC / TOTAL_BEDS) * 100);
const PREV_OCC_PCT   = Math.round((PREV_OCC / TOTAL_BEDS) * 100);
const CURR_REV       = MONTHLY_REVENUE.at(-1)!.amount;
const PREV_REV       = MONTHLY_REVENUE.at(-2)!.amount;
const REV_CHANGE     = +((CURR_REV - PREV_REV) / PREV_REV * 100).toFixed(1);
const OCC_CHANGE     = OCC_PCT - PREV_OCC_PCT;
const COLLECTED      = TRANSACTIONS.filter(t => t.status === "paid").reduce((s, t) => s + t.amount, 0);
const TOTAL_DUE      = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
const PENDING_AMT    = TRANSACTIONS.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);
const OVERDUE_AMT    = TRANSACTIONS.filter(t => t.status === "overdue").reduce((s, t) => s + t.amount, 0);
const COLLECT_PCT    = Math.round((COLLECTED / TOTAL_DUE) * 100);
const PREV_COLLECT   = 76;
const TOTAL_MAINT    = MAINTENANCE.reduce((s, m) => s + m.cost, 0);
const NET_REV        = CURR_REV - TOTAL_MAINT;
const REV_PER_BED    = Math.round(CURR_REV / TOTAL_OCC);

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_IDS = ["overview", "properties", "tenants", "payments", "maintenance", "reports"] as const;
const NAV_ICONS: Record<string, React.ReactElement> = {
  overview:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  properties:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  tenants:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  payments:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  maintenance: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>,
  reports:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
};

// ─── Small components ─────────────────────────────────────────────────────────

function TrendBadge({ change, unit = "%" }: { change: number; unit?: string }) {
  const up = change >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {up ? "↑" : "↓"} {Math.abs(change)}{unit}
    </span>
  );
}

function StatusPill({ status, label }: { status: string; label: string }) {
  const s: Record<string, string> = {
    paid:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    overdue: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
  };
  const dot: Record<string, string> = { paid: "bg-emerald-500", pending: "bg-amber-400", overdue: "bg-rose-500" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {label}
    </span>
  );
}

function PriorityPill({ priority, label }: { priority: string; label: string }) {
  const s: Record<string, string> = {
    high:   "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
    medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    low:    "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${s[priority]}`}>{label}</span>;
}

function RiskBadge({ risk, label }: { risk: string; label: string }) {
  if (risk === "none") return null;
  const s: Record<string, string> = {
    late:     "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
    expiring: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${s[risk]}`}>{label}</span>;
}

function Avatar({ initials }: { initials: string }) {
  const p = ["bg-violet-100 text-violet-700","bg-slate-100 text-slate-600","bg-emerald-100 text-emerald-700","bg-amber-100 text-amber-700","bg-rose-100 text-rose-700","bg-indigo-100 text-indigo-700"];
  return <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${p[initials.charCodeAt(0) % p.length]}`}>{initials}</span>;
}

function PayDots({ history }: { history: boolean[] }) {
  return (
    <div className="flex gap-1">
      {history.map((paid, i) => <span key={i} className={`w-2 h-2 rounded-full ${paid ? "bg-emerald-400" : "bg-rose-400"}`} />)}
    </div>
  );
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${20 - ((v - min) / range) * 20}`).join(" ");
  return <svg width="60" height="20" viewBox="0 0 60 20"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Donut({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 32, circ = 2 * Math.PI * r, filled = (pct / 100) * circ;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84">
      <circle cx="42" cy="42" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" transform="rotate(-90 42 42)" />
      <text x="42" y="39" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e1b4b" fontFamily="inherit">{pct}%</text>
      <text x="42" y="52" textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="inherit">{label}</text>
    </svg>
  );
}

function RevenueChart({ hovered, setHovered }: { hovered: number | null; setHovered: (i: number | null) => void }) {
  const max = Math.max(...MONTHLY_REVENUE.flatMap(d => [d.amount, d.prev]));
  const H = 100, BW = 22, G = 22, total = MONTHLY_REVENUE.length * (BW * 2 + 6 + G) - G;
  return (
    <svg width="100%" viewBox={`-4 -20 ${total + 8} ${H + 40}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cG1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" /></linearGradient>
        <linearGradient id="cG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#f1f5f9" /></linearGradient>
      </defs>
      {[0, 0.5, 1].map(t => <line key={t} x1="-4" y1={H - t * H} x2={total + 4} y2={H - t * H} stroke="#f1f5f9" strokeWidth="1" />)}
      {MONTHLY_REVENUE.map((d, i) => {
        const x = i * (BW * 2 + 6 + G);
        const prevH = Math.max(4, Math.round((d.prev / max) * H));
        const currH = Math.max(4, Math.round((d.amount / max) * H));
        const isLast = i === MONTHLY_REVENUE.length - 1;
        return (
          <g key={d.month} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
            <rect x={x - 4} y={-8} width={BW * 2 + 14} height={H + 16} rx="6" fill={hovered === i ? "#f8fafc" : "transparent"} />
            <rect x={x} y={H - prevH} width={BW} height={prevH} rx="4" fill="url(#cG2)" />
            <rect x={x + BW + 6} y={H - currH} width={BW} height={currH} rx="4" fill="url(#cG1)" opacity={isLast ? 1 : 0.5} />
            <text x={x + BW + 3} y={H + 14} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="inherit">{d.month}</text>
            {hovered === i && (
              <>
                <rect x={x - 2} y={H - currH - 22} width={BW * 2 + 10} height={17} rx="4" fill="#1e1b4b" />
                <text x={x + BW + 3} y={H - currH - 11} textAnchor="middle" fontSize="9" fill="white" fontWeight="600" fontFamily="inherit">
                  ₹{Math.round(d.amount / 1000)}k / ₹{Math.round(d.prev / 1000)}k
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OwnerDashboardClient() {
  const [locale,        setLocale]        = useState<Locale>("en");
  const [activeNav,     setActiveNav]     = useState("overview");
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [dateRange,     setDateRange]     = useState<DateRange>("30d");
  const [txFilter,      setTxFilter]      = useState<TxFilter>("all");
  const [actFilter,     setActFilter]     = useState<ActFilter>("all");
  const [alertGroup,    setAlertGroup]    = useState<"all"|"financial"|"maintenance"|"lease">("all");
  const [chartHovered,  setChartHovered]  = useState<number | null>(null);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [selectedTx,    setSelectedTx]    = useState<Set<string>>(new Set());
  const [showResolvedM, setShowResolvedM] = useState(false);
  const [showAllTenants,setShowAllTenants]= useState(false);
  const [showAllAct,    setShowAllAct]    = useState(false);

  const t = useMemo(() => createT(locale), [locale]);

  // ── Derived data ──
  const filteredTx = useMemo(() =>
    txFilter === "all" ? TRANSACTIONS : TRANSACTIONS.filter(tx => tx.status === txFilter), [txFilter]);

  const filteredAct = useMemo(() =>
    actFilter === "all" ? ACTIVITY_ALL : ACTIVITY_ALL.filter(a => a.type === actFilter), [actFilter]);

  const filteredAlerts = useMemo(() =>
    alertGroup === "all" ? ALERTS : ALERTS.filter(a => a.group === alertGroup), [alertGroup]);

  const rankedProps = useMemo(() =>
    [...PROPERTIES]
      .map(p => ({ ...p, revenue: p.occupied * p.rent, occPct: Math.round(p.occupied / p.totalBeds * 100) }))
      .sort((a, b) => b.revenue - a.revenue),
  []);

  const openTickets     = MAINTENANCE.filter(m => m.status === "open");
  const resolvedTickets = MAINTENANCE.filter(m => m.status === "resolved");
  const visibleMaint    = showResolvedM ? MAINTENANCE : openTickets;
  const visibleTenants  = showAllTenants ? TENANTS : TENANTS.slice(0, 4);
  const visibleAct      = showAllAct ? filteredAct : filteredAct.slice(0, 5);

  const categoryCount = MAINTENANCE.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1; return acc;
  }, {});

  const toggleTx = (id: string) =>
    setSelectedTx(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Insights (severity-sorted, critical first) ──
  const insights = useMemo(() => [
    {
      priority: 0, type: "negative", icon: "⚠", isCritical: true,
      title: t("insights.overdue_title", { n: 2 }),
      desc:  t("insights.overdue_desc"),
      cta:   t("insights.cta.reminders"),
    },
    {
      priority: 1, type: "negative", icon: "🔧", isCritical: true,
      title: t("insights.maint_title"),
      desc:  t("insights.maint_desc", { cost: (TOTAL_MAINT / 1000).toFixed(1) }),
      cta:   t("insights.cta.assign"),
    },
    {
      priority: 2, type: "warning", icon: "📋", isCritical: false,
      title: t("insights.lease_title"),
      desc:  t("insights.lease_desc"),
      cta:   t("insights.cta.renew"),
    },
    {
      priority: 3, type: REV_CHANGE >= 0 ? "positive" : "negative", icon: REV_CHANGE >= 0 ? "↑" : "↓", isCritical: false,
      title: t(REV_CHANGE >= 0 ? "insights.revenue_up" : "insights.revenue_down", { pct: Math.abs(REV_CHANGE) }),
      desc:  t("insights.revenue_desc", { curr: Math.round(CURR_REV / 1000), prev: Math.round(PREV_REV / 1000) }),
    },
    {
      priority: 4, type: OCC_CHANGE >= 0 ? "positive" : "negative", icon: OCC_CHANGE >= 0 ? "↑" : "↓", isCritical: false,
      title: t(OCC_CHANGE >= 0 ? "insights.occ_up" : "insights.occ_down", { n: Math.abs(OCC_CHANGE) }),
      desc:  t("insights.occ_desc", { curr: OCC_PCT, prev: PREV_OCC_PCT, vacant: TOTAL_BEDS - TOTAL_OCC }),
    },
  ], [locale]);

  const alertGroupStyle: Record<string, { bar: string; badge: string; icon: string }> = {
    financial:   { bar: "bg-rose-500",   badge: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",      icon: "💳" },
    maintenance: { bar: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",   icon: "🔧" },
    lease:       { bar: "bg-violet-500", badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200", icon: "📋" },
  };
  const alertPriorityStyle: Record<string, string> = {
    critical: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
    warning:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    info:     "bg-sky-50 text-sky-600 ring-1 ring-sky-200",
  };
  const actIconStyle: Record<string, string> = {
    payments:    "bg-emerald-50 text-emerald-600",
    maintenance: "bg-amber-50 text-amber-600",
    tenants:     "bg-slate-100 text-slate-600",
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-56 bg-white border-r border-slate-200 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}>
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-slate-100 shrink-0">
          <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="font-extrabold text-sm text-slate-900">ShiftProof</span>
          <span className="ml-auto text-[10px] bg-violet-50 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded font-semibold shrink-0">{t("nav.owner_badge")}</span>
        </div>

        <div className="px-4 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Menu</p>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_IDS.map(id => (
            <button key={id} onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeNav === id ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
              <span className={activeNav === id ? "text-violet-600" : "text-slate-400"}>{NAV_ICONS[id]}</span>
              {t(`nav.${id}`)}
              {id === "maintenance" && openTickets.length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0">{openTickets.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pt-3 pb-2 border-t border-slate-100">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            {t("nav.back")}
          </Link>
        </div>
        <div className="px-4 py-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">RK</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{t("profile.name")}</p>
              <p className="text-[11px] text-slate-400">{t("profile.sub", { n: 3, beds: TOTAL_BEDS })}</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-5 h-14 bg-white border-b border-slate-200 shrink-0">
          <button className="lg:hidden text-slate-400 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{t("topbar.title")}</p>
            <p className="text-[11px] text-slate-400 hidden sm:block">{t("topbar.date")}</p>
          </div>

          {/* Date range */}
          <div className="ml-2 hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 shrink-0">
            {(["7d","30d","90d"] as DateRange[]).map(r => (
              <button key={r} onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${dateRange === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t(`topbar.${r}`)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Language switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {(["en","hi"] as Locale[]).map(l => (
                <button key={l} onClick={() => setLocale(l)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${locale === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                  {l === "en" ? "EN" : "हि"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-400 w-36">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              {t("topbar.search")}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">{t("topbar.notif_title")}</p>
                    <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded font-semibold">{t("topbar.n_new", { n: ALERTS.length })}</span>
                  </div>
                  {ALERTS.slice(0, 4).map(a => (
                    <div key={a.id} className="flex gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-base shrink-0">{alertGroupStyle[a.group].icon}</span>
                      <div><p className="text-xs font-medium text-slate-800">{t(a.titleKey)}</p><p className="text-[11px] text-slate-400 mt-0.5">{t(a.descKey)}</p></div>
                    </div>
                  ))}
                  <button className="w-full text-xs text-violet-600 py-2.5 hover:bg-slate-50 transition-colors font-medium">{t("topbar.view_all_alerts")}</button>
                </div>
              )}
            </div>

            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              {t("topbar.export")}
            </button>

            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              {t("topbar.add_property")}
            </button>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto px-5 py-8 space-y-8">

          {/* Greeting */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t("greeting.text")}</h2>
              <p className="text-sm text-slate-500 mt-1">{t("greeting.sub")}</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-slate-300 transition-colors shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {t("greeting.month")}
            </button>
          </div>

          {/* ── Auto Insights (severity-ranked) ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{t("insights.label")}</p>
              <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded font-semibold">{t(`topbar.${dateRange}`)}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {insights.map((ins, i) => {
                const borderCls = ins.type === "positive" ? "border-emerald-200 bg-emerald-50/60"
                  : ins.type === "negative" ? "border-rose-200 bg-rose-50/60"
                  : "border-amber-200 bg-amber-50/60";
                const titleCls = ins.type === "positive" ? "text-emerald-800"
                  : ins.type === "negative" ? "text-rose-800"
                  : "text-amber-800";
                const ctaCls = ins.type === "negative"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white";
                return (
                  <div key={i} className={`flex-none rounded-xl border p-4 flex flex-col gap-2 ${ins.isCritical ? "w-64" : "w-52"} ${borderCls}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold leading-none ${titleCls}`}>{ins.icon}</span>
                      <p className={`font-bold leading-snug ${ins.isCritical ? "text-sm" : "text-xs"} ${titleCls}`}>{ins.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed flex-1">{ins.desc}</p>
                    {ins.cta && (
                      <button className={`mt-1 self-start text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${ctaCls}`}>
                        {ins.cta}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t("kpi.revenue")}</p>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{fmtK(CURR_REV)}</p>
              <div className="flex items-center gap-2 mt-3">
                <Spark data={MONTHLY_REVENUE.map(d => d.amount)} color="#7c3aed" />
                <TrendBadge change={REV_CHANGE} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t("kpi.occupancy")}</p>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{OCC_PCT}%</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t("kpi.n_occupied", { occupied: TOTAL_OCC })}</span>
                  <TrendBadge change={OCC_CHANGE} unit="pp" />
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${OCC_PCT}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t("kpi.collection")}</p>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /></svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{COLLECT_PCT}%</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t("kpi.paid_month", { n: TRANSACTIONS.filter(tx => tx.status === "paid").length })}</span>
                  <TrendBadge change={COLLECT_PCT - PREV_COLLECT} unit="pp" />
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${COLLECT_PCT}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t("kpi.pending")}</p>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{fmtK(PENDING_AMT + OVERDUE_AMT)}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
                <span className="bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap">{fmtK(PENDING_AMT)} {t("kpi.pending_label")}</span>
                <span className="bg-rose-50 text-rose-600 ring-1 ring-rose-200 px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap">{fmtK(OVERDUE_AMT)} {t("kpi.overdue_label")}</span>
              </div>
            </div>
          </div>

          {/* ── Revenue Chart + Donuts ── */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{t("chart.title")}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{t("chart.sub")}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-slate-200" />{t("chart.prev")}</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-violet-500 opacity-50" />{t("chart.current")}</span>
                </div>
              </div>
              <RevenueChart hovered={chartHovered} setHovered={setChartHovered} />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-5">{t("chart.glance")}</h3>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <Donut pct={OCC_PCT} color="#7c3aed" label={t("chart.bed_occ")} />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{t("chart.bed_occ")}</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{TOTAL_OCC}<span className="text-xs text-slate-400 font-normal"> / {TOTAL_BEDS}</span></p>
                    <TrendBadge change={OCC_CHANGE} unit="pp" />
                  </div>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-center gap-4">
                  <Donut pct={COLLECT_PCT} color="#10b981" label={t("chart.collected")} />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{t("chart.collected")}</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{fmtK(COLLECTED)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t("chart.of_due", { n: Math.round(TOTAL_DUE / 1000) })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Financial Breakdown ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: "fin.gross",    valueKey: fmtK(CURR_REV),          subKey: t("fin.gross_sub"),                                           icon: "bg-slate-100 text-slate-500" },
              { key: "fin.maint",    valueKey: fmtK(TOTAL_MAINT),        subKey: t("fin.maint_sub", { n: resolvedTickets.length }),            icon: "bg-slate-100 text-slate-500" },
              { key: "fin.net",      valueKey: fmtK(NET_REV),            subKey: t("fin.net_sub"),                                             icon: "bg-slate-100 text-slate-500" },
              { key: "fin.per_bed",  valueKey: fmtINR(REV_PER_BED, locale), subKey: t("fin.per_bed_sub", { n: TOTAL_OCC }),                   icon: "bg-slate-100 text-slate-500" },
            ].map(item => (
              <div key={item.key} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className={`w-8 h-8 rounded-lg ${item.icon} flex items-center justify-center mb-4`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                </div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t(item.key)}</p>
                <p className="text-xl font-bold text-slate-900 mt-1.5">{item.valueKey}</p>
                <p className="text-[11px] text-slate-400 mt-1">{item.subKey}</p>
              </div>
            ))}
          </div>

          {/* ── Alerts ── */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{t("alerts.title")}</h3>
                <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-full font-semibold">{t("alerts.n_active", { n: ALERTS.length })}</span>
              </div>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 overflow-x-auto no-scrollbar shrink-0">
                {(["all","financial","maintenance","lease"] as const).map(g => (
                  <button key={g} onClick={() => setAlertGroup(g)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${alertGroup === g ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                    {t(`alerts.group.${g}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredAlerts.map(a => {
                const gs = alertGroupStyle[a.group];
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-1 h-8 rounded-full ${gs.bar} shrink-0`} />
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${gs.badge}`}>{gs.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-800">{t(a.titleKey)}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${alertPriorityStyle[a.priority]}`}>{a.priority}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t(a.descKey)}</p>
                    </div>
                    <button className="text-xs text-violet-600 font-semibold border border-violet-200 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors shrink-0">
                      {t(a.actionKey)}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Property Comparison ── */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">{t("props.title")}</h3>
              <span className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                ↑ {rankedProps[0].name} — {t("props.top")}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-semibold">{t("props.rank")}</th>
                    <th className="text-left px-3 py-3 font-semibold">{t("props.property")}</th>
                    <th className="text-right px-3 py-3 font-semibold hidden sm:table-cell">{t("props.occupancy")}</th>
                    <th className="text-right px-3 py-3 font-semibold">{t("props.revenue")}</th>
                    <th className="text-right px-3 py-3 font-semibold hidden md:table-cell">{t("props.rev_bed")}</th>
                    <th className="text-right px-5 py-3 font-semibold hidden md:table-cell">{t("props.maint")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedProps.map((p, i) => (
                    <tr key={p.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === 0 ? "bg-emerald-50/30" : i === rankedProps.length - 1 ? "bg-rose-50/20" : ""}`}>
                      <td className="px-5 py-3.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-400"}`}>{i + 1}</span>
                      </td>
                      <td className="px-3 py-3.5"><p className="text-xs font-semibold text-slate-800">{p.name}</p><p className="text-[11px] text-slate-400">{p.address}</p></td>
                      <td className="px-3 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-violet-500" style={{ width: `${p.occPct}%` }} /></div>
                          <span className="text-xs font-semibold text-slate-700 w-8 text-right">{p.occPct}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-900">{fmtK(p.revenue)}</td>
                      <td className="px-3 py-3.5 text-right text-xs text-slate-500 hidden md:table-cell">{fmtINR(p.revenue / p.occupied, locale)}</td>
                      <td className="px-5 py-3.5 text-right text-xs hidden md:table-cell">
                        <span className={`font-semibold ${p.maintCost > 3000 ? "text-rose-600" : "text-slate-600"}`}>{fmtK(p.maintCost)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Transactions ── */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">{t("tx.title")}</h3>
              <div className="flex items-center gap-2 shrink-0">
                {selectedTx.size > 0 && (
                  <button className="text-xs text-violet-600 font-semibold border border-violet-200 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors whitespace-nowrap">
                    {t("tx.send_reminder", { n: selectedTx.size })}
                  </button>
                )}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                  {(["all","paid","pending","overdue"] as TxFilter[]).map(f => (
                    <button key={f} onClick={() => setTxFilter(f)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize whitespace-nowrap transition-all ${txFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                      {t(`tx.${f}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
                    <th className="px-5 py-3 w-8"><input type="checkbox" className="rounded accent-violet-600" onChange={e => setSelectedTx(e.target.checked ? new Set(filteredTx.map(tx => tx.id)) : new Set())} checked={selectedTx.size === filteredTx.length && filteredTx.length > 0} readOnly /></th>
                    <th className="text-left px-2 py-3 font-semibold">{t("tx.tenant")}</th>
                    <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">{t("tx.property_room")}</th>
                    <th className="text-right px-3 py-3 font-semibold">{t("tx.amount")}</th>
                    <th className="text-right px-3 py-3 font-semibold hidden sm:table-cell">{t("tx.date")}</th>
                    <th className="text-right px-3 py-3 font-semibold hidden md:table-cell">{t("tx.overdue_col")}</th>
                    <th className="text-right px-5 py-3 font-semibold">{t("tx.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((tx, i) => (
                    <tr key={tx.id} className={`hover:bg-slate-50 transition-colors ${i < filteredTx.length - 1 ? "border-b border-slate-100" : ""} ${selectedTx.has(tx.id) ? "bg-violet-50/40" : ""}`}>
                      <td className="px-5 py-3.5"><input type="checkbox" className="rounded accent-violet-600" checked={selectedTx.has(tx.id)} onChange={() => toggleTx(tx.id)} /></td>
                      <td className="px-2 py-3.5"><div className="flex items-center gap-2.5"><Avatar initials={tx.initials} /><span className="text-xs font-medium text-slate-800">{tx.tenant}</span></div></td>
                      <td className="px-3 py-3.5 text-xs text-slate-500 hidden sm:table-cell">{tx.property} · {tx.room}</td>
                      <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-900">{fmtINR(tx.amount, locale)}</td>
                      <td className="px-3 py-3.5 text-right text-xs text-slate-400 hidden sm:table-cell">{tx.date}</td>
                      <td className="px-3 py-3.5 text-right text-xs hidden md:table-cell">
                        {tx.daysOverdue > 0 ? <span className="text-rose-600 font-semibold">{t("tx.n_days_overdue", { n: tx.daysOverdue })}</span> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right"><StatusPill status={tx.status} label={t(`status.${tx.status}`)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Maintenance Analytics ── */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">{t("maint.title")}</h3>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="bg-rose-50 text-rose-600 ring-1 ring-rose-200 px-2 py-0.5 rounded-full font-semibold">{t("maint.n_open", { n: openTickets.length })}</span>
                  <span className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5 rounded-full font-semibold">{t("maint.n_resolved", { n: resolvedTickets.length })}</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {visibleMaint.map(m => (
                  <div key={m.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${m.status === "resolved" ? "opacity-60" : ""}`}>
                    <div className={`w-1.5 h-8 rounded-full shrink-0 ${m.priority === "high" ? "bg-rose-400" : m.priority === "medium" ? "bg-amber-400" : "bg-slate-300"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-medium text-slate-800 truncate">{m.title}</p>
                        {m.status === "resolved" && <span className="text-[10px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-1.5 py-0.5 rounded font-semibold shrink-0">{t("maint.resolved_badge")}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{m.property}</span><span>·</span><span>{m.room}</span><span>·</span>
                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-medium">{m.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <PriorityPill priority={m.priority} label={t(`priority.${m.priority}`)} />
                      <p className="text-[10px] text-slate-400 mt-1">{m.age}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-700 shrink-0">{m.cost > 0 ? fmtINR(m.cost, locale) : t("maint.free")}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-slate-100">
                <button onClick={() => setShowResolvedM(!showResolvedM)}
                  className="w-full text-xs text-slate-500 hover:text-violet-600 font-medium py-1 transition-colors">
                  {showResolvedM ? t("maint.hide_resolved") : t("maint.show_resolved", { n: resolvedTickets.length })}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-5">{t("maint.analytics")}</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">{t("maint.total_cost")}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{fmtINR(TOTAL_MAINT, locale)}</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">{t("maint.up_vs_last", { n: 800 })}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">{t("maint.avg_time")}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">3.2 days</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">{t("maint.target")}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold mb-3">{t("maint.categories")}</p>
                  {Object.entries(categoryCount).map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-slate-400" style={{ width: `${(count / MAINTENANCE.length) * 100}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-500 w-24 text-right shrink-0">{cat} ({count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Tenants + Activity ── */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">{t("tenants.title")}</h3>
                <button className="flex items-center gap-1.5 text-xs text-violet-600 font-semibold border border-violet-200 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  {t("tenants.add")}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
                      <th className="text-left px-5 py-3 font-semibold">{t("tenants.tenant")}</th>
                      <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">{t("tenants.lease_end")}</th>
                      <th className="text-center px-3 py-3 font-semibold hidden sm:table-cell">{t("tenants.last3")}</th>
                      <th className="text-right px-3 py-3 font-semibold">{t("tenants.risk")}</th>
                      <th className="text-right px-5 py-3 font-semibold">{t("tenants.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTenants.map((tenant, i) => (
                      <tr key={tenant.id} className={`hover:bg-slate-50 transition-colors ${i < visibleTenants.length - 1 ? "border-b border-slate-100" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={tenant.initials} />
                            <div><p className="text-xs font-semibold text-slate-800">{tenant.name}</p><p className="text-[11px] text-slate-400">{tenant.property} · {tenant.room}</p></div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-slate-500 hidden md:table-cell">
                          <p>{tenant.leaseEnd}</p>
                          {tenant.risk === "expiring" && <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{t("tenants.renew_soon")}</p>}
                        </td>
                        <td className="px-3 py-3.5 hidden sm:table-cell"><div className="flex justify-center"><PayDots history={tenant.payHistory} /></div></td>
                        <td className="px-3 py-3.5 text-right"><RiskBadge risk={tenant.risk} label={t(`risk.${tenant.risk}`)} /></td>
                        <td className="px-5 py-3.5 text-right"><StatusPill status={tenant.paid ? "paid" : "pending"} label={t(tenant.paid ? "status.paid" : "status.pending")} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {TENANTS.length > 4 && (
                <div className="px-5 py-3 border-t border-slate-100">
                  <button onClick={() => setShowAllTenants(!showAllTenants)}
                    className="w-full text-xs text-slate-500 hover:text-violet-600 font-medium py-1 transition-colors">
                    {showAllTenants ? t("tenants.collapse") : t("tenants.show_all", { n: TENANTS.length })}
                  </button>
                </div>
              )}
            </div>

            {/* Activity */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">{t("activity.title")}</h3>
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                  {(["all","payments","maintenance","tenants"] as ActFilter[]).map(f => (
                    <button key={f} onClick={() => setActFilter(f)}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${actFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                      {f === "all" ? t("activity.all") : f === "payments" ? "₹" : f === "maintenance" ? "🔧" : "👤"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-5 py-2.5 bg-violet-50/50 border-b border-violet-100">
                <p className="text-[11px] font-semibold text-violet-700">{t("activity.summary")}</p>
                <p className="text-[11px] text-violet-500 mt-0.5">{t("activity.summary_text")}</p>
              </div>
              <div className="divide-y divide-slate-100">
                {visibleAct.map((a, i) => (
                  <div key={i} className="flex gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold ${actIconStyle[a.type] ?? "bg-slate-100 text-slate-500"}`}>{a.icon}</div>
                    <div><p className="text-xs text-slate-700 leading-snug">{t(a.textKey, a.vars)}</p><p className="text-[11px] text-slate-400 mt-0.5">{t(a.timeKey)}</p></div>
                  </div>
                ))}
              </div>
              {filteredAct.length > 5 && (
                <div className="px-5 py-3 border-t border-slate-100">
                  <button onClick={() => setShowAllAct(!showAllAct)} className="w-full text-xs text-slate-500 hover:text-violet-600 font-medium py-1 transition-colors">
                    {showAllAct ? t("activity.collapse") : t("activity.show_all")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="h-4" />
        </main>
      </div>
    </div>
  );
}

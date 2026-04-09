"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  LayoutGrid, List, Home, Users, CreditCard, Wrench, BarChart3,
  X, Upload, Trash2, Pencil, Bell, Globe, Search, Download, Plus, Menu,
  ChevronLeft, ChevronRight, MapPin, Phone, IndianRupee,
  Calendar, AlertCircle, CheckCircle2,
} from "lucide-react";
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
const PREV_COLLECT   = 47;
const TOTAL_MAINT    = MAINTENANCE.reduce((s, m) => s + m.cost, 0);
const NET_REV        = CURR_REV - TOTAL_MAINT;
const REV_PER_BED    = Math.round(CURR_REV / TOTAL_OCC);

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_IDS = ["overview", "properties", "tenants", "payments", "maintenance", "reports"] as const;
const NAV_ICONS: Record<string, React.ReactElement> = {
  overview:    <LayoutGrid size={15} strokeWidth={1.75} />,
  properties:  <Home       size={15} strokeWidth={1.75} />,
  tenants:     <Users      size={15} strokeWidth={1.75} />,
  payments:    <CreditCard size={15} strokeWidth={1.75} />,
  maintenance: <Wrench     size={15} strokeWidth={1.75} />,
  reports:     <BarChart3  size={15} strokeWidth={1.75} />,
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

function RevenueChart({ hovered, setHovered, dateRange }: { hovered: number | null; setHovered: (i: number | null) => void; dateRange: DateRange }) {
  const data = dateRange === "7d" ? MONTHLY_REVENUE.slice(-2) : dateRange === "30d" ? MONTHLY_REVENUE.slice(-4) : MONTHLY_REVENUE;
  const max = Math.max(...data.flatMap(d => [d.amount, d.prev]));
  const H = 100, BW = 22, G = 22, total = data.length * (BW * 2 + 6 + G) - G;
  return (
    <svg width="100%" viewBox={`-4 -20 ${total + 8} ${H + 40}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cG1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" /></linearGradient>
        <linearGradient id="cG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#f1f5f9" /></linearGradient>
      </defs>
      {[0, 0.5, 1].map(t => <line key={t} x1="-4" y1={H - t * H} x2={total + 4} y2={H - t * H} stroke="#f1f5f9" strokeWidth="1" />)}
      {data.map((d, i) => {
        const x = i * (BW * 2 + 6 + G);
        const prevH = Math.max(4, Math.round((d.prev / max) * H));
        const currH = Math.max(4, Math.round((d.amount / max) * H));
        const isLast = i === data.length - 1;
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

// ─── Properties page data ────────────────────────────────────────────────────

type PropStatus = "active" | "inactive" | "renovation";
type RoomStatus = "occupied" | "vacant" | "reserved";
type DetailTab  = "overview" | "rooms" | "tenants" | "finances" | "maintenance" | "settings";

const PROP_STATUSES: PropStatus[] = ["active", "inactive", "renovation"];

const PROPERTY_ROOMS: Record<string, { id: string; number: string; floor: number; type: string; tenant: string | null; initials: string | null; rent: number; deposit: number; leaseEnd: string | null; status: RoomStatus }[]> = {
  p1: [
    { id:"r1",  number:"101", floor:1, type:"Single AC",  tenant:"Rahul Sharma",  initials:"RS", rent:8500,  deposit:17000, leaseEnd:"Dec 2025", status:"occupied" },
    { id:"r2",  number:"102", floor:1, type:"Single",     tenant:null,            initials:null,  rent:7500,  deposit:15000, leaseEnd:null,       status:"vacant"   },
    { id:"r3",  number:"201", floor:2, type:"Double AC",  tenant:"Neha Gupta",    initials:"NG", rent:8500,  deposit:17000, leaseEnd:"Nov 2025", status:"occupied" },
    { id:"r4",  number:"202", floor:2, type:"Single AC",  tenant:"Deepak Singh",  initials:"DS", rent:8500,  deposit:17000, leaseEnd:"Mar 2026", status:"occupied" },
    { id:"r5",  number:"203", floor:2, type:"Double",     tenant:null,            initials:null,  rent:7000,  deposit:14000, leaseEnd:null,       status:"reserved" },
    { id:"r6",  number:"301", floor:3, type:"Single AC",  tenant:"Preet Kaur",    initials:"PK", rent:8500,  deposit:17000, leaseEnd:"Jun 2026", status:"occupied" },
    { id:"r7",  number:"302", floor:3, type:"Single",     tenant:"Anand Rao",     initials:"AR", rent:7500,  deposit:15000, leaseEnd:"Aug 2026", status:"occupied" },
    { id:"r8",  number:"303", floor:3, type:"Single AC",  tenant:null,            initials:null,  rent:8500,  deposit:17000, leaseEnd:null,       status:"vacant"   },
  ],
  p2: [
    { id:"r9",  number:"1A",  floor:1, type:"Single AC",  tenant:"Priya Verma",   initials:"PV", rent:10000, deposit:20000, leaseEnd:"May 2026", status:"occupied" },
    { id:"r10", number:"1B",  floor:1, type:"Double AC",  tenant:"Kiran Rao",     initials:"KR", rent:10000, deposit:20000, leaseEnd:"Oct 2025", status:"occupied" },
    { id:"r11", number:"2A",  floor:2, type:"Single",     tenant:null,            initials:null,  rent:8500,  deposit:17000, leaseEnd:null,       status:"vacant"   },
    { id:"r12", number:"2B",  floor:2, type:"Single AC",  tenant:"Meera Nair",    initials:"MN", rent:10000, deposit:20000, leaseEnd:"Jan 2026", status:"occupied" },
    { id:"r13", number:"3A",  floor:3, type:"Double AC",  tenant:"Suresh Menon",  initials:"SM", rent:10000, deposit:20000, leaseEnd:"Apr 2026", status:"occupied" },
    { id:"r14", number:"3B",  floor:3, type:"Single",     tenant:null,            initials:null,  rent:8500,  deposit:17000, leaseEnd:null,       status:"reserved" },
    { id:"r15", number:"4A",  floor:4, type:"Single AC",  tenant:"Ravi Teja",     initials:"RT", rent:10000, deposit:20000, leaseEnd:"Dec 2025", status:"occupied" },
    { id:"r16", number:"4B",  floor:4, type:"Single AC",  tenant:null,            initials:null,  rent:10000, deposit:20000, leaseEnd:null,       status:"vacant"   },
  ],
  p3: [
    { id:"r17", number:"A1",  floor:1, type:"Double AC",  tenant:"Amit Patel",    initials:"AP", rent:9500,  deposit:19000, leaseEnd:"Apr 2026", status:"occupied" },
    { id:"r18", number:"A2",  floor:1, type:"Single",     tenant:null,            initials:null,  rent:8000,  deposit:16000, leaseEnd:null,       status:"vacant"   },
    { id:"r19", number:"B1",  floor:2, type:"Single AC",  tenant:"Sonia Mehta",   initials:"SM", rent:9500,  deposit:19000, leaseEnd:"Sep 2025", status:"occupied" },
    { id:"r20", number:"B2",  floor:2, type:"Double AC",  tenant:"Vikram Joshi",  initials:"VJ", rent:9500,  deposit:19000, leaseEnd:"Jul 2026", status:"occupied" },
    { id:"r21", number:"C1",  floor:3, type:"Single",     tenant:null,            initials:null,  rent:8000,  deposit:16000, leaseEnd:null,       status:"vacant"   },
    { id:"r22", number:"C2",  floor:3, type:"Single AC",  tenant:"Pooja Iyer",    initials:"PI", rent:9500,  deposit:19000, leaseEnd:"Feb 2026", status:"occupied" },
  ],
};

const PROPERTY_AMENITIES: Record<string, string[]> = {
  p1: ["WiFi", "AC", "Laundry", "Parking", "CCTV", "Water 24×7", "Security Guard"],
  p2: ["WiFi", "AC", "Gym", "Rooftop", "CCTV", "Meal Plan", "Housekeeping", "Inverter"],
  p3: ["WiFi", "AC", "Laundry", "Power Backup", "CCTV", "Gated Entry"],
};

const PROPERTY_STATUS: Record<string, PropStatus> = { p1: "active", p2: "active", p3: "active" };

const PROPERTY_RULES: Record<string, string[]> = {
  p1: ["No smoking on premises", "Visitors allowed till 9 PM", "No loud music after 10 PM", "Monthly rent due by 5th"],
  p2: ["No smoking on premises", "Visitors allowed till 10 PM", "Gym timings: 6 AM – 10 PM", "Monthly rent due by 1st"],
  p3: ["No smoking on premises", "Visitors allowed till 9 PM", "Power backup for common areas only", "Monthly rent due by 5th"],
};

const PROPERTY_EXPENSES: Record<string, { label: string; amount: number; category: string }[]> = {
  p1: [
    { label: "Water bill",        amount: 1200, category: "Utilities"   },
    { label: "Electricity",       amount: 1800, category: "Utilities"   },
    { label: "Security guard",    amount: 4000, category: "Staff"       },
    { label: "Internet (ISP)",    amount: 1500, category: "Utilities"   },
    { label: "Plumbing repair",   amount: 800,  category: "Maintenance" },
    { label: "AC service",        amount: 2200, category: "Maintenance" },
  ],
  p2: [
    { label: "Water bill",        amount: 900,  category: "Utilities"   },
    { label: "Electricity",       amount: 2200, category: "Utilities"   },
    { label: "Gym equipment",     amount: 500,  category: "Equipment"   },
    { label: "Housekeeping",      amount: 3000, category: "Staff"       },
    { label: "WiFi repair",       amount: 0,    category: "Maintenance" },
  ],
  p3: [
    { label: "Water bill",        amount: 1000, category: "Utilities"   },
    { label: "Electricity",       amount: 1500, category: "Utilities"   },
    { label: "Security",          amount: 3500, category: "Staff"       },
    { label: "Broken latch",      amount: 350,  category: "Maintenance" },
    { label: "Geyser repair",     amount: 1500, category: "Maintenance" },
  ],
};

// ─── AddPropertyModal ─────────────────────────────────────────────────────────

function AddPropertyModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add New Property</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
        {/* Progress */}
        <div className="flex gap-1 px-6 pt-4">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-violet-600" : "bg-slate-100"}`} />
          ))}
        </div>
        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {step === 1 && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Basic Information</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Property Name *</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 transition" placeholder="e.g. Sunrise PG" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Property Type</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 transition bg-white">
                    <option>PG / Hostel</option>
                    <option>Apartment</option>
                    <option>Independent House</option>
                    <option>Co-living</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Total Beds</label>
                  <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 transition" placeholder="e.g. 12" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Full Address *</label>
                  <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 resize-none transition" placeholder="Street, Area, City, PIN" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">City</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 transition bg-white">
                    <option>Bangalore</option><option>Pune</option><option>Hyderabad</option><option>Mumbai</option><option>Delhi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Base Monthly Rent</label>
                  <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 transition" placeholder="₹ per bed" />
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amenities & Rules</p>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-2">Select Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {["WiFi","AC","Parking","Gym","Laundry","CCTV","Meal Plan","Power Backup","Water 24×7","Housekeeping","Security Guard","Rooftop"].map(a => (
                    <label key={a} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-violet-300 hover:bg-violet-50 transition select-none">
                      <input type="checkbox" className="accent-violet-600 w-3 h-3" />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">House Rules (one per line)</label>
                <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 resize-none transition" placeholder="No smoking on premises&#10;Visitors allowed till 9 PM&#10;Rent due by 5th of each month" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">Security Deposit (months)</label>
                <div className="flex gap-2">
                  {[1,2,3].map(n => (
                    <label key={n} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg py-2 cursor-pointer hover:border-violet-300 hover:bg-violet-50 transition select-none">
                      <input type="radio" name="deposit" className="accent-violet-600" defaultChecked={n === 2} />
                      {n} {n === 1 ? "month" : "months"}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact & Documents</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Contact Number</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 transition" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Property Manager Name</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 transition" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Manager Phone</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 transition" placeholder="Optional" />
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-violet-300 transition-colors cursor-pointer">
                <Upload size={24} strokeWidth={1.5} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">Upload property photos</p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG up to 10 MB each</p>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-violet-800 mb-1">All set! Review & confirm</p>
                <p className="text-[11px] text-violet-600">Your property will be listed as active. You can add rooms and tenants after saving.</p>
              </div>
            </>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
            {step > 1 ? "← Back" : "Cancel"}
          </button>
          <button onClick={() => step < 3 ? setStep(step + 1) : onClose()}
            className="text-xs font-semibold px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors">
            {step < 3 ? "Continue →" : "Save Property"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PropertiesSection ────────────────────────────────────────────────────────

function PropertiesSection({ locale }: { locale: Locale; t: (key: string, vars?: Record<string, string | number>) => string }) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PropStatus>("all");
  const [sortBy,       setSortBy]       = useState<"revenue" | "occupancy" | "name">("revenue");
  const [viewMode,     setViewMode]     = useState<"grid" | "list">("grid");
  const [selectedProp, setSelectedProp] = useState<string | null>(null);
  const [detailTab,    setDetailTab]    = useState<DetailTab>("overview");
  const [roomFilter,   setRoomFilter]   = useState<"all" | RoomStatus>("all");
  const [propStatuses, setPropStatuses] = useState<Record<string, PropStatus>>(PROPERTY_STATUS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showRentModal,     setShowRentModal]     = useState(false);
  const [showRuleEdit,      setShowRuleEdit]      = useState(false);
  const [showBulkReminder,  setShowBulkReminder]  = useState(false);

  const enriched = useMemo(() =>
    PROPERTIES.map(p => {
      const rooms    = PROPERTY_ROOMS[p.id] ?? [];
      const expenses = PROPERTY_EXPENSES[p.id] ?? [];
      const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
      return {
        ...p,
        revenue:    p.occupied * p.rent,
        occPct:     Math.round(p.occupied / p.totalBeds * 100),
        vacant:     p.totalBeds - p.occupied,
        maint:      MAINTENANCE.filter(m => m.property === p.name),
        openMaint:  MAINTENANCE.filter(m => m.property === p.name && m.status === "open").length,
        tenants:    TENANTS.filter(ten => ten.property === p.name),
        rooms,
        expenses,
        totalExp,
        netRevenue: p.occupied * p.rent - totalExp,
        propStatus: propStatuses[p.id] ?? "active",
        collectedAmt: TRANSACTIONS.filter(tx => tx.property === p.name && tx.status === "paid").reduce((s, tx) => s + tx.amount, 0),
        pendingAmt:   TRANSACTIONS.filter(tx => tx.property === p.name && tx.status !== "paid").reduce((s, tx) => s + tx.amount, 0),
      };
    }), [propStatuses]);

  const filtered = useMemo(() => {
    let list = statusFilter === "all" ? enriched : enriched.filter(p => p.propStatus === statusFilter);
    if (search.trim()) list = list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "revenue")   list = [...list].sort((a, b) => b.revenue - a.revenue);
    if (sortBy === "occupancy") list = [...list].sort((a, b) => b.occPct - a.occPct);
    if (sortBy === "name")      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [enriched, search, statusFilter, sortBy]);

  const selected   = enriched.find(p => p.id === selectedProp) ?? null;
  const rooms      = selected ? (PROPERTY_ROOMS[selected.id] ?? []) : [];
  const amenities  = selected ? (PROPERTY_AMENITIES[selected.id] ?? []) : [];
  const rules      = selected ? (PROPERTY_RULES[selected.id] ?? []) : [];
  const visRooms   = roomFilter === "all" ? rooms : rooms.filter(r => r.status === roomFilter);
  const floorNums  = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

  const totalRevenue = enriched.reduce((s, p) => s + p.revenue, 0);
  const totalBeds    = enriched.reduce((s, p) => s + p.totalBeds, 0);
  const totalOcc     = enriched.reduce((s, p) => s + p.occupied, 0);
  const totalVacant  = totalBeds - totalOcc;
  const overallOcc   = Math.round((totalOcc / totalBeds) * 100);
  const totalExp     = enriched.reduce((s, p) => s + p.totalExp, 0);

  const statusStyle: Record<PropStatus, { pill: string; dot: string; label: string }> = {
    active:     { pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",   dot: "bg-emerald-500",  label: "Active"      },
    inactive:   { pill: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",        dot: "bg-slate-400",    label: "Inactive"    },
    renovation: { pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",         dot: "bg-amber-400",    label: "Renovation"  },
  };
  const roomStatusStyle: Record<RoomStatus, string> = {
    occupied: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    vacant:   "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    reserved: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };

  const DETAIL_TABS: { id: DetailTab; label: string; icon: React.ReactElement }[] = [
    { id:"overview",     label:"Overview",     icon:<LayoutGrid  size={13} strokeWidth={1.75} /> },
    { id:"rooms",        label:"Rooms",        icon:<Home        size={13} strokeWidth={1.75} /> },
    { id:"tenants",      label:"Tenants",      icon:<Users       size={13} strokeWidth={1.75} /> },
    { id:"finances",     label:"Finances",     icon:<IndianRupee size={13} strokeWidth={1.75} /> },
    { id:"maintenance",  label:"Maintenance",  icon:<Wrench      size={13} strokeWidth={1.75} /> },
    { id:"settings",     label:"Settings",     icon:<BarChart3   size={13} strokeWidth={1.75} /> },
  ];

  return (
    <div className="space-y-6">

      {/* ── Modals ── */}
      {showAddModal && <AddPropertyModal onClose={() => setShowAddModal(false)} />}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <Trash2 size={18} strokeWidth={2} className="text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">Remove Property?</p>
              <p className="text-xs text-slate-500 mt-1">This will archive all tenant and payment records. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg py-2 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      {showRentModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Update Rent — {selected.name}</h3>
              <button onClick={() => setShowRentModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-[11px] text-slate-500">Set new base rent. Room-level overrides can be set individually.</p>
              {(PROPERTY_ROOMS[selected.id] ?? []).slice(0, 4).map(r => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-700 w-16">Room {r.number}</span>
                  <input type="number" defaultValue={r.rent} className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-violet-400 transition" />
                </div>
              ))}
              <p className="text-[10px] text-slate-400">+ {Math.max(0, (PROPERTY_ROOMS[selected.id]?.length ?? 0) - 4)} more rooms</p>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <button onClick={() => setShowRentModal(false)} className="flex-1 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg py-2 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => setShowRentModal(false)} className="flex-1 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showBulkReminder && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Send Rent Reminder</h3>
              <button onClick={() => setShowBulkReminder(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-slate-600">Send reminder via WhatsApp to all tenants with pending/overdue rent at <span className="font-semibold">{selected.name}</span>.</p>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-800">Pending: {fmtK(selected.pendingAmt)}</p>
                <p className="text-[11px] text-amber-600 mt-0.5">{selected.tenants.filter(t => !t.paid).length} tenant(s) haven&apos;t paid this month</p>
              </div>
              <div className="space-y-2">
                {selected.tenants.filter(t => !t.paid).map(ten => (
                  <label key={ten.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-violet-600 w-3 h-3 rounded" />
                    <Avatar initials={ten.initials} />
                    <span className="font-medium">{ten.name}</span>
                    <span className="text-slate-400">· Room {ten.room}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <button onClick={() => setShowBulkReminder(false)} className="flex-1 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg py-2 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => setShowBulkReminder(false)} className="flex-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 flex items-center justify-center gap-1.5 transition-colors">
                <Phone size={11} strokeWidth={2} />
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      {!selected && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Properties</h2>
              <p className="text-sm text-slate-500 mt-0.5">{enriched.length} properties · {totalBeds} beds · {totalVacant} vacant</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-1.5 transition-colors">
                <Download size={11} strokeWidth={2} />
                Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors">
                <Plus size={11} strokeWidth={2.5} />
                Add Property
              </button>
            </div>
          </div>

          {/* ── KPI strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Total Properties", value:String(enriched.length), sub:`${enriched.filter(p => p.propStatus === "active").length} active`,             icon:"🏠", color:"text-violet-700",  bg:"bg-violet-50"  },
              { label:"Bed Occupancy",    value:`${overallOcc}%`,         sub:`${totalOcc} occupied · ${totalVacant} vacant`,                                  icon:"🛏",  color:"text-emerald-700", bg:"bg-emerald-50" },
              { label:"Monthly Revenue",  value:fmtK(totalRevenue),       sub:`Net after expenses: ${fmtK(totalRevenue - totalExp)}`,                         icon:"₹",  color:"text-indigo-700",  bg:"bg-indigo-50"  },
              { label:"Pending Rent",     value:fmtK(enriched.reduce((s,p)=>s+p.pendingAmt,0)), sub:`${enriched.reduce((s,p)=>s+p.tenants.filter(t=>!t.paid).length,0)} tenants unpaid`, icon:"⏳", color:"text-amber-700",  bg:"bg-amber-50"   },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center text-sm mb-3`}>{kpi.icon}</div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Filters + View toggle ── */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-52">
              <Search size={12} strokeWidth={2} className="text-slate-400 shrink-0" />
              <input className="bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400 text-xs" placeholder="Search properties…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {(["all","active","inactive","renovation"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize whitespace-nowrap transition-all ${statusFilter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-slate-600 outline-none focus:border-violet-400 transition cursor-pointer">
                <option value="revenue">Sort: Revenue</option>
                <option value="occupancy">Sort: Occupancy</option>
                <option value="name">Sort: Name</option>
              </select>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                {(["grid","list"] as const).map(v => (
                  <button key={v} onClick={() => setViewMode(v)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${viewMode === v ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"}`}>
                    {v === "grid"
                      ? <LayoutGrid size={12} strokeWidth={1.75} />
                      : <List size={12} strokeWidth={1.75} />
                    }
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Property cards — grid ── */}
          {viewMode === "grid" && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(p => {
                const ss = statusStyle[p.propStatus];
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
                    <div className="p-5">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{p.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin size={9} strokeWidth={2} />
                            {p.address}
                          </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 flex items-center gap-1 ${ss.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                          {ss.label}
                        </span>
                      </div>
                      {/* Occupancy */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-slate-500 font-medium">Occupancy</span>
                          <span className="font-bold text-slate-700">{p.occupied}/{p.totalBeds} beds</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-violet-500" style={{ width:`${p.occPct}%` }} />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                          <span className="font-semibold text-violet-600">{p.occPct}% filled</span>
                          <span>{p.vacant} vacant</span>
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs font-bold text-indigo-700">{fmtK(p.revenue)}</p>
                          <p className="text-[10px] text-indigo-400 mt-0.5">Revenue</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs font-bold text-slate-900">{p.tenants.length}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tenants</p>
                        </div>
                        <div className={`rounded-lg p-2.5 text-center ${p.openMaint > 0 ? "bg-rose-50" : "bg-slate-50"}`}>
                          <p className={`text-xs font-bold ${p.openMaint > 0 ? "text-rose-600" : "text-slate-900"}`}>{p.openMaint}</p>
                          <p className={`text-[10px] mt-0.5 ${p.openMaint > 0 ? "text-rose-400" : "text-slate-400"}`}>Tickets</p>
                        </div>
                      </div>
                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(PROPERTY_AMENITIES[p.id] ?? []).slice(0,4).map(a => (
                          <span key={a} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{a}</span>
                        ))}
                        {(PROPERTY_AMENITIES[p.id]?.length ?? 0) > 4 &&
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 font-medium">+{(PROPERTY_AMENITIES[p.id]?.length ?? 0) - 4}</span>}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setSelectedProp(p.id); setDetailTab("overview"); }}
                          className="flex-1 text-xs font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg py-2 transition-colors">
                          Manage
                        </button>
                        <button
                          onClick={() => { setSelectedProp(p.id); setDetailTab("tenants"); setShowBulkReminder(true); }}
                          title="Send reminder"
                          className="w-8 h-8 flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                          <Bell size={12} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(p.id)}
                          title="Remove"
                          className="w-8 h-8 flex items-center justify-center text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 rounded-lg transition-colors">
                          <Trash2 size={12} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Add property placeholder */}
              <button onClick={() => setShowAddModal(true)}
                className="bg-white border-2 border-dashed border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/30 transition-all flex flex-col items-center justify-center gap-3 py-12 group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                  <Plus size={18} strokeWidth={2} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-violet-600 transition-colors">Add New Property</span>
              </button>
            </div>
          )}

          {/* ── Property list — table ── */}
          {viewMode === "list" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-semibold">Property</th>
                    <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">Status</th>
                    <th className="text-right px-3 py-3 font-semibold hidden md:table-cell">Occupancy</th>
                    <th className="text-right px-3 py-3 font-semibold">Revenue</th>
                    <th className="text-right px-3 py-3 font-semibold hidden lg:table-cell">Expenses</th>
                    <th className="text-right px-3 py-3 font-semibold hidden lg:table-cell">Tickets</th>
                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const ss = statusStyle[p.propStatus];
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${i < filtered.length - 1 ? "border-b border-slate-100" : ""}`}>
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-bold text-slate-900">{p.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{p.address}</p>
                        </td>
                        <td className="px-3 py-3.5 hidden sm:table-cell">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit ${ss.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />{ss.label}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 hidden md:table-cell">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-violet-500" style={{ width:`${p.occPct}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 w-8 text-right">{p.occPct}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right text-xs font-bold text-indigo-700">{fmtK(p.revenue)}</td>
                        <td className="px-3 py-3.5 text-right text-xs text-rose-500 font-semibold hidden lg:table-cell">{fmtK(p.totalExp)}</td>
                        <td className="px-3 py-3.5 text-right hidden lg:table-cell">
                          {p.openMaint > 0 ? <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{p.openMaint} open</span> : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => { setSelectedProp(p.id); setDetailTab("overview"); }}
                            className="text-xs font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-3 py-1.5 transition-colors">
                            Manage →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Property Detail ── */}
      {selected && (
        <div className="space-y-5">

          {/* Breadcrumb + header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setSelectedProp(null)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 border border-slate-200 bg-white rounded-lg px-3 py-1.5 transition-colors font-medium shrink-0">
                <ChevronLeft size={12} strokeWidth={2} />
                Properties
              </button>
              <ChevronRight size={12} strokeWidth={2} className="text-slate-300" />
              <div>
                <span className="text-sm font-bold text-slate-900">{selected.name}</span>
                <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                  {statusStyle[selected.propStatus].label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowBulkReminder(true)} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-1.5 transition-colors">
                <Bell size={11} strokeWidth={2} />
                Remind Tenants
              </button>
              <button onClick={() => setShowRentModal(true)} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-1.5 transition-colors">
                <IndianRupee size={11} strokeWidth={2} />
                Edit Rent
              </button>
              <select
                value={selected.propStatus}
                onChange={e => setPropStatuses(prev => ({ ...prev, [selected.id]: e.target.value as PropStatus }))}
                className="text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-violet-400 transition cursor-pointer font-medium">
                {PROP_STATUSES.map(s => <option key={s} value={s}>{statusStyle[s].label}</option>)}
              </select>
              <button onClick={() => setShowDeleteConfirm(selected.id)}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg px-3 py-1.5 transition-colors">
                <Trash2 size={11} strokeWidth={2} />
                Remove
              </button>
            </div>
          </div>

          {/* Address + meta strip */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={10} strokeWidth={2} />{selected.address}</span>
            <span className="flex items-center gap-1"><Home size={10} strokeWidth={2} />{rooms.length} rooms</span>
            <span className="flex items-center gap-1"><Users size={10} strokeWidth={2} />{selected.tenants.length} tenants</span>
            {selected.openMaint > 0 && <span className="flex items-center gap-1 text-rose-500 font-semibold"><AlertCircle size={10} strokeWidth={2} />{selected.openMaint} open tickets</span>}
          </div>

          {/* ── Tab bar ── */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto no-scrollbar">
            {DETAIL_TABS.map(tab => (
              <button key={tab.id} onClick={() => setDetailTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${detailTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <span className={detailTab === tab.id ? "text-violet-600" : "text-slate-400"}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ══ TAB: OVERVIEW ══ */}
          {detailTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Monthly Revenue",  value:fmtK(selected.revenue),       color:"text-indigo-700",  bg:"bg-indigo-50"  },
                  { label:"Net Revenue",       value:fmtK(selected.netRevenue),    color:"text-emerald-700", bg:"bg-emerald-50" },
                  { label:"Rent / Bed",        value:fmtINR(selected.rent,locale), color:"text-slate-700",   bg:"bg-slate-100"  },
                  { label:"Maint. Cost",       value:fmtK(selected.maintCost),     color:selected.maintCost > 3000 ? "text-rose-600" : "text-slate-700", bg:selected.maintCost > 3000 ? "bg-rose-50" : "bg-slate-100" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={`w-6 h-6 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
                      <IndianRupee size={11} strokeWidth={2} className={k.color} />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
                    <p className={`text-lg font-bold mt-1 ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
              {/* Occupancy + collection */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900">Bed Status</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label:"Occupied", count:selected.occupied, color:"bg-violet-500", text:"text-violet-700" },
                      { label:"Vacant",   count:selected.vacant,   color:"bg-slate-300",  text:"text-slate-600" },
                      { label:"Reserved", count:(PROPERTY_ROOMS[selected.id]??[]).filter(r=>r.status==="reserved").length, color:"bg-amber-400", text:"text-amber-700" },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center">
                        <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-1.5`} />
                        <p className={`text-lg font-bold ${s.text}`}>{s.count}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="h-full bg-violet-500 transition-all" style={{ width:`${selected.occPct}%` }} />
                    <div className="h-full bg-amber-300 transition-all" style={{ width:`${Math.round(((PROPERTY_ROOMS[selected.id]??[]).filter(r=>r.status==="reserved").length/selected.totalBeds)*100)}%` }} />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900">Collection Status</h4>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#f1f5f9" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" strokeWidth="8"
                          strokeDasharray={`${(selected.collectedAmt/(selected.collectedAmt+selected.pendingAmt||1))*188.4} 188.4`}
                          strokeLinecap="round" transform="rotate(-90 40 40)"/>
                        <text x="40" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e1b4b">
                          {Math.round((selected.collectedAmt/(selected.collectedAmt+selected.pendingAmt||1))*100)}%
                        </text>
                        <text x="40" y="49" textAnchor="middle" fontSize="8" fill="#94a3b8">collected</text>
                      </svg>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Collected</span><span className="font-bold text-emerald-700">{fmtK(selected.collectedAmt)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Pending</span><span className="font-bold text-amber-600">{fmtK(selected.pendingAmt)}</span></div>
                      <div className="flex justify-between text-xs border-t border-slate-100 pt-2 mt-2"><span className="font-medium text-slate-700">Total Due</span><span className="font-bold text-slate-900">{fmtK(selected.collectedAmt + selected.pendingAmt)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label:"Add Tenant",     icon:"👤", onClick:() => setDetailTab("tenants"),     style:"border border-slate-200 hover:border-violet-300 hover:bg-violet-50"   },
                    { label:"Add Room",       icon:"🛏",  onClick:() => setDetailTab("rooms"),       style:"border border-slate-200 hover:border-violet-300 hover:bg-violet-50"   },
                    { label:"Log Expense",    icon:"💸", onClick:() => setDetailTab("finances"),    style:"border border-slate-200 hover:border-violet-300 hover:bg-violet-50"   },
                    { label:"Report Issue",   icon:"🔧", onClick:() => setDetailTab("maintenance"), style:"border border-slate-200 hover:border-violet-300 hover:bg-violet-50"   },
                    { label:"Send Reminder",  icon:"📲", onClick:() => setShowBulkReminder(true),  style:"border border-slate-200 hover:border-violet-300 hover:bg-violet-50"   },
                    { label:"Edit Rent",      icon:"₹",  onClick:() => setShowRentModal(true),     style:"border border-slate-200 hover:border-violet-300 hover:bg-violet-50"   },
                    { label:"View Finances",  icon:"📊", onClick:() => setDetailTab("finances"),   style:"border border-slate-200 hover:border-violet-300 hover:bg-violet-50"   },
                    { label:"Settings",       icon:"⚙",  onClick:() => setDetailTab("settings"),   style:"border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700" },
                  ].map(a => (
                    <button key={a.label} onClick={a.onClick}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 transition-colors ${a.style}`}>
                      <span>{a.icon}</span>{a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: ROOMS ══ */}
          {detailTab === "rooms" && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">All Rooms ({rooms.length})</h4>
                  <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded font-semibold">{selected.occupied} occupied</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-semibold">{selected.vacant} vacant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                    {(["all","occupied","vacant","reserved"] as const).map(f => (
                      <button key={f} onClick={() => setRoomFilter(f)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize whitespace-nowrap transition-all ${roomFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-3 py-1.5 transition-colors">
                    <Plus size={10} strokeWidth={2.5} />
                    Add Room
                  </button>
                </div>
              </div>
              {floorNums.map(floor => {
                const floorRooms = visRooms.filter(r => r.floor === floor);
                if (floorRooms.length === 0) return null;
                return (
                  <div key={floor}>
                    <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Floor {floor}</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {floorRooms.map(room => (
                        <div key={room.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${room.status === "occupied" ? "bg-violet-100 text-violet-700" : room.status === "reserved" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                            {room.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-800">Room {room.number}</span>
                              <span className="text-[10px] text-slate-400">{room.type}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roomStatusStyle[room.status]}`}>{room.status}</span>
                            </div>
                            {room.tenant
                              ? <p className="text-[11px] text-slate-500 mt-0.5">{room.tenant} · Lease ends {room.leaseEnd}</p>
                              : <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{room.status === "vacant" ? "Available — ready to rent" : "Reserved — pending onboard"}</p>
                            }
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-slate-800">{fmtINR(room.rent, locale)}<span className="text-slate-400 font-normal">/mo</span></p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Dep: {fmtK(room.deposit)}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors">
                              <Pencil size={11} strokeWidth={2} />
                            </button>
                            {room.status === "vacant" && (
                              <button className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors whitespace-nowrap">
                                Assign
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ TAB: TENANTS ══ */}
          {detailTab === "tenants" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">{selected.tenants.length} Tenants</h4>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowBulkReminder(true)} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-1.5 transition-colors">Send Reminder</button>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-3 py-1.5 transition-colors">
                    <Plus size={10} strokeWidth={2.5} />
                    Add Tenant
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
                      <th className="text-left px-5 py-3 font-semibold">Tenant</th>
                      <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">Room</th>
                      <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">Lease End</th>
                      <th className="text-center px-3 py-3 font-semibold hidden sm:table-cell">Pay History</th>
                      <th className="text-right px-3 py-3 font-semibold">Status</th>
                      <th className="text-right px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.tenants.map((ten, i) => (
                      <tr key={ten.id} className={`hover:bg-slate-50 transition-colors ${i < selected.tenants.length - 1 ? "border-b border-slate-100" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={ten.initials} />
                            <div>
                              <p className="text-xs font-semibold text-slate-800">{ten.name}</p>
                              <RiskBadge risk={ten.risk} label={ten.risk === "late" ? "Late payer" : "Expiring soon"} />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-slate-500 hidden sm:table-cell">Room {ten.room}</td>
                        <td className="px-3 py-3.5 hidden md:table-cell">
                          <p className="text-xs text-slate-700">{ten.leaseEnd}</p>
                          {ten.risk === "expiring" && <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Renew soon</p>}
                        </td>
                        <td className="px-3 py-3.5 hidden sm:table-cell"><div className="flex justify-center"><PayDots history={ten.payHistory} /></div></td>
                        <td className="px-3 py-3.5 text-right"><StatusPill status={ten.paid ? "paid" : "pending"} label={ten.paid ? "Paid" : "Pending"} /></td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            {!ten.paid && <button className="text-[10px] font-semibold text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-lg px-2 py-1 transition-colors whitespace-nowrap">Remind</button>}
                            <button className="text-[10px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ TAB: FINANCES ══ */}
          {detailTab === "finances" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Gross Revenue",  value:fmtK(selected.revenue),     color:"text-indigo-700",  bg:"bg-indigo-50",  sub:"rent collected + pending" },
                  { label:"Total Expenses", value:fmtK(selected.totalExp),    color:"text-rose-600",    bg:"bg-rose-50",    sub:"utilities + staff + maint" },
                  { label:"Net Profit",     value:fmtK(selected.netRevenue),  color:"text-emerald-700", bg:"bg-emerald-50", sub:"after all expenses" },
                  { label:"Yield / Bed",    value:fmtINR(Math.round(selected.netRevenue / selected.occupied), locale), color:"text-violet-700", bg:"bg-violet-50", sub:`across ${selected.occupied} occupied beds` },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={`w-7 h-7 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
                      <IndianRupee size={12} strokeWidth={2} className={k.color} />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
                    <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{k.sub}</p>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Expense breakdown */}
                <div className="bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900">Expense Breakdown</h4>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-2.5 py-1 transition-colors">
                      <Plus size={9} strokeWidth={2.5} />
                      Log Expense
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(selected.expenses).map((exp, i) => {
                      const categoryColor: Record<string, string> = { Utilities:"bg-sky-100 text-sky-700", Staff:"bg-violet-100 text-violet-700", Maintenance:"bg-amber-100 text-amber-700", Equipment:"bg-slate-100 text-slate-600" };
                      return (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800">{exp.label}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${categoryColor[exp.category] ?? "bg-slate-100 text-slate-500"}`}>{exp.category}</span>
                          </div>
                          <p className={`text-xs font-bold shrink-0 ${exp.amount > 0 ? "text-rose-600" : "text-emerald-600"}`}>{exp.amount > 0 ? `−${fmtINR(exp.amount, locale)}` : "Free"}</p>
                          <button className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-rose-400 transition-colors shrink-0">
                            <Trash2 size={11} strokeWidth={2} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 flex justify-between">
                    <span className="text-xs font-semibold text-slate-700">Total Expenses</span>
                    <span className="text-xs font-bold text-rose-600">−{fmtK(selected.totalExp)}</span>
                  </div>
                </div>
                {/* Rent collection per tenant */}
                <div className="bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900">Rent Collection — April</h4>
                    <button className="text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-lg px-2.5 py-1 transition-colors">Export</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {selected.tenants.map(ten => {
                      const txList = TRANSACTIONS.filter(tx => tx.property === selected.name && tx.tenant === ten.name);
                      const tx = txList[0];
                      return (
                        <div key={ten.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                          <Avatar initials={ten.initials} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800">{ten.name}</p>
                            <p className="text-[11px] text-slate-400">Room {ten.room}</p>
                          </div>
                          <p className="text-xs font-bold text-slate-900 shrink-0">{tx ? fmtINR(tx.amount, locale) : fmtINR(selected.rent, locale)}</p>
                          <StatusPill status={ten.paid ? "paid" : "pending"} label={ten.paid ? "Paid" : "Due"} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 flex justify-between">
                    <span className="text-xs font-semibold text-slate-700">Collected / Total</span>
                    <span className="text-xs font-bold text-emerald-700">{fmtK(selected.collectedAmt)} / {fmtK(selected.collectedAmt + selected.pendingAmt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: MAINTENANCE ══ */}
          {detailTab === "maintenance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">Maintenance Tickets</h4>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selected.openMaint > 0 ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>{selected.openMaint} open</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-3 py-1.5 transition-colors">
                  <Plus size={10} strokeWidth={2.5} />
                  Report Issue
                </button>
              </div>
              {selected.maint.length === 0
                ? <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={18} strokeWidth={2} className="text-emerald-500" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">No maintenance issues</p>
                    <p className="text-[11px] text-slate-400 mt-1">This property is all clear.</p>
                  </div>
                : <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                    {selected.maint.map(m => (
                      <div key={m.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${m.status === "resolved" ? "opacity-60" : ""}`}>
                        <div className={`w-1.5 h-10 rounded-full shrink-0 ${m.priority === "high" ? "bg-rose-400" : m.priority === "medium" ? "bg-amber-400" : "bg-slate-300"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-semibold text-slate-800">{m.title}</p>
                            {m.status === "resolved" && <span className="text-[10px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-1.5 py-0.5 rounded font-semibold">Resolved</span>}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span>Room {m.room}</span><span>·</span><span>{m.category}</span><span>·</span><span>{m.age}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <PriorityPill priority={m.priority} label={m.priority} />
                          <p className="text-xs font-bold text-slate-700 mt-1.5">{m.cost > 0 ? fmtINR(m.cost, locale) : "Free"}</p>
                        </div>
                        {m.status === "open" && (
                          <button className="text-[10px] font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-2.5 py-1.5 transition-colors shrink-0">Assign</button>
                        )}
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ══ TAB: SETTINGS ══ */}
          {detailTab === "settings" && (
            <div className="space-y-4">
              {/* Property info */}
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900">Property Info</h4>
                  <button className="text-xs font-medium text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-3 py-1.5 transition-colors">Save Changes</button>
                </div>
                <div className="p-5 grid sm:grid-cols-2 gap-4">
                  {[
                    { label:"Property Name",   defaultValue:selected.name    },
                    { label:"Address",          defaultValue:selected.address },
                    { label:"Base Rent / Bed",  defaultValue:String(selected.rent) },
                    { label:"Security Deposit", defaultValue:"2 months"       },
                    { label:"Contact Number",   defaultValue:"+91 98765 43210" },
                    { label:"Property Manager", defaultValue:"Not assigned"   },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="text-xs font-medium text-slate-600 block mb-1.5">{field.label}</label>
                      <input defaultValue={field.defaultValue} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 transition" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Amenities */}
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900">Amenities</h4>
                  <button onClick={() => {}} className="text-xs font-medium text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-3 py-1.5 transition-colors">Edit</button>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {amenities.map(a => (
                      <span key={a} className="flex items-center gap-1.5 text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-lg font-medium">
                        {a}
                        <button className="text-violet-400 hover:text-rose-500 transition-colors">
                          <X size={9} strokeWidth={2} />
                        </button>
                      </span>
                    ))}
                    <button className="text-xs font-medium text-slate-500 border border-dashed border-slate-300 px-2.5 py-1 rounded-lg hover:border-violet-400 hover:text-violet-600 transition-colors">+ Add</button>
                  </div>
                </div>
              </div>
              {/* House rules */}
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900">House Rules</h4>
                  <button onClick={() => setShowRuleEdit(!showRuleEdit)} className="text-xs font-medium text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg px-3 py-1.5 transition-colors">
                    {showRuleEdit ? "Done" : "Edit"}
                  </button>
                </div>
                <div className="p-5 space-y-2">
                  {showRuleEdit
                    ? <textarea defaultValue={rules.join("\n")} rows={rules.length + 1} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 resize-none transition" />
                    : rules.map((rule, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">{i+1}</span>
                          {rule}
                        </div>
                      ))
                  }
                </div>
              </div>
              {/* Danger zone */}
              <div className="bg-white rounded-xl border border-rose-200">
                <div className="px-5 py-4 border-b border-rose-100">
                  <h4 className="text-sm font-semibold text-rose-700">Danger Zone</h4>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label:"Mark as Inactive",   desc:"Stop accepting new tenants. Existing tenants unaffected.",    btn:"Deactivate", style:"border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" },
                    { label:"Mark as Renovation",  desc:"Put property in maintenance mode. No new bookings.",          btn:"Set Renovation", style:"border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" },
                    { label:"Archive Property",    desc:"Permanently archive. All data retained but no new activity.", btn:"Archive", style:"border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" },
                  ].map(action => (
                    <div key={action.label} className="flex items-center justify-between gap-4 p-3 border border-slate-100 rounded-lg">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{action.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{action.desc}</p>
                      </div>
                      <button className={`text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${action.style}`}>{action.btn}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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
  const insights = useMemo(() => {
    const period = dateRange === "7d" ? "last 7 days" : dateRange === "30d" ? "this month" : "last 3 months";
    return [
      {
        priority: 0, type: "negative", icon: "⚠", isCritical: true,
        title: t("insights.overdue_title", { n: 2 }),
        desc:  `${t("insights.overdue_desc")} (${period})`,
        cta:   t("insights.cta.reminders"),
        navTarget: "payments" as const,
      },
      {
        priority: 1, type: "negative", icon: "🔧", isCritical: true,
        title: t("insights.maint_title"),
        desc:  t("insights.maint_desc", { cost: (TOTAL_MAINT / 1000).toFixed(1) }),
        cta:   t("insights.cta.assign"),
        navTarget: "maintenance" as const,
      },
      {
        priority: 2, type: "warning", icon: "📋", isCritical: false,
        title: t("insights.lease_title"),
        desc:  t("insights.lease_desc"),
        cta:   t("insights.cta.renew"),
        navTarget: "tenants" as const,
      },
      {
        priority: 3, type: REV_CHANGE >= 0 ? "positive" : "negative", icon: REV_CHANGE >= 0 ? "↑" : "↓", isCritical: false,
        title: t(REV_CHANGE >= 0 ? "insights.revenue_up" : "insights.revenue_down", { pct: Math.abs(REV_CHANGE) }),
        desc:  t("insights.revenue_desc", { curr: Math.round(CURR_REV / 1000), prev: Math.round(PREV_REV / 1000) }),
        navTarget: null,
      },
      {
        priority: 4, type: OCC_CHANGE >= 0 ? "positive" : "negative", icon: OCC_CHANGE >= 0 ? "↑" : "↓", isCritical: false,
        title: t(OCC_CHANGE >= 0 ? "insights.occ_up" : "insights.occ_down", { n: Math.abs(OCC_CHANGE) }),
        desc:  t("insights.occ_desc", { curr: OCC_PCT, prev: PREV_OCC_PCT, vacant: TOTAL_BEDS - TOTAL_OCC }),
        navTarget: null,
      },
    ];
  }, [locale, dateRange]);

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
            <Home size={12} strokeWidth={2} color="white" />
          </div>
          <span className="font-extrabold text-sm text-slate-900">ShiftProof</span>
          <span className="ml-auto text-[10px] bg-violet-50 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded font-semibold shrink-0">{t("nav.owner_badge")}</span>
        </div>

        <div className="px-4 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{t("nav.menu")}</p>
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
            <ChevronLeft size={13} strokeWidth={2} />
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
            <Menu size={19} strokeWidth={1.75} />
          </button>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate capitalize">{activeNav === "overview" ? t("greeting.text").replace(" 👋","") : t(`nav.${activeNav}`)}</p>
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
            <div className="flex items-center gap-1.5">
              <Globe size={13} strokeWidth={1.75} className="text-slate-400 shrink-0" />
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                {(["en","hi","mr"] as Locale[]).map(l => (
                  <button key={l} onClick={() => setLocale(l)}
                    title={l === "en" ? "English" : l === "hi" ? "हिन्दी" : "मराठी"}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${locale === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                    {l === "en" ? "EN" : l === "hi" ? "हि" : "म"}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-36 focus-within:ring-2 focus-within:ring-violet-400 focus-within:bg-white transition-colors">
              <Search size={12} strokeWidth={2} className="text-slate-400 shrink-0" />
              <input
                className="bg-transparent outline-none text-xs text-slate-700 placeholder-slate-400 w-full"
                placeholder={t("topbar.search")}
                onKeyDown={e => {
                  const q = (e.target as HTMLInputElement).value.toLowerCase();
                  if (e.key === "Enter" && q) {
                    const match = ["overview","properties","tenants","payments","maintenance","reports"].find(n => n.includes(q));
                    if (match) { setActiveNav(match); (e.target as HTMLInputElement).value = ""; }
                  }
                }}
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 transition-colors">
                <Bell size={14} strokeWidth={1.75} />
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
                  <button onClick={() => setNotifOpen(false)} className="w-full text-xs text-violet-600 py-2.5 hover:bg-slate-50 transition-colors font-medium">{t("topbar.view_all_alerts")}</button>
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium">
              <Download size={12} strokeWidth={2} />
              {t("topbar.export")}
            </button>

            <button
              onClick={() => setActiveNav("properties")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors">
              <Plus size={12} strokeWidth={2.5} />
              {t("topbar.add_property")}
            </button>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto px-5 py-8">

          {/* ── Properties page ── */}
          {activeNav === "properties" && (
            <PropertiesSection locale={locale} t={t} />
          )}

          {/* ── Tenants page ── */}
          {activeNav === "tenants" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tenants</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{TENANTS.length} tenants across {PROPERTIES.length} properties</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors">
                  <Plus size={11} strokeWidth={2.5} />
                  Add Tenant
                </button>
              </div>
              {/* KPI strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Tenants",   value: String(TENANTS.length),                                                       color: "text-violet-700",  bg: "bg-violet-50",  icon: "👥" },
                  { label: "Paying on Time",  value: String(TENANTS.filter(t => t.paid).length),                                   color: "text-emerald-700", bg: "bg-emerald-50", icon: "✅" },
                  { label: "At Risk",         value: String(TENANTS.filter(t => t.risk === "late").length),                        color: "text-rose-700",    bg: "bg-rose-50",    icon: "⚠" },
                  { label: "Lease Expiring",  value: String(TENANTS.filter(t => t.risk === "expiring").length),                    color: "text-amber-700",   bg: "bg-amber-50",   icon: "📋" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={`w-7 h-7 rounded-lg ${k.bg} flex items-center justify-center text-sm mb-3`}>{k.icon}</div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
                    <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
              {/* Full tenants table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">All Tenants</h3>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-1.5 transition-colors">
                    <Download size={11} strokeWidth={2} />
                    Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
                        <th className="text-left px-5 py-3 font-semibold">Tenant</th>
                        <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">Property · Room</th>
                        <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">Lease End</th>
                        <th className="text-center px-3 py-3 font-semibold hidden sm:table-cell">Pay History</th>
                        <th className="text-right px-3 py-3 font-semibold">Risk</th>
                        <th className="text-right px-5 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TENANTS.map((ten, i) => (
                        <tr key={ten.id} className={`hover:bg-slate-50 transition-colors ${i < TENANTS.length - 1 ? "border-b border-slate-100" : ""}`}>
                          <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><Avatar initials={ten.initials} /><p className="text-xs font-semibold text-slate-800">{ten.name}</p></div></td>
                          <td className="px-3 py-3.5 text-xs text-slate-500 hidden sm:table-cell">{ten.property} · {ten.room}</td>
                          <td className="px-3 py-3.5 text-xs text-slate-500 hidden md:table-cell">
                            <p>{ten.leaseEnd}</p>
                            {ten.risk === "expiring" && <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Renew soon</p>}
                          </td>
                          <td className="px-3 py-3.5 hidden sm:table-cell"><div className="flex justify-center"><PayDots history={ten.payHistory} /></div></td>
                          <td className="px-3 py-3.5 text-right"><RiskBadge risk={ten.risk} label={ten.risk === "late" ? "Late payer" : "Expiring soon"} /></td>
                          <td className="px-5 py-3.5 text-right"><StatusPill status={ten.paid ? "paid" : "pending"} label={ten.paid ? "Paid" : "Pending"} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Payments page ── */}
          {activeNav === "payments" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Payments</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Rent collection for {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                  <Download size={11} strokeWidth={2} />
                  Export
                </button>
              </div>
              {/* KPI strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Due",    value: fmtK(TOTAL_DUE),                   color: "text-slate-700",   bg: "bg-slate-100",  icon: "₹" },
                  { label: "Collected",    value: fmtK(COLLECTED),                   color: "text-emerald-700", bg: "bg-emerald-50", icon: "✅" },
                  { label: "Pending",      value: fmtK(PENDING_AMT),                 color: "text-amber-700",   bg: "bg-amber-50",   icon: "⏳" },
                  { label: "Overdue",      value: fmtK(OVERDUE_AMT),                 color: "text-rose-700",    bg: "bg-rose-50",    icon: "⚠" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={`w-7 h-7 rounded-lg ${k.bg} flex items-center justify-center text-sm mb-3`}>{k.icon}</div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
                    <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
              {/* Transactions table */}
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Transactions</h3>
                  <div className="flex items-center gap-2">
                    {selectedTx.size > 0 && (
                      <button className="text-xs text-violet-600 font-semibold border border-violet-200 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors whitespace-nowrap">
                        Send reminder ({selectedTx.size})
                      </button>
                    )}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                      {(["all","paid","pending","overdue"] as TxFilter[]).map(f => (
                        <button key={f} onClick={() => setTxFilter(f)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize whitespace-nowrap transition-all ${txFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                          {f}
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
                        <th className="text-left px-2 py-3 font-semibold">Tenant</th>
                        <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">Property · Room</th>
                        <th className="text-right px-3 py-3 font-semibold">Amount</th>
                        <th className="text-right px-3 py-3 font-semibold hidden sm:table-cell">Date</th>
                        <th className="text-right px-3 py-3 font-semibold hidden md:table-cell">Overdue</th>
                        <th className="text-right px-5 py-3 font-semibold">Status</th>
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
                            {tx.daysOverdue > 0 ? <span className="text-rose-600 font-semibold">{tx.daysOverdue}d overdue</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-5 py-3.5 text-right"><StatusPill status={tx.status} label={tx.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Maintenance page ── */}
          {activeNav === "maintenance" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Maintenance</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{openTickets.length} open · {resolvedTickets.length} resolved</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors">
                  <Plus size={11} strokeWidth={2.5} />
                  Log Issue
                </button>
              </div>
              {/* KPI strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Open Tickets",   value: String(openTickets.length),      color: "text-rose-700",    bg: "bg-rose-50",    icon: "🔧" },
                  { label: "Resolved",       value: String(resolvedTickets.length),   color: "text-emerald-700", bg: "bg-emerald-50", icon: "✅" },
                  { label: "Avg Resolution", value: "3.2 days",                       color: "text-amber-700",   bg: "bg-amber-50",   icon: "⏱" },
                  { label: "Total Cost",     value: fmtK(TOTAL_MAINT),               color: "text-slate-700",   bg: "bg-slate-100",  icon: "₹" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={`w-7 h-7 rounded-lg ${k.bg} flex items-center justify-center text-sm mb-3`}>{k.icon}</div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
                    <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
              {/* Tickets list */}
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Tickets</h3>
                  <button onClick={() => setShowResolvedM(!showResolvedM)}
                    className="text-xs text-slate-500 hover:text-violet-600 font-medium transition-colors">
                    {showResolvedM ? "Hide resolved" : `Show resolved (${resolvedTickets.length})`}
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {visibleMaint.map(m => (
                    <div key={m.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${m.status === "resolved" ? "opacity-60" : ""}`}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${m.priority === "high" ? "bg-rose-500" : m.priority === "medium" ? "bg-amber-400" : "bg-slate-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{m.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{m.property} · Room {m.room} · {m.category}</p>
                      </div>
                      <PriorityPill priority={m.priority} label={m.priority} />
                      <span className="text-[11px] text-slate-400 shrink-0">{m.age}</span>
                      {m.cost > 0 && <span className="text-[11px] font-semibold text-slate-600 shrink-0">{fmtK(m.cost)}</span>}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${m.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>{m.status}</span>
                      {m.status === "open" && (
                        <button className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">Assign</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Category breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Issues by Category</h3>
                <div className="space-y-3">
                  {Object.entries(categoryCount).map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 w-24 shrink-0">{cat}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(count / MAINTENANCE.length) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Reports page ── */}
          {activeNav === "reports" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Reports</h2>
                <p className="text-sm text-slate-500 mt-0.5">Export data for accounting, tax, and analysis</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Rent Collection Report",  desc: "All transactions, paid/pending/overdue breakdown by property and tenant.", icon: "₹",  color: "bg-emerald-50 text-emerald-700",  formats: ["CSV", "PDF"] },
                  { title: "Occupancy Report",         desc: "Bed occupancy rates, vacancies, and trends across all properties.",       icon: "🏠", color: "bg-violet-50 text-violet-700",    formats: ["CSV", "PDF"] },
                  { title: "Maintenance Cost Report",  desc: "Ticket history, resolution times, and cost breakdown by category.",       icon: "🔧", color: "bg-amber-50 text-amber-700",     formats: ["CSV", "PDF"] },
                  { title: "Payout Summary (CA)",      desc: "12-month payout summary formatted for your chartered accountant.",        icon: "📊", color: "bg-indigo-50 text-indigo-700",   formats: ["PDF"] },
                  { title: "Tenant Ledger",            desc: "Full payment history per tenant — useful for deposit disputes.",          icon: "👥", color: "bg-rose-50 text-rose-700",       formats: ["CSV", "PDF"] },
                  { title: "GST Summary",              desc: "Monthly GST-applicable rent collections, ready for filing.",              icon: "📋", color: "bg-teal-50 text-teal-700",       formats: ["PDF"] },
                ].map(r => (
                  <div key={r.title} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${r.color} flex items-center justify-center text-base shrink-0`}>{r.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      {r.formats.map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => {
                            if (fmt === "PDF") { window.print(); return; }
                            const rows = [
                              ["Report", r.title],
                              ["Generated", new Date().toLocaleDateString("en-IN")],
                              ["Period", "April 2026"],
                              [""],
                              ...TRANSACTIONS.map(tx => [tx.tenant, tx.property, tx.room, String(tx.amount), tx.date, tx.status]),
                            ];
                            const csv = rows.map(row => row.join(",")).join("\n");
                            const blob = new Blob([csv], { type: "text/csv" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url; a.download = `${r.title.replace(/\s+/g, "_")}.csv`; a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-1.5 transition-colors">
                          <Download size={11} strokeWidth={2} />
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Overview page ── */}
          {activeNav === "overview" && <div className="space-y-8">

          {/* Greeting */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t("greeting.text")}</h2>
              <p className="text-sm text-slate-500 mt-1">{t("greeting.sub")}</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-slate-300 transition-colors shrink-0">
              <Calendar size={13} strokeWidth={1.75} />
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
                      <button
                        onClick={() => ins.navTarget && setActiveNav(ins.navTarget)}
                        className={`mt-1 self-start text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${ctaCls}`}
                      >
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
                  <IndianRupee size={14} strokeWidth={2} />
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
                  <LayoutGrid size={14} strokeWidth={1.75} />
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
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Rent Collected</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CreditCard size={14} strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{fmtK(COLLECTED)}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{COLLECT_PCT}% of ₹{Math.round(TOTAL_DUE / 1000)}k due · {TRANSACTIONS.filter(tx => tx.status === "paid").length} paid</span>
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
                  <AlertCircle size={14} strokeWidth={1.75} />
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
              <RevenueChart hovered={chartHovered} setHovered={setChartHovered} dateRange={dateRange} />
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
                  <IndianRupee size={14} strokeWidth={2} />
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
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${alertPriorityStyle[a.priority]}`}>{t(`priority.${a.priority}`)}</span>
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
                  <p className="text-xl font-bold text-slate-900 mt-1">{t("maint.avg_days")}</p>
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
                  <Plus size={11} strokeWidth={2.5} />
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
          </div>}

        </main>
      </div>
    </div>
  );
}

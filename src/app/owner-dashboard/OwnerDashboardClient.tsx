"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Building2, Users, CreditCard, Wrench, BarChart3,
  Bell, Search, Settings, Plus, LogOut, Menu, X,
  TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle2,
  ChevronRight, Download, IndianRupee, BedDouble, Home,
  ArrowLeft, MapPin, Edit3, Camera, Wifi, Car, Dumbbell, Phone, Mail,
  ChevronDown, FileText, CalendarDays, Banknote, UserX, ShieldCheck,
  User, Lock, Smartphone, ToggleLeft, ToggleRight, Landmark, Trash2, Eye, EyeOff,
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
  { id: "p1", name: "Sunshine PG",     address: "Koramangala, Bangalore", beds: 12, occupied: 10, rent: 8500,  pending: 1, image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=240&fit=crop&q=80" },
  { id: "p2", name: "Green Haven",     address: "Indiranagar, Bangalore",  beds: 8,  occupied: 7,  rent: 10000, pending: 1, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=240&fit=crop&q=80" },
  { id: "p3", name: "Royal Residency", address: "HSR Layout, Bangalore",   beds: 10, occupied: 8,  rent: 9500,  pending: 1, image: null },
];

const PROPERTY_ROOMS: Record<string, { id: string; number: string; type: string; tenant: string | null; rent: number; status: "occupied" | "vacant" }[]> = {
  p1: [
    { id: "r1",  number: "101", type: "Single", tenant: "Rahul Sharma",  rent: 8500,  status: "occupied" },
    { id: "r2",  number: "102", type: "Single", tenant: "Neha Gupta",    rent: 8500,  status: "occupied" },
    { id: "r3",  number: "103", type: "Double", tenant: "Arjun Singh",   rent: 8500,  status: "occupied" },
    { id: "r4",  number: "104", type: "Single", tenant: "Divya Nair",    rent: 8500,  status: "occupied" },
    { id: "r5",  number: "105", type: "Double", tenant: "Suresh Babu",   rent: 8500,  status: "occupied" },
    { id: "r6",  number: "106", type: "Single", tenant: "Lakshmi Iyer",  rent: 8500,  status: "occupied" },
    { id: "r7",  number: "107", type: "Single", tenant: "Mohan Das",     rent: 8500,  status: "occupied" },
    { id: "r8",  number: "108", type: "Double", tenant: "Kavya Reddy",   rent: 8500,  status: "occupied" },
    { id: "r9",  number: "109", type: "Single", tenant: "Vikram Joshi",  rent: 8500,  status: "occupied" },
    { id: "r10", number: "110", type: "Single", tenant: "Anita Desai",   rent: 8500,  status: "occupied" },
    { id: "r11", number: "111", type: "Single", tenant: null,            rent: 8500,  status: "vacant"   },
    { id: "r12", number: "112", type: "Double", tenant: null,            rent: 8500,  status: "vacant"   },
  ],
  p2: [
    { id: "r13", number: "A1", type: "Single", tenant: "Priya Verma",   rent: 10000, status: "occupied" },
    { id: "r14", number: "A2", type: "Double", tenant: "Kiran Rao",     rent: 10000, status: "occupied" },
    { id: "r15", number: "A3", type: "Single", tenant: "Ritu Sharma",   rent: 10000, status: "occupied" },
    { id: "r16", number: "A4", type: "Single", tenant: "Deepak Menon",  rent: 10000, status: "occupied" },
    { id: "r17", number: "A5", type: "Double", tenant: "Sneha Pillai",  rent: 10000, status: "occupied" },
    { id: "r18", number: "A6", type: "Single", tenant: "Rahul Nair",    rent: 10000, status: "occupied" },
    { id: "r19", number: "A7", type: "Single", tenant: "Pooja Verma",   rent: 10000, status: "occupied" },
    { id: "r20", number: "A8", type: "Double", tenant: null,            rent: 10000, status: "vacant"   },
  ],
  p3: [
    { id: "r21", number: "201", type: "Single", tenant: "Amit Patel",    rent: 9500, status: "occupied" },
    { id: "r22", number: "202", type: "Double", tenant: "Sonia Mehta",   rent: 9500, status: "occupied" },
    { id: "r23", number: "203", type: "Single", tenant: "Rajesh Kumar",  rent: 9500, status: "occupied" },
    { id: "r24", number: "204", type: "Single", tenant: "Meera Pillai",  rent: 9500, status: "occupied" },
    { id: "r25", number: "205", type: "Double", tenant: "Anil Shetty",   rent: 9500, status: "occupied" },
    { id: "r26", number: "206", type: "Single", tenant: "Zara Khan",     rent: 9500, status: "occupied" },
    { id: "r27", number: "207", type: "Double", tenant: "Sunil Sharma",  rent: 9500, status: "occupied" },
    { id: "r28", number: "208", type: "Single", tenant: "Nisha Gupta",   rent: 9500, status: "occupied" },
    { id: "r29", number: "209", type: "Single", tenant: null,            rent: 9500, status: "vacant"   },
    { id: "r30", number: "210", type: "Double", tenant: null,            rent: 9500, status: "vacant"   },
  ],
};

const PROPERTY_AMENITIES: Record<string, string[]> = {
  p1: ["WiFi", "Parking", "Gym", "CCTV", "Laundry", "Power Backup"],
  p2: ["WiFi", "Parking", "CCTV", "AC Rooms", "Housekeeping", "Water Purifier"],
  p3: ["WiFi", "Gym", "Parking", "CCTV", "Laundry", "Cafeteria", "Power Backup"],
};

const TENANTS_EXT: Record<string, {
  phone: string; email: string; moveIn: string;
  deposit: number; depositPaid: boolean; noticeGiven: boolean;
  idType: string; idVerified: boolean; agreementSigned: boolean;
  emergencyName: string; emergencyPhone: string;
  rentHistory: { month: string; amount: string; status: "paid" | "pending" | "overdue" }[];
}> = {
  u1: { phone: "+91 98765 11111", email: "rahul.s@gmail.com",  moveIn: "Jan 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Suresh Sharma", emergencyPhone: "+91 97777 11111", rentHistory: [{ month: "Apr 2025", amount: "₹8,500",  status: "paid" },    { month: "Mar 2025", amount: "₹8,500",  status: "paid" },    { month: "Feb 2025", amount: "₹8,500",  status: "paid" }] },
  u2: { phone: "+91 98765 22222", email: "priya.v@gmail.com",  moveIn: "Mar 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Anita Verma",   emergencyPhone: "+91 97777 22222", rentHistory: [{ month: "Apr 2025", amount: "₹10,000", status: "paid" },    { month: "Mar 2025", amount: "₹10,000", status: "paid" },    { month: "Feb 2025", amount: "₹10,000", status: "paid" }] },
  u3: { phone: "+91 98765 33333", email: "amit.p@gmail.com",   moveIn: "Jun 2024", deposit: 19000, depositPaid: true,  noticeGiven: true,  idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Rekha Patel",   emergencyPhone: "+91 97777 33333", rentHistory: [{ month: "Apr 2025", amount: "₹9,500",  status: "paid" },    { month: "Mar 2025", amount: "₹9,500",  status: "paid" },    { month: "Feb 2025", amount: "₹9,500",  status: "overdue" }] },
  u4: { phone: "+91 98765 44444", email: "neha.g@gmail.com",   moveIn: "Aug 2024", deposit: 17000, depositPaid: false, noticeGiven: false, idType: "Passport", idVerified: false, agreementSigned: true,  emergencyName: "Rakesh Gupta",  emergencyPhone: "+91 97777 44444", rentHistory: [{ month: "Apr 2025", amount: "₹8,500",  status: "pending" }, { month: "Mar 2025", amount: "₹8,500",  status: "paid" },    { month: "Feb 2025", amount: "₹8,500",  status: "paid" }] },
  u5: { phone: "+91 98765 55555", email: "kiran.r@gmail.com",  moveIn: "Oct 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: false, emergencyName: "Sunita Rao",    emergencyPhone: "+91 97777 55555", rentHistory: [{ month: "Apr 2025", amount: "₹10,000", status: "pending" }, { month: "Mar 2025", amount: "₹10,000", status: "paid" },    { month: "Feb 2025", amount: "₹10,000", status: "paid" }] },
  u6: { phone: "+91 98765 66666", email: "sonia.m@gmail.com",  moveIn: "Nov 2024", deposit: 19000, depositPaid: true,  noticeGiven: true,  idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Kavita Mehta",  emergencyPhone: "+91 97777 66666", rentHistory: [{ month: "Apr 2025", amount: "₹9,500",  status: "overdue" }, { month: "Mar 2025", amount: "₹9,500",  status: "overdue" }, { month: "Feb 2025", amount: "₹9,500",  status: "paid" }] },
};

const MAINTENANCE_EXT: Record<string, {
  description: string; assignee: string | null;
  comments: { author: string; text: string; time: string }[];
}> = {
  m1: { description: "The AC in room 101 stopped cooling. Temperature doesn't drop below 26°C even on max setting.", assignee: "Ramu (Electrician)", comments: [{ author: "Ravi Kumar", text: "Raised ticket. Will check tomorrow.", time: "Apr 3, 9 AM" }, { author: "Ramu", text: "Checked — refrigerant low. Refilling scheduled for tomorrow.", time: "Apr 4, 2 PM" }] },
  m2: { description: "Water leaking from ceiling in room 2A bathroom. Dripping continuously since last night.", assignee: null, comments: [{ author: "Kiran Rao", text: "Started leaking around midnight. Please fix urgently.", time: "Apr 1, 8 AM" }] },
  m3: { description: "Light in room B2 flickers intermittently. Likely a loose connection at the switch.", assignee: "Suresh (Electrician)", comments: [{ author: "Sonia Mehta", text: "Flickering since last week.", time: "Mar 27, 6 PM" }, { author: "Suresh", text: "Fixed — replaced the faulty switch.", time: "Mar 30, 11 AM" }] },
  m4: { description: "Door lock in room 302 is stuck. Key doesn't turn smoothly for the past 3 days.", assignee: "Ramesh (Carpenter)", comments: [{ author: "Neha Gupta", text: "Lock has been stiff for 3 days. Getting difficult to lock at night.", time: "Mar 25, 4 PM" }] },
  m5: { description: "WiFi in room 3B very slow or fully disconnected since Apr 3. Router restart didn't help.", assignee: null, comments: [{ author: "Kiran Rao", text: "Please send a technician, work from home is affected.", time: "Apr 5, 7 PM" }] },
};

const PROPERTY_GALLERY: Record<string, string[]> = {
  p1: [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=280&fit=crop&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=280&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&h=280&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=280&fit=crop&q=80",
  ],
  p2: [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=280&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=280&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=400&h=280&fit=crop&q=80",
  ],
  p3: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=280&fit=crop&q=80",
  ],
};

type AmenityOption = { label: string; icon: React.ElementType | null };
const ALL_AMENITY_OPTIONS: AmenityOption[] = [
  { label: "WiFi",            icon: Wifi },
  { label: "Parking",         icon: Car },
  { label: "Gym",             icon: Dumbbell },
  { label: "AC Rooms",        icon: null },
  { label: "Laundry",         icon: null },
  { label: "CCTV",            icon: null },
  { label: "Power Backup",    icon: null },
  { label: "Water Purifier",  icon: null },
  { label: "Food/Meals",      icon: null },
  { label: "Housekeeping",    icon: null },
  { label: "Security Guard",  icon: null },
  { label: "Cafeteria",       icon: null },
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
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm">
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

type Property = typeof PROPERTIES[number];
type InnerTab = "details" | "photos" | "rooms" | "tenants" | "maintenance";

function ManagePropertyView({ property, onBack }: { property: Property; onBack: () => void }) {
  const [innerTab, setInnerTab] = useState<InnerTab>("details");

  // Details form state
  const [form, setForm] = useState({
    name: property.name, address: property.address,
    rent: String(property.rent), deposit: String(property.rent * 2),
    advance: "1", noticeDays: "30", checkIn: "10:00 AM",
    gender: "Male Only", type: "PG", visitorPolicy: "Allowed till 9 PM", food: "Optional meals",
  });
  const upd = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Amenities
  const [amenities, setAmenities] = useState<Set<string>>(
    new Set(PROPERTY_AMENITIES[property.id] ?? [])
  );
  const toggleAmenity = (label: string) =>
    setAmenities((prev) => { const s = new Set(prev); s.has(label) ? s.delete(label) : s.add(label); return s; });

  // Rooms
  const [rooms, setRooms] = useState(PROPERTY_ROOMS[property.id] ?? []);
  const [assigningRoomId, setAssigningRoomId] = useState<string | null>(null);
  const [assignSelectVal, setAssignSelectVal] = useState("");

  // Photos
  const [gallery, setGallery] = useState(PROPERTY_GALLERY[property.id] ?? []);
  const [coverIdx, setCoverIdx] = useState(0);

  // Tenants
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);
  const [tenantFilter, setTenantFilter] = useState<"all" | "active" | "notice">("all");
  const [showAddTenant, setShowAddTenant] = useState(false);
  const propertyTenants = TENANTS.filter((t) => t.property === property.name);
  const filteredTenants = propertyTenants.filter((t) => {
    const ext = TENANTS_EXT[t.id];
    if (tenantFilter === "notice") return !!ext?.noticeGiven;
    if (tenantFilter === "active") return !ext?.noticeGiven;
    return true;
  });

  // Maintenance
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, string>>({});
  const [mFilter, setMFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");
  const [noteText, setNoteText] = useState("");
  const allTickets = MAINTENANCE.filter((m) => m.property.startsWith(property.name));
  const filteredTickets = allTickets.filter((m) => {
    const st = ticketStatuses[m.id] ?? m.status;
    return mFilter === "all" || st === mFilter;
  });

  const revenue = rooms.filter((r) => r.status === "occupied").reduce((s, r) => s + r.rent, 0);
  const openTickets = allTickets.filter((m) => (ticketStatuses[m.id] ?? m.status) !== "resolved").length;

  const INNER_TABS: { id: InnerTab; label: string; count?: number }[] = [
    { id: "details",     label: "Details" },
    { id: "photos",      label: "Photos",      count: gallery.length },
    { id: "rooms",       label: "Rooms",       count: rooms.length },
    { id: "tenants",     label: "Tenants",     count: propertyTenants.length },
    { id: "maintenance", label: "Maintenance", count: allTickets.length },
  ];

  return (
    <div className="space-y-5">

      {/* ── Hero ── */}
      <div className="relative rounded-2xl overflow-hidden h-52 bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900">
        {property.image && <img src={property.image} alt={property.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button onClick={onBack} className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => setInnerTab("photos")} className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
          <Camera size={13} /> Manage Photos
        </button>
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">{form.name}</h2>
            <p className="flex items-center gap-1 text-white/70 text-xs mt-0.5"><MapPin size={11} />{form.address}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-[10px] font-bold bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">{form.type}</span>
            <span className="text-[10px] font-bold bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">{form.gender}</span>
            <StatusChip status={property.pending > 0 ? "pending" : "paid"} />
          </div>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Monthly Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "accent" },
          { label: "Occupancy",       value: `${Math.round((rooms.filter(r=>r.status==="occupied").length / Math.max(rooms.length,1)) * 100)}%`, icon: BedDouble, color: "trust" },
          { label: "Vacant Beds",     value: String(rooms.filter(r=>r.status==="vacant").length), icon: Home, color: "muted" },
          { label: "Open Tickets",    value: String(openTickets), icon: Wrench, color: "warning" },
        ] as const).map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-[color:var(--line)] p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
              k.color==="accent"  ? "bg-[color:var(--accent-100)] text-[color:var(--accent-600)]" :
              k.color==="trust"   ? "bg-[color:var(--trust-50)] text-[color:var(--trust-700)]" :
              k.color==="warning" ? "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]" :
              "bg-[color:var(--background)] text-[color:var(--muted)]"
            }`}><k.icon size={15} strokeWidth={1.75} /></div>
            <p className="text-lg font-bold text-[color:var(--foreground)]">{k.value}</p>
            <p className="text-[10px] text-[color:var(--muted)] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Panel ── */}
      <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-[color:var(--line)] px-2 pt-2 gap-1 overflow-x-auto">
          {INNER_TABS.map((t) => (
            <button key={t.id} onClick={() => setInnerTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl whitespace-nowrap transition-colors ${
                innerTab===t.id ? "bg-[color:var(--accent-500)] text-white" : "text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--background)]"
              }`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${innerTab===t.id ? "bg-white/20 text-white" : "bg-[color:var(--background)] text-[color:var(--muted)]"}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ────────── Details ────────── */}
        {innerTab === "details" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Basic info */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Basic Info</h4>
                {(["name", "address"] as const).map((k) => (
                  <label key={k} className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">{k === "name" ? "Property Name" : "Address"}</span>
                    <input value={form[k]} onChange={upd(k)} className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2.5 text-sm text-[color:var(--foreground)] bg-[color:var(--background)] outline-none focus:border-[color:var(--accent-400)] transition-colors" />
                  </label>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Type</span>
                    <select value={form.type} onChange={upd("type")} className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2.5 text-sm bg-[color:var(--background)] outline-none focus:border-[color:var(--accent-400)]">
                      {["PG", "Hostel", "Co-living", "Flat"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Gender Policy</span>
                    <select value={form.gender} onChange={upd("gender")} className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2.5 text-sm bg-[color:var(--background)] outline-none focus:border-[color:var(--accent-400)]">
                      {["Male Only", "Female Only", "Co-ed"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Manager Contact</span>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 border border-[color:var(--line)] rounded-xl px-3 py-2.5 bg-[color:var(--background)] flex-1">
                      <Phone size={13} className="text-[color:var(--muted)] shrink-0" />
                      <input defaultValue="+91 98765 43210" className="text-sm bg-transparent outline-none w-full" />
                    </div>
                    <div className="flex items-center gap-2 border border-[color:var(--line)] rounded-xl px-3 py-2.5 bg-[color:var(--background)] flex-1">
                      <Mail size={13} className="text-[color:var(--muted)] shrink-0" />
                      <input defaultValue="ravi@shiftproof.in" className="text-sm bg-transparent outline-none w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financials & Rules */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Financials & Rules</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(["rent", "deposit", "advance", "noticeDays"] as const).map((k) => (
                    <label key={k} className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">
                        {k==="rent" ? "Rent / Bed (₹)" : k==="deposit" ? "Security Deposit (₹)" : k==="advance" ? "Advance (months)" : "Notice Period (days)"}
                      </span>
                      <input value={form[k]} onChange={upd(k)} className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2.5 text-sm bg-[color:var(--background)] outline-none focus:border-[color:var(--accent-400)] transition-colors" />
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Check-in Time</span>
                    <input value={form.checkIn} onChange={upd("checkIn")} className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2.5 text-sm bg-[color:var(--background)] outline-none focus:border-[color:var(--accent-400)] transition-colors" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Visitor Policy</span>
                    <select value={form.visitorPolicy} onChange={upd("visitorPolicy")} className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2.5 text-sm bg-[color:var(--background)] outline-none focus:border-[color:var(--accent-400)]">
                      {["Allowed till 9 PM", "Allowed till 8 PM", "No visitors"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Food Policy</span>
                  <select value={form.food} onChange={upd("food")} className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2.5 text-sm bg-[color:var(--background)] outline-none focus:border-[color:var(--accent-400)]">
                    {["Meals included", "Optional meals", "No meals"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-3">Amenities — click to toggle</h4>
              <div className="flex flex-wrap gap-2">
                {ALL_AMENITY_OPTIONS.map((a) => {
                  const active = amenities.has(a.label);
                  return (
                    <button key={a.label} onClick={() => toggleAmenity(a.label)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        active ? "bg-[color:var(--accent-500)] text-white border-[color:var(--accent-500)]"
                               : "bg-white text-[color:var(--muted)] border-[color:var(--line)] hover:border-[color:var(--accent-400)] hover:text-[color:var(--accent-600)]"
                      }`}>
                      {a.icon !== null ? React.createElement(a.icon, { size: 11 }) : null}
                      {active && <CheckCircle2 size={10} />}
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[color:var(--line)]">
              <button className="text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--foreground)] px-4 py-2.5 rounded-xl border border-[color:var(--line)] hover:bg-[color:var(--background)] transition-colors">Discard</button>
              <button className="bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">Save Changes</button>
            </div>
          </div>
        )}

        {/* ────────── Photos ────────── */}
        {innerTab === "photos" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[color:var(--muted)]">{gallery.length} photos · first photo is used as cover</p>
              <button className="flex items-center gap-1.5 text-xs bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-3 py-2 rounded-lg font-semibold transition-colors">
                <Plus size={12} /> Add Photos
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery.map((url, i) => (
                <div key={url} className="relative group rounded-xl overflow-hidden aspect-video bg-[color:var(--background)]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === coverIdx && (
                    <span className="absolute top-2 left-2 bg-[color:var(--accent-500)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Cover</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {i !== coverIdx && (
                      <button onClick={() => setCoverIdx(i)} className="text-[10px] font-bold text-white bg-white/20 hover:bg-[color:var(--accent-500)] px-2.5 py-1.5 rounded-lg transition-colors">
                        Set Cover
                      </button>
                    )}
                    <button onClick={() => setGallery((prev) => prev.filter((_, j) => j !== i))} className="text-[10px] font-bold text-white bg-white/20 hover:bg-red-500 px-2.5 py-1.5 rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 6 - gallery.length) }).map((_, i) => (
                <button key={i} className="aspect-video rounded-xl border-2 border-dashed border-[color:var(--line)] hover:border-[color:var(--accent-400)] text-[color:var(--muted)] hover:text-[color:var(--accent-600)] flex flex-col items-center justify-center gap-1 transition-colors">
                  <Camera size={18} strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">Upload</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[color:var(--muted)] mt-4">Supported: JPG, PNG, WebP · Max 10 MB · Up to 20 photos</p>
          </div>
        )}

        {/* ────────── Rooms ────────── */}
        {innerTab === "rooms" && (
          <div className="p-5">
            <div className="flex items-center gap-4 mb-5 p-3.5 rounded-xl bg-[color:var(--background)]">
              <div className="flex-1">
                <div className="h-2 rounded-full bg-[color:var(--line)] overflow-hidden">
                  <div className="h-full bg-[color:var(--accent-500)] rounded-full transition-all"
                    style={{ width: `${Math.round((rooms.filter(r=>r.status==="occupied").length / Math.max(rooms.length,1)) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xs text-[color:var(--muted)] whitespace-nowrap shrink-0">
                <span className="font-bold text-[color:var(--foreground)]">{rooms.filter(r=>r.status==="occupied").length}</span> occupied ·{" "}
                <span className="font-bold text-[color:var(--foreground)]">{rooms.filter(r=>r.status==="vacant").length}</span> vacant
              </span>
              <button className="flex items-center gap-1.5 text-xs bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-3 py-2 rounded-lg font-semibold transition-colors shrink-0">
                <Plus size={12} /> Add Room
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {rooms.map((r) => (
                <div key={r.id} className={`rounded-xl border p-3.5 flex flex-col gap-2 ${r.status==="occupied" ? "border-[color:var(--accent-200)] bg-[color:var(--accent-50)]" : "border-[color:var(--line)] bg-white"}`}>
                  <div className="flex items-start justify-between">
                    <p className="text-base font-bold text-[color:var(--foreground)]">#{r.number}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${r.status==="occupied" ? "bg-[color:var(--accent-100)] text-[color:var(--accent-700)]" : "bg-[color:var(--background)] text-[color:var(--muted)]"}`}>{r.type}</span>
                  </div>
                  {r.status === "occupied" && r.tenant ? (
                    <>
                      <p className="text-[11px] font-semibold text-[color:var(--foreground)] truncate">{r.tenant}</p>
                      <p className="text-[10px] text-[color:var(--muted)]">₹{r.rent.toLocaleString("en-IN")}/mo</p>
                      <button onClick={() => setRooms((prev) => prev.map((x) => x.id===r.id ? { ...x, status: "vacant" as const, tenant: null } : x))}
                        className="mt-auto text-[10px] font-semibold text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg border border-red-100 transition-colors">
                        Unassign
                      </button>
                    </>
                  ) : assigningRoomId === r.id ? (
                    <div className="flex flex-col gap-1.5">
                      <select value={assignSelectVal} onChange={(e) => setAssignSelectVal(e.target.value)}
                        className="text-[10px] border border-[color:var(--line)] rounded-lg px-2 py-1.5 bg-white outline-none w-full">
                        <option value="">Select tenant…</option>
                        {TENANTS.filter((t) => t.property !== property.name).map((t) => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        <button onClick={() => {
                          if (!assignSelectVal) return;
                          setRooms((prev) => prev.map((x) => x.id===r.id ? { ...x, status: "occupied" as const, tenant: assignSelectVal } : x));
                          setAssigningRoomId(null); setAssignSelectVal("");
                        }} className="flex-1 text-[10px] font-bold bg-[color:var(--accent-500)] text-white py-1.5 rounded-lg">Assign</button>
                        <button onClick={() => { setAssigningRoomId(null); setAssignSelectVal(""); }} className="text-[10px] font-bold text-[color:var(--muted)] px-2 py-1.5 rounded-lg border border-[color:var(--line)]">✕</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] text-[color:var(--muted)]">₹{r.rent.toLocaleString("en-IN")}/mo</p>
                      <button onClick={() => setAssigningRoomId(r.id)}
                        className="mt-auto text-[10px] font-semibold text-[color:var(--accent-600)] hover:bg-[color:var(--accent-50)] px-2 py-1.5 rounded-lg border border-[color:var(--accent-200)] transition-colors">
                        + Assign Tenant
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────────── Tenants ────────── */}
        {innerTab === "tenants" && (
          <div>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[color:var(--line)]">
              <div className="flex gap-1.5">
                {(["all", "active", "notice"] as const).map((f) => (
                  <button key={f} onClick={() => setTenantFilter(f)}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${tenantFilter===f ? "bg-[color:var(--accent-500)] text-white" : "bg-[color:var(--background)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}>
                    {f==="all" ? `All (${propertyTenants.length})` : f==="active" ? "Active" : "Notice Given"}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddTenant(true)} className="flex items-center gap-1.5 text-xs bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-3 py-2 rounded-lg font-semibold transition-colors">
                <Plus size={12} /> Add Tenant
              </button>
            </div>

            {/* Add Tenant form */}
            {showAddTenant && (
              <div className="mx-5 mt-4 p-5 rounded-xl border border-[color:var(--accent-200)] bg-[color:var(--accent-50)]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-[color:var(--foreground)]">Add New Tenant</h4>
                  <button onClick={() => setShowAddTenant(false)} className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"><X size={16} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Full Name",            placeholder: "e.g. Rahul Sharma",  type: "text" },
                    { label: "Phone",                placeholder: "+91 98765 XXXXX",    type: "text" },
                    { label: "Email",                placeholder: "email@gmail.com",    type: "text" },
                    { label: "Room / Bed No.",       placeholder: "e.g. 101",           type: "text" },
                    { label: "Move-in Date",         placeholder: "DD/MM/YYYY",         type: "text" },
                    { label: "Lease End Date",       placeholder: "DD/MM/YYYY",         type: "text" },
                    { label: "Monthly Rent (₹)",     placeholder: String(property.rent), type: "text" },
                    { label: "Security Deposit (₹)", placeholder: String(property.rent * 2), type: "text" },
                    { label: "ID Type",              placeholder: "",                   type: "select" },
                  ].map((f) => (
                    <label key={f.label} className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">{f.label}</span>
                      {f.type === "select" ? (
                        <select className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]">
                          <option>Aadhar Card</option><option>PAN Card</option><option>Passport</option><option>Voter ID</option>
                        </select>
                      ) : (
                        <input placeholder={f.placeholder} className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]" />
                      )}
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[color:var(--accent-200)]">
                  <p className="text-[11px] text-[color:var(--muted)]">Tenant will receive an onboarding SMS after adding.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddTenant(false)} className="text-xs font-semibold text-[color:var(--muted)] px-4 py-2 rounded-xl border border-[color:var(--line)] hover:bg-white transition-colors">Cancel</button>
                    <button className="bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors">Add Tenant</button>
                  </div>
                </div>
              </div>
            )}

            {/* Tenant list */}
            <div className="p-3 space-y-2 pt-4">
              {filteredTenants.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[color:var(--muted)]">
                  <Users size={32} strokeWidth={1.25} />
                  <p className="text-sm font-medium">No tenants match this filter</p>
                </div>
              )}
              {filteredTenants.map((t) => {
                const ext = TENANTS_EXT[t.id];
                const isExp = expandedTenantId === t.id;
                return (
                  <div key={t.id} className="rounded-xl border border-[color:var(--line)] overflow-hidden">
                    <button onClick={() => setExpandedTenantId(isExp ? null : t.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-[color:var(--background)] transition-colors text-left">
                      <Avatar initials={t.initials} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-[color:var(--foreground)]">{t.name}</p>
                          {ext?.noticeGiven && <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Notice Given</span>}
                          {ext && !ext.idVerified && <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wide">ID Pending</span>}
                          {ext && !ext.agreementSigned && <span className="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Agreement Pending</span>}
                        </div>
                        <p className="text-[11px] text-[color:var(--muted)] mt-0.5">
                          Room {t.room} · Move-in {ext?.moveIn ?? "—"} · Lease ends {t.lease}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <StatusChip status={t.paid ? "paid" : "pending"} />
                        <ChevronDown size={15} className={`text-[color:var(--muted)] transition-transform duration-200 ${isExp ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isExp && ext && (
                      <div className="bg-[color:var(--background)] border-t border-[color:var(--line)] p-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                          {/* Contact */}
                          <div className="space-y-2.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Contact</h5>
                            <div className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[color:var(--muted)]" />{ext.phone}</div>
                            <div className="flex items-center gap-2 text-xs"><Mail size={12} className="text-[color:var(--muted)]" />{ext.email}</div>
                            <div className="pt-1">
                              <p className="text-[10px] text-[color:var(--muted)] mb-1">Emergency Contact</p>
                              <p className="text-xs font-semibold text-[color:var(--foreground)]">{ext.emergencyName}</p>
                              <p className="text-xs text-[color:var(--muted)]">{ext.emergencyPhone}</p>
                            </div>
                          </div>

                          {/* Financials */}
                          <div className="space-y-2.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Financials</h5>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[color:var(--muted)]">Security Deposit</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[color:var(--foreground)]">₹{ext.deposit.toLocaleString("en-IN")}</span>
                                <StatusChip status={ext.depositPaid ? "paid" : "pending"} />
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-[color:var(--muted)] mb-2">Rent History</p>
                              <div className="space-y-1.5">
                                {ext.rentHistory.map((rh) => (
                                  <div key={rh.month} className="flex items-center justify-between">
                                    <span className="text-[11px] text-[color:var(--muted)]">{rh.month}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-semibold text-[color:var(--foreground)]">{rh.amount}</span>
                                      <StatusChip status={rh.status} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="space-y-2.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Documents</h5>
                            {[
                              { label: `${ext.idType} Card`,    done: ext.idVerified,       icon: ShieldCheck },
                              { label: "Rental Agreement",      done: ext.agreementSigned,   icon: FileText },
                              { label: "Police Verification",   done: false,                 icon: FileText },
                              { label: "Passport Photo",        done: true,                  icon: FileText },
                            ].map((doc) => (
                              <div key={doc.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <doc.icon size={12} className={doc.done ? "text-[color:var(--success-700)]" : "text-[color:var(--muted)]"} />
                                  {doc.label}
                                </div>
                                {doc.done
                                  ? <span className="text-[9px] font-bold text-[color:var(--success-700)]">✓ Uploaded</span>
                                  : <button className="text-[9px] font-bold text-[color:var(--accent-600)] hover:underline">Upload</button>
                                }
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-[color:var(--line)]">
                          <button className="flex items-center gap-1.5 text-[11px] font-semibold bg-[color:var(--accent-50)] text-[color:var(--accent-600)] hover:bg-[color:var(--accent-100)] px-3 py-2 rounded-lg transition-colors">
                            <CalendarDays size={12} /> Edit Lease
                          </button>
                          <button className="flex items-center gap-1.5 text-[11px] font-semibold bg-[color:var(--success-50)] text-[color:var(--success-700)] hover:bg-green-100 px-3 py-2 rounded-lg transition-colors">
                            <Banknote size={12} /> Record Payment
                          </button>
                          <button className="flex items-center gap-1.5 text-[11px] font-semibold bg-[color:var(--background)] text-[color:var(--muted)] hover:text-[color:var(--foreground)] px-3 py-2 rounded-lg border border-[color:var(--line)] transition-colors">
                            <Phone size={12} /> Send Reminder
                          </button>
                          {!ext.noticeGiven && (
                            <button className="flex items-center gap-1.5 text-[11px] font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-lg transition-colors">
                              <AlertCircle size={12} /> Initiate Notice
                            </button>
                          )}
                          <button className="flex items-center gap-1.5 text-[11px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors ml-auto">
                            <UserX size={12} /> Remove Tenant
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ────────── Maintenance ────────── */}
        {innerTab === "maintenance" && (
          <div>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[color:var(--line)]">
              <div className="flex gap-1.5 overflow-x-auto">
                {(["all", "pending", "in_progress", "resolved"] as const).map((f) => (
                  <button key={f} onClick={() => setMFilter(f)}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${mFilter===f ? "bg-[color:var(--accent-500)] text-white" : "bg-[color:var(--background)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}>
                    {f==="all" ? `All (${allTickets.length})` : f==="in_progress" ? "In Progress" : f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-xs bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 ml-3">
                <Plus size={12} /> New Ticket
              </button>
            </div>

            {filteredTickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-[color:var(--muted)]">
                <Wrench size={32} strokeWidth={1.25} />
                <p className="text-sm font-medium">No tickets match this filter</p>
              </div>
            )}

            <div className="p-3 space-y-2 pt-3">
              {filteredTickets.map((m) => {
                const st = ticketStatuses[m.id] ?? m.status;
                const ext = MAINTENANCE_EXT[m.id];
                const isExp = expandedTicketId === m.id;
                return (
                  <div key={m.id} className="rounded-xl border border-[color:var(--line)] overflow-hidden">
                    <button onClick={() => { setExpandedTicketId(isExp ? null : m.id); setNoteText(""); }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-[color:var(--background)] transition-colors text-left">
                      <div className={`w-1.5 h-10 rounded-full shrink-0 ${st==="resolved" ? "bg-[color:var(--success)]" : st==="in_progress" ? "bg-[color:var(--trust)]" : "bg-[color:var(--warning)]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[color:var(--foreground)]">{m.title}</p>
                        <p className="text-[11px] text-[color:var(--muted)] mt-0.5">{m.category} · {m.date}{ext?.assignee ? ` · ${ext.assignee}` : " · Unassigned"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusChip status={m.priority} />
                        <StatusChip status={st} />
                        <ChevronDown size={15} className={`text-[color:var(--muted)] transition-transform duration-200 ${isExp ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isExp && ext && (
                      <div className="bg-[color:var(--background)] border-t border-[color:var(--line)] p-5 space-y-4">
                        <p className="text-xs text-[color:var(--foreground)] leading-relaxed">{ext.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] block mb-1">Assignee</label>
                            <input defaultValue={ext.assignee ?? ""} placeholder="e.g. Ramu (Electrician)"
                              className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] block mb-1">Status</label>
                            <select value={st} onChange={(e) => setTicketStatuses((prev) => ({ ...prev, [m.id]: e.target.value }))}
                              className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]">
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-3">Activity</h5>
                          <div className="space-y-3">
                            {ext.comments.map((c, i) => (
                              <div key={i} className="flex gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-[color:var(--accent-100)] text-[color:var(--accent-700)] flex items-center justify-center text-[9px] font-bold shrink-0">
                                  {c.author.split(" ").map((w) => w[0]).join("")}
                                </div>
                                <div className="flex-1 bg-white rounded-xl border border-[color:var(--line)] px-3 py-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-[color:var(--foreground)]">{c.author}</span>
                                    <span className="text-[10px] text-[color:var(--muted)]">{c.time}</span>
                                  </div>
                                  <p className="text-[11px] text-[color:var(--foreground)]">{c.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <input value={noteText} onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add a note or update…"
                              className="flex-1 border border-[color:var(--line)] rounded-xl px-3 py-2 text-xs bg-white outline-none focus:border-[color:var(--accent-400)]" />
                            <button onClick={() => setNoteText("")}
                              className="bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-colors">
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function PropertiesTab() {
  const [managingId, setManagingId] = useState<string | null>(null);
  const managing = PROPERTIES.find((p) => p.id === managingId);

  if (managing) {
    return <ManagePropertyView property={managing} onBack={() => setManagingId(null)} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {PROPERTIES.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
          {/* Cover image */}
          {p.image ? (
            <img src={p.image} alt={p.name} className="w-full h-36 object-cover" />
          ) : (
            <div className="w-full h-36 bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 flex items-center justify-center">
              <Building2 size={36} strokeWidth={1.25} className="text-white/40" />
            </div>
          )}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[color:var(--foreground)]">{p.name}</h3>
                <p className="text-xs text-[color:var(--muted)] mt-0.5">{p.address}</p>
              </div>
              <StatusChip status={p.pending > 0 ? "pending" : "paid"} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
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
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[color:var(--line)]">
              <p className="text-xs text-[color:var(--muted)]">
                Rent: <span className="font-semibold text-[color:var(--foreground)]">₹{p.rent.toLocaleString("en-IN")}/bed</span>
              </p>
              <button
                onClick={() => setManagingId(p.id)}
                className="flex items-center gap-1 text-xs font-semibold text-[color:var(--accent-600)] hover:text-[color:var(--accent-700)] bg-[color:var(--accent-50)] hover:bg-[color:var(--accent-100)] px-3 py-1.5 rounded-lg transition-colors"
              >
                <Settings size={12} strokeWidth={2} />
                Manage
              </button>
            </div>
          </div>
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

function AccountTab() {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "Ravi Kumar", email: "ravi.kumar@gmail.com",
    phone: "9876543210", gst: "29AABCU9603R1ZX", pan: "AABCU9603R",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSaved, setPwdSaved] = useState(false);

  const [notifs, setNotifs] = useState({
    rentReminders: true, maintenanceAlerts: true,
    leaseExpiry: true, paymentReceipts: true,
    whatsapp: true, email: true, sms: false,
  });

  const [bankForm, setBankForm] = useState({
    accountName: "Ravi Kumar", accountNumber: "••••••••4821",
    ifsc: "HDFC0001234", bank: "HDFC Bank",
  });
  const [editingBank, setEditingBank] = useState(false);

  function saveProfile() {
    setEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function savePwd() {
    if (!pwdForm.old) { setPwdError("Enter your current password."); return; }
    if (pwdForm.next.length < 6) { setPwdError("New password must be at least 6 characters."); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdError("Passwords don't match."); return; }
    setPwdError(null);
    setPwdForm({ old: "", next: "", confirm: "" });
    setPwdSaved(true);
    setTimeout(() => setPwdSaved(false), 2500);
  }

  const INPUT = "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:border-[color:var(--accent-500)] focus:ring-2 focus:ring-[color:var(--accent-50)] placeholder:text-[color:var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const CARD = "bg-white rounded-2xl border border-[color:var(--line)] p-6 shadow-sm";
  const SEC_TITLE = "text-sm font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2";

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">

      {/* Profile card */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-5">
          <h2 className={SEC_TITLE}>
            <User size={15} className="text-[color:var(--accent-500)]" /> Profile
          </h2>
          {!editingProfile ? (
            <button onClick={() => setEditingProfile(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--accent-600)] hover:underline">
              <Edit3 size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditingProfile(false)}
                className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)]">Cancel</button>
              <button onClick={saveProfile}
                className="text-xs font-semibold bg-[color:var(--accent-500)] text-white px-3 py-1 rounded-lg hover:bg-[color:var(--accent-600)] transition-colors">Save</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[color:var(--accent-500)]/15 flex items-center justify-center text-xl font-bold text-[color:var(--accent-600)] shrink-0">
            RK
          </div>
          <div>
            <p className="text-base font-bold text-[color:var(--foreground)]">{profileForm.name}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--accent-100)] text-[color:var(--accent-700)] uppercase tracking-wide">
              <Building2 size={9} /> PG Owner
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Full Name",    key: "name",  type: "text" },
            { label: "Email",        key: "email", type: "email" },
            { label: "Mobile",       key: "phone", type: "tel" },
            { label: "GST Number",   key: "gst",   type: "text" },
            { label: "PAN Number",   key: "pan",   type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">{label}</label>
              <input
                type={type}
                disabled={!editingProfile}
                value={profileForm[key as keyof typeof profileForm]}
                onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                className={INPUT}
              />
            </div>
          ))}
        </div>

        {profileSaved && (
          <p className="mt-3 text-xs text-[color:var(--success-700)] bg-[color:var(--success-50)] rounded-lg px-3 py-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Profile updated successfully.
          </p>
        )}
      </div>

      {/* Subscription card */}
      <div className={CARD}>
        <h2 className={SEC_TITLE}>
          <CreditCard size={15} className="text-[color:var(--accent-500)]" /> Subscription
        </h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--accent-500)]/8 border border-[color:var(--accent-200)] mb-4">
          <div>
            <p className="text-sm font-bold text-[color:var(--foreground)]">Growth Plan</p>
            <p className="text-[11px] text-[color:var(--muted)] mt-0.5">Up to 5 properties · 50 tenants</p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[color:var(--accent-500)] text-white uppercase tracking-wide">Active</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-[11px] text-[color:var(--muted)] mb-0.5">Billing cycle</p>
            <p className="font-semibold text-[color:var(--foreground)]">Monthly · ₹999/mo</p>
          </div>
          <div>
            <p className="text-[11px] text-[color:var(--muted)] mb-0.5">Next renewal</p>
            <p className="font-semibold text-[color:var(--foreground)]">May 15, 2025</p>
          </div>
          <div>
            <p className="text-[11px] text-[color:var(--muted)] mb-0.5">Trial ends</p>
            <p className="font-semibold text-[color:var(--foreground)]">Converted · Apr 1, 2025</p>
          </div>
          <div>
            <p className="text-[11px] text-[color:var(--muted)] mb-0.5">Properties used</p>
            <p className="font-semibold text-[color:var(--foreground)]">3 of 5</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 text-xs font-semibold bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-4 py-2.5 rounded-xl transition-colors">
            Upgrade to Enterprise
          </button>
          <button className="text-xs font-semibold border border-[color:var(--line)] text-[color:var(--muted)] hover:text-[color:var(--foreground)] px-4 py-2.5 rounded-xl transition-colors">
            View Invoices
          </button>
        </div>
      </div>

      {/* Bank / payout */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-4">
          <h2 className={SEC_TITLE}>
            <Landmark size={15} className="text-[color:var(--accent-500)]" /> Payout Bank Account
          </h2>
          {!editingBank ? (
            <button onClick={() => setEditingBank(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--accent-600)] hover:underline">
              <Edit3 size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditingBank(false)}
                className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)]">Cancel</button>
              <button onClick={() => setEditingBank(false)}
                className="text-xs font-semibold bg-[color:var(--accent-500)] text-white px-3 py-1 rounded-lg hover:bg-[color:var(--accent-600)] transition-colors">Save</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Account Holder", key: "accountName" },
            { label: "Bank",           key: "bank" },
            { label: "Account Number", key: "accountNumber" },
            { label: "IFSC Code",      key: "ifsc" },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">{label}</label>
              <input
                type="text"
                disabled={!editingBank}
                value={bankForm[key as keyof typeof bankForm]}
                onChange={e => setBankForm(f => ({ ...f, [key]: e.target.value }))}
                className={INPUT}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className={CARD}>
        <h2 className={SEC_TITLE}>
          <Bell size={15} className="text-[color:var(--accent-500)]" /> Notification Preferences
        </h2>
        <div className="space-y-1">
          {([
            { key: "rentReminders",    label: "Rent due reminders",       sub: "5 days and 1 day before due date" },
            { key: "maintenanceAlerts",label: "Maintenance alerts",        sub: "New ticket raised by tenant" },
            { key: "leaseExpiry",      label: "Lease expiry warnings",     sub: "30 days before lease end" },
            { key: "paymentReceipts",  label: "Payment receipts",          sub: "When a tenant pays rent" },
          ] as const).map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-[color:var(--line)] last:border-0">
              <div>
                <p className="text-sm font-medium text-[color:var(--foreground)]">{label}</p>
                <p className="text-[11px] text-[color:var(--muted)]">{sub}</p>
              </div>
              <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))} className="shrink-0 ml-4">
                {notifs[key]
                  ? <ToggleRight size={26} className="text-[color:var(--accent-500)]" />
                  : <ToggleLeft  size={26} className="text-[color:var(--muted)]" />}
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide mt-4 mb-2">Channels</p>
        <div className="flex flex-wrap gap-2">
          {(["whatsapp", "email", "sms"] as const).map(ch => (
            <button
              key={ch}
              onClick={() => setNotifs(n => ({ ...n, [ch]: !n[ch] }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                notifs[ch]
                  ? "bg-[color:var(--accent-500)] text-white border-[color:var(--accent-500)]"
                  : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent-300)]"
              }`}
            >
              <Smartphone size={11} />
              {ch.charAt(0).toUpperCase() + ch.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className={CARD}>
        <h2 className={SEC_TITLE}>
          <Lock size={15} className="text-[color:var(--accent-500)]" /> Security
        </h2>
        <div className="space-y-3">
          {[
            { label: "Current password", key: "old",     show: showOldPwd, toggle: () => setShowOldPwd(v => !v) },
            { label: "New password",     key: "next",    show: showNewPwd, toggle: () => setShowNewPwd(v => !v) },
            { label: "Confirm password", key: "confirm", show: showNewPwd, toggle: () => {} },
          ].map(({ label, key, show, toggle }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">{label}</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {pwdError && (
          <p className="mt-3 text-xs text-[color:var(--error-700)] bg-[color:var(--error-50)] rounded-lg px-3 py-2">{pwdError}</p>
        )}
        {pwdSaved && (
          <p className="mt-3 text-xs text-[color:var(--success-700)] bg-[color:var(--success-50)] rounded-lg px-3 py-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Password changed successfully.
          </p>
        )}
        <button onClick={savePwd}
          className="mt-4 text-xs font-semibold bg-[color:var(--foreground)] hover:opacity-80 text-white px-5 py-2.5 rounded-xl transition-opacity">
          Update Password
        </button>
      </div>

      {/* Danger zone */}
      <div className={`${CARD} border-[color:var(--error)]/30`}>
        <h2 className={`${SEC_TITLE} text-[color:var(--error-700)]`}>
          <Trash2 size={15} className="text-[color:var(--error)]" /> Danger Zone
        </h2>
        <p className="text-sm text-[color:var(--muted)] mb-4">
          Deactivating your account will remove all properties and tenant data permanently after 30 days. This cannot be undone.
        </p>
        <button className="text-xs font-semibold border border-[color:var(--error)]/40 text-[color:var(--error-700)] hover:bg-[color:var(--error-50)] px-4 py-2.5 rounded-xl transition-colors">
          Request Account Deactivation
        </button>
      </div>
    </div>
  );
}

const SECTION_TITLES: Record<string, string> = {
  overview: "Good morning, Ravi", properties: "Properties",
  tenants: "Tenants", payments: "Payments",
  maintenance: "Maintenance", reports: "Reports",
  account: "Account",
};

// ─── Main component ───────────────────────────────────────────────────────────

// ─── Search overlay ──────────────────────────────────────────────────────────

const SEARCH_INDEX = [
  ...PROPERTIES.map(p => ({ type: "Property", label: p.name, sub: p.address, nav: "properties" })),
  ...TENANTS.map(t  => ({ type: "Tenant",   label: t.name,  sub: `${t.property} · Room ${t.room}`, nav: "tenants" })),
  ...MAINTENANCE.map(m => ({ type: "Ticket", label: m.title, sub: `${m.property} · ${m.status}`, nav: "maintenance" })),
];

function SearchOverlay({ onClose, onNav }: { onClose: () => void; onNav: (id: string) => void }) {
  const [q, setQ] = useState("");
  const results = q.trim().length > 0
    ? SEARCH_INDEX.filter(item =>
        item.label.toLowerCase().includes(q.toLowerCase()) ||
        item.sub.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : [];

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-lg bg-[color:var(--surface-card)] rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--line)]">
          <Search size={16} className="text-[color:var(--muted)] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search tenants, properties, tickets…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 text-sm text-[color:var(--foreground)] bg-transparent outline-none placeholder:text-[color:var(--muted)]"
          />
          <kbd className="hidden sm:block text-[10px] text-[color:var(--muted)] bg-[color:var(--background)] px-1.5 py-0.5 rounded border border-[color:var(--line)]">ESC</kbd>
        </div>
        {results.length > 0 && (
          <ul className="py-2 max-h-72 overflow-y-auto">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  onClick={() => { onNav(r.nav); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--background)] transition-colors text-left"
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    r.type === "Property"   ? "bg-[color:var(--accent-100)] text-[color:var(--accent-700)]" :
                    r.type === "Tenant"     ? "bg-[color:var(--trust-50)] text-[color:var(--trust-700)]" :
                                              "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]"
                  }`}>{r.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{r.label}</p>
                    <p className="text-[11px] text-[color:var(--muted)] truncate">{r.sub}</p>
                  </div>
                  <ChevronRight size={13} className="text-[color:var(--muted)] shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {q.trim().length > 0 && results.length === 0 && (
          <p className="px-4 py-6 text-sm text-center text-[color:var(--muted)]">No results for &ldquo;{q}&rdquo;</p>
        )}
        {q.trim().length === 0 && (
          <p className="px-4 py-5 text-xs text-center text-[color:var(--muted)]">Start typing to search across properties, tenants and tickets</p>
        )}
      </div>
    </div>
  );
}

// ─── Notifications dropdown ───────────────────────────────────────────────────

const NOTIF_DATA = [
  { id: "n1", type: "error",   title: "3 overdue rent payments",      body: "Neha, Kiran & Sonia are overdue.",          time: "2h ago",  read: false, nav: "payments" },
  { id: "n2", type: "warning", title: "Lease expiring — Amit Patel",  body: "Lease ends Apr 30. Renew or vacate?",       time: "1d ago",  read: false, nav: "tenants" },
  { id: "n3", type: "warning", title: "Lease expiring — Kiran Rao",   body: "Lease ends Oct 25. Action needed.",         time: "1d ago",  read: true,  nav: "tenants" },
  { id: "n4", type: "info",    title: "5 active maintenance requests", body: "2 high priority, 3 pending assignment.",    time: "3h ago",  read: false, nav: "maintenance" },
  { id: "n5", type: "success", title: "Rent received — Rahul Sharma", body: "₹8,500 received for April 2025.",           time: "Apr 2",   read: true,  nav: "payments" },
];

function NotifDropdown({ onClose, onNav }: { onClose: () => void; onNav: (id: string) => void }) {
  const [items, setItems] = useState(NOTIF_DATA);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const iconColor: Record<string, string> = {
    error: "text-[color:var(--error)]", warning: "text-[color:var(--warning-700)]",
    info: "text-[color:var(--trust-700)]", success: "text-[color:var(--success-700)]",
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-[color:var(--surface-card)] rounded-2xl shadow-xl border border-[color:var(--line)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--line)]">
          <p className="text-sm font-bold text-[color:var(--foreground)]">Notifications</p>
          <button onClick={() => setItems(i => i.map(n => ({ ...n, read: true })))}
            className="text-[11px] font-semibold text-[color:var(--accent-600)] hover:underline">
            Mark all read
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto divide-y divide-[color:var(--line)]">
          {items.map(n => (
            <li key={n.id}>
              <button
                onClick={() => { setItems(i => i.map(x => x.id === n.id ? { ...x, read: true } : x)); onNav(n.nav); onClose(); }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[color:var(--background)] ${!n.read ? "bg-[color:var(--accent-50)]" : ""}`}
              >
                <AlertCircle size={14} className={`${iconColor[n.type]} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${!n.read ? "text-[color:var(--foreground)]" : "text-[color:var(--muted)]"}`}>{n.title}</p>
                  <p className="text-[11px] text-[color:var(--muted)] truncate">{n.body}</p>
                  <p className="text-[10px] text-[color:var(--muted)] mt-0.5">{n.time}</p>
                </div>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent-500)] shrink-0 mt-1.5" />}
              </button>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2.5 border-t border-[color:var(--line)]">
          <button onClick={onClose} className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">
            Close
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Settings types + helpers ─────────────────────────────────────────────────

const SETTINGS_KEY = "sp_owner_prefs";

type DashSettings = {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY";
  defaultPage: string;
  sidebarCollapsed: boolean;
};

const DEFAULT_SETTINGS: DashSettings = {
  theme: "light", density: "comfortable",
  dateFormat: "DD/MM/YYYY", defaultPage: "overview", sidebarCollapsed: false,
};

function loadSettings(): DashSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function resolveTheme(setting: DashSettings["theme"]): "light" | "dark" {
  if (setting === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return setting;
}

function formatTopbarDate(fmt: DashSettings["dateFormat"]): string {
  const now = new Date();
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dd  = String(now.getDate()).padStart(2,"0");
  const mm  = String(now.getMonth() + 1).padStart(2,"0");
  const yyyy = now.getFullYear();
  const day  = days[now.getDay()];
  const mon  = months[now.getMonth()];
  if (fmt === "MM/DD/YYYY") return `${day}, ${mon} ${dd} ${yyyy}`;
  return `${day}, ${dd} ${mon} ${yyyy}`;
}

// ─── Settings dropdown (controlled) ──────────────────────────────────────────

function SettingsDropdown({
  settings, onChange, onSave, onClose,
}: {
  settings: DashSettings;
  onChange: (patch: Partial<DashSettings>) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function save() {
    onSave();
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  }

  const ROW  = "flex items-center justify-between py-3 border-b border-[color:var(--line)] last:border-0";
  const LABEL = "text-sm font-medium text-[color:var(--foreground)]";
  const SUB   = "text-[11px] text-[color:var(--muted)]";
  const CHIP  = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
      active
        ? "bg-[color:var(--accent-500)] text-white border-[color:var(--accent-500)]"
        : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent-200)] hover:text-[color:var(--foreground)]"
    }`;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-[color:var(--surface-card)] rounded-2xl shadow-xl border border-[color:var(--line)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[color:var(--line)]">
          <p className="text-sm font-bold text-[color:var(--foreground)]">Display & Preferences</p>
          <p className="text-[11px] text-[color:var(--muted)] mt-0.5">Changes apply immediately · Saved to this browser</p>
        </div>

        <div className="px-4 py-1 divide-y divide-[color:var(--line)]">

          {/* Theme */}
          <div className={ROW}>
            <div>
              <p className={LABEL}>Theme</p>
              <p className={SUB}>Colour scheme</p>
            </div>
            <div className="flex gap-1">
              {(["light", "dark", "system"] as const).map(t => (
                <button key={t} onClick={() => onChange({ theme: t })} className={CHIP(settings.theme === t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className={ROW}>
            <div>
              <p className={LABEL}>Density</p>
              <p className={SUB}>Card & list spacing</p>
            </div>
            <div className="flex gap-1">
              {(["comfortable", "compact"] as const).map(d => (
                <button key={d} onClick={() => onChange({ density: d })} className={CHIP(settings.density === d)}>
                  {d === "comfortable" ? "Default" : "Compact"}
                </button>
              ))}
            </div>
          </div>

          {/* Date format */}
          <div className={ROW}>
            <div>
              <p className={LABEL}>Date format</p>
              <p className={SUB}>Shown in topbar & tables</p>
            </div>
            <div className="flex gap-1">
              {(["DD/MM/YYYY", "MM/DD/YYYY"] as const).map(f => (
                <button key={f} onClick={() => onChange({ dateFormat: f })} className={CHIP(settings.dateFormat === f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Default page */}
          <div className={ROW}>
            <div>
              <p className={LABEL}>Default page</p>
              <p className={SUB}>First tab after login</p>
            </div>
            <select
              value={settings.defaultPage}
              onChange={e => onChange({ defaultPage: e.target.value })}
              className="text-xs border border-[color:var(--line)] rounded-lg px-2 py-1.5 text-[color:var(--foreground)] bg-[color:var(--background)] outline-none focus:border-[color:var(--accent-500)]"
            >
              {NAV_ITEMS.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>

          {/* Sidebar collapse */}
          <div className={ROW}>
            <div>
              <p className={LABEL}>Compact sidebar</p>
              <p className={SUB}>Icons only on desktop</p>
            </div>
            <button
              onClick={() => onChange({ sidebarCollapsed: !settings.sidebarCollapsed })}
              className={`w-9 h-5 rounded-full transition-colors relative ${settings.sidebarCollapsed ? "bg-[color:var(--accent-500)]" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${settings.sidebarCollapsed ? "left-4" : "left-0.5"}`} />
            </button>
          </div>

        </div>

        <div className="px-4 py-3 border-t border-[color:var(--line)] flex items-center justify-between">
          {saved
            ? <p className="text-xs text-[color:var(--success-700)] flex items-center gap-1.5"><CheckCircle2 size={12} /> Saved to browser</p>
            : <button onClick={save} className="text-xs font-semibold bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-4 py-2 rounded-xl transition-colors">
                Save preferences
              </button>
          }
          <button onClick={onClose} className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">Discard</button>
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OwnerDashboardClient() {
  const router = useRouter();

  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Settings — loaded from localStorage, applied immediately on change
  const [settings, setSettings] = useState<DashSettings>(DEFAULT_SETTINGS);
  React.useEffect(() => {
    const saved = loadSettings();
    setSettings(saved);
    if (saved.defaultPage && saved.defaultPage !== "overview") setActiveNav(saved.defaultPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patchSettings(patch: Partial<DashSettings>) {
    setSettings(prev => ({ ...prev, ...patch }));
  }
  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  const effectiveTheme = React.useMemo(() => resolveTheme(settings.theme), [settings.theme]);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]    = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const unreadCount = NOTIF_DATA.filter(n => !n.read).length;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const sidebarW  = settings.sidebarCollapsed ? "w-14"    : "w-[240px]";
  const mainML    = settings.sidebarCollapsed ? "lg:ml-14" : "lg:ml-[240px]";

  return (
    <div
      className="flex h-screen overflow-hidden bg-[color:var(--background)]"
      data-dash-theme={effectiveTheme}
      data-dash-density={settings.density}
    >

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 ${sidebarW} bg-[#1A1A18] flex flex-col py-6 transition-all duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        {/* Logo */}
        <div className={`mb-8 flex items-center gap-2.5 ${settings.sidebarCollapsed ? "justify-center px-0" : "px-6"}`}>
          <div className="w-7 h-7 rounded-full bg-[color:var(--accent-500)] flex items-center justify-center shrink-0">
            <Building2 size={14} strokeWidth={2} className="text-white" />
          </div>
          {!settings.sidebarCollapsed && <span className="font-bold text-lg text-white tracking-tight">ShiftProof</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              title={settings.sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors text-left
                ${settings.sidebarCollapsed ? "justify-center px-0 py-2.5" : "px-4 py-2.5"}
                ${activeNav === item.id ? "bg-[color:var(--accent-500)]/20 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
            >
              <item.icon size={17} strokeWidth={activeNav === item.id ? 2 : 1.75}
                className={activeNav === item.id ? "text-[color:var(--accent-400)]" : ""} />
              {!settings.sidebarCollapsed && item.label}
            </button>
          ))}
        </nav>

        {/* Profile footer */}
        <div className={`pt-4 border-t border-white/10 ${settings.sidebarCollapsed ? "px-2" : "px-4"}`}>
          <button
            onClick={() => { setActiveNav("account"); setSidebarOpen(false); }}
            title={settings.sidebarCollapsed ? `${OWNER.name} · Account` : undefined}
            className={`w-full flex items-center gap-3 mb-2 px-2 py-2 rounded-xl transition-colors text-left ${
              activeNav === "account" ? "bg-[color:var(--accent-500)]/20" : "hover:bg-white/5"
            } ${settings.sidebarCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 rounded-xl bg-[color:var(--accent-500)]/20 flex items-center justify-center text-xs font-bold text-[color:var(--accent-400)] shrink-0">
              {OWNER.initials}
            </div>
            {!settings.sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{OWNER.name}</p>
                  <p className="text-[10px] text-white/40 truncate">{OWNER.properties} properties · {OWNER.beds} beds</p>
                </div>
                <Settings size={13} className="text-white/30 shrink-0" />
              </>
            )}
          </button>
          <button onClick={handleLogout}
            title={settings.sidebarCollapsed ? "Sign out" : undefined}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors ${settings.sidebarCollapsed ? "justify-center" : ""}`}>
            <LogOut size={13} />
            {!settings.sidebarCollapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${mainML} transition-all duration-300`}>

        {/* Topbar */}
        <header className="flex items-center gap-3 px-5 h-14 bg-white border-b border-[color:var(--line)] shrink-0">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-[color:var(--background)] text-[color:var(--muted)] transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[color:var(--foreground)] truncate">{SECTION_TITLES[activeNav]}</p>
            <p className="text-[11px] text-[color:var(--muted)] hidden sm:block">{formatTopbarDate(settings.dateFormat)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 rounded-xl hover:bg-[color:var(--background)] flex items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
              title="Search (⌘K)"
            >
              <Search size={15} strokeWidth={1.75} />
            </button>
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(v => !v)}
                className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${notifOpen ? "bg-[color:var(--background)] text-[color:var(--foreground)]" : "hover:bg-[color:var(--background)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
                title="Notifications"
              >
                <Bell size={15} strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--error)]" />
                )}
              </button>
              {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} onNav={(id) => { setActiveNav(id); setNotifOpen(false); }} />}
            </div>
            {/* Settings — UI preferences */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(v => !v)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${settingsOpen ? "bg-[color:var(--background)] text-[color:var(--foreground)]" : "hover:bg-[color:var(--background)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"}`}
                title="Display & Preferences"
              >
                <Settings size={15} strokeWidth={1.75} />
              </button>
              {settingsOpen && (
                <SettingsDropdown
                  settings={settings}
                  onChange={patchSettings}
                  onSave={saveSettings}
                  onClose={() => setSettingsOpen(false)}
                />
              )}
            </div>
          </div>
        </header>

        {/* Search overlay (portal-like, rendered inside main so it's above content) */}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onNav={(id) => { setActiveNav(id); }} />}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeNav === "overview"    && <OverviewTab />}
          {activeNav === "properties"  && <PropertiesTab />}
          {activeNav === "tenants"     && <TenantsTab />}
          {activeNav === "payments"    && <PaymentsTab />}
          {activeNav === "maintenance" && <MaintenanceTab />}
          {activeNav === "reports"     && <ReportsTab />}
          {activeNav === "account"     && <AccountTab />}
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

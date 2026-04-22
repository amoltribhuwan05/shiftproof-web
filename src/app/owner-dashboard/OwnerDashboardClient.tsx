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
  Globe, UserPlus, Send,
} from "lucide-react";
import { CURRENT_ORG, MOCK_ORGS } from "@/lib/orgData";
import {
  type OrgRole, type OrgMember, type OrgPermissions, type Organization,
  ROLE_PERMISSIONS, PLAN_LIMITS,
} from "@/lib/orgTypes";
import {
  ReactFlow, Handle, Position, MarkerType, Background,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";

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

const PROPERTY_FLOORS: Record<string, { id: string; label: string; roomIds: string[] }[]> = {
  p1: [
    { id: "p1f1", label: "Floor 1", roomIds: ["r1",  "r2",  "r3",  "r4"]           },
    { id: "p1f2", label: "Floor 2", roomIds: ["r5",  "r6",  "r7",  "r8"]           },
    { id: "p1f3", label: "Floor 3", roomIds: ["r9",  "r10", "r11", "r12"]          },
  ],
  p2: [
    { id: "p2f1", label: "Floor 1", roomIds: ["r13", "r14", "r15", "r16"]          },
    { id: "p2f2", label: "Floor 2", roomIds: ["r17", "r18", "r19", "r20"]          },
  ],
  p3: [
    { id: "p3f1", label: "Floor 1", roomIds: ["r21", "r22", "r23", "r24", "r25"]   },
    { id: "p3f2", label: "Floor 2", roomIds: ["r26", "r27", "r28", "r29", "r30"]   },
  ],
};

const ROOM_BY_ID = Object.fromEntries(
  Object.values(PROPERTY_ROOMS).flat().map(r => [r.id, r])
);

const TENANT_BY_NAME: Record<string, string> = Object.fromEntries(
  TENANTS.map(t => [t.name, t.id])
);


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
  rentHistory: { month: string; amount: string; status: "paid" | "pending" | "overdue"; paidOn?: string; ref?: string }[];
}> = {
  u1: { phone: "+91 98765 11111", email: "rahul.s@gmail.com",  moveIn: "Jan 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Suresh Sharma", emergencyPhone: "+91 97777 11111",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "paid",    paidOn: "Apr 2, 2025",  ref: "TXN-2504-001" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid",    paidOn: "Mar 1, 2025",  ref: "TXN-2503-001" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid",    paidOn: "Feb 3, 2025",  ref: "TXN-2502-001" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid",    paidOn: "Jan 4, 2025",  ref: "TXN-2501-001" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid",    paidOn: "Dec 2, 2024",  ref: "TXN-2412-001" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid",    paidOn: "Nov 5, 2024",  ref: "TXN-2411-001" },
    ]},
  u2: { phone: "+91 98765 22222", email: "priya.v@gmail.com",  moveIn: "Mar 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Anita Verma",   emergencyPhone: "+91 97777 22222",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "paid",    paidOn: "Apr 2, 2025",  ref: "TXN-2504-002" },
      { month: "Mar 2025", amount: "₹10,000", status: "paid",    paidOn: "Mar 3, 2025",  ref: "TXN-2503-002" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid",    paidOn: "Feb 1, 2025",  ref: "TXN-2502-002" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid",    paidOn: "Jan 2, 2025",  ref: "TXN-2501-002" },
      { month: "Dec 2024", amount: "₹10,000", status: "paid",    paidOn: "Dec 3, 2024",  ref: "TXN-2412-002" },
      { month: "Nov 2024", amount: "₹10,000", status: "paid",    paidOn: "Nov 1, 2024",  ref: "TXN-2411-002" },
    ]},
  u3: { phone: "+91 98765 33333", email: "amit.p@gmail.com",   moveIn: "Jun 2024", deposit: 19000, depositPaid: true,  noticeGiven: true,  idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Rekha Patel",   emergencyPhone: "+91 97777 33333",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "paid",    paidOn: "Apr 3, 2025",  ref: "TXN-2504-003" },
      { month: "Mar 2025", amount: "₹9,500",  status: "paid",    paidOn: "Mar 2, 2025",  ref: "TXN-2503-003" },
      { month: "Feb 2025", amount: "₹9,500",  status: "overdue" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid",    paidOn: "Jan 6, 2025",  ref: "TXN-2501-003" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid",    paidOn: "Dec 4, 2024",  ref: "TXN-2412-003" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid",    paidOn: "Nov 2, 2024",  ref: "TXN-2411-003" },
    ]},
  u4: { phone: "+91 98765 44444", email: "neha.g@gmail.com",   moveIn: "Aug 2024", deposit: 17000, depositPaid: false, noticeGiven: false, idType: "Passport", idVerified: false, agreementSigned: true,  emergencyName: "Rakesh Gupta",  emergencyPhone: "+91 97777 44444",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "pending" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid",    paidOn: "Mar 8, 2025",  ref: "TXN-2503-004" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid",    paidOn: "Feb 5, 2025",  ref: "TXN-2502-004" },
      { month: "Jan 2025", amount: "₹8,500",  status: "overdue" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid",    paidOn: "Dec 7, 2024",  ref: "TXN-2412-004" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid",    paidOn: "Nov 4, 2024",  ref: "TXN-2411-004" },
    ]},
  u5: { phone: "+91 98765 55555", email: "kiran.r@gmail.com",  moveIn: "Oct 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: false, emergencyName: "Sunita Rao",    emergencyPhone: "+91 97777 55555",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "pending" },
      { month: "Mar 2025", amount: "₹10,000", status: "paid",    paidOn: "Mar 10, 2025", ref: "TXN-2503-005" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid",    paidOn: "Feb 9, 2025",  ref: "TXN-2502-005" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid",    paidOn: "Jan 11, 2025", ref: "TXN-2501-005" },
      { month: "Dec 2024", amount: "₹10,000", status: "paid",    paidOn: "Dec 9, 2024",  ref: "TXN-2412-005" },
      { month: "Nov 2024", amount: "₹10,000", status: "paid",    paidOn: "Nov 10, 2024", ref: "TXN-2411-005" },
    ]},
  u6: { phone: "+91 98765 66666", email: "sonia.m@gmail.com",  moveIn: "Nov 2024", deposit: 19000, depositPaid: true,  noticeGiven: true,  idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Kavita Mehta",  emergencyPhone: "+91 97777 66666",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "overdue" },
      { month: "Mar 2025", amount: "₹9,500",  status: "overdue" },
      { month: "Feb 2025", amount: "₹9,500",  status: "paid",    paidOn: "Feb 12, 2025", ref: "TXN-2502-006" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid",    paidOn: "Jan 14, 2025", ref: "TXN-2501-006" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid",    paidOn: "Dec 11, 2024", ref: "TXN-2412-006" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid",    paidOn: "Nov 12, 2024", ref: "TXN-2411-006" },
    ]},
};

const TENANT_DOCS: Record<string, { type: string; status: "verified" | "pending" | "missing"; uploadedOn?: string }[]> = {
  u1: [
    { type: "Aadhar Card",         status: "verified", uploadedOn: "15 Jan 2024" },
    { type: "Rental Agreement",    status: "verified", uploadedOn: "15 Jan 2024" },
    { type: "Police Verification", status: "verified", uploadedOn: "17 Jan 2024" },
    { type: "Passport Photo",      status: "verified", uploadedOn: "15 Jan 2024" },
    { type: "Employment Proof",    status: "missing" },
  ],
  u2: [
    { type: "PAN Card",            status: "verified", uploadedOn: "10 Mar 2024" },
    { type: "Rental Agreement",    status: "verified", uploadedOn: "10 Mar 2024" },
    { type: "Police Verification", status: "verified", uploadedOn: "12 Mar 2024" },
    { type: "Passport Photo",      status: "verified", uploadedOn: "10 Mar 2024" },
    { type: "Employment Proof",    status: "verified", uploadedOn: "10 Mar 2024" },
  ],
  u3: [
    { type: "Aadhar Card",         status: "verified", uploadedOn: "05 Jun 2024" },
    { type: "Rental Agreement",    status: "verified", uploadedOn: "05 Jun 2024" },
    { type: "Police Verification", status: "pending",  uploadedOn: "06 Jun 2024" },
    { type: "Passport Photo",      status: "verified", uploadedOn: "05 Jun 2024" },
    { type: "Employment Proof",    status: "missing" },
  ],
  u4: [
    { type: "Passport",            status: "pending",  uploadedOn: "12 Aug 2024" },
    { type: "Rental Agreement",    status: "verified", uploadedOn: "12 Aug 2024" },
    { type: "Police Verification", status: "missing" },
    { type: "Passport Photo",      status: "pending",  uploadedOn: "12 Aug 2024" },
    { type: "Employment Proof",    status: "missing" },
  ],
  u5: [
    { type: "Aadhar Card",         status: "verified", uploadedOn: "20 Oct 2024" },
    { type: "Rental Agreement",    status: "missing" },
    { type: "Police Verification", status: "missing" },
    { type: "Passport Photo",      status: "verified", uploadedOn: "20 Oct 2024" },
    { type: "Employment Proof",    status: "verified", uploadedOn: "20 Oct 2024" },
  ],
  u6: [
    { type: "PAN Card",            status: "verified", uploadedOn: "01 Nov 2024" },
    { type: "Rental Agreement",    status: "verified", uploadedOn: "01 Nov 2024" },
    { type: "Police Verification", status: "verified", uploadedOn: "03 Nov 2024" },
    { type: "Passport Photo",      status: "verified", uploadedOn: "01 Nov 2024" },
    { type: "Employment Proof",    status: "missing" },
  ],
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
  { id: "overview",      label: "Overview",      icon: LayoutDashboard },
  { id: "properties",    label: "Properties",    icon: Building2 },
  { id: "tenants",       label: "Tenants",       icon: Users },
  { id: "payments",      label: "Payments",      icon: CreditCard },
  { id: "maintenance",   label: "Maintenance",   icon: Wrench },
  { id: "reports",       label: "Reports",       icon: BarChart3 },
  { id: "organization",  label: "Organization",  icon: Landmark },
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

function PropertiesTab({ initialPropId }: { initialPropId?: string | null }) {
  const [managingId, setManagingId] = useState<string | null>(initialPropId ?? null);
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

function TenantProfileView({ tenantId, onBack, onViewInOrg }: {
  tenantId: string; onBack: () => void; onViewInOrg?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "payment">("overview");
  const t   = TENANTS.find(x => x.id === tenantId);
  const ext = TENANTS_EXT[tenantId];
  const docs = TENANT_DOCS[tenantId] ?? [];
  if (!t || !ext) return null;

  // Resolve actual room / floor / property from the structural data
  let actualRoom: typeof PROPERTY_ROOMS["p1"][0] | undefined;
  let actualPropId: string | undefined;
  for (const [pid, rooms] of Object.entries(PROPERTY_ROOMS)) {
    const found = rooms.find(r => r.tenant === t.name);
    if (found) { actualRoom = found; actualPropId = pid; break; }
  }
  const actualProp  = actualPropId ? PROPERTIES.find(p => p.id === actualPropId) : null;
  const actualFloor = (actualPropId && actualRoom)
    ? (PROPERTY_FLOORS[actualPropId] ?? []).find(fl => fl.roomIds.includes(actualRoom!.id))
    : null;

  const total        = ext.rentHistory.length;
  const paidCount    = ext.rentHistory.filter(r => r.status === "paid").length;
  const overdueCount = ext.rentHistory.filter(r => r.status === "overdue").length;
  const onTimeRate   = Math.round((paidCount / total) * 100);
  const totalPaidAmt = ext.rentHistory
    .filter(r => r.status === "paid")
    .reduce((s, r) => s + parseInt(r.amount.replace(/[^\d]/g, ""), 10), 0);
  const verifiedDocs = docs.filter(d => d.status === "verified").length;
  const pendingDocs  = docs.filter(d => d.status === "pending").length;
  const missingDocs  = docs.filter(d => d.status === "missing").length;
  const chartData    = [...ext.rentHistory].reverse();

  const statsStrip = [
    { label: "Move-in",      value: ext.moveIn,                                   sub: "Lease until " + t.lease },
    { label: "Monthly Rent", value: ext.rentHistory[0]?.amount ?? "—",           sub: "Current" },
    { label: "Total Paid",   value: "₹" + totalPaidAmt.toLocaleString("en-IN"),  sub: paidCount + " months" },
    { label: "Deposit",      value: ext.depositPaid ? "₹" + ext.deposit.toLocaleString("en-IN") : "Pending",
                             sub: ext.depositPaid ? "Received" : "Not received" },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-[color:var(--foreground)] font-medium transition-colors">
          <ArrowLeft size={13} /> All Tenants
        </button>
        <span>/</span>
        <span className="text-[color:var(--foreground)] font-semibold truncate">{t.name}</span>
      </div>

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm">
        {/* Gradient banner — overflow-hidden here clips gradient to rounded top corners */}
        <div className="h-28 rounded-t-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 55%,#2563eb 100%)" }}>
          {ext.noticeGiven && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
              <AlertCircle size={10} /> Notice Period
            </div>
          )}
          {actualProp && (
            <div className="absolute bottom-3 left-5 flex items-center gap-1 text-white/70 text-[10px]">
              <Landmark size={9} />
              <span className="ml-1">{actualProp.name}</span>
              {actualFloor && <><ChevronRight size={9} /><span>{actualFloor.label}</span></>}
              {actualRoom  && <><ChevronRight size={9} /><span>Room {actualRoom.number}</span></>}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 relative z-10">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              {t.initials}
            </div>
            <div className="flex gap-2 mb-1 flex-wrap justify-end">
              <a href={`tel:${ext.phone}`}
                className="flex items-center gap-1.5 text-[11px] font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                <Phone size={11} /> Call
              </a>
              <a href={`mailto:${ext.email}`}
                className="flex items-center gap-1.5 text-[11px] font-semibold border border-[color:var(--line)] hover:bg-slate-50 text-[color:var(--foreground)] px-3 py-1.5 rounded-lg transition-colors">
                <Mail size={11} /> Email
              </a>
              <a href={`https://wa.me/${ext.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                <Send size={11} /> WhatsApp
              </a>
              {onViewInOrg && (
                <button onClick={onViewInOrg}
                  className="flex items-center gap-1.5 text-[11px] font-semibold border border-violet-200 text-violet-600 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Globe size={11} /> Org Tree
                </button>
              )}
            </div>
          </div>
          <h2 className="text-base font-bold text-[color:var(--foreground)]">{t.name}</h2>
          <p className="text-xs text-[color:var(--muted)] mb-3">
            {actualProp?.name ?? t.property} · {actualRoom ? `Room ${actualRoom.number} · ${actualRoom.type}` : `Room ${t.room}`}
          </p>
          <div className="flex gap-2 flex-wrap">
            <StatusChip status={t.paid ? "paid" : "pending"} />
            <StatusChip status={t.risk} />
            {ext.idVerified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={9} /> ID Verified
              </span>
            )}
            {ext.agreementSigned && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                <FileText size={9} /> Agreement Signed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsStrip.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[color:var(--line)] px-4 py-3.5 shadow-sm">
            <p className="text-[10px] text-[color:var(--muted)] uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-sm font-bold text-[color:var(--foreground)]">{s.value}</p>
            <p className="text-[10px] text-[color:var(--muted)] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Tabbed panel ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[color:var(--line)] overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-[color:var(--line)] px-1 pt-1 gap-0.5 bg-[color:var(--background)]">
          {(["overview", "documents", "payment"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-[11px] font-semibold rounded-t-lg transition-colors ${
                activeTab === tab
                  ? "bg-white text-violet-600 border-x border-t border-[color:var(--line)] -mb-px"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}>
              {tab === "payment" ? "Payment History" : tab === "overview" ? "Overview" : "Documents"}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* ── Overview ────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Room & Lease */}
                <div>
                  <h4 className="text-xs font-bold text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                    <BedDouble size={13} className="text-violet-600" /> Room & Lease
                  </h4>
                  {[
                    { label: "Property",  value: actualProp?.name ?? t.property },
                    { label: "Floor",     value: actualFloor?.label ?? "—" },
                    { label: "Room No.",  value: actualRoom ? `${actualRoom.number} · ${actualRoom.type}` : t.room },
                    { label: "Move-in",   value: ext.moveIn },
                    { label: "Lease End", value: t.lease },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-[color:var(--line)] last:border-0">
                      <span className="text-[11px] text-[color:var(--muted)]">{row.label}</span>
                      <span className="text-[11px] font-semibold text-[color:var(--foreground)]">{row.value}</span>
                    </div>
                  ))}
                </div>
                {/* Contact */}
                <div>
                  <h4 className="text-xs font-bold text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                    <Phone size={13} className="text-violet-600" /> Contact
                  </h4>
                  {[
                    { label: "Phone",        value: ext.phone },
                    { label: "Email",        value: ext.email },
                    { label: "Emergency",    value: ext.emergencyName },
                    { label: "Emrg. Phone", value: ext.emergencyPhone },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-[color:var(--line)] last:border-0">
                      <span className="text-[11px] text-[color:var(--muted)]">{row.label}</span>
                      <span className="text-[11px] font-semibold text-[color:var(--foreground)] truncate max-w-[160px]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Verification checklist */}
              <div>
                <h4 className="text-xs font-bold text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                  <ShieldCheck size={13} className="text-violet-600" /> Verification Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: `${ext.idType} Verified`, ok: ext.idVerified },
                    { label: "Agreement Signed",        ok: ext.agreementSigned },
                    { label: "Deposit Paid",            ok: ext.depositPaid },
                    { label: "Notice Given",            ok: ext.noticeGiven },
                  ].map(row => (
                    <div key={row.label} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-medium ${
                      row.ok
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-[color:var(--background)] border-[color:var(--line)] text-[color:var(--muted)]"
                    }`}>
                      {row.ok ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {row.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Documents ───────────────────────────────────────────────── */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 size={11} /> {verifiedDocs} Verified
                </span>
                {pendingDocs > 0 && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    <Clock size={11} /> {pendingDocs} Awaiting Review
                  </span>
                )}
                {missingDocs > 0 && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                    <AlertCircle size={11} /> {missingDocs} Missing
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {docs.map(doc => (
                  <div key={doc.type} className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    doc.status === "verified" ? "bg-white border-[color:var(--line)]"
                    : doc.status === "pending" ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200 border-dashed"
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        doc.status === "verified" ? "bg-emerald-100"
                        : doc.status === "pending" ? "bg-amber-100" : "bg-red-100"
                      }`}>
                        <FileText size={14} className={
                          doc.status === "verified" ? "text-emerald-600"
                          : doc.status === "pending" ? "text-amber-600" : "text-red-600"
                        } />
                      </div>
                      {doc.status === "verified" && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                      {doc.status === "pending"  && <Clock size={14} className="text-amber-500 shrink-0" />}
                      {doc.status === "missing"  && <AlertCircle size={14} className="text-red-500 shrink-0" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[color:var(--foreground)]">{doc.type}</p>
                      <p className="text-[10px] text-[color:var(--muted)] mt-0.5">
                        {doc.status === "verified" ? `Uploaded ${doc.uploadedOn}`
                          : doc.status === "pending" ? "Awaiting review" : "Not uploaded"}
                      </p>
                    </div>
                    {doc.status === "verified" && (
                      <button className="self-start flex items-center gap-1 text-[10px] font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                        <Eye size={10} /> View
                      </button>
                    )}
                    {doc.status === "missing" && (
                      <button className="self-start flex items-center gap-1 text-[10px] font-semibold text-red-600 hover:text-red-700 transition-colors">
                        <Send size={10} /> Request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Payment History ──────────────────────────────────────────── */}
          {activeTab === "payment" && (
            <div className="space-y-5">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[color:var(--background)] rounded-xl px-4 py-3 text-center">
                  <p className="text-xs font-bold text-[color:var(--foreground)]">₹{totalPaidAmt.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-[color:var(--muted)] mt-0.5">Total Collected</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs font-bold text-red-600">{overdueCount}</p>
                  <p className="text-[10px] text-[color:var(--muted)] mt-0.5">Overdue Months</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs font-bold text-emerald-600">{onTimeRate}%</p>
                  <p className="text-[10px] text-[color:var(--muted)] mt-0.5">On-time Rate</p>
                </div>
              </div>

              {/* Div-based bar chart */}
              <div className="bg-[color:var(--background)] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wide mb-3">6-Month Payment Trend</p>
                <div className="flex items-end gap-2" style={{ height: 72 }}>
                  {chartData.map(r => {
                    const bg = r.status === "paid" ? "#7c3aed" : r.status === "overdue" ? "#ef4444" : "#f59e0b";
                    const h  = r.status === "paid" ? 72 : r.status === "overdue" ? 58 : 36;
                    return (
                      <div key={r.month} className="flex-1 rounded-sm transition-all"
                        style={{ height: h, background: bg, opacity: r.status === "paid" ? 1 : 0.8 }} />
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-1.5">
                  {chartData.map(r => (
                    <div key={r.month} className="flex-1 text-center">
                      <span className="text-[9px] text-[color:var(--muted)]">{r.month.split(" ")[0].slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 flex-wrap">
                  {[{ color: "#7c3aed", label: "Paid" }, { color: "#f59e0b", label: "Pending" }, { color: "#ef4444", label: "Overdue" }].map(l => (
                    <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-[color:var(--muted)]">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed table */}
              <div className="overflow-x-auto rounded-xl border border-[color:var(--line)]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[color:var(--background)]">
                      {["Month", "Amount", "Paid On", "Status", "Ref #"].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--line)]">
                    {ext.rentHistory.map(rh => (
                      <tr key={rh.month} className="hover:bg-[color:var(--background)] transition-colors">
                        <td className="px-4 py-3 text-[11px] text-[color:var(--foreground)] whitespace-nowrap">{rh.month}</td>
                        <td className="px-4 py-3 text-[11px] font-semibold text-[color:var(--foreground)]">{rh.amount}</td>
                        <td className="px-4 py-3 text-[11px] text-[color:var(--muted)] whitespace-nowrap">{rh.paidOn ?? "—"}</td>
                        <td className="px-4 py-3"><StatusChip status={rh.status} /></td>
                        <td className="px-4 py-3 text-[11px] text-[color:var(--muted)] font-mono">{rh.ref ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function TenantsTab({ initialTenantId, onNav }: { initialTenantId?: string | null; onNav?: (tab: string) => void }) {
  const [profileId, setProfileId] = useState<string | null>(initialTenantId ?? null);

  if (profileId) {
    return (
      <TenantProfileView
        tenantId={profileId}
        onBack={() => setProfileId(null)}
        onViewInOrg={onNav ? () => onNav("organization") : undefined}
      />
    );
  }

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
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]"></th>
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
                <td className="px-4 py-3.5">
                  <button onClick={() => setProfileId(t.id)}
                    className="text-[11px] font-semibold text-[color:var(--accent-600)] hover:text-[color:var(--accent-700)] hover:underline">
                    View
                  </button>
                </td>
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
  organization: "Organization", account: "Account",
};

// ─── Organization tab ─────────────────────────────────────────────────────────

const ROLE_STYLE: Record<OrgRole, string> = {
  owner:      "bg-[color:var(--accent-100)] text-[color:var(--accent-700)]",
  admin:      "bg-[color:var(--trust-50)] text-[color:var(--trust-700)]",
  manager:    "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]",
  accountant: "bg-[color:var(--success-50)] text-[color:var(--success-700)]",
  caretaker:  "bg-slate-100 text-slate-600",
};

const ROLE_LABEL: Record<OrgRole, string> = {
  owner: "Owner", admin: "Admin", manager: "Manager",
  accountant: "Accountant", caretaker: "Caretaker",
};

const PERM_LABELS: Record<keyof OrgPermissions, string> = {
  viewPayments:    "View payments & rent",
  editProperties:  "Edit property details",
  manageTenants:   "Manage tenants",
  viewReports:     "View reports & exports",
  manageMembers:   "Manage team members",
  billingAccess:   "Billing & subscription",
};

function RoleChip({ role }: { role: OrgRole }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_STYLE[role]}`}>
      {ROLE_LABEL[role]}
    </span>
  );
}

function MemberStatusChip({ status, expired }: { status: OrgMember["status"]; expired: boolean }) {
  if (status === "active")   return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--success-700)]"><span className="w-1.5 h-1.5 rounded-full bg-[color:var(--success)] inline-block" />Active</span>;
  if (status === "inactive") return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--muted)]"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />Inactive</span>;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${expired ? "text-[color:var(--error-700)]" : "text-[color:var(--warning-700)]"}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${expired ? "bg-[color:var(--error)]" : "bg-[color:var(--warning)]"}`} />
      {expired ? "Expired" : "Invited"}
    </span>
  );
}

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const ORG_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── OrgDetail — profile card + member management for one org ─────────────────

function OrgDetail({
  org,
  onDelete,
}: {
  org: Organization;
  onDelete: (id: string) => void;
}) {
  const limits = PLAN_LIMITS[org.plan];
  const isSolo = org.plan === "solo";

  const [members, setMembers]     = React.useState<OrgMember[]>(org.members);
  const [showInvite, setShowInvite] = React.useState(false);
  const [inviteName, setInviteName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole]   = React.useState<OrgRole>("manager");
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  const ownerCount     = members.filter(m => m.role === "owner").length;
  const activeCount    = members.filter(m => m.status === "active").length;
  const nonOwnerActive = members.filter(m => m.role !== "owner" && m.status === "active").length;
  const atLimit        = members.length >= limits.maxMembers;

  function sendInvite() {
    if (!inviteName.trim()) { setInviteError("Name is required."); return; }
    if (!ORG_EMAIL_RE.test(inviteEmail.trim())) { setInviteError("A valid email is required."); return; }
    if (members.some(m => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      setInviteError("This email is already a member of the organization."); return;
    }
    if (atLimit) { setInviteError(`Seat limit reached (${limits.maxMembers} members on ${limits.label} plan).`); return; }
    setMembers(prev => [...prev, {
      id: `m${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      assignedProperties: [],
      status: "invited",
      joinedAt: "",
      invitedAt: new Date().toISOString(),
    }]);
    setInviteName(""); setInviteEmail(""); setInviteRole("manager");
    setShowInvite(false); setInviteError(null);
  }

  function removeMember(id: string) {
    const m = members.find(x => x.id === id);
    if (!m || (m.role === "owner" && ownerCount <= 1)) return;
    setMembers(prev => prev.filter(x => x.id !== id));
  }

  const INP = "px-3 py-2.5 rounded-xl border border-[color:var(--line)] text-sm bg-white outline-none focus:border-[color:var(--accent-500)] focus:ring-2 focus:ring-[color:var(--accent-50)] text-[color:var(--foreground)]";

  return (
    <div className="space-y-6">

      {/* Org profile card */}
      <div className="bg-white rounded-2xl border border-[color:var(--line)] p-6">
        <div className="flex items-start gap-4">
          {org.image ? (
            <img src={org.image} alt={org.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[color:var(--accent-100)] text-[color:var(--accent-700)] flex items-center justify-center text-lg font-bold shrink-0 select-none">
              {org.logoInitials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)] truncate">{org.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">{org.type}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[color:var(--trust-50)] text-[color:var(--trust-700)]">{limits.label} plan</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 text-sm text-[color:var(--muted)]">
              <span className="flex items-center gap-2 truncate"><MapPin size={13} className="shrink-0" />{org.address}, {org.city}</span>
              <span className="flex items-center gap-2"><Phone size={13} className="shrink-0" />{org.phone}</span>
              <span className="flex items-center gap-2 truncate"><Mail size={13} className="shrink-0" />{org.email}</span>
              {org.website && (
                <span className="flex items-center gap-2 truncate">
                  <Globe size={13} className="shrink-0" />
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--accent-500)] underline underline-offset-2 truncate">
                    {org.website.replace("https://", "")}
                  </a>
                </span>
              )}
              {org.gstin && <span className="flex items-center gap-2"><ShieldCheck size={13} className="shrink-0" />GSTIN: <span className="font-mono text-xs text-[color:var(--foreground)]">{org.gstin}</span></span>}
              {org.cin   && <span className="flex items-center gap-2"><Landmark size={13} className="shrink-0" />CIN: <span className="font-mono text-xs text-[color:var(--foreground)]">{org.cin}</span></span>}
            </div>
          </div>
          <button
            onClick={() => setDeleteConfirm(v => !v)}
            title="Delete organization"
            className="shrink-0 p-2 rounded-xl text-[color:var(--muted)] hover:text-[color:var(--error)] hover:bg-[color:var(--error-50)] transition-colors"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="mt-5 rounded-xl border border-[color:var(--error-50)] bg-[color:var(--error-50)] p-4">
            {nonOwnerActive > 0 ? (
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-[color:var(--error-700)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--error-700)]">
                    Cannot delete — {nonOwnerActive} active member{nonOwnerActive > 1 ? "s" : ""} still in this organization.
                  </p>
                  <p className="text-xs text-[color:var(--error-700)]/80 mt-1">Remove all team members before deleting the organization.</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-[color:var(--error-700)] mb-1">Delete &ldquo;{org.name}&rdquo;?</p>
                <p className="text-xs text-[color:var(--error-700)]/80 mb-3">
                  {org.propertyIds.length > 0
                    ? `${org.propertyIds.length} linked propert${org.propertyIds.length > 1 ? "ies" : "y"} will become unassigned. `
                    : ""}
                  This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(org.id)}
                    className="px-4 py-1.5 rounded-lg bg-[color:var(--error)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-1.5 rounded-lg text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Solo plan gate for members */}
      {isSolo ? (
        <div className="bg-white rounded-2xl border border-[color:var(--line)] p-8 flex flex-col items-center text-center gap-3">
          <Users size={22} strokeWidth={1.75} className="text-[color:var(--muted)]" />
          <p className="font-semibold text-[color:var(--foreground)]">Team members require Growth plan</p>
          <p className="text-sm text-[color:var(--muted)] max-w-xs">Upgrade to invite admins, managers, caretakers and accountants.</p>
          <button className="mt-1 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-5 py-2 text-sm font-semibold text-white transition-colors">
            Upgrade to Growth
          </button>
        </div>
      ) : (
        <>
          {/* Members */}
          <div className="bg-white rounded-2xl border border-[color:var(--line)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--line)]">
              <div>
                <h3 className="font-semibold text-[color:var(--foreground)]">Team Members</h3>
                <p className="text-xs text-[color:var(--muted)] mt-0.5">{activeCount} active · {members.length} / {limits.maxMembers} seats used</p>
              </div>
              {atLimit ? (
                <span className="text-xs text-[color:var(--muted)] bg-[color:var(--background)] px-3 py-2 rounded-xl border border-[color:var(--line)]">
                  Seat limit reached · Upgrade to add more
                </span>
              ) : (
                <button
                  onClick={() => setShowInvite(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-xs font-semibold transition-colors"
                >
                  <UserPlus size={13} strokeWidth={2} /> Invite member
                </button>
              )}
            </div>

            {showInvite && (
              <div className="px-5 py-4 bg-[color:var(--background)] border-b border-[color:var(--line)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input placeholder="Full name" value={inviteName} onChange={e => setInviteName(e.target.value)} className={INP} />
                  <input type="email" placeholder="Email address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className={INP} />
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value as OrgRole)} className={INP}>
                    <option value="admin">Admin — full access, no billing</option>
                    <option value="manager">Manager — assigned properties</option>
                    <option value="accountant">Accountant — payments & reports</option>
                    <option value="caretaker">Caretaker — view only</option>
                  </select>
                </div>
                {inviteError && <p className="text-xs text-[color:var(--error-700)] bg-[color:var(--error-50)] rounded-lg px-3 py-2 mt-3">{inviteError}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={sendInvite} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-xs font-semibold transition-colors">
                    <Send size={12} strokeWidth={2} /> Send invite
                  </button>
                  <button onClick={() => { setShowInvite(false); setInviteError(null); }} className="px-4 py-2 rounded-xl text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[color:var(--muted)] border-b border-[color:var(--line)]">
                    <th className="text-left px-5 py-3 font-medium">Member</th>
                    <th className="text-left px-5 py-3 font-medium">Role</th>
                    <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Properties</th>
                    <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Joined</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--line)]">
                  {members.map(m => {
                    const isLastOwner = m.role === "owner" && ownerCount <= 1;
                    const expired = m.status === "invited" && !!m.invitedAt &&
                      (Date.now() - new Date(m.invitedAt).getTime()) > 7 * 24 * 60 * 60 * 1000;
                    const initials = m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={m.id} className="hover:bg-[color:var(--background)]/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar initials={initials} size="sm" />
                            <div className="min-w-0">
                              <p className="font-medium text-[color:var(--foreground)] truncate">{m.name}</p>
                              <p className="text-xs text-[color:var(--muted)] truncate">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><RoleChip role={m.role} /></td>
                        <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-[color:var(--muted)]">
                          {m.assignedProperties.length === 0 ? "All properties" : `${m.assignedProperties.length} assigned`}
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell text-xs text-[color:var(--muted)]">{m.joinedAt || "—"}</td>
                        <td className="px-5 py-3.5"><MemberStatusChip status={m.status} expired={expired} /></td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {m.status === "invited" && (
                            <button className="text-xs text-[color:var(--accent-500)] hover:underline mr-3">Resend</button>
                          )}
                          <button
                            disabled={isLastOwner}
                            onClick={() => removeMember(m.id)}
                            title={isLastOwner ? "Cannot remove the only owner" : "Remove from organization"}
                            className="text-xs text-[color:var(--error)] hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permission matrix */}
          <div className="bg-white rounded-2xl border border-[color:var(--line)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[color:var(--line)]">
              <h3 className="font-semibold text-[color:var(--foreground)]">Role Permissions</h3>
              <p className="text-xs text-[color:var(--muted)] mt-0.5">What each role can access in ShiftProof</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[color:var(--muted)] border-b border-[color:var(--line)]">
                    <th className="text-left px-5 py-3 font-medium">Permission</th>
                    {(["owner", "admin", "manager", "accountant", "caretaker"] as OrgRole[]).map(r => (
                      <th key={r} className="px-4 py-3 text-center"><RoleChip role={r} /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--line)]">
                  {(Object.keys(ROLE_PERMISSIONS.owner) as (keyof OrgPermissions)[]).map(perm => (
                    <tr key={perm} className="hover:bg-[color:var(--background)]/60">
                      <td className="px-5 py-3 text-[color:var(--foreground)] font-medium">{PERM_LABELS[perm]}</td>
                      {(["owner", "admin", "manager", "accountant", "caretaker"] as OrgRole[]).map(r => (
                        <td key={r} className="px-4 py-3 text-center">
                          {ROLE_PERMISSIONS[r][perm]
                            ? <CheckCircle2 size={14} strokeWidth={2} className="text-[color:var(--success)] mx-auto" />
                            : <span className="block w-3.5 h-0.5 bg-slate-200 mx-auto rounded-full" />
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── OrgTree — React Flow + dagre org chart ──────────────────────────────────

// Node dimensions used by dagre for layout calculation
const ND = {
  "org-n":  { w: 210, h: 132 },
  "prop-n": { w: 180, h: 120 },
  "flr-n":  { w: 152, h: 106 },
  "room-n": { w: 130, h:  92 },
} as const;

// ── invisible handle style (we only need them for edge routing) ──
const HS = { background: "transparent", border: "none", width: 1, height: 1, minWidth: 1, minHeight: 1 };

type NData = {
  label: string; sub?: string; badge?: string;
  image?: string; initials?: string; floorNum?: number;
  occupied?: boolean; hasProfile?: boolean; isExp?: boolean;
  onPress?: () => void;
  onView?: () => void;
};

const _NOOP       = () => {};
const _EDGE_STYLE = { stroke: "#7c3aed", strokeWidth: 2 };
const _ARROW_END  = { type: MarkerType.ArrowClosed, color: "#7c3aed", width: 16, height: 16 };

// ── Custom node components — defined at module level to prevent re-creation ──

function OrgN({ data }: { data: NData }) {
  return (
    <div style={{ width: ND["org-n"].w, background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)" }}
      className="relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl cursor-pointer shadow-lg hover:shadow-xl transition-shadow select-none">
      <Handle type="target" position={Position.Top} isConnectable={false} style={HS} />
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rotate-45 rounded-sm"
        style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8)", boxShadow: "0 2px 8px #7c3aed66" }} />
      {data.image
        ? <img src={data.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 ring-2 ring-white/30" />
        : <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center text-sm font-bold shrink-0">{data.initials}</div>
      }
      <div className="text-center">
        <p className="text-[11px] font-bold text-white leading-snug truncate">{data.label}</p>
        {data.sub && <p className="text-[10px] text-violet-200 mt-0.5 capitalize truncate">{data.sub}</p>}
      </div>
      {data.onView && (
        <button onClick={e => { e.stopPropagation(); data.onView!(); }}
          className="flex items-center gap-1 text-[9px] font-bold text-white bg-white/20 hover:bg-white/35 px-3 py-1 rounded-full transition-colors mt-0.5 border border-white/20">
          View Details <ChevronRight size={8} />
        </button>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={HS} />
    </div>
  );
}

function PropN({ data }: { data: NData }) {
  return (
    <div style={{ width: ND["prop-n"].w, background: "linear-gradient(135deg,#0d9488 0%,#0284c7 100%)" }}
      className="flex flex-col px-3.5 py-3 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-shadow select-none">
      <Handle type="target" position={Position.Top} isConnectable={false} style={HS} />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Building2 size={13} className="text-white" />
        </div>
        <p className="text-[11px] font-bold text-white leading-snug truncate flex-1">{data.label}</p>
        <ChevronDown size={12} className={`text-white/70 shrink-0 transition-transform duration-200 ${data.isExp ? "rotate-180" : ""}`} />
      </div>
      {data.sub   && <p className="text-[10px] text-teal-100 leading-none truncate mb-1">{data.sub}</p>}
      {data.badge && <span className="self-start px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-semibold text-white">{data.badge}</span>}
      {data.onView && (
        <button onClick={e => { e.stopPropagation(); data.onView!(); }}
          className="self-start mt-2 flex items-center gap-1 text-[9px] font-bold text-white bg-white/20 hover:bg-white/35 px-2.5 py-0.5 rounded-full transition-colors border border-white/20">
          View <ChevronRight size={8} />
        </button>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={HS} />
    </div>
  );
}

function FlrN({ data }: { data: NData }) {
  return (
    <div style={{ width: ND["flr-n"].w, background: "linear-gradient(135deg,#4338ca 0%,#6366f1 100%)" }}
      className="flex flex-col px-3 py-2.5 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-shadow select-none">
      <Handle type="target" position={Position.Top} isConnectable={false} style={HS} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md bg-white/25 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
          {data.floorNum}
        </div>
        <p className="text-[11px] font-bold text-white leading-snug flex-1 truncate">{data.label}</p>
        <ChevronDown size={12} className={`text-white/70 shrink-0 transition-transform duration-200 ${data.isExp ? "rotate-180" : ""}`} />
      </div>
      {data.badge && <p className="text-[9px] text-indigo-200 truncate mb-1">{data.badge}</p>}
      {data.onView && (
        <button onClick={e => { e.stopPropagation(); data.onView!(); }}
          className="self-start flex items-center gap-1 text-[9px] font-bold text-white bg-white/20 hover:bg-white/35 px-2.5 py-0.5 rounded-full transition-colors border border-white/20">
          View <ChevronRight size={8} />
        </button>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={HS} />
    </div>
  );
}

function RoomN({ data }: { data: NData }) {
  const initials = data.occupied
    ? data.label.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";
  return (
    <div style={{ width: ND["room-n"].w }}
      className={`flex flex-col px-3 py-2 rounded-xl cursor-pointer transition-all select-none ${
        data.occupied
          ? "bg-white border-2 border-emerald-300 shadow hover:shadow-md hover:border-emerald-400"
          : "bg-slate-50 border-2 border-dashed border-slate-300 hover:bg-slate-100"
      }`}>
      <Handle type="target" position={Position.Top} isConnectable={false} style={HS} />
      <div className="flex items-center gap-2 mb-1">
        {data.occupied
          ? <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-extrabold shrink-0 ring-2 ring-emerald-200">{initials}</div>
          : <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0"><Home size={12} className="text-slate-400" /></div>
        }
        <div className="min-w-0">
          <p className={`text-[10px] font-semibold leading-tight truncate ${data.occupied ? "text-slate-800" : "text-slate-400"}`}>{data.label}</p>
          {data.sub && <p className="text-[9px] text-slate-400 leading-tight truncate">{data.sub}</p>}
        </div>
      </div>
      {data.onView && (
        <button onClick={e => { e.stopPropagation(); data.onView!(); }}
          className={`self-start flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full transition-colors border ${
            data.hasProfile
              ? "text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200"
              : data.occupied
                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                : "text-slate-500 bg-slate-100 hover:bg-slate-200 border-slate-200"
          }`}>
          {data.hasProfile ? "Profile" : "Details"} <ChevronRight size={8} />
        </button>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={HS} />
    </div>
  );
}

const ORG_NODE_TYPES = { "org-n": OrgN, "prop-n": PropN, "flr-n": FlrN, "room-n": RoomN };

// ── dagre auto-layout ──
function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 32, marginx: 56, marginy: 56 });
  nodes.forEach(n => {
    const d = ND[n.type as keyof typeof ND] ?? { w: 160, h: 72 };
    g.setNode(n.id, { width: d.w, height: d.h });
  });
  edges.forEach(e => g.setEdge(e.source, e.target));
  Dagre.layout(g);
  return nodes.map(n => {
    const pos = g.node(n.id);
    const d = ND[n.type as keyof typeof ND] ?? { w: 160, h: 72 };
    return { ...n, position: { x: pos.x - d.w / 2, y: pos.y - d.h / 2 } };
  });
}

type NavTarget = { tab: string; propId?: string; tenantId?: string };

function OrgTree({ org, onNavigate }: { org: Organization; onNavigate: (t: NavTarget) => void }) {
  const [xProps,   setXProps]   = React.useState<Set<string>>(() => new Set(org.propertyIds));
  const [xFloors,  setXFloors]  = React.useState<Set<string>>(() => new Set());

  type SelNode = { id: string; label: string; sub?: string; badge?: string; type: string; occupied?: boolean };
  const [selected, setSelected] = React.useState<SelNode | null>(null);

  const propIds    = org.propertyIds.join(",");
  const properties = PROPERTIES.filter(p => org.propertyIds.includes(p.id));

  // Stable lookups keyed on org.propertyIds so they refresh if properties are added/removed
  const propById  = React.useMemo(() => new Map(properties.map(p => [p.id, p])), [propIds]);
  const floorById = React.useMemo(() => {
    const m = new Map<string, { fl: { id: string; label: string; roomIds: string[] }; fi: number; propId: string }>();
    for (const [pid, floors] of Object.entries(PROPERTY_FLOORS))
      floors.forEach((fl, fi) => m.set(fl.id, { fl, fi, propId: pid }));
    return m;
  }, []);

  // Helpers — ids of all floors/rooms under a property (used to clear stale selection)
  function childIdsOfProp(pid: string): Set<string> {
    const ids = new Set<string>();
    for (const fl of PROPERTY_FLOORS[pid] ?? []) {
      ids.add(fl.id);
      fl.roomIds.forEach(r => ids.add(r));
    }
    return ids;
  }
  function childIdsOfFloor(flId: string): Set<string> {
    const entry = floorById.get(flId);
    const ids = new Set<string>();
    if (entry) entry.fl.roomIds.forEach(r => ids.add(r));
    return ids;
  }

  // All click logic lives here — React Flow calls this reliably regardless of elementsSelectable
  function handleNodeClick(_: React.MouseEvent, node: Node) {
    const id = node.id;

    // Org node — select only
    if (id === org.id) {
      setSelected(p => p?.id === id ? null : { id, label: org.name, sub: `${org.type} · ${org.plan} plan`, type: "org" });
      return;
    }

    // Property node — toggle expand; if collapsing clear any selected floor/room beneath it
    const prop = propById.get(id);
    if (prop) {
      const expanding = !xProps.has(id);
      setXProps(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
      if (!expanding) {
        // Collapsing: clear selected if it was a floor or room under this property
        const childIds = childIdsOfProp(id);
        setSelected(p => (p && childIds.has(p.id)) ? null : p);
        // Also clear the xFloors entries for floors under this prop to avoid ghost expansion next open
        setXFloors(s => {
          const n = new Set(s);
          for (const fl of PROPERTY_FLOORS[id] ?? []) n.delete(fl.id);
          return n;
        });
      }
      setSelected(p => p?.id === id ? null : { id, label: prop.name, sub: prop.address.split(",")[0], badge: `${prop.occupied}/${prop.beds} beds`, type: "property" });
      return;
    }

    // Floor node — toggle expand; if collapsing clear selected rooms beneath it
    const flEntry = floorById.get(id);
    if (flEntry) {
      const { fl } = flEntry;
      const rooms   = fl.roomIds.map(rid => ROOM_BY_ID[rid]).filter(Boolean);
      const occ     = rooms.filter(r => r.status === "occupied").length;
      const expanding = !xFloors.has(id);
      setXFloors(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
      if (!expanding) {
        const childIds = childIdsOfFloor(id);
        setSelected(p => (p && childIds.has(p.id)) ? null : p);
      }
      setSelected(p => p?.id === id ? null : { id, label: fl.label, badge: `${occ}/${rooms.length} occupied`, type: "floor" });
      return;
    }

    // Room node — select only
    const rm = ROOM_BY_ID[id];
    if (rm) {
      setSelected(p => p?.id === id ? null : { id, label: rm.tenant ?? "Vacant", sub: `Rm ${rm.number} · ${rm.type}`, type: "room", occupied: rm.status === "occupied" });
    }
  }

  // Build nodes + edges — all interaction via onNodeClick; View buttons use onView
  const rawNodes: Node[] = [];
  const rawEdges: Edge[] = [];

  rawNodes.push({
    id: org.id, type: "org-n", position: { x: 0, y: 0 },
    data: {
      label: org.name, sub: `${org.type} · ${org.plan} plan`,
      image: org.image, initials: org.logoInitials,
      onView: () => onNavigate({ tab: "organization" }),
    } as NData,
  });

  for (const prop of properties) {
    const propExp = xProps.has(prop.id);
    rawNodes.push({
      id: prop.id, type: "prop-n", position: { x: 0, y: 0 },
      data: {
        label: prop.name, sub: prop.address.split(",")[0],
        badge: `${prop.occupied}/${prop.beds} beds`, isExp: propExp,
        onView: () => onNavigate({ tab: "properties", propId: prop.id }),
      } as NData,
    });
    rawEdges.push({ id: `e-${org.id}-${prop.id}`, source: org.id, target: prop.id, style: _EDGE_STYLE, markerEnd: _ARROW_END });

    if (propExp) {
      (PROPERTY_FLOORS[prop.id] ?? []).forEach((fl, fi) => {
        const rooms = fl.roomIds.map(rid => ROOM_BY_ID[rid]).filter(Boolean);
        const occ   = rooms.filter(r => r.status === "occupied").length;
        const flExp = xFloors.has(fl.id);
        rawNodes.push({
          id: fl.id, type: "flr-n", position: { x: 0, y: 0 },
          data: {
            label: fl.label, badge: `${occ}/${rooms.length} occ`, floorNum: fi + 1, isExp: flExp,
            onView: () => onNavigate({ tab: "properties", propId: prop.id }),
          } as NData,
        });
        rawEdges.push({ id: `e-${prop.id}-${fl.id}`, source: prop.id, target: fl.id, style: _EDGE_STYLE, markerEnd: _ARROW_END });

        if (flExp) {
          rooms.forEach(rm => {
            const tenantId = rm.tenant ? TENANT_BY_NAME[rm.tenant] : undefined;
            rawNodes.push({
              id: rm.id, type: "room-n", position: { x: 0, y: 0 },
              data: {
                label: rm.tenant ?? "Vacant", sub: `Rm ${rm.number} · ${rm.type}`,
                occupied: rm.status === "occupied",
                hasProfile: !!tenantId,
                onView: tenantId
                  ? () => onNavigate({ tab: "tenants", tenantId })
                  : () => onNavigate({ tab: "properties", propId: prop.id }),
              } as NData,
            });
            rawEdges.push({ id: `e-${fl.id}-${rm.id}`, source: fl.id, target: rm.id, style: _EDGE_STYLE, markerEnd: _ARROW_END });
          });
        }
      });
    }
  }

  const layoutedNodes = applyDagreLayout(rawNodes, rawEdges);

  // key forces ReactFlow to remount (re-runs fitView) whenever the tree shape changes
  const rfKey = [...xProps].sort().join(",") + "|" + [...xFloors].sort().join(",");

  return (
    <div className="bg-white rounded-2xl border border-[color:var(--line)] p-6">
      <p className="font-semibold text-sm text-[color:var(--foreground)] mb-2">Organization hierarchy</p>
      <p className="text-xs text-[color:var(--muted)] mb-4">
        Click <span className="text-teal-600 font-semibold">property</span> or <span className="text-indigo-600 font-semibold">floor</span> nodes to expand · scroll/pinch to zoom
      </p>

      <div className="rounded-xl overflow-hidden border border-[color:var(--line)]" style={{ height: 520, width: "100%" }}>
        <ReactFlow
          key={rfKey}
          nodes={layoutedNodes}
          edges={rawEdges}
          nodeTypes={ORG_NODE_TYPES}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#ede9fe" gap={24} size={1} />
        </ReactFlow>
      </div>

      {selected && (
        <div className="mt-3 flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-[color:var(--line)]">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
            selected.type === "org"        ? "bg-violet-500"
            : selected.type === "property" ? "bg-teal-500"
            : selected.type === "floor"    ? "bg-indigo-500"
            : selected.occupied            ? "bg-emerald-500"
            :                               "bg-slate-300"
          }`} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[color:var(--foreground)] truncate">{selected.label}</p>
            {selected.badge && <p className="text-[11px] text-[color:var(--muted)] mt-0.5">{selected.badge}</p>}
            {selected.sub   && <p className="text-[11px] text-[color:var(--muted)]">{selected.sub}</p>}
            <p className="text-[10px] text-slate-400 mt-1 capitalize">
              {selected.type}{selected.type === "room" && !selected.occupied ? " · Vacant" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OrganizationTab — multi-org management ───────────────────────────────────

function OrganizationTab({ onNavigate }: { onNavigate: (t: NavTarget) => void }) {
  const [orgs, setOrgs]           = React.useState<Organization[]>(MOCK_ORGS);
  const [activeOrgId, setActiveOrgId] = React.useState<string | null>(
    MOCK_ORGS.length > 0 ? MOCK_ORGS[0].id : null
  );
  const [showCreate, setShowCreate] = React.useState(false);
  const [view, setView]            = React.useState<"details" | "tree">("details");

  // Create-form state
  const [cName,    setCName]    = React.useState("");
  const [cType,    setCType]    = React.useState<Organization["type"]>("individual");
  const [cAddress, setCAddress] = React.useState("");
  const [cCity,    setCCity]    = React.useState("");
  const [cPhone,   setCPhone]   = React.useState("");
  const [cEmail,   setCEmail]   = React.useState("");
  const [cGstin,   setCGstin]   = React.useState("");
  const [cWebsite, setCWebsite] = React.useState("");
  const [cError,   setCError]   = React.useState<string | null>(null);

  const activeOrg = orgs.find(o => o.id === activeOrgId) ?? null;

  function handleDelete(id: string) {
    const remaining = orgs.filter(o => o.id !== id);
    setOrgs(remaining);
    setActiveOrgId(remaining.length > 0 ? remaining[0].id : null);
  }

  function openCreate() {
    setShowCreate(true);
    setActiveOrgId(null);
  }

  function cancelCreate() {
    setShowCreate(false);
    setCName(""); setCType("individual"); setCAddress(""); setCCity("");
    setCPhone(""); setCEmail(""); setCGstin(""); setCWebsite(""); setCError(null);
    if (orgs.length > 0) setActiveOrgId(orgs[0].id);
  }

  function submitCreate() {
    if (!cName.trim())    { setCError("Organization name is required."); return; }
    if (!cAddress.trim()) { setCError("Address is required."); return; }
    if (!cCity.trim())    { setCError("City is required."); return; }
    if (!cPhone.trim())   { setCError("Phone is required."); return; }
    if (!ORG_EMAIL_RE.test(cEmail.trim())) { setCError("A valid email is required."); return; }
    if (cGstin.trim() && !GSTIN_RE.test(cGstin.trim().toUpperCase())) {
      setCError("GSTIN must be 15 characters in the format: 22AAAAA0000A1Z5"); return;
    }
    if (orgs.some(o => o.name.toLowerCase() === cName.trim().toLowerCase())) {
      setCError("An organization with this name already exists."); return;
    }

    const initials = cName.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const today    = new Date().toISOString().slice(0, 10);
    const newOrg: Organization = {
      id: `org${Date.now()}`,
      name: cName.trim(),
      type: cType,
      address: cAddress.trim(),
      city: cCity.trim(),
      phone: cPhone.trim(),
      email: cEmail.trim().toLowerCase(),
      ...(cGstin.trim()   ? { gstin: cGstin.trim().toUpperCase() }   : {}),
      ...(cWebsite.trim() ? { website: cWebsite.trim() }             : {}),
      logoInitials: initials,
      plan: "growth",
      propertyIds: [],
      ownerId: "o1",
      createdAt: today,
      members: [{
        id: `m${Date.now()}`,
        name: OWNER.name,
        email: "ravi@shiftproof.app",
        role: "owner",
        assignedProperties: [],
        status: "active",
        joinedAt: today,
      }],
    };

    setOrgs(prev => [...prev, newOrg]);
    setActiveOrgId(newOrg.id);
    setShowCreate(false);
    setCName(""); setCType("individual"); setCAddress(""); setCCity("");
    setCPhone(""); setCEmail(""); setCGstin(""); setCWebsite(""); setCError(null);
  }

  const INP = "w-full px-3 py-2.5 rounded-xl border border-[color:var(--line)] text-sm bg-white outline-none focus:border-[color:var(--accent-500)] focus:ring-2 focus:ring-[color:var(--accent-50)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]";

  return (
    <div className="space-y-5">

      {/* Header row: org selector pills + New org button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {orgs.map(o => (
            <button
              key={o.id}
              onClick={() => { setActiveOrgId(o.id); setShowCreate(false); }}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeOrgId === o.id && !showCreate
                  ? "bg-[color:var(--accent-500)] text-white"
                  : "bg-white border border-[color:var(--line)] text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:border-[color:var(--accent-200)]"
              }`}
            >
              {o.name}
            </button>
          ))}
          {orgs.length === 0 && !showCreate && (
            <span className="text-sm text-[color:var(--muted)]">No organizations yet.</span>
          )}
        </div>
        <button
          onClick={showCreate ? cancelCreate : openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[color:var(--line)] text-xs font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:border-[color:var(--accent-500)] transition-colors whitespace-nowrap"
        >
          {showCreate ? <X size={13} /> : <Plus size={13} />}
          {showCreate ? "Cancel" : "New organization"}
        </button>
      </div>

      {/* Create organization form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-[color:var(--line)] p-6">
          <h3 className="font-semibold text-[color:var(--foreground)] mb-1">Create organization</h3>
          <p className="text-xs text-[color:var(--muted)] mb-5">Your brand identity in ShiftProof. You can have multiple organizations under one account.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[color:var(--muted)]">Organization / brand name <span className="text-[color:var(--error)]">*</span></label>
              <input placeholder="e.g. Nova Stays, Sharma Properties" value={cName} onChange={e => setCName(e.target.value)} className={INP} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[color:var(--muted)]">Type <span className="text-[color:var(--error)]">*</span></label>
              <select value={cType} onChange={e => setCType(e.target.value as Organization["type"])} className={INP}>
                <option value="individual">Individual / Proprietorship</option>
                <option value="firm">Partnership Firm / LLP</option>
                <option value="company">Private Limited / Company</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[color:var(--muted)]">City <span className="text-[color:var(--error)]">*</span></label>
              <input placeholder="e.g. Pune, Bangalore" value={cCity} onChange={e => setCCity(e.target.value)} className={INP} />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[color:var(--muted)]">Registered address <span className="text-[color:var(--error)]">*</span></label>
              <input placeholder="Street, area, landmark" value={cAddress} onChange={e => setCAddress(e.target.value)} className={INP} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[color:var(--muted)]">Contact phone <span className="text-[color:var(--error)]">*</span></label>
              <input placeholder="+91 98765 43210" value={cPhone} onChange={e => setCPhone(e.target.value)} className={INP} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[color:var(--muted)]">Contact email <span className="text-[color:var(--error)]">*</span></label>
              <input type="email" placeholder="ops@yourbrand.in" value={cEmail} onChange={e => setCEmail(e.target.value)} className={INP} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[color:var(--muted)]">GSTIN <span className="text-[color:var(--muted)] font-normal">(optional)</span></label>
              <input placeholder="22AAAAA0000A1Z5" maxLength={15} value={cGstin} onChange={e => setCGstin(e.target.value.toUpperCase())} className={`${INP} font-mono`} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[color:var(--muted)]">Website <span className="text-[color:var(--muted)] font-normal">(optional)</span></label>
              <input placeholder="https://yourbrand.in" value={cWebsite} onChange={e => setCWebsite(e.target.value)} className={INP} />
            </div>
          </div>

          {cError && (
            <p className="text-xs text-[color:var(--error-700)] bg-[color:var(--error-50)] rounded-lg px-3 py-2 mt-4">{cError}</p>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={submitCreate}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-sm font-semibold transition-colors"
            >
              <Landmark size={14} strokeWidth={2} /> Create organization
            </button>
            <button
              onClick={cancelCreate}
              className="px-5 py-2.5 rounded-xl text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View toggle — Details / Tree */}
      {activeOrg && !showCreate && (
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {(["details", "tree"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                view === v
                  ? "bg-white text-[color:var(--foreground)] shadow-sm"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              {v === "tree" ? "Org Tree" : "Details"}
            </button>
          ))}
        </div>
      )}

      {/* Active org detail */}
      {activeOrg && !showCreate && view === "details" && (
        <OrgDetail key={activeOrg.id} org={activeOrg} onDelete={handleDelete} />
      )}

      {/* Org tree view */}
      {activeOrg && !showCreate && view === "tree" && (
        <OrgTree key={activeOrg.id} org={activeOrg} onNavigate={onNavigate} />
      )}

      {/* Empty state */}
      {orgs.length === 0 && !showCreate && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center bg-white rounded-2xl border border-[color:var(--line)]">
          <div className="w-14 h-14 rounded-2xl bg-[color:var(--background)] flex items-center justify-center">
            <Landmark size={24} strokeWidth={1.5} className="text-[color:var(--muted)]" />
          </div>
          <div>
            <p className="font-semibold text-[color:var(--foreground)]">No organizations yet</p>
            <p className="text-sm text-[color:var(--muted)] mt-1 max-w-xs">Create an organization to manage your brand, properties, and team under one roof.</p>
          </div>
          <button
            onClick={openCreate}
            className="mt-1 flex items-center gap-2 rounded-full bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Create organization
          </button>
        </div>
      )}

    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── Search overlay ──────────────────────────────────────────────────────────

const SEARCH_INDEX = [
  ...PROPERTIES.map(p => ({ type: "Property", label: p.name, sub: p.address, nav: "properties" })),
  ...TENANTS.map(t  => ({ type: "Tenant",   label: t.name,  sub: `${t.property} · Room ${t.room}`, nav: "tenants" })),
  ...MAINTENANCE.map(m => ({ type: "Ticket", label: m.title, sub: `${m.property} · ${m.status}`, nav: "maintenance" })),
  { type: "Organization", label: CURRENT_ORG.name, sub: `${CURRENT_ORG.members.length} members · ${CURRENT_ORG.plan} plan`, nav: "organization" },
  ...CURRENT_ORG.members.map(m => ({ type: "Member", label: m.name, sub: `${m.role} · ${m.email}`, nav: "organization" })),
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
  const [deepPropId,    setDeepPropId]    = useState<string | null>(null);
  const [deepTenantId,  setDeepTenantId]  = useState<string | null>(null);
  // Incremented each time a deep-nav fires so the target tab remounts with fresh initialId
  const [deepPropVer,   setDeepPropVer]   = useState(0);
  const [deepTenantVer, setDeepTenantVer] = useState(0);

  // Nav initiated by the user (sidebar / search / notifs) — clears any deep link
  function navTo(tab: string) {
    setDeepPropId(null);
    setDeepTenantId(null);
    setActiveNav(tab);
  }

  // Nav from OrgTree View buttons — carries a deep link to open a specific entity
  function handleDeepNav({ tab, propId, tenantId }: NavTarget) {
    if (propId !== undefined)   { setDeepPropId(propId);     setDeepPropVer(v => v + 1); }
    if (tenantId !== undefined) { setDeepTenantId(tenantId); setDeepTenantVer(v => v + 1); }
    setActiveNav(tab);
  }

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

        {/* Org logo */}
        <div className={`mb-8 flex items-center gap-3 ${settings.sidebarCollapsed ? "justify-center px-0" : "px-5"}`}>
          {CURRENT_ORG.image ? (
            <img src={CURRENT_ORG.image} alt={CURRENT_ORG.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[color:var(--accent-500)] flex items-center justify-center text-xs font-bold text-white shrink-0 select-none tracking-wide">
              {CURRENT_ORG.logoInitials}
            </div>
          )}
          {!settings.sidebarCollapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm text-white tracking-tight truncate leading-snug">{CURRENT_ORG.name}</p>
              <p className="text-[10px] text-white/30 leading-snug">via ShiftProof</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { navTo(item.id); setSidebarOpen(false); }}
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
            onClick={() => { navTo("account"); setSidebarOpen(false); }}
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
              {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} onNav={(id) => { navTo(id); setNotifOpen(false); }} />}
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
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onNav={(id) => { navTo(id); }} />}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeNav === "overview"      && <OverviewTab />}
          {activeNav === "properties"    && <PropertiesTab key={deepPropVer}   initialPropId={deepPropId} />}
          {activeNav === "tenants"       && <TenantsTab   key={deepTenantVer} initialTenantId={deepTenantId} onNav={navTo} />}
          {activeNav === "payments"      && <PaymentsTab />}
          {activeNav === "maintenance"   && <MaintenanceTab />}
          {activeNav === "reports"       && <ReportsTab />}
          {activeNav === "organization"  && <OrganizationTab onNavigate={handleDeepNav} />}
          {activeNav === "account"       && <AccountTab />}
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => navTo("properties")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white rounded-full shadow-xl flex items-center justify-center transition-colors z-50 lg:flex hidden"
        title="Add Property"
      >
        <Plus size={22} strokeWidth={2} />
      </button>
    </div>
  );
}

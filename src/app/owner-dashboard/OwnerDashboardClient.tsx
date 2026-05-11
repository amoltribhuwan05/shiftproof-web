"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PhoneInput from "@/components/PhoneInput";
import {
  LayoutDashboard, Building2, Users, CreditCard, Wrench, BarChart3,
  Bell, Search, Settings, Plus, LogOut, Menu, X,
  TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle2,
  ChevronRight, Download, IndianRupee, BedDouble, Home,
  ArrowLeft, MapPin, Edit3, Camera, Wifi, Car, Dumbbell, Phone, Mail,
  ChevronDown, FileText, CalendarDays, Banknote, UserX, ShieldCheck,
  User, Lock, Smartphone, ToggleLeft, ToggleRight, Landmark, Trash2, Eye, EyeOff, MessageSquare,
  Globe, UserPlus, Send, Wallet, ArrowRightLeft, Link2, Upload, ImagePlus,
  RefreshCw, Star, ExternalLink, ShieldAlert,
} from "lucide-react";
import {
  type OrgRole, type OrgMember, type OrgPermissions, type Organization,
  ROLE_PERMISSIONS, PLAN_LIMITS,
} from "@/lib/orgTypes";
import { signOut, GoogleAuthProvider, linkWithPopup, PhoneAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api, ApiError, type AppUser, type Property, type Room as ApiRoom, type Payment as ApiPayment, type PaymentSummary, type Notification as ApiNotification, type Tenant as ApiTenant, type PropertyReport, type RevenueChartPoint, type MaintenanceRequest as ApiMaintenanceRequest, type Organization as ApiOrganization, type OrgMember as ApiOrgMember } from "@/lib/api";
import {
  ReactFlow, Handle, Position, MarkerType, Background,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";

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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={22} className="text-red-400" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">An unexpected error occurred. Try refreshing the page.</p>
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

// ─── Display-only config (not shared data) ────────────────────────────────────

// (KPI and other constants moved inside component to be dynamic)

const CHART_MONTHS = [
  { label: "Nov", val: 62 }, { label: "Dec", val: 48 }, { label: "Jan", val: 71 },
  { label: "Feb", val: 55 }, { label: "Mar", val: 88 }, { label: "Apr", val: 75 },
];

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
  { id: "payouts",       label: "Payouts",       icon: Wallet },
  { id: "maintenance",   label: "Maintenance",   icon: Wrench },
  { id: "reports",       label: "Reports",       icon: BarChart3 },
  { id: "organization",  label: "Organization",  icon: Landmark },
];

// ─── API → display mappers ─────────────────────────────────────────────────────

type TxItem = {
  id: string;
  name: string;
  initials: string;
  property: string;
  amount: string;
  date: string;
  status: string;
};

type AlertItem = {
  type: "error" | "warning" | "trust";
  icon: React.ElementType;
  title: string;
  action: string;
};

type KpiItem = {
  label: string;
  value: string;
  sub: string;
  up?: boolean;
  icon: React.ElementType;
  color: string;
};

type GlanceItem = {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
};

type FinancialItem = {
  label: string;
  value: string;
  color: string;
};

type DashStats = {
  kpi: KpiItem[];
  atAGlance: GlanceItem[];
  financials: FinancialItem[];
  alerts: AlertItem[];
};

type OwnerInfo = {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl: string;
  properties: number;
  beds: number;
};

function mapApiPaymentToTx(p: ApiPayment): TxItem {
  return {
    id:       p.id,
    name:     p.tenantName,
    initials: p.tenantName.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase(),
    property: p.description || p.type,
    amount:   `₹${p.amount.toLocaleString("en-IN")}`,
    date:     p.date,
    status:   p.status === "checkout_created" || p.status === "processing" ? "pending" : p.status,
  };
}

type NotifItem = { id: string; type: string; title: string; body: string; time: string; read: boolean; nav: string };

function mapApiNotif(n: ApiNotification): NotifItem {
  const navMap: Record<string, string> = {
    rentDue: "payments", maintenance: "maintenance", leaseRenewal: "tenants",
    message: "overview", general: "overview",
  };
  const typeMap: Record<string, string> = {
    rentDue: "warning", maintenance: "info", leaseRenewal: "warning",
    message: "info", general: "info",
  };
  const ts = new Date(n.timestamp);
  const diffH = Math.floor((Date.now() - ts.getTime()) / 3_600_000);
  const diffD = Math.floor(diffH / 24);
  const time = diffH < 24 ? `${diffH}h ago` : diffD < 7 ? `${diffD}d ago` : ts.toLocaleString("en-IN", { month: "short", day: "numeric" });
  return {
    id:   n.id,
    type: typeMap[n.type] ?? "info",
    title: n.title,
    body:  n.description,
    time,
    read: n.isRead,
    nav:  navMap[n.type] ?? "overview",
  };
}

// ─── Tab sections ─────────────────────────────────────────────────────────────

function OverviewTab({ stats, transactions, chartPoints }: { stats: DashStats; transactions: TxItem[]; chartPoints?: RevenueChartPoint[] | null }) {
  const { kpi, atAGlance, alerts } = stats;

  const displayChart = (() => {
    if (chartPoints && chartPoints.length > 0) {
      const maxVal = Math.max(...chartPoints.map(p => p.collected), 1);
      return chartPoints.map((p, i) => ({
        label: new Date(p.month + "-01").toLocaleString("default", { month: "short" }),
        val: Math.round((p.collected / maxVal) * 85) + 5,
        isLast: i === chartPoints.length - 1,
      }));
    }
    return CHART_MONTHS.map((m, i) => ({ ...m, isLast: i === CHART_MONTHS.length - 1 }));
  })();
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpi.map((k: KpiItem) => (
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
        {alerts.map((a) => (
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
            {displayChart.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-t-lg transition-colors ${
                    m.isLast
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
            {atAGlance.map((g: GlanceItem) => (
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
              {transactions.map((tx) => (
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

type InnerTab = "details" | "photos" | "rooms" | "tenants" | "maintenance";

function ManagePropertyView({ property, onBack }: { property: Property; onBack: () => void }) {
  const toast = useToast();
  const [innerTab, setInnerTab] = useState<InnerTab>("details");
  const [saving, setSaving] = useState(false);

  // Details form state
  const [form, setForm] = useState({
    name: property.title, address: property.location,
    rent: String(property.price), deposit: String(property.deposit),
    advance: "1", noticeDays: "30", checkIn: "10:00 AM",
    gender: property.gender === "Co-ed" ? "Co-ed" : property.gender === "Female" ? "Female Only" : "Male Only",
    type: property.type, visitorPolicy: "Allowed till 9 PM", food: "Optional meals",
  });
  const upd = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Amenities
  const [amenities, setAmenities] = useState<Set<string>>(new Set(property.amenities ?? []));
  const toggleAmenity = (label: string) =>
    setAmenities((prev) => { const s = new Set(prev); s.has(label) ? s.delete(label) : s.add(label); return s; });

  // Rooms — fetched from API
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  useEffect(() => {
    api.rooms.list(property.id).then(setRooms).catch(() => {});
  }, [property.id]);

  const vacantRooms = rooms.filter(r => r.isAvailable);

  // Tenants — fetched from API
  const [propertyTenants, setPropertyTenants] = useState<ApiTenant[]>([]);
  const [tenantFilter, setTenantFilter] = useState<"all" | "active" | "notice">("all");
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);
  const [removingTenantId, setRemovingTenantId] = useState<string | null>(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    roomId: "", rentAmount: String(property.price),
    leaseStart: "", leaseEnd: "", email: "", phone: "",
  });
  useEffect(() => {
    api.tenants.list(property.id).then(r => setPropertyTenants(r.data)).catch(() => {});
  }, [property.id]);
  const filteredTenants = propertyTenants.filter((t) => {
    if (tenantFilter === "notice") return t.status === "pending";
    if (tenantFilter === "active") return t.status === "active";
    return true;
  });

  // Maintenance — fetched from API
  const [allTickets, setAllTickets] = useState<ApiMaintenanceRequest[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [mFilter, setMFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, ApiMaintenanceRequest["status"]>>({});
  const [noteText, setNoteText] = useState("");
  useEffect(() => {
    api.maintenance.list(property.id, { limit: 50 }).then(r => setAllTickets(r.data)).catch(() => {});
  }, [property.id]);
  const filteredTickets = allTickets.filter(m => mFilter === "all" || m.status === mFilter);

  // Privacy
  const [isPrivate, setIsPrivate] = useState(false);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);
  useEffect(() => {
    api.properties.getPrivacy(property.id).then(r => setIsPrivate(r.isPrivate)).catch(() => {});
  }, [property.id]);
  async function togglePrivacy() {
    setTogglingPrivacy(true);
    try {
      const r = await api.properties.updatePrivacy(property.id, !isPrivate);
      setIsPrivate(r.isPrivate);
      toast.success(r.isPrivate ? "Property set to private" : "Property set to public");
    } catch {
      toast.error("Failed to update visibility");
    } finally {
      setTogglingPrivacy(false);
    }
  }

  // Photos — from API property images
  const [gallery, setGallery] = useState(property.images ?? []);
  const [coverImageId, setCoverImageId] = useState(property.images?.[0]?.id ?? "");
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null);

  const revenue = rooms.filter(r => !r.isAvailable).reduce((s, r) => s + r.rentAmount, 0);
  const openTickets = allTickets.filter(m => m.status !== "resolved").length;

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
        {property.imageUrl && <img src={property.imageUrl} alt={property.title} className="absolute inset-0 w-full h-full object-cover" />}
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
          </div>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Monthly Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "accent" },
          { label: "Occupancy",       value: `${Math.round((rooms.filter(r=>!r.isAvailable).length / Math.max(rooms.length,1)) * 100)}%`, icon: BedDouble, color: "trust" },
          { label: "Vacant Rooms",    value: String(rooms.filter(r=>r.isAvailable).length), icon: Home, color: "muted" },
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
                      <input defaultValue="" placeholder="+91 98765 00000" className="text-sm bg-transparent outline-none w-full" />
                    </div>
                    <div className="flex items-center gap-2 border border-[color:var(--line)] rounded-xl px-3 py-2.5 bg-[color:var(--background)] flex-1">
                      <Mail size={13} className="text-[color:var(--muted)] shrink-0" />
                      <input defaultValue="" placeholder="manager@example.com" className="text-sm bg-transparent outline-none w-full" />
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

            {/* Visibility */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)]">
              <div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Listing Visibility</p>
                <p className="text-xs text-[color:var(--muted)] mt-0.5">
                  {isPrivate ? "Private — only invited tenants can see this property" : "Public — appears in Find PG search results"}
                </p>
              </div>
              <button onClick={togglePrivacy} disabled={togglingPrivacy}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${
                  isPrivate ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700" : "bg-[color:var(--accent-500)] text-white border-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)]"
                } disabled:opacity-60`}>
                {togglingPrivacy ? <RefreshCw size={12} className="animate-spin" /> : isPrivate ? <EyeOff size={12} /> : <Eye size={12} />}
                {isPrivate ? "Private" : "Public"}
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[color:var(--line)]">
              <button onClick={() => setForm({
                name: property.title, address: property.location,
                rent: String(property.price), deposit: String(property.deposit),
                advance: "1", noticeDays: "30", checkIn: "10:00 AM",
                gender: property.gender === "Co-ed" ? "Co-ed" : property.gender === "Female" ? "Female Only" : "Male Only",
                type: property.type, visitorPolicy: "Allowed till 9 PM", food: "Optional meals",
              })} className="text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--foreground)] px-4 py-2.5 rounded-xl border border-[color:var(--line)] hover:bg-[color:var(--background)] transition-colors">Discard</button>
              <button disabled={saving} onClick={async () => {
                setSaving(true);
                try {
                  await api.properties.update(property.id, {
                    title: form.name,
                    location: form.address,
                    type: (form.type === "PG" || form.type === "Flat" || form.type === "House") ? form.type as "PG" | "Flat" | "House" : "PG",
                    price: Number(form.rent) || property.price,
                    deposit: Number(form.deposit) || undefined,
                    amenities: Array.from(amenities),
                  });
                  toast.success("Property saved");
                } catch {
                  toast.error("Failed to save — changes kept locally");
                } finally {
                  setSaving(false);
                }
              }} className="bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* ────────── Photos ────────── */}
        {innerTab === "photos" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[color:var(--muted)]">{gallery.length} photos · cover photo shown in listings</p>
              <label className="flex items-center gap-1.5 text-xs bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer">
                <Plus size={12} /> Add Photo
                <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async () => {
                    try {
                      const img = await api.properties.uploadImage(property.id, { data: reader.result as string, contentType: file.type as "image/jpeg" | "image/png" | "image/webp" });
                      setGallery(prev => [...prev, img]);
                      toast.success("Photo uploaded");
                    } catch { toast.error("Upload failed"); }
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-[color:var(--background)]">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.id === coverImageId && (
                    <span className="absolute top-2 left-2 bg-[color:var(--accent-500)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Cover</span>
                  )}
                  {settingCoverId === img.id || deletingImageId === img.id ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <RefreshCw size={16} className="text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {img.id !== coverImageId && (
                        <button onClick={async () => {
                          setSettingCoverId(img.id);
                          try {
                            await api.properties.setCoverImage(property.id, img.id);
                            setCoverImageId(img.id);
                            toast.success("Cover updated");
                          } catch { toast.error("Failed to set cover"); }
                          finally { setSettingCoverId(null); }
                        }} className="text-[10px] font-bold text-white bg-white/20 hover:bg-[color:var(--accent-500)] px-2.5 py-1.5 rounded-lg transition-colors">
                          Set Cover
                        </button>
                      )}
                      <button onClick={async () => {
                        setDeletingImageId(img.id);
                        try {
                          await api.properties.deleteImage(property.id, img.id);
                          setGallery(prev => prev.filter(x => x.id !== img.id));
                          if (img.id === coverImageId) setCoverImageId(gallery[0]?.id ?? "");
                          toast.success("Photo deleted");
                        } catch { toast.error("Failed to delete photo"); }
                        finally { setDeletingImageId(null); }
                      }} className="text-[10px] font-bold text-white bg-white/20 hover:bg-red-500 px-2.5 py-1.5 rounded-lg transition-colors">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {Array.from({ length: Math.max(0, 6 - gallery.length) }).map((_, i) => (
                <label key={i} className="aspect-video rounded-xl border-2 border-dashed border-[color:var(--line)] hover:border-[color:var(--accent-400)] text-[color:var(--muted)] hover:text-[color:var(--accent-600)] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer">
                  <Camera size={18} strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">Upload</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async () => {
                      try {
                        const img = await api.properties.uploadImage(property.id, { data: reader.result as string, contentType: file.type as "image/jpeg" | "image/png" | "image/webp" });
                        setGallery(prev => [...prev, img]);
                        toast.success("Photo uploaded");
                      } catch { toast.error("Upload failed"); }
                    };
                    reader.readAsDataURL(file);
                  }} />
                </label>
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
                    style={{ width: `${Math.round((rooms.filter(r=>!r.isAvailable).length / Math.max(rooms.length,1)) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xs text-[color:var(--muted)] whitespace-nowrap shrink-0">
                <span className="font-bold text-[color:var(--foreground)]">{rooms.filter(r=>!r.isAvailable).length}</span> occupied ·{" "}
                <span className="font-bold text-[color:var(--foreground)]">{rooms.filter(r=>r.isAvailable).length}</span> vacant
              </span>
              <button className="flex items-center gap-1.5 text-xs bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-3 py-2 rounded-lg font-semibold transition-colors shrink-0">
                <Plus size={12} /> Add Room
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {rooms.map((r) => (
                <div key={r.id} className={`rounded-xl border p-3.5 flex flex-col gap-2 ${!r.isAvailable ? "border-[color:var(--accent-200)] bg-[color:var(--accent-50)]" : "border-[color:var(--line)] bg-white"}`}>
                  <div className="flex items-start justify-between">
                    <p className="text-base font-bold text-[color:var(--foreground)]">#{r.roomNumber}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${!r.isAvailable ? "bg-[color:var(--accent-100)] text-[color:var(--accent-700)]" : "bg-[color:var(--background)] text-[color:var(--muted)]"}`}>{r.type}</span>
                  </div>
                  {!r.isAvailable ? (
                    <>
                      <p className="text-[10px] text-[color:var(--muted)]">Occupied · {r.occupiedBeds}/{r.capacity} beds</p>
                      <p className="text-[10px] text-[color:var(--muted)]">₹{r.rentAmount.toLocaleString("en-IN")}/mo</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-[color:var(--muted)]">₹{r.rentAmount.toLocaleString("en-IN")}/mo</p>
                      <p className="text-[10px] text-[color:var(--accent-600)] font-semibold">Available</p>
                    </>
                  )}
                  {r.isAvailable && (
                    <button
                      disabled={deletingRoomId === r.id}
                      onClick={async () => {
                        if (!confirm(`Delete room #${r.roomNumber}?`)) return;
                        setDeletingRoomId(r.id);
                        try {
                          await api.rooms.delete(r.id);
                          setRooms(prev => prev.filter(x => x.id !== r.id));
                          toast.success(`Room #${r.roomNumber} deleted`);
                        } catch {
                          toast.error("Failed to delete room");
                        } finally {
                          setDeletingRoomId(null);
                        }
                      }}
                      className="mt-auto text-[10px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-60 flex items-center gap-1 transition-colors">
                      {deletingRoomId === r.id ? <RefreshCw size={10} className="animate-spin" /> : <Trash2 size={10} />}
                      Delete
                    </button>
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
                  <h4 className="text-sm font-bold text-[color:var(--foreground)]">Invite New Tenant</h4>
                  <button onClick={() => setShowAddTenant(false)} className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"><X size={16} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Room *</span>
                    <select
                      value={inviteForm.roomId}
                      onChange={e => setInviteForm(f => ({ ...f, roomId: e.target.value }))}
                      className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]"
                    >
                      <option value="">Select room</option>
                      {vacantRooms.map(r => (
                        <option key={r.id} value={r.id}>Room {r.roomNumber} (vacant)</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Monthly Rent (₹) *</span>
                    <input
                      value={inviteForm.rentAmount}
                      onChange={e => setInviteForm(f => ({ ...f, rentAmount: e.target.value }))}
                      className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Lease Start *</span>
                    <input
                      type="date"
                      value={inviteForm.leaseStart}
                      onChange={e => setInviteForm(f => ({ ...f, leaseStart: e.target.value }))}
                      className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Lease End *</span>
                    <input
                      type="date"
                      value={inviteForm.leaseEnd}
                      onChange={e => setInviteForm(f => ({ ...f, leaseEnd: e.target.value }))}
                      className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Tenant Email</span>
                    <input
                      type="email"
                      placeholder="tenant@gmail.com"
                      value={inviteForm.email}
                      onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] mb-1 block">Tenant Phone</span>
                    <input
                      placeholder="+91 98765 XXXXX"
                      value={inviteForm.phone}
                      onChange={e => setInviteForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]"
                    />
                  </label>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[color:var(--accent-200)]">
                  <p className="text-[11px] text-[color:var(--muted)]">Tenant will receive an invite code to join via the app.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddTenant(false)} className="text-xs font-semibold text-[color:var(--muted)] px-4 py-2 rounded-xl border border-[color:var(--line)] hover:bg-white transition-colors">Cancel</button>
                    <button
                      disabled={inviting}
                      onClick={async () => {
                        if (!inviteForm.roomId || !inviteForm.rentAmount || !inviteForm.leaseStart || !inviteForm.leaseEnd) {
                          toast.error("Please fill in Room, Rent, Lease Start and Lease End.");
                          return;
                        }
                        setInviting(true);
                        try {
                          const res = await api.tenants.invite(property.id, {
                            roomId: inviteForm.roomId,
                            rentAmount: Number(inviteForm.rentAmount),
                            leaseStart: inviteForm.leaseStart,
                            leaseEnd: inviteForm.leaseEnd,
                            email: inviteForm.email || undefined,
                            phoneNumber: inviteForm.phone || undefined,
                          });
                          toast.success(`Invite sent! Code: ${res.inviteCode}`);
                          setShowAddTenant(false);
                          setInviteForm({ roomId: "", rentAmount: String(property.price), leaseStart: "", leaseEnd: "", email: "", phone: "" });
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to send invite.");
                        } finally {
                          setInviting(false);
                        }
                      }}
                      className="bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors"
                    >
                      {inviting ? "Sending…" : "Send Invite"}
                    </button>
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
                const initials = t.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();
                const isExp = expandedTenantId === t.id;
                return (
                  <div key={t.id} className="rounded-xl border border-[color:var(--line)] overflow-hidden">
                    <button onClick={() => setExpandedTenantId(isExp ? null : t.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-[color:var(--background)] transition-colors text-left">
                      <Avatar initials={initials} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[color:var(--foreground)]">{t.name}</p>
                        <p className="text-[11px] text-[color:var(--muted)] mt-0.5">
                          Room {t.room} · Joined {t.joinDate} · ₹{t.rentAmount.toLocaleString("en-IN")}/mo
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <StatusChip status={t.isPaid ? "paid" : "pending"} />
                        <ChevronDown size={15} className={`text-[color:var(--muted)] transition-transform duration-200 ${isExp ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isExp && (
                      <div className="bg-[color:var(--background)] border-t border-[color:var(--line)] p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Contact</h5>
                            <div className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[color:var(--muted)]" />{t.phone || "—"}</div>
                            <div className="flex items-center gap-2 text-xs"><Mail size={12} className="text-[color:var(--muted)]" />{t.email || "—"}</div>
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)]">Financials</h5>
                            <div className="flex justify-between text-xs">
                              <span className="text-[color:var(--muted)]">Monthly Rent</span>
                              <span className="font-bold">₹{t.rentAmount.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-[color:var(--muted)]">Due Date</span>
                              <span className="font-semibold">{t.dueDate}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-[color:var(--muted)]">Status</span>
                              <StatusChip status={t.status} />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-[color:var(--line)]">
                          <button className="flex items-center gap-1.5 text-[11px] font-semibold bg-[color:var(--accent-50)] text-[color:var(--accent-600)] hover:bg-[color:var(--accent-100)] px-3 py-2 rounded-lg transition-colors">
                            <CalendarDays size={12} /> Edit Lease
                          </button>
                          <button className="flex items-center gap-1.5 text-[11px] font-semibold bg-[color:var(--success-50)] text-[color:var(--success-700)] hover:bg-green-100 px-3 py-2 rounded-lg transition-colors">
                            <Banknote size={12} /> Record Payment
                          </button>
                          <button
                            disabled={removingTenantId === t.id}
                            onClick={async () => {
                              if (!confirm(`Remove ${t.name} from this property?`)) return;
                              setRemovingTenantId(t.id);
                              try {
                                await api.tenants.remove(t.id);
                                setPropertyTenants(prev => prev.filter(x => x.id !== t.id));
                                toast.success("Tenant removed");
                              } catch {
                                toast.error("Failed to remove tenant");
                              } finally {
                                setRemovingTenantId(null);
                              }
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60 px-3 py-2 rounded-lg transition-colors ml-auto">
                            {removingTenantId === t.id ? <RefreshCw size={12} className="animate-spin" /> : <UserX size={12} />}
                            {removingTenantId === t.id ? "Removing…" : "Remove Tenant"}
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
                {(["all", "open", "in_progress", "resolved"] as const).map((f) => (
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
                const isExp = expandedTicketId === m.id;
                const dateStr = m.createdAt
                  ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                  : "";
                return (
                  <div key={m.id} className="rounded-xl border border-[color:var(--line)] overflow-hidden">
                    <button onClick={() => { setExpandedTicketId(isExp ? null : m.id); setNoteText(""); }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-[color:var(--background)] transition-colors text-left">
                      <div className={`w-1.5 h-10 rounded-full shrink-0 ${st==="resolved" ? "bg-[color:var(--success)]" : st==="in_progress" ? "bg-[color:var(--trust)]" : "bg-[color:var(--warning)]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[color:var(--foreground)]">{m.title}</p>
                        <p className="text-[11px] text-[color:var(--muted)] mt-0.5">{dateStr} · Unassigned</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusChip status={m.priority} />
                        <StatusChip status={st} />
                        <ChevronDown size={15} className={`text-[color:var(--muted)] transition-transform duration-200 ${isExp ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isExp && (
                      <div className="bg-[color:var(--background)] border-t border-[color:var(--line)] p-5 space-y-4">
                        {m.description && <p className="text-xs text-[color:var(--foreground)] leading-relaxed">{m.description}</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] block mb-1">Assignee</label>
                            <input defaultValue="" placeholder="e.g. Ramu (Electrician)"
                              className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] block mb-1">Status</label>
                            <select value={st} onChange={async (e) => {
                              const newStatus = e.target.value as ApiMaintenanceRequest["status"];
                              setTicketStatuses(prev => ({ ...prev, [m.id]: newStatus }));
                              await api.maintenance.update(m.id, { status: newStatus }).catch(() => {});
                            }}
                              className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-[color:var(--accent-400)]">
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input value={noteText} onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a note or update…"
                            className="flex-1 border border-[color:var(--line)] rounded-xl px-3 py-2 text-xs bg-white outline-none focus:border-[color:var(--accent-400)]" />
                          <button onClick={() => setNoteText("")}
                            className="bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-colors">
                            Post
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

      </div>
    </div>
  );
}

function PropertiesTab({ initialPropId, properties }: { initialPropId?: string | null; properties: Property[] }) {
  const [managingId, setManagingId] = useState<string | null>(initialPropId ?? null);
  const managing = properties.find((p) => p.id === managingId);

  if (managing) {
    return <ManagePropertyView property={managing} onBack={() => setManagingId(null)} />;
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center bg-white rounded-2xl border border-[color:var(--line)]">
        <div className="w-14 h-14 rounded-2xl bg-[color:var(--background)] flex items-center justify-center">
          <Building2 size={24} strokeWidth={1.5} className="text-[color:var(--muted)]" />
        </div>
        <div>
          <p className="font-semibold text-[color:var(--foreground)]">No properties yet</p>
          <p className="text-sm text-[color:var(--muted)] mt-1 max-w-xs">Add your first property to start managing rooms, tenants, and payments.</p>
        </div>
        <button className="mt-1 flex items-center gap-2 rounded-full bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] px-6 py-2.5 text-sm font-semibold text-white transition-colors">
          <Plus size={15} strokeWidth={2.5} /> Add Property
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {properties.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.title} className="w-full h-36 object-cover" />
          ) : (
            <div className="w-full h-36 bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 flex items-center justify-center">
              <Building2 size={36} strokeWidth={1.25} className="text-white/40" />
            </div>
          )}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[color:var(--foreground)]">{p.title}</h3>
                <p className="text-xs text-[color:var(--muted)] mt-0.5">{p.location}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--background)] text-[color:var(--muted)]">{p.type}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-[color:var(--background)] rounded-xl py-2">
                <p className="text-base font-bold text-[color:var(--foreground)]">{p.totalRooms}</p>
                <p className="text-[10px] text-[color:var(--muted)]">Total</p>
              </div>
              <div className="bg-[color:var(--accent-50)] rounded-xl py-2">
                <p className="text-base font-bold text-[color:var(--accent-700)]">{p.occupiedRooms}</p>
                <p className="text-[10px] text-[color:var(--accent-600)]">Occupied</p>
              </div>
              <div className="bg-[color:var(--background)] rounded-xl py-2">
                <p className="text-base font-bold text-[color:var(--foreground)]">{p.totalRooms - p.occupiedRooms}</p>
                <p className="text-[10px] text-[color:var(--muted)]">Vacant</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[color:var(--line)]">
              <p className="text-xs text-[color:var(--muted)]">
                From: <span className="font-semibold text-[color:var(--foreground)]">₹{p.price.toLocaleString("en-IN")}/mo</span>
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

function TenantProfileView({ tenant, onBack, onViewInOrg }: {
  tenant: ApiTenant; onBack: () => void; onViewInOrg?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "payment">("overview");
  const [tenantPayments, setTenantPayments] = useState<ApiPayment[] | null>(null);

  useEffect(() => {
    api.payments.list({ propertyId: tenant.propertyId, limit: 24 })
      .then(r => setTenantPayments(r.data.filter(p => p.tenantId === tenant.id || p.tenantName === tenant.name)))
      .catch(() => {});
  }, [tenant.id, tenant.propertyId, tenant.name]);

  const initials = tenant.name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const paidPayments    = (tenantPayments ?? []).filter(p => p.status === "paid");
  const overduePayments = (tenantPayments ?? []).filter(p => p.status === "overdue");
  const totalPaidAmt    = paidPayments.reduce((s, p) => s + p.amount, 0);
  const onTimeRate      = tenantPayments && tenantPayments.length > 0
    ? Math.round((paidPayments.length / tenantPayments.length) * 100)
    : 0;

  const statsStrip = [
    { label: "Joined",        value: tenant.joinDate,                              sub: "Move-in date" },
    { label: "Monthly Rent",  value: `₹${tenant.rentAmount.toLocaleString("en-IN")}`, sub: "Current" },
    { label: "Total Paid",    value: `₹${totalPaidAmt.toLocaleString("en-IN")}`,   sub: `${paidPayments.length} payments` },
    { label: "Status",        value: tenant.isPaid ? "Paid" : "Pending",           sub: tenant.status },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-[color:var(--foreground)] font-medium transition-colors">
          <ArrowLeft size={13} /> All Tenants
        </button>
        <span>/</span>
        <span className="text-[color:var(--foreground)] font-semibold truncate">{tenant.name}</span>
      </div>

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm">
        <div className="h-28 rounded-t-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 55%,#2563eb 100%)" }}>
          {!tenant.isPaid && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
              <AlertCircle size={10} /> Rent Pending
            </div>
          )}
        </div>
        <div className="px-5 pb-5 relative z-10">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              {initials}
            </div>
            <div className="flex gap-2 mb-1 flex-wrap justify-end">
              <a href={`tel:${tenant.phone}`}
                className="flex items-center gap-1.5 text-[11px] font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                <Phone size={11} /> Call
              </a>
              <a href={`mailto:${tenant.email}`}
                className="flex items-center gap-1.5 text-[11px] font-semibold border border-[color:var(--line)] hover:bg-slate-50 text-[color:var(--foreground)] px-3 py-1.5 rounded-lg transition-colors">
                <Mail size={11} /> Email
              </a>
              <a href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
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
          <h2 className="text-base font-bold text-[color:var(--foreground)]">{tenant.name}</h2>
          <p className="text-xs text-[color:var(--muted)] mb-3">Room {tenant.room}</p>
          <div className="flex gap-2 flex-wrap">
            <StatusChip status={tenant.isPaid ? "paid" : "pending"} />
            <StatusChip status={tenant.status} />
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
          {(["overview", "payment"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-[11px] font-semibold rounded-t-lg transition-colors ${
                activeTab === tab
                  ? "bg-white text-violet-600 border-x border-t border-[color:var(--line)] -mb-px"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}>
              {tab === "payment" ? "Payment History" : "Overview"}
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
                    { label: "Room No.",  value: tenant.room },
                    { label: "Move-in",   value: tenant.joinDate },
                    { label: "Rent Due",  value: tenant.dueDate },
                    { label: "Rent",      value: `₹${tenant.rentAmount.toLocaleString("en-IN")}/mo` },
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
                    { label: "Phone", value: tenant.phone },
                    { label: "Email", value: tenant.email },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-[color:var(--line)] last:border-0">
                      <span className="text-[11px] text-[color:var(--muted)]">{row.label}</span>
                      <span className="text-[11px] font-semibold text-[color:var(--foreground)] truncate max-w-[160px]">{row.value}</span>
                    </div>
                  ))}
                </div>
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
                  <p className="text-xs font-bold text-red-600">{overduePayments.length}</p>
                  <p className="text-[10px] text-[color:var(--muted)] mt-0.5">Overdue Months</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs font-bold text-emerald-600">{onTimeRate}%</p>
                  <p className="text-[10px] text-[color:var(--muted)] mt-0.5">On-time Rate</p>
                </div>
              </div>

              {/* Detailed table */}
              {tenantPayments === null ? (
                <p className="text-xs text-[color:var(--muted)] text-center py-8">Loading…</p>
              ) : tenantPayments.length === 0 ? (
                <p className="text-xs text-[color:var(--muted)] text-center py-8">No payment records found.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[color:var(--line)]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[color:var(--background)]">
                        {["Title", "Amount", "Date", "Status", "Mode"].map(h => (
                          <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--line)]">
                      {tenantPayments.map(p => (
                        <tr key={p.id} className="hover:bg-[color:var(--background)] transition-colors">
                          <td className="px-4 py-3 text-[11px] text-[color:var(--foreground)] whitespace-nowrap">{p.title}</td>
                          <td className="px-4 py-3 text-[11px] font-semibold text-[color:var(--foreground)]">₹{p.amount.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3 text-[11px] text-[color:var(--muted)] whitespace-nowrap">{p.date}</td>
                          <td className="px-4 py-3"><StatusChip status={p.status} /></td>
                          <td className="px-4 py-3 text-[11px] text-[color:var(--muted)]">{p.collectionMode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function TenantsTab({ initialTenantId, onNav }: { initialTenantId?: string | null; onNav?: (tab: string) => void }) {
  const [profileId, setProfileId] = useState<string | null>(initialTenantId ?? null);
  const [apiTenants, setApiTenants] = useState<ApiTenant[] | null>(null);
  const [propNameMap, setPropNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const propsRes = await api.properties.list();
        const props = propsRes.data;
        const map: Record<string, string> = {};
        props.forEach((p) => { map[p.id] = p.title; });
        setPropNameMap(map);
        const perProp = await Promise.all(props.map((p) => api.tenants.list(p.id).then((r) => r.data)));
        setApiTenants(perProp.flat());
      } catch { setApiTenants([]); }
    }
    load();
  }, []);

  const displayTenants = (apiTenants ?? []).map((t) => ({
    id:       t.id,
    name:     t.name,
    initials: t.name.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase(),
    property: propNameMap[t.propertyId] ?? t.propertyId,
    room:     t.room,
    lease:    t.dueDate,
    paid:     t.isPaid,
    risk:     t.status === "overdue" ? "late" : t.status === "pending" ? "expiring" : "none",
  }));

  if (profileId) {
    const profileTenant = (apiTenants ?? []).find((t) => t.id === profileId);
    if (!profileTenant) return null;
    return (
      <TenantProfileView
        tenant={profileTenant}
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
            {displayTenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-sm font-medium text-slate-500">No tenants yet</p>
                  <p className="text-xs text-slate-400 mt-1">Invite a tenant to a room to get started.</p>
                </td>
              </tr>
            )}
            {displayTenants.map((t) => (
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

function PaymentsTab({ stats, transactions }: { stats: DashStats; transactions: TxItem[] }) {
  const { financials } = stats;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {financials.map((s: FinancialItem) => (
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
              {transactions.map((tx) => (
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
  const [tickets, setTickets] = useState<ApiMaintenanceRequest[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const propsRes = await api.properties.list();
        const results = await Promise.allSettled(
          propsRes.data.map(p => api.maintenance.list(p.id, { limit: 50 }))
        );
        const combined: ApiMaintenanceRequest[] = results.flatMap(r =>
          r.status === "fulfilled" ? r.value.data : []
        );
        setTickets(combined);
      } finally {
        setLoadingTickets(false);
      }
    }
    load();
  }, []);

  const displayTickets = tickets;

  const openCount = displayTickets.filter(m => m.status === "open" || m.status === "in_progress").length;

  return (
    <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--line)]">
        <h3 className="text-sm font-bold text-[color:var(--foreground)]">Maintenance Requests</h3>
        <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
          <span className="w-2 h-2 rounded-full bg-[color:var(--error)]" /> {loadingTickets ? "…" : openCount} open
        </div>
      </div>
      <div className="divide-y divide-[color:var(--line)]">
        {loadingTickets ? (
          <div className="px-6 py-8 text-center text-xs text-[color:var(--muted)]">Loading…</div>
        ) : displayTickets.map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[color:var(--background)] transition-colors">
            <div className={`w-2 h-10 rounded-full shrink-0 ${
              m.status === "resolved" || m.status === "closed" ? "bg-[color:var(--success)]" :
              m.status === "in_progress" ? "bg-[color:var(--trust)]" :
              "bg-[color:var(--warning)]"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[color:var(--foreground)]">{m.title}</p>
              <p className="text-[11px] text-[color:var(--muted)]">{m.description || m.propertyId}</p>
            </div>
            <span className="text-[10px] text-[color:var(--muted)] hidden md:block">
              {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
            </span>
            <StatusChip status={m.status} />
            <StatusChip status={m.priority} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsTab() {
  const [report, setReport] = useState<PropertyReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propsLoading, setPropsLoading] = useState(true);
  const [selectedPropId, setSelectedPropId] = useState("");

  useEffect(() => {
    api.properties.list()
      .then(r => {
        setProperties(r.data);
        if (r.data.length > 0) setSelectedPropId(r.data[0].id);
      })
      .catch(() => {})
      .finally(() => setPropsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPropId) return;
    setLoadingReport(true);
    api.reports.property(selectedPropId)
      .then(r => setReport(r))
      .catch(() => setReport(null))
      .finally(() => setLoadingReport(false));
  }, [selectedPropId]);

  const propTitle = properties.find(p => p.id === selectedPropId)?.title ?? selectedPropId;

  if (propsLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[color:var(--line)] p-10 shadow-sm flex items-center justify-center">
        <p className="text-xs text-[color:var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[color:var(--line)] p-10 shadow-sm flex flex-col items-center justify-center gap-3">
        <BarChart3 size={32} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No properties yet</p>
        <p className="text-xs text-slate-400">Add a property to start seeing reports and analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[color:var(--line)] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[color:var(--foreground)]">Reports & Analytics — {propTitle}</h3>
          <select
            value={selectedPropId}
            onChange={e => setSelectedPropId(e.target.value)}
            className="text-xs border border-[color:var(--line)] rounded-lg px-3 py-1.5 text-[color:var(--muted)] bg-[color:var(--background)] outline-none"
          >
            {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        {loadingReport ? (
          <div className="py-8 text-center text-xs text-[color:var(--muted)]">Loading…</div>
        ) : report ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: "Collected",      value: `₹${report.totalCollected.toLocaleString("en-IN")}`,       color: "text-[color:var(--success-700)]" },
              { label: "Pending",        value: `₹${report.totalPending.toLocaleString("en-IN")}`,         color: "text-[color:var(--warning-700)]" },
              { label: "Overdue Pmts",   value: report.overdueCount.toString(),                            color: "text-[color:var(--error-700)]"   },
              { label: "Occupancy",      value: `${(report.occupancyRate * 100).toFixed(1)}%`,             color: "text-[color:var(--trust-700)]"   },
              { label: "Active Tenants", value: report.activeTenants.toString(),                           color: "text-[color:var(--foreground)]"  },
              { label: "MoM Change",     value: report.revenueChangePercent != null ? `${report.revenueChangePercent >= 0 ? "+" : ""}${report.revenueChangePercent.toFixed(1)}%` : "N/A", color: report.revenueChangePercent != null && report.revenueChangePercent >= 0 ? "text-[color:var(--success-700)]" : "text-[color:var(--error-700)]" },
            ].map(item => (
              <div key={item.label} className="bg-[color:var(--background)] rounded-xl p-4">
                <p className="text-[11px] text-[color:var(--muted)] mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[color:var(--muted)] py-4">Unable to load report data.</p>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-[color:var(--line)]">
          <button className="flex items-center gap-2 bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Download size={13} /> Export CSV
          </button>
          <p className="text-[11px] text-[color:var(--muted)]">Income statements, occupancy trends, and tax-ready CSVs.</p>
        </div>
      </div>

      {report && report.payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[color:var(--line)]">
            <h4 className="text-sm font-bold text-[color:var(--foreground)]">Payments ({report.payments.length})</h4>
          </div>
          <div className="divide-y divide-[color:var(--line)]">
            {report.payments.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[color:var(--foreground)] truncate">{p.title}</p>
                  <p className="text-[11px] text-[color:var(--muted)]">{p.tenantName} · {p.date}</p>
                </div>
                <span className="text-xs font-bold text-[color:var(--foreground)]">₹{p.amount.toLocaleString("en-IN")}</span>
                <StatusChip status={p.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UpgradePlanModal({ currentSub, onClose, onSubscribed }: {
  currentSub: import("@/lib/api").Subscription | null;
  onClose: () => void;
  onSubscribed: (sub: import("@/lib/api").Subscription) => void;
}) {
  const toast = useToast();
  const [plans, setPlans] = React.useState<import("@/lib/api").Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [subscribing, setSubscribing] = React.useState<string | null>(null);

  React.useEffect(() => {
    api.plans.list().then(setPlans).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function subscribe(planId: string) {
    setSubscribing(planId);
    try {
      let result: import("@/lib/api").Subscription;
      if (currentSub) {
        result = await api.plans.updateSub(currentSub.id, planId);
      } else {
        result = await api.plans.subscribe(planId);
      }
      onSubscribed(result);
      toast.success("Plan updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update plan. Please try again.");
    } finally {
      setSubscribing(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[color:var(--line)]">
          <div>
            <h2 className="text-lg font-bold text-[color:var(--foreground)]">Choose a Plan</h2>
            <p className="text-xs text-[color:var(--muted)] mt-0.5">All plans include the ShiftProof core features</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[color:var(--background)] text-[color:var(--muted)] transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-[color:var(--muted)]">
              <RefreshCw size={16} className="animate-spin" /> Loading plans…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.map(plan => {
                const isCurrent = currentSub?.planId === plan.id;
                const isPopular = plan.isPopular;
                return (
                  <div key={plan.id} className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md ${
                    isPopular ? "border-[color:var(--accent-400)] bg-[color:var(--accent-50)]" : "border-[color:var(--line)] bg-white"
                  }`}>
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[color:var(--accent-500)] text-white text-[10px] font-bold">
                        Most Popular
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-[color:var(--foreground)] text-base">{plan.name}</p>
                      <p className="text-2xl font-bold text-[color:var(--foreground)] mt-1">
                        {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                        {plan.price > 0 && <span className="text-xs font-normal text-[color:var(--muted)]">/mo</span>}
                      </p>
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-[color:var(--foreground)]">
                          <CheckCircle2 size={12} className="text-[color:var(--accent-500)] shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={isCurrent || subscribing === plan.id}
                      onClick={() => subscribe(plan.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isCurrent
                          ? "bg-[color:var(--background)] text-[color:var(--muted)] cursor-default border border-[color:var(--line)]"
                          : isPopular
                            ? "bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white"
                            : "bg-[color:var(--foreground)] hover:opacity-80 text-white"
                      } disabled:opacity-60`}
                    >
                      {isCurrent ? "Current Plan" : subscribing === plan.id ? "Subscribing…" : "Select Plan"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubscriptionCard() {
  const [sub, setSub] = useState<import("@/lib/api").Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const CARD = "bg-white rounded-2xl border border-[color:var(--line)] p-6 shadow-sm";
  const SEC_TITLE = "text-sm font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2";

  useEffect(() => {
    api.plans.currentSub()
      .then(setSub)
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className={CARD}>
        <div className="flex items-start justify-between mb-4">
          <h2 className={SEC_TITLE}>
            <CreditCard size={15} className="text-[color:var(--accent-500)]" /> Subscription
          </h2>
          <button onClick={() => setShowUpgrade(true)}
            className="text-xs font-semibold text-[color:var(--accent-600)] hover:underline flex items-center gap-1">
            <Star size={11} /> {sub ? "Change Plan" : "Subscribe"}
          </button>
        </div>
        {loading ? (
          <div className="py-4 text-xs text-[color:var(--muted)]">Loading…</div>
        ) : sub ? (
          <>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--accent-500)]/8 border border-[color:var(--accent-200)] mb-4">
              <div>
                <p className="text-sm font-bold text-[color:var(--foreground)]">{sub.planName}</p>
                <p className="text-[11px] text-[color:var(--muted)] mt-0.5">₹{sub.price.toLocaleString("en-IN")}/mo</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                sub.status === "active" ? "bg-[color:var(--accent-500)] text-white" : "bg-slate-100 text-slate-500"
              }`}>{sub.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[11px] text-[color:var(--muted)] mb-0.5">Start date</p>
                <p className="font-semibold text-[color:var(--foreground)]">{sub.startDate}</p>
              </div>
              {sub.endDate && (
                <div>
                  <p className="text-[11px] text-[color:var(--muted)] mb-0.5">Renewal date</p>
                  <p className="font-semibold text-[color:var(--foreground)]">{sub.endDate}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CreditCard size={22} strokeWidth={1.5} className="text-slate-300" />
            <p className="text-sm text-[color:var(--muted)]">No active subscription</p>
            <p className="text-xs text-slate-400">Choose a plan to unlock all features.</p>
            <button onClick={() => setShowUpgrade(true)}
              className="mt-2 text-xs font-bold bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-4 py-2 rounded-xl transition-colors">
              View Plans
            </button>
          </div>
        )}
      </div>
      {showUpgrade && (
        <UpgradePlanModal
          currentSub={sub}
          onClose={() => setShowUpgrade(false)}
          onSubscribed={(newSub) => setSub(newSub)}
        />
      )}
    </>
  );
}

function AccountTab({ user }: { user: AppUser | null }) {
  const toast = useToast();
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "", email: user?.email ?? "",
    phone: user?.phoneNumber ?? "",
    city: user?.city ?? "", area: user?.area ?? "",
    gender: user?.gender ?? "",
  });

  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  // Provider linking — two-step: preflight → Firebase → complete
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
        // Phone linking requires OTP flow — guide user
        toast.success("To link phone: sign out and sign in with your phone number, then link accounts");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("popup-closed")) {
        toast.error("Popup closed — try again");
      } else if (msg.includes("already-in-use")) {
        toast.error("This account is already linked to another user");
      } else {
        toast.error("Linking failed — try again");
      }
    } finally {
      setLinkingProvider(null);
    }
  }

  // Bank account
  const [bankAccount, setBankAccount] = useState<import("@/lib/api").BankAccount | null>(null);
  const [editingBank, setEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ accountHolderName: "", accountNumber: "", bankName: "", ifscCode: "" });

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState<import("@/lib/api").NotificationPreferences>({ email: true, push: true, sms: false });

  const initials = (user?.name ?? "")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "—";

  React.useEffect(() => {
    api.auth.getBankAccount().then(acct => {
      if (acct) { setBankAccount(acct); setBankForm(acct); }
    }).catch(() => {});
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
    if (pwdForm.next.length < 6) { setPwdError("New password must be at least 6 characters."); return; }
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

  async function saveBank() {
    if (!bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.ifscCode) {
      toast.error("Account holder name, account number, and IFSC are required");
      return;
    }
    setSavingBank(true);
    try {
      const saved = await api.auth.saveBankAccount(bankForm);
      setBankAccount(saved);
      setEditingBank(false);
      toast.success("Bank account saved");
    } catch {
      toast.error("Failed to save bank account");
    } finally {
      setSavingBank(false);
    }
  }

  async function toggleNotifChannel(ch: keyof import("@/lib/api").NotificationPreferences) {
    const updated = { ...notifPrefs, [ch]: !notifPrefs[ch] };
    setNotifPrefs(updated);
    try {
      await api.auth.updateNotifPrefs(updated);
    } catch {
      setNotifPrefs(notifPrefs); // revert on failure
    }
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
              <button onClick={() => { setEditingProfile(false); setProfileForm({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phoneNumber ?? "", city: user?.city ?? "", area: user?.area ?? "", gender: user?.gender ?? "" }); }}
                disabled={savingProfile}
                className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] disabled:opacity-50">Cancel</button>
              <button onClick={saveProfile}
                disabled={savingProfile}
                className="text-xs font-semibold bg-[color:var(--accent-500)] text-white px-3 py-1 rounded-lg hover:bg-[color:var(--accent-600)] transition-colors disabled:opacity-60">
                {savingProfile ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[color:var(--accent-500)]/15 flex items-center justify-center text-xl font-bold text-[color:var(--accent-600)] shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-base font-bold text-[color:var(--foreground)]">{profileForm.name}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[color:var(--accent-100)] text-[color:var(--accent-700)] uppercase tracking-wide">
              <Building2 size={9} /> PG Owner
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">Full Name</label>
            <input type="text" disabled={!editingProfile} value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className={INPUT} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">Email</label>
            <input type="email" disabled value={profileForm.email} className={INPUT}
              title="Email cannot be changed here" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">Mobile</label>
            <PhoneInput disabled={!editingProfile} value={profileForm.phone}
              onChange={val => setProfileForm(f => ({ ...f, phone: val }))}
              className="bg-[color:var(--background)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">City</label>
            <input type="text" disabled={!editingProfile} value={profileForm.city}
              onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))} className={INPUT} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">Area</label>
            <input type="text" disabled={!editingProfile} value={profileForm.area}
              onChange={e => setProfileForm(f => ({ ...f, area: e.target.value }))} className={INPUT} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">Gender</label>
            <select disabled={!editingProfile} value={profileForm.gender}
              onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))} className={INPUT}>
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="CO_LIVING">Co-living / Any</option>
            </select>
          </div>
        </div>

      </div>

      {/* Subscription card */}
      <SubscriptionCard />

      {/* Bank / payout */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-5">
          <h2 className={SEC_TITLE}>
            <Landmark size={15} className="text-[color:var(--accent-500)]" /> Payout Bank Account
          </h2>
          {!editingBank && (
            <button onClick={() => { setEditingBank(true); if (bankAccount) setBankForm(bankAccount); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--accent-600)] hover:underline">
              <Edit3 size={12} /> {bankAccount ? "Edit" : "Add"}
            </button>
          )}
        </div>
        {!editingBank ? (
          bankAccount ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[color:var(--muted)]">Bank</span><span className="font-medium">{bankAccount.bankName || "—"}</span></div>
              <div className="flex justify-between"><span className="text-[color:var(--muted)]">Account holder</span><span className="font-medium">{bankAccount.accountHolderName}</span></div>
              <div className="flex justify-between"><span className="text-[color:var(--muted)]">Account number</span><span className="font-medium">••••{bankAccount.accountNumber.slice(-4)}</span></div>
              <div className="flex justify-between"><span className="text-[color:var(--muted)]">IFSC</span><span className="font-medium">{bankAccount.ifscCode}</span></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
              <Landmark size={22} strokeWidth={1.5} className="text-slate-300" />
              <p className="text-sm text-[color:var(--muted)]">Bank account not configured</p>
              <p className="text-xs text-slate-400 max-w-xs">Add your bank account to receive rent payouts directly.</p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {[
              { label: "Account holder name", key: "accountHolderName", placeholder: "Ravi Kumar" },
              { label: "Bank name", key: "bankName", placeholder: "HDFC Bank" },
              { label: "Account number", key: "accountNumber", placeholder: "1234567890" },
              { label: "IFSC code", key: "ifscCode", placeholder: "HDFC0001234" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={bankForm[key as keyof typeof bankForm]}
                  onChange={e => setBankForm(f => ({ ...f, [key]: e.target.value }))}
                  className={INPUT}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditingBank(false)} disabled={savingBank}
                className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] disabled:opacity-50">Cancel</button>
              <button onClick={saveBank} disabled={savingBank}
                className="text-xs font-semibold bg-[color:var(--accent-500)] text-white px-4 py-2 rounded-xl hover:bg-[color:var(--accent-600)] transition-colors disabled:opacity-60">
                {savingBank ? "Saving…" : "Save bank account"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className={CARD}>
        <h2 className={SEC_TITLE}>
          <Bell size={15} className="text-[color:var(--accent-500)]" /> Notification Preferences
        </h2>
        <p className="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide mb-2">Channels</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {(["email", "push", "sms"] as const).map(ch => {
            const Icon = ch === "email" ? Mail : ch === "push" ? Bell : MessageSquare;
            return (
              <button
                key={ch}
                onClick={() => toggleNotifChannel(ch)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  notifPrefs[ch]
                    ? "bg-[color:var(--accent-500)] text-white border-[color:var(--accent-500)]"
                    : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent-300)]"
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
        <button onClick={savePwd} disabled={savingPwd}
          className="mt-4 text-xs font-semibold bg-[color:var(--foreground)] hover:opacity-80 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-opacity">
          {savingPwd ? "Updating…" : "Update Password"}
        </button>
      </div>

      {/* Linked accounts */}
      <div className={CARD}>
        <h2 className={SEC_TITLE}>
          <Link2 size={15} className="text-[color:var(--accent-500)]" /> Linked Accounts
        </h2>
        <p className="text-xs text-[color:var(--muted)] mb-4">Link sign-in methods so you can log in with any of them.</p>
        <div className="space-y-3">
          {[
            { provider: "google", label: "Google", icon: (
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )},
            { provider: "phone", label: "Phone (OTP)", icon: <Smartphone size={16} className="text-[color:var(--accent-500)] shrink-0" /> },
          ].map(({ provider, label, icon }) => {
            const linked = user?.providers?.includes(provider) ?? false;
            return (
              <div key={provider} className="flex items-center justify-between p-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)]">
                <div className="flex items-center gap-3">
                  {icon}
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{label}</p>
                    <p className="text-xs text-[color:var(--muted)]">{linked ? "Connected" : "Not linked"}</p>
                  </div>
                </div>
                {linked ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-[color:var(--success-700)] bg-[color:var(--success-50)] px-3 py-1.5 rounded-full">
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

// ─── PayoutsTab ───────────────────────────────────────────────────────────────

function PayoutsTab() {
  const [payouts, setPayouts] = React.useState<import("@/lib/api").Payout[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    setLoading(true);
    api.payments.payouts(page, 20)
      .then(r => { setPayouts(r.data); setTotalPages(r.meta.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const statusColor = (s: string) =>
    s === "completed" ? "bg-[color:var(--success-50)] text-[color:var(--success-700)]"
    : s === "processing" ? "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]"
    : "bg-[color:var(--error-50)] text-[color:var(--error-700)]";

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Settled", value: `₹${payouts.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "accent" },
          { label: "Processing", value: String(payouts.filter(p => p.status === "processing").length), icon: RefreshCw, color: "warning" },
          { label: "Settled", value: String(payouts.filter(p => p.status === "completed").length), icon: CheckCircle2, color: "success" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[color:var(--line)] p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
              k.color === "accent" ? "bg-[color:var(--accent-100)] text-[color:var(--accent-600)]"
              : k.color === "warning" ? "bg-[color:var(--warning-50)] text-[color:var(--warning-700)]"
              : "bg-[color:var(--success-50)] text-[color:var(--success-700)]"
            }`}><k.icon size={15} strokeWidth={1.75} /></div>
            <p className="text-lg font-bold text-[color:var(--foreground)]">{k.value}</p>
            <p className="text-[10px] text-[color:var(--muted)] mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[color:var(--line)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--line)]">
          <div>
            <h3 className="font-semibold text-[color:var(--foreground)]">Payout History</h3>
            <p className="text-xs text-[color:var(--muted)] mt-0.5">Bank settlements from rent collections</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={18} className="text-[color:var(--muted)] animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--background)] flex items-center justify-center">
              <Wallet size={22} strokeWidth={1.5} className="text-[color:var(--muted)]" />
            </div>
            <p className="font-semibold text-[color:var(--foreground)]">No payouts yet</p>
            <p className="text-sm text-[color:var(--muted)] max-w-xs">Payouts are settled after tenants pay rent online. They appear here once processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[color:var(--muted)] border-b border-[color:var(--line)]">
                  <th className="text-left px-5 py-3 font-medium">Property</th>
                  <th className="text-left px-5 py-3 font-medium">Description</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Bank</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {payouts.map(p => (
                  <tr key={p.id} className="hover:bg-[color:var(--background)]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[color:var(--foreground)] truncate max-w-[140px]">{p.propertyTitle}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[color:var(--muted)] max-w-[180px] truncate">{p.description}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-[color:var(--muted)]">
                      {p.bankLast4 ? `••••${p.bankLast4}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[color:var(--muted)] whitespace-nowrap">{p.date}</td>
                    <td className="px-5 py-3.5 font-semibold text-[color:var(--foreground)] whitespace-nowrap">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[color:var(--line)]">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="text-xs font-semibold text-[color:var(--accent-600)] hover:underline disabled:opacity-30 disabled:no-underline">← Previous</button>
            <span className="text-xs text-[color:var(--muted)]">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="text-xs font-semibold text-[color:var(--accent-600)] hover:underline disabled:opacity-30 disabled:no-underline">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const SECTION_TITLES: Record<string, string> = {
  overview: "Good morning, Ravi", properties: "Properties",
  tenants: "Tenants", payments: "Payments", payouts: "Payouts",
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
  const toast = useToast();
  const limits = PLAN_LIMITS[org.plan];
  const isSolo = org.plan === "solo";

  const [members, setMembers]     = React.useState<OrgMember[]>(org.members);
  const [showInvite, setShowInvite] = React.useState(false);
  const [inviteName, setInviteName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole]   = React.useState<OrgRole>("manager");
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  // Transfer ownership
  const [showTransfer, setShowTransfer] = React.useState(false);
  const [transferToId, setTransferToId] = React.useState("");
  const [transferring, setTransferring] = React.useState(false);

  async function doTransfer() {
    if (!transferToId) return;
    setTransferring(true);
    try {
      await api.orgs.transferOwnership(org.id, transferToId);
      const target = members.find(m => m.id === transferToId);
      setMembers(prev => prev.map(m =>
        m.id === transferToId ? { ...m, role: "owner" } :
        m.role === "owner"    ? { ...m, role: "admin" }  : m,
      ));
      toast.success(`Ownership transferred to ${target?.name ?? "new owner"}`);
      setShowTransfer(false);
      setTransferToId("");
    } catch {
      toast.error("Transfer failed — try again");
    } finally {
      setTransferring(false);
    }
  }

  // Bulk assign member properties
  const [bulkAssignMemberId, setBulkAssignMemberId] = React.useState<string | null>(null);
  const [orgProperties, setOrgProperties] = React.useState<{ id: string; name: string }[]>([]);
  const [selectedPropIds, setSelectedPropIds] = React.useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = React.useState(false);

  async function openBulkAssign(member: OrgMember) {
    setBulkAssignMemberId(member.id);
    setSelectedPropIds(new Set(member.assignedProperties));
    if (orgProperties.length === 0) {
      try {
        const props = await api.orgs.listProperties(org.id);
        setOrgProperties(props.map(p => ({ id: p.id, name: p.title })));
      } catch { toast.error("Failed to load properties"); }
    }
  }

  async function saveBulkAssign() {
    if (!bulkAssignMemberId) return;
    setBulkSaving(true);
    try {
      const member = members.find(m => m.id === bulkAssignMemberId);
      const role = (member?.role === "manager" || member?.role === "caretaker") ? "manager" : "viewer" as const;
      await api.orgs.bulkAssignMemberProperties(org.id, bulkAssignMemberId, { propertyIds: Array.from(selectedPropIds), role });
      setMembers(prev => prev.map(m =>
        m.id === bulkAssignMemberId ? { ...m, assignedProperties: Array.from(selectedPropIds) } : m,
      ));
      toast.success("Property assignment updated");
      setBulkAssignMemberId(null);
    } catch {
      toast.error("Failed to save assignment");
    } finally {
      setBulkSaving(false);
    }
  }

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

  const [removingMemberId, setRemovingMemberId] = React.useState<string | null>(null);

  async function removeMember(id: string) {
    const m = members.find(x => x.id === id);
    if (!m || (m.role === "owner" && ownerCount <= 1)) return;
    setRemovingMemberId(id);
    try {
      await api.orgs.removeMember(org.id, id);
      setMembers(prev => prev.filter(x => x.id !== id));
      toast.success(`${m.name} removed from organization`);
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
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
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowTransfer(v => !v)}
              title="Transfer ownership"
              className="p-2 rounded-xl text-[color:var(--muted)] hover:text-[color:var(--accent-600)] hover:bg-[color:var(--accent-50)] transition-colors"
            >
              <ArrowRightLeft size={15} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setDeleteConfirm(v => !v)}
              title="Delete organization"
              className="p-2 rounded-xl text-[color:var(--muted)] hover:text-[color:var(--error)] hover:bg-[color:var(--error-50)] transition-colors"
            >
              <Trash2 size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Transfer ownership */}
        {showTransfer && (
          <div className="mt-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4 space-y-3">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Transfer Ownership</p>
            <p className="text-xs text-[color:var(--muted)]">The new owner will take over billing and full administrative control. You will become an Admin.</p>
            <select value={transferToId} onChange={e => setTransferToId(e.target.value)}
              className="w-full border border-[color:var(--line)] rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-[color:var(--accent-500)]">
              <option value="">— Select new owner —</option>
              {members.filter(m => m.role !== "owner" && m.status === "active").map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={doTransfer} disabled={!transferToId || transferring}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 text-white text-xs font-semibold transition-colors">
                {transferring ? <RefreshCw size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />}
                {transferring ? "Transferring…" : "Confirm Transfer"}
              </button>
              <button onClick={() => { setShowTransfer(false); setTransferToId(""); }}
                className="px-4 py-2 rounded-xl text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">Cancel</button>
            </div>
          </div>
        )}

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
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <button onClick={() => openBulkAssign(m)}
                            className="text-xs text-[color:var(--accent-500)] hover:underline underline-offset-2">
                            {m.assignedProperties.length === 0 ? "All properties" : `${m.assignedProperties.length} assigned`}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell text-xs text-[color:var(--muted)]">{m.joinedAt || "—"}</td>
                        <td className="px-5 py-3.5"><MemberStatusChip status={m.status} expired={expired} /></td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {m.status === "invited" && (
                            <button className="text-xs text-[color:var(--accent-500)] hover:underline mr-3">Resend</button>
                          )}
                          <button
                            disabled={isLastOwner || removingMemberId === m.id}
                            onClick={() => removeMember(m.id)}
                            title={isLastOwner ? "Cannot remove the only owner" : "Remove from organization"}
                            className="text-xs text-[color:var(--error)] hover:underline disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {removingMemberId === m.id ? <RefreshCw size={11} className="animate-spin" /> : null}
                            {removingMemberId === m.id ? "Removing…" : "Remove"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk assign properties modal */}
          {bulkAssignMemberId && (() => {
            const m = members.find(x => x.id === bulkAssignMemberId);
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-[color:var(--foreground)]">Assign Properties</h3>
                    <p className="text-xs text-[color:var(--muted)] mt-0.5">
                      {m?.name} · {selectedPropIds.size === 0 ? "All properties (default)" : `${selectedPropIds.size} selected`}
                    </p>
                  </div>
                  {orgProperties.length === 0 ? (
                    <p className="text-xs text-[color:var(--muted)] text-center py-4">Loading properties…</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {orgProperties.map(p => {
                        const checked = selectedPropIds.has(p.id);
                        return (
                          <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-[color:var(--line)] cursor-pointer hover:bg-[color:var(--background)] transition-colors">
                            <input type="checkbox" checked={checked} onChange={() => {
                              setSelectedPropIds(prev => {
                                const s = new Set(prev);
                                s.has(p.id) ? s.delete(p.id) : s.add(p.id);
                                return s;
                              });
                            }} className="accent-[color:var(--accent-500)] w-4 h-4" />
                            <span className="text-sm text-[color:var(--foreground)]">{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[10px] text-[color:var(--muted)]">Leave all unchecked to grant access to all properties.</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveBulkAssign} disabled={bulkSaving}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 text-white text-sm font-semibold transition-colors">
                      {bulkSaving ? <RefreshCw size={13} className="animate-spin" /> : null}
                      {bulkSaving ? "Saving…" : "Save Assignment"}
                    </button>
                    <button onClick={() => setBulkAssignMemberId(null)}
                      className="px-4 py-2.5 rounded-xl border border-[color:var(--line)] text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

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
  type SelNode = { id: string; label: string; sub?: string; badge?: string; type: string };
  const [selected, setSelected] = React.useState<SelNode | null>(null);
  const [properties, setProperties] = React.useState<Property[]>([]);

  React.useEffect(() => {
    api.properties.list().then(r => {
      setProperties(r.data.filter(p => org.propertyIds.includes(p.id)));
    }).catch(() => {});
  }, [org.propertyIds.join(",")]);

  const propById = React.useMemo(() => new Map(properties.map(p => [p.id, p])), [properties]);

  function handleNodeClick(_: React.MouseEvent, node: Node) {
    const id = node.id;
    if (id === org.id) {
      setSelected(p => p?.id === id ? null : { id, label: org.name, sub: `${org.type} · ${org.plan} plan`, type: "org" });
      return;
    }
    const prop = propById.get(id);
    if (prop) {
      setSelected(p => p?.id === id ? null : { id, label: prop.title, sub: prop.location.split(",")[0], badge: `${prop.occupiedRooms}/${prop.totalRooms} rooms`, type: "property" });
    }
  }

  // Build nodes + edges — org → property only
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
    rawNodes.push({
      id: prop.id, type: "prop-n", position: { x: 0, y: 0 },
      data: {
        label: prop.title, sub: prop.location.split(",")[0],
        badge: `${prop.occupiedRooms}/${prop.totalRooms} rooms`, isExp: false,
        onView: () => onNavigate({ tab: "properties", propId: prop.id }),
      } as NData,
    });
    rawEdges.push({ id: `e-${org.id}-${prop.id}`, source: org.id, target: prop.id, style: _EDGE_STYLE, markerEnd: _ARROW_END });
  }

  const layoutedNodes = applyDagreLayout(rawNodes, rawEdges);

  const rfKey = properties.map(p => p.id).join(",");

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
            :                               "bg-slate-300"
          }`} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[color:var(--foreground)] truncate">{selected.label}</p>
            {selected.badge && <p className="text-[11px] text-[color:var(--muted)] mt-0.5">{selected.badge}</p>}
            {selected.sub   && <p className="text-[11px] text-[color:var(--muted)]">{selected.sub}</p>}
            <p className="text-[10px] text-slate-400 mt-1 capitalize">{selected.type}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OrganizationTab — multi-org management ───────────────────────────────────

function buildLocalOrg(
  apiOrg: ApiOrganization,
  apiMembers: ApiOrgMember[],
  extra: { type?: Organization["type"]; address?: string; city?: string; phone?: string; email?: string; gstin?: string; website?: string } = {},
): Organization {
  const initials = apiOrg.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return {
    id: apiOrg.id,
    name: apiOrg.name,
    type: extra.type ?? "individual",
    address: extra.address ?? "",
    city: extra.city ?? "",
    phone: extra.phone ?? "",
    email: extra.email ?? "",
    ...(extra.gstin   ? { gstin: extra.gstin }     : {}),
    ...(extra.website ? { website: extra.website } : {}),
    logoInitials: initials,
    plan: "growth",
    propertyIds: [],
    ownerId: apiOrg.billingOwnerId,
    createdAt: apiOrg.createdAt,
    members: apiMembers.map(m => ({
      id: m.userId,
      name: m.name,
      email: m.email,
      role: m.role as OrgRole,
      assignedProperties: [],
      status: "active" as const,
      joinedAt: m.joinedAt,
    })),
  };
}

function OrganizationTab({ ownerInfo, onNavigate }: { ownerInfo: OwnerInfo; onNavigate: (t: NavTarget) => void }) {
  const [orgs, setOrgs]               = React.useState<Organization[]>([]);
  const [activeOrgId, setActiveOrgId] = React.useState<string | null>(null);
  const [showCreate, setShowCreate]   = React.useState(false);
  const [view, setView]               = React.useState<"details" | "tree">("details");
  const [loading, setLoading]         = React.useState(true);
  const [creating, setCreating]       = React.useState(false);

  // Load org from API on mount
  React.useEffect(() => {
    api.orgs.me()
      .then(async (apiOrg) => {
        const apiMembers = await api.orgs.listMembers(apiOrg.id).catch(() => [] as ApiOrgMember[]);
        const org = buildLocalOrg(apiOrg, apiMembers);
        setOrgs([org]);
        setActiveOrgId(org.id);
      })
      .catch(() => {}) // 404 = no org yet — show empty state
      .finally(() => setLoading(false));
  }, []);

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

  async function submitCreate() {
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

    setCreating(true);
    setCError(null);
    try {
      const apiOrg = await api.orgs.create(cName.trim());
      const seedMember: ApiOrgMember = {
        userId: ownerInfo.id,
        name: ownerInfo.name,
        email: ownerInfo.email,
        avatarUrl: ownerInfo.avatarUrl,
        role: "owner",
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      const newOrg = buildLocalOrg(apiOrg, [seedMember], {
        type: cType,
        address: cAddress.trim(),
        city: cCity.trim(),
        phone: cPhone.trim(),
        email: cEmail.trim().toLowerCase(),
        ...(cGstin.trim()   ? { gstin: cGstin.trim().toUpperCase() }   : {}),
        ...(cWebsite.trim() ? { website: cWebsite.trim() }             : {}),
      });
      setOrgs(prev => [...prev, newOrg]);
      setActiveOrgId(newOrg.id);
      setShowCreate(false);
      setCName(""); setCType("individual"); setCAddress(""); setCCity("");
      setCPhone(""); setCEmail(""); setCGstin(""); setCWebsite(""); setCError(null);
    } catch {
      setCError("Failed to create organization. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  const INP = "w-full px-3 py-2.5 rounded-xl border border-[color:var(--line)] text-sm bg-white outline-none focus:border-[color:var(--accent-500)] focus:ring-2 focus:ring-[color:var(--accent-50)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]";

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[color:var(--line)] p-10 flex items-center justify-center">
        <p className="text-xs text-[color:var(--muted)]">Loading…</p>
      </div>
    );
  }

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
              <PhoneInput
                placeholder="98765 43210"
                value={cPhone}
                onChange={setCPhone}
                className="bg-[color:var(--surface-card)]"
              />
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
              disabled={creating}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              <Landmark size={14} strokeWidth={2} /> {creating ? "Creating…" : "Create organization"}
            </button>
            <button
              onClick={cancelCreate}
              disabled={creating}
              className="px-5 py-2.5 rounded-xl text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors disabled:opacity-60"
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

const SEARCH_INDEX: { type: string; label: string; sub: string; nav: string }[] = [];

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


function NotifDropdown({ onClose, onNav, initialItems }: { onClose: () => void; onNav: (id: string) => void; initialItems: NotifItem[] }) {
  const [items, setItems] = useState(initialItems);

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
          <button onClick={() => {
            setItems(i => i.map(n => ({ ...n, read: true })));
            api.notifications.markAllRead().catch(() => {});
          }} className="text-[11px] font-semibold text-[color:var(--accent-600)] hover:underline">
            Mark all read
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto divide-y divide-[color:var(--line)]">
          {items.map(n => (
            <li key={n.id}>
              <button
                onClick={() => {
                  setItems(i => i.map(x => x.id === n.id ? { ...x, read: true } : x));
                  if (!n.read) api.notifications.markRead(n.id).catch(() => {});
                  onNav(n.nav); onClose();
                }}
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
  const toast = useToast();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function save() {
    onSave();
    onClose();
    toast.success("Preferences saved");
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
          <button onClick={save} className="text-xs font-semibold bg-[color:var(--accent-500)] hover:bg-[color:var(--accent-600)] text-white px-4 py-2 rounded-xl transition-colors">
            Save preferences
          </button>
          <button onClick={onClose} className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">Discard</button>
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const VALID_TABS = new Set(["overview","properties","tenants","payments","maintenance","reports","payouts","organization","account"]);

function OwnerDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeNav, setActiveNav] = useState(() => {
    const t = searchParams.get("tab") ?? "";
    return VALID_TABS.has(t) ? t : "overview";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deepPropId,    setDeepPropId]    = useState<string | null>(null);
  const [deepTenantId,  setDeepTenantId]  = useState<string | null>(null);
  // Incremented each time a deep-nav fires so the target tab remounts with fresh initialId
  const [deepPropVer,   setDeepPropVer]   = useState(0);
  const [deepTenantVer, setDeepTenantVer] = useState(0);

  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [contexts, setContexts] = useState<import("@/lib/api").RoleContext[]>([]);
  const [contextOpen, setContextOpen] = useState(false);
  const [apiPayments, setApiPayments] = useState<ApiPayment[] | null>(null);
  const [apiSummary, setApiSummary] = useState<PaymentSummary | null>(null);
  const [apiNotifications, setApiNotifications] = useState<ApiNotification[] | null>(null);
  const [apiChartPoints, setApiChartPoints] = useState<RevenueChartPoint[] | null>(null);
  const [apiReport, setApiReport] = useState<PropertyReport | null>(null);
  const [apiProperties, setApiProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const me = await api.auth.me();
        setUser(me);
        api.auth.contexts().then(setContexts).catch(() => {});

        // Non-critical: properties + payments + notifications + chart + report; partial failures are OK
        const propsRes = await api.properties.list().catch(() => ({ data: [] as Property[] }));
        setApiProperties(propsRes.data);
        const defaultPropId = propsRes.data[0]?.id ?? "p1";
        const [paymentsRes, summaryRes, notifRes, chartRes, reportRes] = await Promise.allSettled([
          api.payments.list({ limit: 50 }),
          api.payments.summary(),
          api.notifications.list(1, 20),
          api.reports.revenueChart(defaultPropId, 6),
          api.reports.property(defaultPropId),
        ]);
        if (paymentsRes.status === "fulfilled") setApiPayments(paymentsRes.value.data);
        if (summaryRes.status  === "fulfilled") setApiSummary(summaryRes.value);
        if (notifRes.status    === "fulfilled") setApiNotifications(notifRes.value.data);
        if (chartRes.status    === "fulfilled") setApiChartPoints(chartRes.value.points);
        if (reportRes.status   === "fulfilled") setApiReport(reportRes.value);
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
            router.replace("/login?next=/owner-dashboard");
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

  useEffect(() => { setAvatarError(false); }, [user?.avatarUrl]);

  const ownerDefaults = {
    name: user?.name || "Owner",
    initials: (user?.name || "Owner").split(" ").map(n => n[0]).join("").slice(0, 2),
    properties: apiProperties.length,
    beds: apiProperties.reduce((sum, p) => sum + p.totalRooms, 0),
  };

  const ownerInfo = {
    ...ownerDefaults,
    id:       user?.id || "",
    name:     user?.name || ownerDefaults.name,
    email:    user?.email || "",
    initials: (user?.name || ownerDefaults.name).split(" ").map(n => n[0]).join("").slice(0, 2),
    avatarUrl: user?.avatarUrl || "",
  };

  // Nav initiated by the user (sidebar / search / notifs) — clears any deep link
  function navTo(tab: string) {
    setDeepPropId(null);
    setDeepTenantId(null);
    setActiveNav(tab);
    router.replace(`/owner-dashboard?tab=${tab}`, { scroll: false });
  }

  // Nav from OrgTree View buttons — carries a deep link to open a specific entity
  function handleDeepNav({ tab, propId, tenantId }: NavTarget) {
    if (propId !== undefined)   { setDeepPropId(propId);     setDeepPropVer(v => v + 1); }
    if (tenantId !== undefined) { setDeepTenantId(tenantId); setDeepTenantVer(v => v + 1); }
    setActiveNav(tab);
    router.replace(`/owner-dashboard?tab=${tab}`, { scroll: false });
  }

  // Settings — loaded from localStorage, applied immediately on change
  const [settings, setSettings] = useState<DashSettings>(DEFAULT_SETTINGS);
  React.useEffect(() => {
    const saved = loadSettings();
    setSettings(saved);
    const urlTab = searchParams.get("tab") ?? "";
    if (saved.defaultPage && saved.defaultPage !== "overview" && !VALID_TABS.has(urlTab)) setActiveNav(saved.defaultPage);
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

  const apiNotifItems: NotifItem[] = apiNotifications?.map(mapApiNotif) ?? [];
  const unreadCount = apiNotifItems.filter(n => !n.read).length;

  const stats = React.useMemo(() => {
    const totalBeds    = apiProperties.reduce((sum, p) => sum + p.totalRooms, 0);
    const occupiedBeds = apiProperties.reduce((sum, p) => sum + p.occupiedRooms, 0);
    const overdueTenants = apiSummary?.overdueTenants ?? 0;
    const pendingAmount  = apiSummary?.pendingAmount  ?? 0;
    const totalCollected = apiSummary?.totalCollectedThisMonth ?? 0;
    const overdueAmount  = Math.max(0, pendingAmount - (apiSummary?.pendingAmount ?? 0));

    const revPct = apiReport?.revenueChangePercent;
    const revSub = revPct != null
      ? `${revPct >= 0 ? "↑" : "↓"} ${Math.abs(revPct).toFixed(1)}% vs last month`
      : "vs last month";
    const revUp = revPct == null || revPct >= 0;

    const totalRooms = Math.max(totalBeds, 1);
    const kpi = [
      { label: "Monthly Revenue", value: `₹${totalCollected.toLocaleString("en-IN")}`, sub: revSub, up: revUp, icon: IndianRupee, color: "accent" },
      { label: "Occupancy Rate",  value: `${((occupiedBeds / totalRooms) * 100).toFixed(1)}%`, sub: `${occupiedBeds} of ${totalBeds} rooms filled`, up: true, icon: BedDouble, color: "trust" },
      { label: "Rent Collected",  value: `₹${totalCollected.toLocaleString("en-IN")}`, sub: "This month", up: true, icon: CheckCircle2, color: "success" },
      { label: "Pending Amount",  value: `₹${pendingAmount.toLocaleString("en-IN")}`, sub: `From ${apiSummary?.totalTenants ?? 0} tenants`, up: false, icon: Clock, color: "warning" },
    ];

    const atAGlance = [
      { label: "Occupied Rooms",   value: occupiedBeds.toString(), sub: `Across ${apiProperties.length} properties`, icon: BedDouble, color: "text-[color:var(--accent-400)]" },
      { label: "Vacant Rooms",     value: (totalBeds - occupiedBeds).toString(), sub: "Ready for move-in", icon: Home, color: "text-slate-400" },
      { label: "Overdue Accounts", value: overdueTenants.toString(), sub: "Requires attention", icon: AlertCircle, color: "text-[color:var(--error)]" },
    ];

    const financials = [
      { label: "Total Collected", value: `₹${totalCollected.toLocaleString("en-IN")}`, color: "success" },
      { label: "Pending",         value: `₹${pendingAmount.toLocaleString("en-IN")}`,   color: "warning" },
      { label: "Overdue",         value: `₹${overdueAmount.toLocaleString("en-IN")}`,   color: "error" },
    ];

    const alerts: AlertItem[] = [
      ...(overdueTenants > 0 ? [{ type: "error" as const, icon: AlertCircle, title: `${overdueTenants} overdue rent payment${overdueTenants !== 1 ? "s" : ""}`, action: "Review" }] : []),
      ...(pendingAmount   > 0 ? [{ type: "warning" as const, icon: Clock, title: `₹${pendingAmount.toLocaleString("en-IN")} pending rent`, action: "View" }] : []),
    ];

    return { kpi, atAGlance, financials, alerts };
  }, [apiSummary, apiReport, apiProperties]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    if (auth) await signOut(auth);
    router.push("/login");
  }

  const sidebarW  = settings.sidebarCollapsed ? "w-14"    : "w-[240px]";
  const mainML    = settings.sidebarCollapsed ? "lg:ml-14" : "lg:ml-[240px]";

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
        <div className="max-w-md rounded-2xl border border-[color:var(--line)] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--error-50)] text-[color:var(--error-700)]">
            <AlertCircle size={20} />
          </div>
          <h1 className="text-base font-bold text-[color:var(--foreground)]">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {authError ?? "We could not verify your owner session."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[color:var(--accent-500)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--accent-600)]"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-[color:var(--line)] px-4 py-2 text-xs font-semibold text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
            >
              Sign in again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-[color:var(--background)]"
      data-dash-theme={effectiveTheme}
      data-dash-density={settings.density}
    >

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 ${sidebarW} bg-[#1A1A18] flex flex-col py-6 transition-all duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        {/* Brand logo */}
        <div className={`mb-8 flex items-center gap-3 ${settings.sidebarCollapsed ? "justify-center px-0" : "px-5"}`}>
          <div className="w-9 h-9 rounded-xl bg-[color:var(--accent-500)] flex items-center justify-center shrink-0 select-none">
            <Home size={16} strokeWidth={2} color="white" />
          </div>
          {!settings.sidebarCollapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm text-white tracking-tight truncate leading-snug">{ownerInfo.name}</p>
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
            title={settings.sidebarCollapsed ? `${ownerInfo.name} · Account` : undefined}
            className={`w-full flex items-center gap-3 mb-2 px-2 py-2 rounded-xl transition-colors text-left ${
              activeNav === "account" ? "bg-[color:var(--accent-500)]/20" : "hover:bg-white/5"
            } ${settings.sidebarCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 rounded-xl bg-[color:var(--accent-500)]/20 flex items-center justify-center text-xs font-bold text-[color:var(--accent-400)] shrink-0 overflow-hidden">
              {ownerInfo.avatarUrl && !avatarError
                ? <img src={ownerInfo.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setAvatarError(true)} />
                : ownerInfo.initials}
            </div>
            {!settings.sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{ownerInfo.name}</p>
                  <p className="text-[10px] text-white/40 truncate">{ownerInfo.properties} properties · {ownerInfo.beds} beds</p>
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
            {/* Role context switcher */}
            {contexts.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setContextOpen(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[color:var(--line)] hover:bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors"
                >
                  <Users size={13} />
                  <span className="hidden sm:inline">Switch Role</span>
                  <ChevronDown size={12} />
                </button>
                {contextOpen && (
                  <div className="absolute right-0 top-10 z-50 w-60 bg-white rounded-2xl border border-[color:var(--line)] shadow-xl overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--muted)] px-4 pt-3 pb-2">Your Roles</p>
                    {contexts.map(ctx => (
                      <button
                        key={`${ctx.propertyId}-${ctx.role}`}
                        onClick={async () => {
                          await api.auth.setPreferredContext(ctx.propertyId).catch(() => {});
                          setContextOpen(false);
                          if (ctx.role === "tenant") router.push("/tenant-dashboard");
                        }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[color:var(--background)] text-left transition-colors"
                      >
                        <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${ctx.role === "tenant" ? "bg-[color:var(--accent-100)] text-[color:var(--accent-700)]" : "bg-slate-100 text-slate-600"}`}>
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
              {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} onNav={(id) => { navTo(id); setNotifOpen(false); }} initialItems={apiNotifItems} />}
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
          {(() => {
            const effectiveTransactions: TxItem[] = apiPayments?.map(mapApiPaymentToTx) ?? [];
            return (
              <>
                {activeNav === "overview"     && <OverviewTab stats={stats} transactions={effectiveTransactions} chartPoints={apiChartPoints} />}
                {activeNav === "payments"     && <PaymentsTab stats={stats} transactions={effectiveTransactions} />}
              </>
            );
          })()}
          {activeNav === "properties"    && <PropertiesTab key={deepPropVer}   initialPropId={deepPropId} properties={apiProperties} />}
          {activeNav === "tenants"       && <TenantsTab   key={deepTenantVer} initialTenantId={deepTenantId} onNav={navTo} />}
          {activeNav === "maintenance"   && <MaintenanceTab />}
          {activeNav === "reports"       && <ReportsTab />}
          {activeNav === "payouts"       && <PayoutsTab />}
          {activeNav === "organization"  && <OrganizationTab ownerInfo={ownerInfo} onNavigate={handleDeepNav} />}
          {activeNav === "account"       && <AccountTab user={user} />}
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

export default function OwnerDashboardClientWithBoundary() {
  return (
    <DashboardErrorBoundary>
      <OwnerDashboardClient />
    </DashboardErrorBoundary>
  );
}

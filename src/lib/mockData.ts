// ─── Shared mock data — single source of truth ───────────────────────────────
// All dashboards import from here. Never redefine these entities inline.

// ─── Types ────────────────────────────────────────────────────────────────────

export type Property = {
  id: string; name: string; address: string;
  beds: number; occupied: number; rent: number; pending: number;
  image: string | null; contact?: string; manager?: string;
};

export type Room = {
  id: string; number: string; type: string;
  tenant: string | null; rent: number; status: "occupied" | "vacant";
};

export type Floor = { id: string; label: string; roomIds: string[] };

export type Tenant = {
  id: string; initials: string; name: string;
  property: string; room: string; lease: string;
  risk: "none" | "late" | "expiring"; paid: boolean;
};

export type RentHistoryEntry = {
  month: string; amount: string;
  status: "paid" | "pending" | "overdue";
  paidOn?: string; ref?: string; receipt?: string;
};

export type TenantExt = {
  phone: string; email: string; moveIn: string;
  leaseStart?: string; leaseEnd?: string; leaseDaysLeft?: number; checkIn?: string;
  deposit: number; depositPaid: boolean; noticeGiven: boolean;
  idType: string; idVerified: boolean; agreementSigned: boolean;
  emergencyName: string; emergencyPhone: string;
  rentHistory: RentHistoryEntry[];
};

export type TenantDoc = {
  type: string; status: "verified" | "pending" | "missing"; uploadedOn?: string;
};

export type MaintenanceTicket = {
  id: string; title: string; property: string;
  category: string; date: string;
  status: "in_progress" | "pending" | "resolved";
  priority: "high" | "medium" | "low";
  tenantId: string | null;
};

export type MaintenanceExt = {
  description: string; assignee: string | null; response?: string;
  comments: { author: string; text: string; time: string }[];
};

export type Transaction = {
  id: string; initials: string; name: string;
  property: string; amount: string; date: string;
  status: "paid" | "pending" | "overdue";
};

export type Notice = {
  id: string; title: string; body: string; date: string;
  type: "info" | "reminder" | "policy"; read: boolean; propertyId: string;
};

// ─── Properties ───────────────────────────────────────────────────────────────

export const PROPERTIES: Property[] = [
  { id: "p1", name: "Sunshine PG",     address: "Koramangala, Bangalore", beds: 12, occupied: 10, rent: 8500,  pending: 1, image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=240&fit=crop&q=80", contact: "+91 98765 43210", manager: "Vikram Shetty" },
  { id: "p2", name: "Green Haven",     address: "Indiranagar, Bangalore",  beds: 8,  occupied: 7,  rent: 10000, pending: 1, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=240&fit=crop&q=80", contact: "+91 98765 43211", manager: "Sunita Devi"   },
  { id: "p3", name: "Royal Residency", address: "HSR Layout, Bangalore",   beds: 10, occupied: 8,  rent: 9500,  pending: 1, image: null,                                                                                      contact: "+91 98765 43212", manager: "Ramu Kumar"    },
];

export const PROPERTY_ROOMS: Record<string, Room[]> = {
  p1: [
    { id: "r1",  number: "101", type: "Single AC", tenant: "Rahul Sharma",  rent: 8500,  status: "occupied" },
    { id: "r2",  number: "102", type: "Single",    tenant: "Neha Gupta",    rent: 8500,  status: "occupied" },
    { id: "r3",  number: "103", type: "Double",    tenant: "Arjun Singh",   rent: 8500,  status: "occupied" },
    { id: "r4",  number: "104", type: "Single",    tenant: "Divya Nair",    rent: 8500,  status: "occupied" },
    { id: "r5",  number: "105", type: "Double",    tenant: "Suresh Babu",   rent: 8500,  status: "occupied" },
    { id: "r6",  number: "106", type: "Single",    tenant: "Lakshmi Iyer",  rent: 8500,  status: "occupied" },
    { id: "r7",  number: "107", type: "Single",    tenant: "Mohan Das",     rent: 8500,  status: "occupied" },
    { id: "r8",  number: "108", type: "Double",    tenant: "Kavya Reddy",   rent: 8500,  status: "occupied" },
    { id: "r9",  number: "109", type: "Single",    tenant: "Vikram Joshi",  rent: 8500,  status: "occupied" },
    { id: "r10", number: "110", type: "Single",    tenant: "Anita Desai",   rent: 8500,  status: "occupied" },
    { id: "r11", number: "111", type: "Single",    tenant: null,            rent: 8500,  status: "vacant"   },
    { id: "r12", number: "112", type: "Double",    tenant: null,            rent: 8500,  status: "vacant"   },
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

export const PROPERTY_FLOORS: Record<string, Floor[]> = {
  p1: [
    { id: "p1f1", label: "Floor 1", roomIds: ["r1",  "r2",  "r3",  "r4"]          },
    { id: "p1f2", label: "Floor 2", roomIds: ["r5",  "r6",  "r7",  "r8"]          },
    { id: "p1f3", label: "Floor 3", roomIds: ["r9",  "r10", "r11", "r12"]         },
  ],
  p2: [
    { id: "p2f1", label: "Floor 1", roomIds: ["r13", "r14", "r15", "r16"]         },
    { id: "p2f2", label: "Floor 2", roomIds: ["r17", "r18", "r19", "r20"]         },
  ],
  p3: [
    { id: "p3f1", label: "Floor 1", roomIds: ["r21", "r22", "r23", "r24", "r25"]  },
    { id: "p3f2", label: "Floor 2", roomIds: ["r26", "r27", "r28", "r29", "r30"]  },
  ],
};

export const PROPERTY_AMENITIES: Record<string, string[]> = {
  p1: ["WiFi", "AC", "Laundry", "Parking", "CCTV", "Water 24×7", "Security Guard", "Gym", "Power Backup"],
  p2: ["WiFi", "Parking", "CCTV", "AC Rooms", "Housekeeping", "Water Purifier"],
  p3: ["WiFi", "Gym", "Parking", "CCTV", "Laundry", "Cafeteria", "Power Backup"],
};

export const PROPERTY_HOUSE_RULES: Record<string, string[]> = {
  p1: ["No smoking on premises", "Visitors allowed till 9 PM", "No loud music after 10 PM", "Monthly rent due by 5th"],
  p2: ["No smoking on premises", "Visitors allowed till 8 PM", "No loud music after 10 PM", "Monthly rent due by 5th"],
  p3: ["No smoking on premises", "Visitors allowed till 10 PM", "No loud music after 11 PM", "Monthly rent due by 5th"],
};

export const PROPERTY_GALLERY: Record<string, string[]> = {
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

// ─── Derived lookups ──────────────────────────────────────────────────────────

export const ROOM_BY_ID: Record<string, Room> = Object.fromEntries(
  Object.values(PROPERTY_ROOMS).flat().map(r => [r.id, r])
);

// ─── Tenants ──────────────────────────────────────────────────────────────────

export const TENANTS: Tenant[] = [
  { id: "u1",  initials: "RS", name: "Rahul Sharma",  property: "Sunshine PG",     room: "101", lease: "Dec 2026", risk: "none",     paid: true  },
  { id: "u2",  initials: "PV", name: "Priya Verma",   property: "Green Haven",     room: "A1",  lease: "May 2026", risk: "none",     paid: true  },
  { id: "u3",  initials: "AP", name: "Amit Patel",    property: "Royal Residency", room: "201", lease: "Apr 2026", risk: "expiring", paid: true  },
  { id: "u4",  initials: "NG", name: "Neha Gupta",    property: "Sunshine PG",     room: "102", lease: "Nov 2025", risk: "none",     paid: false },
  { id: "u5",  initials: "KR", name: "Kiran Rao",     property: "Green Haven",     room: "A2",  lease: "Oct 2025", risk: "late",     paid: false },
  { id: "u6",  initials: "SM", name: "Sonia Mehta",   property: "Royal Residency", room: "202", lease: "Sep 2025", risk: "late",     paid: false },
  { id: "u7",  initials: "AS", name: "Arjun Singh",   property: "Sunshine PG",     room: "103", lease: "Feb 2026", risk: "none",     paid: true  },
  { id: "u8",  initials: "DN", name: "Divya Nair",    property: "Sunshine PG",     room: "104", lease: "Mar 2026", risk: "none",     paid: true  },
  { id: "u9",  initials: "SB", name: "Suresh Babu",   property: "Sunshine PG",     room: "105", lease: "Jan 2026", risk: "none",     paid: true  },
  { id: "u10", initials: "LI", name: "Lakshmi Iyer",  property: "Sunshine PG",     room: "106", lease: "Jun 2026", risk: "none",     paid: true  },
  { id: "u11", initials: "MD", name: "Mohan Das",     property: "Sunshine PG",     room: "107", lease: "Aug 2026", risk: "none",     paid: false },
  { id: "u12", initials: "KR", name: "Kavya Reddy",   property: "Sunshine PG",     room: "108", lease: "May 2026", risk: "late",     paid: false },
  { id: "u13", initials: "VJ", name: "Vikram Joshi",  property: "Sunshine PG",     room: "109", lease: "Jul 2026", risk: "none",     paid: true  },
  { id: "u14", initials: "AD", name: "Anita Desai",   property: "Sunshine PG",     room: "110", lease: "Sep 2026", risk: "expiring", paid: true  },
  { id: "u15", initials: "RS", name: "Ritu Sharma",   property: "Green Haven",     room: "A3",  lease: "Feb 2026", risk: "none",     paid: true  },
  { id: "u16", initials: "DM", name: "Deepak Menon",  property: "Green Haven",     room: "A4",  lease: "Mar 2026", risk: "none",     paid: true  },
  { id: "u17", initials: "SP", name: "Sneha Pillai",  property: "Green Haven",     room: "A5",  lease: "Apr 2026", risk: "none",     paid: true  },
  { id: "u18", initials: "RN", name: "Rahul Nair",    property: "Green Haven",     room: "A6",  lease: "Jan 2026", risk: "late",     paid: false },
  { id: "u19", initials: "PV", name: "Pooja Verma",   property: "Green Haven",     room: "A7",  lease: "Jun 2026", risk: "none",     paid: true  },
  { id: "u20", initials: "RK", name: "Rajesh Kumar",  property: "Royal Residency", room: "203", lease: "Feb 2026", risk: "none",     paid: true  },
  { id: "u21", initials: "MP", name: "Meera Pillai",  property: "Royal Residency", room: "204", lease: "May 2026", risk: "none",     paid: true  },
  { id: "u22", initials: "AS", name: "Anil Shetty",   property: "Royal Residency", room: "205", lease: "Mar 2026", risk: "expiring", paid: true  },
  { id: "u23", initials: "ZK", name: "Zara Khan",     property: "Royal Residency", room: "206", lease: "Jun 2026", risk: "none",     paid: true  },
  { id: "u24", initials: "SS", name: "Sunil Sharma",  property: "Royal Residency", room: "207", lease: "Jul 2026", risk: "none",     paid: false },
  { id: "u25", initials: "NG", name: "Nisha Gupta",   property: "Royal Residency", room: "208", lease: "Aug 2026", risk: "none",     paid: true  },
];

export const TENANT_BY_NAME: Record<string, string> = Object.fromEntries(
  TENANTS.map(t => [t.name, t.id])
);

export const TENANTS_EXT: Record<string, TenantExt> = {
  u1:  { phone: "+91 98765 11111", email: "rahul.s@gmail.com",   moveIn: "Jan 2024", leaseStart: "Jan 1, 2026",  leaseEnd: "Dec 31, 2026", leaseDaysLeft: 250, checkIn: "Jan 1, 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Suresh Sharma",  emergencyPhone: "+91 97777 11111",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-001", receipt: "RCP-2504" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid", paidOn: "Mar 1, 2025",  ref: "TXN-2503-001", receipt: "RCP-2503" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid", paidOn: "Feb 3, 2025",  ref: "TXN-2502-001", receipt: "RCP-2502" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid", paidOn: "Jan 4, 2025",  ref: "TXN-2501-001", receipt: "RCP-2501" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid", paidOn: "Dec 2, 2024",  ref: "TXN-2412-001", receipt: "RCP-2412" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid", paidOn: "Nov 5, 2024",  ref: "TXN-2411-001", receipt: "RCP-2411" },
    ]},
  u2:  { phone: "+91 98765 22222", email: "priya.v@gmail.com",   moveIn: "Mar 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Anita Verma",    emergencyPhone: "+91 97777 22222",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-002" },
      { month: "Mar 2025", amount: "₹10,000", status: "paid", paidOn: "Mar 3, 2025",  ref: "TXN-2503-002" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid", paidOn: "Feb 1, 2025",  ref: "TXN-2502-002" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid", paidOn: "Jan 2, 2025",  ref: "TXN-2501-002" },
      { month: "Dec 2024", amount: "₹10,000", status: "paid", paidOn: "Dec 3, 2024",  ref: "TXN-2412-002" },
      { month: "Nov 2024", amount: "₹10,000", status: "paid", paidOn: "Nov 1, 2024",  ref: "TXN-2411-002" },
    ]},
  u3:  { phone: "+91 98765 33333", email: "amit.p@gmail.com",    moveIn: "Jun 2024", deposit: 19000, depositPaid: true,  noticeGiven: true,  idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Rekha Patel",    emergencyPhone: "+91 97777 33333",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "paid",    paidOn: "Apr 3, 2025",  ref: "TXN-2504-003" },
      { month: "Mar 2025", amount: "₹9,500",  status: "paid",    paidOn: "Mar 2, 2025",  ref: "TXN-2503-003" },
      { month: "Feb 2025", amount: "₹9,500",  status: "overdue" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid",    paidOn: "Jan 6, 2025",  ref: "TXN-2501-003" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid",    paidOn: "Dec 4, 2024",  ref: "TXN-2412-003" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid",    paidOn: "Nov 2, 2024",  ref: "TXN-2411-003" },
    ]},
  u4:  { phone: "+91 98765 44444", email: "neha.g@gmail.com",    moveIn: "Aug 2024", deposit: 17000, depositPaid: false, noticeGiven: false, idType: "Passport", idVerified: false, agreementSigned: true,  emergencyName: "Rakesh Gupta",   emergencyPhone: "+91 97777 44444",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "pending" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid",    paidOn: "Mar 8, 2025",  ref: "TXN-2503-004" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid",    paidOn: "Feb 5, 2025",  ref: "TXN-2502-004" },
      { month: "Jan 2025", amount: "₹8,500",  status: "overdue" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid",    paidOn: "Dec 7, 2024",  ref: "TXN-2412-004" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid",    paidOn: "Nov 4, 2024",  ref: "TXN-2411-004" },
    ]},
  u5:  { phone: "+91 98765 55555", email: "kiran.r@gmail.com",   moveIn: "Oct 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: false, emergencyName: "Sunita Rao",     emergencyPhone: "+91 97777 55555",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "pending" },
      { month: "Mar 2025", amount: "₹10,000", status: "paid",    paidOn: "Mar 10, 2025", ref: "TXN-2503-005" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid",    paidOn: "Feb 9, 2025",  ref: "TXN-2502-005" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid",    paidOn: "Jan 11, 2025", ref: "TXN-2501-005" },
      { month: "Dec 2024", amount: "₹10,000", status: "paid",    paidOn: "Dec 9, 2024",  ref: "TXN-2412-005" },
      { month: "Nov 2024", amount: "₹10,000", status: "paid",    paidOn: "Nov 10, 2024", ref: "TXN-2411-005" },
    ]},
  u6:  { phone: "+91 98765 66666", email: "sonia.m@gmail.com",   moveIn: "Nov 2024", deposit: 19000, depositPaid: true,  noticeGiven: true,  idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Kavita Mehta",   emergencyPhone: "+91 97777 66666",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "overdue" },
      { month: "Mar 2025", amount: "₹9,500",  status: "overdue" },
      { month: "Feb 2025", amount: "₹9,500",  status: "paid",    paidOn: "Feb 12, 2025", ref: "TXN-2502-006" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid",    paidOn: "Jan 14, 2025", ref: "TXN-2501-006" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid",    paidOn: "Dec 11, 2024", ref: "TXN-2412-006" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid",    paidOn: "Nov 12, 2024", ref: "TXN-2411-006" },
    ]},
  u7:  { phone: "+91 98765 77777", email: "arjun.s@gmail.com",   moveIn: "Feb 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Rohit Singh",    emergencyPhone: "+91 97777 77777",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-007" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid", paidOn: "Mar 1, 2025",  ref: "TXN-2503-007" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid", paidOn: "Feb 3, 2025",  ref: "TXN-2502-007" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid", paidOn: "Jan 4, 2025",  ref: "TXN-2501-007" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid", paidOn: "Dec 2, 2024",  ref: "TXN-2412-007" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid", paidOn: "Nov 5, 2024",  ref: "TXN-2411-007" },
    ]},
  u8:  { phone: "+91 98765 88888", email: "divya.n@gmail.com",   moveIn: "Mar 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Suresh Nair",    emergencyPhone: "+91 97777 88888",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "paid", paidOn: "Apr 3, 2025",  ref: "TXN-2504-008" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid", paidOn: "Mar 2, 2025",  ref: "TXN-2503-008" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid", paidOn: "Feb 1, 2025",  ref: "TXN-2502-008" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid", paidOn: "Jan 2, 2025",  ref: "TXN-2501-008" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid", paidOn: "Dec 3, 2024",  ref: "TXN-2412-008" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid", paidOn: "Nov 1, 2024",  ref: "TXN-2411-008" },
    ]},
  u9:  { phone: "+91 98765 99999", email: "suresh.b@gmail.com",  moveIn: "Jan 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Meena Babu",     emergencyPhone: "+91 97777 99999",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "paid", paidOn: "Apr 1, 2025",  ref: "TXN-2504-009" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid", paidOn: "Mar 3, 2025",  ref: "TXN-2503-009" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid", paidOn: "Feb 4, 2025",  ref: "TXN-2502-009" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid", paidOn: "Jan 5, 2025",  ref: "TXN-2501-009" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid", paidOn: "Dec 4, 2024",  ref: "TXN-2412-009" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid", paidOn: "Nov 3, 2024",  ref: "TXN-2411-009" },
    ]},
  u10: { phone: "+91 97654 10101", email: "lakshmi.i@gmail.com", moveIn: "Jun 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Vijay Iyer",     emergencyPhone: "+91 96666 10101",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-010" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid", paidOn: "Mar 1, 2025",  ref: "TXN-2503-010" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid", paidOn: "Feb 3, 2025",  ref: "TXN-2502-010" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid", paidOn: "Jan 4, 2025",  ref: "TXN-2501-010" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid", paidOn: "Dec 2, 2024",  ref: "TXN-2412-010" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid", paidOn: "Nov 6, 2024",  ref: "TXN-2411-010" },
    ]},
  u11: { phone: "+91 97654 11111", email: "mohan.d@gmail.com",   moveIn: "Aug 2024", deposit: 17000, depositPaid: false, noticeGiven: false, idType: "PAN",      idVerified: false, agreementSigned: true,  emergencyName: "Rama Das",       emergencyPhone: "+91 96666 11111",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "pending" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid",    paidOn: "Mar 9, 2025",  ref: "TXN-2503-011" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid",    paidOn: "Feb 7, 2025",  ref: "TXN-2502-011" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid",    paidOn: "Jan 8, 2025",  ref: "TXN-2501-011" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid",    paidOn: "Dec 6, 2024",  ref: "TXN-2412-011" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid",    paidOn: "Nov 8, 2024",  ref: "TXN-2411-011" },
    ]},
  u12: { phone: "+91 97654 12121", email: "kavya.r@gmail.com",   moveIn: "Sep 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Suresh Reddy",   emergencyPhone: "+91 96666 12121",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "overdue" },
      { month: "Mar 2025", amount: "₹8,500",  status: "overdue" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid",    paidOn: "Feb 10, 2025", ref: "TXN-2502-012" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid",    paidOn: "Jan 9, 2025",  ref: "TXN-2501-012" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid",    paidOn: "Dec 8, 2024",  ref: "TXN-2412-012" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid",    paidOn: "Nov 7, 2024",  ref: "TXN-2411-012" },
    ]},
  u13: { phone: "+91 97654 13131", email: "vikram.j@gmail.com",  moveIn: "Jul 2024", deposit: 17000, depositPaid: true,  noticeGiven: false, idType: "Passport", idVerified: true,  agreementSigned: true,  emergencyName: "Renu Joshi",     emergencyPhone: "+91 96666 13131",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-013" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid", paidOn: "Mar 3, 2025",  ref: "TXN-2503-013" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid", paidOn: "Feb 2, 2025",  ref: "TXN-2502-013" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid", paidOn: "Jan 3, 2025",  ref: "TXN-2501-013" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid", paidOn: "Dec 1, 2024",  ref: "TXN-2412-013" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid", paidOn: "Nov 4, 2024",  ref: "TXN-2411-013" },
    ]},
  u14: { phone: "+91 97654 14141", email: "anita.d@gmail.com",   moveIn: "Sep 2024", deposit: 17000, depositPaid: true,  noticeGiven: true,  idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Prakash Desai",  emergencyPhone: "+91 96666 14141",
    rentHistory: [
      { month: "Apr 2025", amount: "₹8,500",  status: "paid", paidOn: "Apr 1, 2025",  ref: "TXN-2504-014" },
      { month: "Mar 2025", amount: "₹8,500",  status: "paid", paidOn: "Mar 2, 2025",  ref: "TXN-2503-014" },
      { month: "Feb 2025", amount: "₹8,500",  status: "paid", paidOn: "Feb 1, 2025",  ref: "TXN-2502-014" },
      { month: "Jan 2025", amount: "₹8,500",  status: "paid", paidOn: "Jan 2, 2025",  ref: "TXN-2501-014" },
      { month: "Dec 2024", amount: "₹8,500",  status: "paid", paidOn: "Dec 3, 2024",  ref: "TXN-2412-014" },
      { month: "Nov 2024", amount: "₹8,500",  status: "paid", paidOn: "Nov 2, 2024",  ref: "TXN-2411-014" },
    ]},
  u15: { phone: "+91 97654 15151", email: "ritu.s@gmail.com",    moveIn: "Feb 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Ramesh Sharma",  emergencyPhone: "+91 96666 15151",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-015" },
      { month: "Mar 2025", amount: "₹10,000", status: "paid", paidOn: "Mar 1, 2025",  ref: "TXN-2503-015" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid", paidOn: "Feb 3, 2025",  ref: "TXN-2502-015" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid", paidOn: "Jan 4, 2025",  ref: "TXN-2501-015" },
      { month: "Dec 2024", amount: "₹10,000", status: "paid", paidOn: "Dec 2, 2024",  ref: "TXN-2412-015" },
      { month: "Nov 2024", amount: "₹10,000", status: "paid", paidOn: "Nov 5, 2024",  ref: "TXN-2411-015" },
    ]},
  u16: { phone: "+91 97654 16161", email: "deepak.m@gmail.com",  moveIn: "Mar 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Leela Menon",    emergencyPhone: "+91 96666 16161",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "paid", paidOn: "Apr 3, 2025",  ref: "TXN-2504-016" },
      { month: "Mar 2025", amount: "₹10,000", status: "paid", paidOn: "Mar 4, 2025",  ref: "TXN-2503-016" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid", paidOn: "Feb 5, 2025",  ref: "TXN-2502-016" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid", paidOn: "Jan 6, 2025",  ref: "TXN-2501-016" },
      { month: "Dec 2024", amount: "₹10,000", status: "paid", paidOn: "Dec 4, 2024",  ref: "TXN-2412-016" },
      { month: "Nov 2024", amount: "₹10,000", status: "paid", paidOn: "Nov 2, 2024",  ref: "TXN-2411-016" },
    ]},
  u17: { phone: "+91 97654 17171", email: "sneha.p@gmail.com",   moveIn: "Apr 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Mohan Pillai",   emergencyPhone: "+91 96666 17171",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "paid", paidOn: "Apr 1, 2025",  ref: "TXN-2504-017" },
      { month: "Mar 2025", amount: "₹10,000", status: "paid", paidOn: "Mar 2, 2025",  ref: "TXN-2503-017" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid", paidOn: "Feb 2, 2025",  ref: "TXN-2502-017" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid", paidOn: "Jan 3, 2025",  ref: "TXN-2501-017" },
      { month: "Dec 2024", amount: "₹10,000", status: "paid", paidOn: "Dec 1, 2024",  ref: "TXN-2412-017" },
      { month: "Nov 2024", amount: "₹10,000", status: "paid", paidOn: "Nov 3, 2024",  ref: "TXN-2411-017" },
    ]},
  u18: { phone: "+91 97654 18181", email: "rahul.n@gmail.com",   moveIn: "Jan 2025", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "Passport", idVerified: true,  agreementSigned: false, emergencyName: "Geetha Nair",    emergencyPhone: "+91 96666 18181",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "overdue" },
      { month: "Mar 2025", amount: "₹10,000", status: "overdue" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid",    paidOn: "Feb 14, 2025", ref: "TXN-2502-018" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid",    paidOn: "Jan 15, 2025", ref: "TXN-2501-018" },
    ]},
  u19: { phone: "+91 97654 19191", email: "pooja.v@gmail.com",   moveIn: "Jun 2024", deposit: 20000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Sunil Verma",    emergencyPhone: "+91 96666 19191",
    rentHistory: [
      { month: "Apr 2025", amount: "₹10,000", status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-019" },
      { month: "Mar 2025", amount: "₹10,000", status: "paid", paidOn: "Mar 1, 2025",  ref: "TXN-2503-019" },
      { month: "Feb 2025", amount: "₹10,000", status: "paid", paidOn: "Feb 3, 2025",  ref: "TXN-2502-019" },
      { month: "Jan 2025", amount: "₹10,000", status: "paid", paidOn: "Jan 4, 2025",  ref: "TXN-2501-019" },
      { month: "Dec 2024", amount: "₹10,000", status: "paid", paidOn: "Dec 3, 2024",  ref: "TXN-2412-019" },
      { month: "Nov 2024", amount: "₹10,000", status: "paid", paidOn: "Nov 1, 2024",  ref: "TXN-2411-019" },
    ]},
  u20: { phone: "+91 97654 20202", email: "rajesh.k@gmail.com",  moveIn: "Feb 2024", deposit: 19000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Sunita Kumar",   emergencyPhone: "+91 96666 20202",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-020" },
      { month: "Mar 2025", amount: "₹9,500",  status: "paid", paidOn: "Mar 1, 2025",  ref: "TXN-2503-020" },
      { month: "Feb 2025", amount: "₹9,500",  status: "paid", paidOn: "Feb 3, 2025",  ref: "TXN-2502-020" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid", paidOn: "Jan 4, 2025",  ref: "TXN-2501-020" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid", paidOn: "Dec 2, 2024",  ref: "TXN-2412-020" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid", paidOn: "Nov 5, 2024",  ref: "TXN-2411-020" },
    ]},
  u21: { phone: "+91 97654 21212", email: "meera.p@gmail.com",   moveIn: "May 2024", deposit: 19000, depositPaid: true,  noticeGiven: false, idType: "PAN",      idVerified: true,  agreementSigned: true,  emergencyName: "Rajan Pillai",   emergencyPhone: "+91 96666 21212",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "paid", paidOn: "Apr 1, 2025",  ref: "TXN-2504-021" },
      { month: "Mar 2025", amount: "₹9,500",  status: "paid", paidOn: "Mar 2, 2025",  ref: "TXN-2503-021" },
      { month: "Feb 2025", amount: "₹9,500",  status: "paid", paidOn: "Feb 1, 2025",  ref: "TXN-2502-021" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid", paidOn: "Jan 2, 2025",  ref: "TXN-2501-021" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid", paidOn: "Dec 3, 2024",  ref: "TXN-2412-021" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid", paidOn: "Nov 4, 2024",  ref: "TXN-2411-021" },
    ]},
  u22: { phone: "+91 97654 22222", email: "anil.s@gmail.com",    moveIn: "Mar 2024", deposit: 19000, depositPaid: true,  noticeGiven: true,  idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Kavitha Shetty", emergencyPhone: "+91 96666 22222",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "paid", paidOn: "Apr 3, 2025",  ref: "TXN-2504-022" },
      { month: "Mar 2025", amount: "₹9,500",  status: "paid", paidOn: "Mar 4, 2025",  ref: "TXN-2503-022" },
      { month: "Feb 2025", amount: "₹9,500",  status: "paid", paidOn: "Feb 5, 2025",  ref: "TXN-2502-022" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid", paidOn: "Jan 6, 2025",  ref: "TXN-2501-022" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid", paidOn: "Dec 4, 2024",  ref: "TXN-2412-022" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid", paidOn: "Nov 2, 2024",  ref: "TXN-2411-022" },
    ]},
  u23: { phone: "+91 97654 23232", email: "zara.k@gmail.com",    moveIn: "Jun 2024", deposit: 19000, depositPaid: true,  noticeGiven: false, idType: "Passport", idVerified: true,  agreementSigned: true,  emergencyName: "Tariq Khan",     emergencyPhone: "+91 96666 23232",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-023" },
      { month: "Mar 2025", amount: "₹9,500",  status: "paid", paidOn: "Mar 1, 2025",  ref: "TXN-2503-023" },
      { month: "Feb 2025", amount: "₹9,500",  status: "paid", paidOn: "Feb 3, 2025",  ref: "TXN-2502-023" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid", paidOn: "Jan 4, 2025",  ref: "TXN-2501-023" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid", paidOn: "Dec 2, 2024",  ref: "TXN-2412-023" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid", paidOn: "Nov 6, 2024",  ref: "TXN-2411-023" },
    ]},
  u24: { phone: "+91 97654 24242", email: "sunil.s@gmail.com",   moveIn: "Jul 2024", deposit: 19000, depositPaid: false, noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Rekha Sharma",   emergencyPhone: "+91 96666 24242",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "pending" },
      { month: "Mar 2025", amount: "₹9,500",  status: "paid",    paidOn: "Mar 8, 2025",  ref: "TXN-2503-024" },
      { month: "Feb 2025", amount: "₹9,500",  status: "paid",    paidOn: "Feb 7, 2025",  ref: "TXN-2502-024" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid",    paidOn: "Jan 8, 2025",  ref: "TXN-2501-024" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid",    paidOn: "Dec 6, 2024",  ref: "TXN-2412-024" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid",    paidOn: "Nov 9, 2024",  ref: "TXN-2411-024" },
    ]},
  u25: { phone: "+91 97654 25252", email: "nisha.g@gmail.com",   moveIn: "Aug 2024", deposit: 19000, depositPaid: true,  noticeGiven: false, idType: "Aadhar",   idVerified: true,  agreementSigned: true,  emergencyName: "Ramesh Gupta",   emergencyPhone: "+91 96666 25252",
    rentHistory: [
      { month: "Apr 2025", amount: "₹9,500",  status: "paid", paidOn: "Apr 2, 2025",  ref: "TXN-2504-025" },
      { month: "Mar 2025", amount: "₹9,500",  status: "paid", paidOn: "Mar 1, 2025",  ref: "TXN-2503-025" },
      { month: "Feb 2025", amount: "₹9,500",  status: "paid", paidOn: "Feb 3, 2025",  ref: "TXN-2502-025" },
      { month: "Jan 2025", amount: "₹9,500",  status: "paid", paidOn: "Jan 4, 2025",  ref: "TXN-2501-025" },
      { month: "Dec 2024", amount: "₹9,500",  status: "paid", paidOn: "Dec 2, 2024",  ref: "TXN-2412-025" },
      { month: "Nov 2024", amount: "₹9,500",  status: "paid", paidOn: "Nov 5, 2024",  ref: "TXN-2411-025" },
    ]},
};

export const TENANT_DOCS: Record<string, TenantDoc[]> = {
  u1: [
    { type: "Aadhar Card",         status: "verified", uploadedOn: "15 Jan 2024" },
    { type: "PAN Card",            status: "pending" },
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

// ─── Maintenance tickets ──────────────────────────────────────────────────────
// m1–m5: owner-side raised; m6–m7: Rahul (u1) personal tickets visible in tenant dashboard

export const MAINTENANCE: MaintenanceTicket[] = [
  { id: "m1", title: "AC not cooling",     property: "Sunshine PG · 101",    category: "Electrical", date: "Apr 3, 2025",  status: "in_progress", priority: "high",   tenantId: "u1"  },
  { id: "m2", title: "Water leakage",      property: "Green Haven · A2",     category: "Plumbing",   date: "Apr 1, 2025",  status: "pending",     priority: "medium", tenantId: "u5"  },
  { id: "m3", title: "Light flickering",   property: "Royal Residency · 202", category: "Electrical", date: "Mar 28, 2025", status: "resolved",    priority: "low",    tenantId: "u6"  },
  { id: "m4", title: "Door lock stuck",    property: "Sunshine PG · 102",    category: "Carpentry",  date: "Mar 25, 2025", status: "resolved",    priority: "low",    tenantId: "u4"  },
  { id: "m5", title: "WiFi not working",   property: "Green Haven · A6",     category: "Tech",       date: "Apr 5, 2025",  status: "pending",     priority: "high",   tenantId: "u18" },
  { id: "m6", title: "Bathroom tap dripping", property: "Sunshine PG · 101", category: "Plumbing",   date: "Mar 28, 2025", status: "resolved",    priority: "medium", tenantId: "u1"  },
  { id: "m7", title: "Room light flickering", property: "Sunshine PG · 101", category: "Electrical", date: "Mar 10, 2025", status: "resolved",    priority: "low",    tenantId: "u1"  },
];

export const MAINTENANCE_EXT: Record<string, MaintenanceExt> = {
  m1: { description: "The AC in room 101 stopped cooling. Temperature doesn't drop below 26°C even on max setting.", assignee: "Ramu (Electrician)", response: "Technician scheduled for Apr 6",
    comments: [{ author: "Ravi Kumar", text: "Raised ticket. Will check tomorrow.", time: "Apr 3, 9 AM" }, { author: "Ramu", text: "Checked — refrigerant low. Refilling scheduled for tomorrow.", time: "Apr 4, 2 PM" }] },
  m2: { description: "Water leaking from pipe near A2 bathroom. Dripping continuously since last night.", assignee: null, response: "Plumber assigned, visit scheduled",
    comments: [{ author: "Kiran Rao", text: "Started leaking around midnight. Please fix urgently.", time: "Apr 1, 8 AM" }] },
  m3: { description: "Light in room 202 flickers intermittently. Likely a loose connection at the switch.", assignee: "Suresh (Electrician)", response: "Fixed — replaced the faulty switch",
    comments: [{ author: "Sonia Mehta", text: "Flickering since last week.", time: "Mar 27, 6 PM" }, { author: "Suresh", text: "Fixed — replaced the faulty switch.", time: "Mar 30, 11 AM" }] },
  m4: { description: "Door lock in room 102 is stuck. Key doesn't turn smoothly for the past 3 days.", assignee: "Ramesh (Carpenter)", response: "Fixed on Mar 28",
    comments: [{ author: "Neha Gupta", text: "Lock has been stiff for 3 days. Getting difficult to lock at night.", time: "Mar 25, 4 PM" }] },
  m5: { description: "WiFi in room A6 is very slow or fully disconnected since Apr 3. Router restart didn't help.", assignee: null, response: "Technician visit scheduled for Apr 8",
    comments: [{ author: "Rahul Nair", text: "Please send a technician, work from home is affected.", time: "Apr 5, 7 PM" }] },
  m6: { description: "Bathroom tap in room 101 dripping continuously. Wasting water.", assignee: "Suresh (Plumber)", response: "Fixed on Mar 30",
    comments: [{ author: "Rahul Sharma", text: "Tap has been dripping since yesterday.", time: "Mar 28, 10 AM" }, { author: "Suresh", text: "Fixed — replaced the washer.", time: "Mar 30, 3 PM" }] },
  m7: { description: "Room 101 ceiling light flickers intermittently, especially in the evening.", assignee: "Ramu (Electrician)", response: "Fixed on Mar 12",
    comments: [{ author: "Rahul Sharma", text: "Light has been flickering for 2 days.", time: "Mar 10, 8 PM" }, { author: "Ramu", text: "Fixed — tightened the loose connection.", time: "Mar 12, 11 AM" }] },
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const TRANSACTIONS: Transaction[] = [
  { id: "t1", initials: "RS", name: "Rahul Sharma",  property: "Sunshine PG · 101",    amount: "₹8,500",  date: "Apr 2",  status: "paid"    },
  { id: "t2", initials: "PV", name: "Priya Verma",   property: "Green Haven · A1",     amount: "₹10,000", date: "Apr 2",  status: "paid"    },
  { id: "t3", initials: "AP", name: "Amit Patel",    property: "Royal Residency · 201", amount: "₹9,500",  date: "Apr 3",  status: "paid"    },
  { id: "t4", initials: "NG", name: "Neha Gupta",    property: "Sunshine PG · 102",    amount: "₹8,500",  date: "Apr 5",  status: "pending" },
  { id: "t5", initials: "KR", name: "Kiran Rao",     property: "Green Haven · A2",     amount: "₹10,000", date: "Apr 5",  status: "pending" },
  { id: "t6", initials: "SM", name: "Sonia Mehta",   property: "Royal Residency · 202", amount: "₹9,500",  date: "Mar 28", status: "overdue" },
];

// ─── Notices (Sunshine PG notices visible to Rahul / u1) ─────────────────────

export const NOTICES: Notice[] = [
  { id: "n1", title: "WiFi upgrade scheduled",  body: "The internet service will be upgraded on Apr 10 from 10am–2pm. Expect brief downtime.",    date: "Apr 3, 2025",  type: "info",     read: false, propertyId: "p1" },
  { id: "n2", title: "April rent reminder",      body: "Please pay your April rent by Apr 5 to avoid a late fee. UPI: shiftproof@upi",             date: "Apr 1, 2025",  type: "reminder", read: false, propertyId: "p1" },
  { id: "n3", title: "Guest policy reminder",    body: "Visitors are allowed only till 9 PM. Please ensure compliance. Thank you.",                 date: "Mar 25, 2025", type: "policy",   read: true,  propertyId: "p1" },
  { id: "n4", title: "Common area cleaning",     body: "Common areas will be deep-cleaned on Apr 8 (Sunday) from 8–11am.",                         date: "Mar 22, 2025", type: "info",     read: true,  propertyId: "p1" },
];

// ─── Current demo tenant (u1 — Rahul Sharma, Sunshine PG room 101) ───────────
// Derived from authoritative data above so there is no duplication.

const _u1     = TENANTS.find(t => t.id === "u1")!;
const _u1ext  = TENANTS_EXT["u1"]!;
const _u1room = PROPERTY_ROOMS["p1"].find(r => r.tenant === _u1.name)!;
const _u1prop = PROPERTIES.find(p => p.id === "p1")!;
const _u1floor = PROPERTY_FLOORS["p1"].findIndex(fl => fl.roomIds.includes(_u1room.id)) + 1;

export const CURRENT_TENANT = {
  id:            _u1.id,
  name:          _u1.name,
  initials:      _u1.initials,
  room:          _u1room.number,
  floor:         _u1floor,
  type:          _u1room.type,
  pg:            _u1prop.name,
  address:       _u1prop.address,
  pgContact:     _u1prop.contact ?? "",
  pgManager:     _u1prop.manager ?? "",
  rent:          _u1room.rent,
  deposit:       _u1ext.deposit,
  leaseStart:    _u1ext.leaseStart ?? "",
  leaseEnd:      _u1ext.leaseEnd   ?? "",
  leaseDaysLeft: _u1ext.leaseDaysLeft ?? 0,
  checkIn:       _u1ext.checkIn    ?? _u1ext.moveIn,
  email:         _u1ext.email,
  phone:         _u1ext.phone,
};

// Floor-mates of u1 on Floor 1 (rooms 102, 103) — derived from PROPERTY_ROOMS
export const CURRENT_TENANT_ROOMMATES = PROPERTY_FLOORS["p1"][0].roomIds
  .filter(rid => rid !== _u1room.id)
  .map(rid => ROOM_BY_ID[rid])
  .filter(r => r?.tenant !== null)
  .slice(0, 2)
  .map(r => {
    const t = TENANTS.find(x => x.name === r.tenant);
    const ext = t ? TENANTS_EXT[t.id] : undefined;
    return { name: r.tenant!, initials: t?.initials ?? r.tenant!.split(" ").map(w => w[0]).join(""), room: r.number, since: ext ? ext.moveIn : "" };
  });

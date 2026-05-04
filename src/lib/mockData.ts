// ─── Mock data — single source of truth for demo / offline mode ───────────────
// Field names match the API contract exactly (swagger.json).
// When the real backend is connected, these shapes are drop-in compatible.

// ─── Types ────────────────────────────────────────────────────────────────────
// Re-export API types so UI can import everything from one place.
export type {
  Property, PropertyImage, Room, Tenant, Payment, Notification, CurrentStay,
} from "@/lib/api/types";

// UI-only types (no direct API equivalent) ────────────────────────────────────

export type Floor = { id: string; label: string; roomIds: string[] };

export type RentHistoryEntry = {
  month: string;
  amount: number;          // integer rupees (matches Payment.amount)
  status: "paid" | "pending" | "overdue";
  paidOn?: string;
  ref?: string;
};

export type TenantExt = {
  phone: string;
  email: string;
  moveIn: string;
  leaseStart?: string;
  leaseEnd?: string;
  leaseDaysLeft?: number;
  checkIn?: string;
  deposit: number;
  depositPaid: boolean;
  noticeGiven: boolean;
  idType: string;
  idVerified: boolean;
  agreementSigned: boolean;
  emergencyName: string;
  emergencyPhone: string;
  rentHistory: RentHistoryEntry[];
};

export type TenantDoc = {
  type: string;
  status: "verified" | "pending" | "missing";
  uploadedOn?: string;
};

export type MaintenanceTicket = {
  id: string;
  title: string;
  property: string;
  category: string;
  date: string;
  status: "in_progress" | "pending" | "resolved";
  priority: "high" | "medium" | "low";
  tenantId: string | null;
};

export type MaintenanceExt = {
  description: string;
  assignee: string | null;
  response?: string;
  comments: { author: string; text: string; time: string }[];
};

// ─── Properties ───────────────────────────────────────────────────────────────
// Using API type Property — field names match swagger model.Property

import type { Property, Room, Tenant, Payment, Notification } from "@/lib/api/types";

type LegacyProperty = Property & {
  name: string;
  address: string;
  rent: number;
  image: string;
  pending: number;
  beds: number;
  occupied: number;
};

type LegacyRoom = Room & {
  number: string;
  rent: number;
  status: "occupied" | "vacant";
  tenant: string | null;
};

type LegacyTenant = Tenant & {
  property: string;
  initials: string;
  lease: string;
  paid: boolean;
  risk: "late" | "expiring" | "none";
};

const PROPERTY_LIST_BASE: Property[] = [
  {
    id: "p1", title: "Sunshine PG", location: "Koramangala, Bangalore",
    city: "Bangalore", locality: "Koramangala",
    type: "PG", gender: "Co-ed", roomTypes: ["Single", "Double", "Triple"],
    price: 8500, deposit: 17000, description: "Well-maintained PG with all amenities in the heart of Koramangala.",
    amenities: ["WiFi", "AC", "Laundry", "Parking", "CCTV", "Water 24×7", "Security Guard", "Gym", "Power Backup"],
    totalRooms: 12, occupiedRooms: 10, occupancy: 83,
    imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=240&fit=crop&q=80",
    images: [
      { id: "img-p1-1", url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=280&fit=crop&q=80", isCover: true, position: 0 },
      { id: "img-p1-2", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=280&fit=crop&q=80", isCover: false, position: 1 },
      { id: "img-p1-3", url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&h=280&fit=crop&q=80", isCover: false, position: 2 },
      { id: "img-p1-4", url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=280&fit=crop&q=80", isCover: false, position: 3 },
    ],
    rating: 4.5, reviews: 24,
    distanceFromMetro: "800m", lat: 12.9352, lng: 77.6245,
    ownerName: "Vikram Shetty", ownerAvatarUrl: "",
  },
  {
    id: "p2", title: "Green Haven", location: "Indiranagar, Bangalore",
    city: "Bangalore", locality: "Indiranagar",
    type: "PG", gender: "Female", roomTypes: ["Single", "Double"],
    price: 10000, deposit: 20000, description: "Premium PG accommodation with modern facilities in Indiranagar.",
    amenities: ["WiFi", "Parking", "CCTV", "AC Rooms", "Housekeeping", "Water Purifier"],
    totalRooms: 8, occupiedRooms: 7, occupancy: 88,
    imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=240&fit=crop&q=80",
    images: [
      { id: "img-p2-1", url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=280&fit=crop&q=80", isCover: true, position: 0 },
      { id: "img-p2-2", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=280&fit=crop&q=80", isCover: false, position: 1 },
      { id: "img-p2-3", url: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=400&h=280&fit=crop&q=80", isCover: false, position: 2 },
    ],
    rating: 4.3, reviews: 18,
    distanceFromMetro: "400m", lat: 12.9719, lng: 77.6412,
    ownerName: "Sunita Devi", ownerAvatarUrl: "",
  },
  {
    id: "p3", title: "Royal Residency", location: "HSR Layout, Bangalore",
    city: "Bangalore", locality: "HSR Layout",
    type: "PG", gender: "Male", roomTypes: ["Single", "Double", "Triple"],
    price: 9500, deposit: 19000, description: "Spacious PG with gym and cafeteria in HSR Layout.",
    amenities: ["WiFi", "Gym", "Parking", "CCTV", "Laundry", "Cafeteria", "Power Backup"],
    totalRooms: 10, occupiedRooms: 8, occupancy: 80,
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=280&fit=crop&q=80",
    images: [
      { id: "img-p3-1", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=280&fit=crop&q=80", isCover: true, position: 0 },
    ],
    rating: 4.1, reviews: 32,
    distanceFromMetro: "1.2km", lat: 12.9128, lng: 77.6388,
    ownerName: "Ramu Kumar", ownerAvatarUrl: "",
  },
];

export const PROPERTIES: LegacyProperty[] = PROPERTY_LIST_BASE.map((property) => ({
  ...property,
  name: property.title,
  address: property.location,
  rent: property.price,
  image: property.imageUrl,
  pending: 0,
  beds: 0,
  occupied: 0,
}));

// Additional display-only data not in the Property API model
export const PROPERTY_HOUSE_RULES: Record<string, string[]> = {
  p1: ["No smoking on premises", "Visitors allowed till 9 PM", "No loud music after 10 PM", "Monthly rent due by 5th"],
  p2: ["No smoking on premises", "Visitors allowed till 8 PM", "No loud music after 10 PM", "Monthly rent due by 5th"],
  p3: ["No smoking on premises", "Visitors allowed till 10 PM", "No loud music after 11 PM", "Monthly rent due by 5th"],
};

export const PROPERTY_CONTACT: Record<string, { phone: string; manager: string }> = {
  p1: { phone: "+91 98765 43210", manager: "Vikram Shetty" },
  p2: { phone: "+91 98765 43211", manager: "Sunita Devi" },
  p3: { phone: "+91 98765 43212", manager: "Ramu Kumar" },
};

// ─── Rooms ────────────────────────────────────────────────────────────────────
// Using API type Room — all field names match swagger model.Room

const PROPERTY_ROOMS_BASE: Record<string, Room[]> = {
  p1: [
    { id: "r1", propertyId: "p1", roomNumber: "101", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 8500, deposit: 17000 },
    { id: "r2", propertyId: "p1", roomNumber: "102", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 8500, deposit: 17000 },
    { id: "r3", propertyId: "p1", roomNumber: "103", type: "double", capacity: 2, occupiedBeds: 1, isAvailable: true, rentAmount: 8500, deposit: 17000 },
    { id: "r4", propertyId: "p1", roomNumber: "104", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 8500, deposit: 17000 },
    { id: "r5", propertyId: "p1", roomNumber: "105", type: "double", capacity: 2, occupiedBeds: 1, isAvailable: true, rentAmount: 8500, deposit: 17000 },
    { id: "r6", propertyId: "p1", roomNumber: "106", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 8500, deposit: 17000 },
    { id: "r7", propertyId: "p1", roomNumber: "107", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 8500, deposit: 17000 },
    { id: "r8", propertyId: "p1", roomNumber: "108", type: "double", capacity: 2, occupiedBeds: 1, isAvailable: true, rentAmount: 8500, deposit: 17000 },
    { id: "r9", propertyId: "p1", roomNumber: "109", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 8500, deposit: 17000 },
    { id: "r10", propertyId: "p1", roomNumber: "110", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 8500, deposit: 17000 },
    { id: "r11", propertyId: "p1", roomNumber: "111", type: "single", capacity: 1, occupiedBeds: 0, isAvailable: true, rentAmount: 8500, deposit: 17000 },
    { id: "r12", propertyId: "p1", roomNumber: "112", type: "double", capacity: 2, occupiedBeds: 0, isAvailable: true, rentAmount: 8500, deposit: 17000 },
  ],
  p2: [
    { id: "r13", propertyId: "p2", roomNumber: "A1", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 10000, deposit: 20000 },
    { id: "r14", propertyId: "p2", roomNumber: "A2", type: "double", capacity: 2, occupiedBeds: 1, isAvailable: true, rentAmount: 10000, deposit: 20000 },
    { id: "r15", propertyId: "p2", roomNumber: "A3", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 10000, deposit: 20000 },
    { id: "r16", propertyId: "p2", roomNumber: "A4", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 10000, deposit: 20000 },
    { id: "r17", propertyId: "p2", roomNumber: "A5", type: "double", capacity: 2, occupiedBeds: 1, isAvailable: true, rentAmount: 10000, deposit: 20000 },
    { id: "r18", propertyId: "p2", roomNumber: "A6", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 10000, deposit: 20000 },
    { id: "r19", propertyId: "p2", roomNumber: "A7", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 10000, deposit: 20000 },
    { id: "r20", propertyId: "p2", roomNumber: "A8", type: "double", capacity: 2, occupiedBeds: 0, isAvailable: true, rentAmount: 10000, deposit: 20000 },
  ],
  p3: [
    { id: "r21", propertyId: "p3", roomNumber: "201", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 9500, deposit: 19000 },
    { id: "r22", propertyId: "p3", roomNumber: "202", type: "double", capacity: 2, occupiedBeds: 1, isAvailable: true, rentAmount: 9500, deposit: 19000 },
    { id: "r23", propertyId: "p3", roomNumber: "203", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 9500, deposit: 19000 },
    { id: "r24", propertyId: "p3", roomNumber: "204", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 9500, deposit: 19000 },
    { id: "r25", propertyId: "p3", roomNumber: "205", type: "double", capacity: 2, occupiedBeds: 1, isAvailable: true, rentAmount: 9500, deposit: 19000 },
    { id: "r26", propertyId: "p3", roomNumber: "206", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 9500, deposit: 19000 },
    { id: "r27", propertyId: "p3", roomNumber: "207", type: "double", capacity: 2, occupiedBeds: 1, isAvailable: true, rentAmount: 9500, deposit: 19000 },
    { id: "r28", propertyId: "p3", roomNumber: "208", type: "single", capacity: 1, occupiedBeds: 1, isAvailable: false, rentAmount: 9500, deposit: 19000 },
    { id: "r29", propertyId: "p3", roomNumber: "209", type: "single", capacity: 1, occupiedBeds: 0, isAvailable: true, rentAmount: 9500, deposit: 19000 },
    { id: "r30", propertyId: "p3", roomNumber: "210", type: "double", capacity: 2, occupiedBeds: 0, isAvailable: true, rentAmount: 9500, deposit: 19000 },
  ],
};

export const PROPERTY_FLOORS: Record<string, Floor[]> = {
  p1: [
    { id: "p1f1", label: "Floor 1", roomIds: ["r1", "r2", "r3", "r4"] },
    { id: "p1f2", label: "Floor 2", roomIds: ["r5", "r6", "r7", "r8"] },
    { id: "p1f3", label: "Floor 3", roomIds: ["r9", "r10", "r11", "r12"] },
  ],
  p2: [
    { id: "p2f1", label: "Floor 1", roomIds: ["r13", "r14", "r15", "r16"] },
    { id: "p2f2", label: "Floor 2", roomIds: ["r17", "r18", "r19", "r20"] },
  ],
  p3: [
    { id: "p3f1", label: "Floor 1", roomIds: ["r21", "r22", "r23", "r24", "r25"] },
    { id: "p3f2", label: "Floor 2", roomIds: ["r26", "r27", "r28", "r29", "r30"] },
  ],
};

// Derived lookup: roomId → Room
// roomId → tenant name (display-only; real API links via /tenants endpoint)
export const ROOM_TENANT: Record<string, string | null> = {
  r1: "Rahul Sharma", r2: "Neha Gupta", r3: "Arjun Singh", r4: "Divya Nair",
  r5: "Suresh Babu", r6: "Lakshmi Iyer", r7: "Mohan Das", r8: "Kavya Reddy",
  r9: "Vikram Joshi", r10: "Anita Desai", r11: null, r12: null,
  r13: "Priya Verma", r14: "Kiran Rao", r15: "Ritu Sharma", r16: "Deepak Menon",
  r17: "Sneha Pillai", r18: "Rahul Nair", r19: "Pooja Verma", r20: null,
  r21: "Amit Patel", r22: "Sonia Mehta", r23: "Rajesh Kumar", r24: "Meera Pillai",
  r25: "Anil Shetty", r26: "Zara Khan", r27: "Sunil Sharma", r28: "Nisha Gupta",
  r29: null, r30: null,
};

export const PROPERTY_ROOMS: Record<string, LegacyRoom[]> = Object.fromEntries(
  Object.entries(PROPERTY_ROOMS_BASE).map(([propertyId, rooms]) => [
    propertyId,
    rooms.map((room) => ({
      ...room,
      number: room.roomNumber,
      rent: room.rentAmount,
      status: room.occupiedBeds > 0 ? "occupied" : "vacant",
      tenant: ROOM_TENANT[room.id] ?? null,
    })),
  ]),
);

export const ROOM_BY_ID: Record<string, LegacyRoom> = Object.fromEntries(
  Object.values(PROPERTY_ROOMS).flat().map((r) => [r.id, r]),
);

for (const property of PROPERTIES) {
  const rooms = PROPERTY_ROOMS[property.id] ?? [];
  property.beds = rooms.reduce((sum, room) => sum + room.capacity, 0);
  property.occupied = rooms.reduce((sum, room) => sum + room.occupiedBeds, 0);
}

// ─── Tenants ──────────────────────────────────────────────────────────────────
// Using API type Tenant — all field names match swagger model.Tenant

const TENANTS_BASE: Tenant[] = [
  { id: "u1", name: "Rahul Sharma", email: "rahul.s@gmail.com", phone: "+91 98765 11111", avatarUrl: "", propertyId: "p1", room: "101", rentAmount: 8500, dueDate: "2026-12-05", joinDate: "2024-01-01", status: "active", isPaid: true },
  { id: "u2", name: "Priya Verma", email: "priya.v@gmail.com", phone: "+91 98765 22222", avatarUrl: "", propertyId: "p2", room: "A1", rentAmount: 10000, dueDate: "2026-05-05", joinDate: "2024-03-01", status: "active", isPaid: true },
  { id: "u3", name: "Amit Patel", email: "amit.p@gmail.com", phone: "+91 98765 33333", avatarUrl: "", propertyId: "p3", room: "201", rentAmount: 9500, dueDate: "2026-04-05", joinDate: "2024-06-01", status: "active", isPaid: true },
  { id: "u4", name: "Neha Gupta", email: "neha.g@gmail.com", phone: "+91 98765 44444", avatarUrl: "", propertyId: "p1", room: "102", rentAmount: 8500, dueDate: "2025-11-05", joinDate: "2024-08-01", status: "pending", isPaid: false },
  { id: "u5", name: "Kiran Rao", email: "kiran.r@gmail.com", phone: "+91 98765 55555", avatarUrl: "", propertyId: "p2", room: "A2", rentAmount: 10000, dueDate: "2025-10-05", joinDate: "2024-10-01", status: "overdue", isPaid: false },
  { id: "u6", name: "Sonia Mehta", email: "sonia.m@gmail.com", phone: "+91 98765 66666", avatarUrl: "", propertyId: "p3", room: "202", rentAmount: 9500, dueDate: "2025-09-05", joinDate: "2024-11-01", status: "overdue", isPaid: false },
  { id: "u7", name: "Arjun Singh", email: "arjun.s@gmail.com", phone: "+91 98765 77777", avatarUrl: "", propertyId: "p1", room: "103", rentAmount: 8500, dueDate: "2026-02-05", joinDate: "2024-02-01", status: "active", isPaid: true },
  { id: "u8", name: "Divya Nair", email: "divya.n@gmail.com", phone: "+91 98765 88888", avatarUrl: "", propertyId: "p1", room: "104", rentAmount: 8500, dueDate: "2026-03-05", joinDate: "2024-03-01", status: "active", isPaid: true },
  { id: "u9", name: "Suresh Babu", email: "suresh.b@gmail.com", phone: "+91 98765 99999", avatarUrl: "", propertyId: "p1", room: "105", rentAmount: 8500, dueDate: "2026-01-05", joinDate: "2024-01-01", status: "active", isPaid: true },
  { id: "u10", name: "Lakshmi Iyer", email: "lakshmi.i@gmail.com", phone: "+91 97654 10101", avatarUrl: "", propertyId: "p1", room: "106", rentAmount: 8500, dueDate: "2026-06-05", joinDate: "2024-06-01", status: "active", isPaid: true },
  { id: "u11", name: "Mohan Das", email: "mohan.d@gmail.com", phone: "+91 97654 11111", avatarUrl: "", propertyId: "p1", room: "107", rentAmount: 8500, dueDate: "2026-08-05", joinDate: "2024-08-01", status: "pending", isPaid: false },
  { id: "u12", name: "Kavya Reddy", email: "kavya.r@gmail.com", phone: "+91 97654 12121", avatarUrl: "", propertyId: "p1", room: "108", rentAmount: 8500, dueDate: "2026-05-05", joinDate: "2024-09-01", status: "overdue", isPaid: false },
  { id: "u13", name: "Vikram Joshi", email: "vikram.j@gmail.com", phone: "+91 97654 13131", avatarUrl: "", propertyId: "p1", room: "109", rentAmount: 8500, dueDate: "2026-07-05", joinDate: "2024-07-01", status: "active", isPaid: true },
  { id: "u14", name: "Anita Desai", email: "anita.d@gmail.com", phone: "+91 97654 14141", avatarUrl: "", propertyId: "p1", room: "110", rentAmount: 8500, dueDate: "2026-09-05", joinDate: "2024-09-01", status: "active", isPaid: true },
  { id: "u15", name: "Ritu Sharma", email: "ritu.s@gmail.com", phone: "+91 97654 15151", avatarUrl: "", propertyId: "p2", room: "A3", rentAmount: 10000, dueDate: "2026-02-05", joinDate: "2024-02-01", status: "active", isPaid: true },
  { id: "u16", name: "Deepak Menon", email: "deepak.m@gmail.com", phone: "+91 97654 16161", avatarUrl: "", propertyId: "p2", room: "A4", rentAmount: 10000, dueDate: "2026-03-05", joinDate: "2024-03-01", status: "active", isPaid: true },
  { id: "u17", name: "Sneha Pillai", email: "sneha.p@gmail.com", phone: "+91 97654 17171", avatarUrl: "", propertyId: "p2", room: "A5", rentAmount: 10000, dueDate: "2026-04-05", joinDate: "2024-04-01", status: "active", isPaid: true },
  { id: "u18", name: "Rahul Nair", email: "rahul.n@gmail.com", phone: "+91 97654 18181", avatarUrl: "", propertyId: "p2", room: "A6", rentAmount: 10000, dueDate: "2026-01-05", joinDate: "2025-01-01", status: "overdue", isPaid: false },
  { id: "u19", name: "Pooja Verma", email: "pooja.v@gmail.com", phone: "+91 97654 19191", avatarUrl: "", propertyId: "p2", room: "A7", rentAmount: 10000, dueDate: "2026-06-05", joinDate: "2024-06-01", status: "active", isPaid: true },
  { id: "u20", name: "Rajesh Kumar", email: "rajesh.k@gmail.com", phone: "+91 97654 20202", avatarUrl: "", propertyId: "p3", room: "203", rentAmount: 9500, dueDate: "2026-02-05", joinDate: "2024-02-01", status: "active", isPaid: true },
  { id: "u21", name: "Meera Pillai", email: "meera.p@gmail.com", phone: "+91 97654 21212", avatarUrl: "", propertyId: "p3", room: "204", rentAmount: 9500, dueDate: "2026-05-05", joinDate: "2024-05-01", status: "active", isPaid: true },
  { id: "u22", name: "Anil Shetty", email: "anil.s@gmail.com", phone: "+91 97654 22222", avatarUrl: "", propertyId: "p3", room: "205", rentAmount: 9500, dueDate: "2026-03-05", joinDate: "2024-03-01", status: "active", isPaid: true },
  { id: "u23", name: "Zara Khan", email: "zara.k@gmail.com", phone: "+91 97654 23232", avatarUrl: "", propertyId: "p3", room: "206", rentAmount: 9500, dueDate: "2026-06-05", joinDate: "2024-06-01", status: "active", isPaid: true },
  { id: "u24", name: "Sunil Sharma", email: "sunil.s@gmail.com", phone: "+91 97654 24242", avatarUrl: "", propertyId: "p3", room: "207", rentAmount: 9500, dueDate: "2026-07-05", joinDate: "2024-07-01", status: "pending", isPaid: false },
  { id: "u25", name: "Nisha Gupta", email: "nisha.g@gmail.com", phone: "+91 97654 25252", avatarUrl: "", propertyId: "p3", room: "208", rentAmount: 9500, dueDate: "2026-08-05", joinDate: "2024-08-01", status: "active", isPaid: true },
];

export const TENANTS: LegacyTenant[] = TENANTS_BASE.map((tenant) => ({
  ...tenant,
  property: PROPERTIES.find((property) => property.id === tenant.propertyId)?.name ?? tenant.propertyId,
  initials: tenant.name.split(" ").map((part) => part[0]).join("").slice(0, 2),
  lease: tenant.dueDate,
  paid: tenant.isPaid,
  risk: tenant.status === "overdue" ? "late" : "none",
}));

export const TENANT_BY_ID: Record<string, Tenant> = Object.fromEntries(
  TENANTS.map((t) => [t.id, t]),
);

export const TENANT_BY_NAME: Record<string, string> = Object.fromEntries(
  TENANTS.map((tenant) => [tenant.name, tenant.id]),
);

// Extended per-tenant data (not in API Tenant model — local detail view only)
export const TENANTS_EXT: Record<string, TenantExt> = {
  u1: {
    phone: "+91 98765 11111", email: "rahul.s@gmail.com", moveIn: "Jan 2024", leaseStart: "2026-01-01", leaseEnd: "2026-12-31", leaseDaysLeft: 250, checkIn: "2024-01-01", deposit: 17000, depositPaid: true, noticeGiven: false, idType: "Aadhar", idVerified: true, agreementSigned: true, emergencyName: "Suresh Sharma", emergencyPhone: "+91 97777 11111",
    rentHistory: [
      { month: "Apr 2025", amount: 8500, status: "paid", paidOn: "Apr 2, 2025", ref: "TXN-2504-001" },
      { month: "Mar 2025", amount: 8500, status: "paid", paidOn: "Mar 1, 2025", ref: "TXN-2503-001" },
      { month: "Feb 2025", amount: 8500, status: "paid", paidOn: "Feb 3, 2025", ref: "TXN-2502-001" },
      { month: "Jan 2025", amount: 8500, status: "paid", paidOn: "Jan 4, 2025", ref: "TXN-2501-001" },
      { month: "Dec 2024", amount: 8500, status: "paid", paidOn: "Dec 2, 2024", ref: "TXN-2412-001" },
      { month: "Nov 2024", amount: 8500, status: "paid", paidOn: "Nov 5, 2024", ref: "TXN-2411-001" },
    ]
  },
  u2: {
    phone: "+91 98765 22222", email: "priya.v@gmail.com", moveIn: "Mar 2024", deposit: 20000, depositPaid: true, noticeGiven: false, idType: "PAN", idVerified: true, agreementSigned: true, emergencyName: "Anita Verma", emergencyPhone: "+91 97777 22222",
    rentHistory: [
      { month: "Apr 2025", amount: 10000, status: "paid", paidOn: "Apr 2, 2025", ref: "TXN-2504-002" },
      { month: "Mar 2025", amount: 10000, status: "paid", paidOn: "Mar 3, 2025", ref: "TXN-2503-002" },
      { month: "Feb 2025", amount: 10000, status: "paid", paidOn: "Feb 1, 2025", ref: "TXN-2502-002" },
      { month: "Jan 2025", amount: 10000, status: "paid", paidOn: "Jan 2, 2025", ref: "TXN-2501-002" },
    ]
  },
  u3: {
    phone: "+91 98765 33333", email: "amit.p@gmail.com", moveIn: "Jun 2024", deposit: 19000, depositPaid: true, noticeGiven: true, idType: "Aadhar", idVerified: true, agreementSigned: true, emergencyName: "Rekha Patel", emergencyPhone: "+91 97777 33333",
    rentHistory: [
      { month: "Apr 2025", amount: 9500, status: "paid", paidOn: "Apr 3, 2025", ref: "TXN-2504-003" },
      { month: "Mar 2025", amount: 9500, status: "paid", paidOn: "Mar 2, 2025", ref: "TXN-2503-003" },
      { month: "Feb 2025", amount: 9500, status: "overdue" },
    ]
  },
  u4: {
    phone: "+91 98765 44444", email: "neha.g@gmail.com", moveIn: "Aug 2024", deposit: 17000, depositPaid: false, noticeGiven: false, idType: "Passport", idVerified: false, agreementSigned: true, emergencyName: "Rakesh Gupta", emergencyPhone: "+91 97777 44444",
    rentHistory: [
      { month: "Apr 2025", amount: 8500, status: "pending" },
      { month: "Mar 2025", amount: 8500, status: "paid", paidOn: "Mar 8, 2025", ref: "TXN-2503-004" },
    ]
  },
  u5: {
    phone: "+91 98765 55555", email: "kiran.r@gmail.com", moveIn: "Oct 2024", deposit: 20000, depositPaid: true, noticeGiven: false, idType: "Aadhar", idVerified: true, agreementSigned: false, emergencyName: "Sunita Rao", emergencyPhone: "+91 97777 55555",
    rentHistory: [
      { month: "Apr 2025", amount: 10000, status: "pending" },
      { month: "Mar 2025", amount: 10000, status: "paid", paidOn: "Mar 10, 2025", ref: "TXN-2503-005" },
    ]
  },
  u6: {
    phone: "+91 98765 66666", email: "sonia.m@gmail.com", moveIn: "Nov 2024", deposit: 19000, depositPaid: true, noticeGiven: true, idType: "PAN", idVerified: true, agreementSigned: true, emergencyName: "Kavita Mehta", emergencyPhone: "+91 97777 66666",
    rentHistory: [
      { month: "Apr 2025", amount: 9500, status: "overdue" },
      { month: "Mar 2025", amount: 9500, status: "overdue" },
    ]
  },
};

export const TENANT_DOCS: Record<string, TenantDoc[]> = {
  u1: [
    { type: "Aadhar Card", status: "verified", uploadedOn: "15 Jan 2024" },
    { type: "PAN Card", status: "pending" },
    { type: "Rental Agreement", status: "verified", uploadedOn: "15 Jan 2024" },
    { type: "Police Verification", status: "verified", uploadedOn: "17 Jan 2024" },
    { type: "Passport Photo", status: "verified", uploadedOn: "15 Jan 2024" },
    { type: "Employment Proof", status: "missing" },
  ],
  u2: [
    { type: "PAN Card", status: "verified", uploadedOn: "10 Mar 2024" },
    { type: "Rental Agreement", status: "verified", uploadedOn: "10 Mar 2024" },
    { type: "Police Verification", status: "verified", uploadedOn: "12 Mar 2024" },
    { type: "Passport Photo", status: "verified", uploadedOn: "10 Mar 2024" },
    { type: "Employment Proof", status: "verified", uploadedOn: "10 Mar 2024" },
  ],
  u4: [
    { type: "Passport", status: "pending", uploadedOn: "12 Aug 2024" },
    { type: "Rental Agreement", status: "verified", uploadedOn: "12 Aug 2024" },
    { type: "Police Verification", status: "missing" },
    { type: "Employment Proof", status: "missing" },
  ],
};

for (const tenant of TENANTS) {
  const ext = TENANTS_EXT[tenant.id];
  if (!ext) continue;
  tenant.lease = ext.leaseEnd ?? tenant.lease;
  if (
    tenant.risk === "none" &&
    ext.leaseEnd &&
    new Date(ext.leaseEnd).getTime() - Date.now() <= 90 * 24 * 60 * 60 * 1000
  ) {
    tenant.risk = "expiring";
  }
}

// ─── Maintenance tickets ──────────────────────────────────────────────────────
// No dedicated API endpoint — kept as display-only mock data.

export const MAINTENANCE: MaintenanceTicket[] = [
  { id: "m1", title: "AC not cooling", property: "Sunshine PG · 101", category: "Electrical", date: "Apr 3, 2025", status: "in_progress", priority: "high", tenantId: "u1" },
  { id: "m2", title: "Water leakage", property: "Green Haven · A2", category: "Plumbing", date: "Apr 1, 2025", status: "pending", priority: "medium", tenantId: "u5" },
  { id: "m3", title: "Light flickering", property: "Royal Residency · 202", category: "Electrical", date: "Mar 28, 2025", status: "resolved", priority: "low", tenantId: "u6" },
  { id: "m4", title: "Door lock stuck", property: "Sunshine PG · 102", category: "Carpentry", date: "Mar 25, 2025", status: "resolved", priority: "low", tenantId: "u4" },
  { id: "m5", title: "WiFi not working", property: "Green Haven · A6", category: "Tech", date: "Apr 5, 2025", status: "pending", priority: "high", tenantId: "u18" },
  { id: "m6", title: "Bathroom tap dripping", property: "Sunshine PG · 101", category: "Plumbing", date: "Mar 28, 2025", status: "resolved", priority: "medium", tenantId: "u1" },
  { id: "m7", title: "Room light flickering", property: "Sunshine PG · 101", category: "Electrical", date: "Mar 10, 2025", status: "resolved", priority: "low", tenantId: "u1" },
];

export const MAINTENANCE_EXT: Record<string, MaintenanceExt> = {
  m1: {
    description: "AC in room 101 stopped cooling. Temp doesn't drop below 26°C.", assignee: "Ramu (Electrician)", response: "Technician scheduled for Apr 6",
    comments: [{ author: "Ravi Kumar", text: "Raised ticket. Will check tomorrow.", time: "Apr 3, 9 AM" }, { author: "Ramu", text: "Refrigerant low. Refilling scheduled.", time: "Apr 4, 2 PM" }]
  },
  m2: {
    description: "Water leaking from pipe near A2 bathroom.", assignee: null, response: "Plumber assigned",
    comments: [{ author: "Kiran Rao", text: "Leaking since midnight.", time: "Apr 1, 8 AM" }]
  },
  m3: {
    description: "Light in room 202 flickers intermittently.", assignee: "Suresh (Electrician)", response: "Fixed — replaced the faulty switch",
    comments: [{ author: "Sonia Mehta", text: "Flickering since last week.", time: "Mar 27, 6 PM" }, { author: "Suresh", text: "Fixed.", time: "Mar 30, 11 AM" }]
  },
  m4: {
    description: "Door lock in room 102 stuck for 3 days.", assignee: "Ramesh (Carpenter)", response: "Fixed on Mar 28",
    comments: [{ author: "Neha Gupta", text: "Lock has been stiff for 3 days.", time: "Mar 25, 4 PM" }]
  },
  m5: {
    description: "WiFi in room A6 slow or disconnected since Apr 3.", assignee: null, response: "Technician visit scheduled for Apr 8",
    comments: [{ author: "Rahul Nair", text: "Work from home affected.", time: "Apr 5, 7 PM" }]
  },
  m6: {
    description: "Bathroom tap in room 101 dripping continuously.", assignee: "Suresh (Plumber)", response: "Fixed on Mar 30",
    comments: [{ author: "Rahul Sharma", text: "Dripping since yesterday.", time: "Mar 28, 10 AM" }, { author: "Suresh", text: "Fixed — replaced the washer.", time: "Mar 30, 3 PM" }]
  },
  m7: {
    description: "Room 101 ceiling light flickers in the evening.", assignee: "Ramu (Electrician)", response: "Fixed on Mar 12",
    comments: [{ author: "Rahul Sharma", text: "Flickering for 2 days.", time: "Mar 10, 8 PM" }, { author: "Ramu", text: "Fixed — tightened loose connection.", time: "Mar 12, 11 AM" }]
  },
};

// ─── Payments (Transactions) ──────────────────────────────────────────────────
// Using API type Payment — amounts are integers (rupees), dates are ISO strings.

export const PAYMENTS: Payment[] = [
  { id: "t1", title: "April Rent", description: "Room 101", tenantName: "Rahul Sharma", tenantId: "u1", propertyId: "p1", amount: 8500, date: "2025-04-02", status: "paid", type: "rent", collectionMode: "manual" },
  { id: "t2", title: "April Rent", description: "Room A1", tenantName: "Priya Verma", tenantId: "u2", propertyId: "p2", amount: 10000, date: "2025-04-02", status: "paid", type: "rent", collectionMode: "manual" },
  { id: "t3", title: "April Rent", description: "Room 201", tenantName: "Amit Patel", tenantId: "u3", propertyId: "p3", amount: 9500, date: "2025-04-03", status: "paid", type: "rent", collectionMode: "manual" },
  { id: "t4", title: "April Rent", description: "Room 102", tenantName: "Neha Gupta", tenantId: "u4", propertyId: "p1", amount: 8500, date: "2025-04-05", status: "pending", type: "rent", collectionMode: "manual" },
  { id: "t5", title: "April Rent", description: "Room A2", tenantName: "Kiran Rao", tenantId: "u5", propertyId: "p2", amount: 10000, date: "2025-04-05", status: "pending", type: "rent", collectionMode: "manual" },
  { id: "t6", title: "March Rent", description: "Room 202", tenantName: "Sonia Mehta", tenantId: "u6", propertyId: "p3", amount: 9500, date: "2025-03-28", status: "overdue", type: "rent", collectionMode: "manual" },
];

export const TRANSACTIONS = PAYMENTS.map((payment) => ({
  id: payment.id,
  name: payment.tenantName,
  initials: payment.tenantName.split(" ").map((part) => part[0]).join("").slice(0, 2),
  property: `${PROPERTIES.find((property) => property.id === payment.propertyId)?.name ?? payment.propertyId} · ${payment.description}`,
  amount: `₹${payment.amount.toLocaleString("en-IN")}`,
  date: payment.date,
  status: payment.status,
}));

// ─── Notifications ────────────────────────────────────────────────────────────
// Using API type Notification — field names match swagger model.Notification

export const NOTICES: Notification[] = [
  { id: "n1", title: "WiFi upgrade scheduled", description: "The internet service will be upgraded on Apr 10 from 10am–2pm. Expect brief downtime.", timestamp: "2025-04-03T09:00:00Z", type: "general", isRead: false },
  { id: "n2", title: "April rent reminder", description: "Please pay your April rent by Apr 5 to avoid a late fee. UPI: shiftproof@upi", timestamp: "2025-04-01T08:00:00Z", type: "rentDue", isRead: false },
  { id: "n3", title: "Guest policy reminder", description: "Visitors are allowed only till 9 PM. Please ensure compliance. Thank you.", timestamp: "2025-03-25T10:00:00Z", type: "general", isRead: true },
  { id: "n4", title: "Common area cleaning", description: "Common areas will be deep-cleaned on Apr 8 (Sunday) from 8–11am.", timestamp: "2025-03-22T11:00:00Z", type: "general", isRead: true },
];

export const PROPERTY_AMENITIES: Record<string, string[]> = Object.fromEntries(
  PROPERTIES.map((property) => [property.id, property.amenities]),
);

export const PROPERTY_GALLERY: Record<string, string[]> = Object.fromEntries(
  PROPERTIES.map((property) => [property.id, property.images.map((image) => image.url)]),
);

for (const property of PROPERTIES) {
  property.pending = TENANTS.filter(
    (tenant) => tenant.property === property.name && !tenant.paid,
  ).length;
}

// ─── Current demo tenant (u1 — Rahul Sharma, Sunshine PG room 101) ────────────
// Computed from authoritative data above — no duplication.

const _u1 = TENANTS.find((t) => t.id === "u1")!;
const _u1ext = TENANTS_EXT["u1"]!;
const _u1prop = PROPERTIES.find((p) => p.id === "p1")!;
const _u1room = PROPERTY_ROOMS["p1"].find((r) => r.roomNumber === _u1.room)!;
const _u1floor = PROPERTY_FLOORS["p1"].findIndex((fl) => fl.roomIds.includes(_u1room.id)) + 1;
const _u1contact = PROPERTY_CONTACT["p1"];

export const CURRENT_TENANT = {
  id: _u1.id,
  name: _u1.name,
  initials: _u1.name.split(" ").map((part) => part[0]).join("").slice(0, 2),
  avatarUrl: "",
  room: _u1room.roomNumber,
  floor: _u1floor,
  type: _u1room.type,
  pg: _u1prop.title,
  address: _u1prop.location,
  pgContact: _u1contact.phone,
  pgManager: _u1contact.manager,
  rent: _u1room.rentAmount,
  deposit: _u1ext.deposit,
  leaseStart: _u1ext.leaseStart ?? "",
  leaseEnd: _u1ext.leaseEnd ?? "",
  leaseDaysLeft: _u1ext.leaseDaysLeft ?? 0,
  checkIn: _u1ext.checkIn ?? _u1ext.moveIn,
  email: _u1ext.email,
  phone: _u1ext.phone,
};

// Convenience: matches CurrentStay API shape for when real API is connected
export const CURRENT_STAY_MOCK = {
  propertyName: _u1prop.title,
  address: _u1prop.location,
  imageUrl: _u1prop.imageUrl,
  roomNumber: _u1room.roomNumber,
  rentAmount: _u1room.rentAmount,
  dueDate: _u1.dueDate,
  isRentDue: !_u1.isPaid,
  leaseStart: _u1ext.leaseStart ?? "",
  leaseEnd: _u1ext.leaseEnd ?? "",
  ownerName: _u1contact.manager,
  ownerPhone: _u1contact.phone,
  ownerAvatarUrl: "",
};

// Floor-mates of u1 on Floor 1 — derived from PROPERTY_ROOMS
export const CURRENT_TENANT_ROOMMATES = PROPERTY_FLOORS["p1"][0].roomIds
  .filter((rid) => rid !== _u1room.id)
  .map((rid) => ROOM_BY_ID[rid])
  .filter((r) => r && !r.isAvailable)
  .slice(0, 2)
  .map((r) => {
    const tenant = TENANTS.find((t) => t.room === r.roomNumber && t.propertyId === "p1");
    return {
      name: ROOM_TENANT[r.id] ?? "Tenant",
      initials: tenant ? tenant.name.split(" ").map((w) => w[0]).join("") : "T",
      room: r.roomNumber,
      since: tenant ? TENANTS_EXT[tenant.id]?.moveIn ?? "" : "",
    };
  });

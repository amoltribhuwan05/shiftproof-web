export type Role = "owner" | "tenant";

export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  phone: string;
  properties?: number;
  tenants?: number;
  pgName?: string;
}

export interface Session {
  id: string;
  role: Role;
  name: string;
  email: string;
}

export const SESSION_COOKIE = "sp_session";

export const MOCK_USERS: MockUser[] = [
  {
    id: "o1",
    email: "ravi@shiftproof.app",
    password: "Owner@123",
    name: "Ravi Kumar",
    role: "owner",
    phone: "9876543210",
    properties: 3,
    tenants: 28,
  },
  {
    id: "o2",
    email: "priya@shiftproof.app",
    password: "Owner@456",
    name: "Priya Mehta",
    role: "owner",
    phone: "9876543211",
    properties: 1,
    tenants: 8,
  },
  {
    id: "t1",
    email: "ananya@shiftproof.app",
    password: "Tenant@123",
    name: "Ananya Patel",
    role: "tenant",
    phone: "9876543212",
    pgName: "Sunshine PG, Koramangala",
  },
  {
    id: "t2",
    email: "suresh@shiftproof.app",
    password: "Tenant@456",
    name: "Suresh Mehta",
    role: "tenant",
    phone: "9876543213",
    pgName: "Green Nest PG, Baner",
  },
];

export function findUser(email: string, password: string): MockUser | undefined {
  return MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

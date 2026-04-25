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
    pgName: "Ravi Kumar Properties",
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
    pgName: "Priya Mehta Residency",
  },
  {
    id: "t1",
    email: "rahul@shiftproof.app",
    password: "Tenant@123",
    name: "Rahul Sharma",
    role: "tenant",
    phone: "9876543212",
    pgName: "Sunshine PG, Koramangala",
  },
  {
    id: "t2",
    email: "priya@shiftproof.app",
    password: "Tenant@456",
    name: "Priya Verma",
    role: "tenant",
    phone: "9876543213",
    pgName: "Green Haven, Indiranagar",
  },
];

// Runtime store — starts with seed data, accepts new registrations (resets on server restart)
export const USER_STORE: MockUser[] = [...MOCK_USERS];
let _nextId = USER_STORE.length + 1;

export function findUser(email: string, password: string): MockUser | undefined {
  return USER_STORE.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

export function findUserByEmail(email: string): MockUser | undefined {
  return USER_STORE.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function addUser(data: Omit<MockUser, "id">): MockUser {
  const user: MockUser = { id: `u${_nextId++}`, ...data };
  USER_STORE.push(user);
  return user;
}

export function updatePassword(email: string, newPassword: string): boolean {
  const user = USER_STORE.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  user.password = newPassword;
  return true;
}

export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

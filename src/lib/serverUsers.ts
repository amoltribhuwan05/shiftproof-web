import "server-only";

import { loadMockUsers, saveMockUsers } from "@/lib/mockPersistence";
import { MOCK_USERS, type MockUser } from "@/lib/users";

export const USER_STORE: MockUser[] = loadMockUsers(MOCK_USERS);

let _nextId =
  USER_STORE.reduce((max, user) => {
    const match = user.id.match(/\d+$/);
    return Math.max(max, match ? Number(match[0]) : 0);
  }, 0) + 1;

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function persist(): void {
  saveMockUsers(USER_STORE);
}

export function findUser(email: string, password: string): MockUser | undefined {
  return USER_STORE.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

export function findUserByEmail(email: string): MockUser | undefined {
  return USER_STORE.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserByPhone(phone: string): MockUser | undefined {
  const normalized = normalizePhone(phone);
  return USER_STORE.find((u) => normalizePhone(u.phone) === normalized);
}

export function addUser(data: Omit<MockUser, "id">): MockUser {
  const user: MockUser = { id: `u${_nextId++}`, ...data };
  USER_STORE.push(user);
  persist();
  return user;
}

export function upsertUserByEmail(data: Omit<MockUser, "id">): MockUser {
  const existing = findUserByEmail(data.email);
  if (existing) {
    existing.name = data.name;
    existing.phone = data.phone;
    existing.role = data.role;
    existing.password = data.password;
    existing.properties = data.properties;
    existing.tenants = data.tenants;
    existing.pgName = data.pgName;
    persist();
    return existing;
  }

  return addUser(data);
}

export function updatePassword(email: string, newPassword: string): boolean {
  const user = USER_STORE.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  user.password = newPassword;
  persist();
  return true;
}

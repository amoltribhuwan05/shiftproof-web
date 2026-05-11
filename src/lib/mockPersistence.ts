import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { AppUser } from "@/lib/api/types";
import type { MockUser } from "@/lib/users";

type Snapshot = {
  mockUsers?: MockUser[];
  appUsers?: AppUser[];
};

const STORE_PATH = join(process.cwd(), ".shiftproof", "mock-store.json");

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function readSnapshot(): Snapshot {
  try {
    if (!existsSync(STORE_PATH)) return {};
    return JSON.parse(readFileSync(STORE_PATH, "utf8")) as Snapshot;
  } catch {
    return {};
  }
}

function writeSnapshot(snapshot: Snapshot): void {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(snapshot, null, 2));
}

function mergeByIdentity<T>(
  seed: T[],
  saved: T[] | undefined,
  matches: (a: T, b: T) => boolean,
): T[] {
  const merged = seed.map((item) => ({ ...item }));
  for (const item of saved ?? []) {
    const index = merged.findIndex((existing) => matches(existing, item));
    if (index >= 0) merged[index] = { ...merged[index], ...item };
    else merged.push({ ...item });
  }
  return merged;
}

export function loadMockUsers(seed: MockUser[]): MockUser[] {
  const snapshot = readSnapshot();
  return mergeByIdentity(seed, snapshot.mockUsers, (a, b) =>
    a.id === b.id || a.email.toLowerCase() === b.email.toLowerCase()
  );
}

export function saveMockUsers(users: MockUser[]): void {
  writeSnapshot({ ...readSnapshot(), mockUsers: users });
}

export function loadAppUsers(seed: AppUser[]): AppUser[] {
  const snapshot = readSnapshot();
  return mergeByIdentity(seed, snapshot.appUsers, (a, b) =>
    a.id === b.id ||
    a.authIdentifier === b.authIdentifier ||
    (Boolean(a.email) && Boolean(b.email) && a.email.toLowerCase() === b.email.toLowerCase()) ||
    (Boolean(a.phoneNumber) && Boolean(b.phoneNumber) && normalizePhone(a.phoneNumber) === normalizePhone(b.phoneNumber))
  );
}

export function saveAppUsers(users: AppUser[]): void {
  writeSnapshot({ ...readSnapshot(), appUsers: users });
}

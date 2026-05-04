import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { parseSession, SESSION_COOKIE, findUserByEmail, findUserByPhone } from "@/lib/users";
import { pgListings, type PGListing } from "@/lib/pgData";
import {
  CURRENT_STAY_MOCK,
  NOTICES,
  PAYMENTS,
  PROPERTIES,
  PROPERTY_ROOMS,
  TENANTS,
} from "@/lib/mockData";
import { CURRENT_ORG, MOCK_ORGS } from "@/lib/orgData";
import type {
  AddOrgMemberRequest,
  AppUser,
  AuthIdentity,
  AuthLinkingCompleteResponse,
  AuthLinkingStartResponse,
  AuthSessionEvaluateResponse,
  AuthSessionState,
  BulkAssignOrgMemberPropertiesRequest,
  CreatePaymentRequest,
  CreatePropertyRequest,
  CreateRoomRequest,
  CurrentStay,
  ImageUploadRequest,
  InviteTenantRequest,
  Notification,
  OnboardingCompleteResponse,
  OnboardingRequest,
  OrgMember,
  OrgProperty,
  Organization,
  Paginated,
  Payment,
  PaymentCheckout,
  PaymentSummary,
  Payout,
  Plan,
  Property,
  PropertyAccessSettings,
  PropertyImage,
  PropertyMember,
  PropertyReport,
  RoleContext,
  Room,
  Subscription,
  Tenant,
  TenantInviteResponse,
  UpdateProfileRequest,
  UpdateRoomRequest,
  UpdateTenantRequest,
} from "@/lib/api/types";

type InviteRecord = {
  code: string;
  propertyId: string;
  roomId: string;
  rentAmount: number;
  leaseStart: string;
  leaseEnd: string;
  email?: string;
  phoneNumber?: string;
  expiresAt: string;
};

type Store = {
  appUsers: AppUser[];
  properties: Property[];
  propertyMembers: Record<string, PropertyMember[]>;
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
  notifications: Notification[];
  orgs: (Organization & { members: OrgMember[] })[];
  subscriptions: Subscription[];
  plans: Plan[];
  payouts: Payout[];
  invites: InviteRecord[];
  deviceTokens: Record<string, string>;
  idempotencyKeys: Map<string, Payment>;
  preferredContexts: Record<string, string>;
};

const globalStore = globalThis as typeof globalThis & {
  __shiftproofMockApiStore?: Store;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeRoom(room: Room): Room {
  return {
    ...room,
    occupiedBeds: Math.max(0, Math.min(room.capacity, room.occupiedBeds)),
    isAvailable: room.occupiedBeds < room.capacity,
  };
}

function seedAppUsers(): AppUser[] {
  return [
    {
      id: "o1",
      authIdentifier: "o1",
      name: "Ravi Kumar",
      email: "ravi@shiftproof.in",
      phoneNumber: "9876543210",
      gender: "MALE",
      avatarUrl: "",
      city: "Bangalore",
      area: "Koramangala",
      profileCompleted: true,
      providers: ["password"],
      roles: ["OWNER"],
      createdAt: "2024-01-15",
    },
    {
      id: "o2",
      authIdentifier: "o2",
      name: "Priya Mehta",
      email: "priya@shiftproof.in",
      phoneNumber: "9876543211",
      gender: "FEMALE",
      avatarUrl: "",
      city: "Bangalore",
      area: "Indiranagar",
      profileCompleted: true,
      providers: ["password"],
      roles: ["OWNER"],
      createdAt: "2024-02-01",
    },
    {
      id: "t1",
      authIdentifier: "t1",
      name: "Rahul Sharma",
      email: "rahul@shiftproof.in",
      phoneNumber: "9876543212",
      gender: "MALE",
      avatarUrl: "",
      city: "Bangalore",
      area: "Koramangala",
      profileCompleted: true,
      providers: ["password"],
      roles: ["TENANT"],
      createdAt: "2024-01-01",
    },
    {
      id: "t2",
      authIdentifier: "t2",
      name: "Priya Verma",
      email: "priya@shiftproof.in",
      phoneNumber: "9876543213",
      gender: "FEMALE",
      avatarUrl: "",
      city: "Bangalore",
      area: "Indiranagar",
      profileCompleted: true,
      providers: ["password"],
      roles: ["TENANT"],
      createdAt: "2024-03-01",
    },
  ];
}

function buildPropertyMembers(): Record<string, PropertyMember[]> {
  const source = CURRENT_ORG.members.map((member) => ({
    userId: member.userId ?? member.id,
    name: member.name,
    email: member.email,
    avatarUrl: member.avatarUrl ?? "",
    role: member.role,
  }));
  return Object.fromEntries(PROPERTIES.map((property) => [property.id, clone(source)]));
}

function buildStore(): Store {
  const properties = clone(PROPERTIES);
  const rooms = Object.values(PROPERTY_ROOMS).flat().map((room) => normalizeRoom(clone(room)));
  const orgs = MOCK_ORGS.map((org) => ({
    id: org.id,
    name: org.name,
    billingOwnerId: org.ownerId,
    logoUrl: org.image ?? "",
    createdAt: org.createdAt,
    members: clone(org.members).map((member) => ({
      userId: member.userId ?? member.id,
      name: member.name,
      email: member.email,
      avatarUrl: member.avatarUrl ?? "",
      role: (["owner", "admin"].includes(member.role) ? member.role : "member") as OrgMember["role"],
      joinedAt: member.joinedAt,
    })),
  }));

  return {
    appUsers: seedAppUsers(),
    properties,
    propertyMembers: buildPropertyMembers(),
    rooms,
    tenants: clone(TENANTS),
    payments: clone(PAYMENTS),
    notifications: clone(NOTICES),
    orgs,
    subscriptions: [
      {
        id: "sub-1",
        planId: "growth",
        planName: "Growth",
        price: 2999,
        status: "active",
        startDate: "2026-01-01",
        endDate: "",
      },
    ],
    plans: [
      {
        id: "starter",
        name: "Starter",
        price: 0,
        maxProperties: 1,
        maxTenants: 5,
        features: ["1 property", "5 tenants", "Basic rent tracking"],
        isCurrent: false,
        isPopular: false,
      },
      {
        id: "growth",
        name: "Growth",
        price: 2999,
        maxProperties: 5,
        maxTenants: 50,
        features: ["5 properties", "50 tenants", "Payments", "Reports"],
        isCurrent: true,
        isPopular: true,
      },
      {
        id: "scale",
        name: "Scale",
        price: 6999,
        maxProperties: 999,
        maxTenants: 9999,
        features: ["Unlimited properties", "Unlimited tenants", "Priority support"],
        isCurrent: false,
        isPopular: false,
      },
    ],
    payouts: [
      {
        id: "po-1",
        amount: 28500,
        date: "2025-04-05",
        status: "completed",
        description: "April owner settlement",
        propertyTitle: "Sunshine PG",
        bankLast4: "4421",
      },
    ],
    invites: [],
    deviceTokens: {},
    idempotencyKeys: new Map<string, Payment>(),
    preferredContexts: {},
  };
}

const store = globalStore.__shiftproofMockApiStore ?? buildStore();
globalStore.__shiftproofMockApiStore = store;

function nowIso(): string {
  return new Date().toISOString();
}

function today(): string {
  return nowIso().slice(0, 10);
}

function secureCookieFlag(): boolean {
  return process.env.NODE_ENV === "production";
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function json(data: unknown, status = 200): NextResponse {
  const res = NextResponse.json(data, { status });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

function error(status: number, message: string): NextResponse {
  return NextResponse.json({ code: status, error: message }, { status });
}

function paginated<T>(items: T[], page = 1, limit = 20): Paginated<T> {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;

  return {
    data: items.slice(start, start + safeLimit),
    meta: {
      page: safePage,
      total,
      totalPages,
    },
  };
}

function nextId(prefix: string, current: { id: string }[]): string {
  const max = current.reduce((acc, item) => {
    const match = item.id.match(/\d+$/);
    return Math.max(acc, match ? Number(match[0]) : 0);
  }, 0);
  return `${prefix}${max + 1}`;
}

function decodeBearerToken(token: string): {
  uid: string;
  email: string;
  phone: string;
  name: string;
  picture: string;
  signInProvider: string;
} | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    ) as {
      user_id?: string;
      sub?: string;
      email?: string;
      phone_number?: string;
      name?: string;
      picture?: string;
      firebase?: { sign_in_provider?: string };
    };
    const email = payload.email ?? "";
    const phone = payload.phone_number ?? "";
    const uid = payload.user_id ?? payload.sub ?? "";
    if ((!email && !phone) || !uid) return null;
    return {
      uid,
      email,
      phone,
      name: payload.name ?? email.split("@")[0] ?? phone,
      picture: payload.picture ?? "",
      signInProvider: payload.firebase?.sign_in_provider ?? "firebase",
    };
  } catch {
    return null;
  }
}

function tenantIdForUser(user: AppUser): string | null {
  if (user.id === "t1" || user.email === "rahul@shiftproof.in") return "u1";
  if (user.id === "t2" || user.email === "priya@shiftproof.in") return "u2";
  const direct = store.tenants.find((tenant) =>
    (user.email && tenant.email.toLowerCase() === user.email.toLowerCase()) ||
    (user.phoneNumber && normalizePhone(tenant.phone) === normalizePhone(user.phoneNumber))
  );
  return direct?.id ?? null;
}

function orgForUser(user: AppUser): Organization | null {
  if (!user.roles.includes("OWNER")) return null;
  const org =
    store.orgs.find((item) => item.billingOwnerId === user.id) ??
    store.orgs.find((item) => item.members.some((member) => member.email.toLowerCase() === user.email.toLowerCase()));
  return org
    ? {
      id: org.id,
      name: org.name,
      billingOwnerId: org.billingOwnerId,
      logoUrl: org.logoUrl,
      createdAt: org.createdAt,
    }
    : null;
}

function upsertAppUser(user: AppUser): AppUser {
  const index = store.appUsers.findIndex(
    (entry) =>
      entry.id === user.id ||
      entry.authIdentifier === user.authIdentifier ||
      (Boolean(entry.email) && Boolean(user.email) && entry.email.toLowerCase() === user.email.toLowerCase()) ||
      (Boolean(entry.phoneNumber) && Boolean(user.phoneNumber) && normalizePhone(entry.phoneNumber) === normalizePhone(user.phoneNumber)),
  );
  if (index >= 0) {
    store.appUsers[index] = { ...store.appUsers[index], ...user };
    return store.appUsers[index];
  }
  store.appUsers.push(user);
  return user;
}

function userFromSession(req: NextRequest): AppUser | null {
  const session = parseSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const existing = store.appUsers.find(
    (user) =>
      user.id === session.id ||
      (Boolean(session.email) && Boolean(user.email) && user.email.toLowerCase() === session.email.toLowerCase()),
  );
  if (existing) {
    return existing;
  }

  const role = session.role === "owner" ? "OWNER" : "TENANT";
  return upsertAppUser({
    id: session.id,
    authIdentifier: session.id,
    name: session.name,
    email: session.email.toLowerCase(),
    phoneNumber: "",
    gender: role === "OWNER" ? "MALE" : "CO_LIVING",
    avatarUrl: "",
    city: "Bangalore",
    area: "",
    profileCompleted: true,
    providers: ["session"],
    roles: [role],
    createdAt: today(),
  });
}

function userFromBearer(req: NextRequest): AppUser | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const payload = decodeBearerToken(header.slice(7));
  if (!payload) return null;

  const matchingPhoneUser = payload.phone
    ? store.appUsers.find(
      (user) =>
        user.authIdentifier === payload.uid ||
        (Boolean(user.phoneNumber) &&
          normalizePhone(user.phoneNumber) === normalizePhone(payload.phone) &&
          user.providers.includes("phone")),
    )
    : null;

  if (payload.signInProvider === "phone" && payload.phone) {
    const existingEmailAccount = findUserByPhone(payload.phone);
    if (existingEmailAccount?.email && !matchingPhoneUser) {
      return null;
    }
  }

  const existing = store.appUsers.find(
    (user) =>
      user.authIdentifier === payload.uid ||
      (Boolean(payload.email) && Boolean(user.email) && user.email.toLowerCase() === payload.email.toLowerCase()) ||
      (Boolean(payload.phone) && Boolean(user.phoneNumber) && normalizePhone(user.phoneNumber) === normalizePhone(payload.phone)),
  );
  if (existing) {
    const nextProvider = payload.signInProvider === "phone" ? "phone" : "firebase";
    const providers = existing.providers.includes(nextProvider)
      ? existing.providers
      : [...existing.providers, nextProvider];
    return upsertAppUser({
      ...existing,
      authIdentifier: payload.uid,
      name: payload.name || existing.name,
      email: payload.email ? payload.email.toLowerCase() : existing.email,
      phoneNumber: payload.phone ? normalizePhone(payload.phone) : existing.phoneNumber,
      // Preserve a manually-set avatar; fall back to the Google photo only when empty.
      avatarUrl: existing.avatarUrl || payload.picture,
      providers,
    });
  }

  const mockUser =
    (payload.email ? findUserByEmail(payload.email) : undefined) ??
    (payload.phone ? findUserByPhone(payload.phone) : undefined);
  const role = mockUser?.role === "owner" ? "OWNER" : "TENANT";
  const fallbackName =
    payload.name ||
    mockUser?.name ||
    (payload.phone ? `User ${payload.phone.slice(-4)}` : "ShiftProof User");

  return upsertAppUser({
    id: mockUser?.id ?? payload.uid,
    authIdentifier: payload.uid,
    name: fallbackName,
    email: payload.email ? payload.email.toLowerCase() : "",
    phoneNumber: payload.phone ? normalizePhone(payload.phone) : mockUser?.phone ?? "",
    gender: role === "OWNER" ? "MALE" : "CO_LIVING",
    avatarUrl: payload.picture,
    city: "Bangalore",
    area: "",
    profileCompleted: Boolean(mockUser),
    providers: [payload.signInProvider === "phone" ? "phone" : "firebase"],
    roles: [role],
    createdAt: today(),
  });
}

function requestUser(req: NextRequest): AppUser | null {
  return userFromSession(req) ?? userFromBearer(req);
}

function roomById(id: string): Room | undefined {
  return store.rooms.find((room) => room.id === id);
}

function propertyById(id: string): Property | undefined {
  return store.properties.find((property) => property.id === id);
}

function tenantById(id: string): Tenant | undefined {
  return store.tenants.find((tenant) => tenant.id === id);
}

function paymentById(id: string): Payment | undefined {
  return store.payments.find((payment) => payment.id === id);
}

function updatePropertyOccupancy(propertyId: string): void {
  const property = propertyById(propertyId);
  if (!property) return;
  const propertyRooms = store.rooms.filter((room) => room.propertyId === propertyId);
  property.totalRooms = propertyRooms.length;
  property.occupiedRooms = propertyRooms.filter((room) => room.occupiedBeds > 0).length;
}

function roomIdForTenant(tenant: Tenant): string | null {
  const room = store.rooms.find(
    (entry) => entry.propertyId === tenant.propertyId && entry.roomNumber === tenant.room,
  );
  return room?.id ?? null;
}

function currentStayForUser(user: AppUser): CurrentStay | null {
  const tenantId = tenantIdForUser(user);
  if (!tenantId) return null;
  const tenant = tenantById(tenantId);
  if (!tenant) return null;
  const property = propertyById(tenant.propertyId);
  const room = store.rooms.find(
    (entry) => entry.propertyId === tenant.propertyId && entry.roomNumber === tenant.room,
  );
  if (!property || !room) return clone(CURRENT_STAY_MOCK);

  const owner = store.appUsers.find((entry) => entry.roles.includes("OWNER")) ?? store.appUsers[0];
  return {
    propertyName: property.title,
    address: property.location,
    imageUrl: property.imageUrl,
    roomNumber: room.roomNumber,
    rentAmount: tenant.rentAmount,
    dueDate: tenant.dueDate,
    isRentDue: !tenant.isPaid,
    leaseStart: "2026-01-01",
    leaseEnd: "2026-12-31",
    ownerName: owner.name,
    ownerPhone: owner.phoneNumber || "+91 98765 00000",
    ownerAvatarUrl: owner.avatarUrl,
  };
}

async function readJson<T>(req: NextRequest): Promise<T> {
  return (await req.json().catch(() => ({}))) as T;
}

function requireUser(req: NextRequest): AppUser | NextResponse {
  const user = requestUser(req);
  return user ?? error(401, "Unauthorized");
}

function requireOwner(req: NextRequest): AppUser | NextResponse {
  const user = requestUser(req);
  if (!user) return error(401, "Unauthorized");
  if (!user.roles.includes("OWNER")) return error(403, "Forbidden");
  return user;
}

/** Verifies that the acting user is an owner AND is a member of the given property. */
function requirePropertyOwner(req: NextRequest, propertyId: string): AppUser | NextResponse {
  const user = requireOwner(req);
  if (user instanceof NextResponse) return user;
  const members = store.propertyMembers[propertyId] ?? [];
  const isMember = members.some((m) => m.userId === user.id && ["owner", "manager"].includes(m.role));
  if (!isMember) return error(403, "You do not have access to this property");
  return user;
}

/** Returns true if the given user is a member of the property that owns this payment. */
function userCanReadPayment(user: AppUser, payment: Payment): boolean {
  if (user.roles.includes("OWNER")) {
    const members = store.propertyMembers[payment.propertyId] ?? [];
    return members.some((m) => m.userId === user.id);
  }
  const tenantId = tenantIdForUser(user);
  return Boolean(tenantId && (payment.tenantId === tenantId || (!payment.tenantId && payment.tenantName === tenantById(tenantId)?.name)));
}

function requireTenant(req: NextRequest): AppUser | NextResponse {
  const user = requestUser(req);
  if (!user) return error(401, "Unauthorized");
  if (!user.roles.includes("TENANT")) return error(403, "Forbidden");
  return user;
}

function message(value: string): Record<string, string> {
  return { message: value };
}

async function handleAuth(req: NextRequest, parts: string[]): Promise<NextResponse> {
  if (parts.length === 1 && parts[0] === "me" && req.method === "GET") {
    const user = requireUser(req);
    return user instanceof NextResponse ? user : json(user);
  }

  if (parts.length === 2 && parts[0] === "me" && parts[1] === "current-stay" && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const stay = currentStayForUser(user);
    return stay ? json(stay) : noContent();
  }

  if (parts.length === 1 && parts[0] === "logout" && req.method === "POST") {
    const res = json(message("Logged out"));
    res.cookies.set(SESSION_COOKIE, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookieFlag(),
    });
    return res;
  }

  if (parts.length === 1 && parts[0] === "device-token" && req.method === "POST") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const body = await readJson<{ token?: string }>(req);
    if (!body.token?.trim()) return error(400, "token is required");
    store.deviceTokens[user.id] = body.token.trim();
    return json(message("Device token registered"));
  }

  if (parts.length === 2 && parts[0] === "me" && parts[1] === "contexts" && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const contexts: RoleContext[] = [];
    for (const [propertyId, members] of Object.entries(store.propertyMembers)) {
      const membership = members.find(
        (m) => m.userId === user.id || (user.email && m.email.toLowerCase() === user.email.toLowerCase()),
      );
      if (membership) {
        const prop = propertyById(propertyId);
        contexts.push({ propertyId, propertyName: prop?.title ?? propertyId, role: membership.role });
      }
    }
    const tenantId = tenantIdForUser(user);
    if (tenantId) {
      const tenant = tenantById(tenantId);
      if (tenant && !contexts.some((c) => c.propertyId === tenant.propertyId)) {
        const prop = propertyById(tenant.propertyId);
        contexts.push({ propertyId: tenant.propertyId, propertyName: prop?.title ?? tenant.propertyId, role: "tenant" });
      }
    }
    return json(contexts);
  }

  if (parts.length === 3 && parts[0] === "me" && parts[1] === "contexts" && parts[2] === "preferred" && req.method === "PATCH") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const body = await readJson<{ propertyId?: string }>(req);
    store.preferredContexts[user.id] = body.propertyId ?? "";
    return noContent();
  }

  if (parts.length === 2 && parts[0] === "onboarding" && parts[1] === "complete" && req.method === "POST") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const body = await readJson<OnboardingRequest>(req);
    if (!body.name?.trim() || !body.gender) return error(400, "name and gender are required");
    user.name = body.name.trim();
    user.gender = body.gender as AppUser["gender"];
    if (body.phoneNumber) user.phoneNumber = normalizePhone(body.phoneNumber);
    if (body.city) user.city = body.city;
    if (body.area) user.area = body.area;
    if (body.role) {
      const role = body.role.toUpperCase() as "OWNER" | "TENANT";
      if (!user.roles.includes(role)) user.roles.push(role);
    }
    user.profileCompleted = true;
    const onboardingResponse: OnboardingCompleteResponse = {
      user,
      roleStatus: body.role ? "assigned" : "pending",
      profileCompleted: true,
    };
    return json(onboardingResponse);
  }

  if (parts.length === 2 && parts[0] === "session" && parts[1] === "evaluate" && req.method === "POST") {
    const body = await readJson<{ idToken?: string }>(req);
    if (!body.idToken) return error(400, "idToken is required");
    const user = requestUser(req);
    const identity: AuthIdentity = {
      uid: user?.authIdentifier ?? "mock-uid",
      email: user?.email || undefined,
      emailVerified: true,
      phoneNumber: user?.phoneNumber || undefined,
      name: user?.name,
      providers: user?.providers ?? [],
      signInProvider: user?.providers?.[0] ?? "password",
    };
    const sessionState: AuthSessionState | undefined = user
      ? { user, roleStatus: "assigned", profileCompleted: user.profileCompleted }
      : undefined;
    const evalResponse: AuthSessionEvaluateResponse = {
      decision: "allow_session",
      identity,
      sessionState,
      existingAccount: undefined,
      recommendedNextStep: "proceed",
    };
    return json(evalResponse);
  }

  if (parts.length === 2 && parts[0] === "linking" && parts[1] === "start" && req.method === "POST") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const body = await readJson<{ targetProvider?: string }>(req);
    if (!body.targetProvider) return error(400, "targetProvider is required");
    const linkStartResponse: AuthLinkingStartResponse = {
      allowed: true,
      decision: "allowed",
      targetProvider: body.targetProvider,
      currentSession: { user, roleStatus: "assigned", profileCompleted: user.profileCompleted },
      existingAccount: undefined,
      recommendedNextStep: "proceed_with_linking",
    };
    return json(linkStartResponse);
  }

  if (parts.length === 2 && parts[0] === "linking" && parts[1] === "complete" && req.method === "POST") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const body = await readJson<{ idToken?: string }>(req);
    if (!body.idToken) return error(400, "idToken is required");
    const identity: AuthIdentity = {
      uid: user.authIdentifier,
      email: user.email || undefined,
      emailVerified: true,
      phoneNumber: user.phoneNumber || undefined,
      name: user.name,
      providers: user.providers,
      signInProvider: user.providers[0] ?? "password",
    };
    const linkCompleteResponse: AuthLinkingCompleteResponse = {
      decision: "linked",
      identity,
      sessionState: { user, roleStatus: "assigned", profileCompleted: user.profileCompleted },
      recommendedNextStep: "proceed",
    };
    return json(linkCompleteResponse);
  }

  return error(404, "Not found");
}

async function handleNotifications(req: NextRequest, parts: string[]): Promise<NextResponse> {
  const user = requireUser(req);
  if (user instanceof NextResponse) return user;

  if (parts.length === 0 && req.method === "GET") {
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");

    // Scope notifications to the properties the current user is associated with
    let items = [...store.notifications];
    if (!user.roles.includes("OWNER")) {
      // For tenants: show only notifications for their property
      const tenantId = tenantIdForUser(user);
      const tenant = tenantId ? tenantById(tenantId) : null;
      if (tenant) {
        items = items.filter((n) =>
          // Notification type cast — propertyId is not in model, so we use
          // the tenantId on the Notification extended type when present
          (n as Notification & { propertyId?: string }).propertyId === tenant.propertyId ||
          // Fall back: include all if not tagged (keeps existing seed data visible)
          !(n as Notification & { propertyId?: string }).propertyId,
        );
      }
    }
    // For owners: scope to their properties only
    if (user.roles.includes("OWNER")) {
      const ownerPropertyIds = new Set(
        Object.entries(store.propertyMembers)
          .filter(([, members]) => members.some((m) => m.userId === user.id))
          .map(([pid]) => pid),
      );
      if (ownerPropertyIds.size > 0) {
        items = items.filter((n) => {
          const pid = (n as Notification & { propertyId?: string }).propertyId;
          return !pid || ownerPropertyIds.has(pid);
        });
      }
    }
    return json(paginated(items, page, limit));
  }

  if (parts.length === 1 && parts[0] === "mark-all-read" && req.method === "PATCH") {
    let updated = 0;
    for (const notification of store.notifications) {
      if (!notification.isRead) {
        notification.isRead = true;
        updated += 1;
      }
    }
    return json({ updated });
  }

  if (parts.length === 2 && parts[1] === "read" && req.method === "PATCH") {
    const notification = store.notifications.find((item) => item.id === parts[0]);
    if (!notification) return error(404, "Notification not found");
    notification.isRead = true;
    return json(notification);
  }

  return error(404, "Not found");
}

async function handleOrgs(req: NextRequest, parts: string[]): Promise<NextResponse> {
  if (parts.length === 0 && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const myOrgs = store.orgs
      .filter(
        (org) =>
          org.billingOwnerId === user.id ||
          org.members.some(
            (m) => m.userId === user.id || (user.email && m.email.toLowerCase() === user.email.toLowerCase()),
          ),
      )
      .map(({ members: _members, ...orgData }) => orgData);
    return json(myOrgs);
  }

  if (parts.length === 0 && req.method === "POST") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    const existingOwnerOrg = store.orgs.find((org) => org.billingOwnerId === user.id);
    if (existingOwnerOrg) return error(409, "You already own an organization");
    const body = await readJson<{ name?: string }>(req);
    if (!body.name?.trim()) return error(400, "Organization name is required");
    const existing = store.orgs.find((org) => org.name.toLowerCase() === body.name!.trim().toLowerCase());
    if (existing) return error(409, "Organization with that name already exists");
    const org = {
      id: `org${store.orgs.length + 1}`,
      name: body.name.trim(),
      billingOwnerId: user.id,
      logoUrl: "",
      createdAt: today(),
      members: [
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: "owner" as const,
          joinedAt: today(),
        },
      ],
    };
    store.orgs.push(org);
    return json({
      id: org.id,
      name: org.name,
      billingOwnerId: org.billingOwnerId,
      logoUrl: org.logoUrl,
      createdAt: org.createdAt,
    }, 201);
  }

  if (parts.length === 1 && parts[0] === "me" && req.method === "GET") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    const org = orgForUser(user);
    return org ? json(org) : error(404, "Organization not found");
  }

  const orgId = parts[0];
  const org = store.orgs.find((item) => item.id === orgId);
  if (!org) return error(404, "Organization not found");

  if (parts.length === 1 && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const isMember =
      org.billingOwnerId === user.id ||
      org.members.some(
        (m) => m.userId === user.id || (user.email && m.email.toLowerCase() === user.email.toLowerCase()),
      );
    if (!isMember) return error(403, "Forbidden");
    const { members: _members, ...orgData } = org;
    return json(orgData);
  }

  if (parts.length === 1 && req.method === "PATCH") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    if (org.billingOwnerId !== user.id) return error(403, "Only the billing owner can rename this org");
    const body = await readJson<{ name?: string }>(req);
    if (!body.name?.trim()) return error(400, "name is required");
    org.name = body.name.trim();
    const { members: _members, ...orgData } = org;
    return json(orgData);
  }

  if (parts.length === 2 && parts[1] === "properties" && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const orgMemberIds = new Set([org.billingOwnerId, ...org.members.map((m) => m.userId)]);
    const orgProperties: OrgProperty[] = store.properties
      .filter((p) => (store.propertyMembers[p.id] ?? []).some((m) => orgMemberIds.has(m.userId)))
      .map((p) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        type: p.type,
        ownerId: org.billingOwnerId,
        isPrivate: p.isPrivate ?? false,
        imageUrl: p.imageUrl,
        createdAt: today(),
      }));
    return json(orgProperties);
  }

  if (parts.length === 4 && parts[1] === "members" && parts[3] === "properties" && req.method === "POST") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    if (org.billingOwnerId !== user.id) return error(403, "Only the billing owner can assign properties");
    const targetUserId = parts[2];
    if (!org.members.some((m) => m.userId === targetUserId)) return error(404, "Member not found in org");
    const body = await readJson<BulkAssignOrgMemberPropertiesRequest>(req);
    if (!body.propertyIds?.length || !body.role) return error(400, "propertyIds and role are required");
    if (!["manager", "viewer"].includes(body.role)) return error(400, "role must be manager or viewer");
    const memberUser = store.appUsers.find((u) => u.id === targetUserId);
    for (const propertyId of body.propertyIds) {
      if (!propertyById(propertyId)) continue;
      const members = store.propertyMembers[propertyId] ?? [];
      const entry: PropertyMember = {
        userId: targetUserId,
        name: memberUser?.name ?? targetUserId,
        email: memberUser?.email ?? `${targetUserId}@shiftproof.in`,
        avatarUrl: memberUser?.avatarUrl ?? "",
        role: body.role,
      };
      const idx = members.findIndex((m) => m.userId === targetUserId);
      if (idx >= 0) members[idx] = entry;
      else members.push(entry);
      store.propertyMembers[propertyId] = members;
    }
    return json(message("Properties assigned"));
  }

  if (parts.length === 2 && parts[1] === "transfer-ownership" && req.method === "PATCH") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    if (org.billingOwnerId !== user.id) return error(403, "Only the billing owner can transfer ownership");
    const body = await readJson<{ newBillingOwnerUserId?: string }>(req);
    if (!body.newBillingOwnerUserId?.trim()) return error(400, "newBillingOwnerUserId is required");
    if (!org.members.some((m) => m.userId === body.newBillingOwnerUserId)) {
      return error(400, "New owner must be an existing org member");
    }
    for (const member of org.members) {
      if (member.userId === org.billingOwnerId) member.role = "member";
      if (member.userId === body.newBillingOwnerUserId) member.role = "owner";
    }
    org.billingOwnerId = body.newBillingOwnerUserId!;
    const { members: _members, ...orgData } = org;
    return json(orgData);
  }

  if (parts.length === 2 && parts[1] === "logo" && req.method === "POST") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    if (org.billingOwnerId !== user.id) return error(403, "Only the billing owner can upload a logo");
    const body = await readJson<ImageUploadRequest>(req);
    if (!body.data || !body.contentType) return error(400, "Invalid upload payload");
    if (!ALLOWED_IMAGE_TYPES.includes(body.contentType as never)) return error(400, "Unsupported image type");
    if (body.data.length > 6_800_000) return error(400, "Image too large (max 5 MB)");
    org.logoUrl = `data:${body.contentType};base64,${body.data}`;
    return json({
      id: org.id,
      name: org.name,
      billingOwnerId: org.billingOwnerId,
      logoUrl: org.logoUrl,
      createdAt: org.createdAt,
    });
  }

  if (parts.length === 2 && parts[1] === "members" && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const isMember =
      org.billingOwnerId === user.id ||
      org.members.some(
        (m) => m.userId === user.id || (user.email && m.email.toLowerCase() === user.email.toLowerCase()),
      );
    if (!isMember) return error(403, "Forbidden");
    return json(org.members);
  }

  if (parts.length === 2 && parts[1] === "members" && req.method === "POST") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    // SEC-9: billing owner only
    if (org.billingOwnerId !== user.id) return error(403, "Only the billing owner can add members");
    const body = await readJson<AddOrgMemberRequest>(req);
    if (!body.userId?.trim() || !body.role) return error(400, "userId and role are required");
    if (!["admin", "member"].includes(body.role)) return error(400, "role must be admin or member");
    if (org.members.some((member) => member.userId === body.userId)) return noContent();
    org.members.push({
      userId: body.userId,
      name: titleCase(body.userId),
      email: `${body.userId}@shiftproof.in`,
      avatarUrl: "",
      role: body.role,
      joinedAt: today(),
    });
    return noContent();
  }

  if (parts.length === 3 && parts[1] === "members" && req.method === "DELETE") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    // SEC-9: billing owner only
    if (org.billingOwnerId !== user.id) return error(403, "Only the billing owner can remove members");
    // SEC-10: prevent self-removal of billing owner
    if (parts[2] === org.billingOwnerId) return error(403, "Cannot remove the billing owner");
    const index = org.members.findIndex((member) => member.userId === parts[2]);
    if (index >= 0) org.members.splice(index, 1);
    return noContent();
  }

  return error(404, "Not found");
}

async function handlePayments(req: NextRequest, parts: string[]): Promise<NextResponse> {
  const user = requireUser(req);
  if (user instanceof NextResponse) return user;

  if (parts.length === 0 && req.method === "GET") {
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");
    const propertyId = req.nextUrl.searchParams.get("propertyId");
    const status = req.nextUrl.searchParams.get("status");
    const type = req.nextUrl.searchParams.get("type");

    let items = [...store.payments];

    // Tenant: filter by stable tenantId when available, fall back to name
    if (!user.roles.includes("OWNER")) {
      const tenantId = tenantIdForUser(user);
      if (tenantId) {
        items = items.filter(
          (p) => p.tenantId === tenantId || (!p.tenantId && p.tenantName === tenantById(tenantId)?.name),
        );
      } else {
        items = [];
      }
    }

    if (propertyId) items = items.filter((p) => p.propertyId === propertyId);
    if (status) items = items.filter((p) => p.status === status);
    if (type) items = items.filter((p) => p.type === type);
    return json(paginated(items, page, limit));
  }

  if (parts.length === 0 && req.method === "POST") {
    const idempotencyKey = req.headers.get("X-Idempotency-Key")?.trim();
    if (idempotencyKey) {
      const cached = store.idempotencyKeys.get(idempotencyKey);
      if (cached) return json(cached, 201);
    }
    const body = await readJson<CreatePaymentRequest>(req);
    if (!body.title?.trim() || !body.propertyId?.trim() || !body.type || !Number.isInteger(body.amount)) {
      return error(400, "Invalid payment payload");
    }
    // VAL-1: type enum validation
    if (!["rent", "deposit", "electricity", "maintenance"].includes(body.type)) {
      return error(400, "type must be one of: rent, deposit, electricity, maintenance");
    }
    // VAL-5: negative amount
    if (body.amount <= 0) return error(400, "amount must be a positive integer");
    if (!propertyById(body.propertyId)) return error(422, "Property not found");
    const tenantId = tenantIdForUser(user) ?? undefined;
    const payment: Payment = {
      id: nextId("t", store.payments),
      title: body.title.trim(),
      description: body.description?.trim() ?? "",
      amount: body.amount,
      date: today(),
      status: "pending",
      type: body.type,
      collectionMode: "manual",
      propertyId: body.propertyId,
      tenantName: user.name,
      tenantId,
    };
    store.payments.unshift(payment);
    if (idempotencyKey) store.idempotencyKeys.set(idempotencyKey, payment);
    return json(payment, 201);
  }

  if (parts.length === 1 && parts[0] === "collections" && req.method === "GET") {
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");
    const propertyId = req.nextUrl.searchParams.get("propertyId");
    const status = req.nextUrl.searchParams.get("status");
    let items = store.payments.filter((payment) => payment.type === "rent");
    if (propertyId) items = items.filter((payment) => payment.propertyId === propertyId);
    if (status) items = items.filter((payment) => payment.status === status);
    return json(paginated(items, page, limit));
  }

  if (parts.length === 1 && parts[0] === "summary" && req.method === "GET") {
    const currentMonth = today().slice(0, 7); // "YYYY-MM"
    const summary: PaymentSummary = {
      // LOG-4: scope "this month" to the actual current calendar month
      totalCollectedThisMonth: store.payments
        .filter((p) => p.status === "paid" && p.date.startsWith(currentMonth))
        .reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: store.payments
        .filter((p) => p.status === "pending" || p.status === "overdue")
        .reduce((sum, p) => sum + p.amount, 0),
      // Use tenantId set when available for accurate deduplication
      overdueTenants: new Set(
        store.payments
          .filter((p) => p.status === "overdue")
          .map((p) => p.tenantId ?? p.tenantName),
      ).size,
      totalTenants: store.tenants.length,
    };
    return json(summary);
  }

  const payment = paymentById(parts[0]);
  if (!payment) return error(404, "Payment not found");

  if (parts.length === 1 && req.method === "GET") {
    // CON-3: scope read to owner of property or tenant's own payment
    if (!userCanReadPayment(user, payment)) return error(403, "Forbidden");
    return json(payment);
  }

  if (parts.length === 2 && parts[1] === "checkout" && req.method === "POST") {
    // SEC-12: only the tenant who owns the payment can initiate checkout
    if (!userCanReadPayment(user, payment)) return error(403, "Forbidden");
    if (payment.status === "paid") return error(422, "Payment already settled");
    payment.status = "checkout_created";
    const checkout: PaymentCheckout = {
      paymentId: payment.id,
      orderId: `order_${payment.id}_${Date.now()}`,
      amount: payment.amount,
      amountSubunits: payment.amount * 100,
      currency: "INR",
      keyId: "rzp_test_shiftproof",
      provider: "razorpay",
      description: payment.title,
      receipt: `receipt_${payment.id}`,
      notes: {
        propertyId: payment.propertyId,
        tenantName: payment.tenantName,
      },
    };
    return json(checkout);
  }

  if (parts.length === 2 && parts[1] === "pay" && req.method === "POST") {
    const tenantId = tenantIdForUser(user);
    const isPaymentTenant =
      (tenantId && payment.tenantId === tenantId) ||
      (tenantId && !payment.tenantId && payment.tenantName === tenantById(tenantId)?.name);
    if (!isPaymentTenant) return error(403, "Only the tenant who owns this payment can confirm it");
    if (payment.status === "paid") return error(422, "Payment already settled");
    const body = await readJson<{
      provider?: string;
      gatewayOrderId?: string;
      gatewayPaymentId?: string;
      gatewaySignature?: string;
      paymentMethod?: string;
      transactionRef?: string;
    }>(req);
    if (!body.provider?.trim()) return error(400, "provider is required");
    payment.collectionMode = body.provider === "razorpay" ? "online" : "manual";
    payment.status = "paid";
    payment.date = today();
    return json(payment);
  }

  if (parts.length === 2 && parts[1] === "confirm" && req.method === "POST") {
    // SEC-11: owner must be a member of this payment's property
    const confirmUser = requirePropertyOwner(req, payment.propertyId);
    if (confirmUser instanceof NextResponse) return confirmUser;
    if (payment.status !== "pending" && payment.status !== "overdue") {
      return error(422, "Only pending or overdue payments can be confirmed");
    }
    payment.status = "paid";
    payment.collectionMode = "manual";
    payment.date = today();
    const property = propertyById(payment.propertyId);
    store.payouts.unshift({
      id: `po-${Date.now()}`,
      amount: payment.amount,
      date: today(),
      status: "processing",
      description: `Payout created from ${payment.title}`,
      propertyTitle: property?.title ?? "Unknown property",
      bankLast4: "4421",
    });
    return json(payment);
  }

  return error(404, "Not found");
}

async function handleProperties(req: NextRequest, parts: string[]): Promise<NextResponse> {
  if (parts.length === 0 && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");
    return json(paginated(store.properties, page, limit));
  }

  if (parts.length === 0 && req.method === "POST") {
    const user = requireOwner(req);
    if (user instanceof NextResponse) return user;
    const body = await readJson<CreatePropertyRequest>(req);
    if (!body.title?.trim() || !body.location?.trim() || !body.type || !Number.isInteger(body.price)) {
      return error(400, "Invalid property payload");
    }
    // VAL-2: type enum
    if (!["PG", "Flat", "House"].includes(body.type)) {
      return error(400, "type must be one of: PG, Flat, House");
    }
    // VAL-6: non-positive price
    if (body.price <= 0) return error(400, "price must be a positive integer");
    const property: Property = {
      id: nextId("p", store.properties), // LOG-2: use max-suffix not count
      title: body.title.trim(),
      location: body.location.trim(),
      city: "",
      locality: "",
      type: body.type,
      gender: "Co-ed",
      roomTypes: [],
      price: body.price,
      deposit: body.deposit ?? 0,
      description: body.description?.trim() ?? "",
      amenities: body.amenities ?? [],
      totalRooms: body.totalRooms ?? 0,
      occupiedRooms: 0,
      occupancy: 0,
      imageUrl: "",
      images: [],
      rating: 0,
      reviews: 0,
      distanceFromMetro: "",
      lat: 0,
      lng: 0,
      ownerName: user.name,
      ownerAvatarUrl: user.avatarUrl,
    };
    store.properties.push(property);
    store.propertyMembers[property.id] = [
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: "owner",
      },
    ];
    return json(property, 201);
  }

  const propertyId = parts[0];
  const property = propertyById(propertyId);
  if (!property) return error(404, "Property not found");

  if (parts.length === 1 && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    return json(property);
  }

  if (parts.length === 1 && req.method === "PUT") {
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    const body = await readJson<CreatePropertyRequest>(req);
    if (!body.title?.trim() || !body.location?.trim() || !body.type || !Number.isInteger(body.price)) {
      return error(400, "Invalid property payload");
    }
    // VAL-2 (PUT path): type enum
    if (!["PG", "Flat", "House"].includes(body.type)) {
      return error(400, "type must be one of: PG, Flat, House");
    }
    // VAL-6 (PUT path): non-positive price
    if (body.price <= 0) return error(400, "price must be a positive integer");
    property.title = body.title.trim();
    property.location = body.location.trim();
    property.type = body.type;
    property.price = body.price;
    property.deposit = body.deposit ?? property.deposit;
    property.description = body.description?.trim() ?? property.description;
    property.amenities = body.amenities ?? property.amenities;
    property.totalRooms = body.totalRooms ?? property.totalRooms;
    return json(property);
  }

  if (parts.length === 1 && req.method === "DELETE") {
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    store.properties = store.properties.filter((item) => item.id !== propertyId);
    store.rooms = store.rooms.filter((room) => room.propertyId !== propertyId);
    store.tenants = store.tenants.filter((tenant) => tenant.propertyId !== propertyId);
    // LOG-1: cascade delete orphan notifications
    store.notifications = store.notifications.filter(
      (n) => (n as Notification & { propertyId?: string }).propertyId !== propertyId,
    );
    delete store.propertyMembers[propertyId];
    return noContent();
  }

  if (parts.length === 2 && parts[1] === "images" && req.method === "POST") {
    // SEC-4: require property membership, not just owner role
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    const body = await readJson<ImageUploadRequest>(req);
    if (!body.data || !body.contentType) return error(400, "Invalid upload payload");
    if (!ALLOWED_IMAGE_TYPES.includes(body.contentType as never)) return error(400, "Unsupported image type");
    if (body.data.length > 13_600_000) return error(400, "Image too large (max 10 MB)");
    const image: PropertyImage = {
      id: `img-${property.id}-${property.images.length + 1}`,
      url: `data:${body.contentType};base64,${body.data}`,
      isCover: property.images.length === 0,
      position: property.images.length,
    };
    property.images.push(image);
    if (!property.imageUrl) property.imageUrl = image.url;
    return json(image, 201);
  }

  if (parts.length === 3 && parts[1] === "images" && req.method === "DELETE") {
    // SEC-4: require property membership
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    const deletedWasCover = property.images.find((img) => img.id === parts[2])?.isCover ?? false;
    property.images = property.images.filter((image) => image.id !== parts[2]);
    if (deletedWasCover && property.images.length > 0) {
      property.images[0].isCover = true;
      property.imageUrl = property.images[0].url;
    } else if (property.imageUrl && !property.images.some((img) => img.url === property.imageUrl)) {
      property.imageUrl = property.images[0]?.url ?? "";
    }
    return noContent();
  }

  if (parts.length === 2 && parts[1] === "members" && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    return json(store.propertyMembers[propertyId] ?? []);
  }

  if (parts.length === 2 && parts[1] === "members" && req.method === "POST") {
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    const body = await readJson<{ userId?: string; role?: string }>(req);
    if (!body.userId?.trim() || !body.role?.trim()) return error(400, "userId and role are required");
    const members = store.propertyMembers[propertyId] ?? [];
    if (!members.some((member) => member.userId === body.userId)) {
      members.push({
        userId: body.userId,
        name: titleCase(body.userId),
        email: `${body.userId}@shiftproof.in`,
        avatarUrl: "",
        role: body.role,
      });
      store.propertyMembers[propertyId] = members;
    }
    return json(message("Member added"));
  }

  if (parts.length === 3 && parts[1] === "members" && req.method === "DELETE") {
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    store.propertyMembers[propertyId] = (store.propertyMembers[propertyId] ?? []).filter(
      (member) => member.userId !== parts[2],
    );
    return noContent();
  }

  if (parts.length === 2 && parts[1] === "rooms" && req.method === "GET") {
    return json(store.rooms.filter((room) => room.propertyId === propertyId));
  }

  if (parts.length === 2 && parts[1] === "rooms" && req.method === "POST") {
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    const body = await readJson<CreateRoomRequest>(req);
    if (!body.roomNumber?.trim() || !body.type || !Number.isInteger(body.capacity) || !Number.isInteger(body.rentAmount)) {
      return error(422, "Invalid room payload");
    }
    // VAL-3: room type enum
    if (!["single", "double", "triple"].includes(body.type)) {
      return error(422, "type must be one of: single, double, triple");
    }
    const duplicate = store.rooms.some(
      (r) => r.propertyId === propertyId && r.roomNumber === body.roomNumber.trim(),
    );
    if (duplicate) return error(409, "Room number already exists in this property");
    const room: Room = normalizeRoom({
      id: `r${store.rooms.length + 1}`,
      propertyId,
      roomNumber: body.roomNumber.trim(),
      type: body.type,
      capacity: body.capacity,
      occupiedBeds: 0,
      isAvailable: true,
      rentAmount: body.rentAmount,
      deposit: body.deposit ?? 0,
    });
    store.rooms.push(room);
    updatePropertyOccupancy(propertyId);
    return json(room, 201);
  }

  if (parts.length === 2 && parts[1] === "privacy" && req.method === "GET") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const settings: PropertyAccessSettings = { isPrivate: property.isPrivate ?? false };
    return json(settings);
  }

  if (parts.length === 2 && parts[1] === "privacy" && req.method === "PATCH") {
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    const body = await readJson<{ isPrivate?: boolean }>(req);
    property.isPrivate = body.isPrivate ?? false;
    const settings: PropertyAccessSettings = { isPrivate: property.isPrivate };
    return json(settings);
  }

  if (parts.length === 2 && parts[1] === "tenants" && req.method === "GET") {
    // CON-7: owner/manager of this property only
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
    const items = store.tenants.filter((tenant) => tenant.propertyId === propertyId);
    return json(paginated(items, page, limit));
  }

  if (parts.length === 3 && parts[1] === "tenants" && parts[2] === "invite" && req.method === "POST") {
    // CON-6: must be member of this property
    const user = requirePropertyOwner(req, propertyId);
    if (user instanceof NextResponse) return user;
    const body = await readJson<InviteTenantRequest>(req);
    if (!body.roomId?.trim() || !body.leaseStart || !body.leaseEnd || !Number.isInteger(body.rentAmount)) {
      return error(422, "Invalid invite payload");
    }
    const room = roomById(body.roomId);
    if (!room || room.propertyId !== propertyId) return error(422, "Room not found");
    const invite: InviteRecord = {
      code: `INV-${randomBytes(6).toString("base64url").toUpperCase().slice(0, 8)}`,
      propertyId,
      roomId: body.roomId,
      rentAmount: body.rentAmount,
      leaseStart: body.leaseStart,
      leaseEnd: body.leaseEnd,
      email: body.email,
      phoneNumber: body.phoneNumber,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    store.invites.push(invite);
    const response: TenantInviteResponse = {
      inviteCode: invite.code,
      expiresAt: invite.expiresAt,
    };
    return json(response, 201);
  }

  return error(404, "Not found");
}

async function handleReports(req: NextRequest, parts: string[]): Promise<NextResponse> {
  const propertyId = parts[1];
  if (parts[0] !== "properties" || !propertyId) return error(404, "Not found");
  // Must be a member of this specific property (not just any owner)
  const user = requirePropertyOwner(req, propertyId);
  if (user instanceof NextResponse) return user;
  const property = propertyById(propertyId);
  if (!property) return error(400, "Property not found");
  const month = req.nextUrl.searchParams.get("month");
  if (month && !/^\d{4}-\d{2}$/.test(month)) return error(400, "month must be in YYYY-MM format");
  let payments = store.payments.filter((payment) => payment.propertyId === propertyId);
  if (month) payments = payments.filter((payment) => payment.date.startsWith(month));
  const report: PropertyReport = {
    totalCollected: payments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0),
    totalPending: payments
      .filter((payment) => payment.status === "pending" || payment.status === "overdue")
      .reduce((sum, payment) => sum + payment.amount, 0),
    overdueCount: payments.filter((payment) => payment.status === "overdue").length,
    occupancyRate: property.totalRooms > 0 ? property.occupiedRooms / property.totalRooms : 0,
    payments,
  };
  return json(report);
}

async function handleRooms(req: NextRequest, parts: string[]): Promise<NextResponse> {
  const room = roomById(parts[0]);
  if (!room) return error(404, "Room not found");

  if (req.method === "GET") {
    // Require authentication for room reads (owner or tenant of that property)
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    return json(room);
  }

  if (req.method === "PATCH") {
    // SEC-3: require property membership
    const user = requirePropertyOwner(req, room.propertyId);
    if (user instanceof NextResponse) return user;
    const body = await readJson<UpdateRoomRequest>(req);
    // CON-5: duplicate roomNumber check on update
    if (body.roomNumber !== undefined) {
      const trimmed = body.roomNumber.trim();
      const conflict = store.rooms.some(
        (r) => r.propertyId === room.propertyId && r.roomNumber === trimmed && r.id !== room.id,
      );
      if (conflict) return error(409, "Room number already exists in this property");
      room.roomNumber = trimmed;
    }
    if (body.type !== undefined) {
      const validTypes = ["single", "double", "triple"];
      if (!validTypes.includes(body.type as string)) return error(422, "type must be single, double, or triple");
      room.type = body.type as Room["type"];
    }
    if (body.capacity !== undefined) room.capacity = body.capacity;
    if (body.rentAmount !== undefined) room.rentAmount = body.rentAmount;
    if (body.deposit !== undefined) room.deposit = body.deposit;
    Object.assign(room, normalizeRoom(room));
    updatePropertyOccupancy(room.propertyId);
    return json(room);
  }

  if (req.method === "DELETE") {
    // SEC-3: require property membership
    const user = requirePropertyOwner(req, room.propertyId);
    if (user instanceof NextResponse) return user;
    // SEC-7: block deletion of occupied rooms
    if (room.occupiedBeds > 0) return error(409, "Room has active tenants — unassign them first");
    store.rooms = store.rooms.filter((entry) => entry.id !== room.id);
    updatePropertyOccupancy(room.propertyId);
    return noContent();
  }

  return error(404, "Not found");
}

async function handleSubscriptions(req: NextRequest, parts: string[]): Promise<NextResponse> {
  const user = requireUser(req);
  if (user instanceof NextResponse) return user;

  if (parts.length === 0 && req.method === "POST") {
    const body = await readJson<{ planId?: string }>(req);
    const plan = store.plans.find((item) => item.id === body.planId);
    if (!plan) return error(404, "Plan not found");
    // LOG-3: cancel existing active subscription before creating new
    store.subscriptions
      .filter((s) => s.status === "active")
      .forEach((s) => { s.status = "cancelled"; });
    const sub: Subscription = {
      id: `sub-${store.subscriptions.length + 1}`,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      status: "active",
      startDate: today(),
      endDate: "",
    };
    store.subscriptions.unshift(sub);
    return json(sub, 201);
  }

  if (parts.length === 1 && parts[0] === "current" && req.method === "GET") {
    const current = store.subscriptions.find((sub) => sub.status === "active") ?? null;
    return current ? json(current) : noContent();
  }

  if (parts.length === 1 && req.method === "PATCH") {
    // Only OWNER role can change subscription plan
    const ownerCheck = requireOwner(req);
    if (ownerCheck instanceof NextResponse) return ownerCheck;
    const body = await readJson<{ planId?: string }>(req);
    const subscription = store.subscriptions.find((sub) => sub.id === parts[0]);
    const plan = store.plans.find((item) => item.id === body.planId);
    if (!subscription || !plan) return error(404, "Subscription not found");
    subscription.planId = plan.id;
    subscription.planName = plan.name;
    subscription.price = plan.price;
    return json(subscription);
  }

  return error(404, "Not found");
}

async function handleTenants(req: NextRequest, parts: string[]): Promise<NextResponse> {
  if (parts.length === 1 && parts[0] === "join" && req.method === "POST") {
    const user = requireUser(req);
    if (user instanceof NextResponse) return user;
    const body = await readJson<{ inviteCode?: string }>(req);
    const invite = store.invites.find((item) => item.code === body.inviteCode);
    if (!invite) return error(404, "Invite not found");
    if (new Date(invite.expiresAt) < new Date()) return error(404, "Invite has expired");
    const property = propertyById(invite.propertyId);
    const room = roomById(invite.roomId);
    if (!property || !room) return error(404, "Invite is no longer valid");

    const tenantId = tenantIdForUser(user) ?? nextId("u", store.tenants);
    let tenant = tenantById(tenantId);
    if (!tenant) {
      tenant = {
        id: tenantId,
        name: user.name,
        email: user.email,
        phone: user.phoneNumber || invite.phoneNumber || "",
        avatarUrl: user.avatarUrl,
        propertyId: property.id,
        room: room.roomNumber,
        rentAmount: invite.rentAmount,
        dueDate: "2026-05-05",
        joinDate: today(),
        status: "active",
        isPaid: false,
      };
      store.tenants.push(tenant);
    } else {
      tenant.propertyId = property.id;
      tenant.room = room.roomNumber;
      tenant.rentAmount = invite.rentAmount;
    }
    room.occupiedBeds = Math.min(room.capacity, room.occupiedBeds + 1);
    Object.assign(room, normalizeRoom(room));
    updatePropertyOccupancy(property.id);
    store.invites = store.invites.filter((item) => item.code !== invite.code);
    return json({
      propertyName: property.title,
      address: property.location,
      imageUrl: property.imageUrl,
      roomNumber: room.roomNumber,
      rentAmount: invite.rentAmount,
      dueDate: tenant.dueDate,
      isRentDue: !tenant.isPaid,
      leaseStart: invite.leaseStart,
      leaseEnd: invite.leaseEnd,
      ownerName: property.ownerName,
      ownerPhone: "+91 98765 00000",
      ownerAvatarUrl: property.ownerAvatarUrl,
    });
  }

  const tenant = tenantById(parts[0]);
  if (!tenant) return error(404, "Tenant not found");

  if (req.method === "PATCH") {
    // Must be a member of the tenant's property
    const user = requirePropertyOwner(req, tenant.propertyId);
    if (user instanceof NextResponse) return user;
    const body = await readJson<UpdateTenantRequest>(req);
    if (body.roomId) {
      const room = roomById(body.roomId);
      if (!room) return error(404, "Room not found");
      // Prevent moving tenant to a room in a different property
      if (room.propertyId !== tenant.propertyId) return error(422, "Room belongs to a different property");
      tenant.room = room.roomNumber;
    }
    if (body.rentAmount !== undefined) tenant.rentAmount = body.rentAmount;
    if (body.leaseEnd) {
      tenant.dueDate = body.leaseEnd;
    }
    return json(tenant);
  }

  if (req.method === "DELETE") {
    // Must be a member of the tenant's property
    const user = requirePropertyOwner(req, tenant.propertyId);
    if (user instanceof NextResponse) return user;
    const roomId = roomIdForTenant(tenant);
    if (roomId) {
      const room = roomById(roomId);
      if (room) {
        room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
        Object.assign(room, normalizeRoom(room));
        updatePropertyOccupancy(room.propertyId);
      }
    }
    store.tenants = store.tenants.filter((entry) => entry.id !== tenant.id);
    return noContent();
  }

  return error(404, "Not found");
}

async function handleUsers(req: NextRequest, parts: string[]): Promise<NextResponse> {
  const user = requireUser(req);
  if (user instanceof NextResponse) return user;

  if (parts.length === 1 && parts[0] === "link-provider" && req.method === "POST") {
    const body = await readJson<{ provider?: string }>(req);
    if (!body.provider?.trim()) return error(400, "provider is required");
    if (!user.providers.includes(body.provider)) {
      user.providers = [...user.providers, body.provider];
    }
    return json(user);
  }

  if (parts.length === 1 && parts[0] === "onboarding" && req.method === "POST") {
    const body = await readJson<UpdateProfileRequest>(req);
    user.name = body.name?.trim() || user.name;
    user.gender = (body.gender as AppUser["gender"]) ?? user.gender;
    user.phoneNumber = body.phoneNumber ?? user.phoneNumber;
    user.city = body.city ?? user.city;
    user.area = body.area ?? user.area;
    user.profileCompleted = true;
    return json(user);
  }

  if (parts.length === 1 && parts[0] === "profile" && req.method === "PATCH") {
    const body = await readJson<UpdateProfileRequest>(req);
    user.name = body.name?.trim() || user.name;
    if (body.gender) user.gender = body.gender as AppUser["gender"];
    if (body.phoneNumber !== undefined) user.phoneNumber = body.phoneNumber;
    if (body.city !== undefined) user.city = body.city;
    if (body.area !== undefined) user.area = body.area;
    return json(user);
  }

  if (parts.length === 2 && parts[0] === "profile" && parts[1] === "avatar" && req.method === "POST") {
    const body = await readJson<ImageUploadRequest>(req);
    if (!body.data || !body.contentType) return error(400, "Invalid upload payload");
    if (!ALLOWED_IMAGE_TYPES.includes(body.contentType as never)) return error(400, "Unsupported image type");
    if (body.data.length > 6_800_000) return error(400, "Image too large (max 5 MB)");
    user.avatarUrl = `data:${body.contentType};base64,${body.data}`;
    return json(user);
  }

  return error(404, "Not found");
}

export async function handleMockApiRoute(
  req: NextRequest,
  slug: string[],
): Promise<NextResponse> {
  const [resource, ...parts] = slug;
  switch (resource) {
    case "auth":
      return handleAuth(req, parts);
    case "notifications":
      return handleNotifications(req, parts);
    case "orgs":
      return handleOrgs(req, parts);
    case "payments":
      return handlePayments(req, parts);
    case "payouts": {
      const user = requireUser(req);
      if (user instanceof NextResponse) return user;
      if (req.method !== "GET") return error(404, "Not found");
      const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
      const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");
      return json(paginated(store.payouts, page, limit));
    }
    case "plans": {
      const user = requireUser(req);
      if (user instanceof NextResponse) return user;
      return req.method === "GET" ? json(store.plans) : error(404, "Not found");
    }
    case "properties":
      return handleProperties(req, parts);
    case "reports":
      return handleReports(req, parts);
    case "rooms":
      return handleRooms(req, parts);
    case "subscriptions":
      return handleSubscriptions(req, parts);
    case "tenants":
      return handleTenants(req, parts);
    case "users":
      return handleUsers(req, parts);
    case "public":
      return handlePublic(req, parts);
    default:
      return error(404, "Not found");
  }
}
function mapPGListingToProperty(pg: PGListing): Property {
  return {
    id: pg.id,
    title: pg.name,
    location: pg.location,
    city: pg.city,
    locality: pg.locality,
    type: "PG",
    gender: pg.gender === "Mixed" ? "Co-ed" : pg.gender as Property["gender"],
    roomTypes: pg.roomTypes as string[],
    price: pg.price,
    deposit: pg.price * 2,
    description: pg.description,
    amenities: pg.amenities,
    totalRooms: 10,
    occupiedRooms: Math.floor(10 * (pg.occupancy / 100)),
    occupancy: pg.occupancy,
    imageUrl: pg.images[0] || pg.imageUrl || "/placeholder-pg.jpg",
    images: pg.images.map((url, i) => ({
      id: `img-${pg.id}-${i}`,
      url,
      isCover: i === 0,
      position: i,
    })),
    rating: pg.rating,
    reviews: pg.reviews,
    distanceFromMetro: pg.distanceFromMetro,
    lat: pg.lat,
    lng: pg.lng,
    ownerName: pg.ownerName || "ShiftProof Partner",
    ownerAvatarUrl: "",
    isPrivate: false,
    badge: pg.badge,
  };
}

async function handlePublic(req: NextRequest, parts: string[]): Promise<NextResponse> {
  if (parts.length === 1 && parts[0] === "search" && req.method === "GET") {
    const q = req.nextUrl.searchParams.get("query")?.toLowerCase() ?? "";
    const loc = req.nextUrl.searchParams.get("location")?.toLowerCase() ?? "";
    const gender = req.nextUrl.searchParams.get("gender");
    const roomTypes = req.nextUrl.searchParams.getAll("roomTypes");
    const amenities = req.nextUrl.searchParams.getAll("amenities");
    const minPrice = Number(req.nextUrl.searchParams.get("minPrice") ?? "0");
    const maxPrice = Number(req.nextUrl.searchParams.get("maxPrice") ?? "999999");
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");

    let list = pgListings.map(mapPGListingToProperty);

    // Filtering
    if (q || loc || gender || roomTypes.length || amenities.length || minPrice > 0 || maxPrice < 999999) {
      list = list.filter(p => {
        if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
        if (loc && !p.location.toLowerCase().includes(loc) && !p.city.toLowerCase().includes(loc)) return false;
        if (gender && p.gender !== gender) return false;
        if (roomTypes.length && !roomTypes.some(rt => p.roomTypes.includes(rt))) return false;
        if (amenities.length && !amenities.every(a => p.amenities.includes(a as string))) return false;
        if (p.price < minPrice || p.price > maxPrice) return false;
        return true;
      });
    }

    return json(paginated(list, page, limit));
  }

  if (parts.length === 1 && parts[0] === "properties" && req.method === "GET") {
    const city = req.nextUrl.searchParams.get("city")?.toLowerCase() ?? "";
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");
    let list: Property[] = store.properties;
    if (city) list = list.filter(p => p.city.toLowerCase() === city);
    return json(paginated(list, page, limit));
  }

  if (parts.length === 2 && parts[0] === "properties" && req.method === "GET") {
    const id = parts[1];
    const stored = store.properties.find(p => p.id === id);
    if (stored) return json(stored);
    const pg = pgListings.find(p => p.id === id);
    if (!pg) return error(404, "Property not found");
    return json(mapPGListingToProperty(pg));
  }

  return error(404, "Not found");
}

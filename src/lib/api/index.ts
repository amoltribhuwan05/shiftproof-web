import { apiFetch, apiFetchBlob } from "./client";
import type {
  AppUser, OnboardingRequest, OnboardingCompleteResponse, UpdateProfileRequest, ImageUploadRequest,
  CurrentStay, RoleContext,
  AuthLinkingStartRequest, AuthLinkingStartResponse,
  AuthLinkingCompleteRequest, AuthLinkingCompleteResponse,
  AuthSessionEvaluateRequest, AuthSessionEvaluateResponse,
  BankAccount, NotificationPreferences, ChangePasswordRequest,
  Property, CreatePropertyRequest, PropertyImage, PropertyMember, PropertyAccessSettings,
  Room, CreateRoomRequest, UpdateRoomRequest,
  Tenant, InviteTenantRequest, TenantInviteResponse, UpdateTenantRequest,
  Payment, PaymentSummary, PaymentCheckout, CreatePaymentRequest, PayPaymentRequest,
  Payout,
  Notification,
  Plan, Subscription,
  Organization, OrgMember, OrgProperty, AddOrgMemberRequest, BulkAssignOrgMemberPropertiesRequest,
  PropertyReport, RevenueChartResponse,
  MaintenanceRequest, CreateMaintenanceRequest, UpdateMaintenanceRequest,
  Paginated,
} from "./types";

function qs(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────

  auth: {
    registerDeviceToken: (token: string) =>
      apiFetch<Record<string, string>>("/api/v1/auth/device-token", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),

    me: () =>
      apiFetch<AppUser>("/api/v1/auth/me"),

    // Backend returns 200 + JSON null (not 204) when no active lease.
    // apiFetch handles both: res.json() on a null body resolves to null correctly.
    currentStay: () =>
      apiFetch<CurrentStay | null>("/api/v1/auth/me/current-stay"),

    contexts: () =>
      apiFetch<RoleContext[]>("/api/v1/auth/me/contexts"),

    setPreferredContext: (propertyId: string) =>
      apiFetch<void>("/api/v1/auth/me/contexts/preferred", {
        method: "PATCH",
        body: JSON.stringify({ propertyId }),
      }),

    evaluateSession: (idToken: string) =>
      apiFetch<AuthSessionEvaluateResponse>("/api/v1/auth/session/evaluate", {
        method: "POST",
        body: JSON.stringify({ idToken } satisfies AuthSessionEvaluateRequest),
      }),

    linkingStart: (targetProvider: string) =>
      apiFetch<AuthLinkingStartResponse>("/api/v1/auth/linking/start", {
        method: "POST",
        body: JSON.stringify({ targetProvider } satisfies AuthLinkingStartRequest),
      }),

    linkingComplete: (idToken: string) =>
      apiFetch<AuthLinkingCompleteResponse>("/api/v1/auth/linking/complete", {
        method: "POST",
        body: JSON.stringify({ idToken } satisfies AuthLinkingCompleteRequest),
      }),

    completeOnboarding: (body: OnboardingRequest) =>
      apiFetch<OnboardingCompleteResponse>("/api/v1/auth/onboarding/complete", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    logout: () =>
      apiFetch<void>("/api/v1/auth/logout", { method: "POST" }),

    onboard: (body: OnboardingRequest) =>
      apiFetch<AppUser>("/api/v1/users/onboarding", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    updateProfile: (body: UpdateProfileRequest) =>
      apiFetch<AppUser>("/api/v1/users/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),

    uploadAvatar: (body: ImageUploadRequest) =>
      apiFetch<AppUser>("/api/v1/users/profile/avatar", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    linkProvider: (provider: string) =>
      apiFetch<AppUser>("/api/v1/users/link-provider", {
        method: "POST",
        body: JSON.stringify({ provider }),
      }),

    changePassword: (newPassword: string) =>
      apiFetch<Record<string, string>>("/api/v1/users/password", {
        method: "POST",
        body: JSON.stringify({ newPassword } satisfies ChangePasswordRequest),
      }),

    getBankAccount: () =>
      apiFetch<BankAccount | null>("/api/v1/users/bank-account"),

    saveBankAccount: (body: BankAccount) =>
      apiFetch<BankAccount>("/api/v1/users/bank-account", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    getNotifPrefs: () =>
      apiFetch<NotificationPreferences>("/api/v1/users/notification-preferences"),

    updateNotifPrefs: (body: NotificationPreferences) =>
      apiFetch<NotificationPreferences>("/api/v1/users/notification-preferences", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },

  // ── Properties ──────────────────────────────────────────────────────────────

  properties: {
    list: (page = 1, limit = 20) =>
      apiFetch<Paginated<Property>>(`/api/v1/properties${qs({ page, limit })}`),

    create: (body: CreatePropertyRequest) =>
      apiFetch<Property>("/api/v1/properties", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    get: (id: string) =>
      apiFetch<Property>(`/api/v1/properties/${id}`),

    update: (id: string, body: CreatePropertyRequest) =>
      apiFetch<Property>(`/api/v1/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),

    delete: (id: string) =>
      apiFetch<void>(`/api/v1/properties/${id}`, { method: "DELETE" }),

    uploadImage: (id: string, body: ImageUploadRequest) =>
      apiFetch<PropertyImage>(`/api/v1/properties/${id}/images`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    deleteImage: (id: string, imageId: string) =>
      apiFetch<void>(`/api/v1/properties/${id}/images/${imageId}`, {
        method: "DELETE",
      }),

    listMembers: (id: string) =>
      apiFetch<PropertyMember[]>(`/api/v1/properties/${id}/members`),

    addMember: (id: string, userId: string, role: string) =>
      apiFetch<void>(`/api/v1/properties/${id}/members`, {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      }),

    removeMember: (id: string, userId: string) =>
      apiFetch<void>(`/api/v1/properties/${id}/members/${userId}`, {
        method: "DELETE",
      }),

    getPrivacy: (id: string) =>
      apiFetch<PropertyAccessSettings>(`/api/v1/properties/${id}/privacy`),

    updatePrivacy: (id: string, isPrivate: boolean) =>
      apiFetch<PropertyAccessSettings>(`/api/v1/properties/${id}/privacy`, {
        method: "PATCH",
        body: JSON.stringify({ isPrivate }),
      }),

    setCoverImage: (id: string, imageId: string) =>
      apiFetch<PropertyImage>(`/api/v1/properties/${id}/images/${imageId}/cover`, {
        method: "PATCH",
      }),
  },

  // ── Rooms ────────────────────────────────────────────────────────────────────

  rooms: {
    list: (propertyId: string) =>
      apiFetch<Room[]>(`/api/v1/properties/${propertyId}/rooms`),

    create: (propertyId: string, body: CreateRoomRequest) =>
      apiFetch<Room>(`/api/v1/properties/${propertyId}/rooms`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    get: (id: string) =>
      apiFetch<Room>(`/api/v1/rooms/${id}`),

    update: (id: string, body: UpdateRoomRequest) =>
      apiFetch<Room>(`/api/v1/rooms/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),

    delete: (id: string) =>
      apiFetch<void>(`/api/v1/rooms/${id}`, { method: "DELETE" }),
  },

  // ── Tenants ──────────────────────────────────────────────────────────────────

  tenants: {
    list: (propertyId: string, page = 1, limit = 50) =>
      apiFetch<Paginated<Tenant>>(
        `/api/v1/properties/${propertyId}/tenants${qs({ page, limit })}`,
      ),

    invite: (propertyId: string, body: InviteTenantRequest) =>
      apiFetch<TenantInviteResponse>(
        `/api/v1/properties/${propertyId}/tenants/invite`,
        { method: "POST", body: JSON.stringify(body) },
      ),

    join: (inviteCode: string) =>
      apiFetch<CurrentStay>("/api/v1/tenants/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      }),

    update: (id: string, body: UpdateTenantRequest) =>
      apiFetch<Tenant>(`/api/v1/tenants/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),

    remove: (id: string) =>
      apiFetch<void>(`/api/v1/tenants/${id}`, { method: "DELETE" }),
  },

  // ── Payments ─────────────────────────────────────────────────────────────────

  payments: {
    list: (params?: {
      page?: number;
      limit?: number;
      propertyId?: string;
      status?: string;
      type?: string;
    }) =>
      apiFetch<Paginated<Payment>>(
        `/api/v1/payments${qs({ page: params?.page, limit: params?.limit, propertyId: params?.propertyId, status: params?.status, type: params?.type })}`,
      ),

    create: (body: CreatePaymentRequest, idempotencyKey?: string) =>
      apiFetch<Payment>("/api/v1/payments", {
        method: "POST",
        body: JSON.stringify(body),
        ...(idempotencyKey
          ? { headers: { "X-Idempotency-Key": idempotencyKey } }
          : {}),
      }),

    get: (id: string) =>
      apiFetch<Payment>(`/api/v1/payments/${id}`),

    collections: (params?: {
      page?: number;
      limit?: number;
      propertyId?: string;
      status?: string;
    }) =>
      apiFetch<Paginated<Payment>>(
        `/api/v1/payments/collections${qs({ page: params?.page, limit: params?.limit, propertyId: params?.propertyId, status: params?.status })}`,
      ),

    summary: () =>
      apiFetch<PaymentSummary>("/api/v1/payments/summary"),

    checkout: (id: string) =>
      apiFetch<PaymentCheckout>(`/api/v1/payments/${id}/checkout`, {
        method: "POST",
      }),

    pay: (id: string, body: PayPaymentRequest) =>
      apiFetch<Payment>(`/api/v1/payments/${id}/pay`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    confirm: (id: string) =>
      apiFetch<Payment>(`/api/v1/payments/${id}/confirm`, { method: "POST" }),

    receipt: (id: string) =>
      apiFetchBlob(`/api/v1/payments/${id}/receipt`),

    payouts: (page = 1, limit = 20) =>
      apiFetch<Paginated<Payout>>(`/api/v1/payouts${qs({ page, limit })}`),
  },

  // ── Notifications ────────────────────────────────────────────────────────────

  notifications: {
    list: (page = 1, limit = 20) =>
      apiFetch<Paginated<Notification>>(
        `/api/v1/notifications${qs({ page, limit })}`,
      ),

    markRead: (id: string) =>
      apiFetch<Notification>(`/api/v1/notifications/${id}/read`, {
        method: "PATCH",
      }),

    markAllRead: () =>
      apiFetch<{ updated: number }>("/api/v1/notifications/mark-all-read", {
        method: "PATCH",
      }),
  },

  // ── Plans & Subscriptions ─────────────────────────────────────────────────────

  plans: {
    list: () =>
      apiFetch<Plan[]>("/api/v1/plans"),

    currentSub: () =>
      apiFetch<Subscription | null>("/api/v1/subscriptions/current"),

    subscribe: (planId: string) =>
      apiFetch<Subscription>("/api/v1/subscriptions", {
        method: "POST",
        body: JSON.stringify({ planId }),
      }),

    updateSub: (id: string, planId: string) =>
      apiFetch<Subscription>(`/api/v1/subscriptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ planId }),
      }),
  },

  // ── Organizations ─────────────────────────────────────────────────────────────

  orgs: {
    list: () =>
      apiFetch<Organization[]>("/api/v1/orgs"),

    me: () =>
      apiFetch<Organization>("/api/v1/orgs/me"),

    get: (id: string) =>
      apiFetch<Organization>(`/api/v1/orgs/${id}`),

    create: (name: string) =>
      apiFetch<Organization>("/api/v1/orgs", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),

    update: (id: string, name: string) =>
      apiFetch<Organization>(`/api/v1/orgs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),

    uploadLogo: (id: string, body: ImageUploadRequest) =>
      apiFetch<Organization>(`/api/v1/orgs/${id}/logo`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    listMembers: (id: string) =>
      apiFetch<OrgMember[]>(`/api/v1/orgs/${id}/members`),

    addMember: (id: string, body: AddOrgMemberRequest) =>
      apiFetch<void>(`/api/v1/orgs/${id}/members`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    removeMember: (id: string, userId: string) =>
      apiFetch<void>(`/api/v1/orgs/${id}/members/${userId}`, {
        method: "DELETE",
      }),

    listProperties: (id: string) =>
      apiFetch<OrgProperty[]>(`/api/v1/orgs/${id}/properties`),

    bulkAssignMemberProperties: (id: string, userId: string, body: BulkAssignOrgMemberPropertiesRequest) =>
      apiFetch<Record<string, string>>(`/api/v1/orgs/${id}/members/${userId}/properties`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    transferOwnership: (id: string, newBillingOwnerUserId: string) =>
      apiFetch<Organization>(`/api/v1/orgs/${id}/transfer-ownership`, {
        method: "PATCH",
        body: JSON.stringify({ newBillingOwnerUserId }),
      }),
  },

  // ── Maintenance ───────────────────────────────────────────────────────────────

  maintenance: {
    list: (propertyId: string, params?: { status?: string; priority?: string; page?: number; limit?: number }) =>
      apiFetch<Paginated<MaintenanceRequest>>(
        `/api/v1/properties/${propertyId}/maintenance${qs({ ...params })}`,
      ),

    create: (propertyId: string, body: CreateMaintenanceRequest) =>
      apiFetch<MaintenanceRequest>(`/api/v1/properties/${propertyId}/maintenance`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    get: (id: string) =>
      apiFetch<MaintenanceRequest>(`/api/v1/maintenance/${id}`),

    update: (id: string, body: UpdateMaintenanceRequest) =>
      apiFetch<MaintenanceRequest>(`/api/v1/maintenance/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),

    delete: (id: string) =>
      apiFetch<void>(`/api/v1/maintenance/${id}`, { method: "DELETE" }),
  },

  // ── Public ────────────────────────────────────────────────────────────────────

  public: {
    cities: () =>
      apiFetch<string[]>("/api/v1/public/cities"),

    getProperty: (id: string) =>
      apiFetch<Property>(`/api/v1/public/properties/${id}`),

    properties: (params?: { page?: number; limit?: number; location?: string }) =>
      apiFetch<Paginated<Property>>(`/api/v1/public/properties${qs({ ...params })}`),

    search: (params?: {
      query?: string; location?: string; type?: string;
      minPrice?: number; maxPrice?: number; page?: number; limit?: number;
    }) =>
      apiFetch<Paginated<Property>>(`/api/v1/public/search${qs({ ...params })}`),
  },

  // ── Contact ───────────────────────────────────────────────────────────────────

  contact: (body: { name?: string; email: string; subject?: string; message: string }) =>
    apiFetch<Record<string, string>>("/api/v1/contact", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ── Reports ───────────────────────────────────────────────────────────────────

  reports: {
    property: (propertyId: string, month?: string) =>
      apiFetch<PropertyReport>(
        `/api/v1/reports/properties/${propertyId}${qs({ month })}`,
      ),

    revenueChart: (propertyId: string, months?: number) =>
      apiFetch<RevenueChartResponse>(
        `/api/v1/reports/properties/${propertyId}/chart${qs({ months })}`,
      ),
  },
};

// Re-export types and client for convenience
export type {
  AppUser, OnboardingRequest, OnboardingCompleteResponse, UpdateProfileRequest, ImageUploadRequest,
  CurrentStay, RoleContext,
  AuthLinkingStartRequest, AuthLinkingStartResponse,
  AuthLinkingCompleteRequest, AuthLinkingCompleteResponse,
  AuthSessionEvaluateRequest, AuthSessionEvaluateResponse,
  BankAccount, NotificationPreferences, ChangePasswordRequest, ContactRequest,
  Property, CreatePropertyRequest, PropertyImage, PropertyMember, PropertyAccessSettings,
  Room, CreateRoomRequest, UpdateRoomRequest,
  Tenant, InviteTenantRequest, TenantInviteResponse, UpdateTenantRequest,
  Payment, PaymentStatus, PaymentType, CollectionMode,
  PaymentSummary, PaymentCheckout, CreatePaymentRequest, PayPaymentRequest,
  Payout,
  Notification, NotificationType,
  Plan, Subscription,
  Organization, OrgMember, OrgProperty, AddOrgMemberRequest, BulkAssignOrgMemberPropertiesRequest,
  PropertyReport, RevenueChartPoint, RevenueChartResponse,
  MaintenanceRequest, MaintenanceStatus, MaintenancePriority,
  CreateMaintenanceRequest, UpdateMaintenanceRequest,
  Paginated, PaginationMeta, ApiErrorBody,
} from "./types";
export { ApiError } from "./client";

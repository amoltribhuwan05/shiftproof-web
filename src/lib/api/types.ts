// API-aligned TypeScript types — mirrors swagger.json model definitions exactly.
// All field names, types, and enum values match the Go backend contract.

// ── Auth / User ───────────────────────────────────────────────────────────────

export type AppUser = {
  id: string;
  authIdentifier: string; // Firebase UID
  name: string;
  email: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE" | "CO_LIVING";
  avatarUrl: string;
  city: string;
  area: string;
  profileCompleted: boolean;
  providers: string[];          // e.g. ["google", "phone"]
  roles: ("OWNER" | "TENANT")[]; // uppercase, array
  createdAt: string;            // "YYYY-MM-DD"
};

export type OnboardingRequest = {
  name: string;
  gender: string;
  phoneNumber?: string;
  city?: string;
  area?: string;
  role?: string;
};

export type UpdateProfileRequest = {
  name?: string;
  gender?: string;
  phoneNumber?: string;
  city?: string;
  area?: string;
};

export type ImageUploadRequest = {
  data: string;           // base64-encoded bytes
  contentType: "image/jpeg" | "image/png" | "image/webp";
};

export type AvatarUploadRequest = {
  data: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
};

// ── Current Stay (tenant) ─────────────────────────────────────────────────────

export type CurrentStay = {
  propertyName: string;
  address: string;
  imageUrl: string;
  roomNumber: string;
  rentAmount: number;     // rupees, integer
  dueDate: string;        // "YYYY-MM-DD"
  isRentDue: boolean;
  leaseStart: string;     // "YYYY-MM-DD"
  leaseEnd: string;       // "YYYY-MM-DD"
  ownerName: string;
  ownerPhone: string;
  ownerAvatarUrl: string;
};

// ── Properties ────────────────────────────────────────────────────────────────

export type PropertyImage = {
  id: string;
  url: string;
  isCover: boolean;
  position: number;
};

export type Property = {
  id: string;
  title: string;
  location: string;
  city: string;
  locality: string;
  type: "PG" | "Flat" | "House";
  gender: "Male" | "Female" | "Co-ed";
  roomTypes: string[];
  price: number;          // rupees, integer
  deposit: number;        // rupees, integer
  description: string;
  amenities: string[];
  totalRooms: number;
  occupiedRooms: number;
  occupancy: number;      // percentage 0-100
  imageUrl: string;       // cover image URL
  images: PropertyImage[]; // populated only on getProperty, empty on list
  rating: number;         // float
  reviews: number;        // count
  distanceFromMetro: string;
  lat: number;
  lng: number;
  ownerName: string;
  ownerAvatarUrl: string;
  isPrivate?: boolean;
  badge?: string;
};

export type CreatePropertyRequest = {
  title: string;
  location: string;
  type: "PG" | "Flat" | "House";
  price: number;
  deposit?: number;
  description?: string;
  amenities?: string[];
  totalRooms?: number;
};

export type PropertyMember = {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
};

export type PropertyAccessSettings = {
  isPrivate: boolean;
};

// ── Rooms ─────────────────────────────────────────────────────────────────────

export type Room = {
  id: string;
  propertyId: string;
  roomNumber: string;
  type: "single" | "double" | "triple";
  capacity: number;       // total beds
  occupiedBeds: number;   // derived by backend
  isAvailable: boolean;   // capacity > occupiedBeds
  rentAmount: number;     // rupees, integer
  deposit: number;        // rupees, integer
};

export type CreateRoomRequest = {
  roomNumber: string;
  type: "single" | "double" | "triple";
  capacity: number;
  rentAmount: number;
  deposit?: number;
};

export type UpdateRoomRequest = {
  roomNumber?: string;
  type?: string;
  capacity?: number;
  rentAmount?: number;
  deposit?: number;
};

// ── Tenants ───────────────────────────────────────────────────────────────────

export type Tenant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  propertyId: string;
  room: string;
  rentAmount: number;     // rupees, integer
  dueDate: string;        // "YYYY-MM-DD"
  joinDate: string;       // "YYYY-MM-DD"
  status: "active" | "pending" | "overdue";
  isPaid: boolean;
};

export type InviteTenantRequest = {
  roomId: string;
  rentAmount: number;
  leaseStart: string;     // "YYYY-MM-DD"
  leaseEnd: string;       // "YYYY-MM-DD"
  email?: string;
  phoneNumber?: string;
};

export type TenantInviteResponse = {
  inviteCode: string;
  expiresAt: string;      // ISO 8601
};

export type UpdateTenantRequest = {
  roomId?: string;
  rentAmount?: number;
  leaseEnd?: string;
};

// ── Payments ──────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "paid"
  | "pending"
  | "overdue"
  | "checkout_created"
  | "processing"
  | "failed"
  | "cancelled";

export type PaymentType = "rent" | "deposit" | "electricity" | "maintenance";
export type CollectionMode = "manual" | "online" | "autopay";

export type Payment = {
  id: string;
  title: string;
  description: string;
  amount: number;         // rupees, integer
  date: string;           // "YYYY-MM-DD"
  status: PaymentStatus;
  type: PaymentType;
  collectionMode: CollectionMode;
  propertyId: string;
  tenantName: string;
  tenantId?: string;      // stable user/tenant ID — preferred for filtering over tenantName
};

export type PaymentSummary = {
  totalCollectedThisMonth: number; // rupees, integer
  pendingAmount: number;           // rupees, integer
  overdueTenants: number;
  totalTenants: number;
};

export type PaymentCheckout = {
  paymentId: string;
  orderId: string;
  amount: number;         // rupees, integer
  amountSubunits: number; // provider currency subunits (paise)
  currency: string;
  keyId: string;          // Razorpay key_id
  provider: string;
  description: string;
  receipt: string;
  notes: Record<string, string>;
};

export type CreatePaymentRequest = {
  title: string;
  type: PaymentType;
  amount: number;
  propertyId: string;
  description?: string;
};

export type PayPaymentRequest = {
  provider: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  paymentMethod?: string;
  transactionRef?: string;
};

// ── Payouts ───────────────────────────────────────────────────────────────────

export type Payout = {
  id: string;
  amount: number;         // rupees, integer
  date: string;           // "YYYY-MM-DD"
  status: "completed" | "processing" | "failed";
  description: string;
  propertyTitle: string;
  bankLast4: string;
};

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "rentDue"
  | "message"
  | "maintenance"
  | "leaseRenewal"
  | "general";

export type Notification = {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
  timestamp: string;      // ISO 8601
  type: NotificationType;
};

// ── Plans & Subscriptions ─────────────────────────────────────────────────────

export type Plan = {
  id: string;
  name: string;
  price: number;          // rupees/month, integer
  maxProperties: number;
  maxTenants: number;
  features: string[];
  isCurrent: boolean;
  isPopular: boolean;
};

export type Subscription = {
  id: string;
  planId: string;
  planName: string;
  price: number;          // rupees, integer
  status: "active" | "cancelled" | "expired";
  startDate: string;      // "YYYY-MM-DD"
  endDate: string;        // "YYYY-MM-DD" or ""
};

// ── Organizations ─────────────────────────────────────────────────────────────

export type Organization = {
  id: string;
  name: string;
  billingOwnerId: string;
  logoUrl: string;        // "" when no logo uploaded
  createdAt: string;      // "YYYY-MM-DD"
};

export type OrgMember = {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;       // "YYYY-MM-DD"
};

export type AddOrgMemberRequest = {
  userId: string;
  role: "owner" | "admin" | "member";
};

export type OrgProperty = {
  id: string;
  title: string;
  location: string;
  type: string;
  ownerId: string;
  isPrivate: boolean;
  imageUrl: string;
  createdAt: string;
};

export type BulkAssignOrgMemberPropertiesRequest = {
  propertyIds: string[];
  role: "manager" | "viewer";
};

export type TransferOrgOwnershipRequest = {
  newBillingOwnerUserId: string;
};

// ── Reports ───────────────────────────────────────────────────────────────────

export type PropertyReport = {
  totalCollected: number; // rupees, integer
  totalPending: number;
  overdueCount: number;
  occupancyRate: number;  // 0.0–1.0
  payments: Payment[];
};

// ── Auth Session / Linking ────────────────────────────────────────────────────

export type AuthIdentity = {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  name?: string;
  picture?: string;
  providers: string[];
  signInProvider: string;
};

export type AuthSessionState = {
  user: AppUser;
  roleStatus: string;       // "pending" | "assigned"
  profileCompleted: boolean;
};

export type AuthAccountMatch = {
  userId: string;
  authIdentifier: string;
  email?: string;
  phoneNumber?: string;
  profileCompleted: boolean;
  providers: string[];
  roleStatus: string;
};

export type AuthAccountMatchSummary = {
  byUid?: AuthAccountMatch;
  byVerifiedEmail?: AuthAccountMatch;
  byPhone?: AuthAccountMatch;
  hasCollision: boolean;
  requiresLinking: boolean;
};

export type AuthSessionEvaluateRequest = {
  idToken: string;
};

export type AuthSessionEvaluateResponse = {
  decision: string;
  identity: AuthIdentity;
  sessionState?: AuthSessionState;
  existingAccount?: AuthAccountMatchSummary;
  recommendedNextStep: string;
};

export type AuthLinkingStartRequest = {
  targetProvider: string;
  providerMetadata?: Record<string, string>;
};

export type AuthLinkingStartResponse = {
  allowed: boolean;
  decision: string;
  targetProvider: string;
  currentSession?: AuthSessionState;
  existingAccount?: AuthAccountMatchSummary;
  recommendedNextStep: string;
};

export type AuthLinkingCompleteRequest = {
  idToken: string;
};

export type AuthLinkingCompleteResponse = {
  decision: string;
  identity: AuthIdentity;
  sessionState?: AuthSessionState;
  recommendedNextStep: string;
};

export type OnboardingCompleteResponse = {
  user: AppUser;
  roleStatus: string;
  profileCompleted: boolean;
};

export type RoleContext = {
  propertyId: string;
  propertyName: string;
  role: string;             // "owner" | "manager" | "viewer" | "tenant"
};

// ── Shared ────────────────────────────────────────────────────────────────────

export type PaginationMeta = {
  page: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ApiErrorBody = {
  code: number;
  error: string;
};

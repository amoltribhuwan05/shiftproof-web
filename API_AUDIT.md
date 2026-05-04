# ShiftProof Mock API Audit

**Scope:** `src/lib/mockApi.ts` vs `swagger.json`  
**Router:** `src/app/api/v1/[...slug]/route.ts` → `handleMockApiRoute()`  
**Date:** 2026-04-27  
**Total swagger endpoints:** 51 (+ 2 utility routes outside `/api/v1/`)

---

## Summary

| Category | Count |
|---|---|
| Correctly implemented | 42 |
| Implemented with issues | 9 |
| Missing from mock | 0 |

All 51 documented endpoints are routed. Issues are auth-guard gaps and isolation bugs — not missing routes.

---

## Endpoint-by-Endpoint Comparison

### Auth — `handleAuth()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `GET /api/v1/auth/me` | GET | `requireUser` | ✅ Correct | Upserts user on first sign-in |
| `GET /api/v1/auth/me/current-stay` | GET | `requireUser` | ✅ Correct | Returns 204 when no active stay |
| `POST /api/v1/auth/logout` | POST | none | ✅ Correct | Clears `sp_session` cookie |
| `POST /api/v1/auth/device-token` | POST | `requireUser` | ✅ Correct | Stores FCM token in `store.deviceTokens` |

**Swagger says:** All four require `security: [{firebase: []}]`.  
**Mock does:** `requireUser` (session cookie OR Bearer JWT) for `me`, `current-stay`, `device-token`. Logout has no guard — intentional; can't authenticate if session is already gone.

**Implementation note:** `handleAuth` does not check `req.method` for the GET routes — a `POST /api/v1/auth/me` would also be served. Minor method-matching gap; no security impact.

---

### Notifications — `handleNotifications()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `GET /api/v1/notifications` | GET | `requireUser` | ✅ Correct | Paginated; scoped to user's properties |
| `PATCH /api/v1/notifications/mark-all-read` | PATCH | `requireUser` | ⚠️ Issue | Marks ALL notifications globally — not scoped to current user |
| `PATCH /api/v1/notifications/{id}/read` | PATCH | `requireUser` | ✅ Correct | Returns updated notification; 404 on missing |

**Issue — `mark-all-read` multi-tenant isolation bug:**

```ts
// mockApi.ts:642 — iterates ALL notifications in store
for (const notification of store.notifications) {
  if (!notification.isRead) {
    notification.isRead = true;
    updated += 1;
  }
}
```

The `GET` handler already scopes notifications by `propertyId` for both owners and tenants. `mark-all-read` skips this scoping entirely — if Owner A and Owner B both have unread notifications, A marking all-read also marks B's.

**Fix:**
```ts
// Scope to the same property set the GET uses
const ownedPropertyIds = getPropertyIdsForUser(user); // same logic as GET
for (const n of store.notifications) {
  const pid = (n as Notification & { propertyId?: string }).propertyId;
  if ((!pid || ownedPropertyIds.has(pid)) && !n.isRead) {
    n.isRead = true;
    updated += 1;
  }
}
```

---

### Organizations — `handleOrgs()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `POST /api/v1/orgs` | POST | `requireOwner` | ✅ Correct | 409 on duplicate name |
| `GET /api/v1/orgs/me` | GET | `requireOwner` | ✅ Correct | 404 if user has no org |
| `POST /api/v1/orgs/{id}/logo` | POST | `requireOwner` | ✅ Correct | Billing owner only; validates type/size; stores base64 data URL (GCS not available in mock — acceptable) |
| `GET /api/v1/orgs/{id}/members` | GET | `requireUser` | ⚠️ Issue | Swagger says "caller must be a member" — any authenticated user can list any org's members |
| `POST /api/v1/orgs/{id}/members` | POST | `requireOwner` | ✅ Correct | Billing owner only; validates `role` enum (`owner` \| `member`) |
| `DELETE /api/v1/orgs/{id}/members/{userId}` | DELETE | `requireOwner` | ✅ Correct | Billing owner only; prevents self-removal of billing owner |

**Issue — `GET /orgs/{id}/members` over-permissive:**

Swagger: `"Caller must be a member"`.  
Mock uses `requireUser` — any authenticated tenant can enumerate members of any org by guessing an org ID.

**Fix:**
```ts
// After fetching org, verify caller is a member or the billing owner
const isMember = org.members.some(m => m.email.toLowerCase() === user.email.toLowerCase())
  || org.billingOwnerId === user.id;
if (!isMember) return error(403, "Forbidden");
```

---

### Payments — `handlePayments()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `GET /api/v1/payments` | GET | `requireUser` | ✅ Correct | Owner sees all; tenant sees own; propertyId/status/type filter params |
| `POST /api/v1/payments` | POST | `requireUser` | ⚠️ Issue | Should restrict to TENANT or validate property ownership for owners |
| `GET /api/v1/payments/collections` | GET | `requireUser` | ✅ Correct | Filters `type=rent`; propertyId/status params; paginated |
| `GET /api/v1/payments/summary` | GET | `requireUser` | ✅ Correct | Month-scoped totals; Set-based deduplication for `overdueTenants` |
| `GET /api/v1/payments/{id}` | GET | `requireUser` | ✅ Correct | `userCanReadPayment` ownership check for both roles |
| `POST /api/v1/payments/{id}/checkout` | POST | `requireUser` | ✅ Correct | Ownership check; transitions to `checkout_created`; returns Razorpay order mock |
| `POST /api/v1/payments/{id}/confirm` | POST | `requirePropertyOwner` | ✅ Correct | Owner + property member; creates payout record on confirm |
| `POST /api/v1/payments/{id}/pay` | POST | `requireUser` | ⚠️ Issue | No ownership check — any authenticated user who knows the payment ID can mark it paid |

**Issue — `POST /api/v1/payments` allows owners without property validation:**

Swagger: `"Usually called by tenants for rent or deposit."` Mock uses `requireUser` — both owners and tenants can POST, but there is no check that an owner creating a payment is actually a member of the `propertyId` they supply.

**Fix (option A — tenant only):**
```ts
const user = requireTenant(req);
```
**Fix (option B — allow owners with property validation):**
```ts
if (user.roles.includes("OWNER")) {
  const propGuard = requirePropertyOwner(req, body.propertyId);
  if (propGuard instanceof NextResponse) return propGuard;
}
```

**Issue — `POST /api/v1/payments/{id}/pay` no tenant-ownership check:**

```ts
// mockApi.ts:899 — no ownership verification before marking paid
if (parts.length === 2 && parts[1] === "pay" && req.method === "POST") {
  // ...
  payment.status = "paid";
}
```

**Fix:**
```ts
if (!userCanReadPayment(user, payment)) return error(403, "Forbidden");
```

---

### Payouts — inline in `handleMockApiRoute()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `GET /api/v1/payouts` | GET | `requireUser` | ⚠️ Issue | Should be `requireOwner` — bank settlements are owner-only |

Swagger description: `"Get a paginated list of bank settlements for an owner."` No `TENANT` should ever see payout records.

**Fix:**
```ts
case "payouts": {
  const user = requireOwner(req); // was requireUser
  ...
}
```

---

### Plans — inline in `handleMockApiRoute()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `GET /api/v1/plans` | GET | `requireUser` | ✅ Correct | Returns all plan records from store |

---

### Properties — `handleProperties()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `GET /api/v1/properties` | GET | **none** | ❌ Security gap | No auth guard — publicly accessible |
| `POST /api/v1/properties` | POST | `requireOwner` | ✅ Correct | Validates title/location/type/price; seeds `propertyMembers` |
| `GET /api/v1/properties/{id}` | GET | **none** | ❌ Security gap | No auth guard after 404 check |
| `PUT /api/v1/properties/{id}` | PUT | `requirePropertyOwner` | ✅ Correct | Full field replace; enum + range validation |
| `DELETE /api/v1/properties/{id}` | DELETE | `requirePropertyOwner` | ✅ Correct | Cascades rooms, tenants, notifications |
| `POST /api/v1/properties/{id}/images` | POST | `requirePropertyOwner` | ✅ Correct | Validates type/size; first image becomes cover |
| `DELETE /api/v1/properties/{id}/images/{imageId}` | DELETE | `requirePropertyOwner` | ✅ Correct | Promotes next image to cover |
| `GET /api/v1/properties/{id}/members` | GET | **none** | ⚠️ Minor | No auth check on the members GET |
| `POST /api/v1/properties/{id}/members` | POST | `requirePropertyOwner` | ✅ Correct | |
| `DELETE /api/v1/properties/{id}/members/{userId}` | DELETE | `requirePropertyOwner` | ✅ Correct | |
| `GET /api/v1/properties/{id}/rooms` | GET | **none** | ⚠️ Minor | No auth check on rooms list |
| `POST /api/v1/properties/{id}/rooms` | POST | `requirePropertyOwner` | ✅ Correct | Validates type enum; 409 on duplicate `roomNumber` |
| `GET /api/v1/properties/{id}/tenants` | GET | `requirePropertyOwner` | ✅ Correct | |
| `POST /api/v1/properties/{id}/tenants/invite` | POST | `requirePropertyOwner` | ✅ Correct | Generates 8-char invite code; 7-day TTL |

**Issue — `GET /api/v1/properties` and `GET /api/v1/properties/{id}` have no auth guard:**

```ts
// mockApi.ts:942 — GET /properties list
if (parts.length === 0 && req.method === "GET") {
  // No requireUser call — returns full property list to anyone
  return json(paginated(store.properties, page, limit));
}

// mockApi.ts:995 — GET /properties/{id}
if (parts.length === 1 && req.method === "GET") {
  return json(property); // also no auth
}
```

Swagger marks both with `security: [{firebase: []}]`. An unauthenticated HTTP request gets owner names, addresses, prices, and room counts for all properties.

**Fix:**
```ts
// At the top of handleProperties, before any GET
if (req.method === "GET") {
  const authCheck = requireUser(req);
  if (authCheck instanceof NextResponse) return authCheck;
}
```

---

### Reports — `handleReports()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `GET /api/v1/reports/properties/{propertyId}` | GET | `requirePropertyOwner` | ✅ Correct | Validates `YYYY-MM` format; returns collected/pending/overdue/occupancyRate |

---

### Rooms — `handleRooms()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `GET /api/v1/rooms/{id}` | GET | `requireUser` | ✅ Correct | |
| `PATCH /api/v1/rooms/{id}` | PATCH | `requirePropertyOwner` | ✅ Correct | Duplicate `roomNumber` check; normalizes `occupiedBeds` |
| `DELETE /api/v1/rooms/{id}` | DELETE | `requirePropertyOwner` | ✅ Correct | Blocks deletion of occupied rooms (409) |

---

### Subscriptions — `handleSubscriptions()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `POST /api/v1/subscriptions` | POST | `requireUser` | ⚠️ Issue | Should be `requireOwner` — tenants can subscribe/cancel owner plans |
| `GET /api/v1/subscriptions/current` | GET | `requireUser` | ✅ Correct | Returns 204 if no active subscription |
| `PATCH /api/v1/subscriptions/{id}` | PATCH | `requireOwner` (inside handler) | ✅ Correct | Upgrades/downgrades plan |

**Issue — `POST /api/v1/subscriptions` wrong guard:**

Swagger: `"Create or replace the owner's active subscription."` Mock uses `requireUser` — a tenant who knows the API can cancel the owner's subscription and subscribe to a new plan.

**Fix:**
```ts
async function handleSubscriptions(...) {
  const user = requireOwner(req); // was requireUser
  ...
}
```

---

### Tenants — `handleTenants()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `POST /api/v1/tenants/join` | POST | `requireUser` | ✅ Correct | Validates invite TTL; upserts tenant; increments `room.occupiedBeds`; deletes invite |
| `PATCH /api/v1/tenants/{id}` | PATCH | `requirePropertyOwner` | ✅ Correct | Blocks cross-property room moves |
| `DELETE /api/v1/tenants/{id}` | DELETE | `requirePropertyOwner` | ✅ Correct | Decrements `room.occupiedBeds`; updates property occupancy |

---

### Users — `handleUsers()`

| Swagger | Method | Guard | Status | Notes |
|---|---|---|---|---|
| `POST /api/v1/users/link-provider` | POST | `requireUser` | ✅ Correct | Idempotent provider append |
| `POST /api/v1/users/onboarding` | POST | `requireUser` | ✅ Correct | Sets `profileCompleted = true` |
| `PATCH /api/v1/users/profile` | PATCH | `requireUser` | ✅ Correct | Partial update |
| `POST /api/v1/users/profile/avatar` | POST | `requireUser` | ✅ Correct | Validates type/size; stores base64 data URL |

---

### Utility Routes (outside `/api/v1/`)

| Swagger | File | Status | Notes |
|---|---|---|---|
| `GET /health` | `src/app/health/route.ts` | ✅ Correct | No auth required; returns `{status: "ok"}` |
| `POST /webhooks/razorpay` | `src/app/webhooks/route.ts` | ✅ Correct | No auth (Razorpay signs via HMAC header); returns acknowledgment |

---

## Missing Endpoints

**None.** Every path in `swagger.json` is handled in `handleMockApiRoute`.

---

## RBAC — How It Works

### Global role model (API layer)

The API enforces a two-value role stored in `AppUser.roles[]`: `"OWNER"` and `"TENANT"`.

| Guard function | Checks | Used on |
|---|---|---|
| `requireUser` | Any valid session cookie or Bearer JWT | Read-mostly endpoints |
| `requireOwner` | `user.roles.includes("OWNER")` | Owner-scoped mutations |
| `requirePropertyOwner` | OWNER role **+** `propertyMembers[propertyId]` contains user with role `"owner"` or `"manager"` | Property-specific mutations |
| `requireTenant` | `user.roles.includes("TENANT")` | Defined but barely used in practice |

### `requirePropertyOwner` — the key guard

```ts
// mockApi.ts:534
function requirePropertyOwner(req: NextRequest, propertyId: string): AppUser | NextResponse {
  const user = requireOwner(req);
  if (user instanceof NextResponse) return user;
  const members = store.propertyMembers[propertyId] ?? [];
  const isMember = members.some(
    (m) => m.userId === user.id && ["owner", "manager"].includes(m.role)
  );
  if (!isMember) return error(403, "You do not have access to this property");
  return user;
}
```

This is the only guard that enforces **which** properties an owner can access. It is correctly applied to all mutating endpoints on properties, rooms, tenants, invites, images, and reports.

**Gap:** Only `"owner"` and `"manager"` roles pass this check. An `"accountant"` or `"caretaker"` who is a property member cannot call any mutating API endpoint — even though `orgTypes.ts` defines `ROLE_PERMISSIONS.accountant.viewPayments = true`. This means the fine-grained role matrix is **never enforced at the API level**.

### Fine-grained org roles — UI-only, NOT enforced in API

`src/lib/orgTypes.ts` defines 5 org roles and 6 permission flags:

| Role | viewPayments | editProperties | manageTenants | viewReports | manageMembers | billingAccess |
|---|---|---|---|---|---|---|
| `owner` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `manager` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `accountant` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `caretaker` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

These are **only used in `OwnerDashboardClient.tsx`** to show/hide sidebar sections. The mock API ignores them — any OWNER who is in `propertyMembers` with role `"owner"` or `"manager"` passes every guard, regardless of their org-level role. When the real backend ships, this matrix needs to be enforced server-side.

### Auth token sources

`requestUser()` accepts two sources in priority order:

1. **Session cookie** (`sp_session`) — set by `POST /api/auth/session` after the client POSTs a Firebase ID token; contains `{id, email, name, role}` as a signed JSON string  
2. **Firebase Bearer token** — JWT decoded in `decodeBearerToken()` by parsing the base64 payload; extracts `{uid, email, name, picture}`

**No JWT signature verification is performed in the mock** — it uses `JSON.parse(base64url)` without checking the HMAC. This is intentional for a dev mock; the real backend (Go) verifies the Firebase RS256 signature via the Firebase Admin SDK. Do not ship the mock's `decodeBearerToken` to production.

---

## Known Implementation Deviations from Swagger

These are intentional mock simplifications, not bugs:

| Endpoint | Swagger says | Mock does | Why |
|---|---|---|---|
| `POST /orgs/{id}/logo` | Uploads to GCS | Stores base64 data URL inline | GCS not available in dev |
| `POST /properties/{id}/images` | Uploads to GCS | Stores base64 data URL inline | Same |
| `POST /users/profile/avatar` | Uploads to GCS | Stores base64 data URL inline | Same |
| `POST /payments/{id}/pay` | Verifies Razorpay HMAC signature | Trusts `provider` field; marks paid immediately | No Razorpay secret in dev |
| `POST /webhooks/razorpay` | Verifies `X-Razorpay-Signature` | Returns 200 acknowledgment without verifying | Same |
| `DELETE /properties/{id}` | Soft delete | Hard delete from in-memory store | No persistence; reset on server restart |
| `DELETE /tenants/{id}` | Soft delete (deactivate stay) | Hard delete from in-memory store | Same |
| Pagination `meta` | `{page, total, totalPages, limit}` | `{page, total, totalPages}` (no `limit`) | Minor shape deviation |

---

## Priority Fix List

### High — security / data integrity

| # | Fix | File | Line |
|---|---|---|---|
| 1 | Add `requireUser` guard to `GET /properties` and `GET /properties/{id}` | `src/lib/mockApi.ts` | 942, 995 |
| 2 | Change `POST /subscriptions` from `requireUser` → `requireOwner` | `src/lib/mockApi.ts` | 1251 |
| 3 | Change `GET /payouts` from `requireUser` → `requireOwner` | `src/lib/mockApi.ts` | 1455 |
| 4 | Add `userCanReadPayment` ownership check to `POST /payments/{id}/pay` | `src/lib/mockApi.ts` | 899 |

### Medium — isolation / correctness

| # | Fix | File | Line |
|---|---|---|---|
| 5 | Scope `PATCH /notifications/mark-all-read` to current user's properties | `src/lib/mockApi.ts` | 642 |
| 6 | Add org-membership check to `GET /orgs/{id}/members` | `src/lib/mockApi.ts` | 727 |
| 7 | Add `requireUser` to `GET /properties/{id}/members` and `GET /properties/{id}/rooms` | `src/lib/mockApi.ts` | 1067, 1099 |

### Low — role strictness

| # | Fix | Notes |
|---|---|---|
| 8 | Decide if `POST /payments` should be TENANT-only or if owners need a property ownership check | Currently any user can create a payment for any property ID |
| 9 | Enforce fine-grained org roles (`accountant`, `caretaker`) in API guards, not just the UI | Blocked until real backend ships; document the gap in RBAC matrix above |

---

## Implementation Problems Encountered During Development

| Problem | Root cause | Resolution |
|---|---|---|
| `TenantDashboardClient` 401 on load | `.env` had `NEXT_PUBLIC_API_URL=https://api.shiftproof.in`; all API calls hit the production backend which rejects demo session logins | Removed production URL from `.env`; `BASE=""` in `api/client.ts` defaults to same-origin mock |
| API calls not sending session cookie | `apiFetch` had `credentials: "omit"` | Changed to `credentials: "same-origin"` in `src/lib/api/client.ts` |
| Google profile photo not populating on first login | `photoURL` is only available client-side on `FirebaseUser`; `AppUser` in the store never received it | Added `picture` claim extraction from JWT payload in `decodeBearerToken()`; `userFromBearer` uses `existing.avatarUrl \|\| payload.picture` |
| TypeScript error: `avatarError` out of scope in `AccountSection` | `AccountSection` is a separate function — can't access `TenantDashboardClient`'s closure state | Gave `AccountSection` its own `const [avatarImgError, setAvatarImgError] = useState(false)` |
| `CURRENT_TENANT` missing `avatarUrl` field causing TypeScript error | `AccountSection` uses `typeof CURRENT_TENANT` as its tenant type; `avatarUrl` was absent | Added `avatarUrl: ""` to `CURRENT_TENANT` in `src/lib/mockData.ts` |
| Session lost on page reload even when Firebase token was still valid | `AuthContext` called `refresh()` but never re-POSTed to `/api/auth/session` on Firebase token restore | Added session renewal inside `onAuthStateChanged` callback; silently redirects from `/login` to dashboard when Firebase has a valid session |
| COOP advisory in browser console on Google sign-in | Firebase's `popup.ts` polls `window.closed`; Chrome logs advisory with `Cross-Origin-Opener-Policy` | `COOP: same-origin-allow-popups` is already correct; warning is cosmetic, sign-in works |
| Idempotency key store uses `Map` which is lost on server restart | In-memory `Map` is not serializable to `globalThis` across hot-reload cycles | Acceptable for mock; real backend uses Redis/DB for idempotency keys |

---

*Generated from cross-referencing `swagger.json` (51 paths, 3 651 lines) with `src/lib/mockApi.ts` (1 482 lines)*

# ShiftProof Web — Agent Guide

> Coding-agent instructions for the ShiftProof marketing & listing site.
> Keep this file up to date as the project evolves.

---

## Project Overview

ShiftProof is an **Android-only** PG (paying-guest) and rental property management app.
This repository is the **Next.js marketing website + Find-a-PG listing page**.

- **Live URL:** http://localhost:3000 (dev)
- **Android only** — never reference iOS, App Store, or iPhone

---

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.2 |
| UI library | React | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| Language | TypeScript | ^5 |
| Runtime | Node.js | ≥ 23 (see `.nvmrc`) |

> ⚠️ **This is NOT the Next.js you know.**
> Next.js 16 has breaking changes vs. earlier versions — APIs, conventions, and
> file structure differ from training data. Read guides in
> `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

---

## Node Version

```bash
nvm use 23          # always required — Next.js 16 needs Node ≥ 20.9
```

The project pins Node 23 in `.nvmrc`. Always prefix npm commands with the
correct Node version. The system may default to Node 18, which will break
native bindings in `@tailwindcss/oxide`.

---

## Commands

```bash
npm run dev          # start dev server (Turbopack) → http://localhost:3000
npm run build        # production build — MUST pass before committing
npm run lint         # ESLint check
```

> Always run `npm run build` after any code change to confirm no TypeScript or
> compile errors. Do not commit if the build fails.

---

## File Structure

```
src/
  app/
    layout.tsx          # Root layout — fonts + globals only (no Navbar/Footer)
    globals.css         # Tailwind v4 theme + global animations
    icon.svg            # Favicon (auto-detected by Next.js App Router)
    (marketing)/        # Route group — all public marketing pages
      layout.tsx        # Adds Navbar + Footer for marketing routes only
      page.tsx          # Landing page (assembles section components)
      find-pg/
        page.tsx        # /find-pg route + metadata
        FindPGClient.tsx # "use client" — full listing/search/filter UI
      find-pg/[id]/
        page.tsx        # /find-pg/[id] — PG detail page
        PGDetailClient.tsx # "use client" — detail view
    owner-dashboard/
      page.tsx          # /owner-dashboard route + metadata
      OwnerDashboardClient.tsx  # "use client" — full dashboard UI, no Navbar/Footer
  components/           # Landing page sections (server components unless noted)
    Navbar.tsx          # "use client" — sticky nav, mobile hamburger
    Hero.tsx
    OwnerFeatures.tsx
    TenantFeatures.tsx
    HowItWorks.tsx
    KeyFeatures.tsx
    Pricing.tsx
    Testimonials.tsx
    FAQ.tsx
    Footer.tsx
    Tilt3D.tsx          # "use client" — reusable mouse-follow 3D tilt wrapper
  lib/
    pgData.ts           # Mock PG listings data + TypeScript types
```

---

## Tailwind CSS v4 Conventions

Tailwind v4 syntax differs significantly from v3:

```css
/* globals.css — correct v4 import */
@import "tailwindcss";
@theme inline { … }   /* custom tokens */
```

- No `tailwind.config.js` — config lives in `globals.css` under `@theme`
- Use arbitrary values `[value]` for non-standard sizes
- `accent-violet-600` for range inputs
- Do **not** use v3-only utilities like `left-1/6` (not in v4 default scale)

---

## Design System

> **All accent colors come from CSS variables defined in `globals.css` — never use Tailwind violet, indigo, or purple classes.**

| Token | CSS variable | Value |
|---|---|---|
| Accent (primary) | `var(--accent-500)` | `#2D6A4F` forest green |
| Accent hover | `var(--accent-600)` | `#245A41` |
| Accent dark | `var(--accent-700)` | `#1B4432` |
| Accent tint | `var(--accent-50)` | `#E8F1EC` |
| Accent light | `var(--accent-100)` | `#D0E3D6` |
| Accent mid | `var(--accent-200)` | `#A2C7AD` |
| Background | `var(--background)` | `#F7F6F2` |
| Text primary | `var(--foreground)` | `#1A1A18` |
| Border | `var(--line)` | slate-200 equivalent |
| Brand gradient (dark) | — | `#0E2118 → #1B4432 → #0E2118` |

- Cards use `rounded-2xl`, `border border-slate-200`, `hover:shadow-lg`
- Buttons: filled = `bg-[color:var(--accent-500)] rounded-xl`, ghost = `border border-slate-200`
- **Never** use `violet-*`, `purple-*`, `indigo-*`, or `orange-500` as primary brand colors
- All pages are **fully responsive** — always test mobile (375px) → desktop (1440px+)
- The site is a **SPA** — `Navbar` is `sticky top-0`; content never needs manual `pt-[65px]`

---

## Key Architectural Decisions

1. **Route groups** — `Navbar` and `Footer` belong in `src/app/(marketing)/layout.tsx`.
   The root `layout.tsx` is fonts/globals only. The owner dashboard lives outside
   the `(marketing)` group and gets NO Navbar/Footer — it has its own sidebar.

2. **Anchor links** — all in-page anchor links use `/#section-id` (not `#section-id`)
   so they work correctly when navigating from `/find-pg` back to the landing page.

3. **`"use client"` directive** — add only when a component uses React state,
   effects, or browser APIs. Prefer server components by default.

4. **3D effects** — `Tilt3D.tsx` wraps interactive tilt. The `float-3d` CSS class
   (defined in `globals.css`) handles ambient floating animation. Use `will-change: transform`.

5. **Find PG page** — `FindPGClient.tsx` is intentionally a single large client
   component. If it grows beyond ~400 lines consider splitting into
   `components/PGCard.tsx`, `components/FilterSidebar.tsx`, etc.

6. **Mock data** — `src/lib/pgData.ts` has 12 mock listings. It exports
   `pgListings`, `allCities`, `allAmenities` and the types `PGListing`,
   `Amenity`, `Gender`, `RoomType`.

---

## Code Style

- **TypeScript strict** — no `any`, no implicit returns on non-void functions
- **No new dependencies** without discussion — the project intentionally has
  zero runtime deps beyond Next.js and React
- **Inline SVG** for icons — do not add an icon library
- **No comments** on self-evident code; only comment non-obvious logic
- **No extra abstractions** — three similar JSX blocks is fine; don't abstract
  into a helper unless it's used four or more times

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Build fails with `oxide` binding error | `rm -rf node_modules && nvm use 23 && npm install` |
| TypeScript errors in VS Code but build passes | VS Code uses system Node 18; run `nvm use 23` then "Restart TS Server" |
| `scroll-behavior: smooth` warning in dev | `data-scroll-behavior="smooth"` is set on `<html>` in `layout.tsx` — ignore |
| Pricing card overflows on mobile | Use `md:scale-105` not `scale-105` |
| `left-1/6` not working | Use `left-[16.67%]` — `1/6` is not in Tailwind v4 default scale |

---

## Current Implementation State

> Update this section after every significant change so new sessions inherit full context.

### Component line counts (approximate)

| File | Lines | Notes |
|---|---|---|
| `src/app/(marketing)/find-pg/FindPGClient.tsx` | ~845 | Main listing/search/filter page — "use client" |
| `src/app/owner-dashboard/OwnerDashboardClient.tsx` | ~3314 | Full-screen SaaS dashboard — "use client"; imports all shared data from mockData |
| `src/app/tenant-dashboard/TenantDashboardClient.tsx` | ~1082 | Tenant-facing dashboard — "use client"; all data derived from mockData |
| `src/lib/mockData.ts` | ~562 | **Single source of truth** — 25 tenants, 3 properties, 7 maintenance tickets, notices, transactions, CURRENT_TENANT, CURRENT_TENANT_ROOMMATES |
| `src/lib/orgData.ts` | ~120 | Two mock orgs (org1=Ravi Kumar/p1–p3, org2=Nova Stays/np1–np2) |
| `src/lib/users.ts` | ~101 | Auth user store; t1=Rahul Sharma matches TenantDashboard demo user |
| `src/lib/mockApi.ts` | ~900 | In-memory Swagger mock backend; powers `/api/v1/*`, `/health`, `/webhooks/razorpay` |
| `src/lib/orgTypes.ts` | — | OrgRole, OrgMember, Organization types; ROLE_PERMISSIONS; PLAN_LIMITS |
| `src/lib/pgData.ts` | 226 | 12 mock PG listings + types |
| `src/lib/bst.ts` | ~80 | Generic BST; used for price-range queries |
| `src/components/Navbar.tsx` | ~160 | Sticky nav, mobile hamburger, Dashboard link — "use client" |
| `src/app/auth/register/RegisterForm.tsx` | ~150 | Firebase email/password signup collects identity only, sends verification email, and shows pending state instead of creating an app session |
| `src/app/login/LoginForm.tsx` | ~340 | Email login blocks unverified Firebase password users, phone OTP handles collision guidance, and UI now explains progressive provider linking paths |
| `src/app/api/auth/session/route.ts` | ~130 | Session issuance rejects unverified Firebase email/password tokens before setting cookie |
| `src/app/auth/action/ActionHandler.tsx` | ~240 | Firebase email action handler for `verifyEmail` and `resetPassword`; applies action codes client-side with branded UX |
| `src/lib/users.ts` | ~120 | Mock auth user store; now supports phone-number lookup for phone-auth collision checks |
| `src/app/layout.tsx` | 26 | Root shell — fonts/globals only; NO Navbar/Footer |
| `src/app/(marketing)/layout.tsx` | 10 | Marketing shell — adds Navbar + Footer |
| `src/app/(marketing)/page.tsx` | 23 | Landing page — assembles section components |

### mockData.ts — key exports and invariants

- **25 tenants** u1–u25 across 3 properties: p1 Sunshine PG (r1–r12), p2 Green Haven (r13–r20), p3 Royal Residency (r21–r30)
- **Room r1** (101, Sunshine PG) is `"Single AC"` — Rahul Sharma's room; all other singles are `"Single"`
- **MAINTENANCE** m1–m7: m1/m6/m7 have `tenantId: "u1"` (Rahul's tickets); TenantDashboard filters by this
- **NOTICES** all have `propertyId: "p1"`; tenant dashboard shows all notices for p1
- **CURRENT_TENANT** is derived (not hardcoded) — computed from u1 + room r1 + property p1 + TENANTS_EXT["u1"]
- **CURRENT_TENANT_ROOMMATES** derived from Floor 1 rooms (102→Neha Gupta, 103→Arjun Singh)
- **TenantDashboardClient** derives PAYMENT_HISTORY by reversing TENANTS_EXT["u1"].rentHistory and mapping `"pending"→"due"`
- **TenantDashboardClient** derives MAINTENANCE_REQUESTS by filtering MAINTENANCE where `tenantId === "u1"`

### FindPGClient.tsx — key implementation details

- **Price range slider**: custom dual-handle `div` slider (not `<input type="range">`).
  Uses `window.addEventListener("mousemove"/"mouseup"/"touchmove"/"touchend")` for drag.
  Each handle only updates its own bound (true one-sided dragging).
  Constants: `PRICE_MIN = 3000`, `PRICE_MAX = 20000`, `PRICE_STEP = 500`.

- **BST price filtering**: `priceBST` built once with `useMemo([], [])` from `buildBST(pgListings, pg => pg.price)`.
  `results` useMemo starts from `priceBST.rangeQuery(priceRange[0], priceRange[1])`,
  then filters city / gender / roomTypes / amenities / search.

- **IP-based city detection**: `useEffect` on mount calls `https://ipapi.co/json/` (free, no key).
  Maps response `city` to canonical names via `CITY_ALIASES` (e.g. `"Bengaluru" → "Bangalore"`).
  Sets `city` state to detected city if it matches `allCities`; falls back to `"All"` on failure.
  Shows a spinning "Detecting your location…" violet banner until resolved.
  No geo grouping — results are always a flat list/grid for the detected (or user-selected) city.

- **View modes**: grid (default) and list. Toggle button in header.

- **Sort options**: `relevance` (by reviews), `price_asc`, `price_desc`, `rating`.

- **Save/favourite**: local `Set<string>` state — no persistence.

### Auth verification flow — key implementation details

- **Firebase email/password signup**: `RegisterForm.tsx` now collects only basic identity data, calls `sendEmailVerification()` immediately after account creation, signs the Firebase user out, and shows a "check your inbox" state instead of creating the app session.
- **Firebase email/password login**: `LoginForm.tsx` checks `user.emailVerified` after `signInWithEmailAndPassword()`. If unverified, it re-sends the verification email, signs the Firebase user out, and blocks dashboard access.
- **Server-side session gate**: `src/app/api/auth/session/route.ts` now reads `email_verified` and `firebase.sign_in_provider` from the Firebase ID token payload and rejects unverified `password` logins before setting the web session cookie.
- **Branded email action page**: `src/app/auth/action/page.tsx` + `ActionHandler.tsx` now handle Firebase `verifyEmail` and `resetPassword` links on the frontend using Firebase SDK methods instead of Firebase’s default hosted UI.
- **Phone auth guard**: phone OTP verification now performs the account-collision check after Firebase OTP confirmation but before the app session is established. Numbers already tied to email-first accounts are blocked from creating a separate phone session.
- **Linking guidance UI**: login UI now explains that sign-in methods can converge into one account later. Collision states for phone and Google push the user toward email-first recovery instead of leaving them with a generic auth failure.
- **Onboarding flow**: New phone auth users with incomplete profiles are redirected to `/auth/onboarding` to collect Name, Gender, and Role before dashboard access.

### Mock API backend — key implementation details

- **Swagger coverage**: `src/app/api/v1/[...slug]/route.ts` delegates the full documented `/api/v1/*` surface to `src/lib/mockApi.ts`
- **Storage model**: uses a singleton in-memory store on `globalThis` seeded from `mockData.ts`, `orgData.ts`, and API-aligned types; state resets on process restart
- **Default API base**: `src/lib/api/client.ts` now defaults to same-origin when `NEXT_PUBLIC_API_URL` is unset, so the app can talk to the local mock backend without a separate service on port 8080
- **Auth model**: mock API accepts either the existing signed-in session cookie or a Firebase Bearer token payload; roles are mapped into API `AppUser` records and persisted in-memory
- **Extra utility routes**: `/health` returns service health JSON and `/webhooks/razorpay` returns an acknowledgment payload for local integration flows

### lib/bst.ts — API

```ts
class BST<T>
  insert(key: number, value: T): void
  rangeQuery(lo: number, hi: number): T[]   // inclusive, O(log n + k)
  inOrder(): T[]                             // sorted ascending by key
  inOrderDesc(): T[]

function buildBST<T>(items: T[], keyFn: (item: T) => number): BST<T>
```

### Design decisions locked in

| Decision | Why |
|---|---|
| Navbar/Footer in `layout.tsx` only | SPA — never remount across routes |
| Anchor links use `/#section-id` not `#section-id` | Works when navigating from `/find-pg` |
| No `<input type="range">` for price slider | Overlapping thumbs cause z-index bugs |
| `FindPGClient` kept as one file | Intentional; split only if >400 lines of new feature |
| Zero runtime deps beyond Next.js + React | Project policy |
| Owner dashboard uses `slate-950` dark theme | Distinct from marketing site's white/violet |
| Dashboard charts are inline SVG | No chart library; stays zero-dep |
| All dashboard mock data lives in `src/lib/mockData.ts` | Single source of truth — never redefine inline |
| `CURRENT_TENANT` + `CURRENT_TENANT_ROOMMATES` derived in mockData.ts | No duplication; computed from TENANTS/PROPERTY_ROOMS/PROPERTIES |
| Room assignment dropdown excludes already-assigned tenants | Uses `assignedTenantNames` Set built from live `rooms` state + other properties' PROPERTY_ROOMS |
| Tenant reassignment requires unassign-first flow | Prevents double-booking; unassign button sets room to vacant, then Assign Tenant appears |

---

## Token Usage Tips (for agents)

- Prefer **targeted `Edit` calls** over full file rewrites — avoids loading the
  entire file into context twice
- Run `/compact` between unrelated tasks to clear conversation history
- Keep components under ~300 lines so edits stay cheap
- Use `Grep` to locate specific symbols before reading whole files
- **Always update "Current Implementation State" above** after a significant change

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

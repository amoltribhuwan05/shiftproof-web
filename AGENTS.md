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
    layout.tsx          # Root layout — Navbar + Footer live here (SPA shell)
    page.tsx            # Landing page (assembles section components)
    globals.css         # Tailwind v4 theme + global animations
    icon.svg            # Favicon (auto-detected by Next.js App Router)
    find-pg/
      page.tsx          # /find-pg route + metadata
      FindPGClient.tsx  # "use client" — full listing/search/filter UI
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

| Token | Value |
|---|---|
| Primary | `violet-600` / `violet-700` |
| Accent / CTA | `orange-500` |
| Background | `slate-50` |
| Text primary | `slate-900` |
| Border | `slate-200` |
| Brand gradient | `from-violet-900 via-violet-800 to-indigo-900` |

- Cards use `rounded-2xl`, `border border-slate-200`, `hover:shadow-lg`
- Buttons: filled = `bg-violet-600 rounded-xl`, ghost = `border border-slate-200`
- All pages are **fully responsive** — always test mobile (375px) → desktop (1440px+)
- The site is a **SPA** — `Navbar` and `Footer` are in `layout.tsx` and never re-mount

---

## Key Architectural Decisions

1. **SPA shell** — `Navbar` and `Footer` belong in `src/app/layout.tsx`, not in
   individual page files. Do not add them inside `page.tsx` files.

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
| `src/app/find-pg/FindPGClient.tsx` | ~845 | Main listing/search/filter page — "use client" |
| `src/lib/pgData.ts` | 226 | 12 mock PG listings + types |
| `src/lib/bst.ts` | ~80 | Generic BST; used for price-range queries |
| `src/components/Navbar.tsx` | ~148 | Sticky nav, mobile hamburger — "use client" |
| `src/app/layout.tsx` | 34 | SPA shell; Navbar + Footer live here |
| `src/app/page.tsx` | 23 | Landing page — assembles section components |
| `src/app/find-pg/page.tsx` | 12 | Server component wrapper for FindPGClient |

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

---

## Token Usage Tips (for agents)

- Prefer **targeted `Edit` calls** over full file rewrites — avoids loading the
  entire file into context twice
- Run `/compact` between unrelated tasks to clear conversation history
- Keep components under ~300 lines so edits stay cheap
- Use `Grep` to locate specific symbols before reading whole files
- **Always update "Current Implementation State" above** after a significant change

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  pgListings,
  allCities,
  allAmenities,
  localitiesForCity,
  type PGListing,
  type Amenity,
  type Gender,
  type RoomType,
} from "@/lib/pgData";
import { buildBST } from "@/lib/bst";
import { haversineKm, fmtDistance } from "@/lib/geo";
import {
  PRICE_MIN,
  PRICE_MAX,
  PRICE_STEP,
  CITY_ALIASES,
  AMENITY_ICONS,
} from "@/lib/constants";

// ─── types ────────────────────────────────────────────────────────────────────

type SortOption = "relevance" | "price_asc" | "price_desc" | "rating" | "nearest";
type ViewMode   = "grid" | "list";


// ─── small icons ─────────────────────────────────────────────────────────────

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className="text-slate-400 flex-shrink-0">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function StarFilled() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24"
      fill={filled ? "#ef4444" : "none"}
      stroke={filled ? "#ef4444" : "#94a3b8"}
      strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── availability ─────────────────────────────────────────────────────────────

function availTag(occ: number) {
  if (occ >= 90) return { label: "Filling Fast", cls: "text-red-500 bg-red-50"   };
  if (occ >= 70) return { label: "Limited",      cls: "text-amber-600 bg-amber-50" };
  return               { label: "Available",     cls: "text-emerald-600 bg-emerald-50" };
}

// ─── Amenity icon + label ─────────────────────────────────────────────────────

function AmenityIcon({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[44px]">
      <div className="w-6 h-6 text-slate-500">{AMENITY_ICONS[name]}</div>
      <span className="text-[9px] text-slate-500 text-center leading-tight whitespace-nowrap">{name}</span>
    </div>
  );
}

// ─── PG Card (grid) ───────────────────────────────────────────────────────────

function PGCard({ pg, saved, onSave, distanceKm }: {
  pg: PGListing; saved: boolean; onSave: () => void; distanceKm?: number;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const avail = availTag(pg.occupancy);
  const isFillingFast = pg.occupancy >= 90;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col">

      {/* ── Image carousel ─────────────────────────────────────────────────── */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden bg-slate-100">
        <img
          src={pg.images[imgIdx]}
          alt={pg.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white shadow">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
            Verified
          </span>
          {isFillingFast && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-orange-500 shadow">
              🔥 Filling Fast
            </span>
          )}
        </div>

        {/* Save / heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow hover:bg-white transition-colors"
        >
          <HeartIcon filled={saved} />
        </button>

        {/* Carousel dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {pg.images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === imgIdx ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>

        {/* Prev / next arrows — visible on hover */}
        {imgIdx > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setImgIdx(imgIdx - 1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        {imgIdx < pg.images.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setImgIdx(imgIdx + 1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-1 group-hover:text-violet-700 transition-colors flex-1">
            {pg.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <StarFilled />
            <span className="text-xs font-bold text-slate-800">{pg.rating}</span>
            <span className="text-[10px] text-slate-400">({pg.reviews})</span>
          </div>
        </div>

        {/* Location + avail status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            <PinIcon />
            <span className="text-xs text-slate-500 truncate">{pg.location}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {distanceKm !== undefined && (
              <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">
                {fmtDistance(distanceKm)}
              </span>
            )}
            {!isFillingFast && avail.label !== "Available" && (
              <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${avail.cls}`}>
                {avail.label}
              </span>
            )}
          </div>
        </div>

        {/* Filling Fast row (below location) */}
        {isFillingFast && (
          <p className="text-xs font-semibold text-orange-500 flex items-center gap-1">
            🔥 Filling Fast
          </p>
        )}

        {/* Amenity icons */}
        <div className="flex items-start gap-2 overflow-hidden">
          {pg.amenities.slice(0, 5).map((a) => (
            <AmenityIcon key={a} name={a} />
          ))}
          {pg.amenities.length > 5 && (
            <div className="flex flex-col items-center gap-1 min-w-[44px]">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-slate-400">+{pg.amenities.length - 5}</span>
              </div>
              <span className="text-[9px] text-slate-400">More</span>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 mb-0.5">Starting from</p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-lg font-extrabold text-slate-900 leading-tight">
              ₹{pg.price.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-400">/mo</span>
            </p>
            <Link href={`/find-pg/${pg.id}`} onClick={(e) => e.stopPropagation()}
              className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-700 active:scale-95 transition-all">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PG Row (list view) ───────────────────────────────────────────────────────

function PGRow({ pg, saved, onSave, distanceKm }: {
  pg: PGListing; saved: boolean; onSave: () => void; distanceKm?: number;
}) {
  const avail = availTag(pg.occupancy);
  return (
    <div className="group flex bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative w-44 sm:w-52 flex-shrink-0 bg-slate-100 overflow-hidden">
        <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold text-white shadow">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
          Verified
        </span>
        {pg.occupancy >= 90 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-orange-500 shadow">
            🔥 Filling Fast
          </span>
        )}
      </div>

      {/* Info + price */}
      <div className="flex flex-1 flex-col sm:flex-row min-w-0">
        <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-violet-700 transition-colors">{pg.name}</h3>
            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
              pg.gender === "Female" ? "bg-pink-50 text-pink-600"
              : pg.gender === "Male" ? "bg-sky-50 text-sky-600"
              : "bg-slate-100 text-slate-500"
            }`}>{pg.gender}</span>
            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${avail.cls}`}>{avail.label}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 flex-wrap">
            <PinIcon />{pg.location}
            <span className="mx-1 text-slate-300">·</span>
            <span>{pg.distanceFromMetro} from metro</span>
            {distanceKm !== undefined && (
              <>
                <span className="mx-1 text-slate-300">·</span>
                <span className="font-semibold text-violet-600">{fmtDistance(distanceKm)} from you</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
              <StarFilled />
              <span className="text-[11px] font-bold text-amber-700">{pg.rating}</span>
            </span>
            <span className="text-xs text-slate-400">({pg.reviews} reviews)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pg.roomTypes.map((rt) => (
              <span key={rt} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">{rt} Sharing</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pg.amenities.map((a) => (
              <span key={a} className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] text-violet-600">{a}</span>
            ))}
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 px-4 pb-4 sm:py-4 sm:border-l border-slate-100 sm:w-40 flex-shrink-0">
          <div className="sm:text-right">
            <p className="text-[10px] text-slate-400">Starting from</p>
            <p className="text-xl font-extrabold text-slate-900">₹{pg.price.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-400">per month</p>
          </div>
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <Link href={`/find-pg/${pg.id}`} onClick={(e) => e.stopPropagation()}
              className="flex-1 sm:flex-none rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition-colors text-center">
              View Details
            </Link>
            <button onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                saved ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-500 hover:border-violet-200 hover:text-violet-600"
              }`}>
              <HeartIcon filled={saved} />{saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Accordion Section ─────────────────────────────────────────────────

// ─── Price Range Slider ───────────────────────────────────────────────────────

function PriceRangeSlider({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"lo" | "hi" | null>(null);

  const pct = (v: number) =>
    ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const snap = (raw: number) =>
    Math.round(
      Math.max(PRICE_MIN, Math.min(PRICE_MAX, raw)) / PRICE_STEP
    ) * PRICE_STEP;

  const valueFromX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return PRICE_MIN;
    return snap(
      PRICE_MIN + ((clientX - rect.left) / rect.width) * (PRICE_MAX - PRICE_MIN)
    );
  };

  const startDrag = (thumb: "lo" | "hi") => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dragging.current = thumb;

    const move = (ev: MouseEvent | TouchEvent) => {
      const clientX = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const v = valueFromX(clientX);
      if (dragging.current === "lo")
        onChange([Math.min(v, hi - PRICE_STEP), hi]);
      else
        onChange([lo, Math.max(v, lo + PRICE_STEP)]);
    };

    const up = () => {
      dragging.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  // Click on track → move nearest handle
  const clickTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging.current) return;
    const v = valueFromX(e.clientX);
    const dLo = Math.abs(v - lo);
    const dHi = Math.abs(v - hi);
    if (dLo <= dHi) onChange([Math.min(v, hi - PRICE_STEP), hi]);
    else            onChange([lo, Math.max(v, lo + PRICE_STEP)]);
  };

  return (
    <div className="space-y-3 select-none">
      {/* Live value display */}
      <div className="flex items-baseline justify-between">
        <div className="text-center">
          <p className="text-[10px] text-slate-400">Min</p>
          <p className="text-sm font-bold text-violet-700">₹{lo.toLocaleString("en-IN")}</p>
        </div>
        <div className="h-px flex-1 mx-2 bg-slate-200" />
        <div className="text-center">
          <p className="text-[10px] text-slate-400">Max</p>
          <p className="text-sm font-bold text-violet-700">₹{hi.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onClick={clickTrack}
        className="relative h-6 flex items-center cursor-pointer mx-2"
      >
        {/* Background rail */}
        <div className="absolute inset-x-0 h-[6px] rounded-full bg-slate-100" />
        {/* Unfilled left */}
        <div
          className="absolute h-[6px] rounded-l-full bg-slate-200"
          style={{ left: 0, width: `${pct(lo)}%` }}
        />
        {/* Active fill */}
        <div
          className="absolute h-[6px] bg-violet-500"
          style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
        />
        {/* Unfilled right */}
        <div
          className="absolute h-[6px] rounded-r-full bg-slate-200"
          style={{ left: `${pct(hi)}%`, right: 0 }}
        />

        {/* Lo handle */}
        <div
          onMouseDown={startDrag("lo")}
          onTouchStart={startDrag("lo")}
          className="absolute flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full bg-white shadow-md ring-2 ring-violet-500 transition-transform duration-75 hover:scale-110 active:scale-110 active:cursor-grabbing"
          style={{ left: `${pct(lo)}%`, zIndex: lo > (PRICE_MAX + PRICE_MIN) / 2 ? 3 : 2 }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
        </div>

        {/* Hi handle */}
        <div
          onMouseDown={startDrag("hi")}
          onTouchStart={startDrag("hi")}
          className="absolute flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full bg-white shadow-md ring-2 ring-violet-500 transition-transform duration-75 hover:scale-110 active:scale-110 active:cursor-grabbing"
          style={{ left: `${pct(hi)}%`, zIndex: hi < (PRICE_MAX + PRICE_MIN) / 2 ? 3 : 2 }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
        </div>
      </div>

      {/* Rail labels */}
      <div className="flex justify-between text-[10px] text-slate-400 mx-2">
        <span>₹{PRICE_MIN.toLocaleString("en-IN")}</span>
        <span>₹{PRICE_MAX.toLocaleString("en-IN")}</span>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: "< ₹5k",  lo: PRICE_MIN, hi: 5000     },
          { label: "₹5–8k",  lo: 5000,      hi: 8000     },
          { label: "₹8–12k", lo: 8000,      hi: 12000    },
          { label: "> ₹12k", lo: 12000,     hi: PRICE_MAX },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => onChange([p.lo, p.hi])}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border transition-colors ${
              lo === p.lo && hi === p.hi
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-slate-500 border-slate-200 hover:border-violet-300 hover:text-violet-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Filter Accordion Section ─────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-700 hover:text-violet-700 transition-colors mb-0">
        {title}
        <ChevronDown className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

// ─── Locality Tab Slider ──────────────────────────────────────────────────────

function LocalitySlider({ city, locality, setLocality }: {
  city: string; locality: string; setLocality: (l: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const slide = (dir: "l" | "r") => ref.current?.scrollBy({ left: dir === "r" ? 160 : -160, behavior: "smooth" });
  const localities = localitiesForCity(city);
  return (
    <div className="flex items-center border-b border-slate-200 bg-white">
      <button onClick={() => slide("l")} className="flex-shrink-0 px-2 py-3 text-slate-400 hover:text-violet-600 border-r border-slate-100 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <div ref={ref} className="flex overflow-x-auto scrollbar-none flex-1">
        <button onClick={() => setLocality("All")}
          className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            locality === "All" ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}>
          {city === "All" ? "All Areas" : `All ${city}`}
        </button>
        {localities.map((l) => (
          <button key={l} onClick={() => setLocality(l)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              locality === l ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {l}
          </button>
        ))}
      </div>
      <button onClick={() => slide("r")} className="flex-shrink-0 px-2 py-3 text-slate-400 hover:text-violet-600 border-l border-slate-100 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function FindPGClient() {
  const [search,            setSearch]            = useState("");
  const [city,              setCity]              = useState("All");
  const [locality,          setLocality]          = useState("All");
  const [gender,            setGender]            = useState<Gender | "All">("All");
  const [roomTypes,         setRoomTypes]         = useState<RoomType[]>([]);
  const [amenities,         setAmenities]         = useState<Amenity[]>([]);
  const [priceRange,        setPriceRange]        = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [sortBy,            setSortBy]            = useState<SortOption>("relevance");
  const [viewMode,          setViewMode]          = useState<ViewMode>("grid");
  const [filterOpen,        setFilterOpen]        = useState(false);
  const [savedIds,          setSavedIds]          = useState<Set<string>>(new Set());
  const [locationDetecting, setLocationDetecting] = useState(true);
  const [userCoords,        setUserCoords]        = useState<{ lat: number; lng: number } | null>(null);
  const [outsideIndia,      setOutsideIndia]      = useState(false);

  // Auto-detect user's city + coords from IP on mount
  useEffect(() => {
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data: { city?: string; latitude?: number; longitude?: number; country?: string; region?: string }) => {
        if (cancelled) return;

        // Country check
        if (data.country && data.country !== "IN") {
          setOutsideIndia(true);
        }

        // Store user coords for distance sort
        if (data.latitude && data.longitude) {
          setUserCoords({ lat: data.latitude, lng: data.longitude });
        }

        // Resolve city — try direct match, then alias, then region fallback
        const raw = data.city ?? "";
        const canonical =
          allCities.find((c) => c.toLowerCase() === raw.toLowerCase()) ??
          allCities.find((c) => c.toLowerCase() === (CITY_ALIASES[raw] ?? "").toLowerCase());
        if (canonical) changeCity(canonical);
      })
      .catch(() => { /* keep "All" on network failure */ })
      .finally(() => { if (!cancelled) setLocationDetecting(false); });
    return () => { cancelled = true; };
  }, []);

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    setter((p) => p.includes(val) ? p.filter((x) => x !== val) : [...p, val]);

  const toggleSave = (id: string) =>
    setSavedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Changing city always resets locality selection
  const changeCity = (c: string) => { setCity(c); setLocality("All"); };

  const clearAll = () => {
    setSearch(""); setCity("All"); setLocality("All"); setGender("All");
    setRoomTypes([]); setAmenities([]); setPriceRange([PRICE_MIN, PRICE_MAX]); setSortBy("relevance");
  };

  // BST built once from static data; price range query is O(log n + k)
  const priceBST = useMemo(() => buildBST(pgListings, (pg) => pg.price), []);

  const results = useMemo(() => {
    let list = priceBST.rangeQuery(priceRange[0], priceRange[1]).filter((pg) => {
      const q = search.trim().toLowerCase();
      if (q && !pg.name.toLowerCase().includes(q) && !pg.locality.toLowerCase().includes(q) && !pg.location.toLowerCase().includes(q) && !pg.city.toLowerCase().includes(q)) return false;
      if (city !== "All" && pg.city !== city) return false;
      if (locality !== "All" && pg.locality !== locality) return false;
      if (gender !== "All" && pg.gender !== gender) return false;
      if (roomTypes.length && !roomTypes.some((rt) => pg.roomTypes.includes(rt))) return false;
      if (amenities.length && !amenities.every((a) => pg.amenities.includes(a))) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "price_asc")  return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating")     return b.rating - a.rating;
      if (sortBy === "nearest" && userCoords) {
        const distA = haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const distB = haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      }
      return b.reviews - a.reviews;
    });
  }, [search, city, locality, gender, roomTypes, amenities, priceRange, sortBy, userCoords]);


  const priceActive = priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX;
  const activeCount =
    (city !== "All" ? 1 : 0) + (locality !== "All" ? 1 : 0) + (gender !== "All" ? 1 : 0) +
    roomTypes.length + amenities.length + (priceActive ? 1 : 0);

  // ── sidebar content ──────────────────────────────────────────────────────────
  const sidebar = (
    <div className="bg-white border-r border-slate-200 h-full overflow-y-auto">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="font-bold text-slate-900 text-sm">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-violet-600 font-semibold hover:text-violet-800 transition-colors">
            Clear all
          </button>
        )}
      </div>

      <div className="px-5 divide-y divide-slate-100">
        <Section title="City">
          <div className="space-y-2.5">
            {(["All", ...allCities]).map((c) => (
              <label key={c} onClick={() => changeCity(c)} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  city === c ? "border-violet-600 bg-violet-600" : "border-slate-300 group-hover:border-violet-400"
                }`}>
                  {city === c && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                  {c === "All" ? "All Cities" : c}
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Gender">
          <div className="space-y-2.5">
            {(["All", "Male", "Female", "Mixed"] as const).map((g) => (
              <label key={g} onClick={() => setGender(g)} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  gender === g ? "border-violet-600 bg-violet-600" : "border-slate-300 group-hover:border-violet-400"
                }`}>
                  {gender === g && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                  {g === "All" ? "Any" : g + " Only"}
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Monthly Budget">
          <PriceRangeSlider value={priceRange} onChange={setPriceRange} />
        </Section>

        <Section title="Room Type">
          <div className="space-y-2.5">
            {(["Single", "Double", "Triple"] as RoomType[]).map((rt) => (
              <label key={rt} onClick={() => toggle(setRoomTypes, rt)} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  roomTypes.includes(rt) ? "border-violet-600 bg-violet-600" : "border-slate-300 group-hover:border-violet-400"
                }`}>
                  {roomTypes.includes(rt) && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3" /></svg>
                  )}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{rt} Sharing</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Amenities">
          <div className="space-y-2.5">
            {allAmenities.map((a) => (
              <label key={a} onClick={() => toggle(setAmenities, a)} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  amenities.includes(a) ? "border-violet-600 bg-violet-600" : "border-slate-300 group-hover:border-violet-400"
                }`}>
                  {amenities.includes(a) && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3" /></svg>
                  )}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{a}</span>
              </label>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 65px)" }}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 pt-5 pb-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          <span className="text-slate-700 font-medium">
            Find a PG{city !== "All" ? ` in ${city}` : ""}{locality !== "All" ? ` › ${locality}` : ""}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {locality !== "All" ? `PGs in ${locality}` : city !== "All" ? `PGs in ${city}` : "Find a PG"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{results.length} properties found</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city, locality, PG name…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Locality slider */}
        <LocalitySlider city={city} locality={locality} setLocality={setLocality} />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0 sticky top-[65px] h-[calc(100vh-65px)]">
          {sidebar}
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0 bg-slate-50 flex flex-col">

          {/* Location detection banner */}
          {locationDetecting && (
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border-b border-violet-100 text-xs text-violet-700">
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/>
              </svg>
              Detecting your location…
            </div>
          )}

          {/* Outside India notice */}
          {!locationDetecting && outsideIndia && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
              </svg>
              ShiftProof is available in India. Showing all listings.
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-white border-b border-slate-200 sticky top-[65px] z-10">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-violet-700 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filters
                {activeCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Active filter chips */}
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {activeCount > 0 && (
                  <>
                    {city !== "All" && <Chip label={city} onRemove={() => changeCity("All")} />}
                    {locality !== "All" && <Chip label={locality} onRemove={() => setLocality("All")} />}
                    {gender !== "All" && <Chip label={gender} onRemove={() => setGender("All")} />}
                    {roomTypes.map((rt) => <Chip key={rt} label={rt} onRemove={() => toggle(setRoomTypes, rt)} />)}
                    {amenities.map((a) => <Chip key={a} label={a} onRemove={() => toggle(setAmenities, a)} />)}
                    {priceActive && <Chip label={`₹${priceRange[0].toLocaleString("en-IN")} – ₹${priceRange[1].toLocaleString("en-IN")}`} onRemove={() => setPriceRange([PRICE_MIN, PRICE_MAX])} />}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer">
                <option value="relevance">Relevance</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                {userCoords && <option value="nearest">Nearest to you</option>}
              </select>

              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {(["grid", "list"] as ViewMode[]).map((m) => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${m === viewMode ? "bg-white shadow-sm text-violet-700" : "text-slate-400 hover:text-slate-600"}`}>
                    {m === "grid" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="5" width="18" height="4" rx="1" /><rect x="3" y="11" width="18" height="4" rx="1" /><rect x="3" y="17" width="18" height="4" rx="1" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile filter panel */}
          {filterOpen && (
            <div className="lg:hidden border-b border-slate-200">
              {sidebar}
            </div>
          )}

          {/* Cards */}
          <div className="flex-1 p-4 sm:p-5">
            {results.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results.map((pg) => (
                    <PGCard key={pg.id} pg={pg} saved={savedIds.has(pg.id)} onSave={() => toggleSave(pg.id)}
                      distanceKm={userCoords ? haversineKm(userCoords.lat, userCoords.lng, pg.lat, pg.lng) : undefined} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {results.map((pg) => (
                    <PGRow key={pg.id} pg={pg} saved={savedIds.has(pg.id)} onSave={() => toggleSave(pg.id)}
                      distanceKm={userCoords ? haversineKm(userCoords.lat, userCoords.lng, pg.lat, pg.lng) : undefined} />
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 mb-4">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    <line x1="11" y1="8" x2="11" y2="14" /><circle cx="11" cy="16.5" r="0.5" fill="#7c3aed" />
                  </svg>
                </div>
                <p className="font-bold text-slate-800">No PGs match your filters</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
                <button onClick={clearAll} className="mt-4 rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white hover:bg-violet-700 transition-colors">
                  Reset filters
                </button>
              </div>
            )}
            {results.length > 0 && (
              <p className="text-center text-xs text-slate-400 pt-6 pb-2">
                Showing {results.length} of {pgListings.length} properties
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-xs font-medium text-violet-700">
      {label}
      <button onClick={onRemove} className="hover:text-violet-900 ml-0.5">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

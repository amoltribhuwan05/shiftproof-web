"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, X, Heart, MapPin, ChevronDown, ChevronLeft, ChevronRight,
  LayoutGrid, List, SlidersHorizontal, ArrowRight, Home,
  CheckCircle2, Check, Loader2, Info,
} from "lucide-react";
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

function StarFilled() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
  const router = useRouter();
  const [imgIdx, setImgIdx] = useState(0);
  const avail = availTag(pg.occupancy);
  const isFillingFast = pg.occupancy >= 90;

  return (
    <div
      onClick={() => router.push(`/find-pg/${pg.id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col"
    >

      {/* ── Image carousel ─────────────────────────────────────────────────── */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden bg-[color:var(--background)]">
        <img
          src={pg.images[imgIdx]}
          alt={pg.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
            <CheckCircle2 size={9} strokeWidth={2} />
            Verified
          </span>
          {isFillingFast && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-accent-500 shadow">
              Filling Fast
            </span>
          )}
        </div>

        {/* Save / heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          aria-label={saved ? "Remove from saved" : "Save PG"}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow hover:bg-white transition-colors"
        >
          <Heart size={15} strokeWidth={1.75} fill={saved ? "#ef4444" : "none"} className={saved ? "text-red-500" : "text-slate-400"} />
        </button>

        {/* Carousel dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {pg.images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
              aria-label={`Go to photo ${i + 1}`}
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
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={12} strokeWidth={2.5} />
          </button>
        )}
        {imgIdx < pg.images.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setImgIdx(imgIdx + 1); }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[color:var(--foreground)] text-[15px] leading-snug line-clamp-1 group-hover:text-accent-600 transition-colors flex-1">
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
            <MapPin size={11} strokeWidth={1.5} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-500 truncate">{pg.location}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {distanceKm !== undefined && (
              <span className="text-[10px] font-semibold text-accent-500 bg-accent-50 rounded-full px-2 py-0.5">
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
        <div className="mt-auto pt-3 border-t border-[color:var(--background)]">
          <p className="text-[10px] text-slate-400 mb-0.5">Starting from</p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-lg font-semibold text-[color:var(--foreground)] leading-tight">
              ₹{pg.price.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-400">/mo</span>
            </p>
            <Link href={`/find-pg/${pg.id}`} onClick={(e) => e.stopPropagation()}
              className="rounded-xl bg-accent-500 px-5 py-2 text-xs font-bold text-white hover:bg-accent-600 transition-colors">
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
    <div className="group flex bg-white rounded-2xl overflow-hidden border border-[color:var(--background)] hover:border-slate-300 hover:shadow-md transition-[border-color,box-shadow] duration-200 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative w-44 sm:w-52 flex-shrink-0 bg-[color:var(--background)] overflow-hidden">
        <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-accent-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
          <CheckCircle2 size={8} strokeWidth={2} />
          Verified
        </span>
        {pg.occupancy >= 90 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-accent-500 shadow">
            Filling Fast
          </span>
        )}
      </div>

      {/* Info + price */}
      <div className="flex flex-1 flex-col sm:flex-row min-w-0">
        <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[color:var(--foreground)] text-base group-hover:text-accent-600 transition-colors">{pg.name}</h3>
            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
              pg.gender === "Female" ? "bg-pink-50 text-pink-600"
              : pg.gender === "Male" ? "bg-sky-50 text-sky-600"
              : "bg-[color:var(--background)] text-slate-500"
            }`}>{pg.gender}</span>
            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${avail.cls}`}>{avail.label}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 flex-wrap">
            <MapPin size={11} strokeWidth={1.5} className="text-slate-400 flex-shrink-0" />{pg.location}
            <span className="mx-1 text-slate-300">·</span>
            <span>{pg.distanceFromMetro} from metro</span>
            {distanceKm !== undefined && (
              <>
                <span className="mx-1 text-slate-300">·</span>
                <span className="font-semibold text-accent-500">{fmtDistance(distanceKm)} from you</span>
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
              <span key={rt} className="rounded-md border border-slate-200 bg-[color:var(--background)] px-2 py-0.5 text-xs font-medium text-slate-600">{rt} Sharing</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pg.amenities.map((a) => (
              <span key={a} className="rounded-md bg-accent-50 px-2 py-0.5 text-[11px] text-accent-500">{a}</span>
            ))}
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 px-4 pb-4 sm:py-4 sm:border-l border-[color:var(--background)] sm:w-40 flex-shrink-0">
          <div className="sm:text-right">
            <p className="text-[10px] text-slate-400">Starting from</p>
            <p className="text-xl font-semibold text-[color:var(--foreground)]">₹{pg.price.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-400">per month</p>
          </div>
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <Link href={`/find-pg/${pg.id}`} onClick={(e) => e.stopPropagation()}
              className="flex-1 sm:flex-none rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-600 transition-colors text-center">
              View Details
            </Link>
            <button onClick={(e) => { e.stopPropagation(); onSave(); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                saved ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-500 hover:border-accent-200 hover:text-accent-500"
              }`}>
              <Heart size={15} strokeWidth={1.75} fill={saved ? "#ef4444" : "none"} className={saved ? "text-red-500" : "text-slate-400"} />{saved ? "Saved" : "Save"}
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
  minBound = PRICE_MIN,
  maxBound = PRICE_MAX,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
  minBound?: number;
  maxBound?: number;
}) {
  const [lo, hi] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"lo" | "hi" | null>(null);

  const pct = (v: number) => {
    if (maxBound === minBound) return 0;
    return ((v - minBound) / (maxBound - minBound)) * 100;
  };

  const snap = (raw: number) =>
    Math.round(
      Math.max(minBound, Math.min(maxBound, raw)) / PRICE_STEP
    ) * PRICE_STEP;

  const valueFromX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return minBound;
    return snap(
      minBound + ((clientX - rect.left) / rect.width) * (maxBound - minBound)
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
          <p className="text-sm font-bold text-accent-600">₹{lo.toLocaleString("en-IN")}</p>
        </div>
        <div className="h-px flex-1 mx-2 bg-slate-200" />
        <div className="text-center">
          <p className="text-[10px] text-slate-400">Max</p>
          <p className="text-sm font-bold text-accent-600">₹{hi.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onClick={clickTrack}
        className="relative h-6 flex items-center cursor-pointer mx-2"
      >
        {/* Background rail */}
        <div className="absolute inset-x-0 h-[6px] rounded-full bg-[color:var(--background)]" />
        {/* Unfilled left */}
        <div
          className="absolute h-[6px] rounded-l-full bg-slate-200"
          style={{ left: 0, width: `${pct(lo)}%` }}
        />
        {/* Active fill */}
        <div
          className="absolute h-[6px] bg-accent-500"
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
          className="absolute flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full bg-white shadow-md ring-2 ring-accent-500 transition-transform duration-75 hover:scale-110 active:scale-110 active:cursor-grabbing"
          style={{ left: `${pct(lo)}%`, zIndex: lo > (maxBound + minBound) / 2 ? 3 : 2 }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
        </div>

        {/* Hi handle */}
        <div
          onMouseDown={startDrag("hi")}
          onTouchStart={startDrag("hi")}
          className="absolute flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full bg-white shadow-md ring-2 ring-accent-500 transition-transform duration-75 hover:scale-110 active:scale-110 active:cursor-grabbing"
          style={{ left: `${pct(hi)}%`, zIndex: hi < (maxBound + minBound) / 2 ? 3 : 2 }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
        </div>
      </div>

      {/* Rail labels */}
      <div className="flex justify-between text-[10px] text-slate-400 mx-2">
        <span>₹{minBound.toLocaleString("en-IN")}</span>
        <span>₹{maxBound.toLocaleString("en-IN")}</span>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: "< ₹5k",  lo: minBound, hi: Math.min(5000, maxBound) },
          { label: "₹5–8k",  lo: Math.max(minBound, 5000), hi: Math.min(8000, maxBound) },
          { label: "₹8–12k", lo: Math.max(minBound, 8000), hi: Math.min(12000, maxBound) },
          { label: "> ₹12k", lo: Math.max(minBound, 12000), hi: maxBound },
        ].filter(p => p.lo < p.hi).map((p) => (
          <button
            key={p.label}
            onClick={() => onChange([p.lo, p.hi])}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border transition-colors ${
              lo === p.lo && hi === p.hi
                ? "bg-accent-500 text-white border-accent-500"
                : "bg-white text-slate-500 border-slate-200 hover:border-accent-200 hover:text-accent-600"
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
    <div className="py-4 border-b border-[color:var(--background)] last:border-0">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-700 hover:text-accent-600 transition-colors mb-0">
        {title}
        <ChevronDown size={14} strokeWidth={2} className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
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
      <button onClick={() => slide("l")} aria-label="Scroll areas left" className="flex-shrink-0 px-2 py-3 text-slate-400 hover:text-accent-500 border-r border-[color:var(--background)] transition-colors">
        <ChevronLeft size={14} strokeWidth={2} />
      </button>
      <div ref={ref} className="flex overflow-x-auto scrollbar-none flex-1">
        <button onClick={() => setLocality("All")}
          className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            locality === "All" ? "border-accent-500 text-accent-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}>
          {city === "All" ? "All Areas" : `All ${city}`}
        </button>
        {localities.map((l) => (
          <button key={l} onClick={() => setLocality(l)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              locality === l ? "border-accent-500 text-accent-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}>
            <MapPin size={10} strokeWidth={1.5} className="flex-shrink-0" />
            {l}
          </button>
        ))}
      </div>
      <button onClick={() => slide("r")} aria-label="Scroll areas right" className="flex-shrink-0 px-2 py-3 text-slate-400 hover:text-accent-500 border-l border-[color:var(--background)] transition-colors">
        <ChevronRight size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const getCityBounds = (c: string): [number, number] => {
  let list = pgListings;
  if (c !== "All") list = list.filter(p => p.city === c);
  if (list.length === 0) return [PRICE_MIN, PRICE_MAX];
  const cMin = Math.min(...list.map(p => p.price));
  const cMax = Math.max(...list.map(p => p.price));
  const bMin = Math.max(PRICE_MIN, Math.floor(cMin / PRICE_STEP) * PRICE_STEP - PRICE_STEP);
  const bMax = Math.min(PRICE_MAX, Math.ceil(cMax / PRICE_STEP) * PRICE_STEP + PRICE_STEP);
  return [bMin, Math.max(bMin + PRICE_STEP, bMax)];
};

export default function FindPGClient() {
  const [search,            setSearch]            = useState("");
  const [city,              setCity]              = useState("All");
  const [locality,          setLocality]          = useState("All");
  const [gender,            setGender]            = useState<Gender | "All">("All");
  const [roomTypes,         setRoomTypes]         = useState<RoomType[]>([]);
  const [amenities,         setAmenities]         = useState<Amenity[]>([]);
  const [priceRange,        setPriceRange]        = useState<[number, number]>(() => getCityBounds("All"));
  const [sortBy,            setSortBy]            = useState<SortOption>("relevance");
  const [viewMode,          setViewMode]          = useState<ViewMode>("grid");
  const [filterOpen,        setFilterOpen]        = useState(false);
  const [savedIds,          setSavedIds]          = useState<Set<string>>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("sp_saved_pgs") : null;
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch { return new Set<string>(); }
  });
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

  // Persist saved IDs to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem("sp_saved_pgs", JSON.stringify([...savedIds])); } catch { /* quota exceeded */ }
  }, [savedIds]);

  // Changing city always resets locality selection and bounds
  const changeCity = (c: string) => { 
    setCity(c); 
    setLocality("All"); 
    setPriceRange(getCityBounds(c));
  };

  const clearAll = () => {
    setSearch(""); setCity("All"); setLocality("All"); setGender("All");
    setRoomTypes([]); setAmenities([]); setPriceRange(getCityBounds("All")); setSortBy("relevance");
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


  const cityBounds = useMemo(() => getCityBounds(city), [city]);
  const priceActive = priceRange[0] !== cityBounds[0] || priceRange[1] !== cityBounds[1];
  const activeCount =
    (city !== "All" ? 1 : 0) + (locality !== "All" ? 1 : 0) + (gender !== "All" ? 1 : 0) +
    roomTypes.length + amenities.length + (priceActive ? 1 : 0);

  // ── sidebar content ──────────────────────────────────────────────────────────
  const sidebar = (
    <div className="bg-white border-r border-slate-200 h-full overflow-y-auto">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--background)]">
        <span className="font-bold text-[color:var(--foreground)] text-sm">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-accent-500 font-semibold hover:text-accent-700 transition-colors">
            Clear all
          </button>
        )}
      </div>

      <div className="px-5 divide-y divide-[color:var(--background)]">
        <Section title="City">
          <div className="space-y-2.5">
            {(["All", ...allCities]).map((c) => (
              <label key={c} onClick={() => changeCity(c)} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  city === c ? "border-accent-500 bg-accent-500" : "border-slate-300 group-hover:border-accent-500"
                }`}>
                  {city === c && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-[color:var(--foreground)]">
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
                  gender === g ? "border-accent-500 bg-accent-500" : "border-slate-300 group-hover:border-accent-500"
                }`}>
                  {gender === g && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-[color:var(--foreground)]">
                  {g === "All" ? "Any" : g + " Only"}
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Monthly Budget">
          <PriceRangeSlider 
            value={priceRange} 
            onChange={setPriceRange} 
            minBound={cityBounds[0]} 
            maxBound={cityBounds[1]} 
          />
        </Section>

        <Section title="Room Type">
          <div className="space-y-2.5">
            {(["Single", "Double", "Triple"] as RoomType[]).map((rt) => (
              <label key={rt} onClick={() => toggle(setRoomTypes, rt)} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  roomTypes.includes(rt) ? "border-accent-500 bg-accent-500" : "border-slate-300 group-hover:border-accent-500"
                }`}>
                  {roomTypes.includes(rt) && (
                    <Check size={9} strokeWidth={2.5} color="white" />
                  )}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-[color:var(--foreground)]">{rt} Sharing</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Amenities">
          <div className="space-y-2.5">
            {allAmenities.map((a) => (
              <label key={a} onClick={() => toggle(setAmenities, a)} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  amenities.includes(a) ? "border-accent-500 bg-accent-500" : "border-slate-300 group-hover:border-accent-500"
                }`}>
                  {amenities.includes(a) && (
                    <Check size={9} strokeWidth={2.5} color="white" />
                  )}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-[color:var(--foreground)]">{a}</span>
              </label>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 65px)" }}>

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div className="bg-accent-700 pt-10 pb-12 px-4 sm:px-6 lg:px-8">

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-accent-200/70 mb-5">
            <Link href="/" className="hover:text-accent-200 transition-colors flex items-center gap-1">
              <Home size={11} strokeWidth={1.75} /> Home
            </Link>
            <ChevronRight size={11} strokeWidth={2} />
            <span className="text-accent-200">
              Find a PG{city !== "All" ? ` in ${city}` : ""}{locality !== "All" ? ` › ${locality}` : ""}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl text-white mb-2 tracking-tight">
            {locality !== "All"
              ? `PGs in ${locality}`
              : city !== "All"
              ? `Find a PG in ${city}`
              : "Find Your Perfect PG"}
          </h1>
          <p className="text-accent-200/80 text-sm sm:text-base mb-8">
            {results.length} verified properties · filters applied {activeCount > 0 ? `(${activeCount})` : ""}
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city, locality, PG name…"
              className="w-full rounded-2xl border-0 bg-white/95 backdrop-blur pl-11 pr-10 py-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500 shadow-xl"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* City quick-filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {(["All", ...allCities]).map((c) => (
              <button
                key={c}
                onClick={() => changeCity(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  city === c
                    ? "bg-white text-accent-600 shadow-md"
                    : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"
                }`}
              >
                {c === "All" ? "All Cities" : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Locality / area tabs ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <LocalitySlider city={city} locality={locality} setLocality={setLocality} />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0 sticky top-[65px] h-[calc(100vh-65px)]">
          {sidebar}
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0 bg-[color:var(--background)] flex flex-col">

          {/* Location detection banner */}
          {locationDetecting && (
            <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 border-b border-accent-100 text-xs text-accent-600">
              <Loader2 size={12} strokeWidth={2.5} className="animate-spin" />
              Detecting your location…
            </div>
          )}

          {/* Outside India notice */}
          {!locationDetecting && outsideIndia && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
              <Info size={13} strokeWidth={1.75} />
              ShiftProof is available in India. Showing all listings.
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-white border-b border-slate-200 sticky top-[65px] z-10">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-accent-600 transition-colors">
                <SlidersHorizontal size={15} strokeWidth={1.75} />
                Filters
                {activeCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold text-white">
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
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500 cursor-pointer">
                <option value="relevance">Relevance</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                {userCoords && <option value="nearest">Nearest to you</option>}
              </select>

              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-[color:var(--background)] p-0.5">
                {(["grid", "list"] as ViewMode[]).map((m) => (
                  <button key={m} onClick={() => setViewMode(m)}
                    aria-label={m === "grid" ? "Grid view" : "List view"}
                    className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${m === viewMode ? "bg-white shadow-sm text-accent-600" : "text-slate-400 hover:text-slate-600"}`}>
                    {m === "grid" ? (
                      <LayoutGrid size={14} strokeWidth={1.75} />
                    ) : (
                      <List size={14} strokeWidth={1.75} />
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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 mb-4">
                  <Search size={26} strokeWidth={1.5} className="text-accent-500" />
                </div>
                <p className="font-bold text-slate-800">No PGs match your filters</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
                <button onClick={clearAll} className="mt-4 rounded-xl bg-accent-500 px-5 py-2 text-sm font-bold text-white hover:bg-accent-600 transition-colors">
                  Reset filters
                </button>
              </div>
            )}
            {results.length > 0 && (
              <p className="text-center text-xs text-slate-400 pt-6 pb-2">
                Showing {results.length} of {pgListings.length} properties
              </p>
            )}

            {/* Owner acquisition block — shown to tenants at end of search */}
            {results.length > 0 && (
              <div className="mx-4 sm:mx-5 mb-8 mt-2 rounded-2xl bg-accent-500 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-semibold text-accent-200 uppercase tracking-wide mb-1">Own a PG in {city !== "All" ? city : "your city"}?</p>
                  <p className="text-base font-bold text-white">List your property free — reach tenants actively searching right now</p>
                  <p className="text-xs text-accent-200 mt-1">14-day free trial · No credit card · Setup in 5 minutes</p>
                </div>
                <a
                  href="/signup?plan=growth"
                  className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white text-accent-600 font-semibold text-sm px-5 py-2.5 hover:bg-accent-50 transition-colors shadow"
                >
                  List My PG
                  <ArrowRight size={14} strokeWidth={2} />
                </a>
              </div>
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
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 border border-accent-200 px-2.5 py-0.5 text-xs font-medium text-accent-600">
      {label}
      <button onClick={onRemove} className="hover:text-accent-700 ml-0.5">
        <X size={10} strokeWidth={2.5} />
      </button>
    </span>
  );
}

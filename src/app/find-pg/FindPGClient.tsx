"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  pgListings,
  allCities,
  allAmenities,
  type PGListing,
  type Amenity,
  type Gender,
} from "@/lib/pgData";

// ─── PG Card ─────────────────────────────────────────────────────────────────

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={filled ? "#f97316" : "none"}
      stroke="#f97316"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PGCard({ pg }: { pg: PGListing }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(pg.rating));

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 hover:-translate-y-1">
      {/* Gradient image placeholder */}
      <div className={`relative h-44 bg-gradient-to-br ${pg.gradient} flex items-center justify-center overflow-hidden`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Building illustration */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-30">
          <rect x="10" y="38" width="60" height="38" rx="3" fill="white" />
          <polygon points="40,8 6,40 74,40" fill="white" />
          <rect x="30" y="52" width="20" height="24" rx="2" fill="rgba(0,0,0,0.2)" />
          <rect x="14" y="46" width="14" height="12" rx="2" fill="rgba(255,255,255,0.4)" />
          <rect x="52" y="46" width="14" height="12" rx="2" fill="rgba(255,255,255,0.4)" />
        </svg>

        {/* Occupancy bar */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-white/90">Occupancy</span>
            <span className="text-[10px] font-bold text-white">{pg.occupancy}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/20">
            <div
              className="h-1.5 rounded-full bg-white/80 transition-all"
              style={{ width: `${pg.occupancy}%` }}
            />
          </div>
        </div>

        {/* Badge */}
        {pg.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
            {pg.badge}
          </span>
        )}

        {/* Gender tag */}
        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
            pg.gender === "Female"
              ? "bg-pink-500/90 text-white"
              : pg.gender === "Male"
              ? "bg-blue-500/90 text-white"
              : "bg-white/90 text-slate-700"
          }`}
        >
          {pg.gender}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name + location */}
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-violet-700 transition-colors line-clamp-1">
            {pg.name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-xs text-slate-500 line-clamp-1">{pg.location}</span>
          </div>
        </div>

        {/* Rating + metro */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {stars.map((filled, i) => (
                <StarIcon key={i} filled={filled} />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700 ml-1">{pg.rating}</span>
            <span className="text-xs text-slate-400">({pg.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-[10px] text-slate-500">{pg.distanceFromMetro} metro</span>
          </div>
        </div>

        {/* Room types */}
        <div className="flex flex-wrap gap-1">
          {pg.roomTypes.map((rt) => (
            <span
              key={rt}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {rt}
            </span>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1">
          {pg.amenities.slice(0, 5).map((a) => (
            <span
              key={a}
              className="rounded-full bg-violet-50 border border-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700"
            >
              {a}
            </span>
          ))}
          {pg.amenities.length > 5 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              +{pg.amenities.length - 5} more
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Starting from</span>
            <div className="text-lg font-extrabold text-slate-900">
              ₹{pg.price.toLocaleString("en-IN")}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
          </div>
          <button className="rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors hover:scale-105 transform">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Amenity icon map ─────────────────────────────────────────────────────────

const amenityIcons: Record<Amenity, string> = {
  WiFi: "📶",
  AC: "❄️",
  Meals: "🍱",
  Laundry: "👕",
  Parking: "🅿️",
  CCTV: "📷",
  Gym: "💪",
  "Power Backup": "🔋",
  "Hot Water": "🚿",
  TV: "📺",
};

// ─── Main Client Component ────────────────────────────────────────────────────

type SortOption = "price_asc" | "price_desc" | "rating" | "reviews";

export default function FindPGClient() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<Gender | "All">("All");
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleAmenity = (a: Amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCity("All");
    setSelectedGender("All");
    setSelectedAmenities([]);
    setMaxPrice(15000);
    setSortBy("rating");
  };

  const filtered = useMemo(() => {
    let list = pgListings.filter((pg) => {
      const matchSearch =
        search.trim() === "" ||
        pg.name.toLowerCase().includes(search.toLowerCase()) ||
        pg.location.toLowerCase().includes(search.toLowerCase()) ||
        pg.city.toLowerCase().includes(search.toLowerCase());
      const matchCity = selectedCity === "All" || pg.city === selectedCity;
      const matchGender =
        selectedGender === "All" || pg.gender === selectedGender;
      const matchAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((a) => pg.amenities.includes(a));
      const matchPrice = pg.price <= maxPrice;
      return matchSearch && matchCity && matchGender && matchAmenities && matchPrice;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      return b.rating - a.rating;
    });

    return list;
  }, [search, selectedCity, selectedGender, selectedAmenities, maxPrice, sortBy]);

  const activeFilterCount =
    (selectedCity !== "All" ? 1 : 0) +
    (selectedGender !== "All" ? 1 : 0) +
    selectedAmenities.length +
    (maxPrice < 15000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 pt-28 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-violet-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className="text-white font-medium">Find a PG</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Find Your Perfect PG
          </h1>
          <p className="text-violet-200 text-base sm:text-lg max-w-xl">
            Browse {pgListings.length}+ verified PG accommodations across India. Filter by city, gender, amenities, and budget.
          </p>

          {/* Search bar */}
          <div className="mt-6 relative max-w-2xl">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, location or city..."
              className="w-full rounded-2xl border-0 bg-white pl-12 pr-4 py-4 text-base text-slate-800 placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* ── Sidebar (desktop) ───────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 gap-6">
            <FilterPanel
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              selectedAmenities={selectedAmenities}
              toggleAmenity={toggleAmenity}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              clearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* ── Results ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  className="lg:hidden flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-violet-50 hover:border-violet-200 transition-colors"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{filtered.length}</span> PGs found
                </span>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 hidden sm:block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
                >
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Mobile filter drawer */}
            {filtersOpen && (
              <div className="lg:hidden mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
                <FilterPanel
                  selectedCity={selectedCity}
                  setSelectedCity={setSelectedCity}
                  selectedGender={selectedGender}
                  setSelectedGender={setSelectedGender}
                  selectedAmenities={selectedAmenities}
                  toggleAmenity={toggleAmenity}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  clearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            )}

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCity !== "All" && (
                  <FilterChip label={selectedCity} onRemove={() => setSelectedCity("All")} />
                )}
                {selectedGender !== "All" && (
                  <FilterChip label={selectedGender} onRemove={() => setSelectedGender("All")} />
                )}
                {selectedAmenities.map((a) => (
                  <FilterChip key={a} label={a} onRemove={() => toggleAmenity(a)} />
                ))}
                {maxPrice < 15000 && (
                  <FilterChip label={`≤ ₹${maxPrice.toLocaleString("en-IN")}`} onRemove={() => setMaxPrice(15000)} />
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-violet-600 font-semibold hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((pg) => (
                  <PGCard key={pg.id} pg={pg} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <circle cx="11" cy="16" r="0.5" fill="#7c3aed" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">No PGs found</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-xs">
                  Try adjusting your filters or search query to find more results.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 border border-violet-200 px-3 py-1 text-xs font-medium text-violet-700">
      {label}
      <button onClick={onRemove} className="hover:text-violet-900">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  selectedGender: Gender | "All";
  setSelectedGender: (g: Gender | "All") => void;
  selectedAmenities: Amenity[];
  toggleAmenity: (a: Amenity) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

function FilterPanel({
  selectedCity,
  setSelectedCity,
  selectedGender,
  setSelectedGender,
  selectedAmenities,
  toggleAmenity,
  maxPrice,
  setMaxPrice,
  clearFilters,
  activeFilterCount,
}: FilterPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-900 text-sm">Filters</span>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-violet-600 font-semibold hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">City</p>
        <div className="flex flex-wrap gap-1.5">
          {["All", ...allCities].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCity === city
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Gender</p>
        <div className="flex gap-1.5">
          {(["All", "Male", "Female", "Mixed"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`flex-1 rounded-full py-1.5 text-xs font-medium transition-colors ${
                selectedGender === g
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Max Budget</p>
          <span className="text-xs font-bold text-violet-700">₹{maxPrice.toLocaleString("en-IN")}/mo</span>
        </div>
        <input
          type="range"
          min={3000}
          max={15000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-2 rounded-full accent-violet-600 cursor-pointer"
        />
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
          <span>₹3,000</span>
          <span>₹15,000</span>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Amenities</p>
        <div className="space-y-2">
          {allAmenities.map((a) => {
            const checked = selectedAmenities.includes(a);
            return (
              <label
                key={a}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div
                  onClick={() => toggleAmenity(a)}
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                    checked
                      ? "border-violet-600 bg-violet-600"
                      : "border-slate-300 bg-white group-hover:border-violet-400"
                  }`}
                >
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => toggleAmenity(a)}
                  className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors"
                >
                  {amenityIcons[a]} {a}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { type PGListing, type RoomType } from "@/lib/pgData";
import type { Property } from "@/lib/api/types";
import { haversineKm } from "@/lib/geo";
import {
  AMENITY_ICONS,
  ROOM_DESCRIPTIONS,
  ROOM_PRICE_MULTIPLIER,
  DEFAULT_HOUSE_RULES,
} from "@/lib/constants";
import {
  generateMockRooms,
  STATUS_META,
  BED_STATUSES,
  type BedStatus,
  type Room,
} from "@/lib/bedMatrix";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function roomPrice(base: number, rt: RoomType) {
  return Math.round((base * ROOM_PRICE_MULTIPLIER[rt]) / 100) * 100;
}

function ownerInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Priya M.",
    initials: "PM",
    rating: 5,
    date: "March 2025",
    text: "Loved my stay here! The room was spacious and the WiFi speed was outstanding. The caretaker resolved every issue same-day — a rare find.",
  },
  {
    id: 2,
    name: "Arjun S.",
    initials: "AS",
    rating: 4,
    date: "January 2025",
    text: "Great location and super clean common areas. Meals were tasty. Would have loved a gym but otherwise it has been a great experience overall.",
  },
  {
    id: 3,
    name: "Neha K.",
    initials: "NK",
    rating: 5,
    date: "December 2024",
    text: "Very safe and well-maintained. The laundry facility saved me so much time. Highly recommend to working professionals who want comfort and convenience.",
  },
];

const AVG_REVIEW_RATING =
  MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length;

// ─── Icons ────────────────────────────────────────────────────────────────────

function StarFilled() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="text-slate-400 flex-shrink-0"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [mobileIdx, setMobileIdx] = useState(0);
  const safe = images.length > 0 ? images : ["/placeholder-pg.jpg"];

  return (
    <>
      {/* Mobile: single image + prev/next + dots */}
      <div className="lg:hidden relative h-72 sm:h-80 rounded-2xl overflow-hidden">
        <img
          src={safe[mobileIdx]}
          alt={name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setLightbox(mobileIdx)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {safe.length > 1 && (
          <>
            <button
              aria-label="Previous photo"
              disabled={mobileIdx === 0}
              onClick={() => setMobileIdx((i) => Math.max(0, i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors disabled:opacity-30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              aria-label="Next photo"
              disabled={mobileIdx === safe.length - 1}
              onClick={() => setMobileIdx((i) => Math.min(safe.length - 1, i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors disabled:opacity-30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {safe.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setMobileIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === mobileIdx ? "w-5 bg-white" : "w-1.5 bg-white/55"}`}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => setLightbox(0)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white text-[11px] font-semibold px-3 py-1.5 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          {safe.length} photos
        </button>
      </div>

      {/* Desktop: large left + 2 stacked right */}
      <div className="hidden lg:grid grid-cols-3 gap-2 h-[420px] rounded-2xl overflow-hidden">
        <div
          className="col-span-2 relative cursor-pointer group"
          onClick={() => setLightbox(0)}
        >
          <img
            src={safe[0]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(0); }}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 shadow transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            View all {safe.length} photos
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {safe.length > 1 ? (
            safe.slice(1, 3).map((src, i) => (
              <div
                key={i}
                className="flex-1 relative cursor-pointer group overflow-hidden"
                onClick={() => setLightbox(i + 1)}
              >
                <img
                  src={src}
                  alt={`${name} photo ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {i === 1 && safe.length > 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">+{safe.length - 3} more</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex-1 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
              No more photos
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Close"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {lightbox > 0 && (
            <button
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          {lightbox < safe.length - 1 && (
            <button
              aria-label="Next"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          <img
            src={safe[lightbox]}
            alt={name}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {safe.map((_, i) => (
              <button
                key={i}
                aria-label={`Photo ${i + 1}`}
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                className={`h-1.5 rounded-full transition-all ${i === lightbox ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Bed Matrix ───────────────────────────────────────────────────────────────

function BedMatrix({ pg }: { pg: Property }) {
  const mockPg: PGListing = {
    ...pg,
    name: pg.title,
    badge: pg.badge,
    roomTypes: pg.roomTypes ?? [],
    amenities: pg.amenities ?? [],
  } as any;
  const [rooms, setRooms] = useState<Room[]>(() => generateMockRooms(mockPg));
  const [ownerMode, setOwnerMode] = useState(false);
  const [activeBed, setActiveBed] = useState<string | null>(null);

  const updateBedStatus = (roomId: string, bedId: string, status: BedStatus) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, beds: r.beds.map((b) => (b.id === bedId ? { ...b, status } : b)) }
          : r
      )
    );
    setActiveBed(null);
  };

  const addRoom = (type: RoomType) => {
    const lastNum = Math.max(...rooms.map((r) => parseInt(r.name.replace("Room ", ""), 10)));
    const newNum = lastNum + 1;
    const bedCount = type === "Single" ? 1 : type === "Double" ? 2 : 3;
    const newRoom: Room = {
      id: `${pg.id}-${newNum}`,
      name: `Room ${newNum}`,
      type,
      floor: Math.floor((newNum - 101) / 5) + 1,
      beds: Array.from({ length: bedCount }, (_, b) => ({
        id: `${pg.id}-${newNum}-${b}`,
        label: `Bed ${String.fromCharCode(65 + b)}`,
        status: "available",
      })),
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  const removeRoom = (roomId: string) => setRooms((prev) => prev.filter((r) => r.id !== roomId));

  const allBeds = rooms.flatMap((r) => r.beds);
  const counts = BED_STATUSES.reduce<Record<BedStatus, number>>(
    (acc, s) => ({ ...acc, [s]: allBeds.filter((b) => b.status === s).length }),
    { available: 0, occupied: 0, reserved: 0, maintenance: 0 }
  );

  const floors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-semibold text-[color:var(--foreground)]">Bed Availability Matrix</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {counts.available} of {allBeds.length} beds available across {rooms.length} rooms
          </p>
        </div>
        <button
          onClick={() => { setOwnerMode(!ownerMode); setActiveBed(null); }}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-colors ${ownerMode
            ? "bg-accent-500 text-white border-accent-500 shadow"
            : "bg-white text-slate-600 border-slate-200 hover:border-accent-500"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {ownerMode
              ? <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
            }
          </svg>
          {ownerMode ? "Exit Owner Mode" : "Owner View"}
        </button>
      </div>

      {ownerMode && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-accent-50 border border-accent-100 px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.5" fill="#7c3aed" />
          </svg>
          <p className="text-xs text-accent-600">
            <strong>Owner Mode (demo)</strong> — Click any bed to change its status. Add or remove rooms below.
            In production, owner changes status in the Android app → API writes to DB → tenants see it on next page load.
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 mb-5">
        {BED_STATUSES.map((s) => {
          const m = STATUS_META[s];
          return (
            <div key={s} className={`rounded-xl px-3 py-2.5 text-center ${m.bg}`}>
              <p className={`text-lg font-semibold ${m.text}`}>{counts[s]}</p>
              <p className={`text-[10px] font-medium ${m.text} opacity-80`}>{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {BED_STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${STATUS_META[s].dot}`} />
            <span className="text-[11px] text-slate-500">{STATUS_META[s].label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {floors.map((floor) => (
          <div key={floor}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Floor {floor}</span>
              <div className="flex-1 h-px bg-[color:var(--background)]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {rooms.filter((r) => r.floor === floor).map((room) => (
                <div key={room.id} className="rounded-xl border border-slate-200 bg-[color:var(--background)] p-3 relative group/room">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700">{room.name}</span>
                    <span className="text-[9px] font-semibold rounded-full bg-white border border-slate-200 px-1.5 py-0.5 text-slate-500">
                      {room.type}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {room.beds.map((bed) => {
                      const m = STATUS_META[bed.status];
                      const key = `${room.id}-${bed.id}`;
                      return (
                        <div key={bed.id} className="relative">
                          <button
                            onClick={() => ownerMode && setActiveBed(activeBed === key ? null : key)}
                            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold border transition-colors ${m.bg} ${m.text} border-current/20 ${ownerMode ? "cursor-pointer" : "cursor-default"}`}
                          >
                            <div className={`inline-block w-2 h-2 rounded-full mr-1 ${m.dot}`} />
                            {bed.label}
                          </button>
                          {ownerMode && activeBed === key && (
                            <div className="absolute bottom-full left-0 mb-1.5 z-20 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[130px]">
                              <p className="text-[9px] font-bold text-slate-400 uppercase px-3 pt-2.5 pb-1">Change status</p>
                              {BED_STATUSES.map((s) => {
                                const sm = STATUS_META[s];
                                return (
                                  <button
                                    key={s}
                                    onClick={() => updateBedStatus(room.id, bed.id, s)}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[color:var(--background)] transition-colors ${bed.status === s ? "font-bold" : ""}`}
                                  >
                                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${sm.dot}`} />
                                    <span className={sm.text}>{sm.label}</span>
                                    {bed.status === s && (
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#7c3aed" stroke="none" className="ml-auto">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {ownerMode && (
                    <button
                      onClick={() => removeRoom(room.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover/room:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {ownerMode && (
        <div className="mt-5 pt-5 border-t border-[color:var(--background)]">
          <p className="text-xs font-semibold text-slate-500 mb-2">Add a new room</p>
          <div className="flex flex-wrap gap-2">
            {(["Single", "Double", "Triple"] as RoomType[]).map((type) => (
              <button
                key={type}
                onClick={() => addRoom(type)}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-accent-100 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add {type} Room
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PGDetailClient({
  pg,
  similar,
}: {
  pg: Property;
  similar: Property[];
}) {
  const roomTypes: string[] = pg.roomTypes ?? [];
  const amenities: string[] = pg.amenities ?? [];

  const [selectedRoom, setSelectedRoom] = useState<string>(roomTypes[0] ?? "Single");
  const [saved, setSaved] = useState(false);
  const isFillingFast = pg.occupancy >= 90;

  const genderColor =
    pg.gender === "Female"
      ? "bg-pink-50 text-pink-600 border-pink-100"
      : pg.gender === "Male"
      ? "bg-sky-50 text-sky-600 border-sky-100"
      : "bg-[color:var(--background)] text-slate-600 border-slate-200";

  const galleryImages =
    pg.images.length > 0
      ? pg.images.map((img) => img.url)
      : pg.imageUrl
      ? [pg.imageUrl]
      : [];

  const hasMeals = amenities.includes("Meals");

  return (
    <main className="bg-[color:var(--background)] min-h-screen">

      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 max-w-7xl mx-auto">
          <Link href="/" className="hover:text-accent-500 transition-colors">Home</Link>
          <ChevronRight />
          <Link href="/find-pg" className="hover:text-accent-500 transition-colors">Find a PG</Link>
          <ChevronRight />
          <span className="text-slate-700 font-medium truncate">{pg.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Photo gallery ─────────────────────────────────────────────────── */}
        <Gallery images={galleryImages} name={pg.title} />

        {/* ── Highlights strip ──────────────────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Verified Listing",
              sub: "Identity + property checked",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              ),
            },
            {
              label: hasMeals ? "Meals Included" : "Self-Cook Kitchen",
              sub: hasMeals ? "3 meals/day, veg + non-veg" : "Common kitchen available",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
                </svg>
              ),
            },
            {
              label: "Metro Access",
              sub: `${pg.distanceFromMetro} from nearest station`,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M3 9h18M9 21V9M15 21V9" />
                </svg>
              ),
            },
            {
              label: `${pg.totalRooms} Rooms`,
              sub: `${pg.totalRooms - pg.occupiedRooms} currently available`,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
            },
          ].map((h) => (
            <div key={h.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
              <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-accent-50 flex items-center justify-center">
                {h.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-snug">{h.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{h.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main content grid ─────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left column ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      Verified
                    </span>
                    {isFillingFast && (
                      <span className="rounded-full bg-orange-50 border border-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-500">
                        Filling Fast — {pg.occupancy}% occupied
                      </span>
                    )}
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${genderColor}`}>
                      {pg.gender === "Co-ed" ? "Co-ed" : `${pg.gender} Only`}
                    </span>
                    {pg.badge && (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">
                        {pg.badge}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-semibold text-[color:var(--foreground)] leading-tight">{pg.title}</h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                    <PinIcon />
                    <span>{pg.location}</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span>{pg.distanceFromMetro} from metro</span>
                  </div>
                </div>
                <button
                  onClick={() => setSaved(!saved)}
                  className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:border-rose-200 transition-colors shadow-sm"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={saved ? "#ef4444" : "none"}
                    stroke={saved ? "#ef4444" : "#94a3b8"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-[color:var(--background)]">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={s <= Math.round(pg.rating) ? "#f59e0b" : "#e2e8f0"}
                        stroke="none"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-bold text-[color:var(--foreground)]">{pg.rating}</span>
                  <span className="text-sm text-slate-400">({pg.reviews} reviews)</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-sm text-slate-500">{pg.occupancy}% occupied</span>
                {pg.badge && (
                  <>
                    <div className="h-4 w-px bg-slate-200" />
                    <span className="text-sm font-semibold text-amber-600">{pg.badge}</span>
                  </>
                )}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-3">About this PG</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{pg.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-1">
                Amenities
              </h2>
              <p className="text-xs text-slate-400 mb-4">{amenities.length} facilities included</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {amenities.map((a) => (
                  <div
                    key={a}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[color:var(--background)] border border-transparent hover:border-accent-200 hover:bg-accent-50 transition-colors"
                  >
                    <div className="w-7 h-7 text-accent-500">{AMENITY_ICONS[a]}</div>
                    <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room types & pricing */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-4">Room Types & Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roomTypes.map((rt) => (
                  <div
                    key={rt}
                    onClick={() => setSelectedRoom(rt)}
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                      selectedRoom === rt
                        ? "border-accent-500 bg-accent-50"
                        : "border-slate-200 bg-white hover:border-accent-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[color:var(--foreground)] text-sm">{rt} Room</span>
                      {selectedRoom === rt && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed" stroke="none">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3 leading-snug">{ROOM_DESCRIPTIONS[rt as RoomType] ?? rt}</p>
                    <p className="text-lg font-semibold text-accent-600">
                      ₹{roomPrice(pg.price, rt as RoomType).toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-slate-400">/mo</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bed matrix */}
            <BedMatrix pg={pg} />

            {/* House rules */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-4">House Rules</h2>
              <ul className="space-y-2.5">
                {DEFAULT_HOUSE_RULES.map((rule) => (
                  <li key={rule} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rental policies */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-4">Rental Policies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: "Security Deposit",
                    value: `₹${pg.deposit.toLocaleString("en-IN")} (fully refundable)`,
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    ),
                  },
                  {
                    label: "Notice Period",
                    value: "2 months before vacating",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    ),
                  },
                  {
                    label: "Lock-in Period",
                    value: "3 months minimum stay",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                  },
                  {
                    label: "Check-in Time",
                    value: "From 11:00 AM onwards",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                      </svg>
                    ),
                  },
                  {
                    label: "Electricity",
                    value: "Metered separately (₹5/unit)",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Maintenance",
                    value: "Included in monthly rent",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                      </svg>
                    ),
                  },
                ].map((p) => (
                  <div key={p.label} className="flex items-start gap-3 rounded-xl bg-[color:var(--background)] px-4 py-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-accent-50 flex items-center justify-center mt-0.5">
                      {p.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{p.label}</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{p.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tenant reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base font-semibold text-[color:var(--foreground)]">Tenant Reviews</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={s <= Math.round(AVG_REVIEW_RATING) ? "#f59e0b" : "#e2e8f0"}
                          stroke="none"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-bold text-[color:var(--foreground)]">{AVG_REVIEW_RATING.toFixed(1)}</span>
                    <span className="text-sm text-slate-400">({MOCK_REVIEWS.length} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {MOCK_REVIEWS.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-100 bg-[color:var(--background)] p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-accent-600">{r.initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                          <p className="text-[10px] text-slate-400">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill={s <= r.rating ? "#f59e0b" : "#e2e8f0"}
                            stroke="none"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-1">Location</h2>
              <p className="text-xs text-slate-400 mb-4">{pg.location}</p>
              <div className="h-52 rounded-xl bg-[color:var(--background)] border border-slate-200 flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Interactive map coming soon</p>
                  <p className="text-xs text-slate-400 mt-0.5">Google Maps integration — Phase 2</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Metro station", value: pg.distanceFromMetro },
                  {
                    label: "City centre",
                    value: "~" + (Math.round(haversineKm(pg.lat, pg.lng, pg.lat - 0.05, pg.lng - 0.05) * 10) / 10) + " km",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl bg-[color:var(--background)] px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: sticky sidebar ─────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-[80px] space-y-4">

              {/* Booking card */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-br from-violet-700 to-violet-600 px-6 py-5">
                  <p className="text-violet-200 text-xs font-medium mb-0.5">Starting from</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold text-white">
                      ₹{roomPrice(pg.price, selectedRoom as RoomType).toLocaleString("en-IN")}
                    </span>
                    <span className="text-violet-200 text-sm">/month</span>
                  </div>
                  <p className="text-violet-200 text-xs mt-1">
                    {selectedRoom} room · {ROOM_DESCRIPTIONS[selectedRoom as RoomType] ?? selectedRoom}
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Select room type</p>
                    <div className="flex flex-wrap gap-2">
                      {roomTypes.map((rt) => (
                        <button
                          key={rt}
                          onClick={() => setSelectedRoom(rt)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                            selectedRoom === rt
                              ? "bg-accent-500 text-white border-accent-500"
                              : "bg-white text-slate-600 border-slate-200 hover:border-accent-500"
                          }`}
                        >
                          {rt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <span className="text-sm font-semibold text-emerald-700">
                      {100 - pg.occupancy}% rooms available
                    </span>
                  </div>

                  <button className="w-full rounded-xl bg-accent-500 py-3 text-sm font-bold text-white hover:bg-accent-600 active:scale-[0.98] transition-all">
                    Contact Owner
                  </button>
                  <button className="w-full rounded-xl border-2 border-accent-500 py-3 text-sm font-bold text-accent-600 hover:bg-accent-50 active:scale-[0.98] transition-all">
                    Schedule a Visit
                  </button>

                  <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                    Enquiry sent securely via ShiftProof. We never share your number without consent.
                  </p>

                  <div className="pt-2 border-t border-[color:var(--background)] grid grid-cols-2 gap-3 text-center">
                    {[
                      { label: "Rating", value: `${pg.rating} ★` },
                      { label: "Reviews", value: pg.reviews },
                      { label: "Occupancy", value: `${pg.occupancy}%` },
                      { label: "Metro", value: pg.distanceFromMetro },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-base font-semibold text-[color:var(--foreground)]">{s.value}</p>
                        <p className="text-[10px] text-slate-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Owner card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Property Owner</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {pg.ownerAvatarUrl ? (
                      <img src={pg.ownerAvatarUrl} alt={pg.ownerName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-bold text-accent-600">{ownerInitials(pg.ownerName)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{pg.ownerName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#10b981" stroke="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      <span className="text-[11px] text-emerald-600 font-medium">Verified Owner</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {[
                    { label: "Response rate", value: "95%" },
                    { label: "Avg. response", value: "< 1 hr" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-[color:var(--background)] px-3 py-2.5">
                      <p className="text-sm font-bold text-slate-800">{s.value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Similar PGs ───────────────────────────────────────────────────── */}
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">
              More PGs in {pg.city}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/find-pg/${s.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative h-40 bg-[color:var(--background)]">
                    <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    {s.occupancy >= 90 && (
                      <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-accent-500">
                        Filling Fast
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-[color:var(--foreground)] text-sm group-hover:text-accent-600 transition-colors line-clamp-1">
                      {s.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                      <PinIcon />
                      <span className="truncate">{s.locality}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <StarFilled />
                        <span className="text-xs font-bold text-slate-800">{s.rating}</span>
                      </div>
                      <p className="text-sm font-semibold text-accent-600">
                        ₹{s.price.toLocaleString("en-IN")}
                        <span className="text-[10px] font-normal text-slate-400">/mo</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

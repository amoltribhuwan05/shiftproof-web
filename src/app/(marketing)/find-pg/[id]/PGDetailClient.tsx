"use client";

import { useState } from "react";
import Link from "next/link";
import { type PGListing, type RoomType } from "@/lib/pgData";
import { haversineKm, fmtDistance } from "@/lib/geo";
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
  type Bed,
  type Room,
} from "@/lib/bedMatrix";

// ─── Room price helper ────────────────────────────────────────────────────────

function roomPrice(base: number, rt: RoomType) {
  return Math.round((base * ROOM_PRICE_MULTIPLIER[rt]) / 100) * 100;
}

// ─── Inline components ────────────────────────────────────────────────────────

function StarFilled() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className="text-slate-400 flex-shrink-0">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

// ─── Photo gallery ────────────────────────────────────────────────────────────

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      {/* Grid: large left + 2 stacked right */}
      <div className="grid grid-cols-3 gap-2 h-[420px] rounded-2xl overflow-hidden">
        <div className="col-span-2 relative cursor-pointer group" onClick={() => setLightbox(0)}>
          <img src={images[0]} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="flex flex-col gap-2">
          {images.slice(1, 3).map((src, i) => (
            <div key={i} className="flex-1 relative cursor-pointer group" onClick={() => setLightbox(i + 1)}>
              <img src={src} alt={`${name} photo ${i + 2}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {i === 1 && images.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">+{images.length - 3} photos</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button aria-label="Close lightbox" className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <img src={images[lightbox]} alt={name}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === lightbox ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main detail page ─────────────────────────────────────────────────────────

// ─── Bed Matrix ───────────────────────────────────────────────────────────────

function BedMatrix({ pg }: { pg: PGListing }) {
  const [rooms, setRooms] = useState<Room[]>(() => generateMockRooms(pg));
  const [ownerMode, setOwnerMode] = useState(false);
  const [activeBed, setActiveBed] = useState<string | null>(null); // "roomId-bedId"

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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Bed Availability Matrix</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {counts.available} of {allBeds.length} beds available across {rooms.length} rooms
          </p>
        </div>
        <button
          onClick={() => { setOwnerMode(!ownerMode); setActiveBed(null); }}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
            ownerMode
              ? "bg-violet-600 text-white border-violet-600 shadow"
              : "bg-white text-slate-600 border-slate-200 hover:border-violet-400"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {ownerMode
              ? <><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></>
              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
            }
          </svg>
          {ownerMode ? "Exit Owner Mode" : "Owner View"}
        </button>
      </div>

      {/* Owner mode notice */}
      {ownerMode && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-violet-50 border border-violet-100 px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#7c3aed"/>
          </svg>
          <p className="text-xs text-violet-700">
            <strong>Owner Mode (demo)</strong> — Click any bed to change its status. Add or remove rooms below.
            In production, owner changes status in the Android app → API writes to DB → tenants see it on next page load. No WebSocket needed.
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {BED_STATUSES.map((s) => {
          const m = STATUS_META[s];
          return (
            <div key={s} className={`rounded-xl px-3 py-2.5 text-center ${m.bg}`}>
              <p className={`text-lg font-extrabold ${m.text}`}>{counts[s]}</p>
              <p className={`text-[10px] font-medium ${m.text} opacity-80`}>{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {BED_STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${STATUS_META[s].dot}`} />
            <span className="text-[11px] text-slate-500">{STATUS_META[s].label}</span>
          </div>
        ))}
      </div>

      {/* Floor sections */}
      <div className="space-y-6">
        {floors.map((floor) => (
          <div key={floor}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Floor {floor}</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {rooms.filter((r) => r.floor === floor).map((room) => (
                <div key={room.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 relative group/room">
                  {/* Room label */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700">{room.name}</span>
                    <span className="text-[9px] font-semibold rounded-full bg-white border border-slate-200 px-1.5 py-0.5 text-slate-500">
                      {room.type}
                    </span>
                  </div>

                  {/* Beds */}
                  <div className="flex gap-1.5 flex-wrap">
                    {room.beds.map((bed) => {
                      const m = STATUS_META[bed.status];
                      const key = `${room.id}-${bed.id}`;
                      return (
                        <div key={bed.id} className="relative">
                          <button
                            onClick={() => ownerMode && setActiveBed(activeBed === key ? null : key)}
                            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold border transition-all ${m.bg} ${m.text} border-current/20 ${
                              ownerMode ? "cursor-pointer hover:scale-105 hover:shadow-sm" : "cursor-default"
                            }`}
                          >
                            <div className={`inline-block w-2 h-2 rounded-full mr-1 ${m.dot}`} />
                            {bed.label}
                          </button>

                          {/* Status picker (owner mode) */}
                          {ownerMode && activeBed === key && (
                            <div className="absolute bottom-full left-0 mb-1.5 z-20 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[130px]">
                              <p className="text-[9px] font-bold text-slate-400 uppercase px-3 pt-2.5 pb-1">
                                Change status
                              </p>
                              {BED_STATUSES.map((s) => {
                                const sm = STATUS_META[s];
                                return (
                                  <button key={s}
                                    onClick={() => updateBedStatus(room.id, bed.id, s)}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors ${
                                      bed.status === s ? "font-bold" : ""
                                    }`}
                                  >
                                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${sm.dot}`} />
                                    <span className={sm.text}>{sm.label}</span>
                                    {bed.status === s && (
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#7c3aed" stroke="none" className="ml-auto">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
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

                  {/* Remove room button (owner mode) */}
                  {ownerMode && (
                    <button
                      onClick={() => removeRoom(room.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover/room:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add room (owner mode) */}
      {ownerMode && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2">Add a new room</p>
          <div className="flex flex-wrap gap-2">
            {(["Single", "Double", "Triple"] as RoomType[]).map((type) => (
              <button key={type}
                onClick={() => addRoom(type)}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add {type} Room
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            In production, owner saves status → DB write → tenants see the update on their next page load. No WebSocket needed.
          </p>
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
  pg: PGListing;
  similar: PGListing[];
}) {
  const [selectedRoom, setSelectedRoom] = useState<RoomType>(pg.roomTypes[0]);
  const [saved, setSaved] = useState(false);
  const isFillingFast = pg.occupancy >= 90;

  const genderColor =
    pg.gender === "Female" ? "bg-pink-50 text-pink-600 border-pink-100"
    : pg.gender === "Male"   ? "bg-sky-50 text-sky-600 border-sky-100"
    : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <main className="bg-slate-50 min-h-screen">

      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 max-w-7xl mx-auto">
          <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          <Link href="/find-pg" className="hover:text-violet-600 transition-colors">Find a PG</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          <span className="text-slate-700 font-medium truncate">{pg.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Photo gallery ─────────────────────────────────────────────────── */}
        <Gallery images={pg.images} name={pg.name} />

        {/* ── Main content grid ─────────────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left: details ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                      Verified
                    </span>
                    {isFillingFast && (
                      <span className="rounded-full bg-orange-50 border border-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-500">
                        🔥 Filling Fast — {pg.occupancy}% occupied
                      </span>
                    )}
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${genderColor}`}>
                      {pg.gender === "Mixed" ? "Co-ed" : `${pg.gender} Only`}
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{pg.name}</h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
                    <PinIcon />
                    <span>{pg.location}</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span>{pg.distanceFromMetro} from metro</span>
                  </div>
                </div>
                <button onClick={() => setSaved(!saved)}
                  className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:border-violet-300 transition-colors shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24"
                    fill={saved ? "#ef4444" : "none"} stroke={saved ? "#ef4444" : "#94a3b8"} strokeWidth="2" strokeLinecap="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Rating bar */}
              <div className="mt-4 flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                        fill={s <= Math.round(pg.rating) ? "#f59e0b" : "#e2e8f0"} stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">{pg.rating}</span>
                  <span className="text-sm text-slate-400">({pg.reviews} reviews)</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-sm text-slate-500">{pg.occupancy}% occupied</span>
                {pg.badge && (
                  <>
                    <div className="h-4 w-px bg-slate-200" />
                    <span className="text-sm font-semibold text-orange-500">{pg.badge}</span>
                  </>
                )}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-3">About this PG</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{pg.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {pg.amenities.map((a) => (
                  <div key={a} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 text-violet-600">{AMENITY_ICONS[a]}</div>
                    <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room types & pricing */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">Room Types & Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pg.roomTypes.map((rt) => (
                  <div key={rt}
                    onClick={() => setSelectedRoom(rt)}
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      selectedRoom === rt
                        ? "border-violet-600 bg-violet-50"
                        : "border-slate-200 bg-white hover:border-violet-300"
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-sm">{rt} Room</span>
                      {selectedRoom === rt && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed" stroke="none">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                        </svg>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3 leading-snug">{ROOM_DESCRIPTIONS[rt]}</p>
                    <p className="text-lg font-extrabold text-violet-700">
                      ₹{roomPrice(pg.price, rt).toLocaleString("en-IN")}
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
              <h2 className="text-base font-extrabold text-slate-900 mb-4">House Rules</h2>
              <ul className="space-y-2.5">
                {DEFAULT_HOUSE_RULES.map((rule) => (
                  <li key={rule} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Location placeholder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-1">Location</h2>
              <p className="text-xs text-slate-400 mb-4">{pg.location}</p>
              <div className="h-52 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Interactive map coming soon</p>
                  <p className="text-xs text-slate-400 mt-0.5">Google Maps integration planned — Phase 2</p>
                </div>
              </div>
              {/* Quick nearby stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Metro station", value: pg.distanceFromMetro, icon: "🚇" },
                  { label: "City centre", value: "~" + (Math.round(haversineKm(pg.lat, pg.lng, pg.lat - 0.05, pg.lng - 0.05) * 10) / 10) + " km", icon: "🏙️" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: booking card (sticky) ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-[80px] bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

              {/* Price header */}
              <div className="bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 px-6 py-5">
                <p className="text-violet-300 text-xs font-medium mb-0.5">Starting from</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">
                    ₹{roomPrice(pg.price, selectedRoom).toLocaleString("en-IN")}
                  </span>
                  <span className="text-violet-300 text-sm">/month</span>
                </div>
                <p className="text-violet-300 text-xs mt-1">{selectedRoom} room · {ROOM_DESCRIPTIONS[selectedRoom]}</p>
              </div>

              <div className="p-5 space-y-4">
                {/* Room selector */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Select room type</p>
                  <div className="flex flex-wrap gap-2">
                    {pg.roomTypes.map((rt) => (
                      <button key={rt} onClick={() => setSelectedRoom(rt)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                          selectedRoom === rt
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-violet-400"
                        }`}>
                        {rt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-700">
                    {100 - pg.occupancy}% rooms available
                  </span>
                </div>

                {/* CTAs */}
                <button className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 active:scale-[0.98] transition-all shadow-sm">
                  Contact Owner
                </button>
                <button className="w-full rounded-xl border-2 border-violet-600 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50 transition-colors">
                  Schedule a Visit
                </button>

                {/* Safety note */}
                <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                  🔒 Your enquiry is sent securely via ShiftProof. We never share your number without consent.
                </p>

                {/* Quick stats */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                  {[
                    { label: "Rating", value: `${pg.rating} ★` },
                    { label: "Reviews", value: pg.reviews },
                    { label: "Occupancy", value: `${pg.occupancy}%` },
                    { label: "Metro", value: pg.distanceFromMetro },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-base font-extrabold text-slate-900">{s.value}</p>
                      <p className="text-[10px] text-slate-400">{s.label}</p>
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
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">
              More PGs in {pg.city}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((s) => (
                <Link key={s.id} href={`/find-pg/${s.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-40 bg-slate-100">
                    <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    {s.occupancy >= 90 && (
                      <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-orange-500">
                        🔥 Filling Fast
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-violet-700 transition-colors line-clamp-1">
                      {s.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                      <PinIcon /><span className="truncate">{s.locality}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <StarFilled />
                        <span className="text-xs font-bold text-slate-800">{s.rating}</span>
                      </div>
                      <p className="text-sm font-extrabold text-violet-700">
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

        {/* ── Improvement plan ──────────────────────────────────────────────── */}
        <section className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Roadmap — what this page can become</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                phase: "Phase 1 · Now",
                color: "bg-emerald-50 border-emerald-200 text-emerald-700",
                dot: "bg-emerald-500",
                items: ["Photo gallery with lightbox ✓", "Room type price selector ✓", "All amenities grid ✓", "House rules ✓", "Booking CTA card ✓", "Similar PGs section ✓"],
              },
              {
                phase: "Phase 2 · Google Maps",
                color: "bg-violet-50 border-violet-200 text-violet-700",
                dot: "bg-violet-500",
                items: ["Interactive map with PG pin", "Nearby metro / colleges / hospitals", "Commute time from your office", "Street View of neighbourhood", "Radius search from this PG"],
              },
              {
                phase: "Phase 3 · Backend",
                color: "bg-amber-50 border-amber-200 text-amber-700",
                dot: "bg-amber-500",
                items: ["Real-time bed availability", "Owner contact & chat", "Verified tenant reviews", "Online booking & payment", "Virtual tour (360° photos)", "Move-in date picker"],
              },
            ].map((col) => (
              <div key={col.phase} className={`rounded-xl border p-4 ${col.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <p className="text-xs font-bold uppercase tracking-wide">{col.phase}</p>
                </div>
                <ul className="space-y-1.5">
                  {col.items.map((item) => (
                    <li key={item} className="text-xs leading-snug opacity-90">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

import type { RoomType } from "./pgData";

export type BedStatus = "available" | "occupied" | "reserved" | "maintenance";

export interface Bed {
  id: string;
  label: string;   // "Bed A", "Bed B", "Bed C"
  status: BedStatus;
}

export interface Room {
  id: string;
  name: string;    // "Room 101"
  type: RoomType;
  floor: number;
  beds: Bed[];
}

/**
 * Deterministic value 0–100 from a numeric seed.
 * Uses sin so it spreads evenly — no Math.random() (stable on server).
 */
function seeded(seed: number): number {
  return Math.abs(Math.sin(seed + 1) * 10000 % 100);
}

function derivedStatus(seed: number, occupancy: number): BedStatus {
  const v = seeded(seed);
  if (v < occupancy - 6) return "occupied";
  if (v < occupancy)     return "reserved";
  if (v > 96)            return "maintenance";
  return "available";
}

/**
 * Generates a stable mock room/bed matrix from a PG listing's properties.
 * Replace with a DB read (e.g. SELECT * FROM rooms WHERE pg_id = X) when backend is ready.
 * Owner writes status via API → DB; tenants read it on page load. No WebSocket needed.
 *
 * Room layout:
 * - 3 Single rooms, 2 Double rooms, 2 Triple rooms (whichever types the PG offers)
 * - Floors: rooms 101–105 = Floor 1, 106–110 = Floor 2, etc.
 */
export function generateMockRooms(pg: {
  id: string;
  roomTypes: RoomType[];
  occupancy: number;
}): Room[] {
  const ROOM_COUNTS: Record<RoomType, number> = { Single: 3, Double: 2, Triple: 2 };
  const BEDS_PER_TYPE: Record<RoomType, number> = { Single: 1, Double: 2, Triple: 3 };

  const rooms: Room[] = [];
  let counter = 101;
  const pgSeed = parseInt(pg.id, 10) * 1000;

  for (const type of pg.roomTypes) {
    const count = ROOM_COUNTS[type];
    const bedCount = BEDS_PER_TYPE[type];

    for (let r = 0; r < count; r++) {
      const roomId = `${pg.id}-${counter}`;
      const floor = Math.floor((counter - 101) / 5) + 1;

      const beds: Bed[] = Array.from({ length: bedCount }, (_, b) => ({
        id: `${roomId}-${b}`,
        label: `Bed ${String.fromCharCode(65 + b)}`,
        status: derivedStatus(pgSeed + counter * 10 + b, pg.occupancy),
      }));

      rooms.push({ id: roomId, name: `Room ${counter}`, type, floor, beds });
      counter++;
    }
  }

  return rooms;
}

export const STATUS_META: Record<BedStatus, { label: string; bg: string; text: string; dot: string }> = {
  available:   { label: "Available",   bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  occupied:    { label: "Occupied",    bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-500"     },
  reserved:    { label: "Reserved",    bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400"   },
  maintenance: { label: "Maintenance", bg: "bg-[color:var(--background)]",   text: "text-slate-500",   dot: "bg-slate-400"   },
};

export const BED_STATUSES: BedStatus[] = ["available", "occupied", "reserved", "maintenance"];

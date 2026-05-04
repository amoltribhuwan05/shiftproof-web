import type { RoomType } from "./pgData";

// ─── Price range filter ───────────────────────────────────────────────────────

export const PRICE_MIN  = 3000;
export const PRICE_MAX  = 50000;
export const PRICE_STEP = 100;

// ─── IP geolocation city aliases ─────────────────────────────────────────────
// Maps alternate names returned by ipapi.co to canonical city names in pgData

export const CITY_ALIASES: Record<string, string> = {
  "Bengaluru":   "Bangalore",
  "Bengalooru":  "Bangalore",
  "Bombay":      "Mumbai",
  "Navi Mumbai": "Mumbai",
  "Thane":       "Mumbai",
  "Vasai":       "Mumbai",
  "Kalyan":      "Mumbai",
  "Calcutta":    "Kolkata",
  "Madras":      "Chennai",
  "Delhi":       "Noida",
  "New Delhi":   "Noida",
  "Gurugram":    "Noida",
  "Gurgaon":     "Noida",
  "Faridabad":   "Noida",
  "Secunderabad": "Hyderabad",
  "Cyberabad":   "Hyderabad",
};

// Centre coordinates for each supported city — used to find nearest city from GPS coords
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Pune":      { lat: 18.5204, lng: 73.8567 },
  "Chennai":   { lat: 13.0827, lng: 80.2707 },
  "Kolkata":   { lat: 22.5726, lng: 88.3639 },
  "Mumbai":    { lat: 19.0760, lng: 72.8777 },
  "Noida":     { lat: 28.5355, lng: 77.3910 },
  "Delhi NCR": { lat: 28.6139, lng: 77.2090 },
};

// Maps ipapi.co region names to nearest supported city when the user's city isn't in allCities
export const REGION_ALIASES: Record<string, string> = {
  "Maharashtra":       "Mumbai",
  "Karnataka":         "Bangalore",
  "Telangana":         "Hyderabad",
  "Andhra Pradesh":    "Hyderabad",
  "Tamil Nadu":        "Chennai",
  "West Bengal":       "Kolkata",
  "Uttar Pradesh":     "Noida",
  "Haryana":           "Noida",
  "Delhi":             "Noida",
};

// ─── Amenity icons ────────────────────────────────────────────────────────────
// Shared between FindPGClient (listing cards) and PGDetailClient (detail page)

export const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>
    </svg>
  ),
  AC: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="6" width="20" height="8" rx="2"/>
      <path d="M6 14v4M10 14v4M14 14v4M18 14v4M8 10h.01M12 10h.01"/>
    </svg>
  ),
  Meals: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
    </svg>
  ),
  Laundry: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="2" width="20" height="20" rx="2"/>
      <circle cx="12" cy="13" r="4"/>
      <path d="M5 6h.01M8 6h.01"/>
    </svg>
  ),
  Parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 17V7h4a3 3 0 010 6H9"/>
    </svg>
  ),
  CCTV: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M23 7l-7 5 7 5V7z"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  Gym: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6.5 6.5h.01M17.5 6.5h.01M6.5 17.5h.01M17.5 17.5h.01M6.5 12h11M3 12H1M23 12h-2"/>
      <rect x="5" y="4" width="3" height="16" rx="1"/>
      <rect x="16" y="4" width="3" height="16" rx="1"/>
    </svg>
  ),
  "Power Backup": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  "Hot Water": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  ),
  TV: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
};

// ─── Room type descriptions ───────────────────────────────────────────────────

export const ROOM_DESCRIPTIONS: Record<RoomType, string> = {
  Single: "Private room, independent bathroom",
  Double: "Shared with 1 flatmate, attached bathroom",
  Triple: "Shared with 2 flatmates, common bathroom",
};

// ─── Room pricing multipliers (applied to base price) ────────────────────────

export const ROOM_PRICE_MULTIPLIER: Record<RoomType, number> = {
  Single: 1.35,
  Double: 1.0,
  Triple: 0.75,
};

// ─── House rules (default set shown when owner has not set custom rules) ──────

export const DEFAULT_HOUSE_RULES: string[] = [
  "No smoking inside the premises",
  "Guests allowed until 9 PM only",
  "Maintain cleanliness in common areas",
  "No loud music after 10 PM",
  "Rent due by the 5th of every month",
  "2-month notice period before vacating",
];

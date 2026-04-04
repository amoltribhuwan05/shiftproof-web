// Unsplash placeholder images — replace with real PG photos in production
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&h=420&fit=crop&q=80`;
const EXT = [
  u("1560448204-e02f11c3d0e2"), // modern apartment building
  u("1486325212027-8081e485255e"), // apartment complex
  u("1512917774080-9991f1c4c750"), // luxury building
];
const INT = [
  u("1522708323590-d24dbb6b0267"), // modern studio
  u("1631049307264-da0ec9d70304"), // bedroom
  u("1540518614846-7eded433c457"), // bedroom with desk
  u("1555041469-a586c61ea9bc"),    // bright living room
  u("1484154218962-a197022b5858"), // kitchen / dining
  u("1598928506311-c55ded91a20c"), // apartment room
];

export type Amenity =
  | "WiFi"
  | "AC"
  | "Meals"
  | "Laundry"
  | "Parking"
  | "CCTV"
  | "Gym"
  | "Power Backup"
  | "Hot Water"
  | "TV";

export type Gender = "Male" | "Female" | "Mixed";
export type RoomType = "Single" | "Double" | "Triple";

export interface PGListing {
  id: string;
  name: string;
  locality: string;       // sub-area within city, e.g. "Koramangala"
  location: string;       // full display string, e.g. "Koramangala, Bangalore"
  city: string;
  price: number;          // per month, starting from
  rating: number;         // 1–5
  reviews: number;
  gender: Gender;
  roomTypes: RoomType[];
  amenities: Amenity[];
  gradient: string;       // Tailwind gradient classes for placeholder image
  badge?: string;         // e.g. "New", "Popular"
  occupancy: number;      // % occupied
  distanceFromMetro: string;
  lat: number;            // approximate latitude of the locality
  lng: number;            // approximate longitude of the locality
  images: string[];       // Unsplash photo URLs (3 per listing); replace with real photos in production
  description: string;   // 2–3 sentence property overview
}

export const pgListings: PGListing[] = [
  {
    id: "1",
    name: "Green Valley PG",
    locality: "Koramangala",
    location: "Koramangala, Bangalore",
    city: "Bangalore",
    price: 8500,
    rating: 4.8,
    reviews: 124,
    gender: "Mixed",
    roomTypes: ["Single", "Double"],
    amenities: ["WiFi", "AC", "Meals", "Laundry", "CCTV", "Power Backup"],
    gradient: "from-emerald-500 to-teal-600",
    badge: "Popular",
    occupancy: 92,
    distanceFromMetro: "0.4 km",
    lat: 12.9279, lng: 77.6271,
    images: [EXT[0], INT[0], INT[1]],
    description: "A premium co-living space in the heart of Koramangala, Bangalore's most vibrant tech neighbourhood. Green Valley offers spacious rooms with modern furnishings, round-the-clock security, and a community that feels like home. Walking distance to top cafes, restaurants, and the Koramangala metro station.",
  },
  {
    id: "2",
    name: "Sunrise Ladies PG",
    locality: "Banjara Hills",
    location: "Banjara Hills, Hyderabad",
    city: "Hyderabad",
    price: 7000,
    rating: 4.6,
    reviews: 89,
    gender: "Female",
    roomTypes: ["Single", "Double", "Triple"],
    amenities: ["WiFi", "Meals", "Laundry", "Hot Water", "CCTV"],
    gradient: "from-pink-500 to-rose-600",
    badge: "New",
    occupancy: 75,
    distanceFromMetro: "1.2 km",
    lat: 17.4156, lng: 78.4347,
    images: [EXT[1], INT[2], INT[3]],
    description: "Exclusively for women, Sunrise Ladies PG is a safe and serene haven in upscale Banjara Hills. Known for home-cooked meals, friendly staff, and a supportive community, it is the top choice for working women and students in Hyderabad. The locality offers easy access to major IT hubs and public transport.",
  },
  {
    id: "3",
    name: "Elite Nest PG",
    locality: "Hinjewadi",
    location: "Hinjewadi, Pune",
    city: "Pune",
    price: 9500,
    rating: 4.9,
    reviews: 201,
    gender: "Male",
    roomTypes: ["Single", "Double"],
    amenities: ["WiFi", "AC", "Gym", "Parking", "Power Backup", "Hot Water"],
    gradient: "from-violet-500 to-indigo-600",
    badge: "Top Rated",
    occupancy: 98,
    distanceFromMetro: "0.8 km",
    lat: 18.5912, lng: 73.7389,
    images: [EXT[2], INT[0], INT[2]],
    description: "Hinjewadi's top-rated PG, Elite Nest is built for IT professionals working in Pune's largest tech park. Premium amenities — fully-equipped gym, AC rooms, and dedicated parking — set it apart from the rest. With 98% occupancy, it is in high demand; book early to secure your spot.",
  },
  {
    id: "4",
    name: "Royal Comfort PG",
    locality: "Velachery",
    location: "Velachery, Chennai",
    city: "Chennai",
    price: 6500,
    rating: 4.4,
    reviews: 67,
    gender: "Mixed",
    roomTypes: ["Double", "Triple"],
    amenities: ["WiFi", "Meals", "TV", "Power Backup", "Hot Water"],
    gradient: "from-orange-500 to-amber-600",
    occupancy: 60,
    distanceFromMetro: "1.8 km",
    lat: 12.9752, lng: 80.2209,
    images: [EXT[0], INT[4], INT[5]],
    description: "A well-maintained co-living space in Velachery, one of Chennai's most connected neighbourhoods. Royal Comfort offers comfortable rooms with home-cooked meals and easy access to both the IT corridor and Chennai's MRTS. Ideal for professionals seeking an affordable and comfortable stay.",
  },
  {
    id: "5",
    name: "Metro Stay PG",
    locality: "Salt Lake",
    location: "Salt Lake, Kolkata",
    city: "Kolkata",
    price: 5500,
    rating: 4.3,
    reviews: 45,
    gender: "Male",
    roomTypes: ["Single", "Double", "Triple"],
    amenities: ["WiFi", "Laundry", "TV", "Hot Water"],
    gradient: "from-blue-500 to-cyan-600",
    occupancy: 55,
    distanceFromMetro: "0.2 km",
    lat: 22.5800, lng: 88.4142,
    images: [EXT[1], INT[1], INT[5]],
    description: "Located steps from Salt Lake's metro station, Metro Stay is the most accessible budget PG in Kolkata's premier IT and business district. Practical, clean, and well-connected — a smart choice for students and young professionals who prioritise commute over luxury.",
  },
  {
    id: "6",
    name: "Shree Sai PG",
    locality: "Andheri West",
    location: "Andheri West, Mumbai",
    city: "Mumbai",
    price: 12000,
    rating: 4.7,
    reviews: 158,
    gender: "Female",
    roomTypes: ["Single", "Double"],
    amenities: ["WiFi", "AC", "Meals", "Laundry", "CCTV", "Power Backup", "Gym"],
    gradient: "from-fuchsia-500 to-purple-600",
    badge: "Popular",
    occupancy: 95,
    distanceFromMetro: "0.6 km",
    lat: 19.1362, lng: 72.8264,
    images: [EXT[2], INT[3], INT[0]],
    description: "A premium ladies-only PG in the heart of Andheri West, Mumbai's entertainment and business hub. Shree Sai offers a secure, modern environment with gym, meals, and 24/7 CCTV — everything a working woman needs in one place. One of Mumbai's highest-rated PGs with 95% occupancy.",
  },
  {
    id: "7",
    name: "Urban Nest PG",
    locality: "Whitefield",
    location: "Whitefield, Bangalore",
    city: "Bangalore",
    price: 7500,
    rating: 4.5,
    reviews: 93,
    gender: "Mixed",
    roomTypes: ["Single", "Double"],
    amenities: ["WiFi", "AC", "Parking", "CCTV", "Hot Water", "Power Backup"],
    gradient: "from-sky-500 to-blue-600",
    occupancy: 80,
    distanceFromMetro: "2.1 km",
    lat: 12.9698, lng: 77.7500,
    images: [EXT[0], INT[1], INT[4]],
    description: "Set in Whitefield, Bangalore's rapidly expanding IT suburb, Urban Nest offers a modern co-living experience with high-speed WiFi, AC rooms, and dedicated parking. Perfect for professionals at Whitefield tech parks who want comfort without the Koramangala price tag.",
  },
  {
    id: "8",
    name: "Horizon PG",
    locality: "Madhapur",
    location: "Madhapur, Hyderabad",
    city: "Hyderabad",
    price: 8000,
    rating: 4.6,
    reviews: 112,
    gender: "Male",
    roomTypes: ["Single", "Double", "Triple"],
    amenities: ["WiFi", "Meals", "AC", "Laundry", "TV", "Hot Water"],
    gradient: "from-lime-500 to-green-600",
    badge: "New",
    occupancy: 70,
    distanceFromMetro: "0.9 km",
    lat: 17.4486, lng: 78.3908,
    images: [EXT[1], INT[5], INT[2]],
    description: "Strategically located in Madhapur, the heart of Hyderabad's HITEC City, Horizon PG offers premium accommodation for IT professionals. Fully air-conditioned rooms, daily meal service, and a vibrant flatmate community make this a top pick for new joiners at top tech companies.",
  },
  {
    id: "9",
    name: "Patel Residency",
    locality: "Borivali",
    location: "Borivali, Mumbai",
    city: "Mumbai",
    price: 9000,
    rating: 4.2,
    reviews: 34,
    gender: "Male",
    roomTypes: ["Double", "Triple"],
    amenities: ["WiFi", "Meals", "Power Backup", "Parking"],
    gradient: "from-red-500 to-orange-600",
    occupancy: 65,
    distanceFromMetro: "1.5 km",
    lat: 19.2294, lng: 72.8566,
    images: [EXT[2], INT[4], INT[1]],
    description: "An affordable, no-frills PG in Borivali, one of Mumbai's most accessible western suburbs. Patel Residency offers home-cooked meals, reliable power backup, and easy access to Borivali station — making it the practical choice for budget-conscious professionals on the western line.",
  },
  {
    id: "10",
    name: "Comfort Zone PG",
    locality: "Wakad",
    location: "Wakad, Pune",
    city: "Pune",
    price: 6000,
    rating: 4.4,
    reviews: 78,
    gender: "Female",
    roomTypes: ["Single", "Double", "Triple"],
    amenities: ["WiFi", "Meals", "Laundry", "Hot Water", "CCTV"],
    gradient: "from-teal-500 to-emerald-600",
    occupancy: 85,
    distanceFromMetro: "3.0 km",
    lat: 18.5985, lng: 73.7610,
    images: [EXT[0], INT[3], INT[5]],
    description: "A women-friendly PG in Wakad, Pune's fast-growing residential and tech hub near Hinjewadi. Comfort Zone offers hygienic meals, laundry service, and a safe community environment at budget-friendly prices — ideal for women professionals who want comfort without compromise.",
  },
  {
    id: "11",
    name: "Prime Residency",
    locality: "Anna Nagar",
    location: "Anna Nagar, Chennai",
    city: "Chennai",
    price: 7200,
    rating: 4.7,
    reviews: 141,
    gender: "Mixed",
    roomTypes: ["Single", "Double"],
    amenities: ["WiFi", "AC", "Gym", "Parking", "CCTV", "Hot Water", "Power Backup"],
    gradient: "from-indigo-500 to-violet-600",
    badge: "Top Rated",
    occupancy: 90,
    distanceFromMetro: "1.1 km",
    lat: 13.0850, lng: 80.2101,
    images: [EXT[1], INT[0], INT[3]],
    description: "Anna Nagar's most sought-after co-living space, Prime Residency blends premium lifestyle with prime location. A fully-equipped gym, covered parking, and lightning-fast internet attract Chennai's top professionals. Centrally located with easy access to hospitals, schools, and major IT companies.",
  },
  {
    id: "12",
    name: "Golden Gate PG",
    locality: "Sector 62",
    location: "Sector 62, Noida",
    city: "Noida",
    price: 8800,
    rating: 4.5,
    reviews: 66,
    gender: "Male",
    roomTypes: ["Single", "Double"],
    amenities: ["WiFi", "AC", "Meals", "Power Backup", "Parking", "Laundry"],
    gradient: "from-yellow-500 to-orange-500",
    occupancy: 78,
    distanceFromMetro: "0.5 km",
    lat: 28.6271, lng: 77.3649,
    images: [EXT[2], INT[2], INT[4]],
    description: "A well-equipped PG for working professionals in Sector 62, Noida's thriving IT corridor. Golden Gate offers AC rooms, meal services, and dedicated parking, with seamless metro connectivity to Delhi NCR — making long commutes a thing of the past.",
  },
];

export const allCities = [...new Set(pgListings.map((p) => p.city))].sort();

/** All unique localities across all listings, sorted A–Z */
export const allLocalities = [...new Set(pgListings.map((p) => p.locality))].sort();

/** Localities available within a given city (or all if city === "All") */
export function localitiesForCity(city: string): string[] {
  if (city === "All") return allLocalities;
  return [...new Set(pgListings.filter((p) => p.city === city).map((p) => p.locality))].sort();
}

export const allAmenities: Amenity[] = [
  "WiFi", "AC", "Meals", "Laundry", "Parking",
  "CCTV", "Gym", "Power Backup", "Hot Water", "TV",
];

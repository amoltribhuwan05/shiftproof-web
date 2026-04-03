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
  location: string;
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
}

export const pgListings: PGListing[] = [
  {
    id: "1",
    name: "Green Valley PG",
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
  },
  {
    id: "2",
    name: "Sunrise Ladies PG",
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
  },
  {
    id: "3",
    name: "Elite Nest PG",
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
  },
  {
    id: "4",
    name: "Royal Comfort PG",
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
  },
  {
    id: "5",
    name: "Metro Stay PG",
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
  },
  {
    id: "6",
    name: "Shree Sai PG",
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
  },
  {
    id: "7",
    name: "Urban Nest PG",
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
  },
  {
    id: "8",
    name: "Horizon PG",
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
  },
  {
    id: "9",
    name: "Patel Residency",
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
  },
  {
    id: "10",
    name: "Comfort Zone PG",
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
  },
  {
    id: "11",
    name: "Prime Residency",
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
  },
  {
    id: "12",
    name: "Golden Gate PG",
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
  },
];

export const allCities = [...new Set(pgListings.map((p) => p.city))].sort();
export const allAmenities: Amenity[] = [
  "WiFi", "AC", "Meals", "Laundry", "Parking",
  "CCTV", "Gym", "Power Backup", "Hot Water", "TV",
];

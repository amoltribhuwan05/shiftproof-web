import type { Organization } from "@/lib/orgTypes";

export const MOCK_ORGS: Organization[] = [
  {
    id: "org1",
    name: "Ravi Kumar Properties",
    type: "individual",
    address: "17, 5th Block, Koramangala",
    city: "Bangalore",
    phone: "+91 98765 00001",
    email: "ravi@ravikumarproperties.in",
    gstin: "29ABCDE1234F1Z5",
    website: "https://ravikumarproperties.in",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&h=80&fit=crop&auto=format",
    createdAt: "2024-01-15",
    logoInitials: "RK",
    plan: "growth",
    propertyIds: ["p1", "p2", "p3"],
    ownerId: "o1",
    members: [
      { id: "m1", userId: "m1", name: "Ravi Kumar", email: "ravi@ravikumarproperties.in", avatarUrl: "", role: "owner", assignedProperties: [], status: "active", joinedAt: "2024-01-15" },
      { id: "m2", userId: "m2", name: "Sunita Devi", email: "sunita@ravikumarproperties.in", avatarUrl: "", role: "manager", assignedProperties: ["p1", "p2"], status: "active", joinedAt: "2024-02-01" },
      { id: "m3", userId: "m3", name: "Ramu Electrician", email: "ramu@gmail.com", avatarUrl: "", role: "caretaker", assignedProperties: ["p1"], status: "active", joinedAt: "2024-03-10" },
      { id: "m4", userId: "m4", name: "Pradeep Shetty", email: "pradeep.ca@gmail.com", avatarUrl: "", role: "accountant", assignedProperties: [], status: "active", joinedAt: "2026-04-18" },
    ],
  },
  {
    id: "org2",
    name: "Nova Stays Pvt Ltd",
    type: "company",
    address: "91, Residency Road",
    city: "Bangalore",
    phone: "+91 80 4523 9900",
    email: "ops@novastays.in",
    gstin: "29AACCN1234L1Z9",
    cin: "U55101KA2023PTC000123",
    website: "https://novastays.in",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop&auto=format",
    createdAt: "2023-08-20",
    logoInitials: "NS",
    plan: "enterprise",
    propertyIds: ["p2", "p3"],
    ownerId: "o2",
    members: [
      { id: "m5", userId: "m5", name: "Vikram Nair", email: "vikram@novastays.in", avatarUrl: "", role: "owner", assignedProperties: [], status: "active", joinedAt: "2023-08-20" },
      { id: "m6", userId: "m6", name: "Deepa Menon", email: "deepa@novastays.in", avatarUrl: "", role: "admin", assignedProperties: [], status: "active", joinedAt: "2023-09-01" },
      { id: "m7", userId: "m7", name: "Rahul Ops", email: "rahul.ops@novastays.in", avatarUrl: "", role: "manager", assignedProperties: ["p2"], status: "active", joinedAt: "2023-09-15" },
      { id: "m8", userId: "m8", name: "Accounts Team", email: "accounts@novastays.in", avatarUrl: "", role: "accountant", assignedProperties: [], status: "active", joinedAt: "2024-01-01" },
    ],
  },
];

/** The org linked to the currently logged-in demo owner (Ravi Kumar) */
export const CURRENT_ORG = MOCK_ORGS[0];

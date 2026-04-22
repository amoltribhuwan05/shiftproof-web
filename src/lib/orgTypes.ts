export type OrgType = "individual" | "firm" | "company";
export type OrgRole = "owner" | "admin" | "manager" | "accountant" | "caretaker";
export type OrgMemberStatus = "active" | "invited" | "inactive";
export type PlanTier = "solo" | "growth" | "enterprise";

export interface OrgPermissions {
  viewPayments: boolean;
  editProperties: boolean;
  manageTenants: boolean;
  viewReports: boolean;
  manageMembers: boolean;
  billingAccess: boolean;
}

export const ROLE_PERMISSIONS: Record<OrgRole, OrgPermissions> = {
  owner:      { viewPayments: true,  editProperties: true,  manageTenants: true,  viewReports: true,  manageMembers: true,  billingAccess: true  },
  admin:      { viewPayments: true,  editProperties: true,  manageTenants: true,  viewReports: true,  manageMembers: true,  billingAccess: false },
  manager:    { viewPayments: true,  editProperties: false, manageTenants: true,  viewReports: true,  manageMembers: false, billingAccess: false },
  accountant: { viewPayments: true,  editProperties: false, manageTenants: false, viewReports: true,  manageMembers: false, billingAccess: false },
  caretaker:  { viewPayments: false, editProperties: false, manageTenants: false, viewReports: false, manageMembers: false, billingAccess: false },
};

export const PLAN_LIMITS: Record<PlanTier, { maxMembers: number; maxProperties: number; label: string }> = {
  solo:       { maxMembers: 1,   maxProperties: 1,   label: "Solo"       },
  growth:     { maxMembers: 5,   maxProperties: 5,   label: "Growth"     },
  enterprise: { maxMembers: 999, maxProperties: 999, label: "Enterprise" },
};

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: OrgRole;
  /** empty array = access to all org properties */
  assignedProperties: string[];
  status: OrgMemberStatus;
  joinedAt: string;
  /** ISO string; only present when status === "invited" */
  invitedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  gstin?: string;
  cin?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  logoInitials: string;
  /** Optional brand image URL — shown instead of initials when present */
  image?: string;
  plan: PlanTier;
  /** property IDs belonging to this org */
  propertyIds: string[];
  members: OrgMember[];
  /** user ID of the founding owner — must always have ≥1 member with role "owner" */
  ownerId: string;
  createdAt: string;
}

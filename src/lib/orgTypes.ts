export type OrgRole = "owner" | "admin" | "manager" | "accountant" | "caretaker";

export type OrgMemberStatus = "active" | "inactive" | "invited" | "suspended";

export type OrgMember = {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  assignedProperties: string[];
  status: OrgMemberStatus;
  joinedAt: string;
  invitedAt?: string;
  avatarUrl?: string;
  userId?: string;
};

export type OrganizationType = "individual" | "firm" | "company";
export type OrganizationPlan = "solo" | "growth" | "enterprise";

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  address: string;
  city: string;
  phone: string;
  email: string;
  gstin?: string;
  cin?: string;
  website?: string;
  image?: string;
  logoInitials: string;
  plan: OrganizationPlan;
  propertyIds: string[];
  ownerId: string;
  createdAt: string;
  members: OrgMember[];
};

export type AddOrgMemberRequest = {
  userId: string;
  role: OrgRole;
};

export const ORG_ROLE_LABEL: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  accountant: "Accountant",
  caretaker: "Caretaker",
};

export type OrgPermissions = {
  viewPayments: boolean;
  editProperties: boolean;
  manageTenants: boolean;
  viewReports: boolean;
  manageMembers: boolean;
  billingAccess: boolean;
};

export const ROLE_PERMISSIONS: Record<OrgRole, OrgPermissions> = {
  owner: { viewPayments: true, editProperties: true, manageTenants: true, viewReports: true, manageMembers: true, billingAccess: true },
  admin: { viewPayments: true, editProperties: true, manageTenants: true, viewReports: true, manageMembers: true, billingAccess: false },
  manager: { viewPayments: true, editProperties: true, manageTenants: true, viewReports: true, manageMembers: false, billingAccess: false },
  accountant: { viewPayments: true, editProperties: false, manageTenants: false, viewReports: true, manageMembers: false, billingAccess: true },
  caretaker: { viewPayments: false, editProperties: false, manageTenants: true, viewReports: false, manageMembers: false, billingAccess: false },
};

export type PlanTier = OrganizationPlan;

export const PLAN_LIMITS: Record<PlanTier, { maxMembers: number; maxProperties: number; label: string }> = {
  solo: { maxMembers: 1, maxProperties: 1, label: "Solo" },
  growth: { maxMembers: 5, maxProperties: 10, label: "Growth" },
  enterprise: { maxMembers: 999, maxProperties: 999, label: "Enterprise" },
};

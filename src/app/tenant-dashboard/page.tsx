import type { Metadata } from "next";
import TenantDashboardClient from "./TenantDashboardClient";

export const metadata: Metadata = {
  title: "Tenant Dashboard — ShiftProof",
  description: "View your room, track rent payments, and manage maintenance requests.",
};

export default function TenantDashboardPage() {
  return <TenantDashboardClient />;
}

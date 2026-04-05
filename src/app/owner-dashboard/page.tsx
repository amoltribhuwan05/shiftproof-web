import type { Metadata } from "next";
import OwnerDashboardClient from "./OwnerDashboardClient";

export const metadata: Metadata = {
  title: "Owner Dashboard — ShiftProof",
  description: "Manage your properties, track revenue, and monitor tenants.",
};

export default function OwnerDashboardPage() {
  return <OwnerDashboardClient />;
}

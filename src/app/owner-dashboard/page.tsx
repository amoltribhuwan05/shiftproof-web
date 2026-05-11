import type { Metadata } from "next";
import { Suspense } from "react";
import OwnerDashboardClient from "./OwnerDashboardClient";

export const metadata: Metadata = {
  title: "Owner Dashboard — ShiftProof",
  description: "Manage your properties, track revenue, and monitor tenants.",
};

export default function OwnerDashboardPage() {
  return (
    <Suspense>
      <OwnerDashboardClient />
    </Suspense>
  );
}

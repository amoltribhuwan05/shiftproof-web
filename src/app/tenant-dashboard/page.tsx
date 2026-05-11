import type { Metadata } from "next";
import { Suspense } from "react";
import TenantDashboardClient from "./TenantDashboardClient";

export const metadata: Metadata = {
  title: "Tenant Dashboard — ShiftProof",
  description: "View your room, track rent payments, and manage maintenance requests.",
};

export default function TenantDashboardPage() {
  return (
    <Suspense>
      <TenantDashboardClient />
    </Suspense>
  );
}

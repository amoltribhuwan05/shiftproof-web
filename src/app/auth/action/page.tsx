import type { Metadata } from "next";
import { Suspense } from "react";
import ActionHandler from "./ActionHandler";

export const metadata: Metadata = {
  title: "Account action — ShiftProof",
};

export default function AuthActionPage() {
  return (
    <Suspense fallback={null}>
      <ActionHandler />
    </Suspense>
  );
}

import type { Metadata } from "next";
import FindPGClient from "./FindPGClient";

export const metadata: Metadata = {
  title: "Find a PG — ShiftProof",
  description:
    "Browse verified PG accommodations across Bangalore, Hyderabad, Mumbai, Pune, Chennai, Kolkata and more. Filter by city, gender, amenities, and price.",
};

export default function FindPGPage() {
  return <FindPGClient />;
}

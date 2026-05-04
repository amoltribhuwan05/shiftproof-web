import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import type { Property, Paginated } from "@/lib/api/types";
import PGDetailClient from "./PGDetailClient";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const pg = await apiFetch<Property>(`/api/v1/public/properties/${id}`);
    if (!pg) return { title: "PG Not Found — ShiftProof" };
    return {
      title: `${pg.title} in ${pg.location} — ShiftProof`,
      description: pg.description,
    };
  } catch {
    return { title: "PG Not Found — ShiftProof" };
  }
}

export default async function PGDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const pg = await apiFetch<Property>(`/api/v1/public/properties/${id}`);
    if (!pg) notFound();

    // Fetch similar properties in same city
    const res = await apiFetch<Paginated<Property>>(`/api/v1/public/properties?city=${pg.city}&limit=5`);
    const similar = (res.data || []).filter((p) => p.id !== pg.id).slice(0, 4);

    return <PGDetailClient pg={pg} similar={similar} />;
  } catch (err) {
    notFound();
  }
}

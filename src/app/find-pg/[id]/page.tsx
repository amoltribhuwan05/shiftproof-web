import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pgListings } from "@/lib/pgData";
import PGDetailClient from "./PGDetailClient";

export async function generateStaticParams() {
  return pgListings.map((pg) => ({ id: pg.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const pg = pgListings.find((p) => p.id === id);
  if (!pg) return { title: "PG Not Found — ShiftProof" };
  return {
    title: `${pg.name} in ${pg.location} — ShiftProof`,
    description: pg.description,
  };
}

export default async function PGDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pg = pgListings.find((p) => p.id === id);
  if (!pg) notFound();

  const similar = pgListings
    .filter((p) => p.id !== pg.id && p.city === pg.city)
    .slice(0, 4);

  return <PGDetailClient pg={pg} similar={similar} />;
}

/**
 * Mock API catch-all route — handles every /api/v1/* request in local development.
 *
 * Used automatically when NEXT_PUBLIC_API_URL is unset (.env has no value).
 * When NEXT_PUBLIC_API_URL is set the browser calls the real API directly and
 * this route is never hit.
 */
import { NextRequest } from "next/server";
import { handleMockApiRoute } from "@/lib/mockApi";

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

async function run(req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  return handleMockApiRoute(req, slug);
}

export const GET    = (req: NextRequest, ctx: RouteContext) => run(req, ctx);
export const POST   = (req: NextRequest, ctx: RouteContext) => run(req, ctx);
export const PUT    = (req: NextRequest, ctx: RouteContext) => run(req, ctx);
export const PATCH  = (req: NextRequest, ctx: RouteContext) => run(req, ctx);
export const DELETE = (req: NextRequest, ctx: RouteContext) => run(req, ctx);

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [], // Match nothing, we just need the file to exist as edge runtime
};

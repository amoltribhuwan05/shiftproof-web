import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/users";

function parseRole(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as { role?: string };
    return typeof s.role === "string" ? s.role : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = req.cookies.get(SESSION_COOKIE);
  const role = parseRole(session?.value);

  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based cross-access prevention
  if (pathname.startsWith("/owner-dashboard") && role !== "owner") {
    return NextResponse.redirect(new URL("/tenant-dashboard", req.url));
  }
  if (pathname.startsWith("/tenant-dashboard") && role !== "tenant") {
    return NextResponse.redirect(new URL("/owner-dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner-dashboard/:path*", "/tenant-dashboard/:path*"],
};

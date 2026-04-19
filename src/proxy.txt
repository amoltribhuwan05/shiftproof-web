import { NextRequest, NextResponse } from "next/server";
import { parseSession, SESSION_COOKIE } from "@/lib/users";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const session = parseSession(raw);

  // Redirect logged-in users away from /login
  if (pathname.startsWith("/login")) {
    if (session) {
      const dest = session.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // Protect owner dashboard
  if (pathname.startsWith("/owner-dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?next=/owner-dashboard", req.url));
    }
    if (session.role !== "owner") {
      return NextResponse.redirect(new URL("/tenant-dashboard", req.url));
    }
  }

  // Protect tenant dashboard
  if (pathname.startsWith("/tenant-dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?next=/tenant-dashboard", req.url));
    }
    if (session.role !== "tenant") {
      return NextResponse.redirect(new URL("/owner-dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/owner-dashboard/:path*", "/tenant-dashboard/:path*"],
};

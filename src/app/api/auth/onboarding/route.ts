import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, parseSession } from "@/lib/users";
import type { AppUser } from "@/lib/api/types";

export async function POST(req: NextRequest) {
  const cookieValue = req.cookies.get(SESSION_COOKIE)?.value;
  const authHeader   = req.headers.get("authorization");

  // Accept either a session cookie (returning users / already-onboarded) or a
  // Firebase Bearer token. New phone/Google users land here before a session
  // cookie has been established, so the Bearer token is their only credential.
  if (!cookieValue && !authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = cookieValue ? parseSession(cookieValue) : null;
  if (!session && !authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, gender, phoneNumber, city, area, role } = body;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authHeader)   headers["Authorization"] = authHeader;
  else if (cookieValue) headers["Cookie"]    = `${SESSION_COOKIE}=${cookieValue}`;

  const apiRes = await fetch(`${apiBase}/api/v1/auth/onboarding/complete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, gender, phoneNumber, city, area, role }),
  });

  const data = await apiRes.json().catch(() => ({}));

  if (!apiRes.ok) {
    return NextResponse.json({ error: data.error ?? "Onboarding failed" }, { status: apiRes.status });
  }

  // Build updated session — merge into existing session if present, otherwise
  // create a fresh one from the API response (Bearer-token-only flow).
  const updatedUser = data.user as AppUser;
  const newRole     = updatedUser.roles?.includes("OWNER") ? "owner" : "tenant";

  const updatedSession = session
    ? { ...session, name: updatedUser.name ?? session.name, role: newRole }
    : {
        id:    updatedUser.id    ?? "",
        email: updatedUser.email ?? "",
        name:  updatedUser.name  ?? name ?? "",
        role:  newRole,
      };

  const isSecure = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ success: true, role: newRole });
  res.cookies.set(SESSION_COOKIE, JSON.stringify(updatedSession), {
    httpOnly: true,
    sameSite: "lax",
    secure:   isSecure,
    path:     "/",
    maxAge:   60 * 60 * 24 * 7,
  });

  return res;
}

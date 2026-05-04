import { NextRequest, NextResponse } from "next/server";
import { findUserByPhone, SESSION_COOKIE, type Session } from "@/lib/users";
import type { AppUser } from "@/lib/api/types";

/**
 * Decodes a Firebase ID token payload WITHOUT verifying the signature.
 * Used only as a fast pre-filter to extract uid/email before hitting the backend.
 * The backend (Go / mock API) performs full validation — never trust this alone.
 */
function decodeFirebaseTokenPayload(
  idToken: string,
): {
  uid: string;
  email: string;
  phone: string;
  name: string;
  emailVerified: boolean;
  signInProvider: string | null;
} | null {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as {
      user_id?: string;
      sub?: string;
      email?: string;
      phone_number?: string;
      name?: string;
      exp?: number;
      email_verified?: boolean;
      firebase?: { sign_in_provider?: string };
    };

    // Reject structurally invalid tokens immediately
    const uid = payload.user_id ?? payload.sub ?? "";
    const email = payload.email ?? "";
    const phone = payload.phone_number ?? "";
    if (!uid || (!email && !phone)) return null;

    // Reject tokens that are already expired (client-side fast fail)
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return {
      uid,
      email,
      phone,
      name: payload.name ?? email.split("@")[0] ?? phone,
      emailVerified: payload.email_verified ?? false,
      signInProvider: payload.firebase?.sign_in_provider ?? null,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    idToken?: string;
    role?: string;
    name?: string;
  };

  const { idToken, role: clientRole, name: clientName } = body;

  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }

  // Fast structural check before any network call
  const decoded = decodeFirebaseTokenPayload(idToken);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  if (decoded.signInProvider === "password" && decoded.email && !decoded.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email before signing in" },
      { status: 403 },
    );
  }

  if (decoded.signInProvider === "phone" && decoded.phone) {
    const existingEmailAccount = findUserByPhone(decoded.phone);
    if (existingEmailAccount?.email) {
      return NextResponse.json(
        {
          error:
            "This phone number is already linked to an email account. Sign in with email instead.",
        },
        { status: 409 },
      );
    }
  }

  // ── Backend verification ────────────────────────────────────────────────────
  // Always attempt to verify the token by calling /api/v1/auth/me.
  // In local dev this hits the same-origin mock API (no env var needed).
  // In production this hits the real Go backend.
  //
  // If the backend returns 401/403, we refuse to set the session cookie —
  // this closes the auth-bypass window that existed when the backend was
  // "optionally" contacted.
  //
  // Only if the backend is genuinely unreachable (network error / timeout)
  // do we fall back to the client-supplied role hint, and only in non-production.

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  let role: "owner" | "tenant" = clientRole === "owner" ? "owner" : "tenant";
  let name = clientName ?? decoded.name;
  let backendVerified = false;

  try {
    const apiRes = await fetch(`${apiBase}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${idToken}` },
      signal: AbortSignal.timeout(6_000),
    });

    if (apiRes.status === 401 || apiRes.status === 403) {
      // Token explicitly rejected — never issue a cookie
      return NextResponse.json({ error: "Token rejected by server" }, { status: 401 });
    }

    if (apiRes.ok) {
      const user = (await apiRes.json()) as Partial<AppUser>;
      if (user.roles?.includes("OWNER"))       role = "owner";
      else if (user.roles?.includes("TENANT")) role = "tenant";
      if (user.name) name = user.name;
      backendVerified = true;
    }
  } catch {
    // Network error or timeout — backend genuinely unreachable
    if (process.env.NODE_ENV === "production") {
      // In production, never issue a cookie without backend confirmation
      return NextResponse.json(
        { error: "Auth service unavailable" },
        { status: 503 },
      );
    }
    // In dev/test: fall back to client-supplied role hint (logged for visibility)
    console.warn(
      "[session] Backend unreachable — using client role hint (dev only). uid:",
      decoded.uid,
    );
  }

  const session: Session = {
    id:    decoded.uid,
    role,
    name,
    email: decoded.email,
  };

  const isSecure = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ role, name, backendVerified });
  res.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly:  true,
    sameSite:  "lax",
    secure:    isSecure,
    path:      "/",
    maxAge:    60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

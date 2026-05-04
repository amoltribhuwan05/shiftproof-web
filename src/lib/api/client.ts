import { getAuth } from "firebase/auth";

// ─── Configuration ────────────────────────────────────────────────────────────
//
// Set NEXT_PUBLIC_API_URL in .env to target the real backend:
//   NEXT_PUBLIC_API_URL=https://api.shiftproof.in
//
// Leave it unset to use the built-in Next.js mock API (src/app/api/v1/[...slug]).
//
// All paths in api/index.ts already include the /api/v1/ prefix, so this value
// must be the bare origin only — no trailing slash, no path.
//
const API_ORIGIN: string = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Auth token ───────────────────────────────────────────────────────────────

async function getFirebaseToken(): Promise<string | null> {
  try {
    const user = getAuth().currentUser;
    return user ? user.getIdToken() : null;
  } catch {
    return null;
  }
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

/**
 * Single entry point for every API call in the app.
 *
 * - Automatically attaches the Firebase Bearer token when a user is signed in.
 * - Auto-sets Content-Type: application/json for write requests (POST/PUT/PATCH/DELETE).
 * - Returns null for 204 No Content.
 * - Throws ApiError for any non-2xx response.
 *
 * Usage:
 *   const user = await apiFetch<AppUser>("/api/v1/auth/me");
 *   const prop = await apiFetch<Property>("/api/v1/properties", {
 *     method: "POST",
 *     body: JSON.stringify(payload),
 *   });
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getFirebaseToken();

  const isReadMethod = !init.method || init.method === "GET" || init.method === "HEAD";

  const res = await fetch(`${API_ORIGIN}${path}`, {
    ...init,
    // "same-origin": when API_ORIGIN is "" (mock mode) the request is same-origin
    // so session cookies are sent automatically. For cross-origin production calls
    // the browser never attaches cookies — auth is handled via the Bearer token.
    credentials: "same-origin",
    headers: {
      ...(!isReadMethod ? { "Content-Type": "application/json" } : {}),
      ...(token       ? { Authorization: `Bearer ${token}` }  : {}),
      // Caller-provided headers last so they can override the defaults above.
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 204) return null as T;

  if (!res.ok) {
    let message = res.statusText || `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      if (body.error) message = body.error;
      else if (body.message) message = body.message;
    } catch {
      // body was not JSON — keep statusText
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

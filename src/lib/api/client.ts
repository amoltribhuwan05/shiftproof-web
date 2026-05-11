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
const API_ORIGIN: string = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 15_000;

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

type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
};

// ─── Auth token ───────────────────────────────────────────────────────────────

async function getFirebaseToken(): Promise<string | null> {
  try {
    const auth = getAuth();
    // authStateReady() resolves once Firebase has finished restoring persisted
    // auth state. Without this, currentUser is null on the first call after a
    // page load even though the user is signed in — causing "Jwt is missing".
    await auth.authStateReady();
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
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
  init: ApiFetchOptions = {},
): Promise<T> {
  const token = await getFirebaseToken();
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries, ...fetchInit } = init;

  const isReadMethod = !fetchInit.method || fetchInit.method === "GET" || fetchInit.method === "HEAD";
  const maxAttempts = 1 + (retries ?? (isReadMethod ? 1 : 0));

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const callerSignal = fetchInit.signal;
    const abortFromCaller = () => controller.abort();

    try {
      if (callerSignal?.aborted) controller.abort();
      else callerSignal?.addEventListener("abort", abortFromCaller, { once: true });

      const res = await fetch(`${API_ORIGIN}${path}`, {
        ...fetchInit,
        signal: controller.signal,
        // "same-origin": when API_ORIGIN is "" (mock mode) the request is same-origin
        // so session cookies are sent automatically. For cross-origin production calls
        // the browser never attaches cookies — auth is handled via the Bearer token.
        credentials: "same-origin",
        headers: {
          ...(!isReadMethod ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Caller-provided headers last so they can override the defaults above.
          ...(fetchInit.headers as Record<string, string> | undefined),
        },
      });

      if (res.status === 204) return null as T;

      if (!res.ok) {
        if (isReadMethod && attempt < maxAttempts && (res.status === 408 || res.status >= 500)) {
          continue;
        }

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
    } catch (err) {
      if (attempt < maxAttempts && !(err instanceof ApiError)) continue;
      if (err instanceof ApiError) throw err;
      const message = controller.signal.aborted
        ? "Request timed out"
        : "Network request failed";
      throw new ApiError(0, message);
    } finally {
      clearTimeout(timeout);
      callerSignal?.removeEventListener("abort", abortFromCaller);
    }
  }

  throw new ApiError(0, "Network request failed");
}

/**
 * Like apiFetch but returns a Blob — for binary endpoints (e.g. PDF receipts).
 */
export async function apiFetchBlob(path: string): Promise<Blob> {
  const token = await getFirebaseToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_ORIGIN}${path}`, {
      signal: controller.signal,
      credentials: "same-origin",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let message = res.statusText || `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) message = body.error;
      } catch { /* non-JSON body */ }
      throw new ApiError(res.status, message);
    }
    return res.blob();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, controller.signal.aborted ? "Request timed out" : "Network request failed");
  } finally {
    clearTimeout(timeout);
  }
}

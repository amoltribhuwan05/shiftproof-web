"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api, ApiError } from "@/lib/api";
import type { AppUser } from "@/lib/api/types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  /** true when user has the OWNER role */
  isOwner: boolean;
  /** true when user has the TENANT role */
  isTenant: boolean;
  /** Re-fetch /auth/me — call after profile updates */
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isOwner: false,
  isTenant: false,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const appUser = await api.auth.me();
      setUser(appUser);
    } catch (err) {
      // 401 means the backend doesn't recognise the token yet (e.g. first sign-in
      // race) — clear user so callers can show an appropriate state.
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      }
      // Other errors (network down, 5xx) — keep previous user to avoid logout flicker.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      // Firebase not configured (e.g. env vars missing in CI) — let demo cookie auth work.
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Refresh the ID token (Firebase auto-refreshes it every hour) and
          // write/renew the server-side session cookie so the layout guard passes.
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          if (res.ok) {
            const data = (await res.json()) as { role: string };
            // If the user was redirected to /login (cookie expired / first visit),
            // send them straight to their dashboard without requiring manual sign-in.
            if (window.location.pathname === "/login") {
              const next = new URLSearchParams(window.location.search).get("next");
              router.push(next ?? (data.role === "owner" ? "/owner-dashboard" : "/tenant-dashboard"));
              return;
            }
          }
        } catch {
          // Network error — fall through and try refresh() anyway.
        }
        await refresh();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [refresh, router]);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // best-effort — backend may already have invalidated the token
    }
    if (auth) await signOut(auth);
    // Clear the Next.js session cookie so the middleware redirect fires.
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const isOwner  = user?.roles.includes("OWNER")  ?? false;
  const isTenant = user?.roles.includes("TENANT") ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, isOwner, isTenant, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

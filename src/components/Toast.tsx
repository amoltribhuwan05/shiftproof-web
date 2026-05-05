"use client";

import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef, type ReactNode,
} from "react";
import { Check, X, AlertCircle, Info, AlertTriangle } from "lucide-react";

/* ── types ──────────────────────────────────────────────────────────────────── */

type Variant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id:           string;
  variant:      Variant;
  title:        string;
  description?: string;
}

export interface ToastAPI {
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
}

/* ── context ────────────────────────────────────────────────────────────────── */

const Ctx = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const api = useContext(Ctx);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

/* ── variant config ─────────────────────────────────────────────────────────── */

const VARIANTS: Record<Variant, {
  icon:    React.ElementType;
  iconBg:  string;
  iconCls: string;
  barCls:  string;
}> = {
  success: {
    icon:    Check,
    iconBg:  "bg-[color:var(--accent-50)]",
    iconCls: "text-[color:var(--accent-600)]",
    barCls:  "bg-[color:var(--accent-500)]",
  },
  error: {
    icon:    AlertCircle,
    iconBg:  "bg-[color:var(--error-50)]",
    iconCls: "text-[color:var(--error)]",
    barCls:  "bg-[color:var(--error)]",
  },
  warning: {
    icon:    AlertTriangle,
    iconBg:  "bg-[color:var(--warning-50)]",
    iconCls: "text-[color:var(--warning-700)]",
    barCls:  "bg-[color:var(--warning)]",
  },
  info: {
    icon:    Info,
    iconBg:  "bg-[color:var(--trust-50)]",
    iconCls: "text-[color:var(--trust)]",
    barCls:  "bg-[color:var(--trust)]",
  },
};

const DURATION = 4500;
let uid = 0;

/* ── single card ────────────────────────────────────────────────────────────── */

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const { icon: Icon, iconBg, iconCls, barCls } = VARIANTS[item.variant];
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleDismiss() {
    if (leaving) return;
    clearTimeout(timer.current);
    setLeaving(true);
  }

  useEffect(() => {
    timer.current = setTimeout(handleDismiss, DURATION);
    return () => clearTimeout(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="alert"
      aria-live="assertive"
      onAnimationEnd={() => { if (leaving) onDismiss(item.id); }}
      className={[
        "group relative flex items-start gap-3 w-[340px]",
        "bg-white rounded-2xl border border-[color:var(--line)]",
        "shadow-[0_2px_8px_rgba(26,26,24,0.07),0_12px_32px_rgba(26,26,24,0.06)]",
        "px-4 py-3.5 overflow-hidden",
        "transition-transform duration-200 hover:scale-[1.015]",
        leaving ? "toast-exit" : "toast-enter",
      ].join(" ")}
    >
      {/* Icon in tinted container */}
      <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={14} strokeWidth={2.5} className={iconCls} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[14px] font-semibold text-[color:var(--foreground)] leading-tight">
          {item.title}
        </p>
        {item.description && (
          <p className="mt-0.5 text-[12px] text-[color:var(--muted)] leading-snug">
            {item.description}
          </p>
        )}
      </div>

      {/* Dismiss — reveals on hover */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 -mr-1 -mt-0.5 h-6 w-6 flex items-center justify-center rounded-lg text-[color:var(--muted)] opacity-0 group-hover:opacity-100 hover:text-[color:var(--foreground)] hover:bg-[color:var(--line)] transition-all duration-150"
      >
        <X size={11} strokeWidth={2.5} />
      </button>

      {/* Lifetime progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[color:var(--line)]">
        <div
          className={`h-full ${barCls} opacity-50 origin-left`}
          style={{ animation: `toastBar ${DURATION}ms linear forwards` }}
        />
      </div>
    </div>
  );
}

/* ── provider ───────────────────────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((variant: Variant, title: string, description?: string) => {
    const id = String(++uid);
    setToasts(prev => [...prev.slice(-4), { id, variant, title, description }]);
  }, []);

  const api: ToastAPI = {
    success: (t, d) => add("success", t, d),
    error:   (t, d) => add("error",   t, d),
    warning: (t, d) => add("warning", t, d),
    info:    (t, d) => add("info",    t, d),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        aria-label="Notifications"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard item={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

type Toast = { id: number; tone: ToastTone; title: string; description?: string };

type ToastApi = {
  show: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 6000;

const toneClasses: Record<ToastTone, string> = {
  success: "border-l-success",
  error: "border-l-danger",
  info: "border-l-gold",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { ...toast, id }]);
      // Errors stay until dismissed so they are not missed.
      if (toast.tone !== "error") setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, description) => show({ tone: "success", title, description }),
      error: (title, description) => show({ tone: "error", title, description }),
      info: (title, description) => show({ tone: "info", title, description }),
    }),
    [show],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-xl border border-line border-l-4 bg-paper p-4 shadow-card-hover",
              toneClasses[toast.tone],
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-0.5 text-sm text-muted">{toast.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="-m-1 rounded-md p-1 text-muted hover:text-ink"
              aria-label="Dismiss notification"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const api = use(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

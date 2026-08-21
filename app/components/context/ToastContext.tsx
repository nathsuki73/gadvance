"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

export type ToastType = "info" | "success" | "warning" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: number) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = Date.now();

      setToasts((prev) => [...prev, { id, message, type }]);

      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast Container: Uses max-w-md and allows individual toast resizing */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-[90vw] sm:max-w-md px-4 pointer-events-none">
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const borderClass = isError
            ? "border-rose-200 hover:border-rose-300"
            : toast.type === "warning"
              ? "border-amber-200 hover:border-amber-300"
              : "border-violet-100 hover:border-violet-200";

          return (
            <div
              key={toast.id}
              onClick={() => dismissToast(toast.id)}
              className={`pointer-events-auto cursor-pointer flex items-start sm:items-center justify-between gap-3 rounded-lg border bg-white/95 px-4 py-3 shadow-lg shadow-zinc-900/5 backdrop-blur-md transition-all duration-200 animate-slide-up w-auto ${borderClass}`}
              role="alert"
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <span className="mt-0.5 sm:mt-0">
                  <ToastIcon type={toast.type} />
                </span>
                {/* Responsive text: wraps cleanly instead of truncating */}
                <p className="text-xs sm:text-sm font-medium text-zinc-800 break-words leading-relaxed">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(toast.id);
                }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-0.5 rounded focus:outline-none shrink-0 mt-0.5 sm:mt-0"
                aria-label="Close notification"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case "success":
      return (
        <svg
          className="w-4 h-4 text-[#8b5cf6] shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M3.5 8.5l3 3 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          className="w-4 h-4 text-amber-500 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8 3v5m0 3h.01" strokeLinecap="round" />
          <path
            d="M1.5 13.5l6.5-11 6.5 11z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          className="w-4 h-4 text-rose-500 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" strokeLinecap="round" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg
          className="w-4 h-4 text-[#8b5cf6] shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M8 7.5v4.5m0-3h.01" strokeLinecap="round" />
        </svg>
      );
  }
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
